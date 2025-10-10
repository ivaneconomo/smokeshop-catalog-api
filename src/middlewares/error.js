export function errorHandler(err, _req, res, _next) {
  const status = err.status || 500;
  const message = err.message || 'Error interno';
  res.status(status).json({ error: message });
}
