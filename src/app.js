import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import 'dotenv/config';
import './config/db.js';
import productsRoutes from './routes/products.routes.js';
import settingsRoutes from './routes/settings.routes.js';

const app = express();

app.use(express.json());
app.use(cors());
app.use(morgan('dev'));

app.use('/', productsRoutes);
app.use('/', settingsRoutes);

export default app;
