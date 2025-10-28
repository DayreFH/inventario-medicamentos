import { Router } from 'express';

const router = Router();

// Simulamos una base de datos en memoria para las tasas de envío
let currentRate = null;
let rateHistory = [];

/**
 * GET /api/shipping-rates/current
 * Obtener la tasa de envío actual
 */
router.get('/current', async (req, res) => {
  try {
    if (!currentRate) {
      return res.status(404).json({
        error: 'No se encontró tasa de envío',
        message: 'No hay tasas de envío configuradas'
      });
    }

    res.json({
      fromCurrency: currentRate.fromCurrency,
      toCurrency: currentRate.toCurrency,
      domesticRate: parseFloat(currentRate.domesticRate),
      internationalRate: parseFloat(currentRate.internationalRate),
      weight: parseFloat(currentRate.weight),
      description: currentRate.description,
      source: currentRate.source,
      date: currentRate.date,
      isActive: currentRate.isActive
    });
  } catch (error) {
    console.error('Error obteniendo tasa actual de envío:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor',
      detail: error.message 
    });
  }
});

/**
 * GET /api/shipping-rates/history
 * Obtener historial de tasas de envío
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
      toCurrency: 'DOP',
      days: parseInt(days),
      rates: filteredHistory.map(rate => ({
        id: rate.id,
        domesticRate: parseFloat(rate.domesticRate),
        internationalRate: parseFloat(rate.internationalRate),
        weight: parseFloat(rate.weight),
        description: rate.description,
        source: rate.source,
        date: rate.date,
        isActive: rate.isActive,
        createdAt: rate.createdAt
      }))
    });
  } catch (error) {
    console.error('Error obteniendo historial de envío:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor',
      detail: error.message 
    });
  }
});

/**
 * POST /api/shipping-rates/update
 * Actualizar tasa de envío manualmente
 */
router.post('/update', async (req, res) => {
  try {
    const { 
      fromCurrency, 
      toCurrency, 
      domesticRate, 
      internationalRate, 
      weight, 
      description = '',
      source = 'manual' 
    } = req.body;
    
    if (!fromCurrency || !toCurrency || !domesticRate || !internationalRate || !weight) {
      return res.status(400).json({
        error: 'Datos requeridos faltantes',
        message: 'Se requieren fromCurrency, toCurrency, domesticRate, internationalRate y weight'
      });
    }

    const parsedDomesticRate = parseFloat(domesticRate);
    const parsedInternationalRate = parseFloat(internationalRate);
    const parsedWeight = parseFloat(weight);
    
    if (isNaN(parsedDomesticRate) || isNaN(parsedInternationalRate) || isNaN(parsedWeight) ||
        parsedDomesticRate <= 0 || parsedInternationalRate <= 0 || parsedWeight <= 0) {
      return res.status(400).json({
        error: 'Valores inválidos',
        message: 'Las tasas y el peso deben ser números positivos'
      });
    }

    if (parsedInternationalRate <= parsedDomesticRate) {
      return res.status(400).json({
        error: 'Tasas inválidas',
        message: 'La tasa internacional debe ser mayor que la tasa nacional'
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
      domesticRate: parsedDomesticRate,
      internationalRate: parsedInternationalRate,
      weight: parsedWeight,
      description: description.trim(),
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
      message: 'Tasas de envío actualizadas exitosamente',
      rate: {
        id: newRate.id,
        fromCurrency: newRate.fromCurrency,
        toCurrency: newRate.toCurrency,
        domesticRate: newRate.domesticRate,
        internationalRate: newRate.internationalRate,
        weight: newRate.weight,
        description: newRate.description,
        source: newRate.source,
        date: newRate.date,
        isActive: newRate.isActive
      }
    });
  } catch (error) {
    console.error('Error actualizando tasas de envío:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor',
      detail: error.message 
    });
  }
});

/**
 * DELETE /api/shipping-rates/current
 * Eliminar la tasa actual
 */
router.delete('/current', async (req, res) => {
  try {
    if (currentRate) {
      currentRate.isActive = false;
      currentRate = null;
    }

    res.json({
      message: 'Tasas de envío eliminadas exitosamente'
    });
  } catch (error) {
    console.error('Error eliminando tasas de envío:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor',
      detail: error.message 
    });
  }
});

/**
 * GET /api/shipping-rates/calculate
 * Calcular costo de envío basado en peso
 */
router.get('/calculate', async (req, res) => {
  try {
    const { weight, type = 'domestic' } = req.query;
    
    if (!currentRate) {
      return res.status(404).json({
        error: 'No hay tasas configuradas',
        message: 'Configure las tasas de envío primero'
      });
    }

    const parsedWeight = parseFloat(weight);
    if (isNaN(parsedWeight) || parsedWeight <= 0) {
      return res.status(400).json({
        error: 'Peso inválido',
        message: 'El peso debe ser un número positivo'
      });
    }

    const baseWeight = currentRate.weight;
    const baseRate = type === 'international' ? currentRate.internationalRate : currentRate.domesticRate;
    
    // Calcular costo proporcional al peso
    const calculatedRate = (parsedWeight / baseWeight) * baseRate;

    res.json({
      weight: parsedWeight,
      type: type,
      baseWeight: baseWeight,
      baseRate: baseRate,
      calculatedRate: Math.round(calculatedRate * 100) / 100,
      currency: 'USD'
    });
  } catch (error) {
    console.error('Error calculando costo de envío:', error);
    res.status(500).json({ 
      error: 'Error interno del servidor',
      detail: error.message 
    });
  }
});

export default router;



