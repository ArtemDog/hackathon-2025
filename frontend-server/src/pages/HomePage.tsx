import { type FC, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import Header from "../components/Header";
import { StarBackground } from "../components/StarBackground";
import Footer from "../components/Footer"

// Создаём motion-версию Link для анимации кнопок
const MotionLink = motion(Link);

const HomePage: FC = () => {
  const navigate = useNavigate();
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) navigate("/observations"); // или на главную страницу приложения после авторизации
  }, [navigate]);

  return (
    <div className="relative min-h-screen flex flex-col bg-black text-white overflow-hidden">
      {/* Звёздный фон */}
      <StarBackground />

      {/* Контент поверх */}
      <div className="relative z-10 flex flex-col min-h-screen">
        <Header />

        {/* Main content */}
        <main className="flex-1 flex flex-col justify-center max-w-4xl mx-auto px-6 py-12 text-center">
          <motion.h2
            className="text-5xl font-extrabold mb-6"
            initial={{ opacity: 0, y: -40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            Следите за кометами и предсказывайте их сближения
          </motion.h2>

          <motion.p
            className="text-lg mb-8 text-gray-300"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Введите наблюдения кометы: координаты, время и фото. Мы рассчитаем её орбиту
            и покажем ближайшее сближение с Землёй.
          </motion.p>

          {/* Buttons */}
          <motion.div
            className="flex flex-wrap justify-center gap-4"
            initial="hidden"
            animate="visible"
            variants={{
              hidden: {},
              visible: { transition: { staggerChildren: 0.2 } },
            }}
          >
            <MotionLink
              to="/login"
              className="px-8 py-4 bg-white text-black font-bold rounded-lg hover:bg-gray-200 transition"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              Начать
            </MotionLink>

            <MotionLink
              to="/register"
              className="px-8 py-4 bg-blue-400 text-white font-bold rounded-lg hover:bg-blue-600 transition"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              Регистрация
            </MotionLink>
          </motion.div>
        </main>

        {/* Footer */}
        <Footer />
      </div>
    </div>
  );
};

export default HomePage;
