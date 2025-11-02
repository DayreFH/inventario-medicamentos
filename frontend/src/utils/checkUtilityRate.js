import api from '../api/http';

/**
 * Verifica que el % de utilidad esté configurado para el día actual
 * Si no lo está, redirige al usuario para configurarlo
 * @returns {Promise<number|null>} El % de utilidad actual o null si no está configurado
 */
export const checkUtilityRate = async () => {
  const today = new Date().toDateString();

  // 1) Prioridad: exigir dato del día desde localStorage
  try {
    const saved = localStorage.getItem('utilityRate');
    if (saved) {
      const data = JSON.parse(saved);
      if (data?.date === today && data?.rate) {
        return data.rate;
      }
    }
  } catch (e) {
    console.error('Error leyendo utilityRate de localStorage:', e);
  }

  // 2) Si no hay dato de hoy, pedir configuración manual
  const configure = confirm('Debe configurar el % de utilidad para el día de hoy. ¿Desea configurarlo ahora?');
  if (configure) {
    window.location.href = '/admin/utility';
    return null;
  }
  alert('No se puede continuar sin configurar el % de utilidad. Por favor, configúrelo en la pestaña "% de Utilidad".');
  return null;
};

/**
 * Obtiene el % de utilidad del localStorage sin redirigir
 * @returns {number|null} El % de utilidad o null
 */
export const getUtilityRateFromStorage = () => {
  try {
    const today = new Date().toDateString();
    const saved = localStorage.getItem('utilityRate');
    
    if (saved) {
      const data = JSON.parse(saved);
      if (data.date === today && data.rate) {
        return data.rate;
      }
    }
    return null;
  } catch (error) {
    console.error('Error obteniendo % de utilidad de localStorage:', error);
    return null;
  }
};

