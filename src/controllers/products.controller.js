import {
  getAllProducts,
  getNicDisposables,
  getHHCDisposables,
  getEdibles,
} from '../services/products.services.js';

export const getProductsByKindController = async (req, res) => {
  try {
    const kind = (req.query.kind || '').trim().toLowerCase();
    let data;

    switch (kind) {
      case 'nicdisposable':
      case 'nic':
        data = await getNicDisposables();
        break;
      case 'hhcdisposable':
      case 'hhc':
        data = await getHHCDisposables();
        break;
      case 'edible':
      case 'edibles':
        data = await getEdibles();
        break;
      default:
        data = await getNicDisposables();
        break;
    }

    res.json(data);
  } catch (error) {
    console.error('Error en getProductsByKindController:', error);
    res.status(500).json({ error: 'Error al obtener productos' });
  }
};
