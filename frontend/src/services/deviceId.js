/**
 * Servicio para gestionar el ID único del dispositivo
 * Se usa para identificar el dispositivo sin necesidad de login
 */

const DEVICE_ID_KEY = 'votalloween_device_id';

/**
 * Genera un ID único simple (sin dependencias)
 * @returns {string} ID único
 */
function generateId() {
  return 'device_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

/**
 * Obtiene o crea el ID del dispositivo
 * @returns {string} ID del dispositivo
 */
export function getDeviceId() {
  let deviceId = localStorage.getItem(DEVICE_ID_KEY);

  if (!deviceId) {
    deviceId = generateId();
    localStorage.setItem(DEVICE_ID_KEY, deviceId);
  }

  return deviceId;
}

/**
 * Reinicia el device ID (útil para testing)
 */
export function resetDeviceId() {
  localStorage.removeItem(DEVICE_ID_KEY);
  return getDeviceId();
}
