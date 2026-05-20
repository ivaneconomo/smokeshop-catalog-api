import { Router } from 'express';
import {
  getKindVisibilityController,
  updateKindVisibilityController,
  getSubcategoriesController,
  updateSubcategoriesController,
  getStoresController,
  updateStoresController,
  getProductTypesController,
  updateProductTypesController,
} from '../controllers/settings.controller.js';

const router = Router();

// ── Configuración del catálogo ────────────────────────────────────────────────
router.get('/settings/kind-visibility', getKindVisibilityController);
router.patch('/settings/kind-visibility', updateKindVisibilityController);

// ── Subcategorías de efecto ───────────────────────────────────────────────────
router.get('/settings/subcategories', getSubcategoriesController);
router.patch('/settings/subcategories', updateSubcategoriesController);

// ── Tiendas físicas ───────────────────────────────────────────────────────────
router.get('/settings/stores', getStoresController);
router.patch('/settings/stores', updateStoresController);

// ── Tipos de producto y strains ───────────────────────────────────────────────
router.get('/settings/product-types', getProductTypesController);
router.patch('/settings/product-types', updateProductTypesController);

export default router;
