import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navigation from './components/Navigation';
import Dashboard from './pages/Dashboard';
import Medicines from './pages/Medicines';
import Suppliers from './pages/Suppliers';
import Customers from './pages/Customers';
import Receipts from './pages/Receipts';
import Sales from './pages/Sales';
import ExchangeRates from './pages/ExchangeRates';
import ExchangeRatesMN from './pages/ExchangeRatesMN';
import ShippingRates from './pages/ShippingRates';
import UtilityRates from './pages/UtilityRates';

export default function App() {
  return (
    <BrowserRouter>
      <div style={{
        display: 'grid', 
        gridTemplateColumns: '280px 1fr', 
        minHeight: '100vh',
        backgroundColor: '#f5f5f5'
      }}>
        <Navigation />
        <main style={{
          padding: '24px',
          backgroundColor: '#ffffff',
          margin: '16px',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          overflow: 'auto',
          height: 'calc(100vh - 32px)',
          maxHeight: 'calc(100vh - 32px)'
        }}>
          <Routes>
            {/* PANEL DE DATOS */}
            <Route path="/" element={<Dashboard/>}/>
            <Route path="/top-customers" element={<Dashboard/>}/>
            <Route path="/best-prices" element={<Dashboard/>}/>
            
            {/* ADMINISTRACIÓN */}
            <Route path="/admin/dop-usd" element={<ExchangeRates/>}/>
            <Route path="/admin/usd-mn" element={<ExchangeRatesMN/>}/>
            <Route path="/admin/shipping" element={<ShippingRates/>}/>
            <Route path="/admin/utility" element={<UtilityRates/>}/>
            
            {/* GESTIÓN DE DATOS */}
            <Route path="/medicines" element={<Medicines/>}/>
            <Route path="/customers" element={<Customers/>}/>
            <Route path="/suppliers" element={<Suppliers/>}/>
            
            {/* OPERACIONES */}
            <Route path="/receipts" element={<Receipts/>}/>
            <Route path="/sales" element={<Sales/>}/>
            
            {/* FINANZAS */}
            <Route path="/finances" element={<div><h2>Finanzas</h2><p>Módulo en desarrollo...</p></div>}/>
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}