import { Router } from 'express';
import { body, param } from 'express-validator';
import {
  getProductsByKindController,
  updateFlavorAvailabilityController,
} from '../controllers/products.controller.js';

const router = Router();

router.get('/products', getProductsByKindController);

router.patch(
  '/products/:productId/flavors/:flavorId/availability',
  updateFlavorAvailabilityController
);

export default router;
