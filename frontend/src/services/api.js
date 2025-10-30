/**
 * Servicio para comunicación con el backend
 */

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Retry configuration
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

/**
 * Helper to wait/sleep for a specified time
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Helper para hacer peticiones fetch con retry automático
 */
async function request(endpoint, options = {}, retryCount = 0) {
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
    console.error(`API Error (attempt ${retryCount + 1}/${MAX_RETRIES + 1}):`, error);

    // Retry on network errors or 5xx server errors
    const shouldRetry =
      retryCount < MAX_RETRIES &&
      (error.message.includes('fetch') ||
       error.message.includes('network') ||
       error.message.includes('Failed to fetch') ||
       error.message.includes('Error 5'));

    if (shouldRetry) {
      const delay = RETRY_DELAY * Math.pow(2, retryCount); // Exponential backoff
      console.log(`Retrying in ${delay}ms...`);
      await sleep(delay);
      return request(endpoint, options, retryCount + 1);
    }

    throw error;
  }
}

/**
 * Helper para peticiones con FormData (archivos) con retry automático
 */
async function requestFormData(endpoint, formData, retryCount = 0) {
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
    console.error(`API Error (attempt ${retryCount + 1}/${MAX_RETRIES + 1}):`, error);

    // Retry on network errors or 5xx server errors
    const shouldRetry =
      retryCount < MAX_RETRIES &&
      (error.message.includes('fetch') ||
       error.message.includes('network') ||
       error.message.includes('Failed to fetch') ||
       error.message.includes('Error 5'));

    if (shouldRetry) {
      const delay = RETRY_DELAY * Math.pow(2, retryCount); // Exponential backoff
      console.log(`Retrying in ${delay}ms...`);
      await sleep(delay);
      return requestFormData(endpoint, formData, retryCount + 1);
    }

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
 * Registra votos en todas las categorías
 * @param {string} deviceId - ID del dispositivo
 * @param {Object} votes - Votos por categoría: { best, funniest, most_elaborate, best_group }
 */
export async function submitVotes(deviceId, votes) {
  return request('/api/votes', {
    method: 'POST',
    body: JSON.stringify({ deviceId, votes }),
  });
}

/**
 * Obtiene los resultados de votación
 */
export async function getVoteResults() {
  return request('/api/votes/results');
}
