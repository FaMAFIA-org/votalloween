import { useState } from 'react';

export default function VotingScreen({ costumes, onVote, loading }) {
  const [selectedCostume, setSelectedCostume] = useState(null);

  function handleVoteClick() {
    if (selectedCostume) {
      if (window.confirm('¿Confirmas tu voto por este disfraz?')) {
        onVote(selectedCostume);
      }
    }
  }

  if (costumes.length === 0) {
    return (
      <div className="voting-screen">
        <div className="voting-header">
          <h2>🗳️ ¡Vota por tu Favorito!</h2>
        </div>
        <div className="no-costumes">
          <p>No hay disfraces para votar todavía.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="voting-screen">
      <div className="voting-header">
        <h2>🗳️ ¡Vota por tu Favorito!</h2>
        <p className="subtitle">Selecciona el disfraz que más te guste</p>
      </div>

      <div className="costumes-grid">
        {costumes.map((costume) => (
          <CostumeVoteCard
            key={costume.id}
            costume={costume}
            selected={selectedCostume === costume.id}
            onSelect={() => setSelectedCostume(costume.id)}
          />
        ))}
      </div>

      {selectedCostume && (
        <div className="vote-action-container">
          <button
            onClick={handleVoteClick}
            className="btn-primary btn-large"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner-small"></span> Votando...
              </>
            ) : (
              'Confirmar Voto'
            )}
          </button>
        </div>
      )}
    </div>
  );
}

function CostumeVoteCard({ costume, selected, onSelect }) {
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
  const imageUrl = costume.imageUrl.startsWith('http')
    ? costume.imageUrl
    : `${API_URL}${costume.imageUrl}`;

  return (
    <div
      className={`costume-vote-card ${selected ? 'selected' : ''}`}
      onClick={onSelect}
    >
      <div className="costume-vote-image">
        <img src={imageUrl} alt={costume.participantName} />
        {selected && (
          <div className="selected-overlay">
            <span className="check-icon">✓</span>
          </div>
        )}
      </div>
      <div className="costume-vote-info">
        <h3>{costume.participantName}</h3>
        {costume.costumeName && (
          <p className="costume-name">{costume.costumeName}</p>
        )}
      </div>
    </div>
  );
}
