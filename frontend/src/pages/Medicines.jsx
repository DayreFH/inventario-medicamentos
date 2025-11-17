import { useState, useEffect } from 'react';
import api from '../api/http';
import DatosTab from '../components/Medicines/DatosTab';
import PreciosTab from '../components/Medicines/PreciosTab';
import ParametrosTab from '../components/Medicines/ParametrosTab';

const Medicines = () => {
  const [activeTab, setActiveTab] = useState('datos');
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false
  });

  useEffect(() => {
    loadMedicines(1);
  }, []);

  const loadMedicines = async (page = 1) => {
    try {
      setLoading(true);
      const { data } = await api.get(`/medicines?page=${page}&limit=20`);
      setMedicines(data.data || data); // Soporta ambos formatos
      setPagination(data.pagination || {
        page: 1,
        limit: 20,
        total: Array.isArray(data) ? data.length : data.data?.length || 0,
        totalPages: 1,
        hasNext: false,
        hasPrev: false
      });
    } catch (error) {
      console.error('Error cargando medicamentos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > pagination.totalPages) return;
    loadMedicines(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const tabs = [
    { id: 'datos', label: 'DATOS', icon: '📋' },
    { id: 'precios', label: 'PRECIOS', icon: '💰' },
    { id: 'parametros', label: 'PARÁMETROS', icon: '⚙️' }
  ];

  return (
    <div style={{ 
      height: '100%', 
      display: 'flex', 
      flexDirection: 'column',
      minHeight: '0'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '24px',
        paddingBottom: '16px',
        borderBottom: '2px solid #e9ecef'
      }}>
        <h1 style={{ 
          margin: 0, 
          color: '#2c3e50',
          fontSize: '28px',
          fontWeight: 'bold'
        }}>
          Gestión de Medicamentos
        </h1>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            color: '#6c757d',
            fontSize: '14px'
          }}>
            <span>📊</span>
            <span>{pagination.total} medicamentos registrados</span>
          </div>
          
          {/* Controles de paginación */}
          {pagination.totalPages > 1 && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 12px',
              backgroundColor: '#f8f9fa',
              borderRadius: '6px',
              border: '1px solid #e9ecef'
            }}>
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={!pagination.hasPrev}
                style={{
                  padding: '6px 12px',
                  backgroundColor: pagination.hasPrev ? '#007bff' : '#e9ecef',
                  color: pagination.hasPrev ? 'white' : '#6c757d',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: pagination.hasPrev ? 'pointer' : 'not-allowed',
                  fontSize: '12px',
                  fontWeight: '500'
                }}
              >
                ← Anterior
              </button>
              <span style={{ fontSize: '13px', color: '#495057', fontWeight: '500' }}>
                Página {pagination.page} de {pagination.totalPages}
              </span>
              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={!pagination.hasNext}
                style={{
                  padding: '6px 12px',
                  backgroundColor: pagination.hasNext ? '#007bff' : '#e9ecef',
                  color: pagination.hasNext ? 'white' : '#6c757d',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: pagination.hasNext ? 'pointer' : 'not-allowed',
                  fontSize: '12px',
                  fontWeight: '500'
                }}
              >
                Siguiente →
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex',
        marginBottom: '24px',
        backgroundColor: '#f8f9fa',
        borderRadius: '8px',
        padding: '4px',
        border: '1px solid #e9ecef'
      }}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              flex: 1,
              padding: '12px 20px',
              border: 'none',
              backgroundColor: activeTab === tab.id ? '#ffffff' : 'transparent',
              color: activeTab === tab.id ? '#1976d2' : '#6c757d',
              fontWeight: activeTab === tab.id ? '600' : '400',
              borderRadius: '6px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              fontSize: '14px',
              transition: 'all 0.2s ease',
              boxShadow: activeTab === tab.id ? '0 2px 4px rgba(0,0,0,0.1)' : 'none'
            }}
            onMouseEnter={(e) => {
              if (activeTab !== tab.id) {
                e.target.style.backgroundColor = '#e9ecef';
                e.target.style.color = '#495057';
              }
            }}
            onMouseLeave={(e) => {
              if (activeTab !== tab.id) {
                e.target.style.backgroundColor = 'transparent';
                e.target.style.color = '#6c757d';
              }
            }}
          >
            <span style={{ fontSize: '16px' }}>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div style={{
        flex: 1,
        backgroundColor: '#ffffff',
        borderRadius: '8px',
        border: '1px solid #e9ecef',
        overflow: 'hidden',
        minHeight: '0',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {activeTab === 'datos' && (
          <DatosTab medicines={medicines} onRefresh={() => loadMedicines(pagination.page)} loading={loading} />
        )}
        {activeTab === 'precios' && (
          <PreciosTab medicines={medicines} onRefresh={() => loadMedicines(pagination.page)} loading={loading} />
        )}
        {activeTab === 'parametros' && (
          <ParametrosTab medicines={medicines} onRefresh={() => loadMedicines(pagination.page)} loading={loading} />
        )}
      </div>
    </div>
  );
};

export default Medicines;