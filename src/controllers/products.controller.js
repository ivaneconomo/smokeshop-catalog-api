import mongoose from 'mongoose';
import {
  getAllProducts,
  addFlavorToProductService,
  createProductService,
  createNicProductService,
  reorderProductsService,
  getProductByIdService,
  updateProductService,
} from '../services/products.services.js';

import { Product } from '../models/product.model.js';

export const getProductsController = async (req, res) => {
  try {
    const data = await getAllProducts();
    res.json(data);
  } catch (error) {
    console.error('Error en getProductsController:', error);
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

    if (!storeId || typeof storeId !== 'string') {
      return res.status(400).json({ message: 'storeId inválido' });
    }

    if (typeof available !== 'boolean') {
      return res
        .status(400)
        .json({ message: 'available debe ser true o false' });
    }

    // 3️⃣ Actualización con arrayFilters para editar el subdocumento correcto sin traer todo el array
    // .lean() devuelve un POJO plano, más rápido y suficiente para serializar la respuesta
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
      },
    ).lean();

    // 4️⃣ Si no se encuentra el producto o flavor
    if (!updated) {
      return res
        .status(404)
        .json({ message: 'Producto o flavor no encontrado' });
    }

    // 5️⃣ Retorno limpio
    const flavor = updated.flavors.find(
      (f) => String(f._id) === String(flavorId),
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

export const createFlavorController = async (req, res) => {
  try {
    const { productId } = req.params;
    const { name, color, available_location } = req.body;

    if (!name) {
      return res
        .status(400)
        .json({ message: 'El campo "name" es obligatorio.' });
    }

    const { product, flavor } = await addFlavorToProductService({
      productId,
      name,
      color,
      available_location,
    });

    return res.status(201).json({
      message: 'Sabor creado correctamente',
      flavor,
      product,
    });
  } catch (err) {
    console.error('[createFlavorController] error:', err);

    if (err.code === 'NOT_FOUND') {
      return res.status(404).json({ message: err.message });
    }
    if (err.code === 'DUPLICATED_FLAVOR') {
      return res.status(409).json({ message: err.message });
    }

    return res.status(500).json({
      message: 'Error al crear sabor',
      error: err.message,
    });
  }
};

export const reorderProductsController = async (req, res) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0)
      return res.status(400).json({ ok: false, message: 'ids requerido' });
    await reorderProductsService(ids);
    res.json({ ok: true });
  } catch (error) {
    res.status(500).json({ ok: false, message: error.message });
  }
};

export const getProductByIdController = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id))
      return res.status(400).json({ message: 'ID inválido' });

    const product = await getProductByIdService(id);
    if (!product) return res.status(404).json({ message: 'Producto no encontrado' });

    res.json(product);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

export const updateProductController = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id))
      return res.status(400).json({ message: 'ID inválido' });

    const product = await updateProductService(id, req.body);
    res.json({ ok: true, product });
  } catch (e) {
    if (e.code === 'NOT_FOUND') return res.status(404).json({ message: e.message });
    const status = e.name === 'ValidationError' ? 400 : 500;
    res.status(status).json({ ok: false, message: e.message });
  }
};

export const createNicProductController = async (req, res) => {
  try {
    const product = await createNicProductService(req.body);

    res.status(201).json({
      ok: true,
      product,
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      message: error.message,
    });
  }
};

export const createProductController = async (req, res) => {
  try {
    const product = await createProductService(req.body);

    res.status(201).json({
      ok: true,
      product,
    });
  } catch (error) {
    // 11000 = duplicate key de MongoDB (índice único brand+model+kind)
    const status =
      ['INVALID_KIND', 11000].includes(error.code) ||
      error.name === 'ValidationError'
        ? 400
        : 500;

    res.status(status).json({
      ok: false,
      message:
        error.code === 11000
          ? 'Ya existe un producto con esa marca, modelo y categoría'
          : error.message,
    });
  }
};
