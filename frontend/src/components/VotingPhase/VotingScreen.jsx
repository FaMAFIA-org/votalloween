import { useState, useEffect, useRef } from 'react';

const CATEGORIES = [
  { id: 'best', label: '🎃 Mejor disfraz', emoji: '🎃' },
  { id: 'funniest', label: '😄 Disfraz más gracioso', emoji: '😄' },
  { id: 'most_elaborate', label: '🧵 Disfraz más elaborado', emoji: '🧵' },
  { id: 'best_group', label: '👨‍👩‍👧‍👦 Mejor disfraz grupal', emoji: '👨‍👩‍👧‍👦' },
];

export default function VotingScreen({ costumes, onVote, loading }) {
  const [selectedVotes, setSelectedVotes] = useState({
    best: null,
    funniest: null,
    most_elaborate: null,
    best_group: null,
  });
  const [currentCategory, setCurrentCategory] = useState(0);
  const topRef = useRef(null);

  // Scroll to top when category changes
  useEffect(() => {
    if (topRef.current) {
      topRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [currentCategory]);

  function handleCostumeSelect(costumeId) {
    const categoryId = CATEGORIES[currentCategory].id;
    setSelectedVotes(prev => ({
      ...prev,
      [categoryId]: costumeId,
    }));
  }

  function handleNextCategory() {
    if (currentCategory < CATEGORIES.length - 1) {
      setCurrentCategory(currentCategory + 1);
    }
  }

  function handlePrevCategory() {
    if (currentCategory > 0) {
      setCurrentCategory(currentCategory - 1);
    }
  }

  function handleCategoryTabClick(idx) {
    setCurrentCategory(idx);
  }

  function handleSubmitVotes() {
    const allSelected = Object.values(selectedVotes).every(vote => vote !== null);
    if (!allSelected) {
      alert('Por favor selecciona un disfraz para todas las categorías');
      return;
    }

    if (window.confirm('¿Confirmas tus votos en todas las categorías?')) {
      onVote(selectedVotes);
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

  const category = CATEGORIES[currentCategory];
  const selectedCostumeId = selectedVotes[category.id];
  const allSelected = Object.values(selectedVotes).every(vote => vote !== null);
  const progress = Object.values(selectedVotes).filter(v => v !== null).length;

  return (
    <div className="voting-screen">
      {/* Scroll anchor */}
      <div ref={topRef} className="scroll-anchor"></div>

      <div className="voting-header-sticky">
        <div className="voting-header">
          <h2>🗳️ ¡Vota en todas las categorías!</h2>
          <p className="subtitle">Progreso: {progress} / {CATEGORIES.length} categorías</p>
        </div>

        <div className="category-selector">
          <div className="category-tabs">
            {CATEGORIES.map((cat, idx) => (
              <button
                key={cat.id}
                className={`category-tab ${currentCategory === idx ? 'active' : ''} ${selectedVotes[cat.id] ? 'completed' : ''}`}
                onClick={() => handleCategoryTabClick(idx)}
              >
                <span className="category-emoji">{cat.emoji}</span>
                {selectedVotes[cat.id] && <span className="check-badge">✓</span>}
              </button>
            ))}
          </div>
        </div>

        <div className="current-category">
          <h3>{category.label}</h3>
          <p className="category-instruction">Selecciona el mejor disfraz para esta categoría</p>
        </div>
      </div>

      <div className="costumes-grid">
        {costumes.map((costume) => (
          <CostumeVoteCard
            key={costume.id}
            costume={costume}
            selected={selectedCostumeId === costume.id}
            onSelect={() => handleCostumeSelect(costume.id)}
          />
        ))}
      </div>

      <div className="vote-navigation">
        <button
          onClick={handlePrevCategory}
          className="btn-secondary"
          disabled={currentCategory === 0}
          title={currentCategory === 0 ? 'Ya estás en la primera categoría' : 'Volver a la categoría anterior'}
        >
          ← Anterior
        </button>

        {currentCategory < CATEGORIES.length - 1 ? (
          <button
            onClick={handleNextCategory}
            className="btn-primary"
            disabled={!selectedCostumeId}
            title={!selectedCostumeId ? '¡Selecciona un disfraz primero!' : 'Ir a la siguiente categoría'}
          >
            Siguiente →
          </button>
        ) : (
          <button
            onClick={handleSubmitVotes}
            className="btn-primary btn-large"
            disabled={loading || !allSelected}
            title={!allSelected ? `Completa todas las categorías (${progress}/${CATEGORIES.length})` : 'Confirmar votos'}
          >
            {loading ? (
              <>
                <span className="spinner-small"></span> Votando...
              </>
            ) : (
              '✅ Confirmar Todos los Votos'
            )}
          </button>
        )}
      </div>
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
        <img
          src={imageUrl}
          alt={costume.participantName}
          loading="eager"
          decoding="async"
        />
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
