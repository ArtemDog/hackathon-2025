import { type FC } from "react";
import { motion } from "framer-motion";
import { StarBackground } from "../components/StarBackground";
import Header from "../components/Header";
import Footer from "../components/Footer"

const AboutPage: FC = () => {
  return (
    <div className="relative min-h-screen flex flex-col bg-black text-white overflow-hidden">
      {/* Звёздный фон */}
      <StarBackground />

      {/* Контент поверх */}
      <div className="relative z-10 flex flex-col min-h-screen">
        <Header />

        <main className="flex-1 flex flex-col justify-center items-center text-center px-6 py-12">
          <motion.h1
            className="text-5xl font-extrabold mb-8"
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            О проекте
          </motion.h1>

          <motion.div
            className="max-w-3xl bg-white/5 backdrop-blur-md border border-gray-700 rounded-2xl p-8 shadow-2xl"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            <p className="text-lg text-gray-300 mb-6 leading-relaxed">
              Этот проект был создан в рамках <span className="text-blue-400 font-semibold">Хакатона 2025</span> —
              события, объединяющего талантливых разработчиков и исследователей космоса.
              Цель проекта — дать пользователям возможность наблюдать за кометами и
              вычислять их орбиту, чтобы предсказать сближения с Землёй.
            </p>

            <div className="mt-6 border-t border-gray-700 pt-6">
              <h2 className="text-2xl font-semibold mb-4 text-blue-400">Авторы проекта</h2>
              <div className="flex flex-col md:flex-row justify-center items-center gap-6">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="bg-white/10 border border-gray-700 rounded-xl p-4 w-64 shadow-md"
                >
                  <h3 className="text-xl font-bold">Кузнецов Артём</h3>
                  <p className="text-gray-400 text-sm mt-2">Frontend-разработчик, дизайн и UI</p>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="bg-white/10 border border-gray-700 rounded-xl p-4 w-64 shadow-md"
                >
                  <h3 className="text-xl font-bold">Алексей Князев</h3>
                  <p className="text-gray-400 text-sm mt-2">Backend-разработчик, вычислительная логика</p>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </main>
        <Footer />
      </div>
    </div>
  );
};

export default AboutPage;
