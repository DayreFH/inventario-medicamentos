import { Router } from 'express';
import { prisma } from '../db.js';
const router = Router();

router.get('/low-stock', async (req, res) => {
  const data = await prisma.medicine.findMany({
    where: { stock: { lte: prisma.medicine.fields.min_stock } }, // Prisma no permite comparar campos así; hacemos filtro en JS:
  });
  // Workaround: obtener todos y filtrar
  const meds = await prisma.medicine.findMany();
  const lows = meds.filter(m => m.stock <= m.min_stock).sort((a,b)=> a.stock - b.stock);
  res.json(lows);
});

router.get('/top-customers', async (req, res) => {
  const rows = await prisma.$queryRaw`
    SELECT c.id, c.name, SUM(si.qty) AS total_qty
    FROM customers c
    JOIN sales s ON s.customerId = c.id
    JOIN saleItem si ON si.saleId = s.id
    GROUP BY c.id, c.name
    ORDER BY total_qty DESC
    LIMIT 10;
  `;
  res.json(rows);
});

router.get('/stock', async (_req, res) => {
  const meds = await prisma.medicine.findMany({ orderBy: { name: 'asc' }});
  res.json(meds.map(m => ({ id: m.id, name: m.name, form: m.form, unit: m.unit, stock: m.stock, min_stock: m.min_stock })));
});

export default router;