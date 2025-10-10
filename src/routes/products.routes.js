import { Router } from 'express';
import { getProductsByKindController } from '../controllers/products.controller.js';

const router = Router();

// ✅ solo esta ruta
router.get('/products', getProductsByKindController);

export default router;
