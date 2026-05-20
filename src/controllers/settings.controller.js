import { Settings } from '../models/settings.model.js';

// Obtiene (o crea) el único documento de settings.
// upsert: crea si no existe; new: devuelve el documento actualizado.
// .lean() devuelve un objeto JS plano en vez de un documento Mongoose, lo que es más rápido para solo lectura.
const getSingleton = () =>
  Settings.findOneAndUpdate({}, {}, { upsert: true, new: true }).lean();

// ── Visibilidad de categorías ─────────────────────────────────────────────────

export const getKindVisibilityController = async (req, res) => {
  try {
    const doc = await getSingleton();
    const byStore = doc.hidden_kinds_by_store instanceof Map
      ? Object.fromEntries(doc.hidden_kinds_by_store)
      : (doc.hidden_kinds_by_store || {});
    res.json({ hidden_kinds_by_store: byStore });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

export const updateKindVisibilityController = async (req, res) => {
  try {
    const { store_id, hidden_kinds } = req.body;
    if (!store_id)
      return res.status(400).json({ message: 'store_id es obligatorio' });
    if (!Array.isArray(hidden_kinds))
      return res.status(400).json({ message: 'hidden_kinds debe ser un array' });

    const doc = await Settings.findOneAndUpdate(
      {},
      { $set: { [`hidden_kinds_by_store.${store_id}`]: hidden_kinds } },
      { upsert: true, new: true }
    ).lean();

    const byStore = doc.hidden_kinds_by_store instanceof Map
      ? Object.fromEntries(doc.hidden_kinds_by_store)
      : (doc.hidden_kinds_by_store || {});
    res.json({ hidden_kinds_by_store: byStore });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

// ── Subcategorías ─────────────────────────────────────────────────────────────

// Compatibilidad con registros viejos donde subcategories era array de strings
const normalizeSubs = (list = []) =>
  list.map((s) => (typeof s === 'string' ? { name: s, emoji: '' } : s));

export const getSubcategoriesController = async (req, res) => {
  try {
    const doc = await getSingleton();
    res.json({ subcategories: normalizeSubs(doc.subcategories) });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

export const updateSubcategoriesController = async (req, res) => {
  try {
    const { subcategories } = req.body;
    if (!Array.isArray(subcategories))
      return res.status(400).json({ message: 'subcategories debe ser un array' });

    const doc = await Settings.findOneAndUpdate(
      {},
      { $set: { subcategories } },
      { upsert: true, new: true }
    ).lean();

    res.json({ subcategories: doc.subcategories });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

// ── Tiendas ───────────────────────────────────────────────────────────────────

export const getStoresController = async (req, res) => {
  try {
    const doc = await getSingleton();
    res.json({ stores: doc.stores ?? [] });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

export const updateStoresController = async (req, res) => {
  try {
    const { stores } = req.body;
    if (!Array.isArray(stores))
      return res.status(400).json({ message: 'stores debe ser un array' });

    const doc = await Settings.findOneAndUpdate(
      {},
      { $set: { stores } },
      { upsert: true, new: true }
    ).lean();

    res.json({ stores: doc.stores });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

// ── Tipos de producto ─────────────────────────────────────────────────────────

export const getProductTypesController = async (req, res) => {
  try {
    const doc = await getSingleton();
    // Devuelve product_types y strains juntos porque el front los necesita a la vez
    res.json({
      product_types: doc.product_types ?? [],
      strains: doc.strains ?? [],
    });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

export const updateProductTypesController = async (req, res) => {
  try {
    const { product_types, strains } = req.body;

    // Permite actualizar solo product_types, solo strains, o ambos en el mismo PATCH
    const update = {};

    if (product_types !== undefined) {
      if (!Array.isArray(product_types))
        return res.status(400).json({ message: 'product_types debe ser un array' });
      update.product_types = product_types;
    }

    if (strains !== undefined) {
      if (!Array.isArray(strains))
        return res.status(400).json({ message: 'strains debe ser un array' });
      update.strains = strains;
    }

    const doc = await Settings.findOneAndUpdate(
      {},
      { $set: update },
      { upsert: true, new: true }
    ).lean();

    res.json({ product_types: doc.product_types, strains: doc.strains });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};
