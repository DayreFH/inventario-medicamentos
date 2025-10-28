import { useState, useEffect } from 'react';
import api from '../api/http';
import DatosTab from '../components/Medicines/DatosTab';
import PreciosTab from '../components/Medicines/PreciosTab';
import ParametrosTab from '../components/Medicines/ParametrosTab';

const Medicines = () => {
  const [activeTab, setActiveTab] = useState('datos');
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadMedicines();
  }, []);

  const loadMedicines = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/medicines');
      setMedicines(data);
    } catch (error) {
      console.error('Error cargando medicamentos:', error);
    } finally {
      setLoading(false);
    }
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
          gap: '8px',
          color: '#6c757d',
          fontSize: '14px'
        }}>
          <span>📊</span>
          <span>{medicines.length} medicamentos registrados</span>
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
          <DatosTab medicines={medicines} onRefresh={loadMedicines} loading={loading} />
        )}
        {activeTab === 'precios' && (
          <PreciosTab medicines={medicines} onRefresh={loadMedicines} loading={loading} />
        )}
        {activeTab === 'parametros' && (
          <ParametrosTab medicines={medicines} onRefresh={loadMedicines} loading={loading} />
        )}
      </div>
    </div>
  );
};

export default Medicines;