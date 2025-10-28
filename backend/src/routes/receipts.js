import { Router } from 'express';
import { prisma } from '../db.js';

const router = Router();

/* Helpers rango de fechas */
function dayRange(dayStr) {
  const start = new Date(`${dayStr}T00:00:00`);
  const end = new Date(`${dayStr}T23:59:59.999`);
  return { start, end };
}
function weekRange(anyDateStr) {
  const d = new Date(`${anyDateStr}T00:00:00`);
  const day = d.getDay();              // 0=Dom, 1=Lun... 6=Sab
  const diffToMonday = (day + 6) % 7;  // Lunes=0
  const start = new Date(d); start.setDate(d.getDate() - diffToMonday);
  start.setHours(0,0,0,0);
  const end = new Date(start); end.setDate(start.getDate() + 6); end.setHours(23,59,59,999);
  return { start, end };
}
function monthRange(ym) {               // ym = 'YYYY-MM'
  const [y,m] = ym.split('-').map(Number);
  const start = new Date(y, m-1, 1, 0,0,0,0);
  const end = new Date(y, m, 0, 23,59,59,999); // último día del mes
  return { start, end };
}

/**
 * Crear entrada con items y actualizar stock
 * POST /api/receipts
 * body: { supplierId, date:"YYYY-MM-DD", notes?, items:[{medicineId, qty, unit_cost}] }
 */
router.post('/', async (req, res) => {
  const { supplierId, date, notes, items } = req.body;
  try {
    const result = await prisma.$transaction(async (tx) => {
      const receipt = await tx.receipt.create({
        data: { supplierId, date: new Date(`${date}T00:00:00`), notes: notes ?? null }
      });
      for (const it of items) {
        await tx.receiptItem.create({
          data: {
            receiptId: receipt.id,
            medicineId: it.medicineId,
            qty: it.qty,
            unitCost: Number(it.unit_cost ?? 0),
            weightKg: Number(it.weight_kg ?? it.weightKg ?? 0)
          }
        });
        await tx.medicine.update({
          where: { id: it.medicineId },
          data: { stock: { increment: it.qty } }
        });
      }
      return receipt;
    });
    res.status(201).json({ ok: true, id: result.id });
  } catch (e) {
    res.status(400).json({ error: 'No se pudo registrar la entrada', detail: e.message });
  }
});

/**
 * EDITAR entrada (reemplaza items y ajusta stock por delta)
 * PUT /api/receipts/:id
 * body: { supplierId, date, notes, items:[{medicineId, qty, unit_cost}] }
 */
router.put('/:id', async (req, res) => {
  const id = Number(req.params.id);
  const { supplierId, date, notes, items } = req.body;

  try {
    await prisma.$transaction(async (tx) => {
      // Items actuales
      const prevItems = await tx.receiptItem.findMany({
        where: { receiptId: id },
        select: { medicineId: true, qty: true }
      });

      const prevMap = new Map();
      for (const it of prevItems) prevMap.set(it.medicineId, (prevMap.get(it.medicineId) || 0) + it.qty);

      const nextMap = new Map();
      for (const it of items) nextMap.set(it.medicineId, (nextMap.get(it.medicineId) || 0) + it.qty);

      // Validar que reducir no deje stock negativo
      const medsToCheck = new Set([...prevMap.keys(), ...nextMap.keys()]);
      for (const medId of medsToCheck) {
        const prev = prevMap.get(medId) || 0;
        const next = nextMap.get(medId) || 0;
        const delta = next - prev;
        if (delta < 0) {
          const med = await tx.medicine.findUnique({ where: { id: medId } });
          if (!med) throw new Error(`Medicamento ${medId} no existe`);
          if (med.stock + delta < 0) {
            const err = new Error(`No se puede reducir la entrada de "${med.name}" tanto; dejaría stock negativo.`);
            err.code = 'STOCK_NEGATIVE';
            throw err;
          }
        }
      }

      // Ajustar stock por delta
      for (const medId of medsToCheck) {
        const prev = prevMap.get(medId) || 0;
        const next = nextMap.get(medId) || 0;
        const delta = next - prev;
        if (delta !== 0) {
          await tx.medicine.update({
            where: { id: medId },
            data: { stock: { increment: delta } }
          });
        }
      }

      // Reemplazar items (incluye unit_cost)
      await tx.receiptItem.deleteMany({ where: { receiptId: id } });
      if (items.length) {
        await tx.receiptItem.createMany({
          data: items.map(it => ({
            receiptId: id,
            medicineId: it.medicineId,
            qty: it.qty,
            unit_cost: Number(it.unit_cost ?? 0),
            weightKg: Number(it.weight_kg ?? it.weightKg ?? 0) 
          }))
        });
      }

      // Actualizar cabecera
      await tx.receipt.update({
        where: { id },
        data: {
          ...(supplierId ? { supplierId } : {}),
          ...(date ? { date: new Date(`${date}T00:00:00`) } : {}),
          notes: notes ?? null
        }
      });
    });

    res.json({ ok: true });
  } catch (e) {
    if (e?.code === 'STOCK_NEGATIVE') {
      return res.status(409).json({ error: 'No se puede editar la entrada', detail: e.message });
    }
    res.status(400).json({ error: 'No se pudo editar la entrada', detail: e.message });
  }
});

/**
 * Listar entradas con filtros
 * GET /api/receipts?...&q=nombreMed
 */
router.get('/', async (req, res) => {
  const { day, week, month, from, to, supplierId, q } = req.query;
  const where = {};
  if (supplierId) where.supplierId = Number(supplierId);

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

  const data = await prisma.receipt.findMany({
    where: {
      ...where,
      ...(q ? { items: { some: { medicine: { name: { contains: String(q) } } } } } : {})
    },
    orderBy: { date: 'desc' },
    include: {
      supplier: true,
      items: { include: { medicine: true } } // unit_cost viene en cada item
    }
  });
  res.json(data);
});

/**
 * Eliminar una entrada y revertir stock
 * DELETE /api/receipts/:id
 */
router.delete('/:id', async (req, res) => {
  const id = Number(req.params.id);
  try {
    await prisma.$transaction(async (tx) => {
      const items = await tx.receiptItem.findMany({
        where: { receiptId: id },
        select: { medicineId: true, qty: true }
      });

      // Validar que revertir no deje stock negativo
      for (const it of items) {
        const med = await tx.medicine.findUnique({ where: { id: it.medicineId } });
        if (med.stock - it.qty < 0) {
          const err = new Error(`No se puede eliminar: dejaría stock negativo para "${med.name}"`);
          err.code = 'STOCK_NEGATIVE';
          throw err;
        }
      }

      // Revertir stock
      for (const it of items) {
        await tx.medicine.update({
          where: { id: it.medicineId },
          data: { stock: { decrement: it.qty } }
        });
      }

      // Borrar items y cabecera
      await tx.receiptItem.deleteMany({ where: { receiptId: id } });
      await tx.receipt.delete({ where: { id } });
    });

    res.status(204).send();
  } catch (e) {
    if (e?.code === 'STOCK_NEGATIVE') {
      return res.status(409).json({ error: 'No se puede eliminar la entrada', detail: e.message });
    }
    return res.status(400).json({ error: 'No se pudo eliminar la entrada', detail: e?.message });
  }
});

export default router;