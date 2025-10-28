import { useState, useEffect } from 'react';

export default function CostumeForm({ image, onSubmit, onCancel, loading }) {
  const [participantName, setParticipantName] = useState('');
  const [costumeName, setCostumeName] = useState('');
  const [preview, setPreview] = useState(null);

  useEffect(() => {
    if (image) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target.result);
      };
      reader.readAsDataURL(image);
    }
  }, [image]);

  function handleSubmit(e) {
    e.preventDefault();

    if (!participantName.trim()) {
      alert('Por favor ingresa tu nombre');
      return;
    }

    onSubmit(participantName.trim(), costumeName.trim());
  }

  return (
    <div className="costume-form">
      <div className="costume-form-content">
        <h2>Registra tu Disfraz</h2>

        {preview && (
          <div className="form-preview">
            <img src={preview} alt="Tu disfraz" className="form-preview-image" />
          </div>
        )}

        <form onSubmit={handleSubmit} className="form">
          <div className="form-group">
            <label htmlFor="participant-name">
              Nombre del Participante <span className="required">*</span>
            </label>
            <input
              id="participant-name"
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
            <label htmlFor="costume-name">
              Nombre del Disfraz <span className="optional">(opcional)</span>
            </label>
            <input
              id="costume-name"
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
                  <span className="spinner-small"></span> Subiendo...
                </>
              ) : (
                'Registrar Disfraz'
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
