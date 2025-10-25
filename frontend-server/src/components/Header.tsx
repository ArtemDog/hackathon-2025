import { type FC } from "react";
import { Link } from "react-router-dom";

type HeaderProps = {
  hideStartButton?: boolean;
};

const Header: FC<HeaderProps> = ({ hideStartButton = false }) => {
  return (
    <header className="relative z-10 bg-black py-5 md:py-6 shadow-[0_0_100px_20px_#ffffff]">
      <div className="max-w-4xl mx-auto px-4 flex justify-between items-center">
        <h1 className="text-xl md:text-2xl font-bold">СУДНЫЙ ДЕНЬ</h1>
        <nav className="space-x-4 md:space-x-6 text-white font-semibold text-base md:text-lg">
          {!hideStartButton && (
            <Link to="/observations" className="hover:underline">
              Начать
            </Link>
          )}
          <Link to="/about" className="hover:underline">
            О нас
          </Link>
        </nav>
      </div>
    </header>
  );
};

export default Header;
