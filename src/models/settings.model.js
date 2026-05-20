import mongoose from 'mongoose';
const { Schema, model, models } = mongoose;

// _id: false en todos los subdocumentos para que Mongoose no genere IDs innecesarios

// Una tienda física: id es el mismo que se usa como clave en available_location de los productos
const storeSchema = new Schema(
  {
    id:   { type: String, required: true },
    name: { type: String, required: true },
    logo: { type: String, default: '' },
  },
  { _id: false }
);

// Un componente activo en un tipo de producto (ej: hhc → "HHC")
// key coincide con los campos del modelo de producto (Kits.components, Edibles.components)
const componentDefSchema = new Schema(
  {
    key:   { type: String, required: true },
    label: { type: String, required: true },
  },
  { _id: false }
);

// Definición de un tipo de producto (kind).
// fields: lista de campos extra que ese kind usa (puffs, grams, flavors, etc.)
// components: los ingredientes/componentes seleccionables al crear/editar un producto de ese kind
const kindDefSchema = new Schema(
  {
    value:      { type: String, required: true },
    label:      { type: String, required: true },
    fields:     { type: [String], default: [] },
    components: { type: [componentDefSchema], default: [] },
  },
  { _id: false }
);

// Documento singleton: solo hay un registro de settings en la colección.
// Se accede siempre con findOneAndUpdate + upsert para crearlo si no existe.
const settingsSchema = new Schema(
  {
    // Kinds que no se muestran en el catálogo público (global, legacy)
    hidden_kinds: { type: [String], default: [] },

    // Kinds ocultos por tienda: { store_6: ['Kits'], store_8: [], ... }
    hidden_kinds_by_store: { type: Map, of: [String], default: {} },

    // Subcategorías de efecto (High, Relax, Trippy...) — editables desde el panel
    subcategories: {
      type: [{ name: { type: String }, emoji: { type: String, default: '' } }],
      default: [
        { name: 'High',   emoji: '🚀' },
        { name: 'Relax',  emoji: '🌊' },
        { name: 'Trippy', emoji: '🍄' },
      ],
      _id: false,
    },

    // Lista de tiendas físicas. Los ids deben coincidir con las claves de available_location en Flavor
    stores: {
      type: [storeSchema],
      default: [
        { id: 'store_6',  name: 'The Kings Shop',       logo: '/images/logo_kings.png' },
        { id: 'store_8',  name: 'PDC Smoke Shop',        logo: '/images/logo_pdc.png' },
        { id: 'store_22', name: 'Smoke Shop Souvenir',   logo: '/images/logo_souvenir.png' },
        { id: 'store_28', name: 'Exotic Smoke Shop',     logo: '/images/logo_exotic.png' },
      ],
    },

    // Tipos de producto disponibles con sus campos y componentes.
    // El front usa fields[] para saber qué inputs mostrar en create/edit.
    product_types: {
      type: [kindDefSchema],
      default: [
        {
          value: 'Nicotine',
          label: 'Nicotine disposable',
          fields: ['puffs', 'flavors'],
          components: [],
        },
        {
          value: 'Kits',
          label: 'HHC disposable',
          fields: ['grams', 'strains', 'components'],
          components: [
            { key: 'hhc',            label: 'HHC' },
            { key: 'd8',             label: 'Delta 8' },
            { key: 'd10',            label: 'Delta 10' },
            { key: 'cbd',            label: 'CBD' },
            { key: 'mushrooms',      label: 'Mushrooms' },
            { key: 'mushroom_blend', label: 'Mushroom Blend' },
          ],
        },
        {
          value: 'Edibles',
          label: 'Edible',
          fields: ['weight_g', 'servings', 'dosage_mg', 'flavors', 'components'],
          components: [
            { key: 'hhc',              label: 'HHC' },
            { key: 'd8',               label: 'Delta 8' },
            { key: 'd10',              label: 'Delta 10' },
            { key: 'cbd',              label: 'CBD' },
            { key: 'cbg',              label: 'CBG' },
            { key: 'cbn',              label: 'CBN' },
            { key: 'muscimol',         label: 'Muscimol' },
            { key: 'amanita_muscaria', label: 'Amanita' },
            { key: 'lion_mane',        label: "Lion's mane" },
            { key: 'reishi',           label: 'Reishi' },
            { key: 'cordyceps',        label: 'Cordyceps' },
            { key: 'turkey_tail',      label: 'Turkey tail' },
            { key: 'mad_honey',        label: 'Mad honey' },
            { key: 'mushroom_blend',   label: 'Mushroom Blend' },
          ],
        },
      ],
    },

    // Opciones de strain disponibles al crear/editar un Kit
    strains: {
      type: [String],
      default: ['Sativa', 'Indica', 'Hybrid'],
    },
  },
  { collection: 'settings' }
);

// models.Settings evita re-compilar el modelo si el módulo se recarga (hot-reload)
export const Settings =
  models.Settings || model('Settings', settingsSchema);
