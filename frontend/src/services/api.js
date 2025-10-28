/**
 * Servicio para comunicación con el backend
 */

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

/**
 * Helper para hacer peticiones fetch
 */
async function request(endpoint, options = {}) {
  const url = `${API_URL}${endpoint}`;

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Error desconocido' }));
      throw new Error(error.error || `Error ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

/**
 * Helper para peticiones con FormData (archivos)
 */
async function requestFormData(endpoint, formData) {
  const url = `${API_URL}${endpoint}`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      body: formData,
      // No establecer Content-Type, fetch lo hace automáticamente con boundary
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Error desconocido' }));
      throw new Error(error.error || `Error ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

// ==================== CONFIG API ====================

/**
 * Obtiene la configuración actual (fase, tiempos)
 */
export async function getConfig() {
  return request('/api/config');
}

/**
 * Actualiza la configuración (solo admin)
 */
export async function updateConfig(data) {
  return request('/api/config', {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

// ==================== COSTUMES API ====================

/**
 * Obtiene todos los disfraces
 */
export async function getAllCostumes() {
  return request('/api/costumes');
}

/**
 * Obtiene los disfraces de un dispositivo específico
 */
export async function getCostumesByDevice(deviceId) {
  return request(`/api/costumes/device/${deviceId}`);
}

/**
 * Sube un nuevo disfraz
 * @param {File} imageFile - Archivo de imagen
 * @param {string} participantName - Nombre del participante
 * @param {string} costumeName - Nombre del disfraz (opcional)
 * @param {string} deviceId - ID del dispositivo
 */
export async function uploadCostume(imageFile, participantName, costumeName, deviceId) {
  const formData = new FormData();
  formData.append('image', imageFile);
  formData.append('participantName', participantName);
  formData.append('costumeName', costumeName || '');
  formData.append('deviceId', deviceId);

  return requestFormData('/api/costumes', formData);
}

/**
 * Actualiza un disfraz existente
 * @param {string} id - ID del disfraz
 * @param {Object} data - Datos a actualizar
 * @param {File} [imageFile] - Nueva imagen (opcional)
 */
export async function updateCostume(id, data, imageFile = null) {
  const formData = new FormData();

  if (data.participantName) formData.append('participantName', data.participantName);
  if (data.costumeName !== undefined) formData.append('costumeName', data.costumeName || '');
  if (imageFile) formData.append('image', imageFile);

  const url = `${API_URL}/api/costumes/${id}`;

  try {
    const response = await fetch(url, {
      method: 'PUT',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Error desconocido' }));
      throw new Error(error.error || `Error ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

/**
 * Elimina un disfraz
 */
export async function deleteCostume(id) {
  return request(`/api/costumes/${id}`, {
    method: 'DELETE',
  });
}

// ==================== VOTES API ====================

/**
 * Verifica si un dispositivo ya votó
 */
export async function checkIfVoted(deviceId) {
  return request(`/api/votes/check/${deviceId}`);
}

/**
 * Registra un voto
 * @param {string} deviceId - ID del dispositivo
 * @param {string} costumeId - ID del disfraz votado
 */
export async function submitVote(deviceId, costumeId) {
  return request('/api/votes', {
    method: 'POST',
    body: JSON.stringify({ deviceId, costumeId }),
  });
}

/**
 * Obtiene los resultados de votación
 */
export async function getVoteResults() {
  return request('/api/votes/results');
}
