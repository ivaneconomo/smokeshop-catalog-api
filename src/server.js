import app from './app.js';

// PORT lo inyecta el host en producción (Railway, Render, etc.)
const port = process.env.PORT || 3000;

app.listen(port, () => console.log(`API on http://localhost:${port}`));
