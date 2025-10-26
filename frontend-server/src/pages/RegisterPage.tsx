import { type FC, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import axios from "axios";
import Header from "../components/Header";
import { StarBackground } from "../components/StarBackground";

const RegisterPage: FC = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      const response = await axios.post(
        "/api/users/registration",
        { name, login: email, password },
        { validateStatus: () => true } // чтобы не кидало исключение при 4xx
      );

      if (response.status === 200) {
        // JWT токен приходит в заголовке Authorization
        const token = response.headers["authorization"];
        if (token) {
          localStorage.setItem("token", token);
          console.log("JWT получен:", token);
          navigate("/profile"); // или "/observations"
        } else {
          setError("Токен не получен. Проверьте сервер.");
        }
      } else if (response.status === 409) {
        setError("Пользователь с таким логином уже существует");
      } else {
        setError(response.data?.error || "Ошибка регистрации");
      }
    } catch (err) {
      console.error(err);
      setError("Ошибка соединения с сервером");
    }
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
          Регистрация
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
            <label className="mb-1 font-semibold text-white">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="px-3 py-2 rounded-lg border border-gray-600 bg-black/50 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white transition"
              placeholder="Введите ваш email"
            />
          </div>

          <div className="flex flex-col">
            <label className="mb-1 font-semibold text-white">Пароль</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="px-3 py-2 rounded-lg border border-gray-600 bg-black/50 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white transition"
              placeholder="Введите пароль"
            />
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            type="submit"
            className="w-full px-5 py-2 bg-white text-black rounded-lg font-semibold hover:bg-gray-200 transition"
          >
            Зарегистрироваться
          </button>
        </motion.form>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-white text-center w-full"
        >
          Уже есть аккаунт?{" "}
          <a href="/login" className="underline hover:text-gray-300 transition">
            Войти
          </a>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default RegisterPage;
