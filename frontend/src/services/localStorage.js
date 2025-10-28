/**
 * Servicio para gestionar datos locales de la aplicación
 */

const STORAGE_KEYS = {
  MY_UPLOADS: 'votalloween_my_uploads',
  HAS_VOTED: 'votalloween_has_voted',
  VOTED_AT: 'votalloween_voted_at',
};

/**
 * Obtiene la lista de disfraces que el usuario ha subido
 * @returns {Array} Lista de disfraces
 */
export function getMyUploads() {
  const data = localStorage.getItem(STORAGE_KEYS.MY_UPLOADS);
  return data ? JSON.parse(data) : [];
}

/**
 * Guarda un nuevo disfraz en la lista local
 * @param {Object} costume - Datos del disfraz
 */
export function addUpload(costume) {
  const uploads = getMyUploads();
  uploads.push(costume);
  localStorage.setItem(STORAGE_KEYS.MY_UPLOADS, JSON.stringify(uploads));
}

/**
 * Actualiza un disfraz existente
 * @param {string} id - ID del disfraz
 * @param {Object} updatedData - Datos actualizados
 */
export function updateUpload(id, updatedData) {
  const uploads = getMyUploads();
  const index = uploads.findIndex(u => u.id === id);

  if (index !== -1) {
    uploads[index] = { ...uploads[index], ...updatedData };
    localStorage.setItem(STORAGE_KEYS.MY_UPLOADS, JSON.stringify(uploads));
  }
}

/**
 * Elimina un disfraz de la lista local
 * @param {string} id - ID del disfraz
 */
export function removeUpload(id) {
  const uploads = getMyUploads();
  const filtered = uploads.filter(u => u.id !== id);
  localStorage.setItem(STORAGE_KEYS.MY_UPLOADS, JSON.stringify(filtered));
}

/**
 * Verifica si el usuario ya votó
 * @returns {boolean}
 */
export function hasVoted() {
  return localStorage.getItem(STORAGE_KEYS.HAS_VOTED) === 'true';
}

/**
 * Marca que el usuario ha votado
 */
export function markAsVoted() {
  localStorage.setItem(STORAGE_KEYS.HAS_VOTED, 'true');
  localStorage.setItem(STORAGE_KEYS.VOTED_AT, new Date().toISOString());
}

/**
 * Obtiene cuándo votó el usuario
 * @returns {Date|null}
 */
export function getVotedAt() {
  const votedAt = localStorage.getItem(STORAGE_KEYS.VOTED_AT);
  return votedAt ? new Date(votedAt) : null;
}

/**
 * Resetea todos los datos locales (útil para testing)
 */
export function clearAllData() {
  Object.values(STORAGE_KEYS).forEach(key => {
    localStorage.removeItem(key);
  });
}
