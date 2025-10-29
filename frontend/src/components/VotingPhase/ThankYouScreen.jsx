import { useState, useEffect } from 'react';

export default function ThankYouScreen({ votingEndTime, votedCostume }) {
  const [timeLeft, setTimeLeft] = useState('');
  const [contestEnded, setContestEnded] = useState(false);

  useEffect(() => {
    if (!votingEndTime) return;

    function updateCountdown() {
      const now = new Date().getTime();
      const end = new Date(votingEndTime).getTime();
      const distance = end - now;

      if (distance <= 0) {
        setContestEnded(true);
        setTimeLeft('');
        return;
      }

      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      let timeString = '';
      if (days > 0) {
        timeString = `${days}d ${hours}h ${minutes}m ${seconds}s`;
      } else if (hours > 0) {
        timeString = `${hours}h ${minutes}m ${seconds}s`;
      } else if (minutes > 0) {
        timeString = `${minutes}m ${seconds}s`;
      } else {
        timeString = `${seconds}s`;
      }

      setTimeLeft(timeString);
    }

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [votingEndTime]);

  if (contestEnded) {
    return (
      <div className="thank-you-screen">
        <div className="thank-you-content">
          <h1 className="halloween-title">¡Feliz Halloween! 🎃</h1>
          <img
            src={`${import.meta.env.BASE_URL}dancing_skeleton.gif`}
            alt="Celebración"
            className="celebration-gif"
          />
          <p className="thank-you-message">
            ¡Gracias por participar en el concurso!
          </p>
          <p className="subtitle">El concurso ha finalizado</p>
        </div>
      </div>
    );
  }

  return (
    <div className="thank-you-screen">
      <div className="thank-you-content">
        <h1 className="halloween-title">¡Gracias por Votar! 🎉</h1>

        {votedCostume && (
          <div className="voted-costume-info">
            <p className="voted-text">Votaste por:</p>
            <h2>{votedCostume.participantName}</h2>
            {votedCostume.costumeName && (
              <p className="costume-name">{votedCostume.costumeName}</p>
            )}
          </div>
        )}

        {votingEndTime && timeLeft && (
          <div className="countdown-container">
            <p className="countdown-label">El concurso termina en:</p>
            <div className="countdown-timer">
              {timeLeft}
            </div>
          </div>
        )}

        <div className="thank-you-footer">
          <p>¡Mantente atento a los resultados!</p>
        </div>
      </div>
    </div>
  );
}
