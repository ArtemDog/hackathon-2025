// ProfilePage.tsx
import { type FC, useState, type FormEvent } from "react";
import { motion } from "framer-motion";
import Header from "../components/Header";
import { StarBackground } from "../components/StarBackground";

const ProfilePage: FC = () => {
  const [name, setName] = useState("Иван"); // можно подставить текущее имя пользователя
  const [password, setPassword] = useState("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    console.log({ name, password });
    // Здесь можно сделать вызов API для обновления профиля
  };

  return (
    <div className="min-h-screen flex flex-col text-white relative overflow-hidden bg-black">
      <StarBackground />
      <Header />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="flex-1 flex flex-col items-start justify-center max-w-sm mx-auto px-4 py-8 space-y-8 relative z-10 w-full"
      >
        <motion.h1
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-3xl font-bold mb-4 text-left"
        >
          Профиль
        </motion.h1>

        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-black/20 backdrop-blur-md border border-gray-700 rounded-xl p-6 w-full flex flex-col gap-4"
        >
          <div className="flex flex-col">
            <label className="mb-1 font-semibold text-white">Имя</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="px-3 py-2 rounded-lg border border-gray-600 bg-black/50 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white transition"
              placeholder="Введите ваше имя"
            />
          </div>

          <div className="flex flex-col">
            <label className="mb-1 font-semibold text-white">Пароль</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Введите новый пароль"
              className="px-3 py-2 rounded-lg border border-gray-600 bg-black/50 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white transition"
            />
          </div>

          <button
            type="submit"
            className="w-full px-5 py-2 bg-white text-black rounded-lg font-semibold hover:bg-gray-200 transition"
          >
            Сохранить изменения
          </button>
        </motion.form>
      </motion.div>
    </div>
  );
};

export default ProfilePage;
