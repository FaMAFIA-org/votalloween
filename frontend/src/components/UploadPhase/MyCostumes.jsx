export default function MyCostumes({ costumes, onAddNew, onReload }) {
  return (
    <div className="my-costumes">
      <div className="my-costumes-header">
        <h2>Mis Disfraces</h2>
        <p className="subtitle">Has registrado {costumes.length} disfraz{costumes.length !== 1 ? 'es' : ''}</p>
      </div>

      <div className="costumes-list">
        {costumes.map((costume) => (
          <CostumeCard key={costume.id} costume={costume} />
        ))}
      </div>

      <div className="my-costumes-actions">
        <button onClick={onAddNew} className="btn-primary btn-large">
          Subir Otro Disfraz
        </button>
        <button onClick={onReload} className="btn-secondary mt-1">
          Actualizar Lista
        </button>
      </div>
    </div>
  );
}

function CostumeCard({ costume }) {
  const imageUrl = costume.imageUrl.startsWith('http')
    ? costume.imageUrl
    : `${import.meta.env.VITE_API_URL}${costume.imageUrl}`;

  return (
    <div className="costume-card">
      <div className="costume-card-image">
        <img src={imageUrl} alt={costume.participantName} />
      </div>
      <div className="costume-card-info">
        <h3>{costume.participantName}</h3>
        {costume.costumeName && (
          <p className="costume-name">{costume.costumeName}</p>
        )}
        <div className="costume-meta">
          <span className="costume-date">
            {new Date(costume.uploadedAt).toLocaleDateString('es-ES', {
              day: 'numeric',
              month: 'short',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </span>
        </div>
      </div>
    </div>
  );
}
