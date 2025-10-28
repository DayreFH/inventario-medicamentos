import { useState, useEffect } from 'react';
import api from '../../api/http';

const PreciosTab = ({ medicines, onRefresh, loading }) => {
  const [selectedMedicine, setSelectedMedicine] = useState('');
  const [precioForm, setPrecioForm] = useState({
    precioCompraUnitario: '',
    margenUtilidad: '',
    precioLimiteDescuento: ''
  });
  const [precios, setPrecios] = useState([]);
  const [saving, setSaving] = useState(false);

  const calcularPrecioVenta = (precioCompra, margenUtilidad) => {
    const margenDecimal = margenUtilidad / 100;
    const factor = 1 - margenDecimal;
    return factor > 0 ? precioCompra / factor : precioCompra;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedMedicine) return;
    
    setSaving(true);
    try {
      const precioVentaUnitario = calcularPrecioVenta(
        parseFloat(precioForm.precioCompraUnitario),
        parseFloat(precioForm.margenUtilidad)
      );
      
      await api.post(`/medicines/${selectedMedicine}/precios`, {
        ...precioForm,
        precioVentaUnitario
      });
      
      setPrecioForm({
        precioCompraUnitario: '',
        margenUtilidad: '',
        precioLimiteDescuento: ''
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

                <div>
                  <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500', color: '#495057' }}>
                    Margen de Utilidad (%) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={precioForm.margenUtilidad}
                    onChange={(e) => setPrecioForm({...precioForm, margenUtilidad: e.target.value})}
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

                <div>
                  <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500', color: '#495057' }}>
                    Precio Límite de Descuento (Opcional)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={precioForm.precioLimiteDescuento}
                    onChange={(e) => setPrecioForm({...precioForm, precioLimiteDescuento: e.target.value})}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid #ced4da',
                      borderRadius: '4px',
                      fontSize: '14px'
                    }}
                  />
                </div>

                {precioForm.precioCompraUnitario && precioForm.margenUtilidad && (
                  <div style={{
                    backgroundColor: '#e3f2fd',
                    padding: '12px',
                    borderRadius: '4px',
                    border: '1px solid #bbdefb'
                  }}>
                    <div style={{ fontSize: '14px', color: '#1976d2', fontWeight: '500' }}>
                      Precio de Venta Calculado: ${calcularPrecioVenta(
                        parseFloat(precioForm.precioCompraUnitario),
                        parseFloat(precioForm.margenUtilidad)
                      ).toFixed(2)}
                    </div>
                  </div>
                )}

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
                      <div>
                        <div style={{ fontSize: '14px', fontWeight: '500', color: '#2c3e50', marginBottom: '4px' }}>
                          Precio #{index + 1}
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '12px' }}>
                          <div>
                            <span style={{ color: '#6c757d' }}>Compra:</span>
                            <span style={{ fontWeight: '500', color: '#dc3545' }}> ${precio.precioCompraUnitario}</span>
                          </div>
                          <div>
                            <span style={{ color: '#6c757d' }}>Margen:</span>
                            <span style={{ fontWeight: '500', color: '#17a2b8' }}> {precio.margenUtilidad}%</span>
                          </div>
                          <div>
                            <span style={{ color: '#6c757d' }}>Venta:</span>
                            <span style={{ fontWeight: '500', color: '#28a745' }}> ${precio.precioVentaUnitario}</span>
                          </div>
                          <div>
                            <span style={{ color: '#6c757d' }}>Límite:</span>
                            <span style={{ fontWeight: '500', color: '#ffc107' }}> 
                              {precio.precioLimiteDescuento ? `$${precio.precioLimiteDescuento}` : 'N/A'}
                            </span>
                          </div>
                        </div>
                      </div>
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
