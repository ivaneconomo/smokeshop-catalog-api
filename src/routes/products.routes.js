import { Router } from 'express';
import { body, param } from 'express-validator';
import {
  getProductsByKindController,
  updateFlavorAvailabilityController,
} from '../controllers/products.controller.js';
import validateRequest from '../middlewares/validateRequest.js';

const router = Router();

const flavorAvailabilityValidators = [
  param('productId').isMongoId().withMessage('productId inválido'),
  body('flavorId')
    .optional({ values: 'falsy' })
    .customSanitizer((value) => value?.trim())
    .bail()
    .isMongoId()
    .withMessage('flavorId inválido'),
  body('flavorName')
    .optional({ values: 'falsy' })
    .isString()
    .withMessage('flavorName debe ser texto')
    .bail()
    .trim(),
  body()
    .custom(({ flavorId, flavorName }) => {
      if (!flavorId && !flavorName) {
        throw new Error('Debes enviar flavorId o flavorName');
      }
      return true;
    })
    .withMessage('Debes enviar flavorId o flavorName'),
  body('storeId')
    .exists({ checkFalsy: true })
    .withMessage('storeId es requerido')
    .bail()
    .isString()
    .withMessage('storeId debe ser texto')
    .bail()
    .trim()
    .custom((value) => {
      if (value.includes('.') || value.includes('$')) {
        throw new Error('storeId no puede contener "." ni "$"');
      }
      return true;
    }),
  body('available')
    .exists()
    .withMessage('available es requerido')
    .bail()
    .isBoolean()
    .withMessage('available debe ser booleano')
    .toBoolean(),
];

// ✅ solo esta ruta
router.get('/products', getProductsByKindController);
router.patch(
  '/products/:productId/flavors/availability',
  flavorAvailabilityValidators,
  validateRequest,
  updateFlavorAvailabilityController
);

export default router;
