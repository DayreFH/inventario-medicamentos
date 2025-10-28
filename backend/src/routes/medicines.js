// backend/src/routes/medicines.js
import { Router } from 'express';
import { prisma } from '../db.js';

const router = Router();

/** Normaliza el precio recibido desde el frontend */
function normPrice(p) {
  if (p === undefined || p === null || p === '') return 0;
  const n = Number(p);
  return Number.isFinite(n) && n >= 0 ? Number(n.toFixed(2)) : 0;
}

/** Calcula precio de venta basado en margen de utilidad */
function calcularPrecioVenta(precioCompra, margenUtilidad) {
  const margenDecimal = margenUtilidad / 100;
  const factor = 1 - margenDecimal;
  return factor > 0 ? precioCompra / factor : precioCompra;
}

/**
 * GET /api/medicines
 * Lista medicamentos con sus precios y parámetros
 */
router.get('/', async (req, res) => {
  const q = (req.query.q || '').trim();
  try {
    const data = await prisma.medicine.findMany({
      where: q ? { 
        OR: [
          { nombreComercial: { contains: q } },
          { nombreGenerico: { contains: q } },
          { codigo: { contains: q } }
        ]
      } : undefined,
      include: {
        precios: { where: { activo: true } },
        parametros: true
      },
      orderBy: { nombreComercial: 'asc' },
    });
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: 'No se pudo listar medicamentos', detail: e.message });
  }
});

/**
 * GET /api/medicines/:id
 * Obtiene un medicamento por id con precios y parámetros
 */
router.get('/:id', async (req, res) => {
  const id = Number(req.params.id);
  try {
    const med = await prisma.medicine.findUnique({ 
      where: { id },
      include: {
        precios: { where: { activo: true } },
        parametros: true
      }
    });
    if (!med) return res.status(404).json({ error: 'Medicamento no encontrado' });
    res.json(med);
  } catch (e) {
    res.status(400).json({ error: 'No se pudo obtener el medicamento', detail: e.message });
  }
});

/**
 * POST /api/medicines
 * Crea un medicamento
 */
router.post('/', async (req, res) => {
  const { 
    codigo, 
    nombreComercial, 
    nombreGenerico, 
    formaFarmaceutica, 
    concentracion, 
    presentacion, 
    fechaVencimiento, 
    pesoKg 
  } = req.body;
  
  try {
    const med = await prisma.medicine.create({
      data: {
        codigo: String(codigo ?? '').trim(),
        nombreComercial: String(nombreComercial ?? '').trim(),
        nombreGenerico: String(nombreGenerico ?? '').trim(),
        formaFarmaceutica: formaFarmaceutica ?? 'comprimidos',
        concentracion: concentracion ?? 'mg',
        presentacion: presentacion ?? 'blister',
        fechaVencimiento: fechaVencimiento ? new Date(fechaVencimiento) : null,
        pesoKg: normPrice(pesoKg),
      },
    });
    res.status(201).json(med);
  } catch (e) {
    if (e?.code === 'P2002') {
      return res.status(409).json({
        error: 'Duplicado',
        detail: 'Ya existe un medicamento con el mismo código.',
      });
    }
    res.status(400).json({ error: 'No se pudo crear el medicamento', detail: e.message });
  }
});

/**
 * PUT /api/medicines/:id
 * Actualiza un medicamento
 */
router.put('/:id', async (req, res) => {
  const id = Number(req.params.id);
  const { 
    codigo, 
    nombreComercial, 
    nombreGenerico, 
    formaFarmaceutica, 
    concentracion, 
    presentacion, 
    fechaVencimiento, 
    pesoKg 
  } = req.body;

  try {
    const med = await prisma.medicine.update({
      where: { id },
      data: {
        ...(codigo !== undefined ? { codigo: String(codigo).trim() } : {}),
        ...(nombreComercial !== undefined ? { nombreComercial: String(nombreComercial).trim() } : {}),
        ...(nombreGenerico !== undefined ? { nombreGenerico: String(nombreGenerico).trim() } : {}),
        ...(formaFarmaceutica !== undefined ? { formaFarmaceutica } : {}),
        ...(concentracion !== undefined ? { concentracion } : {}),
        ...(presentacion !== undefined ? { presentacion } : {}),
        ...(fechaVencimiento !== undefined ? { fechaVencimiento: fechaVencimiento ? new Date(fechaVencimiento) : null } : {}),
        ...(pesoKg !== undefined ? { pesoKg: normPrice(pesoKg) } : {}),
      },
    });
    res.json(med);
  } catch (e) {
    if (e?.code === 'P2002') {
      return res.status(409).json({
        error: 'Duplicado',
        detail: 'Ya existe un medicamento con el mismo código.',
      });
    }
    res.status(400).json({ error: 'No se pudo actualizar', detail: e.message });
  }
});

