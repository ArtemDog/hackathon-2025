import { type FC } from "react";
import { Link, useLocation } from "react-router-dom";

const Header: FC = () => {
  const location = useLocation();

  const hideStartButton = location.pathname !== "/";
  const hideAboutButton = location.pathname === "/about";
  const hideProfileButton = location.pathname === "/" || location.pathname === "/about" || location.pathname === "/register" || location.pathname === "/login";

  return (
    <header className="relative z-10 bg-black py-5 md:py-6 shadow-[0_0_100px_20px_#ffffff]">
      <div className="max-w-4xl mx-auto px-4 flex justify-between items-center">
        {/* Заголовок с переходом на homepage */}
        <Link
          to="/"
          className="text-xl md:text-2xl font-extrabold text-white hover:text-gray-300 transition-colors"
        >
          СУДНЫЙ ДЕНЬ
        </Link>

        <div className="flex items-center space-x-4 md:space-x-6 text-white font-semibold text-base md:text-lg">
          <nav className="flex space-x-4 md:space-x-6">
            {!hideStartButton && (
              <Link to="/login" className="hover:underline">
                Начать
              </Link>
            )}
            {!hideAboutButton && (
              <Link to="/about" className="hover:underline">
                О нас
              </Link>
            )}
          </nav>

          {/* Иконка аккаунта */}
          {!hideProfileButton && (
            <Link
              to="/profile"
              className="text-white hover:text-gray-300 transition-colors text-xl"
              title="Аккаунт"
            >
              <i className="bi bi-person-fill"></i>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
