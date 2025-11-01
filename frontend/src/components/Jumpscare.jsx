import { useState, useEffect } from 'react';
import './Jumpscare.css';

const JUMPSCARE_KEY = 'votalloween_jumpscare_shown';

export default function Jumpscare() {
  const [isScaring, setIsScaring] = useState(false);

  useEffect(() => {
    // Check if jumpscare has already been shown
    const hasShown = localStorage.getItem(JUMPSCARE_KEY);
    if (hasShown) {
      return; // Don't show again
    }

    // Random time between 10 seconds and 1 minute
    const minTime = 10000; // 10 seconds
    const maxTime = 60000; // 1 minute
    const randomTime = Math.random() * (maxTime - minTime) + minTime;

    const timeoutId = setTimeout(() => {
      setIsScaring(true);
      // Mark as shown in localStorage
      localStorage.setItem(JUMPSCARE_KEY, 'true');

      // Auto-hide after 2 seconds
      setTimeout(() => {
        setIsScaring(false);
      }, 2000);
    }, randomTime);

    return () => clearTimeout(timeoutId);
  }, []);

  if (!isScaring) return null;

  return (
    <div className="jumpscare-overlay">
      <img
        src={`${import.meta.env.BASE_URL}image.png`}
        alt=""
        className="jumpscare-image"
      />
    </div>
  );
}
