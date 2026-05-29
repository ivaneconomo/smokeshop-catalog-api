// src/routes/products.routes.js
import { Router } from 'express';
import {
  getProductsController,
  getProductByIdController,
  updateFlavorAvailabilityController,
  createFlavorController,
  createNicProductController,
  createProductController,
  reorderProductsController,
  updateProductController,
  archiveProductController,
  deleteProductController,
} from '../controllers/products.controller.js';

const router = Router();

router.get('/products', getProductsController);
router.post('/products', createProductController);
// /reorder antes de /:id para que Express no interprete "reorder" como un id
router.patch('/products/reorder', reorderProductsController);

router.patch(
  '/products/:productId/flavors/:flavorId/availability',
  updateFlavorAvailabilityController,
);

router.post('/products/:productId/flavors', createFlavorController);
// Ruta específica de nicotina (legacy o creación guiada)
router.post('/products/nic', createNicProductController);

router.get('/products/:id', getProductByIdController);
router.patch('/products/:id', updateProductController);
router.patch('/products/:id/archive', archiveProductController);
router.delete('/products/:id', deleteProductController);

export default router;
