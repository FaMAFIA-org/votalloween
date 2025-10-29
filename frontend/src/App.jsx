import { useState, useEffect } from 'react';
import { getConfig } from './services/api';
import { getDeviceId } from './services/deviceId';
import UploadPhase from './components/UploadPhase/UploadPhase';
import VotingPhase from './components/VotingPhase/VotingPhase';
import SkeletonWalker from './components/SkeletonWalker';
import './App.css';

function App() {
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deviceId] = useState(() => getDeviceId());

  // Obtener configuración al cargar
  useEffect(() => {
    loadConfig();
    // Recargar cada 30 segundos para detectar cambios de fase
    const interval = setInterval(loadConfig, 30000);
    return () => clearInterval(interval);
  }, []);

  async function loadConfig() {
    try {
      const data = await getConfig();
      setConfig(data);
      setError(null);
    } catch (err) {
      console.error('Error loading config:', err);
      setError('Error al conectar con el servidor');
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="app-container">
        <div className="loading-screen">
          <div className="spinner"></div>
          <p>Cargando...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="app-container">
        <div className="error-screen">
          <h2>⚠️ Error</h2>
          <p>{error}</p>
          <button onClick={loadConfig} className="btn-primary">
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  // Determinar qué mostrar según la fase
  const { phase, votingEndTime } = config;

  return (
    <div className="app-container">
      {/* Esqueleto caminante de Halloween */}
      <SkeletonWalker />

      <header className="app-header">
        <img src={`${import.meta.env.BASE_URL}logo.png`} alt="VotAlloween" className="app-logo" />
      </header>

      <main className="app-main">
        {phase === 'upload' && (
          <UploadPhase deviceId={deviceId} />
        )}

        {phase === 'voting' && (
          <VotingPhase
            deviceId={deviceId}
            votingEndTime={votingEndTime}
          />
        )}
      </main>

      <footer className="app-footer">
        <small>ID: {deviceId.slice(-8)}</small>
      </footer>
    </div>
  );
}

export default App;
