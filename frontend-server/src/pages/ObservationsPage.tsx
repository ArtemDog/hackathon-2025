// ObservationsPage.tsx
import { type FC, useState, type ChangeEvent } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import ObservationRow from "../components/ObservationRow";
import Header from "../components/Header";
import { StarBackground } from "../components/StarBackground";

type Observation = {
  id: string;
  ra: string;
  dec: string;
  time: string;
};

const MIN_OBSERVATIONS = 5;

const ObservationsPage: FC = () => {
  const [cometName, setCometName] = useState<string>("");
  const [observations, setObservations] = useState<Observation[]>(
    Array.from({ length: MIN_OBSERVATIONS }, () => ({
      id: crypto.randomUUID(),
      ra: "",
      dec: "",
      time: "",
    }))
  );
  const [photo, setPhoto] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (id: string, field: keyof Observation, value: string) => {
    setObservations((prev) =>
      prev.map((obs) => (obs.id === id ? { ...obs, [field]: value } : obs))
    );
  };

  const handlePhotoChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setPhoto(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleRemovePhoto = () => {
    setPhoto(null);
    setPreviewUrl(null);
  };

  const addObservation = () => {
    setObservations((prev) => [
      ...prev,
      { id: crypto.randomUUID(), ra: "", dec: "", time: "" },
    ]);
  };

  const removeObservation = (id: string) => {
    if (observations.length > MIN_OBSERVATIONS) {
      setObservations((prev) => prev.filter((obs) => obs.id !== id));
    }
  };

  const predictResult = async () => {
    if (!cometName || !photo) return;
    setLoading(true);

    try {
      const data = {
        cometName,
        observations: observations.map(({ ra, dec, time }) => ({ ra, dec, time })),
        photo: null as string | null,
      };

      // Конвертируем фото в Base64
      if (photo) {
        data.photo = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = (err) => reject(err);
          reader.readAsDataURL(photo);
        });
      }

      const response = await axios.post("/api/observations", data, {
        headers: { "Content-Type": "application/json" },
      });

      console.log("Ответ сервера:", response.data);
      alert("Данные успешно отправлены!");
    } catch (error) {
      console.error("Ошибка при отправке:", error);
      alert("Ошибка при отправке данных");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col text-white overflow-y-auto bg-black">
      <StarBackground />

      <div className="relative z-10 flex-1 flex flex-col">
        <Header />

        <div className="max-w-4xl mx-auto px-4 flex-1 flex flex-col lg:flex-row justify-center items-start py-12 gap-12">
          {/* Левая часть — наблюдения */}
          <div className="w-full lg:w-2/3 flex flex-col items-stretch space-y-6">
            <h1 className="text-3xl font-bold text-left">Введите наблюдения кометы</h1>

            <input
              type="text"
              value={cometName}
              onChange={(e) => setCometName(e.target.value)}
              placeholder="Название кометы"
              className="w-full p-3 rounded-lg bg-black/20 border border-gray-700 placeholder-gray-400 text-white focus:outline-none focus:border-white transition"
            />

            <div className="flex flex-col w-full bg-black/10 backdrop-blur-md border border-gray-700 rounded-lg p-4 divide-y divide-gray-700 hover:bg-black/50 transition-colors">
              <AnimatePresence>
                {observations.map((obs, index) => (
                  <motion.div
                    key={obs.id}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    layout
                  >
                    <ObservationRow
                      index={index}
                      observation={obs}
                      onChange={(field, value) => handleChange(obs.id, field, value)}
                      onRemove={() => removeObservation(obs.id)}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>

              <button
                onClick={addObservation}
                className="w-full mt-2 flex items-center justify-center border border-gray-700 rounded-lg p-2 text-gray-300 hover:border-white hover:text-white transition"
              >
                <i className="bi bi-plus-lg text-xl" />
              </button>
            </div>
          </div>

          {/* Правая часть — загрузка фото */}
          <div className="w-full lg:w-1/3 flex flex-col items-center">
            <h2 className="text-3xl font-bold text-center mb-6">Фото кометы</h2>
            <div className="w-full max-w-sm flex flex-col items-center">
              <label
                htmlFor="photo-upload"
                className={`w-full aspect-square border-2 border-dashed border-gray-600 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-white transition overflow-hidden ${
                  previewUrl ? "bg-black" : ""
                }`}
              >
                {previewUrl ? (
                  <img
                    src={previewUrl}
                    alt="Комета"
                    className="w-full h-full object-cover rounded-xl opacity-90 hover:opacity-100 transition"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-gray-400">
                    <span className="text-5xl mb-2">
                      <i className="bi bi-image"></i>
                    </span>
                    <p className="text-center px-2">Нажмите, чтобы выбрать фото</p>
                  </div>
                )}
                <input
                  id="photo-upload"
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="hidden"
                />
              </label>

              {photo && (
                <div className="mt-4 flex flex-col items-center w-full">
                  <button
                    onClick={handleRemovePhoto}
                    className="w-full bg-blue-400 text-white font-bold rounded-lg py-4 hover:bg-blue-600 transition"
                  >
                    Удалить фото
                  </button>
                </div>
              )}

              <button
                onClick={predictResult}
                disabled={!cometName || !photo || loading}
                className={`w-full mt-4 rounded-lg font-bold py-4 transition ${
                  !cometName || !photo || loading
                    ? "bg-gray-700 text-gray-400 cursor-not-allowed"
                    : "bg-white text-black hover:bg-gray-200"
                }`}
              >
                {loading ? "Отправка..." : "Предсказать результат"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ObservationsPage;
