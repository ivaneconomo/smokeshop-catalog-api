import rateLimit from 'express-rate-limit';

/**
 * Límite general: 100 requests / 15 min por IP
 * Aplica a todas las rutas /api/*
 */
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: 'draft-7', // X-RateLimit-* y RateLimit-* (mejor soporte)
  legacyHeaders: false,
  message: { error: 'Demasiadas solicitudes, intenta más tarde.' },
});

/**
 * Límite más estricto para escritura (POST/PATCH/DELETE):
 * 30 requests / 15 min por IP
 */
export const writeLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { error: 'Demasiadas operaciones de escritura.' },
});
