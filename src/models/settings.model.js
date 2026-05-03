import mongoose from 'mongoose';
const { Schema, model, models } = mongoose;

const settingsSchema = new Schema(
  {
    hidden_kinds: { type: [String], default: [] },
    subcategories: {
      type: [{ name: { type: String }, emoji: { type: String, default: '' } }],
      default: [
        { name: 'High',   emoji: '🚀' },
        { name: 'Relax',  emoji: '🌊' },
        { name: 'Trippy', emoji: '🍄' },
      ],
      _id: false,
    },
  },
  { collection: 'settings' }
);

export const Settings =
  models.Settings || model('Settings', settingsSchema);
