export default function MyCostumes({ costumes, onAddNew, onEdit, onDelete }) {
  return (
    <div className="my-costumes">
      <div className="my-costumes-header">
        <h2>Mis Disfraces</h2>
        <p className="subtitle">Has registrado {costumes.length} disfraz{costumes.length !== 1 ? 'es' : ''}</p>
      </div>

      <div className="costumes-list">
        {costumes.map((costume) => (
          <CostumeCard key={costume.id} costume={costume} onEdit={onEdit} onDelete={onDelete} />
        ))}
      </div>

      <div className="my-costumes-actions">
        <button onClick={onAddNew} className="btn-primary btn-large">
          Subir Otro Disfraz
        </button>
      </div>
    </div>
  );
}

function CostumeCard({ costume, onEdit, onDelete }) {
  const imageUrl = costume.imageUrl.startsWith('http')
    ? costume.imageUrl
    : `${import.meta.env.VITE_API_URL}${costume.imageUrl}`;

  function handleDelete() {
    if (window.confirm(`¿Seguro que quieres eliminar el disfraz de ${costume.participantName}?`)) {
      onDelete(costume);
    }
  }

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
        <div className="costume-card-actions">
          <button
            onClick={() => onEdit(costume)}
            className="btn-secondary"
          >
            Editar
          </button>
          <button
            onClick={handleDelete}
            className="btn-danger"
          >
            Eliminar
          </button>
        </div>
      </div>
    </div>
  );
}
