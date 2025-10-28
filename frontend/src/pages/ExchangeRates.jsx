import { useState, useEffect } from 'react';
import api from '../api/http';

const ExchangeRates = () => {
  const [currentRate, setCurrentRate] = useState(null);
  const [history, setHistory] = useState([]);
  const [schedulerStatus, setSchedulerStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [manualRate, setManualRate] = useState({
    fromCurrency: 'USD',
    toCurrency: 'DOP',
    rate: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        loadCurrentRate(),
        loadHistory(),
        loadSchedulerStatus()
      ]);
    } catch (error) {
      console.error('Error cargando datos:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCurrentRate = async () => {
    try {
      const { data } = await api.get('/exchange-rates/current');
      setCurrentRate(data);
    } catch (error) {
      console.error('Error cargando tasa actual:', error);
    }
  };

  const loadHistory = async () => {
    try {
      const { data } = await api.get('/exchange-rates/history?days=30');
      setHistory(data.rates);
    } catch (error) {
      console.error('Error cargando historial:', error);
    }
  };

  const loadSchedulerStatus = async () => {
    try {
      const { data } = await api.get('/exchange-rates/scheduler/status');
      setSchedulerStatus(data);
    } catch (error) {
      console.error('Error cargando estado del scheduler:', error);
    }
  };

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      await api.post('/exchange-rates/refresh');
      await loadCurrentRate();
      alert('Tasa de cambio actualizada exitosamente');
    } catch (error) {
      const msg = error?.response?.data?.message || 'Error actualizando tasa de cambio';
      alert(msg);
    } finally {
      setRefreshing(false);
    }
  };

  const handleManualUpdate = async (e) => {
    e.preventDefault();
    if (!manualRate.rate || parseFloat(manualRate.rate) <= 0) {
      alert('Por favor ingrese una tasa válida');
      return;
    }

    try {
      await api.post('/exchange-rates/update', manualRate);
      setManualRate({ ...manualRate, rate: '' });
      await loadCurrentRate();
      await loadHistory();
      alert('Tasa de cambio actualizada manualmente');
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
      case 'banco_central': return '🏛️';
      case 'api_externa': return '🌐';
      case 'manual': return '✋';
      default: return '📊';
    }
  };

  const getSourceName = (source) => {
    switch (source) {
      case 'banco_central': return 'Banco Central RD';
      case 'api_externa': return 'API Externa';
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
          Administración de Tasas de Cambio
        </h1>
        <p style={{ color: '#6c757d', margin: 0 }}>
          Gestión automática y manual de tasas de cambio DOP/USD
        </p>
      </div>

      {/* Estado del Sistema */}
      {schedulerStatus && (
        <div style={{
          backgroundColor: '#f8f9fa',
          padding: '20px',
          borderRadius: '8px',
          border: '1px solid #e9ecef',
          marginBottom: '24px'
        }}>
          <h3 style={{ color: '#495057', marginBottom: '16px' }}>
            Estado del Sistema
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            <div>
              <div style={{ fontSize: '14px', color: '#6c757d', marginBottom: '4px' }}>Estado</div>
              <div style={{ 
                fontSize: '16px', 
                fontWeight: '600',
                color: schedulerStatus.isRunning ? '#28a745' : '#dc3545'
              }}>
                {schedulerStatus.isRunning ? '🟢 Activo' : '🔴 Inactivo'}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '14px', color: '#6c757d', marginBottom: '4px' }}>Tareas Programadas</div>
              <div style={{ fontSize: '16px', fontWeight: '600', color: '#495057' }}>
                {schedulerStatus.tasksCount}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '14px', color: '#6c757d', marginBottom: '4px' }}>Próxima Actualización</div>
              <div style={{ fontSize: '16px', fontWeight: '600', color: '#495057' }}>
                {schedulerStatus.nextRuns?.[0]?.nextRun ? 
                  formatDate(schedulerStatus.nextRuns[0].nextRun) : 'N/A'
                }
              </div>
            </div>
          </div>
        </div>
      )}

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
                    <div style={{ fontSize: '12px', color: '#6c757d', marginBottom: '6px' }}>Compra (1 {currentRate.fromCurrency} = ? {currentRate.toCurrency})</div>
                    <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#2c3e50' }}>
                      {currentRate.buyRate ?? currentRate.rate}
                    </div>
                  </div>
                  <div style={{
                    backgroundColor: '#f8f9fa',
                    border: '1px solid #e9ecef',
                    borderRadius: '8px',
                    padding: '16px',
                    textAlign: 'center'
                  }}>
                    <div style={{ fontSize: '12px', color: '#6c757d', marginBottom: '6px' }}>Venta (1 {currentRate.fromCurrency} = ? {currentRate.toCurrency})</div>
                    <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#2c3e50' }}>
                      {currentRate.sellRate ?? currentRate.rate}
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
                <button
                  onClick={handleRefresh}
                  disabled={refreshing}
                  style={{
                    width: '100%',
                    padding: '12px',
                    backgroundColor: '#17a2b8',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: refreshing ? 'not-allowed' : 'pointer',
                    opacity: refreshing ? 0.7 : 1
                  }}
                >
                  {refreshing ? 'Actualizando...' : '🔄 Actualizar Ahora'}
                </button>
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
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#495057' }}>
                De
              </label>
              <select
                value={manualRate.fromCurrency}
                onChange={(e) => setManualRate({...manualRate, fromCurrency: e.target.value})}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid #ced4da',
                  borderRadius: '4px',
                  fontSize: '14px'
                }}
              >
                <option value="USD">USD - Dólar Americano</option>
                <option value="EUR">EUR - Euro</option>
              </select>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#495057' }}>
                A
              </label>
              <select
                value={manualRate.toCurrency}
                onChange={(e) => setManualRate({...manualRate, toCurrency: e.target.value})}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid #ced4da',
                  borderRadius: '4px',
                  fontSize: '14px'
                }}
              >
                <option value="DOP">DOP - Peso Dominicano</option>
                <option value="USD">USD - Dólar Americano</option>
              </select>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#495057' }}>
                Tasa de Cambio
              </label>
              <input
                type="number"
                step="0.0001"
                value={manualRate.rate}
                onChange={(e) => setManualRate({...manualRate, rate: e.target.value})}
                placeholder="Ej: 56.50"
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid #ced4da',
                  borderRadius: '4px',
                  fontSize: '14px'
                }}
              />
              <small style={{ color: '#6c757d', fontSize: '12px' }}>
                Ingrese cuántos {manualRate.toCurrency} equivalen a 1 {manualRate.fromCurrency}
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
              ✋ Actualizar Manualmente
            </button>
          </form>
        </div>
      </div>

      {/* Historial */}
      <div style={{ marginTop: '32px' }}>
        <h3 style={{ color: '#495057', marginBottom: '16px' }}>
          Historial de Tasas de Cambio (Últimos 30 días)
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
                      Tasa
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
                    <tr key={rate.id} style={{ borderBottom: '1px solid #e9ecef' }}>
                      <td style={{ padding: '12px' }}>
                        {formatDate(rate.date)}
                      </td>
                      <td style={{ padding: '12px', fontWeight: '500' }}>
                        <div>Ref: 1 {manualRate.fromCurrency} = {rate.rate} {manualRate.toCurrency}</div>
                        {rate.buyRate && <div style={{ color: '#17a2b8', fontSize: '12px' }}>Compra: {rate.buyRate}</div>}
                        {rate.sellRate && <div style={{ color: '#28a745', fontSize: '12px' }}>Venta: {rate.sellRate}</div>}
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

export default ExchangeRates;
