import { type FC, useState, type FormEvent, useEffect } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import Header from "../components/Header";
import { StarBackground } from "../components/StarBackground";

const ProfilePage: FC = () => {
  const [name, setName] = useState("");
  const [login, setLogin] = useState("");
  const [newName, setNewName] = useState(""); // новое имя
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Загружаем данные профиля при монтировании
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    axios
      .get("/api/users/profile", {
        headers: { Authorization: `${token}` },
        validateStatus: () => true,
      })
      .then((res) => {
        if (res.status === 200) {
          setName(res.data.name);
          setLogin(res.data.login);
        } else {
          setError(res.data.error || "Ошибка загрузки профиля");
        }
      })
      .catch(() => setError("Ошибка соединения с сервером"));
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const token = localStorage.getItem("token");
    if (!token) {
      setError("Вы не авторизованы");
      return;
    }

    try {
      const response = await axios.put(
        "/api/users/profile/updating",
        { name: newName, password },
        {
          headers: { Authorization: `${token}` },
          validateStatus: () => true,
        }
      );

      if (response.status === 200) {
        setSuccess("Профиль успешно обновлён");
        setPassword("");
        setNewName("");
      } else {
        setError(response.data.error || "Ошибка при обновлении профиля");
      }
    } catch {
      setError("Сервер недоступен");
    }
  };

  const handleLogout = async () => {
    const token = localStorage.getItem("token");
    try {
      if (token) {
        await axios.post(
          "/api/users/logout",
          {},
          {
            headers: { Authorization: `${token}` },
            validateStatus: () => true,
          }
        );
      }
    } catch (err) {
      console.error("Ошибка при logout:", err);
    } finally {
      localStorage.removeItem("token");
      window.location.href = "/";
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
        className="flex-1 flex flex-col items-center justify-center px-6 py-10 relative z-10 w-full"
      >
        <motion.h1
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-3xl font-bold mb-8 text-center"
        >
          Профиль пользователя
        </motion.h1>

        {/* Контейнер с двумя блоками */}
        <div className="flex flex-col md:flex-row gap-8 w-full max-w-3xl justify-center">
          {/* Левая карточка с информацией */}
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-black/30 border border-gray-700 rounded-xl p-6 w-full md:w-1/2 backdrop-blur-md text-left"
          >
            <h2 className="text-xl font-semibold mb-4">Информация о пользователе</h2>
            <div className="space-y-3">
              <div>
                <p className="text-gray-400 text-sm">Имя:</p>
                <p className="text-lg font-medium text-white">{name || "—"}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Логин:</p>
                <p className="text-lg font-medium text-white">{login || "—"}</p>
              </div>
            </div>
          </motion.div>

          {/* Правая карточка — обновление профиля */}
          <motion.form
            onSubmit={handleSubmit}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-black/30 border border-gray-700 rounded-xl p-6 w-full md:w-1/2 backdrop-blur-md flex flex-col gap-4"
          >
            <h2 className="text-xl font-semibold mb-2">Обновить профиль</h2>

            <div className="flex flex-col">
              <label className="mb-1 font-semibold text-white">Новое имя</label>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Введите новое имя"
                className="px-3 py-2 rounded-lg border border-gray-600 bg-black/50 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white transition"
              />
            </div>

            <div className="flex flex-col">
              <label className="mb-1 font-semibold text-white">Новый пароль</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Введите новый пароль"
                className="px-3 py-2 rounded-lg border border-gray-600 bg-black/50 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white transition"
              />
            </div>

            {error && <p className="text-red-500 text-sm">{error}</p>}
            {success && <p className="text-green-500 text-sm">{success}</p>}

            <button
              type="submit"
              className="w-full px-5 py-2 bg-white text-black rounded-lg font-semibold hover:bg-gray-200 transition"
            >
              Сохранить изменения
            </button>
          </motion.form>
        </div>

        {/* Кнопки "Назад" и "Выйти" */}
        <div className="w-full max-w-3xl flex justify-end gap-4 mt-10">
          <motion.button
            onClick={() => window.history.back()}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="px-6 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-white font-medium transition"
          >
            Назад
          </motion.button>

          <motion.button
            onClick={handleLogout}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="px-6 py-2 bg-red-600 hover:bg-red-500 rounded-lg text-white font-medium transition"
          >
            Выйти
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};

export default ProfilePage;