/**
 * POST /api/medicines/:id/precios
 * Agrega un precio a un medicamento
 */
router.post('/:id/precios', async (req, res) => {
  const id = Number(req.params.id);
  const { precioCompraUnitario, margenUtilidad, precioLimiteDescuento } = req.body;
  
  try {
    const precioVentaUnitario = calcularPrecioVenta(precioCompraUnitario, margenUtilidad);
    
    const precio = await prisma.medicinePrice.create({
      data: {
        medicineId: id,
        precioCompraUnitario: normPrice(precioCompraUnitario),
        margenUtilidad: normPrice(margenUtilidad),
        precioVentaUnitario: normPrice(precioVentaUnitario),
        precioLimiteDescuento: precioLimiteDescuento ? normPrice(precioLimiteDescuento) : null,
      },
    });
    res.status(201).json(precio);
  } catch (e) {
    res.status(400).json({ error: 'No se pudo agregar el precio', detail: e.message });
  }
});

/**
 * PUT /api/medicines/:id/parametros
 * Actualiza parámetros de un medicamento
 */
router.put('/:id/parametros', async (req, res) => {
  const id = Number(req.params.id);
  const { stockMinimo, alertaCaducidad, tiempoSinMovimiento } = req.body;
  
  try {
    const param = await prisma.medicineParam.upsert({
      where: { medicineId: id },
      update: {
        stockMinimo: Number(stockMinimo) || 10,
        alertaCaducidad: Number(alertaCaducidad) || 30,
        tiempoSinMovimiento: Number(tiempoSinMovimiento) || 90,
      },
      create: {
        medicineId: id,
        stockMinimo: Number(stockMinimo) || 10,
        alertaCaducidad: Number(alertaCaducidad) || 30,
        tiempoSinMovimiento: Number(tiempoSinMovimiento) || 90,
      },
    });
    res.json(param);
  } catch (e) {
    res.status(400).json({ error: 'No se pudo actualizar los parámetros', detail: e.message });
  }
});

/**
 * DELETE /api/medicines/:id
 * Elimina un medicamento
 */
router.delete('/:id', async (req, res) => {
  const id = Number(req.params.id);
  try {
    await prisma.medicine.delete({ where: { id } });
    res.status(204).send();
  } catch (e) {
    if (e?.code === 'P2003') {
      return res.status(409).json({
        error: 'No se puede eliminar el medicamento',
        detail: 'Tiene movimientos (entradas o salidas) asociados.',
      });
    }
    res.status(400).json({ error: 'No se pudo eliminar', detail: e.message });
  }
});

/**
 * GET /api/medicines/:id/prices
 * Obtener precios de un medicamento por proveedor
 */
router.get('/:id/prices', async (req, res) => {
  try {
    const { id } = req.params;
    const { supplierId } = req.query;
    
    // Para simplificar, retornamos precios de ejemplo
    // En una implementación real, esto vendría de la base de datos
    const examplePrices = [
      {
        id: 1,
        medicineId: parseInt(id),
        precioCompraUnitario: 25.50,
        margenUtilidad: 30.0,
        precioVentaUnitario: 33.15,
        precioLimiteDescuento: 30.00,
        activo: true
      },
      {
        id: 2,
        medicineId: parseInt(id),
        precioCompraUnitario: 24.00,
        margenUtilidad: 35.0,
        precioVentaUnitario: 32.40,
        precioLimiteDescuento: 29.00,
        activo: true
      }
    ];

    res.json(examplePrices);
  } catch (error) {
    console.error('Error obteniendo precios:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor',
      detail: error.message 
    });
  }
});

export default router;