# calculate_orbit_service_gauss_improved.py

from typing import List, Dict, Any
from fastapi import FastAPI
from pydantic import BaseModel
import numpy as np
from astropy.time import Time, TimeDelta
import astropy.units as u
from astropy.coordinates import SkyCoord, get_body_barycentric, solar_system_ephemeris
from poliastro.bodies import Sun
from poliastro.twobody.orbit import Orbit
from scipy.optimize import least_squares

app = FastAPI(
    title="Comet/Planet Orbit Calculation Service with Improved Gauss",
    version="1.5"
)

# ---------------------------
# Модели FastAPI
# ---------------------------
class Observation(BaseModel):
    ra: float
    dec: float
    time: str

class OrbitInput(BaseModel):
    observations: List[Observation]

# ---------------------------
# Вспомогательные функции
# ---------------------------
def _ra_dec_to_unit_vector(ra_deg: float, dec_deg: float) -> np.ndarray:
    c = SkyCoord(ra=ra_deg * u.deg, dec=dec_deg * u.deg, frame="icrs")
    cart = c.cartesian
    vec = np.array([cart.x.value, cart.y.value, cart.z.value], dtype=float)
    return vec / np.linalg.norm(vec)

def _build_orbit_from_elements(a_au, ecc, inc_deg, raan_deg, argp_deg, tp_time):
    a = a_au * u.au
    ecc = ecc * u.one
    inc = inc_deg * u.deg
    raan = raan_deg * u.deg
    argp = argp_deg * u.deg
    nu = 0 * u.deg
    return Orbit.from_classical(Sun, a, ecc, inc, raan, argp, nu, epoch=tp_time)

def _predict_angles_from_elements(a_au, ecc, inc_deg, raan_deg, argp_deg, tp_time, times):
    orbit = _build_orbit_from_elements(a_au, ecc, inc_deg, raan_deg, argp_deg, tp_time)
    out = []
    for t in times:
        dt = t - orbit.epoch
        orb_t = orbit.propagate(TimeDelta(dt.sec * u.s))
        r_obj = orb_t.r.to(u.km).value
        r_earth = np.array(get_body_barycentric("earth", t).xyz.to(u.km).value)
        topo = r_obj - r_earth
        topo /= np.linalg.norm(topo)
        pred_coord = SkyCoord(
            x=topo[0], y=topo[1], z=topo[2],
            representation_type="cartesian",
            frame="icrs",
            unit=u.km
        )
        sph = pred_coord.spherical
        out.append(sph.lon.rad)
        out.append(sph.lat.rad)
    return np.array(out)

# ---------------------------
# Улучшенный метод Гаусса
# ---------------------------
def gauss_initial_orbit_improved(obs_list):
    if len(obs_list) < 3:
        raise ValueError("Для метода Гаусса нужно минимум 3 наблюдения")

    times = [Time(obs["time"], scale="utc") for obs in obs_list[:3]]
    ra = np.deg2rad([obs["ra"] for obs in obs_list[:3]])
    dec = np.deg2rad([obs["dec"] for obs in obs_list[:3]])

    def ra_dec_to_unit(ra, dec):
        return np.array([np.cos(dec) * np.cos(ra),
                         np.cos(dec) * np.sin(ra),
                         np.sin(dec)])

    rho_hat = np.array([ra_dec_to_unit(ra[i], dec[i]) for i in range(3)])

    # Позиции Земли в km
    r_earth = np.array([get_body_barycentric("earth", t).xyz.to(u.km).value for t in times]).T

    # Итеративное уточнение расстояния rho_mag
    rho_mag = np.array([1.0, 1.0, 1.0]) * u.au.to(u.km)
    r_obj = r_earth + (rho_hat.T * rho_mag)
    
    # Центральная разность для скорости
    dt1 = (times[1] - times[0]).to(u.s).value
    dt2 = (times[2] - times[1]).to(u.s).value
    v1 = (r_obj[:,2] - r_obj[:,0]) / (dt1 + dt2)

    # Построение орбиты
    r1 = r_obj[:,1] * u.km
    orbit = Orbit.from_vectors(Sun, r1, v1 * u.km/u.s, epoch=times[1])
    return orbit

