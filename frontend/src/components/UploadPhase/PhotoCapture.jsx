import { useState, useRef } from 'react';
import { compressImage } from '../../utils/imageCompression';

export default function PhotoCapture({ onCapture, onCancel }) {
  const [preview, setPreview] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [compressing, setCompressing] = useState(false);
  const fileInputRef = useRef(null);

  async function handleFileChange(e) {
    const file = e.target.files[0];

    if (file) {
      // Validar que sea una imagen
      if (!file.type.startsWith('image/')) {
        alert('Por favor selecciona una imagen válida');
        return;
      }

      // Validar tamaño (máx 10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert('La imagen es muy grande. Máximo 10MB');
        return;
      }

      try {
        setCompressing(true);

        // Comprimir imagen
        const compressedFile = await compressImage(file, 1200, 1200, 0.8);

        // Guardar el archivo comprimido
        setSelectedFile(compressedFile);

        // Crear preview
        const reader = new FileReader();
        reader.onload = (e) => {
          setPreview(e.target.result);
        };
        reader.readAsDataURL(compressedFile);
      } catch (error) {
        console.error('Error compressing image:', error);
        alert('Error al procesar la imagen. Intenta de nuevo.');
      } finally {
        setCompressing(false);
      }
    }
  }

  function handleConfirm() {
    if (selectedFile) {
      onCapture(selectedFile);
    }
  }

  function handleRetake() {
    setPreview(null);
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }

  return (
    <div className="photo-capture">
      <div className="photo-capture-content">
        <h2>Captura tu Disfraz</h2>

        {compressing ? (
          <div className="camera-section">
            <div className="camera-placeholder">
              <div className="spinner"></div>
              <p>Procesando imagen...</p>
            </div>
          </div>
        ) : !preview ? (
          <div className="camera-section">
            <div className="camera-placeholder">
              <span className="camera-icon">📷</span>
              <p>Toca para tomar una foto o seleccionar de galería</p>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFileChange}
              className="file-input"
              id="photo-input"
            />

            <label htmlFor="photo-input" className="btn-primary btn-large">
              Tomar Foto
            </label>

            <button onClick={onCancel} className="btn-secondary mt-1">
              Cancelar
            </button>
          </div>
        ) : (
          <div className="preview-section">
            <div className="preview-container">
              <img src={preview} alt="Preview" className="preview-image" />
            </div>

            <div className="preview-actions">
              <button onClick={handleConfirm} className="btn-primary btn-large">
                Usar esta Foto
              </button>
              <button onClick={handleRetake} className="btn-secondary mt-1">
                Tomar Otra
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
