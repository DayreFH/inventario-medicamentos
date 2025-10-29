import { useState, useEffect } from 'react';
import api from '../api/http';
import { checkUtilityRate } from '../utils/checkUtilityRate';

const SaleFormAdvanced = () => {
  const [exchangeRate, setExchangeRate] = useState({
    rate: 62.83,
    buyRate: 62.51,
    sellRate: 63.16,
    source: 'default'
  });
  const [shippingRate, setShippingRate] = useState({
    domesticRate: 2,
    internationalRate: 10,
    weight: 1,
    source: 'default'
  });
  const [exchangeRateMN, setExchangeRateMN] = useState(null);
  const [utilityRate, setUtilityRate] = useState(null);
  const [medicines, setMedicines] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Estados para los combobox
  const [selectedMedicine, setSelectedMedicine] = useState(null);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [medicineFilter, setMedicineFilter] = useState('');
  const [customerFilter, setCustomerFilter] = useState('');
  
  // Estados para la tabla de salida
  const [saleItems, setSaleItems] = useState([]);
  const [currentItem, setCurrentItem] = useState({
    medicineId: '',
    customerId: '',
    quantity: 0,
    saleDate: new Date().toISOString().slice(0, 10)
  });

  useEffect(() => {
    const initializeData = async () => {
      await loadInitialData();
      await checkExchangeRateMN();
      const util = await checkUtilityRate();
      if (util !== null && util !== undefined) setUtilityRate(util);
    };
    
    initializeData();
    
    // Verificar localStorage cada segundo para detectar cambios desde la misma ventana
    const interval = setInterval(() => {
      const saved = localStorage.getItem('exchangeRateMN');
      if (saved) {
        try {
          const data = JSON.parse(saved);
          const today = new Date().toDateString();
          if (data.date === today && data.rate) {
            setExchangeRateMN(parseFloat(data.rate));
          }
        } catch (e) {
          console.error('Error parsing localStorage:', e);
        }
      }
      // Utility rate watcher
      const savedUtil = localStorage.getItem('utilityRate');
      if (savedUtil) {
        try {
          const data = JSON.parse(savedUtil);
          const today = new Date().toDateString();
          if (data.date === today && data.rate) {
            setUtilityRate(parseFloat(data.rate));
          }
        } catch (e) {
          console.error('Error parsing utilityRate from localStorage:', e);
        }
      }
    }, 1000);
    
    // Recargar medicamentos cuando la página vuelve a estar visible (al regresar de otra pestaña)
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        console.log('Página visible - Recargando medicamentos para actualizar stock');
        loadMedicines();
      }
    };
    
    // También recargar cuando la ventana recibe el foco
    const handleWindowFocus = () => {
      console.log('Ventana enfocada - Recargando medicamentos para actualizar stock');
      loadMedicines();
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleWindowFocus);
    
    const handleStorageChange = (e) => {
      if (e.key === 'exchangeRateMN') {
        const data = JSON.parse(e.newValue);
        const today = new Date().toDateString();
        if (data.date === today) {
          setExchangeRateMN(data.rate);
        }
      } else if (e.key === 'utilityRate') {
        const data = JSON.parse(e.newValue);
        const today = new Date().toDateString();
        if (data.date === today) {
          setUtilityRate(data.rate);
        }
      } else if (e.key === 'medicinesUpdated') {
        console.log('Stock actualizado en otra pestaña - Recargando medicamentos');
        loadMedicines();
      }
    };
    
    // Verificar si hay actualización de medicamentos cada segundo
    const medicinesUpdateCheck = setInterval(() => {
      const saved = localStorage.getItem('medicinesUpdated');
      if (saved) {
        const data = JSON.parse(saved);
        // Si la actualización fue hace menos de 2 segundos, recargar
        if (Date.now() - data.timestamp < 2000) {
          console.log('Detectada actualización de stock reciente - Recargando medicamentos');
          loadMedicines();
        }
      }
    }, 1000);
    
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      clearInterval(interval);
      clearInterval(medicinesUpdateCheck);
      window.removeEventListener('storage', handleStorageChange);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleWindowFocus);
    };
  }, []);

  const checkExchangeRateMN = async () => {
    try {
      // Intentar cargar tasa MN desde la API
      const { data } = await api.get('/exchange-rates-mn/current');
      
      // Guardar en localStorage con la fecha de hoy
      const today = new Date().toDateString();
      localStorage.setItem('exchangeRateMN', JSON.stringify({
        date: today,
        rate: data.sellRate // Usar tasa de venta para las ventas
      }));
      
      setExchangeRateMN(data.sellRate);
    } catch (error) {
      // Si no hay tasa en la API, verificar localStorage
      const today = new Date().toDateString();
      const saved = localStorage.getItem('exchangeRateMN');
      
      if (saved) {
        const data = JSON.parse(saved);
        if (data.date === today && data.rate) {
          setExchangeRateMN(data.rate);
          return;
        }
      }
      
      // Si no hay tasa configurada para hoy, pedir que la configure
      const configure = confirm('Debe configurar la tasa de cambio en Moneda Nacional (MN) para el día de hoy. ¿Desea configurarla ahora?');
      
      if (configure) {
        window.location.href = '/admin/usd-mn';
      } else {
        alert('No se puede continuar sin configurar la tasa de cambio MN. Por favor, configúrela en la pestaña "Tasas de Cambio MN".');
      }
    }
  };

  const loadInitialData = async () => {
    try {
      setLoading(true);
      
      // Cargar tasa de cambio USD/DOP
      await loadExchangeRate();
      
      // Cargar tasa de envío
      const savedShippingRate = localStorage.getItem('shippingRate');
      if (savedShippingRate) {
        const parsedRate = JSON.parse(savedShippingRate);
        setShippingRate(parsedRate);
      }
      
      // Cargar tasas de cambio MN desde localStorage
      const today = new Date().toDateString();
      const saved = localStorage.getItem('exchangeRateMN');
      if (saved) {
        const data = JSON.parse(saved);
        if (data.date === today) {
          setExchangeRateMN(data.rate);
        }
      }
      
      // Luego cargar datos reales
      await Promise.all([
        loadShippingRate(),
        loadMedicines(),
        loadCustomers()
      ]);
    } catch (error) {
      console.error('Error cargando datos iniciales:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadExchangeRate = async () => {
    try {
      const { data } = await api.get('/exchange-rates/current');
      setExchangeRate(data);
    } catch (error) {
      console.error('Error cargando tasa de cambio:', error);
      setExchangeRate({
        rate: 62.83,
        buyRate: 62.51,
        sellRate: 63.16,
        source: 'fallback'
      });
    }
  };

  const loadShippingRate = async () => {
    try {
      const { data } = await api.get('/shipping-rates/current');
      setShippingRate(data);
      localStorage.setItem('shippingRate', JSON.stringify(data));
    } catch (error) {
      console.error('Error cargando tasa de envío:', error);
      const savedRate = localStorage.getItem('shippingRate');
      if (savedRate) {
        const parsedRate = JSON.parse(savedRate);
        setShippingRate(parsedRate);
      } else {
        const defaultRate = {
          domesticRate: 2,
          internationalRate: 10,
          weight: 1,
          source: 'default'
        };
        setShippingRate(defaultRate);
        localStorage.setItem('shippingRate', JSON.stringify(defaultRate));
      }
    }
  };

  const loadMedicines = async () => {
    try {
      const { data } = await api.get('/medicines');
      console.log('Medicamentos cargados:', data.length);
      console.log('Primeros medicamentos:', data.slice(0, 3));
      setMedicines(data);
    } catch (error) {
      console.error('Error cargando medicamentos:', error);
    }
  };

  const loadCustomers = async () => {
    try {
      const { data } = await api.get('/customers');
      setCustomers(data);
    } catch (error) {
      console.error('Error cargando clientes:', error);
    }
  };

  const handleMedicineSelect = (medicine) => {
    console.log('Seleccionando medicamento:', medicine);
    if (medicine && medicine.id) {
      setSelectedMedicine(medicine);
      setCurrentItem({ ...currentItem, medicineId: medicine.id });
    }
  };

  const handleCustomerSelect = (customer) => {
    setSelectedCustomer(customer);
    setCurrentItem({ ...currentItem, customerId: customer.id });
  };

  const addItemToSale = () => {
    if (!selectedMedicine || !selectedCustomer || currentItem.quantity <= 0) {
      alert('Por favor complete todos los campos requeridos');
      return;
    }

    if (currentItem.quantity > selectedMedicine.stock) {
      alert(`Stock insuficiente. Disponible: ${selectedMedicine.stock}`);
      return;
    }

    // Verificar si ya existe el mismo medicamento en la tabla
    const existingItemIndex = saleItems.findIndex(item => 
      item.medicineId === selectedMedicine.id && 
      item.customerId === selectedCustomer.id
    );

    if (existingItemIndex !== -1) {
      // Si ya existe, sumar la cantidad
      const updatedItems = [...saleItems];
      const existingItem = updatedItems[existingItemIndex];
      
      const newTotalQuantity = existingItem.quantity + currentItem.quantity;
      
      if (newTotalQuantity > selectedMedicine.stock) {
        alert(`Stock insuficiente. Disponible: ${selectedMedicine.stock}`);
        return;
      }
      
      // Obtener precio de compra y venta del medicamento (desde precios activos)
      const precioCompraDOP = selectedMedicine.precios && selectedMedicine.precios.length > 0 
        ? parseFloat(selectedMedicine.precios[0].precioCompraUnitario) 
        : 0;
      const precioVentaDOP = selectedMedicine.precios && selectedMedicine.precios.length > 0 
        ? parseFloat(selectedMedicine.precios[0].precioVentaUnitario) 
        : 0;
      const pesoKg = selectedMedicine.pesoKg || 0;
      
      // Precio de venta en USD: (Precio de Compra DOP ÷ Tasa de cambio) + (Peso KG × Tasa de envío)
      const precioVentaUSD = (precioCompraDOP / exchangeRate.rate) + (pesoKg * (shippingRate?.internationalRate || 0));
      
      // Calcular Precio X KG Cuba según presentación
      const presentacionUpper = selectedMedicine.presentacion?.toUpperCase() || '';
      const esFrascoOTubo = presentacionUpper.includes('FRASCO') || presentacionUpper.includes('TUBO');
      const precioPorKgCuba = esFrascoOTubo ? pesoKg * 15 : pesoKg * 22;
      
      // Precio en MN = (PRECIO X KG CUBA + PRECIO VENTA USD) × TASA MN × (1 + % Utilidad/100)
      // Redondear valores intermedios para evitar discrepancias entre lo calculado y lo mostrado
      const precioPorKgCubaRounded = Math.round(precioPorKgCuba * 100) / 100;
      const precioVentaUSDRounded = Math.round(precioVentaUSD * 100) / 100;
      const precioBaseMN = (precioPorKgCubaRounded + precioVentaUSDRounded) * exchangeRateMN;
      // Aplicar % de utilidad
      const utilityMultiplier = utilityRate ? (1 + utilityRate / 100) : 1;
      const precioVentaMN = precioBaseMN * utilityMultiplier;
      
      // Subtotal USD
      const subtotalUSD = precioVentaUSDRounded * newTotalQuantity;
      
      // Subtotal MN
      const subtotalMN = precioVentaMN * newTotalQuantity;
      
      updatedItems[existingItemIndex] = {
        ...existingItem,
        quantity: newTotalQuantity,
        precioCompraDOP,
        precioVentaUSD: precioVentaUSDRounded,
        precioVentaMN,
        precioPorKgCuba: precioPorKgCubaRounded,
        subtotalUSD,
        subtotalMN
      };
      
      setSaleItems(updatedItems);
    } else {
      // Obtener precio de compra y venta del medicamento (desde precios activos)
      const precioCompraDOP = selectedMedicine.precios && selectedMedicine.precios.length > 0 
        ? parseFloat(selectedMedicine.precios[0].precioCompraUnitario) 
        : 0;
      const precioVentaDOP = selectedMedicine.precios && selectedMedicine.precios.length > 0 
        ? parseFloat(selectedMedicine.precios[0].precioVentaUnitario) 
        : 0;
      const pesoKg = selectedMedicine.pesoKg || 0;
      
      // Precio de venta en USD: (Precio de Compra DOP ÷ Tasa de cambio) + (Peso KG × Tasa de envío)
      const precioVentaUSD = (precioCompraDOP / exchangeRate.rate) + (pesoKg * (shippingRate?.internationalRate || 0));
      
      // Calcular Precio X KG Cuba según presentación
      const presentacionUpper = selectedMedicine.presentacion?.toUpperCase() || '';
      const esFrascoOTubo = presentacionUpper.includes('FRASCO') || presentacionUpper.includes('TUBO');
      const precioPorKgCuba = esFrascoOTubo ? pesoKg * 15 : pesoKg * 22;
      
      // Precio en MN = (PRECIO X KG CUBA + PRECIO VENTA USD) × TASA MN × (1 + % Utilidad/100)
      // Redondear valores intermedios para evitar discrepancias entre lo calculado y lo mostrado
      const precioPorKgCubaRounded = Math.round(precioPorKgCuba * 100) / 100;
      const precioVentaUSDRounded = Math.round(precioVentaUSD * 100) / 100;
      const precioBaseMN = (precioPorKgCubaRounded + precioVentaUSDRounded) * exchangeRateMN;
      // Aplicar % de utilidad
      const utilityMultiplier = utilityRate ? (1 + utilityRate / 100) : 1;
      const precioVentaMN = precioBaseMN * utilityMultiplier;
      
      // Subtotal USD
      const subtotalUSD = precioVentaUSDRounded * currentItem.quantity;
      
      // Subtotal MN
      const subtotalMN = precioVentaMN * currentItem.quantity;
      
      const newItem = {
        id: Date.now(),
        medicineId: selectedMedicine.id,
        customerId: selectedCustomer.id,
        quantity: currentItem.quantity,
        
        // Datos del medicamento
        codigo: selectedMedicine.codigo,
        nombreComercial: selectedMedicine.nombreComercial,
        presentacion: selectedMedicine.presentacion,
        stock: selectedMedicine.stock,
        
        // Datos del cliente
        cliente: selectedCustomer.name,
        
        // Precios
        precioCompraDOP,
        precioVentaUSD: precioVentaUSDRounded,
        precioVentaMN,
        precioPorKgCuba: precioPorKgCubaRounded,
        subtotalUSD,
        subtotalMN,
        
        // Fecha
        saleDate: currentItem.saleDate
      };

      setSaleItems([...saleItems, newItem]);
    }
    
    // Limpiar formulario
    setCurrentItem({
      medicineId: '',
      customerId: '',
      quantity: 0,
      saleDate: new Date().toISOString().slice(0, 10)
    });
    setSelectedMedicine(null);
    setSelectedCustomer(null);
    setMedicineFilter('');
    setCustomerFilter('');
  };

  const removeItem = (itemId) => {
    setSaleItems(saleItems.filter(item => item.id !== itemId));
  };

  const calculateTotalUSD = () => {
    return saleItems.reduce((total, item) => total + item.subtotalUSD, 0);
  };

  const calculateTotalMN = () => {
    return saleItems.reduce((total, item) => total + item.subtotalMN, 0);
  };

  const formatMNPeso = (value) => {
    const num = Number(value) || 0;
    // Convertir a string con 2 decimales, usar punto como separador decimal
    const str = num.toFixed(2);
    // Reemplazar punto por coma para formato español
    const formatted = str.replace('.', ',');
    // Retornar como string explícito para evitar formateo automático del navegador
    return String(formatted);
  };

  const handleSaveSale = async () => {
    if (saleItems.length === 0) {
      alert('Debe agregar al menos un medicamento');
      return;
    }

    try {
      const saleData = {
        customerId: saleItems[0].customerId,
        date: saleItems[0].saleDate,
        notes: `Venta con tasa DOP-USD: ${exchangeRate.rate}, Tasa envío internacional: ${shippingRate?.internationalRate || 0}, Tasa MN: ${exchangeRateMN}`,
        items: saleItems.map(item => ({
          medicineId: item.medicineId,
          qty: item.quantity
        }))
      };

      await api.post('/sales', saleData);
      
      alert('Salida guardada exitosamente');
      
      // Limpiar todo
      setSaleItems([]);
      setSelectedMedicine(null);
      setSelectedCustomer(null);
    } catch (error) {
      console.error('Error guardando salida:', error);
      alert(`Error guardando la salida: ${error.message}`);
    }
  };

  const filteredMedicines = medicines.filter(medicine =>
    medicine.nombreComercial.toLowerCase().includes(medicineFilter.toLowerCase()) ||
    medicine.codigo.toLowerCase().includes(medicineFilter.toLowerCase())
  );

  // Debug
  console.log('Total medicamentos:', medicines.length);
  console.log('Medicamentos filtrados:', filteredMedicines.length);
  if (filteredMedicines.length > 0) {
    console.log('Primer medicamento filtrado:', filteredMedicines[0]);
  }

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(customerFilter.toLowerCase())
  );

  return (
    <div style={{ 
      height: '100vh', 
      display: 'flex', 
      flexDirection: 'column',
      backgroundColor: '#f5f5f5'
    }}>
      {/* Header con tasas */}
      <div style={{
        backgroundColor: '#2c3e50',
        color: 'white',
        padding: '8px 16px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        fontSize: '14px'
      }}>
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
          <span>T.C.: {exchangeRate?.rate || 'Cargando...'}</span>
          <span>
            Envío: ${shippingRate?.internationalRate || '0'}
            <button
              onClick={() => {
                const newRate = prompt('Ingrese nueva tasa de envío internacional:', shippingRate?.internationalRate || '10');
                if (newRate && !isNaN(newRate) && parseFloat(newRate) > 0) {
                  const updatedRate = {
                    ...shippingRate,
                    internationalRate: parseFloat(newRate),
                    source: 'manual'
                  };
                  setShippingRate(updatedRate);
                  localStorage.setItem('shippingRate', JSON.stringify(updatedRate));
                }
              }}
              style={{
                marginLeft: '8px',
                padding: '2px 6px',
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '3px',
                fontSize: '10px',
                cursor: 'pointer'
              }}
            >
              ✏️
            </button>
          </span>
          <span>Fecha: {new Date().toLocaleDateString('es-DO')}</span>
          <span>T.C. MN: {exchangeRateMN ? `${exchangeRateMN} MN` : 'No configurado'}</span>
          <span>% Utilidad: {utilityRate ? `${utilityRate}%` : 'No configurado'}</span>
        </div>
      </div>

      {/* Sección superior - Formulario de salida */}
      <div style={{
        backgroundColor: '#e9ecef',
        padding: '16px',
        flex: '0 0 auto'
      }}>
        <h2 style={{ 
          margin: '0 0 16px 0', 
          color: '#2c3e50',
          fontSize: '18px'
        }}>
          Salida de Medicamentos
        </h2>

        {/* Selección de medicamento */}
        <div style={{
          backgroundColor: 'white',
          padding: '12px',
          borderRadius: '4px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <div style={{ display: 'grid', gridTemplateColumns: '250px 200px 160px 160px', gap: '12px', marginBottom: '8px' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <label style={{ fontSize: '12px', color: '#666', fontWeight: '500' }}>
                  Medicamento
                </label>
                <button
                  onClick={loadMedicines}
                  style={{
                    padding: '4px 8px',
                    backgroundColor: '#007bff',
                    color: 'white',
                    border: 'none',
                    borderRadius: '3px',
                    fontSize: '10px',
                    cursor: 'pointer'
                  }}
                  title="Recargar lista de medicamentos"
                >
                  🔄
                </button>
              </div>
              <input
                type="text"
                value={medicineFilter}
                onChange={(e) => setMedicineFilter(e.target.value)}
                placeholder="Buscar..."
                style={{
                  width: '100%',
                  padding: '6px 8px',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  fontSize: '12px',
                  marginBottom: '6px'
                }}
              />
              <select
                value={selectedMedicine?.id || ''}
                onChange={(e) => {
                  const selectedValue = e.target.value;
                  console.log('Valor seleccionado:', selectedValue);
                  
                  if (selectedValue === '') {
                    setSelectedMedicine(null);
                    setCurrentItem({ ...currentItem, medicineId: '' });
                    return;
                  }
                  
                  const medicineId = parseInt(selectedValue);
                  console.log('Buscando medicamento con id:', medicineId);
                  console.log('Medicamentos disponibles:', medicines.length);
                  
                  const medicine = medicines.find(m => m.id === medicineId);
                  console.log('Medicamento encontrado:', medicine);
                  
                  if (medicine) {
                    handleMedicineSelect(medicine);
                  } else {
                    console.error('No se encontró el medicamento con id:', medicineId);
                  }
                }}
                style={{
                  width: '100%',
                  padding: '6px 8px',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  fontSize: '12px'
                }}
              >
                <option value="">Seleccionar medicamento... (Total: {filteredMedicines.length})</option>
                {filteredMedicines.map(medicine => {
                  const text = `${medicine.codigo} - ${medicine.nombreComercial} (Stock: ${medicine.stock || 0})`;
                  return (
                    <option key={medicine.id} value={medicine.id}>
                      {text}
                    </option>
                  );
                })}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', color: '#666', marginBottom: '4px', fontWeight: '500' }}>
                Cliente
              </label>
              <input
                type="text"
                value={customerFilter}
                onChange={(e) => setCustomerFilter(e.target.value)}
                placeholder="Buscar..."
                style={{
                  width: '100%',
                  padding: '6px 8px',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  fontSize: '12px',
                  marginBottom: '6px'
                }}
              />
              <select
                value={selectedCustomer?.id || ''}
                onChange={(e) => {
                  const customer = customers.find(c => c.id === parseInt(e.target.value));
                  if (customer) handleCustomerSelect(customer);
                }}
                style={{
                  width: '100%',
                  padding: '6px 8px',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  fontSize: '12px'
                }}
              >
                <option value="">Seleccionar cliente...</option>
                {filteredCustomers.map(customer => (
                  <option key={customer.id} value={customer.id}>
                    {customer.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', color: '#666', marginBottom: '4px', fontWeight: '500' }}>
                Stock disponible
              </label>
              <input
                type="text"
                value={selectedMedicine ? `Disponible: ${selectedMedicine.stock}` : 'Seleccione un medicamento'}
                disabled
                style={{
                  width: '100%',
                  padding: '6px 8px',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  fontSize: '12px',
                  backgroundColor: selectedMedicine && selectedMedicine.stock > 0 ? '#d4edda' : '#f8f9fa',
                  color: selectedMedicine && selectedMedicine.stock > 0 ? '#155724' : '#6c757d',
                  fontWeight: selectedMedicine && selectedMedicine.stock > 0 ? 'bold' : 'normal'
                }}
              />
              
              <label style={{ display: 'block', fontSize: '12px', color: '#666', marginBottom: '4px', marginTop: '6px', fontWeight: '500' }}>
                Cantidad a vender
              </label>
              <input
                type="number"
                min="0"
                max={selectedMedicine ? selectedMedicine.stock : 0}
                value={currentItem.quantity}
                onChange={(e) => setCurrentItem({ ...currentItem, quantity: parseInt(e.target.value) || 0 })}
                style={{
                  width: '100%',
                  padding: '6px 8px',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  fontSize: '12px'
                }}
                placeholder="Ingrese cantidad"
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', color: '#666', marginBottom: '4px', fontWeight: '500' }}>
                Fecha de Salida
              </label>
              <input
                type="date"
                value={currentItem.saleDate}
                onChange={(e) => setCurrentItem({ ...currentItem, saleDate: e.target.value })}
                style={{
                  width: '100%',
                  padding: '6px 8px',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  fontSize: '12px',
                  marginBottom: '6px'
                }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
            <button
              onClick={addItemToSale}
              style={{
                padding: '6px 12px',
                backgroundColor: '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '3px',
                fontSize: '11px',
                cursor: 'pointer'
              }}
            >
              ➕ Agregar
            </button>
            <button
              onClick={handleSaveSale}
              disabled={saleItems.length === 0}
              style={{
                padding: '6px 12px',
                backgroundColor: saleItems.length === 0 ? '#6c757d' : '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '3px',
                fontSize: '11px',
                cursor: saleItems.length === 0 ? 'not-allowed' : 'pointer'
              }}
            >
              💾 Guardar
            </button>
          </div>
        </div>
      </div>

      {/* Sección inferior - Tabla de medicamentos */}
      <div style={{
        flex: 1,
        backgroundColor: 'white',
        margin: '0 8px 8px 8px',
        borderRadius: '4px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <div style={{
          backgroundColor: '#f8f9fa',
          padding: '4px 8px',
          borderBottom: '1px solid #dee2e6',
          fontSize: '12px',
          fontWeight: '600',
          color: '#495057'
        }}>
          Medicamentos a Salir
        </div>
        
        <div style={{ flex: 1, overflow: 'auto' }}>
          <table style={{ 
            width: '100%', 
            borderCollapse: 'collapse',
            fontSize: '12px',
            tableLayout: 'fixed',
            minWidth: '100%'
          }}>
            <thead>
              <tr style={{ backgroundColor: '#f8f9fa' }}>
                <th style={{ padding: '6px', textAlign: 'left', border: '1px solid #dee2e6', fontSize: '12px', width: '150px' }}>Nombre Comercial</th>
                <th style={{ padding: '6px', textAlign: 'left', border: '1px solid #dee2e6', fontSize: '12px', width: '120px' }}>Presentación</th>
                <th style={{ padding: '6px', textAlign: 'left', border: '1px solid #dee2e6', fontSize: '12px', whiteSpace: 'nowrap', width: '60px' }}>Cantidad</th>
                <th style={{ padding: '6px', textAlign: 'left', border: '1px solid #dee2e6', fontSize: '12px', whiteSpace: 'nowrap', width: '80px' }}>Precio Compra DOP</th>
                <th style={{ padding: '6px', textAlign: 'left', border: '1px solid #dee2e6', fontSize: '12px', whiteSpace: 'nowrap', width: '70px' }}>Precio Venta USD</th>
                <th style={{ padding: '6px', textAlign: 'left', border: '1px solid #dee2e6', fontSize: '12px', whiteSpace: 'nowrap', width: '100px' }}>Precio X KG Cuba</th>
                <th style={{ padding: '6px', textAlign: 'left', border: '1px solid #dee2e6', fontSize: '12px', whiteSpace: 'nowrap', width: '90px' }}>Subtotal USD</th>
                <th style={{ padding: '6px', textAlign: 'left', border: '1px solid #dee2e6', fontSize: '12px', whiteSpace: 'nowrap', width: '70px' }}>Precio Venta MN</th>
                <th style={{ padding: '6px', textAlign: 'left', border: '1px solid #dee2e6', fontSize: '12px', whiteSpace: 'nowrap', width: '90px' }}>Subtotal MN</th>
                <th style={{ padding: '6px', textAlign: 'left', border: '1px solid #dee2e6', fontSize: '12px', whiteSpace: 'nowrap', width: '60px' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {saleItems.length === 0 ? (
                <tr>
                  <td colSpan="10" style={{ 
                    padding: '40px', 
                    textAlign: 'center', 
                    color: '#6c757d',
                    fontStyle: 'italic'
                  }}>
                    No hay medicamentos agregados
                  </td>
                </tr>
              ) : (
                saleItems.map((item, index) => (
                  <tr key={item.id} style={{ borderBottom: '1px solid #dee2e6' }}>
                    <td style={{ padding: '6px', border: '1px solid #dee2e6', fontSize: '12px', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '150px' }} title={item.nombreComercial}>
                      <span style={{ marginRight: '4px' }}>▶</span>
                      {item.nombreComercial}
                    </td>
                    <td style={{ padding: '6px', border: '1px solid #dee2e6', fontSize: '12px', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '120px' }} title={item.presentacion}>{item.presentacion}</td>
                    <td style={{ padding: '6px', border: '1px solid #dee2e6', fontSize: '12px', textAlign: 'center' }}>{item.quantity}</td>
                    <td style={{ padding: '6px', border: '1px solid #dee2e6', fontSize: '12px', textAlign: 'right' }}>${item.precioCompraDOP.toFixed(2)}</td>
                    <td style={{ padding: '6px', border: '1px solid #dee2e6', fontSize: '12px', textAlign: 'right' }}>${item.precioVentaUSD.toFixed(2)}</td>
                    <td style={{ padding: '6px', border: '1px solid #dee2e6', fontSize: '12px', textAlign: 'right' }}>
                      ${item.precioPorKgCuba.toFixed(2)}
                    </td>
                    <td style={{ padding: '6px', border: '1px solid #dee2e6', fontWeight: 'bold', color: '#28a745', fontSize: '12px', textAlign: 'right' }}>
                      ${item.subtotalUSD.toFixed(2)}
                    </td>
                    <td style={{ padding: '6px', border: '1px solid #dee2e6', fontSize: '12px', textAlign: 'right' }} suppressHydrationWarning>
                      <span>{formatMNPeso(item.precioVentaMN)} MN</span>
                    </td>
                    <td style={{ padding: '6px', border: '1px solid #dee2e6', fontWeight: 'bold', color: '#2c3e50', fontSize: '12px', textAlign: 'right' }} suppressHydrationWarning>
                      <span>{formatMNPeso(item.subtotalMN)} MN</span>
                    </td>
                    <td style={{ padding: '6px', border: '1px solid #dee2e6', textAlign: 'center' }}>
                      <button
                        onClick={() => removeItem(item.id)}
                        style={{
                          padding: '4px 8px',
                          backgroundColor: '#dc3545',
                          color: 'white',
                          border: 'none',
                          borderRadius: '3px',
                          fontSize: '11px',
                          cursor: 'pointer'
                        }}
                      >
                        ❌
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Total */}
        {saleItems.length > 0 && (
          <div style={{
            padding: '12px',
            backgroundColor: '#f8f9fa',
            borderTop: '1px solid #dee2e6',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '14px',
            fontWeight: 'bold'
          }}>
            <span>Total USD: ${calculateTotalUSD().toFixed(2)}</span>
            <span>Total MN: {formatMNPeso(calculateTotalMN())} MN</span>
            <span>Items: {saleItems.length}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default SaleFormAdvanced;

