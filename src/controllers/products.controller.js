import mongoose from 'mongoose';
import {
  getAllProducts,
  getNicDisposables,
  getHHCDisposables,
  getEdibles,
  updateFlavorAvailability,
} from '../services/products.services.js';

export const getProductsByKindController = async (req, res) => {
  try {
    const kind = (req.query.kind || '').trim().toLowerCase();
    let data;

    switch (kind) {
      case 'nicdisposable':
      case 'nic':
        data = await getNicDisposables();
        break;
      case 'hhcdisposable':
      case 'hhc':
        data = await getHHCDisposables();
        break;
      case 'edible':
      case 'edibles':
        data = await getEdibles();
        break;
      default:
        data = await getNicDisposables();
        break;
    }

    res.json(data);
  } catch (error) {
    console.error('Error en getProductsByKindController:', error);
    res.status(500).json({ error: 'Error al obtener productos' });
  }
};

export const updateFlavorAvailabilityController = async (req, res) => {
  try {
    const { productId } = req.params;
    const { flavorName, storeId, available } = req.body ?? {};

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ error: 'productId inválido' });
    }

    const normalizedFlavorName = (flavorName || '').trim();
    if (!normalizedFlavorName) {
      return res.status(400).json({ error: 'flavorName es requerido' });
    }

    const normalizedStoreId = (storeId || '').trim();
    if (!normalizedStoreId) {
      return res.status(400).json({ error: 'storeId es requerido' });
    }

    if (normalizedStoreId.includes('.') || normalizedStoreId.includes('$')) {
      return res
        .status(400)
        .json({ error: 'storeId no puede contener "." ni "$"' });
    }

    if (typeof available !== 'boolean') {
      return res.status(400).json({ error: 'available debe ser booleano' });
    }

    const result = await updateFlavorAvailability({
      productId,
      flavorName: normalizedFlavorName,
      storeId: normalizedStoreId,
      available,
    });

    if (!result.ok) {
      if (result.reason === 'not_found') {
        return res
          .status(404)
          .json({ error: 'Producto o sabor no encontrado' });
      }

      return res.status(500).json({ error: 'No se pudo actualizar la disponibilidad' });
    }

    return res.json({ message: 'Disponibilidad actualizada correctamente' });
  } catch (error) {
    console.error('Error en updateFlavorAvailabilityController:', error);
    res.status(500).json({ error: 'Error al actualizar disponibilidad del sabor' });
  }
};
