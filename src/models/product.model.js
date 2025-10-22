// src/models/product.model.js
import mongoose from 'mongoose';
const { Schema, model, models } = mongoose;

/** Subdocumentos */
const LocationAvailabilitySchema = new Schema(
  {
    available: { type: Boolean, default: true },
    quantity: { type: Number, min: 0, default: 0 },
  },
  { _id: false }
);

const FlavorSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    color: { type: String, default: 'white', trim: true },
    available_location: {
      type: Map,
      of: LocationAvailabilitySchema,
      default: () => new Map(),
      _id: false,
    },
  },
  { _id: true }
);

// NUEVO: strains con metadatos por tienda
const StrainSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      enum: ['Sativa', 'Indica', 'Hybrid'],
    },
    available_location: {
      type: Map,
      of: LocationAvailabilitySchema,
      default: () => new Map(),
    },
  },
  { _id: false }
);

/** BASE */
const base = new Schema(
  {
    // 🔹 SIN client_id: usaremos _id de MongoDB
    brand: { type: String, required: true, trim: true, index: true },
    model: { type: String, required: true, trim: true, index: true },

    image: { type: String, required: false, trim: true },
    description: { type: String, default: '', trim: true },

    category: { type: String, required: true, trim: true, index: true }, // texto visible en UI
    kind: { type: String, required: true, index: true }, // 'NicDisposable' | 'HHCDisposable' | 'Edible'

    min_price: { type: Number, required: true, min: 0 },
    suggested_price: { type: Number, required: true, min: 0 },

    flavors: { type: [FlavorSchema], default: [] },

    on_sale: { type: Boolean, default: false },
    on_featured: { type: Boolean, default: false },

    like_count: { type: Number, default: 0, min: 0 },
    available: { type: Boolean, default: true },
  },
  { timestamps: true, discriminatorKey: 'kind' }
);

/** Validación base de precios */
base.pre('validate', function (next) {
  if (
    typeof this.min_price === 'number' &&
    typeof this.suggested_price === 'number' &&
    this.suggested_price < this.min_price
  ) {
    return next(new Error('suggested_price no puede ser menor que min_price'));
  }
  next();
});

/** Índices base */
base.index({ brand: 1, model: 1 });
base.index({ category: 1, on_featured: 1, on_sale: 1, available: 1 });
// Unicidad por combinación (sirve para upsert limpio)
base.index({ brand: 1, model: 1, kind: 1 }, { unique: true });

export const Product = models.Product || model('Product', base, 'products');

/** Discriminadores */
// 1) Vapes Nicotina
export const NicDisposable = Product.discriminator(
  'NicDisposable',
  new Schema({
    puffs: { type: Number, default: 0, min: 0, index: true },
  })
);

// 2) Dispos HHC
export const HHCDisposable = Product.discriminator(
  'HHCDisposable',
  new Schema({
    grams: { type: Number, min: 0 }, // 1g, 2g
    components: {
      hhc: { type: Boolean, default: false },
      d8: { type: Boolean, default: false },
      d10: { type: Boolean, default: false },
      cbd: { type: Boolean, default: false },
      mushrooms: { type: Boolean, default: false },
    },
    // 🔹 AHORA es un array de subdocs con metadatos por tienda
    strains: { type: [StrainSchema], default: [] },
    live_resin: { type: Boolean, default: false },
    liquid_diamond: { type: Boolean, default: false },
  })
);

// Validación opcional: evitar strains duplicadas dentro del array
HHCDisposable.schema.path('strains').validate(function (arr) {
  const names = arr.map((s) => s.name);
  return names.length === new Set(names).size;
}, 'No repitas la misma strain en "strains".');

// 3) Comestibles (HHC / CBD / hongos)
export const Edible = Product.discriminator(
  'Edible',
  new Schema({
    weight_g: { type: Number, min: 0 }, // peso total por empaque
    servings: { type: Number, min: 1 }, // piezas por empaque
    dosage_mg: { type: Number, min: 0 }, // mg de activo por pieza
    components: {
      hhc: { type: Boolean, default: false },
      d8: { type: Boolean, default: false },
      d10: { type: Boolean, default: false },
      cbd: { type: Boolean, default: false },
      cbg: { type: Boolean, default: false },
      cbn: { type: Boolean, default: false },
      muscimol: { type: Boolean, default: false },
      amanita_muscaria: { type: Boolean, default: false },
      lion_mane: { type: Boolean, default: false },
      reishi: { type: Boolean, default: false },
      cordyceps: { type: Boolean, default: false },
      turkey_tail: { type: Boolean, default: false },
      mad_honey: { type: Boolean, default: false },
    },
  })
);
