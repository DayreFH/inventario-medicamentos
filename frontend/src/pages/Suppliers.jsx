import { useEffect, useState } from 'react';
import api from '../api/http';

export default function Suppliers() {
  const [list, setList] = useState([]);
  const [form, setForm] = useState({ name: '', phone: '' });
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(false);

  // edición
  const [editId, setEditId] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', phone: '' });

  const load = async (query = '') => {
    setLoading(true);
    try {
      const { data } = await api.get('/suppliers', { params: query ? { q: query } : {} });
      setList(data);
    } catch {
      alert('No se pudo cargar la lista de proveedores');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const save = async (e) => {
    e.preventDefault();
    const name = form.name.trim();
    if (!name) return alert('El nombre es obligatorio');
    try {
      await api.post('/suppliers', { name, phone: form.phone?.trim() || null });
      setForm({ name: '', phone: '' });
      await load(q);
    } catch (e) {
      alert(e?.response?.data?.error || e?.response?.data?.detail || 'No se pudo crear el proveedor');
    }
  };

  const startEdit = (s) => {
    setEditId(s.id);
    setEditForm({ name: s.name, phone: s.phone || '' });
  };

  const cancelEdit = () => {
    setEditId(null);
    setEditForm({ name: '', phone: '' });
  };

  const saveEdit = async (id) => {
    const name = editForm.name.trim();
    if (!name) return alert('El nombre es obligatorio');
    try {
      await api.put(`/suppliers/${id}`, { name, phone: editForm.phone?.trim() || null });
      cancelEdit();
      await load(q);
    } catch (e) {
      alert(e?.response?.data?.error || e?.response?.data?.detail || 'No se pudo actualizar');
    }
  };

  const remove = async (id) => {
    if (!confirm('¿Eliminar este proveedor?')) return;
    try {
      await api.delete(`/suppliers/${id}`);
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
    <div>
      <h2>Proveedores</h2>

      {/* Búsqueda */}
      <form onSubmit={onSearch} style={{ display:'flex', gap:8, margin:'12px 0', alignItems:'center', flexWrap:'wrap' }}>
        <input placeholder="Buscar por nombre..." value={q} onChange={e=>setQ(e.target.value)} />
        <button type="submit">Buscar</button>
        <button type="button" onClick={clearSearch}>Limpiar</button>
        {loading && <span style={{color:'#666'}}>Cargando...</span>}
      </form>

      {/* Alta rápida */}
      <form onSubmit={save} style={{ display:'flex', gap:8, flexWrap:'wrap', margin:'12px 0' }}>
        <input placeholder="Nombre del proveedor" value={form.name} onChange={e=>setForm({...form, name:e.target.value})}/>
        <input placeholder="Teléfono (opcional)" value={form.phone} onChange={e=>setForm({...form, phone:e.target.value})}/>
        <button>Agregar</button>
      </form>

      {/* Tabla */}
      <table border="1" cellPadding="6" style={{ width:'100%', borderCollapse:'collapse' }}>
        <thead>
          <tr>
            <th style={{textAlign:'left'}}>Nombre</th>
            <th style={{textAlign:'left'}}>Teléfono</th>
            <th style={{width:220}}></th>
          </tr>
        </thead>
        <tbody>
          {list.map(s => (
            <tr key={s.id}>
              <td>
                {editId === s.id
                  ? <input value={editForm.name} onChange={e=>setEditForm({...editForm, name:e.target.value})}/>
                  : s.name}
              </td>
              <td>
                {editId === s.id
                  ? <input value={editForm.phone} onChange={e=>setEditForm({...editForm, phone:e.target.value})}/>
                  : (s.phone || '-')}
              </td>
              <td>
                {editId === s.id ? (
                  <div style={{display:'flex', gap:8}}>
                    <button type="button" onClick={()=>saveEdit(s.id)}>Guardar</button>
                    <button type="button" onClick={cancelEdit}>Cancelar</button>
                  </div>
                ) : (
                  <div style={{display:'flex', gap:8}}>
                    <button type="button" onClick={()=>startEdit(s)}>Editar</button>
                    <button type="button" onClick={()=>remove(s.id)}>Eliminar</button>
                  </div>
                )}
              </td>
            </tr>
          ))}
          {!loading && list.length === 0 && (
            <tr><td colSpan={3}>No hay proveedores.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}