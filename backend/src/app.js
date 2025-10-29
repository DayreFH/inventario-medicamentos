import express from 'express';
import cors from 'cors';
import medicines from './routes/medicines.js';
import suppliers from './routes/suppliers.js';
import customers from './routes/customers.js';
import receipts from './routes/receipts.js';
import sales from './routes/sales.js';
import reports from './routes/reports.js';
import exchangeRates from './routes/exchangeRates.js';
import exchangeRatesMN from './routes/exchangeRatesMN.js';
import shippingRates from './routes/shippingRates.js';
import utilityRates from './routes/utilityRates.js';
import schedulerService from './services/scheduler.js';

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/medicines', medicines);
app.use('/api/suppliers', suppliers);
app.use('/api/customers', customers);
app.use('/api/receipts', receipts);
app.use('/api/sales', sales);
app.use('/api/reports', reports);
app.use('/api/exchange-rates', exchangeRates);
app.use('/api/exchange-rates-mn', exchangeRatesMN);
app.use('/api/shipping-rates', shippingRates);
app.use('/api/utility-rates', utilityRates);

app.get('/api/health', (_, res)=> res.json({ok:true}));

// Iniciar el scheduler de tasas de cambio
schedulerService.start();

export default app;