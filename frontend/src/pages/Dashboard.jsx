import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../api/http';

export default function Dashboard() {
  const [low, setLow] = useState([]);
  const [top, setTop] = useState([]);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [lowStockResponse, topCustomersResponse] = await Promise.all([
          api.get('/reports/low-stock'),
          api.get('/reports/top-customers')
        ]);
        setLow(lowStockResponse.data);
        setTop(topCustomersResponse.data);
      } catch (error) {
        console.error('Error cargando datos:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, []);

  const renderContent = () => {
    switch (location.pathname) {
      case '/top-customers':
        return (
          <div>
            <h2 style={{ color: '#2c3e50', marginBottom: '24px' }}>Clientes que Más Compran</h2>
            <div style={{
              backgroundColor: '#f8f9fa',
              padding: '20px',
              borderRadius: '8px',
              border: '1px solid #e9ecef'
            }}>
              <table style={{
                width: '100%',
                borderCollapse: 'collapse',
                backgroundColor: 'white',
                borderRadius: '6px',
                overflow: 'hidden',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
              }}>
                <thead>
                  <tr style={{ backgroundColor: '#f8f9fa' }}>
                    <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#495057' }}>Cliente</th>
                    <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#495057' }}>Cantidad Total</th>
                    <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#495057' }}>Ranking</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan={3} style={{ padding: '20px', textAlign: 'center' }}>Cargando...</td></tr>
                  ) : top.length === 0 ? (
                    <tr><td colSpan={3} style={{ padding: '20px', textAlign: 'center', color: '#6c757d' }}>Aún no hay ventas</td></tr>
                  ) : (
                    top.map((c, i) => (
                      <tr key={i} style={{ borderBottom: '1px solid #e9ecef' }}>
                        <td style={{ padding: '12px' }}>{c.name}</td>
                        <td style={{ padding: '12px', fontWeight: '600', color: '#28a745' }}>{c.total_qty}</td>
                        <td style={{ padding: '12px' }}>
                          <span style={{
                            backgroundColor: i < 3 ? '#ffc107' : '#6c757d',
                            color: i < 3 ? '#000' : '#fff',
                            padding: '4px 8px',
                            borderRadius: '12px',
                            fontSize: '12px',
                            fontWeight: '600'
                          }}>
                            #{i + 1}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        );

      case '/reports':
        return (
          <div>
            <h2 style={{ color: '#2c3e50', marginBottom: '24px' }}>Otros Informes</h2>
            <div style={{
              backgroundColor: '#f8f9fa',
              padding: '40px',
              borderRadius: '8px',
              border: '1px solid #e9ecef',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>📊</div>
              <h3 style={{ color: '#6c757d', marginBottom: '8px' }}>Informes Avanzados</h3>
              <p style={{ color: '#6c757d' }}>Esta sección estará disponible próximamente con reportes detallados y análisis avanzados.</p>
            </div>
          </div>
        );

      default:
        return (
          <div>
            <h2 style={{ color: '#2c3e50', marginBottom: '24px' }}>Panel de Datos - Alertas de Stock Bajo</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
              <section>
                <h3 style={{ color: '#495057', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '20px' }}>⚠️</span>
                  Alertas de Bajo Stock
                </h3>
                <div style={{
                  backgroundColor: '#f8f9fa',
                  padding: '20px',
                  borderRadius: '8px',
                  border: '1px solid #e9ecef'
                }}>
                  <table style={{
                    width: '100%',
                    borderCollapse: 'collapse',
                    backgroundColor: 'white',
                    borderRadius: '6px',
                    overflow: 'hidden',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                  }}>
                    <thead>
                      <tr style={{ backgroundColor: '#f8f9fa' }}>
                        <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#495057' }}>Medicamento</th>
                        <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#495057' }}>Stock Actual</th>
                        <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#495057' }}>Stock Mínimo</th>
                        <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#495057' }}>Estado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loading ? (
                        <tr><td colSpan={4} style={{ padding: '20px', textAlign: 'center' }}>Cargando...</td></tr>
                      ) : low.length === 0 ? (
                        <tr>
                          <td colSpan={4} style={{ padding: '20px', textAlign: 'center', color: '#28a745', fontWeight: '600' }}>
                            🎉 Sin alertas de stock bajo
                          </td>
                        </tr>
                      ) : (
                        low.map(m => (
                          <tr key={m.id} style={{ borderBottom: '1px solid #e9ecef' }}>
                            <td style={{ padding: '12px', fontWeight: '500' }}>{m.name}</td>
                            <td style={{ padding: '12px', color: '#dc3545', fontWeight: '600' }}>{m.stock}</td>
                            <td style={{ padding: '12px' }}>{m.min_stock}</td>
                            <td style={{ padding: '12px' }}>
                              <span style={{
                                backgroundColor: '#dc3545',
                                color: 'white',
                                padding: '4px 8px',
                                borderRadius: '12px',
                                fontSize: '12px',
                                fontWeight: '600'
                              }}>
                                CRÍTICO
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </section>
              
              <section>
                <h3 style={{ color: '#495057', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '20px' }}>🏆</span>
                  Top Clientes
                </h3>
                <div style={{
                  backgroundColor: '#f8f9fa',
                  padding: '20px',
                  borderRadius: '8px',
                  border: '1px solid #e9ecef'
                }}>
                  <table style={{
                    width: '100%',
                    borderCollapse: 'collapse',
                    backgroundColor: 'white',
                    borderRadius: '6px',
                    overflow: 'hidden',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                  }}>
                    <thead>
                      <tr style={{ backgroundColor: '#f8f9fa' }}>
                        <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#495057' }}>Cliente</th>
                        <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#495057' }}>Cantidad</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loading ? (
                        <tr><td colSpan={2} style={{ padding: '20px', textAlign: 'center' }}>Cargando...</td></tr>
                      ) : top.length === 0 ? (
                        <tr><td colSpan={2} style={{ padding: '20px', textAlign: 'center', color: '#6c757d' }}>Aún no hay ventas</td></tr>
                      ) : (
                        top.slice(0, 5).map((c, i) => (
                          <tr key={i} style={{ borderBottom: '1px solid #e9ecef' }}>
                            <td style={{ padding: '12px' }}>{c.name}</td>
                            <td style={{ padding: '12px', fontWeight: '600', color: '#28a745' }}>{c.total_qty}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </section>
            </div>
          </div>
        );
    }
  };

  return (
    <div>
      {renderContent()}
    </div>
  );
}