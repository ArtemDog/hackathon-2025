# calculate_orbit_service.py

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
    title="Comet Orbit Calculation Service",
    description="API для расчёта орбитальных элементов кометы по наблюдениям (RA, Dec, Time).",
    version="1.2"
)

# --------------------------------------------------------------------------
# Модели FastAPI
# --------------------------------------------------------------------------

class Observation(BaseModel):
    ra: float
    dec: float
    time: str

class OrbitInput(BaseModel):
    observations: List[Observation]

# --------------------------------------------------------------------------
# Вспомогательные функции
# --------------------------------------------------------------------------

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
        r_comet = orb_t.r.to(u.km).value
        earth = get_body_barycentric("earth", t)
        r_earth = np.array(earth.xyz.to(u.km).value)
        topo = r_comet - r_earth
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

# --------------------------------------------------------------------------
# Главная функция вычисления орбиты
# --------------------------------------------------------------------------

def calculate_orbit(observations: List[Dict[str, Any]]) -> Dict[str, Any]:
    if len(observations) < 5:
        raise ValueError("Нужно минимум 5 наблюдений")

    times = [Time(obs["time"], scale="utc") for obs in observations]
    obs_ra_rad = np.array([np.deg2rad(obs["ra"]) for obs in observations])
    obs_dec_rad = np.array([np.deg2rad(obs["dec"]) for obs in observations])
    obs_angles = np.empty(len(times) * 2)
    obs_angles[0::2] = obs_ra_rad
    obs_angles[1::2] = obs_dec_rad

    # Начальные приближения ближе к синтетическим данным
    a0, ecc0, inc0, raan0, argp0 = 2.5, 0.3, 7.0, 120.0, 45.0
    tp_guess = Time("2025-01-01T00:00:00", scale="utc")
    x0 = np.array([a0, ecc0, inc0, raan0, argp0, tp_guess.mjd])

    # Границы параметров
    tp_min = min(times).mjd - 365
    tp_max = max(times).mjd + 365
    lower_bounds = [0.1, 0.0, 0.0, 0.0, 0.0, tp_min]
    upper_bounds = [50.0, 0.99, 180.0, 360.0, 360.0, tp_max]

    def residuals(x):
        a, ecc, inc, raan, argp, tp_mjd = x
        tp_time = Time(tp_mjd, format="mjd", scale="utc")
        try:
            pred = _predict_angles_from_elements(a, ecc, inc, raan, argp, tp_time, times)
        except Exception as e:
            raise RuntimeError(f"Ошибка при предсказании углов: {e}")

        dra = ((pred[0::2] - obs_angles[0::2] + np.pi) % (2 * np.pi)) - np.pi
        ddec = pred[1::2] - obs_angles[1::2]
        res = np.empty_like(pred)
        res[0::2] = dra * (180 / np.pi) * 3600  # угловые секунды
        res[1::2] = ddec * (180 / np.pi) * 3600
        return res

    result = least_squares(
        residuals,
        x0,
        bounds=(lower_bounds, upper_bounds),
        ftol=1e-10,
        xtol=1e-10,
        max_nfev=1000,
        verbose=0
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

# --------------------------------------------------------------------------
# FastAPI endpoint
# --------------------------------------------------------------------------

@app.post("/calculate-orbit")
async def calculate_orbit_endpoint(input_data: OrbitInput):
    obs_list = [obs.dict() for obs in input_data.observations]
    try:
        orbit = calculate_orbit(obs_list)
        return orbit
    except Exception as e:
        return {"error": str(e)}

# --------------------------------------------------------------------------
# Эфемериды
# --------------------------------------------------------------------------

try:
    solar_system_ephemeris.set("de432s")
except Exception:
    pass
