// ResultPage.tsx
import { type FC } from "react";
import { motion } from "framer-motion";
import Header from "../components/Header";
import { StarBackground } from "../components/StarBackground";

type OrbitParams = {
  semiMajorAxis: string;
  eccentricity: string;
  inclination: string;
  ascendingNode: string;
  argumentPeri: string;
  perihelionTime: string;
};

type ResultData = {
  cometName: string;
  minDistance: string;
  approachDate: string;
  photoUrl?: string;
  orbit: OrbitParams;
};

const ResultPage: FC = () => {
  const result: ResultData = {
    cometName: "Комета Хейла Боба",
    minDistance: "0.032 а.е. (≈ 4.8 млн км)",
    approachDate: "14 июня 2025, 04:12 UTC",
    photoUrl: "/comet-sample.jpg",
    orbit: {
      semiMajorAxis: "3.12 а.е.",
      eccentricity: "0.67",
      inclination: "45.2°",
      ascendingNode: "102.5°",
      argumentPeri: "87.3°",
      perihelionTime: "12 мая 2025, 23:45 UTC",
    },
  };

  return (
    <div className="min-h-screen flex flex-col text-white relative overflow-hidden bg-black">
      {/* Фон */}
      <StarBackground />

      {/* Хедер */}
      <Header />

      {/* Основной контейнер с шириной как у хедера */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        className="flex-1 flex flex-col items-start justify-start max-w-4xl mx-auto px-4 py-12 space-y-12 relative z-10 w-full"
      >
        {/* Название кометы */}
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-4xl font-bold mb-6 text-left"
        >
          {result.cometName}
        </motion.h1>

        {/* Основной блок с информацией и фото */}
        <div className="flex flex-col lg:flex-row w-full gap-8 items-start">
          {/* Блок с данными */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="bg-black/20 backdrop-blur-md border border-gray-700 rounded-xl p-6 space-y-4 flex-grow min-w-0 w-full"
          >
            <h2 className="text-2xl font-semibold mb-2">Данные о сближении</h2>
            <p>
              <span className="font-semibold text-white">Минимальное расстояние:</span>{" "}
              {result.minDistance}
            </p>
            <p>
              <span className="font-semibold text-white">Дата сближения:</span>{" "}
              {result.approachDate}
            </p>

            <h2 className="text-2xl font-semibold mt-4 mb-2">Параметры орбиты</h2>
            <div className="grid grid-cols-1 gap-2 text-gray-300">
              <p>
                <span className="font-semibold text-white">Большая полуось:</span>{" "}
                {result.orbit.semiMajorAxis}
              </p>
              <p>
                <span className="font-semibold text-white">Эксцентриситет:</span>{" "}
                {result.orbit.eccentricity}
              </p>
              <p>
                <span className="font-semibold text-white">Наклонение:</span>{" "}
                {result.orbit.inclination}
              </p>
              <p>
                <span className="font-semibold text-white">Долгота восходящего узла:</span>{" "}
                {result.orbit.ascendingNode}
              </p>
              <p>
                <span className="font-semibold text-white">Аргумент перицентра:</span>{" "}
                {result.orbit.argumentPeri}
              </p>
              <p>
                <span className="font-semibold text-white">Время прохождения перигелия:</span>{" "}
                {result.orbit.perihelionTime}
              </p>
            </div>
          </motion.div>

          {/* Фото и кнопки */}
          {result.photoUrl && (
            <motion.div
              initial={{ opacity: 0, x: 20, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              transition={{ duration: 0.8 }}
              className="flex flex-col items-center lg:items-end w-full lg:w-1/2 gap-4"
            >
              <div className="w-full aspect-square rounded-xl overflow-hidden border border-gray-700 transition">
                <img
                  src={result.photoUrl}
                  alt={result.cometName}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Кнопки под фото */}
              <div className="flex flex-col w-full gap-3">
                <button
                  onClick={() => (window.location.href = "/")}
                  className="w-full px-6 py-3 bg-gray-800 text-white rounded-lg font-semibold hover:bg-gray-700 transition"
                >
                  Новое вычисление
                </button>
                <button
                  className="w-full px-6 py-3 bg-white text-black rounded-lg font-semibold hover:bg-gray-200 transition"
                >
                  Скачать отчёт
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default ResultPage;
