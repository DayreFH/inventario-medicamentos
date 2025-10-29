import api from '../api/http';

/**
 * Verifica que el % de utilidad esté configurado para el día actual
 * Si no lo está, redirige al usuario para configurarlo
 * @returns {Promise<number|null>} El % de utilidad actual o null si no está configurado
 */
export const checkUtilityRate = async () => {
  try {
    // Intentar cargar % de utilidad desde la API
    const { data } = await api.get('/utility-rates/current');
    
    // Guardar en localStorage con la fecha de hoy
    const today = new Date().toDateString();
    localStorage.setItem('utilityRate', JSON.stringify({
      date: today,
      rate: data.utilityPercentage
    }));
    
    return data.utilityPercentage;
  } catch (error) {
    // Si no hay % de utilidad en la API, verificar localStorage
    const today = new Date().toDateString();
    const saved = localStorage.getItem('utilityRate');
    
    if (saved) {
      const data = JSON.parse(saved);
      if (data.date === today && data.rate) {
        return data.rate;
      }
    }
    
    // Si no hay % de utilidad configurado para hoy, pedir que lo configure
    const configure = confirm('Debe configurar el % de utilidad para el día de hoy. ¿Desea configurarlo ahora?');
    
    if (configure) {
      window.location.href = '/admin/utility';
      return null;
    } else {
      alert('No se puede continuar sin configurar el % de utilidad. Por favor, configúrelo en la pestaña "% de Utilidad".');
      return null;
    }
  }
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

