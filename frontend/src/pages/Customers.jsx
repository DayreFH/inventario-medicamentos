import { useEffect, useState } from 'react';
import api from '../api/http';

// Lista de países con prefijos telefónicos
const countries = [
  { code: 'DO-809', name: 'República Dominicana (809)', prefix: '+1-809' },
  { code: 'DO-829', name: 'República Dominicana (829)', prefix: '+1-829' },
  { code: 'DO-849', name: 'República Dominicana (849)', prefix: '+1-849' },
  { code: 'CU', name: 'Cuba', prefix: '+53' },
  { code: 'US', name: 'Estados Unidos', prefix: '+1' },
  { code: 'MX', name: 'México', prefix: '+52' },
  { code: 'CO', name: 'Colombia', prefix: '+57' },
  { code: 'PE', name: 'Perú', prefix: '+51' },
  { code: 'AR', name: 'Argentina', prefix: '+54' },
  { code: 'CL', name: 'Chile', prefix: '+56' },
  { code: 'ES', name: 'España', prefix: '+34' },
  { code: 'PA', name: 'Panamá', prefix: '+507' },
  { code: 'CR', name: 'Costa Rica', prefix: '+506' },
  { code: 'VE', name: 'Venezuela', prefix: '+58' },
  { code: 'EC', name: 'Ecuador', prefix: '+593' },
  { code: 'GT', name: 'Guatemala', prefix: '+502' },
  { code: 'HN', name: 'Honduras', prefix: '+504' },
  { code: 'NI', name: 'Nicaragua', prefix: '+505' },
  { code: 'SV', name: 'El Salvador', prefix: '+503' },
  { code: 'BO', name: 'Bolivia', prefix: '+591' },
  { code: 'UY', name: 'Uruguay', prefix: '+598' },
  { code: 'PY', name: 'Paraguay', prefix: '+595' }
];

