import { useEffect, useState, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../api/http';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

// Registrar componentes de Chart.js
ChartJS.register(ArcElement, Tooltip, Legend);

export default function Dashboard() {
  const [low, setLow] = useState([]);
  const [top, setTop] = useState([]);
  const [supplierSuggestions, setSupplierSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Cargar otras peticiones en paralelo
        const [lowStockResponse, topCustomersResponse, supplierSuggestionsResponse] = await Promise.allSettled([
          api.get('/reports/low-stock'),
          api.get('/reports/top-customers'),
          api.get('/reports/supplier-suggestions')
        ]);
        
        // Procesar respuestas exitosas
        if (lowStockResponse.status === 'fulfilled') {
          setLow(lowStockResponse.value.data);
        } else {
          console.error('❌ Error cargando stock bajo:', lowStockResponse.reason);
        }
        
        if (topCustomersResponse.status === 'fulfilled') {
          setTop(topCustomersResponse.value.data);
        } else {
          console.error('❌ Error cargando top clientes:', topCustomersResponse.reason);
        }
        
        if (supplierSuggestionsResponse.status === 'fulfilled') {
          console.log('📊 Respuesta de sugerencias:', supplierSuggestionsResponse.value.data);
          console.log('📊 Cantidad de sugerencias:', supplierSuggestionsResponse.value.data?.length || 0);
          setSupplierSuggestions(supplierSuggestionsResponse.value.data || []);
        } else {
          console.error('❌ Error cargando sugerencias:', supplierSuggestionsResponse.reason);
          console.error('❌ Error response:', supplierSuggestionsResponse.reason?.response?.data);
          setSupplierSuggestions([]);
        }
        
      } catch (error) {
        console.error('❌ Error cargando datos:', error);
        setSupplierSuggestions([]);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, []);

  // Calcular datos del gráfico de stock usando useMemo
  const stockChartData = useMemo(() => {
    let criticalCount = 0;
    let lowStockCount = 0;
    let regularCount = 0;
    
    for (let i = 0; i < low.length; i++) {
      const m = low[i];
      if (m.stock <= 5) {
        criticalCount++;
      } else if (m.stock > 5 && m.stock <= 10) {
        lowStockCount++;
      } else if (m.stock > 10 && m.stock <= 20) {
        regularCount++;
      }
    }
    
    return {
      labels: ['Crítico (0-5)', 'Bajo (6-10)', 'Regular (11-20)'],
      datasets: [{
        data: [criticalCount, lowStockCount, regularCount],
        backgroundColor: ['#dc3545', '#ff9800', '#ffc107'],
        borderColor: ['#c82333', '#e68900', '#e0a800'],
        borderWidth: 2
      }]
    };
  }, [low]);

  const renderContent = () => {
    switch (location.pathname) {
      case '/best-prices': {
        const hasData = Array.isArray(supplierSuggestions) && supplierSuggestions.length > 0;
        const supplierNames = hasData
          ? supplierSuggestions.map(s => (s.isGeneric ? 'Precio Genérico' : (s.supplier?.name || 'Sin proveedor')))
          : [];
        const uniqueSuppliers = Array.from(new Set(supplierNames));
        const supplierCounts = uniqueSuppliers.map(label =>
          supplierNames.filter(n => n === label).length
        );
        const supplierChartData = {
          labels: uniqueSuppliers,
          datasets: [{
            data: supplierCounts,
            backgroundColor: [
              '#007bff', '#28a745', '#ffc107', '#dc3545', '#17a2b8',
              '#6f42c1', '#e83e8c', '#fd7e14', '#20c997', '#6c757d'
            ],
            borderColor: [
              '#0056b3', '#1e7e34', '#e0a800', '#c82333', '#117a8b',
              '#5a32a3', '#c2185b', '#dc6502', '#17a085', '#5a6268'
            ],
            borderWidth: 2
          }]
        };
        return (
          <div>
            <div style={{ marginBottom: '32px' }}>
              <h1 style={{ color: '#2c3e50', margin: 0, fontSize: '28px', fontWeight: '600', marginBottom: '8px' }}>
                Mejores Precios - Proveedores
              </h1>
              <p style={{ color: '#6c757d', margin: 0 }}>
                Sugerencias de proveedores según mejores precios disponibles
              </p>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: hasData ? '1fr 400px' : '1fr',
              gap: '24px',
              alignItems: 'start'
            }}>
              <div style={{
                backgroundColor: '#f8f9fa',
                padding: '20px',
                borderRadius: '8px',
                border: '1px solid #e9ecef'
              }}>
                {loading ? (
                  <div style={{ padding: '40px', textAlign: 'center', color: '#6c757d' }}>
                    Cargando sugerencias...
                  </div>
                ) : !hasData ? (
                  <div style={{ padding: '40px', textAlign: 'center', color: '#6c757d' }}>
                    No hay precios configurados para generar sugerencias
                  </div>
                ) : (
                  <div style={{
                    backgroundColor: 'white',
                    borderRadius: '6px',
                    overflow: 'hidden',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                  }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr style={{ backgroundColor: '#f8f9fa' }}>
                          <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#495057' }}>Medicamento</th>
                          <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#495057' }}>Stock</th>
                          <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#495057' }}>Mejor Precio (DOP)</th>
                          <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#495057' }}>Proveedor</th>
                          <th style={{ padding: '12px', textAlign: 'center', fontWeight: '600', color: '#495057' }}>Acción</th>
                        </tr>
                      </thead>
                      <tbody>
                        {supplierSuggestions.map(s => (
                          <tr key={s.medicineId} style={{ borderBottom: '1px solid #e9ecef' }}>
                            <td style={{ padding: '12px' }}>
                              <div style={{ fontWeight: '500', color: '#2c3e50' }}>{s.medicineCode}</div>
                              <div style={{ fontSize: '12px', color: '#6c757d', marginTop: '2px' }}>{s.medicineName}</div>
                            </td>
                            <td style={{ padding: '12px' }}>
                              <span style={{
                                color: s.stock <= 10 ? '#dc3545' : s.stock <= 50 ? '#ff9800' : '#28a745',
                                fontWeight: '600'
                              }}>{s.stock}</span>
                            </td>
                            <td style={{ padding: '12px' }}>
                              <div style={{ fontWeight: '600', color: '#28a745', fontSize: '16px' }}>
                                ${Number(s.bestPrice || 0).toFixed(2)} DOP
                              </div>
                            </td>
                            <td style={{ padding: '12px' }}>
                              {s.isGeneric ? (
                                <span style={{
                                  backgroundColor: '#fff3cd', color: '#856404', padding: '4px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: '500'
                                }}>Precio Genérico</span>
                              ) : (
                                <div style={{ fontWeight: '500', color: '#2c3e50' }}>{s.supplier?.name || 'Sin proveedor'}</div>
                              )}
                            </td>
                            <td style={{ padding: '12px', textAlign: 'center' }}>
                              <button
                                onClick={() => {
                                  const params = new URLSearchParams({
                                    medicineId: String(s.medicineId || ''),
                                    supplierId: s.supplier?.id ? String(s.supplier.id) : '',
                                    priceId: String(s.bestPriceId || '')
                                  });
                                  window.location.href = `/receipts?${params.toString()}`;
                                }}
                                style={{
                                  padding: '6px 12px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', fontSize: '12px', fontWeight: '500', cursor: 'pointer'
                                }}
                                onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#0056b3')}
                                onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#007bff')}
                              >
                                ➕ Crear Entrada
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {hasData && (
                <div style={{
                  backgroundColor: '#ffffff',
                  borderRadius: '8px',
                  border: '1px solid #e9ecef',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                  padding: '24px',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  flexDirection: 'column',
                  position: 'sticky',
                  top: '24px'
                }}>
                  <h3 style={{ color: '#495057', marginBottom: '20px', fontSize: '16px', fontWeight: '600', textAlign: 'center' }}>
                    Distribución de Sugerencias por Proveedor
                  </h3>
                  <div style={{ width: '350px', height: '350px' }}>
                    <Doughnut
                      data={supplierChartData}
                      options={{
                        responsive: true,
                        maintainAspectRatio: true,
                        plugins: {
                          legend: {
                            position: 'bottom',
                            labels: { padding: 15, font: { size: 12 } }
                          },
                          tooltip: {
                            callbacks: {
                              label: function(context) {
                                const label = context.label || '';
                                const value = context.parsed || 0;
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                                return `${label}: ${value} (${percentage}%)`;
                              }
                            }
                          }
                        }
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      }
      case '/top-customers': {
        const hasTop = Array.isArray(top) && top.length > 0;
        const top10 = hasTop ? top.slice(0, 10) : [];
        const others = hasTop ? top.slice(10).reduce((sum, c) => sum + Number(c.total_qty || 0), 0) : 0;
        const customerLabels = top10.map(c => c.name).concat(others > 0 ? ['Otros'] : []);
        const customerData = top10.map(c => Number(c.total_qty || 0)).concat(others > 0 ? [others] : []);
        const customerChartData = {
          labels: customerLabels,
          datasets: [{
            data: customerData,
            backgroundColor: [
              '#ffd700', '#c0c0c0', '#cd7f32', '#007bff', '#28a745',
              '#ffc107', '#dc3545', '#17a2b8', '#6f42c1', '#e83e8c', '#6c757d'
            ],
            borderColor: [
              '#e6c200', '#a8a8a8', '#b8741f', '#0056b3', '#1e7e34',
              '#e0a800', '#c82333', '#117a8b', '#5a32a3', '#c2185b', '#5a6268'
            ],
            borderWidth: 2
          }]
        };
        return (
          <div>
            <div style={{ marginBottom: '32px' }}>
              <h1 style={{ color: '#2c3e50', margin: 0, fontSize: '28px', fontWeight: '600', marginBottom: '8px' }}>
                Principales Clientes
              </h1>
              <p style={{ color: '#6c757d', margin: 0 }}>
                Ranking de clientes por cantidad total de compras
              </p>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: hasTop ? '1fr 400px' : '1fr',
              gap: '24px',
              alignItems: 'start'
            }}>
              <div style={{
                backgroundColor: '#ffffff',
                borderRadius: '8px',
                border: '1px solid #e9ecef',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}>
                <div style={{ padding: '20px', borderBottom: '1px solid #e9ecef', backgroundColor: '#f8f9fa' }}>
                  <h3 style={{ color: '#495057', margin: 0, fontSize: '18px', fontWeight: '600' }}>Clientes que Más Compran</h3>
                </div>
                {loading ? (
                  <div style={{ padding: '40px', textAlign: 'center', color: '#6c757d' }}>Cargando datos de clientes...</div>
                ) : !hasTop ? (
                  <div style={{ padding: '40px', textAlign: 'center', color: '#6c757d' }}>Aún no hay ventas registradas</div>
                ) : (
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ backgroundColor: '#f8f9fa' }}>
                        <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#495057' }}>Ranking</th>
                        <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#495057' }}>Cliente</th>
                        <th style={{ padding: '12px', textAlign: 'right', fontWeight: '600', color: '#495057' }}>Cantidad Total</th>
                        <th style={{ padding: '12px', textAlign: 'center', fontWeight: '600', color: '#495057' }}>Medalla</th>
                      </tr>
                    </thead>
                    <tbody>
                      {top.map((c, i) => (
                        <tr key={c.id || i} style={{ borderBottom: '1px solid #e9ecef' }}>
                          <td style={{ padding: '12px' }}>#{i + 1}</td>
                          <td style={{ padding: '12px' }}>{c.name}</td>
                          <td style={{ padding: '12px', textAlign: 'right' }}>{Number(c.total_qty || 0).toLocaleString('es-ES')}</td>
                          <td style={{ padding: '12px', textAlign: 'center' }}>
                            {i === 0 && <span style={{ fontSize: '20px' }}>🥇</span>}
                            {i === 1 && <span style={{ fontSize: '20px' }}>🥈</span>}
                            {i === 2 && <span style={{ fontSize: '20px' }}>🥉</span>}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>

              {hasTop && (
                <div style={{
                  backgroundColor: '#ffffff',
                  borderRadius: '8px',
                  border: '1px solid #e9ecef',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                  padding: '24px',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  flexDirection: 'column',
                  position: 'sticky',
                  top: '24px'
                }}>
                  <h3 style={{ color: '#495057', marginBottom: '20px', fontSize: '16px', fontWeight: '600', textAlign: 'center' }}>
                    Distribución de Ventas por Cliente (Top 10)
                  </h3>
                  <div style={{ width: '350px', height: '350px' }}>
                    <Doughnut
                      data={customerChartData}
                      options={{
                        responsive: true,
                        maintainAspectRatio: true,
                        plugins: {
                          legend: { position: 'bottom', labels: { padding: 15, font: { size: 12 }, usePointStyle: true } },
                          tooltip: {
                            callbacks: {
                              label: function(context) {
                                const label = context.label || '';
                                const value = context.parsed || 0;
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                                return `${label}: ${value.toLocaleString('es-ES')} (${percentage}%)`;
                              }
                            }
                          }
                        }
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      }
      default: {
        const hasLow = Array.isArray(low) && low.length > 0;
        return (
          <div>
            <div style={{ marginBottom: '32px' }}>
              <h1 style={{ color: '#2c3e50', margin: 0, fontSize: '28px', fontWeight: '600', marginBottom: '8px' }}>
                Alertas de Stock Bajo
              </h1>
              <p style={{ color: '#6c757d', margin: 0 }}>
                Medicamentos que requieren atención inmediata por stock bajo
              </p>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: hasLow ? '1fr 400px' : '1fr',
              gap: '24px',
              alignItems: 'start'
            }}>
              <div style={{
                backgroundColor: '#ffffff',
                borderRadius: '8px',
                border: '1px solid #e9ecef',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}>
                <div style={{ padding: '20px', borderBottom: '1px solid #e9ecef', backgroundColor: '#f8f9fa' }}>
                  <h3 style={{ color: '#495057', margin: 0, fontSize: '18px', fontWeight: '600' }}>Alertas</h3>
                </div>

                {loading ? (
                  <div style={{ padding: '40px', textAlign: 'center', color: '#6c757d' }}>Cargando alertas de stock...</div>
                ) : !hasLow ? (
                  <div style={{ padding: '40px', textAlign: 'center', color: '#6c757d' }}>
                    <div style={{ fontSize: '48px', marginBottom: '16px' }}>✅</div>
                    <h3 style={{ color: '#28a745', marginBottom: '8px', fontWeight: '600' }}>Sin alertas de stock bajo</h3>
                    <p style={{ color: '#6c757d', fontSize: '14px' }}>Todos los medicamentos tienen stock suficiente</p>
                  </div>
                ) : (
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ backgroundColor: '#f8f9fa' }}>
                        <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#495057', borderBottom: '2px solid #dee2e6' }}>Medicamento</th>
                        <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#495057', borderBottom: '2px solid #dee2e6' }}>Stock Actual</th>
                        <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#495057', borderBottom: '2px solid #dee2e6' }}>Stock Mínimo</th>
                        <th style={{ padding: '12px', textAlign: 'center', fontWeight: '600', color: '#495057', borderBottom: '2px solid #dee2e6' }}>Estado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {low.map(m => (
                        <tr key={m.id} style={{ borderBottom: '1px solid #e9ecef' }}>
                          <td style={{ padding: '12px' }}>
                            <div style={{ fontWeight: '500', color: '#2c3e50', fontSize: '15px' }}>{m.nombreComercial || m.name || 'Sin nombre'}</div>
                            {m.codigo && (
                              <div style={{ fontSize: '12px', color: '#6c757d', marginTop: '2px' }}>Código: {m.codigo}</div>
                            )}
                          </td>
                          <td style={{ padding: '12px' }}>
                            <span style={{ color: '#dc3545', fontWeight: '700', fontSize: '16px' }}>{m.stock}</span>
                          </td>
                          <td style={{ padding: '12px' }}>
                            <span style={{ color: '#6c757d', fontWeight: '500' }}>{m.min_stock || m.stockMinimo || 'N/A'}</span>
                          </td>
                          <td style={{ padding: '12px', textAlign: 'center' }}>
                            <span style={{
                              backgroundColor: '#dc3545', color: 'white', padding: '6px 12px', borderRadius: '12px', fontSize: '12px', fontWeight: '600'
                            }}>⚠️ CRÍTICO</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>

              {hasLow && (
                <div style={{
                  backgroundColor: '#ffffff',
                  borderRadius: '8px',
                  border: '1px solid #e9ecef',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                  padding: '24px',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  flexDirection: 'column',
                  position: 'sticky',
                  top: '24px'
                }}>
                  <h3 style={{ color: '#495057', marginBottom: '20px', fontSize: '16px', fontWeight: '600', textAlign: 'center' }}>
                    Distribución de Alertas por Nivel de Stock
                  </h3>
                  <div style={{ width: '350px', height: '350px' }}>
                    <Doughnut
                      data={stockChartData}
                      options={{
                        responsive: true,
                        maintainAspectRatio: true,
                        plugins: {
                          legend: { position: 'bottom', labels: { padding: 15, font: { size: 12 } } },
                          tooltip: {
                            callbacks: {
                              label: function(context) {
                                const label = context.label || '';
                                const value = context.parsed || 0;
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                                return `${label}: ${value} (${percentage}%)`;
                              }
                            }
                          }
                        }
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      }
    }
  };

  return (
    <div>
      {renderContent()}
    </div>
  );
}
