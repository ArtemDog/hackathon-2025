import { type FC, useState } from "react";


type Observation = {
  ra: string;
  dec: string;
  time: string;
};

type ObservationRowProps = {
  observation: Observation;
  index: number;
  onChange: (field: keyof Observation, value: string) => void;
  onRemove: () => void;
};

const ObservationRow: FC<ObservationRowProps> = ({
  observation,
  index,
  onChange,
  onRemove,
}) => {
  const [hovered, setHovered] = useState(false);

  return (
    <div className="flex flex-col md:flex-row items-start md:items-center w-full gap-4 py-2 transition-all duration-200">
      {/* Порядковый номер / кнопка удаления */}
      <div
        className={`flex items-center justify-center w-12 h-[52px] rounded-md border font-semibold text-lg select-none shadow-sm cursor-pointer transition-all
          ${
            hovered
              ? "border-red-500 text-red-500 hover:bg-red-500/10"
              : "border-gray-600 text-gray-300 bg-black"
          }
        `}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onClick={() => hovered && onRemove()}
        title={hovered ? "Удалить строку" : ""}
      >
        {hovered ? (
          <i className="bi bi-x-lg text-xl pointer-events-none" />
        ) : (
          index + 1
        )}
      </div>

      {/* Прямое восхождение */}
      <div className="flex-1 min-w-0 flex items-center bg-black rounded-md border border-gray-600 px-4 py-3 focus-within:border-blue-600 focus-within:shadow-sm transition">
        <input
          type="text"
          placeholder="Прямое восхождение"
          value={observation.ra}
          onChange={(e) => onChange("ra", e.target.value)}
          className="flex-1 min-w-0 bg-black text-white placeholder-gray-400 focus:outline-none transition"
        />
      </div>

      {/* Склонение */}
      <div className="flex-1 min-w-0 flex items-center bg-black rounded-md border border-gray-600 px-4 py-3 focus-within:border-blue-600 focus-within:shadow-sm transition">
        <input
          type="text"
          placeholder="Склонение"
          value={observation.dec}
          onChange={(e) => onChange("dec", e.target.value)}
          className="flex-1 min-w-0 bg-black text-white placeholder-gray-400 focus:outline-none transition"
        />
      </div>

      {/* Время измерения */}
      <div className="flex-1 min-w-0 flex items-center bg-black rounded-md border border-gray-600 px-4 py-3 focus-within:border-blue-600 focus-within:shadow-sm transition">
        <input
          type="datetime-local"
          value={observation.time}
          onChange={(e) => onChange("time", e.target.value)}
          className="flex-1 min-w-0 bg-black text-white placeholder-gray-400 focus:outline-none transition"
        />
      </div>
    </div>
  );
};

export default ObservationRow;
