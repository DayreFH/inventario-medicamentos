import { useState } from 'react';
import api from '../api/http';
import SaleFormAdvanced from '../components/SaleFormAdvanced';

export default function Sales() {

  return (
    <div style={{ 
      height: '100vh',
      width: '100vw',
      margin: 0,
      padding: 0,
      overflow: 'hidden'
    }}>
      <SaleFormAdvanced />
    </div>
  );
}