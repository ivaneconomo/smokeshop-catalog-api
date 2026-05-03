import { Router } from 'express';
import {
  getKindVisibilityController,
  updateKindVisibilityController,
  getSubcategoriesController,
  updateSubcategoriesController,
} from '../controllers/settings.controller.js';

const router = Router();

router.get('/settings/kind-visibility', getKindVisibilityController);
router.patch('/settings/kind-visibility', updateKindVisibilityController);
router.get('/settings/subcategories', getSubcategoriesController);
router.patch('/settings/subcategories', updateSubcategoriesController);

export default router;
