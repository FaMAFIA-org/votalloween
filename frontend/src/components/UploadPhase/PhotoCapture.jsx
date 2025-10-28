import { useState, useRef } from 'react';

export default function PhotoCapture({ onCapture, onCancel }) {
  const [preview, setPreview] = useState(null);
  const fileInputRef = useRef(null);

  function handleFileChange(e) {
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

      // Crear preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  }

  function handleConfirm() {
    const file = fileInputRef.current.files[0];
    if (file) {
      onCapture(file);
    }
  }

  function handleRetake() {
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }

  return (
    <div className="photo-capture">
      <div className="photo-capture-content">
        <h2>Captura tu Disfraz</h2>

        {!preview ? (
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
