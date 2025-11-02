import { Link, useLocation } from 'react-router-dom';
import { useState } from 'react';

const Navigation = () => {
  const location = useLocation();
  const [expandedMenus, setExpandedMenus] = useState({});

  const menuItems = [
    {
      title: 'PANEL DE DATOS',
      icon: '📊',
      children: [
        { title: 'Alertas de Stock', path: '/dashboard' },
        { title: 'Principales Clientes', path: '/top-customers' },
        { title: 'Mejores Precios-Proveedores', path: '/best-prices' },
        { title: 'Caducidad', path: '/expiry-alerts' },
        { title: 'Tiempo sin movimiento', path: '/idle-medicines' }
      ]
    },
    {
      title: 'ADMINISTRACIÓN',
      icon: '⚙️',
      children: [
        { title: 'Tasa de Cambio DOP-USD', path: '/admin/dop-usd' },
        { title: 'Tasa de Cambio USD-MN', path: '/admin/usd-mn' },
        { title: 'Tasa de Envío', path: '/admin/shipping' },
        { title: '% de Utilidad', path: '/admin/utility' }
      ]
    },
    {
      title: 'GESTIÓN DE DATOS',
      icon: '📋',
      children: [
        { title: 'Medicamentos', path: '/medicines' },
        { title: 'Clientes', path: '/customers' },
        { title: 'Proveedores', path: '/suppliers' }
      ]
    },
    {
      title: 'OPERACIONES',
      icon: '🔄',
      children: [
        { title: 'Entradas', path: '/receipts' },
        { title: 'Salidas', path: '/sales' }
      ]
    },
    {
      title: 'FINANZAS',
      icon: '💰',
      children: [
        { title: 'Reporte', path: '/finanzas/reportes' }
      ]
    }
  ];

  const isActive = (path) => {
    return location.pathname === path;
  };

  const isParentActive = (item) => {
    if (item.children) {
      return item.children.some(child => isActive(child.path));
    }
    return isActive(item.path);
  };

  const toggleMenu = (menuTitle) => {
    setExpandedMenus(prev => ({
      ...prev,
      [menuTitle]: !prev[menuTitle]
    }));
  };

  const isMenuExpanded = (menuTitle) => {
    return expandedMenus[menuTitle] || isParentActive({ children: menuItems.find(m => m.title === menuTitle)?.children });
  };

  return (
    <nav style={{
      backgroundColor: '#2c3e50',
      color: 'white',
      padding: '24px 0',
      height: '100vh',
      overflowY: 'auto',
      boxShadow: '2px 0 4px rgba(0,0,0,0.1)'
    }}>
      <div style={{ padding: '0 24px' }}>
        <div style={{
          marginBottom: '32px',
          textAlign: 'center'
        }}>
          <h1 style={{
            fontSize: '24px',
            fontWeight: 'bold',
            margin: '0 0 8px 0',
            color: '#ecf0f1'
          }}>
            💊 Inventario
          </h1>
          <p style={{
            fontSize: '14px',
            color: '#bdc3c7',
            margin: 0
          }}>
            Sistema de Gestión
          </p>
        </div>

        <div style={{ marginBottom: '24px' }}>
          {menuItems.map((item, index) => (
            <div key={index} style={{ marginBottom: '12px' }}>
              <div
                onClick={() => toggleMenu(item.title)}
                style={{
                  padding: '12px 16px',
                  color: isParentActive(item) ? '#3498db' : '#ecf0f1',
                  fontSize: '14px',
                  fontWeight: '600',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  borderBottom: '1px solid #34495e',
                  marginBottom: '8px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  transition: 'all 0.2s ease',
                  backgroundColor: isParentActive(item) ? '#34495e' : 'transparent',
                  borderRadius: '4px'
                }}
                onMouseEnter={(e) => {
                  if (!isParentActive(item)) {
                    e.target.style.backgroundColor = '#34495e';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isParentActive(item)) {
                    e.target.style.backgroundColor = 'transparent';
                  }
                }}
              >
                <span>
                  {item.icon} {item.title}
                </span>
                <span style={{
                  fontSize: '12px',
                  transform: isMenuExpanded(item.title) ? 'rotate(90deg)' : 'rotate(0deg)',
                  transition: 'transform 0.2s ease'
                }}>
                  ▶
                </span>
              </div>
              
              {isMenuExpanded(item.title) && (
                <div style={{ paddingLeft: '16px' }}>
                  {item.children.map((child, childIndex) => (
                    <Link
                      key={childIndex}
                      to={child.path}
                      style={{
                        display: 'block',
                        padding: '8px 12px',
                        color: isActive(child.path) ? '#3498db' : '#ecf0f1',
                        textDecoration: 'none',
                        fontSize: '13px',
                        borderRadius: '4px',
                        marginBottom: '4px',
                        backgroundColor: isActive(child.path) ? '#34495e' : 'transparent',
                        transition: 'all 0.2s ease',
                        borderLeft: isActive(child.path) ? '3px solid #3498db' : '3px solid transparent'
                      }}
                      onMouseEnter={(e) => {
                        if (!isActive(child.path)) {
                          e.target.style.backgroundColor = '#34495e';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isActive(child.path)) {
                          e.target.style.backgroundColor = 'transparent';
                        }
                      }}
                    >
                      {child.title}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        <div style={{
          borderTop: '1px solid #34495e',
          paddingTop: '16px',
          marginTop: '24px'
        }}>
          <div style={{
            fontSize: '12px',
            color: '#7f8c8d',
            textAlign: 'center',
            lineHeight: '1.4'
          }}>
            <div>© 2024 Sistema de Inventario</div>
            <div>Versión 1.0.0</div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
