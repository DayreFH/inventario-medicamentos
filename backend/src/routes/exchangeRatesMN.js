import { Router } from 'express';

const router = Router();

// Simulamos una base de datos en memoria para las tasas USD-MN
let currentRate = null;
let rateHistory = [];

/**
 * GET /api/exchange-rates-mn/current
 * Obtener la tasa de cambio actual USD-MN
 */
router.get('/current', async (req, res) => {
  try {
    if (!currentRate) {
      return res.status(404).json({
        error: 'No se encontró tasa de cambio',
        message: 'No hay tasa disponible para USD/MN'
      });
    }

    res.json({
      fromCurrency: currentRate.fromCurrency,
      toCurrency: currentRate.toCurrency,
      buyRate: parseFloat(currentRate.buyRate),
      sellRate: parseFloat(currentRate.sellRate),
      source: currentRate.source,
      date: currentRate.date,
      isActive: currentRate.isActive
    });
  } catch (error) {
    console.error('Error obteniendo tasa actual USD-MN:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor',
      detail: error.message 
    });
  }
});

/**
 * GET /api/exchange-rates-mn/history
 * Obtener historial de tasas de cambio USD-MN
 */
router.get('/history', async (req, res) => {
  try {
    const { days = 30 } = req.query;
    
    // Filtrar historial por días
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));
    
    const filteredHistory = rateHistory.filter(rate => 
      new Date(rate.date) >= startDate
    ).sort((a, b) => new Date(b.date) - new Date(a.date));
    
    res.json({
      fromCurrency: 'USD',
      toCurrency: 'MN',
      days: parseInt(days),
      rates: filteredHistory.map(rate => ({
        id: rate.id,
        buyRate: parseFloat(rate.buyRate),
        sellRate: parseFloat(rate.sellRate),
        source: rate.source,
        date: rate.date,
        isActive: rate.isActive,
        createdAt: rate.createdAt
      }))
    });
  } catch (error) {
    console.error('Error obteniendo historial USD-MN:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor',
      detail: error.message 
    });
  }
});

/**
 * POST /api/exchange-rates-mn/update
 * Actualizar tasa de cambio USD-MN manualmente
 */
router.post('/update', async (req, res) => {
  try {
    const { fromCurrency, toCurrency, buyRate, sellRate, source = 'manual' } = req.body;
    
    if (!fromCurrency || !toCurrency || !buyRate || !sellRate) {
      return res.status(400).json({
        error: 'Datos requeridos faltantes',
        message: 'Se requieren fromCurrency, toCurrency, buyRate y sellRate'
      });
    }

    const parsedBuyRate = parseFloat(buyRate);
    const parsedSellRate = parseFloat(sellRate);
    
    if (isNaN(parsedBuyRate) || isNaN(parsedSellRate) || 
        parsedBuyRate <= 0 || parsedSellRate <= 0) {
      return res.status(400).json({
        error: 'Tasas inválidas',
        message: 'Las tasas deben ser números positivos'
      });
    }

    if (parsedBuyRate >= parsedSellRate) {
      return res.status(400).json({
        error: 'Tasas inválidas',
        message: 'La tasa de venta debe ser mayor que la tasa de compra'
      });
    }

    // Desactivar tasa anterior
    if (currentRate) {
      currentRate.isActive = false;
    }

    // Crear nueva tasa
    const newRate = {
      id: Date.now(),
      fromCurrency,
      toCurrency,
      buyRate: parsedBuyRate,
      sellRate: parsedSellRate,
      source,
      date: new Date(),
      isActive: true,
      createdAt: new Date()
    };

    // Actualizar tasa actual
    currentRate = newRate;
    
    // Agregar al historial
    rateHistory.unshift(newRate);
    
    // Mantener solo los últimos 100 registros
    if (rateHistory.length > 100) {
      rateHistory = rateHistory.slice(0, 100);
    }

    res.status(201).json({
      message: 'Tasa de cambio USD-MN actualizada exitosamente',
      rate: {
        id: newRate.id,
        fromCurrency: newRate.fromCurrency,
        toCurrency: newRate.toCurrency,
        buyRate: newRate.buyRate,
        sellRate: newRate.sellRate,
        source: newRate.source,
        date: newRate.date,
        isActive: newRate.isActive
      }
    });
  } catch (error) {
    console.error('Error actualizando tasa USD-MN:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor',
      detail: error.message 
    });
  }
});

/**
 * DELETE /api/exchange-rates-mn/current
 * Eliminar la tasa actual
 */
router.delete('/current', async (req, res) => {
  try {
    if (currentRate) {
      currentRate.isActive = false;
      currentRate = null;
    }

    res.json({
      message: 'Tasa actual eliminada exitosamente'
    });
  } catch (error) {
    console.error('Error eliminando tasa actual:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor',
      detail: error.message 
    });
  }
});

export default router;



