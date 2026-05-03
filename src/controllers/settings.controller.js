import { Settings } from '../models/settings.model.js';

const getSingleton = () =>
  Settings.findOneAndUpdate({}, {}, { upsert: true, new: true }).lean();

export const getKindVisibilityController = async (req, res) => {
  try {
    const doc = await getSingleton();
    res.json({ hidden_kinds: doc.hidden_kinds ?? [] });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

export const updateKindVisibilityController = async (req, res) => {
  try {
    const { hidden_kinds } = req.body;
    if (!Array.isArray(hidden_kinds))
      return res.status(400).json({ message: 'hidden_kinds debe ser un array' });

    const doc = await Settings.findOneAndUpdate(
      {},
      { $set: { hidden_kinds } },
      { upsert: true, new: true }
    ).lean();

    res.json({ hidden_kinds: doc.hidden_kinds });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

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
