// ObservationRow.tsx
import { type FC } from "react";

type Observation = {
  ra: string;
  dec: string;
  time: string;
};

type ObservationRowProps = {
  observation: Observation;
  onChange: (field: keyof Observation, value: string) => void;
};

const ObservationRow: FC<ObservationRowProps> = ({ observation, onChange }) => {
  return (
    <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4 w-full bg-gray-900 border border-gray-700 rounded-lg p-4 hover:bg-gray-850 transition-colors">
      
      {/* Прямое восхождение */}
      <div className="flex-1 flex items-center bg-black rounded-md border border-gray-600 px-4 py-3 focus-within:border-blue-500 focus-within:shadow-sm transition">
        <input
          type="text"
          placeholder="Прямое восхождение"
          value={observation.ra}
          onChange={(e) => onChange("ra", e.target.value)}
          className="flex-1 bg-black text-white placeholder-gray-400 focus:outline-none transition"
        />
      </div>

      {/* Склонение */}
      <div className="flex-1 flex items-center bg-black rounded-md border border-gray-600 px-4 py-3 focus-within:border-green-500 focus-within:shadow-sm transition">
        <input
          type="text"
          placeholder="Склонение"
          value={observation.dec}
          onChange={(e) => onChange("dec", e.target.value)}
          className="flex-1 bg-black text-white placeholder-gray-400 focus:outline-none transition"
        />
      </div>

      {/* Время измерения */}
      <div className="flex-1 flex items-center bg-black rounded-md border border-gray-600 px-4 py-3 focus-within:border-purple-500 focus-within:shadow-sm transition">
        <input
          type="datetime-local"
          value={observation.time}
          onChange={(e) => onChange("time", e.target.value)}
          className="flex-1 bg-black text-white placeholder-gray-400 focus:outline-none transition"
        />
      </div>
    </div>
  );
};

export default ObservationRow;