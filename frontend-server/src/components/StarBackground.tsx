// StarBackground.tsx
import { useMemo } from "react";
import { motion } from "framer-motion";

type Star = {
  top: string;
  left: string;
  width: string;
  height: string;
  opacity: number;
  yOffset: number;
  duration: number;
};

export const StarBackground = () => {
  // Генерируем звезды один раз
  const stars: Star[] = useMemo(() => {
    return Array.from({ length: 150 }, () => ({
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
      width: `${Math.random() * 2 + 1}px`,
      height: `${Math.random() * 2 + 1}px`,
      opacity: Math.random() * 0.8 + 0.2,
      yOffset: Math.random() * 10 - 5,
      duration: Math.random() * 4 + 2,
    }));
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden bg-black">
      {/* Мерцающие звёзды */}
      {stars.map((star, i) => (
        <motion.span
          key={i}
          className="absolute rounded-full bg-white"
          style={{
            top: star.top,
            left: star.left,
            width: star.width,
            height: star.height,
            opacity: star.opacity,
          }}
          animate={{
            opacity: [0.2, 1, 0.2],
            y: [0, star.yOffset, 0],
          }}
          transition={{
            duration: star.duration,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}

      {/* Плавный параллакс слой */}
      <motion.div
        className="absolute inset-0"
        style={{
          background: "radial-gradient(ellipse at center, rgba(255,255,255,0.2) 0%, transparent 70%)",
        }}
        animate={{
          scale: [1, 1.05, 1],
          rotate: [0, 2, 0],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
    </div>
  );
};
