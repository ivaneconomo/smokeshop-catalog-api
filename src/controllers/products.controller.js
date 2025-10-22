import mongoose from 'mongoose';
import {
  getAllProducts,
  getNicDisposables,
  getHHCDisposables,
  getEdibles,
  updateFlavorAvailability,
} from '../services/products.services.js';
import { Product } from '../models/product.model.js';

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

export const updateFlavorAvailabilityController = async (req, res, next) => {
  try {
    // 1️⃣ Extraemos params y body
    const { productId, flavorId } = req.params;
    const { storeId, available } = req.body;

    // 2️⃣ Validaciones básicas
    if (
      !mongoose.isValidObjectId(productId) ||
      !mongoose.isValidObjectId(flavorId)
    ) {
      return res.status(400).json({ message: 'IDs inválidos' });
    }

    if (!['store_6', 'store_22', 'store_28'].includes(storeId)) {
      return res.status(400).json({ message: 'storeId inválido' });
    }

    if (typeof available !== 'boolean') {
      return res
        .status(400)
        .json({ message: 'available debe ser true o false' });
    }

    // 3️⃣ Actualización
    const updated = await Product.findOneAndUpdate(
      { _id: productId, 'flavors._id': flavorId },
      {
        $set: {
          [`flavors.$[flavor].available_location.${storeId}.available`]:
            available,
        },
      },
      {
        arrayFilters: [{ 'flavor._id': flavorId }],
        new: true,
        runValidators: true,
      }
    ).lean();

    // 4️⃣ Si no se encuentra el producto o flavor
    if (!updated) {
      return res
        .status(404)
        .json({ message: 'Producto o flavor no encontrado' });
    }

    // 5️⃣ Retorno limpio
    const flavor = updated.flavors.find(
      (f) => String(f._id) === String(flavorId)
    );
    return res.json({
      success: true,
      productId,
      flavorId,
      storeId,
      available,
      flavor,
    });
  } catch (err) {
    next(err);
  }
};
