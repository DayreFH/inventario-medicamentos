import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Login from './pages/Login';
import LoginDebug from './pages/LoginDebug';
import Navigation from './components/Navigation';
import Dashboard from './pages/Dashboard';
import FinanceReports from './pages/FinanceReports';
import Home from './pages/Home';
import Medicines from './pages/Medicines';
import Suppliers from './pages/Suppliers';
import Customers from './pages/Customers';
import Receipts from './pages/Receipts';
import Sales from './pages/Sales';
import ExchangeRates from './pages/ExchangeRates';
import ExchangeRatesMN from './pages/ExchangeRatesMN';
import ShippingRates from './pages/ShippingRates';
import UtilityRates from './pages/UtilityRates';

// Componente Layout para rutas protegidas
function ProtectedLayout({ children }) {
  return (
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
        {children}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* RUTAS PÚBLICAS */}
          <Route path="/login" element={<Login />} />
          <Route path="/login-debug" element={<LoginDebug />} />
          
          {/* RUTAS PROTEGIDAS */}
          <Route path="/" element={
            <PrivateRoute>
              <ProtectedLayout>
                <Navigate to="/dashboard" replace />
              </ProtectedLayout>
            </PrivateRoute>
          } />
          
          <Route path="/home" element={
            <PrivateRoute>
              <ProtectedLayout>
                <Home />
              </ProtectedLayout>
            </PrivateRoute>
          } />
          
          {/* PANEL DE DATOS */}
          <Route path="/dashboard" element={
            <PrivateRoute>
              <ProtectedLayout>
                <Dashboard />
              </ProtectedLayout>
            </PrivateRoute>
          } />
          
          <Route path="/top-customers" element={
            <PrivateRoute>
              <ProtectedLayout>
                <Dashboard />
              </ProtectedLayout>
            </PrivateRoute>
          } />
          
          <Route path="/best-prices" element={
            <PrivateRoute>
              <ProtectedLayout>
                <Dashboard />
              </ProtectedLayout>
            </PrivateRoute>
          } />
          
          <Route path="/expiry-alerts" element={
            <PrivateRoute>
              <ProtectedLayout>
                <Dashboard />
              </ProtectedLayout>
            </PrivateRoute>
          } />
          
          <Route path="/idle-medicines" element={
            <PrivateRoute>
              <ProtectedLayout>
                <Dashboard />
              </ProtectedLayout>
            </PrivateRoute>
          } />
          
          {/* ADMINISTRACIÓN */}
          <Route path="/admin/dop-usd" element={
            <PrivateRoute>
              <ProtectedLayout>
                <ExchangeRates />
              </ProtectedLayout>
            </PrivateRoute>
          } />
          
          <Route path="/admin/usd-mn" element={
            <PrivateRoute>
              <ProtectedLayout>
                <ExchangeRatesMN />
              </ProtectedLayout>
            </PrivateRoute>
          } />
          
          <Route path="/admin/shipping" element={
            <PrivateRoute>
              <ProtectedLayout>
                <ShippingRates />
              </ProtectedLayout>
            </PrivateRoute>
          } />
          
          <Route path="/admin/utility" element={
            <PrivateRoute>
              <ProtectedLayout>
                <UtilityRates />
              </ProtectedLayout>
            </PrivateRoute>
          } />
          
          {/* GESTIÓN DE DATOS */}
          <Route path="/medicines" element={
            <PrivateRoute>
              <ProtectedLayout>
                <Medicines />
              </ProtectedLayout>
            </PrivateRoute>
          } />
          
          <Route path="/customers" element={
            <PrivateRoute>
              <ProtectedLayout>
                <Customers />
              </ProtectedLayout>
            </PrivateRoute>
          } />
          
          <Route path="/suppliers" element={
            <PrivateRoute>
              <ProtectedLayout>
                <Suppliers />
              </ProtectedLayout>
            </PrivateRoute>
          } />
          
          {/* OPERACIONES */}
          <Route path="/receipts" element={
            <PrivateRoute>
              <ProtectedLayout>
                <Receipts />
              </ProtectedLayout>
            </PrivateRoute>
          } />
          
          <Route path="/sales" element={
            <PrivateRoute>
              <ProtectedLayout>
                <Sales />
              </ProtectedLayout>
            </PrivateRoute>
          } />
          
          {/* FINANZAS */}
          <Route path="/finanzas/reportes" element={
            <PrivateRoute>
              <ProtectedLayout>
                <FinanceReports />
              </ProtectedLayout>
            </PrivateRoute>
          } />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}