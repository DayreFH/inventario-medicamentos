import { useState, useEffect } from 'react';
import api from '../../api/http';

const PreciosTab = ({ medicines, onRefresh, loading }) => {
  const [selectedMedicine, setSelectedMedicine] = useState('');
  const [precioForm, setPrecioForm] = useState({
    precioCompraUnitario: '',
    supplierId: ''
  });
  const [precios, setPrecios] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [saving, setSaving] = useState(false);

  const loadSuppliers = async () => {
    try {
      const { data } = await api.get('/suppliers');
      setSuppliers(data);
    } catch (error) {
      console.error('Error cargando proveedores:', error);
    }
  };

  useEffect(() => {
    loadSuppliers();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedMedicine) return;
    
    setSaving(true);
    try {
      await api.post(`/medicines/${selectedMedicine}/precios`, {
        precioCompraUnitario: precioForm.precioCompraUnitario,
        supplierId: precioForm.supplierId || null
      });
      
      setPrecioForm({
        precioCompraUnitario: '',
        supplierId: ''
      });
      loadPrecios();
    } catch (error) {
      const msg = error?.response?.data?.detail || error?.response?.data?.error || 'Error al guardar precio';
      alert(msg);
    } finally {
      setSaving(false);
    }
  };

  const loadPrecios = async () => {
    if (!selectedMedicine) return;
    try {
      const { data } = await api.get(`/medicines/${selectedMedicine}`);
      setPrecios(data.precios || []);
    } catch (error) {
      console.error('Error cargando precios:', error);
    }
  };

  const handleDelete = async (precioId) => {
    if (!window.confirm('¿Está seguro de que desea desactivar este precio?')) {
      return;
    }
    
    try {
      await api.delete(`/medicines/precios/${precioId}`);
      loadPrecios(); // Recargar la lista
      alert('Precio desactivado exitosamente');
    } catch (error) {
      const msg = error?.response?.data?.detail || error?.response?.data?.error || 'Error al desactivar precio';
      alert(msg);
    }
  };

  useEffect(() => {
    loadPrecios();
  }, [selectedMedicine]);

  return (
    <div style={{ 
      padding: '24px', 
      flex: 1, 
      overflow: 'auto',
      minHeight: '0'
    }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        {/* Formulario de precios */}
        <div>
          <h3 style={{ color: '#495057', marginBottom: '16px' }}>
            Gestión de Precios
          </h3>
          
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#495057' }}>
              Seleccionar Medicamento
            </label>
            <select
              value={selectedMedicine}
              onChange={(e) => setSelectedMedicine(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px',
                border: '1px solid #ced4da',
                borderRadius: '4px',
                fontSize: '14px',
                backgroundColor: 'white'
              }}
            >
              <option value="">Seleccionar medicamento...</option>
              {medicines.map(medicine => (
                <option key={medicine.id} value={medicine.id}>
                  {medicine.codigo} - {medicine.nombreComercial}
                </option>
              ))}
            </select>
          </div>

          {selectedMedicine && (
            <form onSubmit={handleSubmit} style={{
              backgroundColor: '#f8f9fa',
              padding: '20px',
              borderRadius: '8px',
              border: '1px solid #e9ecef'
            }}>
              <div style={{ display: 'grid', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500', color: '#495057' }}>
                    Proveedor (Opcional)
                  </label>
                  <select
                    value={precioForm.supplierId}
                    onChange={(e) => setPrecioForm({...precioForm, supplierId: e.target.value})}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid #ced4da',
                      borderRadius: '4px',
                      fontSize: '14px',
                      backgroundColor: 'white'
                    }}
                  >
                    <option value="">Sin proveedor específico</option>
                    {suppliers.map(supplier => (
                      <option key={supplier.id} value={supplier.id}>
                        {supplier.name}
                      </option>
                    ))}
                  </select>
                  <small style={{ color: '#6c757d', fontSize: '12px', display: 'block', marginTop: '4px' }}>
                    Si no seleccionas un proveedor, el precio será genérico
                  </small>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500', color: '#495057' }}>
                    Precio de Compra Unitario *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={precioForm.precioCompraUnitario}
                    onChange={(e) => setPrecioForm({...precioForm, precioCompraUnitario: e.target.value})}
                    required
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid #ced4da',
                      borderRadius: '4px',
                      fontSize: '14px'
                    }}
                  />
                </div>

                <button
                  type="submit"
                  disabled={saving}
                  style={{
                    width: '100%',
                    padding: '10px 20px',
                    backgroundColor: '#28a745',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: saving ? 'not-allowed' : 'pointer',
                    opacity: saving ? 0.7 : 1
                  }}
                >
                  {saving ? 'Guardando...' : 'Agregar Precio'}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Lista de precios */}
        <div>
          <h3 style={{ color: '#495057', marginBottom: '16px' }}>
            Historial de Precios
          </h3>
          <div style={{
            backgroundColor: '#f8f9fa',
            borderRadius: '8px',
            border: '1px solid #e9ecef',
            maxHeight: '500px',
            overflow: 'auto'
          }}>
            {!selectedMedicine ? (
              <div style={{ padding: '40px', textAlign: 'center', color: '#6c757d' }}>
                Selecciona un medicamento para ver sus precios
              </div>
            ) : precios.length === 0 ? (
              <div style={{ padding: '40px', textAlign: 'center', color: '#6c757d' }}>
                No hay precios registrados para este medicamento
              </div>
            ) : (
              <div style={{ padding: '16px' }}>
                {precios.map((precio, index) => (
                  <div
                    key={precio.id}
                    style={{
                      backgroundColor: 'white',
                      padding: '16px',
                      marginBottom: '12px',
                      borderRadius: '6px',
                      border: '1px solid #e9ecef',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '14px', fontWeight: '500', color: '#2c3e50', marginBottom: '4px' }}>
                          {precio.supplier ? `Proveedor: ${precio.supplier.name}` : 'Precio genérico'}
                        </div>
                        <div style={{ fontSize: '16px', fontWeight: '600', color: '#dc3545', marginBottom: '4px' }}>
                          ${parseFloat(precio.precioCompraUnitario).toFixed(2)}
                        </div>
                        <div style={{ fontSize: '12px', color: '#6c757d' }}>
                          Creado: {new Date(precio.created_at).toLocaleDateString('es-ES')}
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{
                          backgroundColor: precio.activo ? '#d4edda' : '#f8d7da',
                          color: precio.activo ? '#155724' : '#721c24',
                          padding: '4px 8px',
                          borderRadius: '12px',
                          fontSize: '11px',
                          fontWeight: '500'
                        }}>
                          {precio.activo ? 'ACTIVO' : 'INACTIVO'}
                        </div>
                        {precio.activo && (
                          <button
                            onClick={() => handleDelete(precio.id)}
                            style={{
                              backgroundColor: '#dc3545',
                              color: 'white',
                              border: 'none',
                              padding: '6px 12px',
                              borderRadius: '4px',
                              fontSize: '12px',
                              fontWeight: '500',
                              cursor: 'pointer'
                            }}
                          >
                            Eliminar
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PreciosTab;
