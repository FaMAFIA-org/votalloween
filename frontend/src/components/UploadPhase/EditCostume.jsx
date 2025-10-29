import { useState, useRef } from 'react';
import { compressImage } from '../../utils/imageCompression';

export default function EditCostume({ costume, onSubmit, onCancel, loading }) {
  const [participantName, setParticipantName] = useState(costume.participantName);
  const [costumeName, setCostumeName] = useState(costume.costumeName || '');
  const [newImage, setNewImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [compressing, setCompressing] = useState(false);
  const fileInputRef = useRef(null);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
  const imageUrl = costume.imageUrl.startsWith('http')
    ? costume.imageUrl
    : `${API_URL}${costume.imageUrl}`;

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

        setNewImage(compressedFile);

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

  function handleSubmit(e) {
    e.preventDefault();

    if (!participantName.trim()) {
      alert('Por favor ingresa tu nombre');
      return;
    }

    onSubmit(participantName.trim(), costumeName.trim(), newImage);
  }

  return (
    <div className="costume-form">
      <div className="costume-form-content">
        <h2>Editar Disfraz</h2>

        <div className="form-preview">
          <img
            src={preview || imageUrl}
            alt="Disfraz"
            className="form-preview-image"
          />
        </div>

        <form onSubmit={handleSubmit} className="form">
          <div className="form-group">
            <label>Cambiar Foto <span className="optional">(opcional)</span></label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="file-input"
              id="edit-photo-input"
              disabled={loading || compressing}
            />
            <label htmlFor="edit-photo-input" className="btn-secondary">
              {compressing ? (
                <>
                  <span className="spinner-small"></span> Procesando...
                </>
              ) : newImage ? (
                'Cambiar Otra Foto'
              ) : (
                'Seleccionar Nueva Foto'
              )}
            </label>
          </div>

          <div className="form-group">
            <label htmlFor="edit-participant-name">
              Nombre del Participante <span className="required">*</span>
            </label>
            <input
              id="edit-participant-name"
              type="text"
              value={participantName}
              onChange={(e) => setParticipantName(e.target.value)}
              placeholder="Tu nombre completo"
              disabled={loading}
              maxLength={100}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="edit-costume-name">
              Nombre del Disfraz <span className="optional">(opcional)</span>
            </label>
            <input
              id="edit-costume-name"
              type="text"
              value={costumeName}
              onChange={(e) => setCostumeName(e.target.value)}
              placeholder="Ej: Vampiro, Bruja, Zombie..."
              disabled={loading}
              maxLength={100}
            />
          </div>

          <div className="form-actions">
            <button
              type="submit"
              className="btn-primary btn-large"
              disabled={loading || !participantName.trim()}
            >
              {loading ? (
                <>
                  <span className="spinner-small"></span> Guardando...
                </>
              ) : (
                'Guardar Cambios'
              )}
            </button>

            <button
              type="button"
              onClick={onCancel}
              className="btn-secondary mt-1"
              disabled={loading}
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
