import { type FC, useState, type ChangeEvent } from "react";
import axios from "axios";
import ObservationRow from "../components/ObservationRow";
import Header from "../components/Header";
import { StarBackground } from "../components/StarBackground";

type Observation = {
  ra: string;
  dec: string;
  time: string;
};

const ObservationsPage: FC = () => {
  const [observations, setObservations] = useState<Observation[]>(
    Array.from({ length: 5 }, () => ({ ra: "", dec: "", time: "" }))
  );
  const [photo, setPhoto] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleChange = (index: number, field: keyof Observation, value: string) => {
    setObservations((prev) => {
      const newObservations = [...prev];
      newObservations[index] = { ...newObservations[index], [field]: value };
      return newObservations;
    });
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
    setObservations((prev) => [...prev, { ra: "", dec: "", time: "" }]);
  };

  const predictResult = async () => {
    try {
      const formData = new FormData();
      formData.append("observations", JSON.stringify(observations));
      if (photo) formData.append("photo", photo);

      // Относительный путь — прокси перенаправит на бек
      const response = await axios.post("/api/observations", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      console.log("Ответ сервера:", response.data);
    } catch (error) {
      console.error("Ошибка при отправке:", error);
    }
  };


  return (
    <div className="relative min-h-screen flex flex-col text-white overflow-hidden bg-black">
      <StarBackground />

      <div className="relative z-10 flex-1 flex flex-col">
        <Header hideStartButton={true} />

        <div className="flex-1 flex flex-col lg:flex-row justify-center items-start px-8 py-12 gap-12">
          {/* Левая часть — наблюдения */}
          <div className="w-full lg:w-2/3 flex flex-col items-stretch space-y-6">
            <h1 className="text-3xl font-bold text-center">Введите наблюдения кометы</h1>

            <div className="space-y-4">
              {observations.map((obs, index) => (
                <ObservationRow
                  key={index}
                  observation={obs}
                  onChange={(field, value) => handleChange(index, field, value)}
                />
              ))}
            </div>

            <div className="flex flex-wrap justify-center gap-4 mt-4">
              <button
                onClick={addObservation}
                className="px-6 py-3 bg-gray-800 text-gray-100 rounded-lg font-bold hover:bg-gray-700 transition"
              >
                Добавить наблюдение
              </button>

              <button
                onClick={predictResult}
                className="px-6 py-3 bg-white text-black rounded-lg font-bold hover:bg-gray-200 transition"
              >
                Предсказать результат
              </button>
            </div>
          </div>

          {/* Правая часть — загрузка фото */}
          <div className="w-full lg:w-1/3 flex flex-col items-center">
            <h2 className="text-2xl font-semibold mb-4 text-center">Фото кометы</h2>

            <div className="w-full max-w-sm">
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
                    <span className="text-5xl mb-2">📷</span>
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
                  <p className="text-gray-400 text-sm mb-2 truncate text-center">
                    Загружено: {photo.name}
                  </p>
                  <button
                    onClick={handleRemovePhoto}
                    className="px-4 py-2 bg-gray-800 text-white rounded-lg font-semibold hover:bg-gray-700 transition"
                  >
                    Удалить фото
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ObservationsPage;
