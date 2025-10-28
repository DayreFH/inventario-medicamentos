import { useState, useEffect } from 'react';
import api from '../api/http';
import ReceiptFormAdvanced from '../components/ReceiptFormAdvanced';

const Receipts = () => {
  const [receipts, setReceipts] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadReceipts();
  }, []);

  const loadReceipts = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/receipts');
      setReceipts(data);
    } catch (error) {
      console.error('Error cargando entradas:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      height: '100vh',
      width: '100vw',
      margin: 0,
      padding: 0,
      overflow: 'hidden'
    }}>
      <ReceiptFormAdvanced onReceiptAdded={loadReceipts} />
    </div>
  );
};

export default Receipts;