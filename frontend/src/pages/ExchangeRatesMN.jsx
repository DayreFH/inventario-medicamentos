import { useState, useEffect } from 'react';
import api from '../api/http';

const ExchangeRatesMN = () => {
  const [currentRate, setCurrentRate] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [manualRate, setManualRate] = useState({
    fromCurrency: 'USD',
    toCurrency: 'MN',
    buyRate: '',
    sellRate: ''
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
      const { data } = await api.get('/exchange-rates-mn/current');
      setCurrentRate(data);
    } catch (error) {
      console.error('Error cargando tasa actual:', error);
    }
  };

  const loadHistory = async () => {
    try {
      const { data } = await api.get('/exchange-rates-mn/history?days=30');
      setHistory(data.rates);
    } catch (error) {
      console.error('Error cargando historial:', error);
    }
  };

  const handleManualUpdate = async (e) => {
    e.preventDefault();
    
    // Validación de campos
    if (!manualRate.buyRate || !manualRate.sellRate || 
        parseFloat(manualRate.buyRate) <= 0 || parseFloat(manualRate.sellRate) <= 0) {
      alert('Por favor ingrese tasas válidas para compra y venta');
      return;
    }

    const buyRate = parseFloat(manualRate.buyRate);
    const sellRate = parseFloat(manualRate.sellRate);
    
    // Validar que la tasa de venta sea mayor que la de compra
    if (buyRate >= sellRate) {
      alert('La tasa de venta debe ser mayor que la tasa de compra. Ejemplo: Compra: 25.50, Venta: 26.00');
      return;
    }

    try {
      const response = await api.post('/exchange-rates-mn/update', manualRate);
      
      // Guardar la tasa en localStorage para que esté disponible inmediatamente en las salidas
      const today = new Date().toDateString();
      localStorage.setItem('exchangeRateMN', JSON.stringify({
        date: today,
        rate: sellRate // Usar la tasa de venta
      }));
      
      setManualRate({ ...manualRate, buyRate: '', sellRate: '' });
      await loadCurrentRate();
      await loadHistory();
      
      alert('Tasa de cambio USD-MN actualizada exitosamente');
    } catch (error) {
      const msg = error?.response?.data?.message || error?.response?.data?.error || 'Error actualizando tasa';
      console.error('Error actualizando tasa:', error);
      alert(`Error: ${msg}`);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-CU', {
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
      case 'banco_central': return '🏛️';
      case 'api_externa': return '🌐';
      default: return '📊';
    }
  };

  const getSourceName = (source) => {
    switch (source) {
      case 'manual': return 'Manual';
      case 'banco_central': return 'Banco Central';
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
          Tasa de Cambio USD-MN (Moneda Nacional de Cuba)
        </h1>
        <p style={{ color: '#6c757d', margin: 0 }}>
          Gestión manual de tasas de cambio USD a Moneda Nacional de Cuba
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        {/* Tasa Actual */}
        <div>
          <h3 style={{ color: '#495057', marginBottom: '16px' }}>
            Tasa de Cambio Actual
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
                    <div style={{ fontSize: '12px', color: '#6c757d', marginBottom: '6px' }}>Compra (1 USD = ? MN)</div>
                    <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#2c3e50' }}>
                      {currentRate.buyRate || 'N/A'}
                    </div>
                  </div>
                  <div style={{
                    backgroundColor: '#f8f9fa',
                    border: '1px solid #e9ecef',
                    borderRadius: '8px',
                    padding: '16px',
                    textAlign: 'center'
                  }}>
                    <div style={{ fontSize: '12px', color: '#6c757d', marginBottom: '6px' }}>Venta (1 USD = ? MN)</div>
                    <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#2c3e50' }}>
                      {currentRate.sellRate || 'N/A'}
                    </div>
                  </div>
                </div>
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
                No hay tasa de cambio disponible
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
                Moneda Base
              </label>
              <select
                value={manualRate.fromCurrency}
                disabled
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid #ced4da',
                  borderRadius: '4px',
                  fontSize: '14px',
                  backgroundColor: '#f8f9fa'
                }}
              >
                <option value="USD">USD - Dólar Americano</option>
              </select>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#495057' }}>
                Moneda Destino
              </label>
              <select
                value={manualRate.toCurrency}
                disabled
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid #ced4da',
                  borderRadius: '4px',
                  fontSize: '14px',
                  backgroundColor: '#f8f9fa'
                }}
              >
                <option value="MN">MN - Moneda Nacional de Cuba</option>
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#495057' }}>
                  Tasa de Compra (MN)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={manualRate.buyRate}
                  onChange={(e) => setManualRate({...manualRate, buyRate: e.target.value})}
                  placeholder="Ej: 25.50"
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid #ced4da',
                    borderRadius: '4px',
                    fontSize: '14px'
                  }}
                />
                <small style={{ color: '#6c757d', fontSize: '12px' }}>
                  Cuántos MN por 1 USD (compra)
                </small>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#495057' }}>
                  Tasa de Venta (MN)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={manualRate.sellRate}
                  onChange={(e) => setManualRate({...manualRate, sellRate: e.target.value})}
                  placeholder="Ej: 26.00"
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid #ced4da',
                    borderRadius: '4px',
                    fontSize: '14px'
                  }}
                />
                <small style={{ color: '#6c757d', fontSize: '12px' }}>
                  Cuántos MN por 1 USD (venta)
                </small>
              </div>
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
              ✋ Actualizar Tasa USD-MN
            </button>
          </form>
        </div>
      </div>

      {/* Historial */}
      <div style={{ marginTop: '32px' }}>
        <h3 style={{ color: '#495057', marginBottom: '16px' }}>
          Historial de Tasas USD-MN (Últimos 30 días)
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
                      Tasas (1 USD = ? MN)
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
                        <div style={{ display: 'flex', gap: '16px' }}>
                          <div>
                            <span style={{ color: '#17a2b8', fontSize: '12px' }}>Compra:</span>
                            <span style={{ marginLeft: '4px' }}>{rate.buyRate} MN</span>
                          </div>
                          <div>
                            <span style={{ color: '#28a745', fontSize: '12px' }}>Venta:</span>
                            <span style={{ marginLeft: '4px' }}>{rate.sellRate} MN</span>
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

export default ExchangeRatesMN;