export default function Customers() {
  const [list, setList] = useState([]);
  const [form, setForm] = useState({ name: '', phone: '', email: '', countryCode: 'DO-809' });
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(false);

  // edición
  const [editId, setEditId] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', phone: '', email: '', countryCode: 'DO-809' });

  const load = async (query = '') => {
    setLoading(true);
    try {
      const { data } = await api.get('/customers', { params: query ? { q: query } : {} });
      setList(data);
    } catch {
      alert('No se pudo cargar la lista de clientes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  // Función para obtener el prefijo del país seleccionado
  const getPrefix = (countryCode) => {
    const country = countries.find(c => c.code === countryCode);
    return country ? country.prefix : '';
  };

  // Función para combinar prefijo + número
  const combinePhone = (prefix, number) => {
    if (!number || !number.trim()) return null;
    const cleanNumber = number.trim();
    // Si ya tiene el prefijo, no agregarlo de nuevo
    if (cleanNumber.startsWith('+')) return cleanNumber;
    return prefix ? `${prefix} ${cleanNumber}` : cleanNumber;
  };

  // Función para extraer país y número del teléfono guardado
  const parsePhone = (phone) => {
    if (!phone) return { countryCode: 'DO-809', number: '' };
    
    // Normalizar el prefijo (quitar espacios y guiones)
    const normalizedPhone = phone.trim();
    
    // Primero buscar prefijos específicos de República Dominicana (809, 829, 849)
    const dominicanPrefixes = ['+1-809', '+1-829', '+1-849', '+1809', '+1829', '+1849'];
    for (let i = 0; i < dominicanPrefixes.length; i++) {
      const prefix = dominicanPrefixes[i];
      const phoneWithoutSpaces = normalizedPhone.replace(/\s|-/g, '');
      const prefixWithoutSpaces = prefix.replace(/\s|-/g, '');
      
      if (phoneWithoutSpaces.startsWith(prefixWithoutSpaces)) {
        const code = i === 0 || i === 3 ? 'DO-809' : (i === 1 || i === 4 ? 'DO-829' : 'DO-849');
        const number = normalizedPhone.replace(/\+1[-]?(809|829|849)/, '').trim();
        return { countryCode: code, number };
      }
      
      if (normalizedPhone.startsWith(prefix)) {
        const code = i === 0 || i === 3 ? 'DO-809' : (i === 1 || i === 4 ? 'DO-829' : 'DO-849');
        const number = normalizedPhone.substring(prefix.length).trim();
        return { countryCode: code, number };
      }
    }
    
    // Buscar otros países
    for (const country of countries) {
      // Normalizar el prefijo del país para comparar
      const normalizedPrefix = country.prefix.replace(/\s|-/g, '');
      const phoneWithoutSpaces = normalizedPhone.replace(/\s|-/g, '');
      
      if (phoneWithoutSpaces.startsWith(normalizedPrefix)) {
        // Extraer el número removiendo el prefijo
        const number = normalizedPhone.substring(country.prefix.length).trim();
        return { countryCode: country.code, number };
      }
      
      // También verificar si solo comienza con el código del país
      if (normalizedPhone.startsWith(country.prefix)) {
        const number = normalizedPhone.substring(country.prefix.length).trim();
        return { countryCode: country.code, number };
      }
    }
    
    // Si no encuentra prefijo, asumir país por defecto (República Dominicana 809)
    return { countryCode: 'DO-809', number: phone };
  };

  const save = async (e) => {
    e.preventDefault();
    const name = form.name.trim();
    if (!name) return alert('El nombre es obligatorio');
    try {
      const prefix = getPrefix(form.countryCode);
      const fullPhone = combinePhone(prefix, form.phone);
      
      await api.post('/customers', { 
        name, 
        phone: fullPhone,
        email: form.email?.trim() || null
      });
      setForm({ name: '', phone: '', email: '', countryCode: 'DO-809' });
      await load(q);
    } catch (e) {
      alert(e?.response?.data?.error || e?.response?.data?.detail || 'No se pudo crear el cliente');
    }
  };

  const startEdit = (c) => {
    setEditId(c.id);
    const phoneData = parsePhone(c.phone);
    setEditForm({ 
      name: c.name, 
      phone: phoneData.number, 
      email: c.email || '',
      countryCode: phoneData.countryCode
    });
  };

  const cancelEdit = () => {
    setEditId(null);
    setEditForm({ name: '', phone: '', email: '', countryCode: 'DO-809' });
  };

  const saveEdit = async (id) => {
    const name = editForm.name.trim();
    if (!name) return alert('El nombre es obligatorio');
    try {
      const prefix = getPrefix(editForm.countryCode);
      const fullPhone = combinePhone(prefix, editForm.phone);
      
      await api.put(`/customers/${id}`, { 
        name, 
        phone: fullPhone,
        email: editForm.email?.trim() || null
      });
      cancelEdit();
      await load(q);
    } catch (e) {
      alert(e?.response?.data?.error || e?.response?.data?.detail || 'No se pudo actualizar');
    }
  };

  const remove = async (id) => {
    if (!confirm('¿Eliminar este cliente?')) return;
    try {
      await api.delete(`/customers/${id}`);
      await load(q);
    } catch (e) {
      alert(e?.response?.data?.detail || e?.response?.data?.error || 'No se pudo eliminar');
    }
  };

  const onSearch = async (e) => {
    e?.preventDefault?.();
    await load(q.trim());
  };

  const clearSearch = async () => {
    setQ('');
    await load('');
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
          Gestión de Clientes
        </h1>
        <p style={{ color: '#6c757d', margin: 0 }}>
          Administre la información de los clientes del sistema
        </p>
      </div>

      {/* Formulario de búsqueda y creación */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
        {/* Búsqueda */}
        <div>
          <h3 style={{ color: '#495057', marginBottom: '16px' }}>
            Buscar Cliente
          </h3>
          <form onSubmit={onSearch} style={{
            backgroundColor: '#ffffff',
            padding: '20px',
            borderRadius: '8px',
            border: '1px solid #e9ecef',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}>
            <div style={{ marginBottom: '16px' }}>
              <input
                type="text"
                placeholder="Buscar por nombre..."
                value={q}
                onChange={e => setQ(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid #ced4da',
                  borderRadius: '4px',
                  fontSize: '14px'
                }}
              />
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="submit"
                style={{
                  flex: 1,
                  padding: '10px',
                  backgroundColor: '#007bff',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer'
                }}
              >
                🔍 Buscar
              </button>
              <button
                type="button"
                onClick={clearSearch}
                style={{
                  padding: '10px 16px',
                  backgroundColor: '#6c757d',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer'
                }}
              >
                Limpiar
              </button>
            </div>
            {loading && (
              <div style={{ marginTop: '12px', color: '#6c757d', fontSize: '14px' }}>
                Cargando...
              </div>
            )}
          </form>
        </div>

        {/* Formulario de creación */}
        <div>
          <h3 style={{ color: '#495057', marginBottom: '16px' }}>
            Agregar Cliente
          </h3>
          <form onSubmit={save} style={{
            backgroundColor: '#ffffff',
            padding: '20px',
            borderRadius: '8px',
            border: '1px solid #e9ecef',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#495057' }}>
                Nombre *
              </label>
              <input
                type="text"
                placeholder="Nombre del cliente"
                value={form.name}
                onChange={e => setForm({...form, name: e.target.value})}
                required
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid #ced4da',
                  borderRadius: '4px',
                  fontSize: '14px'
                }}
              />
            </div>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#495057' }}>
                Teléfono
              </label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <select
                  value={form.countryCode}
                  onChange={e => setForm({...form, countryCode: e.target.value})}
                  style={{
                    width: '200px',
                    padding: '10px 12px',
                    border: '1px solid #ced4da',
                    borderRadius: '4px',
                    fontSize: '14px',
                    backgroundColor: 'white'
                  }}
                >
                  {countries.map(country => (
                    <option key={country.code} value={country.code}>
                      {country.prefix} - {country.name}
                    </option>
                  ))}
                </select>
                <input
                  type="tel"
                  placeholder="Número de teléfono"
                  value={form.phone}
                  onChange={e => setForm({...form, phone: e.target.value})}
                  style={{
                    flex: 1,
                    padding: '10px 12px',
                    border: '1px solid #ced4da',
                    borderRadius: '4px',
                    fontSize: '14px'
                  }}
                />
              </div>
              <small style={{ color: '#6c757d', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                Prefijo: {getPrefix(form.countryCode)} - Se agregará automáticamente al guardar
              </small>
            </div>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#495057' }}>
                Correo Electrónico
              </label>
              <input
                type="email"
                placeholder="correo@ejemplo.com (opcional)"
                value={form.email}
                onChange={e => setForm({...form, email: e.target.value})}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid #ced4da',
                  borderRadius: '4px',
                  fontSize: '14px'
                }}
              />
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
              ➕ Agregar Cliente
            </button>
          </form>
        </div>
      </div>

      {/* Tabla de clientes */}
      <div>
        <h3 style={{ color: '#495057', marginBottom: '16px' }}>
          Lista de Clientes ({list.length})
        </h3>
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '8px',
          border: '1px solid #e9ecef',
          overflow: 'hidden',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          {list.length === 0 && !loading ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#6c757d' }}>
              No hay clientes registrados
            </div>
          ) : (
            <div style={{ maxHeight: '600px', overflow: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f8f9fa' }}>
                    <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#495057', borderBottom: '2px solid #dee2e6' }}>
                      Nombre
                    </th>
                    <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#495057', borderBottom: '2px solid #dee2e6' }}>
                      Teléfono
                    </th>
                    <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#495057', borderBottom: '2px solid #dee2e6' }}>
                      Correo Electrónico
                    </th>
                    <th style={{ padding: '12px', textAlign: 'center', fontWeight: '600', color: '#495057', borderBottom: '2px solid #dee2e6', width: '200px' }}>
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {list.map(c => (
                    <tr key={c.id} style={{ borderBottom: '1px solid #e9ecef' }}>
                      <td style={{ padding: '12px' }}>
                        {editId === c.id ? (
                          <input
                            type="text"
                            value={editForm.name}
                            onChange={e => setEditForm({...editForm, name: e.target.value})}
                            style={{
                              width: '100%',
                              padding: '6px 8px',
                              border: '1px solid #ced4da',
                              borderRadius: '4px',
                              fontSize: '14px'
                            }}
                          />
                        ) : (
                          <span style={{ fontWeight: '500', color: '#2c3e50' }}>{c.name}</span>
                        )}
                      </td>
                      <td style={{ padding: '12px' }}>
                        {editId === c.id ? (
                          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            <select
                              value={editForm.countryCode}
                              onChange={e => setEditForm({...editForm, countryCode: e.target.value})}
                              style={{
                                width: '160px',
                                padding: '6px 8px',
                                border: '1px solid #ced4da',
                                borderRadius: '4px',
                                fontSize: '13px',
                                backgroundColor: 'white'
                              }}
                            >
                              {countries.map(country => (
                                <option key={country.code} value={country.code}>
                                  {country.prefix}
                                </option>
                              ))}
                            </select>
                            <input
                              type="tel"
                              value={editForm.phone}
                              onChange={e => setEditForm({...editForm, phone: e.target.value})}
                              placeholder="Número"
                              style={{
                                flex: 1,
                                padding: '6px 8px',
                                border: '1px solid #ced4da',
                                borderRadius: '4px',
                                fontSize: '14px'
                              }}
                            />
                          </div>
                        ) : (
                          <span style={{ color: '#6c757d' }}>{c.phone || '-'}</span>
                        )}
                      </td>
                      <td style={{ padding: '12px' }}>
                        {editId === c.id ? (
                          <input
                            type="email"
                            value={editForm.email}
                            onChange={e => setEditForm({...editForm, email: e.target.value})}
                            style={{
                              width: '100%',
                              padding: '6px 8px',
                              border: '1px solid #ced4da',
                              borderRadius: '4px',
                              fontSize: '14px'
                            }}
                          />
                        ) : (
                          <span style={{ color: '#6c757d' }}>{c.email || '-'}</span>
                        )}
                      </td>
                      <td style={{ padding: '12px', textAlign: 'center' }}>
                        {editId === c.id ? (
                          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                            <button
                              type="button"
                              onClick={() => saveEdit(c.id)}
                              style={{
                                padding: '6px 12px',
                                backgroundColor: '#28a745',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                fontSize: '12px',
                                fontWeight: '500',
                                cursor: 'pointer'
                              }}
                            >
                              ✓ Guardar
                            </button>
                            <button
                              type="button"
                              onClick={cancelEdit}
                              style={{
                                padding: '6px 12px',
                                backgroundColor: '#6c757d',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                fontSize: '12px',
                                fontWeight: '500',
                                cursor: 'pointer'
                              }}
                            >
                              ✗ Cancelar
                            </button>
                          </div>
                        ) : (
                          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                            <button
                              type="button"
                              onClick={() => startEdit(c)}
                              style={{
                                padding: '6px 12px',
                                backgroundColor: '#007bff',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                fontSize: '12px',
                                fontWeight: '500',
                                cursor: 'pointer'
                              }}
                            >
                              ✏️ Editar
                            </button>
                            <button
                              type="button"
                              onClick={() => remove(c.id)}
                              style={{
                                padding: '6px 12px',
                                backgroundColor: '#dc3545',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                fontSize: '12px',
                                fontWeight: '500',
                                cursor: 'pointer'
                              }}
                            >
                              🗑️ Eliminar
                            </button>
                          </div>
                        )}
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
}
