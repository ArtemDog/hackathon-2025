import { type FC } from "react";
import { motion } from "framer-motion";
import Header from "../components/Header";

type ResultData = {
  cometName: string;
  minDistance: string;
  approachDate: string;
  velocity?: string;
  magnitude?: string;
  photoUrl?: string;
};

const ResultPage: FC = () => {
  const result: ResultData = {
    cometName: "Комета Хейла Боба",
    minDistance: "0.032 а.е. (≈ 4.8 млн км)",
    approachDate: "14 июня 2025, 04:12 UTC",
    velocity: "32.5 км/с",
    magnitude: "5.2 (ожидаемая яркость)",
    photoUrl: "/comet-sample.jpg",
  };

  return (
    <div className="min-h-screen flex flex-col text-white relative overflow-hidden">
      {/* Фоновый градиент и звёзды */}
      <div className="absolute inset-0 bg-gradient-to-b from-gray-950 via-black to-gray-900"></div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(255,255,255,0.05)_0%,_transparent_70%)]"></div>
      <div className="absolute inset-0 bg-[url('/stars-texture.png')] opacity-10 mix-blend-screen"></div>

      <Header hideStartButton={true} />

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        className="flex-1 flex flex-col items-center justify-center px-6 py-16 space-y-10 relative z-10"
      >
        {/* Фото кометы */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="w-72 aspect-square rounded-xl overflow-hidden border border-gray-700 shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:shadow-[0_0_30px_rgba(255,255,255,0.3)] transition"
        >
          <img
            src={result.photoUrl}
            alt={result.cometName}
            className="w-full h-full object-cover"
          />
        </motion.div>

        {/* Информация о комете */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="text-center space-y-4"
        >
          <h1 className="text-4xl font-bold tracking-wide text-white">
            {result.cometName}
          </h1>

          <div className="space-y-2 text-gray-300">
            <p>
              <span className="font-semibold text-white">Минимальное расстояние:</span>{" "}
              {result.minDistance}
            </p>
            <p>
              <span className="font-semibold text-white">Дата сближения:</span>{" "}
              {result.approachDate}
            </p>

            {result.velocity && (
              <p>
                <span className="font-semibold text-white">Скорость:</span>{" "}
                {result.velocity}
              </p>
            )}

            {result.magnitude && (
              <p>
                <span className="font-semibold text-white">Яркость (m):</span>{" "}
                {result.magnitude}
              </p>
            )}
          </div>
        </motion.div>

        {/* Кнопки */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.9 }}
          className="flex space-x-6 mt-8"
        >
          <button
            onClick={() => (window.location.href = "/")}
            className="px-6 py-3 bg-gray-800 text-white rounded-lg font-semibold hover:bg-gray-700 transition"
          >
            Новое вычисление
          </button>

          <button
            className="px-6 py-3 bg-white text-black rounded-lg font-semibold hover:bg-gray-200 transition"
          >
            Скачать отчёт
          </button>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default ResultPage;
