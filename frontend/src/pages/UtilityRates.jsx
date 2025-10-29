import { useState, useEffect } from 'react';
import api from '../api/http';

const UtilityRates = () => {
  const [currentRate, setCurrentRate] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [manualRate, setManualRate] = useState({
    utilityPercentage: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        loadCurrentRate(),
        loadHistory()
      ]);
    } catch (error) {
      console.error('Error cargando datos:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCurrentRate = async () => {
    try {
      const { data } = await api.get('/utility-rates/current');
      setCurrentRate(data);
    } catch (error) {
      console.error('Error cargando % de utilidad actual:', error);
    }
  };

  const loadHistory = async () => {
    try {
      const { data } = await api.get('/utility-rates/history?days=30');
      setHistory(data.rates);
    } catch (error) {
      console.error('Error cargando historial:', error);
    }
  };

  const handleManualUpdate = async (e) => {
    e.preventDefault();
    
    // Validación de campos
    if (!manualRate.utilityPercentage || parseFloat(manualRate.utilityPercentage) <= 0) {
      alert('Por favor ingrese un % de utilidad válido');
      return;
    }

    try {
      const response = await api.post('/utility-rates/update', manualRate);
      
      // Guardar el % de utilidad en localStorage para que esté disponible inmediatamente
      const today = new Date().toDateString();
      localStorage.setItem('utilityRate', JSON.stringify({
        date: today,
        rate: parseFloat(manualRate.utilityPercentage)
      }));
      
      setManualRate({ ...manualRate, utilityPercentage: '' });
      await loadCurrentRate();
      await loadHistory();
      
      alert('% de utilidad actualizado exitosamente');
    } catch (error) {
      const msg = error?.response?.data?.message || error?.response?.data?.error || 'Error actualizando % de utilidad';
      console.error('Error actualizando % de utilidad:', error);
      alert(`Error: ${msg}`);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getSourceIcon = (source) => {
    switch (source) {
      case 'manual': return '✋';
      default: return '📊';
    }
  };

  const getSourceName = (source) => {
    switch (source) {
      case 'manual': return 'Manual';
      default: return 'Desconocido';
    }
  };

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ 
          color: '#2c3e50', 
          marginBottom: '8px',
          fontSize: '28px',
          fontWeight: 'bold'
        }}>
          Porcentaje de Utilidad
        </h1>
        <p style={{ color: '#6c757d', margin: 0 }}>
          Configuración del porcentaje de utilidad para el cálculo de precios de venta
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        {/* % Actual */}
        <div>
          <h3 style={{ color: '#495057', marginBottom: '16px' }}>
            % de Utilidad Actual
          </h3>
          <div style={{
            backgroundColor: '#ffffff',
            padding: '24px',
            borderRadius: '8px',
            border: '1px solid #e9ecef',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}>
            {loading ? (
              <div style={{ textAlign: 'center', padding: '20px', color: '#6c757d' }}>
                Cargando...
              </div>
            ) : currentRate ? (
              <div>
                <div style={{
                  backgroundColor: '#f8f9fa',
                  border: '1px solid #e9ecef',
                  borderRadius: '8px',
                  padding: '32px',
                  textAlign: 'center',
                  marginBottom: '16px'
                }}>
                  <div style={{ fontSize: '14px', color: '#6c757d', marginBottom: '8px' }}>Porcentaje de Utilidad</div>
                  <div style={{ fontSize: '48px', fontWeight: 'bold', color: '#28a745' }}>
                    {currentRate.utilityPercentage}%
                  </div>
                </div>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  padding: '12px',
                  backgroundColor: '#f8f9fa',
                  borderRadius: '6px'
                }}>
                  <div>
                    <div style={{ fontSize: '14px', color: '#6c757d' }}>Fuente</div>
                    <div style={{ fontSize: '16px', fontWeight: '500' }}>
                      {getSourceIcon(currentRate.source)} {getSourceName(currentRate.source)}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '14px', color: '#6c757d' }}>Fecha</div>
                    <div style={{ fontSize: '16px', fontWeight: '500' }}>
                      {formatDate(currentRate.date)}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '20px', color: '#6c757d' }}>
                No hay % de utilidad configurado
              </div>
            )}
          </div>
        </div>

        {/* Actualización Manual */}
        <div>
          <h3 style={{ color: '#495057', marginBottom: '16px' }}>
            Actualización Manual
          </h3>
          <form onSubmit={handleManualUpdate} style={{
            backgroundColor: '#ffffff',
            padding: '24px',
            borderRadius: '8px',
            border: '1px solid #e9ecef',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#495057' }}>
                % de Utilidad
              </label>
              <input
                type="number"
                step="0.01"
                value={manualRate.utilityPercentage}
                onChange={(e) => setManualRate({...manualRate, utilityPercentage: e.target.value})}
                placeholder="Ej: 30.00"
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #ced4da',
                  borderRadius: '4px',
                  fontSize: '16px',
                  textAlign: 'center',
                  fontWeight: 'bold'
                }}
              />
              <small style={{ color: '#6c757d', fontSize: '12px' }}>
                Ingrese el porcentaje de utilidad deseado
              </small>
            </div>

            <button
              type="submit"
              style={{
                width: '100%',
                padding: '12px',
                backgroundColor: '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer'
              }}
            >
              ✋ Actualizar % de Utilidad
            </button>
          </form>
        </div>
      </div>

      {/* Historial */}
      <div style={{ marginTop: '32px' }}>
        <h3 style={{ color: '#495057', marginBottom: '16px' }}>
          Historial de % de Utilidad (Últimos 30 días)
        </h3>
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '8px',
          border: '1px solid #e9ecef',
          overflow: 'hidden',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          {history.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#6c757d' }}>
              No hay historial disponible
            </div>
          ) : (
            <div style={{ maxHeight: '400px', overflow: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f8f9fa' }}>
                    <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#495057' }}>
                      Fecha
                    </th>
                    <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#495057' }}>
                      % de Utilidad
                    </th>
                    <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#495057' }}>
                      Fuente
                    </th>
                    <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#495057' }}>
                      Estado
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((rate, index) => (
                    <tr key={rate.id || index} style={{ borderBottom: '1px solid #e9ecef' }}>
                      <td style={{ padding: '12px' }}>
                        {formatDate(rate.date)}
                      </td>
                      <td style={{ padding: '12px', fontWeight: '500', fontSize: '16px' }}>
                        <span style={{ color: '#28a745', fontSize: '18px' }}>
                          {rate.utilityPercentage}%
                        </span>
                      </td>
                      <td style={{ padding: '12px' }}>
                        {getSourceIcon(rate.source)} {getSourceName(rate.source)}
                      </td>
                      <td style={{ padding: '12px' }}>
                        <span style={{
                          backgroundColor: rate.isActive ? '#d4edda' : '#f8d7da',
                          color: rate.isActive ? '#155724' : '#721c24',
                          padding: '4px 8px',
                          borderRadius: '12px',
                          fontSize: '12px',
                          fontWeight: '500'
                        }}>
                          {rate.isActive ? 'ACTIVO' : 'INACTIVO'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UtilityRates;

