import { useState, useEffect, useCallback } from 'react';
import { getCostumesByDevice, uploadCostume, updateCostume, deleteCostume } from '../../services/api';
import { addUpload } from '../../services/localStorage';
import PhotoCapture from './PhotoCapture';
import CostumeForm from './CostumeForm';
import EditCostume from './EditCostume';
import MyCostumes from './MyCostumes';
import './UploadPhase.css';

export default function UploadPhase({ deviceId }) {
  const [view, setView] = useState('welcome'); // 'welcome', 'capture', 'form', 'list', 'edit'
  const [capturedImage, setCapturedImage] = useState(null);
  const [myUploads, setMyUploads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [gifKey, setGifKey] = useState(0);
  const [editingCostume, setEditingCostume] = useState(null);

  // Cargar disfraces del dispositivo al montar
  const loadMyCostumes = useCallback(async () => {
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
  }, [deviceId]);

  useEffect(() => {
    loadMyCostumes();
  }, [loadMyCostumes]);

  // Force GIF to reload every 3 seconds to loop the animation
  useEffect(() => {
    if (view === 'welcome') {
      const interval = setInterval(() => {
        setGifKey(prev => prev + 1);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [view]);

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

  function handleEdit(costume) {
    setEditingCostume(costume);
    setView('edit');
  }

  function handleCancelEdit() {
    setEditingCostume(null);
    setView('list');
  }

  async function handleUpdateCostume(participantName, costumeName, newImage) {
    try {
      setLoading(true);
      const data = {
        participantName,
        costumeName,
      };

      await updateCostume(editingCostume.id, data, newImage);

      // Recargar lista
      await loadMyCostumes();

      // Limpiar estado
      setEditingCostume(null);
      setView('list');
    } catch (error) {
      console.error('Error updating costume:', error);
      alert('Error al actualizar el disfraz. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(costume) {
    try {
      setLoading(true);
      await deleteCostume(costume.id);

      // Recargar lista
      await loadMyCostumes();

      // Si ya no hay disfraces, volver al welcome
      const updatedCostumes = myUploads.filter(c => c.id !== costume.id);
      if (updatedCostumes.length === 0) {
        setView('welcome');
      }
    } catch (error) {
      console.error('Error deleting costume:', error);
      alert('Error al eliminar el disfraz. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
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
            <h2>¡Bienvenido al concurso!</h2>
            <div className="welcome-steps">
              <div className="step">
                <img
                  src={`${import.meta.env.BASE_URL}take_a_photo.png`}
                  alt="1. Tomar foto"
                  className="step-icon"
                />
                <span>1. Sacate una fotito</span>
              </div>
              <div className="step">
                <img
                  src={`${import.meta.env.BASE_URL}skeleton-hand-writing-1870283.webp`}
                  alt="2. Escribir"
                  className="step-icon"
                />
                <span>2. Pone tu nombre</span>
              </div>
              <div className="step">
                <img
                  key={gifKey}
                  src={`${import.meta.env.BASE_URL}dancing_skeleton.gif?t=${gifKey}`}
                  alt="3. Celebrar"
                  className="step-icon"
                />
                <span>3. ¡Suerte!</span>
              </div>
            </div>
            <button onClick={handleStartUpload} className="btn-primary btn-large">
             💀☠️💀🎃 participar ☠️💀☠️🎃
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
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}

      {/* Vista de Edición */}
      {view === 'edit' && editingCostume && (
        <EditCostume
          costume={editingCostume}
          onSubmit={handleUpdateCostume}
          onCancel={handleCancelEdit}
          loading={loading}
        />
      )}
    </div>
  );
}
