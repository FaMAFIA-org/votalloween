import { useState, useEffect } from 'react';
import './SkeletonWalker.css';

export default function SkeletonWalker() {
  const [isWalking, setIsWalking] = useState(false);
  const [position, setPosition] = useState({ top: 50 });

  useEffect(() => {
    // Función para iniciar el paseo del esqueleto
    const startWalking = () => {
      // Posición vertical aleatoria (entre 30% y 70% de la pantalla)
      const randomTop = Math.random() * 40 + 30;
      setPosition({ top: randomTop });
      setIsWalking(true);

      // Después de 400ms (duración de la animación), ocultar
      setTimeout(() => {
        setIsWalking(false);
      }, 400);
    };

    // Tiempo aleatorio entre apariciones (entre 2 y 5 segundos)
    const scheduleNextWalk = () => {
      const minTime = 2000; // 2 segundos
      const maxTime = 5000; // 5 segundos
      const randomTime = Math.random() * (maxTime - minTime) + minTime;

      return setTimeout(() => {
        startWalking();
        scheduleNextWalk(); // Programar la siguiente aparición
      }, randomTime);
    };

    // Iniciar el ciclo de apariciones
    const timeoutId = scheduleNextWalk();

    // Limpieza al desmontar
    return () => {
      clearTimeout(timeoutId);
    };
  }, []);

  if (!isWalking) return null;

  return (
    <div
      className="skeleton-walker"
      style={{ top: `${position.top}%` }}
    >
      <img
        src={`${import.meta.env.BASE_URL}terraria_skeleton.webp`}
        alt=""
        className="skeleton-image"
      />
    </div>
  );
}
