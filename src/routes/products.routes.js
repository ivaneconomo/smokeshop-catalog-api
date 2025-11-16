// src/routes/products.routes.js
import { Router } from 'express';
import {
  getProductsByKindController,
  updateFlavorAvailabilityController,
  createFlavorController,
} from '../controllers/products.controller.js';

const router = Router();

router.get('/products', getProductsByKindController);

router.patch(
  '/products/:productId/flavors/:flavorId/availability',
  updateFlavorAvailabilityController
);

// NUEVO: crear sabor
router.post('/products/:productId/flavors', createFlavorController);

export default router;
