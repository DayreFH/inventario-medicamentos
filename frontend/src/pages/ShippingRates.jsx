import { useState, useEffect } from 'react';
import api from '../api/http';

const ShippingRates = () => {
  const [currentRate, setCurrentRate] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [manualRate, setManualRate] = useState({
    fromCurrency: 'USD',
    toCurrency: 'DOP',
    domesticRate: '', // Tasa nacional
    internationalRate: '', // Tasa internacional
    weight: '', // Peso en kg
    description: ''
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
      const { data } = await api.get('/shipping-rates/current');
      setCurrentRate(data);
    } catch (error) {
      console.error('Error cargando tasa actual:', error);
    }
  };

  const loadHistory = async () => {
    try {
      const { data } = await api.get('/shipping-rates/history?days=30');
      setHistory(data.rates);
    } catch (error) {
      console.error('Error cargando historial:', error);
    }
  };

  const handleManualUpdate = async (e) => {
    e.preventDefault();
    if (!manualRate.domesticRate || !manualRate.internationalRate || 
        !manualRate.weight || parseFloat(manualRate.domesticRate) <= 0 || 
        parseFloat(manualRate.internationalRate) <= 0 || parseFloat(manualRate.weight) <= 0) {
      alert('Por favor complete todos los campos con valores válidos');
      return;
    }

    try {
      await api.post('/shipping-rates/update', {
        domesticRate: manualRate.domesticRate,
        internationalRate: manualRate.internationalRate,
        weight: manualRate.weight,
        description: manualRate.description,
        source: 'manual'
      });
      setManualRate({ 
        ...manualRate, 
        domesticRate: '', 
        internationalRate: '', 
        weight: '',
        description: ''
      });
      await loadCurrentRate();
      await loadHistory();
      alert('Tasa de envío actualizada exitosamente');
    } catch (error) {
      const msg = error?.response?.data?.message || 'Error actualizando tasa';
      alert(msg);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-DO', {
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
      case 'carrier': return '🚚';
      case 'api_externa': return '🌐';
      default: return '📦';
    }
  };

  const getSourceName = (source) => {
    switch (source) {
      case 'manual': return 'Manual';
      case 'carrier': return 'Transportista';
      case 'api_externa': return 'API Externa';
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
          Tasa de Envío
        </h1>
        <p style={{ color: '#6c757d', margin: 0 }}>
          Gestión manual de tasas de envío nacional e internacional
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        {/* Tasa Actual */}
        <div>
          <h3 style={{ color: '#495057', marginBottom: '16px' }}>
            Tasas de Envío Actuales
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
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '16px',
                  marginBottom: '16px'
                }}>
                  <div style={{
                    backgroundColor: '#f8f9fa',
                    border: '1px solid #e9ecef',
                    borderRadius: '8px',
                    padding: '16px',
                    textAlign: 'center'
                  }}>
                    <div style={{ fontSize: '12px', color: '#6c757d', marginBottom: '6px' }}>Envío Nacional</div>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#2c3e50' }}>
                      ${currentRate.domesticRate}
                    </div>
                    <div style={{ fontSize: '10px', color: '#6c757d' }}>por {currentRate.weight}kg</div>
                  </div>
                  <div style={{
                    backgroundColor: '#f8f9fa',
                    border: '1px solid #e9ecef',
                    borderRadius: '8px',
                    padding: '16px',
                    textAlign: 'center'
                  }}>
                    <div style={{ fontSize: '12px', color: '#6c757d', marginBottom: '6px' }}>Envío Internacional</div>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#2c3e50' }}>
                      ${currentRate.internationalRate}
                    </div>
                    <div style={{ fontSize: '10px', color: '#6c757d' }}>por {currentRate.weight}kg</div>
                  </div>
                </div>
                
                {currentRate.description && (
                  <div style={{
                    backgroundColor: '#e3f2fd',
                    border: '1px solid #bbdefb',
                    borderRadius: '6px',
                    padding: '12px',
                    marginBottom: '16px'
                  }}>
                    <div style={{ fontSize: '12px', color: '#1976d2', fontWeight: '600', marginBottom: '4px' }}>
                      Descripción:
                    </div>
                    <div style={{ fontSize: '14px', color: '#1976d2' }}>
                      {currentRate.description}
                    </div>
                  </div>
                )}

                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  marginBottom: '16px',
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
                No hay tasas de envío configuradas
              </div>
            )}
          </div>
        </div>

        {/* Actualización Manual */}
        <div>
          <h3 style={{ color: '#495057', marginBottom: '16px' }}>
            Configurar Tasas de Envío
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
                Peso de Referencia (kg)
              </label>
              <input
                type="number"
                step="0.1"
                value={manualRate.weight}
                onChange={(e) => setManualRate({...manualRate, weight: e.target.value})}
                placeholder="Ej: 1.0"
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid #ced4da',
                  borderRadius: '4px',
                  fontSize: '14px'
                }}
              />
              <small style={{ color: '#6c757d', fontSize: '12px' }}>
                Peso base para calcular las tasas
              </small>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#495057' }}>
                  Envío Nacional (USD)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={manualRate.domesticRate}
                  onChange={(e) => setManualRate({...manualRate, domesticRate: e.target.value})}
                  placeholder="Ej: 5.00"
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid #ced4da',
                    borderRadius: '4px',
                    fontSize: '14px'
                  }}
                />
                <small style={{ color: '#6c757d', fontSize: '12px' }}>
                  Costo por envío nacional
                </small>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#495057' }}>
                  Envío Internacional (USD)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={manualRate.internationalRate}
                  onChange={(e) => setManualRate({...manualRate, internationalRate: e.target.value})}
                  placeholder="Ej: 15.00"
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid #ced4da',
                    borderRadius: '4px',
                    fontSize: '14px'
                  }}
                />
                <small style={{ color: '#6c757d', fontSize: '12px' }}>
                  Costo por envío internacional
                </small>
              </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#495057' }}>
                Descripción (Opcional)
              </label>
              <textarea
                value={manualRate.description}
                onChange={(e) => setManualRate({...manualRate, description: e.target.value})}
                placeholder="Ej: Tasas aplicables para envíos de medicamentos..."
                rows="3"
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid #ced4da',
                  borderRadius: '4px',
                  fontSize: '14px',
                  resize: 'vertical'
                }}
              />
            </div>

            <button
              type="submit"
              style={{
                width: '100%',
                padding: '12px',
                backgroundColor: '#17a2b8',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer'
              }}
            >
              📦 Actualizar Tasas de Envío
            </button>
          </form>
        </div>
      </div>

      {/* Historial */}
      <div style={{ marginTop: '32px' }}>
        <h3 style={{ color: '#495057', marginBottom: '16px' }}>
          Historial de Tasas de Envío (Últimos 30 días)
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
                      Peso
                    </th>
                    <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#495057' }}>
                      Tasas (USD)
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
                      <td style={{ padding: '12px', fontWeight: '500' }}>
                        {rate.weight} kg
                      </td>
                      <td style={{ padding: '12px', fontWeight: '500' }}>
                        <div style={{ display: 'flex', gap: '16px' }}>
                          <div>
                            <span style={{ color: '#17a2b8', fontSize: '12px' }}>Nacional:</span>
                            <span style={{ marginLeft: '4px' }}>${rate.domesticRate}</span>
                          </div>
                          <div>
                            <span style={{ color: '#28a745', fontSize: '12px' }}>Internacional:</span>
                            <span style={{ marginLeft: '4px' }}>${rate.internationalRate}</span>
                          </div>
                        </div>
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
                          {rate.isActive ? 'ACTIVA' : 'INACTIVA'}
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

export default ShippingRates;



