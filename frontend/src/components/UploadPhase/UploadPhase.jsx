import { useState, useEffect } from 'react';
import { getCostumesByDevice, uploadCostume } from '../../services/api';
import { getMyUploads, addUpload } from '../../services/localStorage';
import PhotoCapture from './PhotoCapture';
import CostumeForm from './CostumeForm';
import MyCostumes from './MyCostumes';
import './UploadPhase.css';

export default function UploadPhase({ deviceId }) {
  const [view, setView] = useState('welcome'); // 'welcome', 'capture', 'form', 'list'
  const [capturedImage, setCapturedImage] = useState(null);
  const [myUploads, setMyUploads] = useState([]);
  const [loading, setLoading] = useState(true);

  // Cargar disfraces del dispositivo al montar
  useEffect(() => {
    loadMyCostumes();
  }, [deviceId]);

  async function loadMyCostumes() {
    try {
      setLoading(true);
      const costumes = await getCostumesByDevice(deviceId);
      setMyUploads(costumes);

      // Si ya tiene disfraces, ir directo a la lista
      if (costumes.length > 0) {
        setView('list');
      }
    } catch (error) {
      console.error('Error loading costumes:', error);
    } finally {
      setLoading(false);
    }
  }

  function handleStartUpload() {
    setView('capture');
  }

  function handlePhotoCapture(imageFile) {
    setCapturedImage(imageFile);
    setView('form');
  }

  function handleCancelForm() {
    setCapturedImage(null);
    setView(myUploads.length > 0 ? 'list' : 'welcome');
  }

  async function handleSubmitCostume(participantName, costumeName) {
    try {
      setLoading(true);
      const result = await uploadCostume(
        capturedImage,
        participantName,
        costumeName,
        deviceId
      );

      // Guardar en localStorage
      addUpload(result);

      // Recargar lista
      await loadMyCostumes();

      // Limpiar estado
      setCapturedImage(null);
      setView('list');
    } catch (error) {
      console.error('Error uploading costume:', error);
      alert('Error al subir el disfraz. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  }

  if (loading && view === 'welcome') {
    return (
      <div className="upload-phase">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="upload-phase">
      {/* Vista de Bienvenida */}
      {view === 'welcome' && (
        <div className="welcome-screen">
          <div className="welcome-content">
            <h2>¡Bienvenido al Concurso!</h2>
            <p>Muestra tu mejor disfraz de Halloween</p>
            <div className="welcome-steps">
              <div className="step">
                <span className="step-icon">📸</span>
                <span>Toma una foto</span>
              </div>
              <div className="step">
                <span className="step-icon">✍️</span>
                <span>Registra tu nombre</span>
              </div>
              <div className="step">
                <span className="step-icon">🎉</span>
                <span>¡Participa!</span>
              </div>
            </div>
            <button onClick={handleStartUpload} className="btn-primary btn-large">
              Entrar al Concurso
            </button>
          </div>
        </div>
      )}

      {/* Vista de Captura de Foto */}
      {view === 'capture' && (
        <PhotoCapture
          onCapture={handlePhotoCapture}
          onCancel={() => setView(myUploads.length > 0 ? 'list' : 'welcome')}
        />
      )}

      {/* Vista de Formulario */}
      {view === 'form' && (
        <CostumeForm
          image={capturedImage}
          onSubmit={handleSubmitCostume}
          onCancel={handleCancelForm}
          loading={loading}
        />
      )}

      {/* Vista de Lista de Disfraces */}
      {view === 'list' && (
        <MyCostumes
          costumes={myUploads}
          onAddNew={handleStartUpload}
          onReload={loadMyCostumes}
        />
      )}
    </div>
  );
}