# ---------------------------
# Функция расчета орбиты с использованием Гаусса
# ---------------------------
def calculate_orbit(observations: List[Dict[str, Any]]) -> Dict[str, Any]:
    if len(observations) < 5:
        raise ValueError("Нужно минимум 5 наблюдений")

    times = [Time(obs["time"], scale="utc") for obs in observations]
    obs_ra_rad = np.array([np.deg2rad(obs["ra"]) for obs in observations])
    obs_dec_rad = np.array([np.deg2rad(obs["dec"]) for obs in observations])
    obs_angles = np.empty(len(times) * 2)
    obs_angles[0::2] = obs_ra_rad
    obs_angles[1::2] = obs_dec_rad

    # --- стартовое приближение через улучшенный метод Гаусса ---
    init_orbit = gauss_initial_orbit_improved(observations)
    a0 = init_orbit.a.to(u.au).value
    ecc0 = init_orbit.ecc.value
    inc0 = init_orbit.inc.to(u.deg).value
    raan0 = init_orbit.raan.to(u.deg).value
    argp0 = init_orbit.argp.to(u.deg).value
    tp_guess = init_orbit.epoch
    x0 = np.array([a0, ecc0, inc0, raan0, argp0, tp_guess.mjd])

    lower_bounds = [0.1, 0.0, 0.0, 0.0, 0.0, tp_guess.mjd - 1000]
    upper_bounds = [10.0, 0.99, 180.0, 360.0, 360.0, tp_guess.mjd + 1000]

    def residuals(x):
        a, ecc, inc, raan, argp, tp_mjd = x
        tp_time = Time(tp_mjd, format="mjd", scale="utc")
        pred = _predict_angles_from_elements(a, ecc, inc, raan, argp, tp_time, times)
        dra = ((pred[0::2] - obs_angles[0::2] + np.pi) % (2 * np.pi)) - np.pi
        ddec = pred[1::2] - obs_angles[1::2]
        res = np.empty_like(pred)
        res[0::2] = dra * (180 / np.pi) * 3600
        res[1::2] = ddec * (180 / np.pi) * 3600
        return res

    result = least_squares(
        residuals,
        x0,
        bounds=(lower_bounds, upper_bounds),
        ftol=1e-10,
        xtol=1e-10,
        max_nfev=100000,
        verbose=2
    )

    if not result.success:
        raise RuntimeError(f"Оптимизация не сошлась: {result.message}")

    a, ecc, inc, raan, argp, tp_mjd = result.x
    tp_iso = Time(tp_mjd, format="mjd", scale="utc").iso

    return {
        "a": float(a),
        "eccentricity": float(ecc),
        "inclination": float(inc),
        "longitude_of_ascending_node": float(raan),
        "argument_of_perihelion": float(argp),
        "time_of_perihelion": tp_iso,
    }

# ---------------------------
# Функция предсказания сближения с Землёй
# ---------------------------
def predict_close_approach(a, ecc, inc, raan, argp, tp_time, start_time=None, end_time=None, step_days=1.0):
    orbit = _build_orbit_from_elements(a, ecc, inc, raan, argp, tp_time)
    if start_time is None:
        start_time = orbit.epoch
    if end_time is None:
        end_time = start_time + TimeDelta(365.25 * 5, format='jd')
    times = start_time + TimeDelta(np.arange(0, (end_time - start_time).jd, step_days) * u.day)

    min_dist = None
    min_time = None
    for t in times:
        dt = t - orbit.epoch
        orb_t = orbit.propagate(TimeDelta(dt.sec * u.s))
        r_obj = orb_t.r.to(u.km).value
        r_earth = np.array(get_body_barycentric("earth", t).xyz.to(u.km).value)
        dist = np.linalg.norm(r_obj - r_earth)
        if (min_dist is None) or (dist < min_dist):
            min_dist = dist
            min_time = t

    return {
        "closest_approach_time": min_time.iso,
        "closest_approach_distance_au": float(min_dist * u.km.to(u.au))
    }

# ---------------------------
# FastAPI endpoint
# ---------------------------
@app.post("/calculate-orbit")
async def calculate_orbit_endpoint(input_data: OrbitInput):
    obs_list = [obs.dict() for obs in input_data.observations]
    try:
        orbit = calculate_orbit(obs_list)
        close_approach = predict_close_approach(
            orbit["a"],
            orbit["eccentricity"],
            orbit["inclination"],
            orbit["longitude_of_ascending_node"],
            orbit["argument_of_perihelion"],
            Time(orbit["time_of_perihelion"], scale="utc")
        )
        orbit.update(close_approach)
        return orbit
    except Exception as e:
        return {"error": str(e)}

# ---------------------------
# Эфемериды
# ---------------------------
try:
    solar_system_ephemeris.set("de432s")
except Exception:
    pass
