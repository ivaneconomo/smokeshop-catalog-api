import { Router } from 'express';
import {
  getProductsByKindController,
  updateFlavorAvailabilityController,
} from '../controllers/products.controller.js';

const router = Router();

// ✅ solo esta ruta
router.get('/products', getProductsByKindController);
router.patch(
  '/products/:productId/flavors/availability',
  updateFlavorAvailabilityController
);

export default router;
