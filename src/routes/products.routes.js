// src/routes/products.routes.js
import { Router } from 'express';
import {
  getProductsByKindController,
  updateFlavorAvailabilityController,
  createFlavorController,
  createNicProductController, // 👈 NUEVO
} from '../controllers/products.controller.js';

const router = Router();

router.get('/products', getProductsByKindController);

router.patch(
  '/products/:productId/flavors/:flavnorId/availability',
  updateFlavorAvailabilityController
);

// NUEVO: crear sabor
router.post('/products/:productId/flavors', createFlavorController);

// NUEVO: crear vape de nicotina
router.post('/products/nic', createNicProductController);

export default router;
