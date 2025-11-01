import { useState, useEffect } from 'react';
import './Jumpscare.css';

export default function Jumpscare() {
  const [isScaring, setIsScaring] = useState(false);

  useEffect(() => {
    const scheduleJumpscare = () => {
      // Random time between 30 seconds and 2 minutes
      const minTime = 30000; // 30 seconds
      const maxTime = 120000; // 2 minutes
      const randomTime = Math.random() * (maxTime - minTime) + minTime;

      const timeoutId = setTimeout(() => {
        triggerJumpscare();
      }, randomTime);

      return timeoutId;
    };

    const triggerJumpscare = () => {
      setIsScaring(true);

      // Auto-hide after 1.5 seconds
      setTimeout(() => {
        setIsScaring(false);
        // Schedule next jumpscare
        scheduleJumpscare();
      }, 1500);
    };

    // Start the first jumpscare timer
    const timeoutId = scheduleJumpscare();

    return () => clearTimeout(timeoutId);
  }, []);

  if (!isScaring) return null;

  return (
    <div className="jumpscare-overlay">
      <div className="jumpscare-content">
        <img
          src={`${import.meta.env.BASE_URL}image.png`}
          alt="BOO!"
          className="jumpscare-image"
        />
        <div className="jumpscare-text">¡BOO! 👻</div>
      </div>
    </div>
  );
}
