export default function Home() {
  return (
    <div style={{ position: 'relative', minHeight: 'calc(100vh - 64px)', overflow: 'hidden', borderRadius: 12 }}>
      {/* Imagen a pantalla completa */}
      <img
        src="/welcome-hero.png"
        alt="MediLink Pro - Sistema de Gestión de Inventario"
        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
      />
    </div>
  );
}


