import { useState, useEffect } from 'react';
import { getConfig, updateConfig, getVoteResults } from '../../services/api';
import './AdminPanel.css';

const CATEGORIES = [
  { id: 'best', label: '🎃 Mejor disfraz', emoji: '🎃' },
  { id: 'funniest', label: '😄 Disfraz más gracioso', emoji: '😄' },
  { id: 'most_elaborate', label: '🧵 Disfraz más elaborado', emoji: '🧵' },
  { id: 'best_group', label: '👨‍👩‍👧‍👦 Mejor disfraz grupal', emoji: '👨‍👩‍👧‍👦' },
];

export default function AdminPanel() {
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [votingEndTime, setVotingEndTime] = useState('');
  const [results, setResults] = useState(null);
  const [loadingResults, setLoadingResults] = useState(false);

  useEffect(() => {
    loadConfig();
    if (config?.phase === 'voting') {
      loadResults();
    }
  }, [config?.phase]);

  async function loadConfig() {
    try {
      setLoading(true);
      const data = await getConfig();
      setConfig(data);

      // Format datetime for input
      if (data.votingEndTime) {
        const date = new Date(data.votingEndTime);
        const formatted = date.toISOString().slice(0, 16);
        setVotingEndTime(formatted);
      } else {
        // Default to tomorrow at 23:59
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(23, 59, 0, 0);
        setVotingEndTime(tomorrow.toISOString().slice(0, 16));
      }
    } catch (error) {
      console.error('Error loading config:', error);
      alert('Error al cargar la configuración');
    } finally {
      setLoading(false);
    }
  }

  async function loadResults() {
    try {
      setLoadingResults(true);
      const data = await getVoteResults();
      setResults(data);
    } catch (error) {
      console.error('Error loading results:', error);
    } finally {
      setLoadingResults(false);
    }
  }

  async function handlePhaseChange(newPhase) {
    if (!window.confirm(`¿Cambiar a fase de ${newPhase === 'upload' ? 'SUBIDA' : 'VOTACIÓN'}?`)) {
      return;
    }

    try {
      setUpdating(true);
      const data = { phase: newPhase };

      if (newPhase === 'voting' && votingEndTime) {
        data.votingEndTime = new Date(votingEndTime).toISOString();
      }

      const updated = await updateConfig(data);
      setConfig(updated);
      alert(`✅ Fase cambiada a: ${newPhase.toUpperCase()}`);
    } catch (error) {
      console.error('Error updating phase:', error);
      alert('Error al cambiar la fase');
    } finally {
      setUpdating(false);
    }
  }

  async function handleUpdateEndTime() {
    if (!votingEndTime) {
      alert('Por favor selecciona una fecha y hora');
      return;
    }

    try {
      setUpdating(true);
      const data = {
        votingEndTime: new Date(votingEndTime).toISOString()
      };

      const updated = await updateConfig(data);
      setConfig(updated);
      alert('✅ Hora de fin actualizada');
    } catch (error) {
      console.error('Error updating end time:', error);
      alert('Error al actualizar la hora');
    } finally {
      setUpdating(false);
    }
  }

  if (loading) {
    return (
      <div className="admin-panel">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-panel">
      <div className="admin-content">
        <h1>🎃 Panel de Administración</h1>
        <p className="warning">⚠️ Panel secreto - No compartir esta URL</p>

        <div className="admin-section">
          <h2>Estado Actual</h2>
          <div className="status-card">
            <div className="status-item">
              <span className="label">Fase:</span>
              <span className={`status-badge ${config.phase}`}>
                {config.phase === 'upload' ? '📸 SUBIDA' : '🗳️ VOTACIÓN'}
              </span>
            </div>

            {config.votingEndTime && (
              <div className="status-item">
                <span className="label">Termina:</span>
                <span className="value">
                  {new Date(config.votingEndTime).toLocaleString('es-ES', {
                    dateStyle: 'full',
                    timeStyle: 'short'
                  })}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="admin-section">
          <h2>Cambiar Fase</h2>
          <div className="phase-buttons">
            <button
              onClick={() => handlePhaseChange('upload')}
              className={`btn-phase ${config.phase === 'upload' ? 'active' : ''}`}
              disabled={updating || config.phase === 'upload'}
            >
              {updating ? (
                <>
                  <span className="spinner-small"></span> Cambiando...
                </>
              ) : (
                <>📸 Fase de Subida</>
              )}
            </button>

            <button
              onClick={() => handlePhaseChange('voting')}
              className={`btn-phase ${config.phase === 'voting' ? 'active' : ''}`}
              disabled={updating || config.phase === 'voting'}
            >
              {updating ? (
                <>
                  <span className="spinner-small"></span> Cambiando...
                </>
              ) : (
                <>🗳️ Fase de Votación</>
              )}
            </button>
          </div>
        </div>

        <div className="admin-section">
          <h2>Configurar Fin de Votación</h2>
          <div className="datetime-control">
            <input
              type="datetime-local"
              value={votingEndTime}
              onChange={(e) => setVotingEndTime(e.target.value)}
              disabled={updating}
            />
            <button
              onClick={handleUpdateEndTime}
              className="btn-secondary"
              disabled={updating || !votingEndTime}
            >
              {updating ? 'Actualizando...' : 'Actualizar Hora'}
            </button>
          </div>
        </div>

        <div className="admin-section">
          <h2>Acciones Rápidas</h2>
          <div className="quick-actions">
            <button
              onClick={loadConfig}
              className="btn-secondary"
              disabled={loading}
            >
              🔄 Recargar Estado
            </button>

            {config?.phase === 'voting' && (
              <button
                onClick={loadResults}
                className="btn-secondary"
                disabled={loadingResults}
              >
                📊 Actualizar Resultados
              </button>
            )}

            <a
              href={`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/photos/download-all`}
              className="btn-secondary"
              download
              style={{ textDecoration: 'none', display: 'inline-block' }}
            >
              📦 Descargar Todas las Fotos (ZIP)
            </a>

            <a
              href="/"
              className="btn-secondary"
              style={{ textDecoration: 'none', display: 'inline-block' }}
            >
              👁️ Ver App Pública
            </a>
          </div>
        </div>

        {config?.phase === 'voting' && results && (
          <div className="admin-section">
            <h2>📊 Resultados de Votación</h2>

            <div className="results-summary">
              <div className="summary-stat">
                <span className="stat-label">Total Votantes:</span>
                <span className="stat-value">{results.totalVoters}</span>
              </div>
              <div className="summary-stat">
                <span className="stat-label">Total Votos:</span>
                <span className="stat-value">{results.totalVotes}</span>
              </div>
            </div>

            <div className="results-categories">
              {CATEGORIES.map(category => {
                const categoryResults = results.results[category.id] || [];

                return (
                  <div key={category.id} className="category-results">
                    <h3 className="category-title">
                      {category.emoji} {category.label}
                    </h3>

                    {categoryResults.length === 0 ? (
                      <p className="no-votes">No hay votos aún en esta categoría</p>
                    ) : (
                      <div className="results-table">
                        <table>
                          <thead>
                            <tr>
                              <th>Posición</th>
                              <th>Participante</th>
                              <th>Disfraz</th>
                              <th>Votos</th>
                            </tr>
                          </thead>
                          <tbody>
                            {categoryResults.map((result, index) => (
                              <tr key={result.costume.id} className={index === 0 ? 'winner' : ''}>
                                <td className="position">
                                  {index === 0 ? '🏆' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}`}
                                </td>
                                <td className="participant">
                                  {result.costume.participantName}
                                </td>
                                <td className="costume-name">
                                  {result.costume.costumeName || '-'}
                                </td>
                                <td className="votes">
                                  <span className="vote-badge">{result.votes}</span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="admin-footer">
          <p>
            <strong>URL de esta página:</strong><br />
            <code>{window.location.href}</code>
          </p>
          <p className="warning-text">
            ⚠️ Guarda esta URL en un lugar seguro. No la compartas públicamente.
          </p>
        </div>
      </div>
    </div>
  );
}
