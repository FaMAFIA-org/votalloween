import { useState, useEffect } from 'react';

const CATEGORIES = [
  { id: 'best', label: '🎃 Mejor disfraz', emoji: '🎃' },
  { id: 'funniest', label: '😄 Disfraz más gracioso', emoji: '😄' },
  { id: 'most_elaborate', label: '🧵 Disfraz más elaborado', emoji: '🧵' },
  { id: 'best_group', label: '👨‍👩‍👧‍👦 Mejor disfraz grupal', emoji: '👨‍👩‍👧‍👦' },
];

export default function ThankYouScreen({ votingEndTime, votedCostumes }) {
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

        {votedCostumes && (
          <div className="voted-costumes-container">
            <p className="voted-text">Tus votos:</p>
            <div className="voted-categories">
              {CATEGORIES.map(category => {
                const vote = votedCostumes[category.id];
                if (!vote || !vote.costume) return null;

                return (
                  <div key={category.id} className="voted-category-card">
                    <div className="category-label">
                      <span className="category-emoji">{category.emoji}</span>
                      <span className="category-name">{category.label}</span>
                    </div>
                    <div className="voted-costume-name">
                      {vote.costume.participantName}
                      {vote.costume.costumeName && (
                        <span className="costume-subtitle">
                          {' - '}{vote.costume.costumeName}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
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
