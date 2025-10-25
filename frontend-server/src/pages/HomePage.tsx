import { type FC } from "react";
import { Link } from "react-router-dom";

const HomePage: FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-black text-white">
      
      {/* Header */}
      <header className="bg-black py-5 md:py-6 shadow-[0_0_100px_20px_#ffffff]">
        <div className="max-w-4xl mx-auto px-4 flex justify-between items-center">
          <h1 className="text-xl md:text-2xl font-bold">
            СУДНЫЙ ДЕНЬ
          </h1>
          <nav className="space-x-4 md:space-x-6 text-white font-semibold text-base md:text-lg">
            <Link to="/observations" className="hover:underline">
              Начать
            </Link>
            <Link to="/about" className="hover:underline">
              О нас
            </Link>
          </nav>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 flex flex-col justify-center max-w-4xl mx-auto px-6 py-12">
        <h2 className="text-5xl font-extrabold mb-6">
          Следите за кометами и предсказывайте их сближения
        </h2>
        <p className="text-lg mb-8 text-gray-300">
          Введите наблюдения кометы: координаты, время и фото. Мы рассчитаем её орбиту и покажем ближайшее сближение с Землёй.
        </p>

        {/* Buttons */}
        <div className="flex space-x-4">
          <Link
            to="/observations"
            className="px-8 py-4 bg-white text-black font-bold rounded-lg hover:bg-gray-200 transition"
          >
            Начать
          </Link>
          <Link
            to="/register"
            className="px-8 py-4 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-500 transition"
          >
            Регистрация
          </Link>
        </div>
      </main>


      {/* Footer */}
      <footer className="bg-black text-gray-400 py-4 text-center">
        © 2025 СУДНЫЙ ДЕНЬ. Все права защищены.
      </footer>
    </div>
  );
};

export default HomePage;
