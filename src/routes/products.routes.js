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
} from '../controllers/products.controller.js';

const router = Router();

router.get('/products', getProductsController);
router.post('/products', createProductController);
router.patch('/products/reorder', reorderProductsController);

router.patch(
  '/products/:productId/flavors/:flavorId/availability',
  updateFlavorAvailabilityController,
);

router.post('/products/:productId/flavors', createFlavorController);
router.post('/products/nic', createNicProductController);

router.get('/products/:id', getProductByIdController);
router.patch('/products/:id', updateProductController);

export default router;
