import { Router } from 'express';
import { prisma } from '../db.js';
const router = Router();

router.get('/low-stock', async (req, res) => {
  try {
    // Workaround: obtener todos y filtrar por stock mínimo
    const meds = await prisma.medicine.findMany({
      include: {
        parametros: true
      }
    });
    
    // Filtrar medicamentos con stock bajo (usando parámetros o valor por defecto)
    const lows = meds
      .map(med => {
        const minStock = med.parametros?.[0]?.stockMinimo || 10; // Valor por defecto 10
        return {
          ...med,
          min_stock: minStock,
          stockMinimo: minStock
        };
      })
      .filter(m => m.stock <= m.min_stock)
      .sort((a, b) => a.stock - b.stock);
    
    console.log(`⚠️ Medicamentos con stock bajo: ${lows.length}`);
    res.json(lows);
  } catch (error) {
    console.error('Error obteniendo stock bajo:', error);
    res.status(500).json({ 
      error: 'Error al obtener stock bajo',
      detail: error.message 
    });
  }
});

router.get('/top-customers', async (req, res) => {
  try {
    console.log('🔍 Obteniendo top clientes...');
    
    // Primero verificar si hay ventas
    const totalSales = await prisma.sale.count();
    const totalSaleItems = await prisma.saleItem.count();
    console.log(`📊 Total de ventas: ${totalSales}`);
    console.log(`📊 Total de items de venta: ${totalSaleItems}`);
    
    if (totalSales === 0 || totalSaleItems === 0) {
      console.log('⚠️ No hay ventas registradas');
      return res.json([]);
    }
    
    // Usar Prisma de forma nativa en lugar de SQL raw para mejor compatibilidad
    const customersWithSales = await prisma.customer.findMany({
      where: {
        sales: {
          some: {
            items: {
              some: {}
            }
          }
        }
      },
      include: {
        sales: {
          include: {
            items: true
          }
        }
      }
    });
    
    console.log(`📦 Clientes con ventas encontrados: ${customersWithSales.length}`);
    
    // Calcular totales manualmente
    const customerTotals = customersWithSales.map(customer => {
      const totalQty = customer.sales.reduce((sum, sale) => {
        return sum + sale.items.reduce((itemSum, item) => itemSum + item.qty, 0);
      }, 0);
      
      return {
        id: customer.id,
        name: customer.name,
        total_qty: totalQty
      };
    }).filter(c => c.total_qty > 0)
      .sort((a, b) => b.total_qty - a.total_qty)
      .slice(0, 10);
    
    console.log(`✅ Top ${customerTotals.length} clientes procesados:`);
    customerTotals.forEach((c, i) => {
      console.log(`   ${i + 1}. ${c.name}: ${c.total_qty} unidades`);
    });
    
    res.json(customerTotals);
  } catch (error) {
    console.error('❌ Error obteniendo top clientes:', error);
    console.error('Stack:', error.stack);
    res.status(500).json({ 
      error: 'Error al obtener top clientes',
      detail: error.message 
    });
  }
});

router.get('/stock', async (_req, res) => {
  const meds = await prisma.medicine.findMany({ orderBy: { name: 'asc' }});
  res.json(meds.map(m => ({ id: m.id, name: m.name, form: m.form, unit: m.unit, stock: m.stock, min_stock: m.min_stock })));
});

/**
 * GET /api/reports/supplier-suggestions
 * Obtiene sugerencias de proveedores según precio más bajo por medicamento
 */
router.get('/supplier-suggestions', async (_req, res) => {
  try {
    console.log('🔍 Obteniendo sugerencias de proveedores...');
    
    // Obtener todos los medicamentos que tengan precios (sin importar activo, luego filtraremos)
    let medicines = await prisma.medicine.findMany({
      where: {
        precios: {
          some: {}
        }
      },
      include: {
        precios: {
          include: {
            supplier: {
              select: {
                id: true,
                name: true,
                phone: true
              }
            }
          },
          orderBy: {
            precioCompraUnitario: 'asc'
          }
        }
      }
    });
    
    // Filtrar manualmente los precios activos (maneja true, 1, o si viene null/undefined)
    medicines = medicines.map(med => {
      // Filtrar precios activos - aceptar true, 1, o cualquier valor que no sea explícitamente false
      const activePrices = med.precios.filter(p => {
        const isActive = p.activo;
        // Solo excluir explícitamente false o 0, todo lo demás se considera activo
        return isActive !== false && isActive !== 0;
      });
      
      return {
        ...med,
        precios: activePrices
      };
    }).filter(med => med.precios.length > 0);
    
    console.log(`✅ Medicamentos con precios activos: ${medicines.length}`);

    // Procesar cada medicamento para encontrar el mejor precio
    const suggestions = medicines.map(medicine => {
      if (!medicine.precios || medicine.precios.length === 0) {
        return null;
      }

      // El primer precio es el más bajo (ordenado por precioCompraUnitario asc)
      const bestPrice = medicine.precios[0];
      const allPrices = medicine.precios;
      
      // Convertir Decimal de Prisma a número
      const bestPriceValue = typeof bestPrice.precioCompraUnitario === 'object' 
        ? parseFloat(bestPrice.precioCompraUnitario.toString()) 
        : parseFloat(bestPrice.precioCompraUnitario);
      
      // Contar cuántos proveedores tienen el mismo precio (o muy cercano, con diferencia < 0.01)
      const samePriceSuppliers = allPrices.filter(p => {
        const priceValue = typeof p.precioCompraUnitario === 'object' 
          ? parseFloat(p.precioCompraUnitario.toString()) 
          : parseFloat(p.precioCompraUnitario);
        return Math.abs(priceValue - bestPriceValue) < 0.01;
      });

      const suggestion = {
        medicineId: medicine.id,
        medicineCode: medicine.codigo,
        medicineName: medicine.nombreComercial,
        stock: Number(medicine.stock),
        bestPrice: bestPriceValue,
        bestPriceId: bestPrice.id,
        supplier: bestPrice.supplier ? {
          id: bestPrice.supplier.id,
          name: bestPrice.supplier.name,
          phone: bestPrice.supplier.phone || null
        } : null,
        isGeneric: !bestPrice.supplier,
        alternativeCount: allPrices.length - 1,
        samePriceCount: samePriceSuppliers.length - 1,
        allPrices: allPrices.map(p => {
          const priceValue = typeof p.precioCompraUnitario === 'object' 
            ? parseFloat(p.precioCompraUnitario.toString()) 
            : parseFloat(p.precioCompraUnitario);
          return {
            id: p.id,
            price: priceValue,
            supplier: p.supplier ? {
              id: p.supplier.id,
              name: p.supplier.name
            } : null,
            isGeneric: !p.supplier
          };
        })
      };

      return suggestion;
    }).filter(item => item !== null); // Filtrar nulls

    // Ordenar por stock bajo primero, luego por precio
    suggestions.sort((a, b) => {
      if (a.stock !== b.stock) {
        return a.stock - b.stock; // Menor stock primero
      }
      return a.bestPrice - b.bestPrice; // Menor precio primero
    });

    console.log(`📤 Enviando ${suggestions.length} sugerencias al frontend`);
    res.json(suggestions);
  } catch (error) {
    console.error('❌ Error obteniendo sugerencias de proveedores:', error);
    console.error('Stack:', error.stack);
    res.status(500).json({ 
      error: 'Error al obtener sugerencias de proveedores',
      detail: error.message 
    });
  }
});

export default router;