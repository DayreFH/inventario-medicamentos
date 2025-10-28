import { Router } from 'express';
import { prisma } from '../db.js';

const router = Router();

/* Helpers rango de fechas (mismos del otro archivo) */
function dayRange(dayStr) {
  const start = new Date(`${dayStr}T00:00:00`);
  const end = new Date(`${dayStr}T23:59:59.999`);
  return { start, end };
}
function weekRange(anyDateStr) {
  const d = new Date(`${anyDateStr}T00:00:00`);
  const day = d.getDay();
  const diffToMonday = (day + 6) % 7;
  const start = new Date(d); start.setDate(d.getDate() - diffToMonday);
  start.setHours(0,0,0,0);
  const end = new Date(start); end.setDate(start.getDate() + 6); end.setHours(23,59,59,999);
  return { start, end };
}
function monthRange(ym) {
  const [y,m] = ym.split('-').map(Number);
  const start = new Date(y, m-1, 1, 0,0,0,0);
  const end = new Date(y, m, 0, 23,59,59,999);
  return { start, end };
}

/**
 * Crear salida (venta)
 * POST /api/sales
 * body: { customerId, date:"YYYY-MM-DD", notes?, items:[{medicineId, qty}] }
 */
router.post('/', async (req, res) => {
  const { customerId, date, notes, items } = req.body;
  try {
    const result = await prisma.$transaction(async (tx) => {
      // Validar stock
      for (const it of items) {
        const med = await tx.medicine.findUnique({ where: { id: it.medicineId } });
        if (!med || med.stock < it.qty) {
          throw new Error(`Stock insuficiente para ${med?.name ?? 'medicamento ' + it.medicineId}`);
        }
      }

      const sale = await tx.sale.create({
        data: { customerId, date: new Date(`${date}T00:00:00`), notes: notes ?? null }
      });

      for (const it of items) {
        await tx.saleItem.create({
          data: { saleId: sale.id, medicineId: it.medicineId, qty: it.qty }
        });
        await tx.medicine.update({
          where: { id: it.medicineId },
          data: { stock: { decrement: it.qty } }
        });
      }
      return sale;
    });
    res.status(201).json({ ok: true, id: result.id });
  } catch (e) {
    res.status(400).json({ error: 'No se pudo registrar la salida', detail: e.message });
  }
});

/**
 * EDITAR salida (reemplaza items y ajusta stock por delta)
 * PUT /api/sales/:id
 * body: { customerId, date, notes, items:[{medicineId, qty}] }
 */
router.put('/:id', async (req, res) => {
  const id = Number(req.params.id);
  const { customerId, date, notes, items } = req.body;

  try {
    await prisma.$transaction(async (tx) => {
      const prevItems = await tx.saleItem.findMany({
        where: { saleId: id },
        select: { medicineId: true, qty: true }
      });

      const prevMap = new Map();
      for (const it of prevItems) prevMap.set(it.medicineId, (prevMap.get(it.medicineId) || 0) + it.qty);

      const nextMap = new Map();
      for (const it of items) nextMap.set(it.medicineId, (nextMap.get(it.medicineId) || 0) + it.qty);

      // Validar que al AUMENTAR una venta haya stock suficiente
      const medsToCheck = new Set([...prevMap.keys(), ...nextMap.keys()]);
      for (const medId of medsToCheck) {
        const prev = prevMap.get(medId) || 0;
        const next = nextMap.get(medId) || 0;
        const delta = next - prev; // venta: delta>0 descuenta stock adicional
        if (delta > 0) {
          const med = await tx.medicine.findUnique({ where: { id: medId } });
          if (!med || med.stock < delta) {
            throw Object.assign(new Error(`Stock insuficiente para "${med?.name ?? medId}"`), { code: 'STOCK_INSUFFICIENT' });
          }
        }
      }

      // Ajustar stock (venta: -delta)
      for (const medId of medsToCheck) {
        const prev = prevMap.get(medId) || 0;
        const next = nextMap.get(medId) || 0;
        const delta = next - prev;
        if (delta !== 0) {
          await tx.medicine.update({
            where: { id: medId },
            data: { stock: { decrement: delta } } // si delta negativo, incrementa stock
          });
        }
      }

      // Reemplazar items
      await tx.saleItem.deleteMany({ where: { saleId: id } });
      if (items.length) {
        await tx.saleItem.createMany({
          data: items.map(it => ({ saleId: id, medicineId: it.medicineId, qty: it.qty }))
        });
      }

      // Actualizar cabecera
      await tx.sale.update({
        where: { id },
        data: {
          ...(customerId ? { customerId } : {}),
          ...(date ? { date: new Date(`${date}T00:00:00`) } : {}),
          notes: notes ?? null
        }
      });
    });

    res.json({ ok: true });
  } catch (e) {
    if (e?.code === 'STOCK_INSUFFICIENT') {
      return res.status(409).json({ error: 'No se puede editar la salida', detail: e.message });
    }
    res.status(400).json({ error: 'No se pudo editar la salida', detail: e.message });
  }
});

/**
 * Listar salidas con filtros
 * GET /api/sales?day=YYYY-MM-DD&week=YYYY-MM-DD&month=YYYY-MM&from=YYYY-MM-DD&to=YYYY-MM-DD&customerId=#&q=nombreMed
 */
router.get('/', async (req, res) => {
  const { day, week, month, from, to, customerId, q } = req.query;
  const where = {};
  if (customerId) where.customerId = Number(customerId);

  if (day) {
    const { start, end } = dayRange(day);
    where.date = { gte: start, lte: end };
  } else if (week) {
    const { start, end } = weekRange(week);
    where.date = { gte: start, lte: end };
  } else if (month) {
    const { start, end } = monthRange(month);
    where.date = { gte: start, lte: end };
  } else if (from || to) {
    where.date = {};
    if (from) where.date.gte = new Date(`${from}T00:00:00`);
    if (to) where.date.lte = new Date(`${to}T23:59:59.999`);
  }

  const data = await prisma.sale.findMany({
    where: {
      ...where,
      ...(q ? { items: { some: { medicine: { name: { contains: String(q) } } } } } : {})
    },
    orderBy: { date: 'desc' },
    include: {
      customer: true,
      items: { include: { medicine: true } }
    }
  });
  res.json(data);
});

/**
 * Eliminar una salida y revertir stock
 * DELETE /api/sales/:id
 */
router.delete('/:id', async (req, res) => {
  const id = Number(req.params.id);
  try {
    await prisma.$transaction(async (tx) => {
      const items = await tx.saleItem.findMany({
        where: { saleId: id },
        select: { medicineId: true, qty: true }
      });

      // Revertir stock (sumar lo vendido)
      for (const it of items) {
        await tx.medicine.update({
          where: { id: it.medicineId },
          data: { stock: { increment: it.qty } }
        });
      }

      // Borrar items y cabecera
      await tx.saleItem.deleteMany({ where: { saleId: id } });
      await tx.sale.delete({ where: { id } });
    });

    res.status(204).send();
  } catch (e) {
    return res.status(400).json({ error: 'No se pudo eliminar la salida', detail: e?.message });
  }
});

export default router;