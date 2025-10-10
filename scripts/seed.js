// scripts/seed.js
import 'dotenv/config';
import mongoose from 'mongoose';
import {
  Product,
  NicDisposable,
  HHCDisposable,
  Edible,
} from '../src/models/product.model.js';
import PRODUCTS from '../src/seed/products.js';

const {
  MONGODB_URI,
  MONGODB_DB,
  SEED_MODE = 'reset', // "reset" | "upsert"
  ALLOW_DROP = 'false', // si "true" y reset, intenta drop
} = process.env;

if (!MONGODB_URI) {
  console.error('Falta MONGODB_URI en .env');
  process.exit(1);
}

async function connect() {
  await mongoose.connect(MONGODB_URI, { dbName: MONGODB_DB || undefined });
  console.log('✅ Conectado a MongoDB');
}

/** Limpieza de colección products */
async function cleanCollection() {
  const coll = Product.collection.collectionName;

  if (ALLOW_DROP === 'true') {
    try {
      await Product.collection.drop();
      console.log(`💣 drop -> colección "${coll}" eliminada`);
      return;
    } catch (e) {
      if (e.code === 26) {
        console.log(`ℹ️ La colección "${coll}" no existía (NamespaceNotFound)`);
        return;
      }
      throw e;
    }
  }

  const r = await Product.deleteMany({});
  console.log(
    `🧹 deleteMany -> ${r.deletedCount} docs eliminados en "${coll}"`
  );
}

/** Helpers para castear estructuras anidadas */
const toLoc = (o) => o ?? {};
const toFlavor = (f = {}) => ({
  name: String(f?.name ?? '').trim(),
  color: String(f?.color ?? 'white').trim(),
  // Objeto plano -> Mongoose lo castea a Map<String, {available, quantity}>
  available_location: toLoc(f?.available_location),
});
const toStrain = (s = {}) => ({
  name: String(s?.name ?? '').trim(), // 'Sativa' | 'Indica' | 'Hybrid' (enum)
  available_location: toLoc(s?.available_location),
});

/** Normaliza + separa por discriminador */
function normalizeAndSplit(raw) {
  const nic = [];
  const hhc = [];
  const ed = [];

  for (const p of raw) {
    const base = {
      brand: p.brand != null ? String(p.brand).trim() : '', // opcional
      model: p.model != null ? String(p.model).trim() : '',
      image: String(p.image ?? '').trim(),
      description: String(p.description ?? ''),
      category: String(p.category ?? '').trim(),
      kind: String(p.kind ?? '').trim(),
      min_price: Number(p.min_price),
      suggested_price: Number(p.suggested_price),
      flavors: Array.isArray(p.flavors) ? p.flavors.map(toFlavor) : [],
      on_sale: Boolean(p.on_sale ?? false),
      on_featured: Boolean(p.on_featured ?? false),
      like_count: Number.isFinite(p.like_count) ? p.like_count : 0,
      available: Boolean(p.available ?? true),
    };

    if (base.kind === 'NicDisposable') {
      nic.push({
        ...base,
        puffs: Number(p.puffs ?? 0),
      });
    } else if (base.kind === 'HHCDisposable') {
      hhc.push({
        ...base,
        grams: p.grams != null ? Number(p.grams) : undefined,
        components: {
          hhc: Boolean(p?.components?.hhc ?? false),
          d8: Boolean(p?.components?.d8 ?? false),
          d10: Boolean(p?.components?.d10 ?? false),
          cbd: Boolean(p?.components?.cbd ?? false),
          mushrooms: Boolean(p?.components?.mushrooms ?? false),
        },
        strains: Array.isArray(p.strains) ? p.strains.map(toStrain) : [],
        live_resin: Boolean(p?.live_resin ?? false),
        liquid_diamond: Boolean(p?.liquid_diamond ?? false),
      });
    } else if (base.kind === 'Edible') {
      ed.push({
        ...base,
        weight_g: p.weight_g != null ? Number(p.weight_g) : undefined,
        servings: p.servings != null ? Number(p.servings) : undefined,
        dosage_mg: p.dosage_mg != null ? Number(p.dosage_mg) : undefined,
        components: {
          hhc: Boolean(p?.components?.hhc ?? false),
          d8: Boolean(p?.components?.d8 ?? false),
          d10: Boolean(p?.components?.d10 ?? false),
          cbd: Boolean(p?.components?.cbd ?? false),
          cbg: Boolean(p?.components?.cbg ?? false),
          cbn: Boolean(p?.components?.cbn ?? false),
          muscimol: Boolean(p?.components?.muscimol ?? false),
          amanita_muscaria: Boolean(p?.components?.amanita_muscaria ?? false),
          lion_mane: Boolean(p?.components?.lion_mane ?? false),
          reishi: Boolean(p?.components?.reishi ?? false),
          cordyceps: Boolean(p?.components?.cordyceps ?? false),
          turkey_tail: Boolean(p?.components?.turkey_tail ?? false),
          mad_honey: Boolean(p?.components?.mad_honey ?? false),
        },
      });
    } else {
      console.warn(
        '⚠️ kind desconocido, se omite:',
        base.kind,
        base.brand,
        base.model
      );
    }
  }

  return { nic, hhc, ed };
}

/** Validación mínima para abortar antes de insertar */
function validateGroups({ nic, hhc, ed }) {
  const invalids = [];

  const checkBase = (d) => {
    if (!d.model) invalids.push([d, 'model requerido']);
    if (!d.category) invalids.push([d, 'category requerido']);
    if (
      !d.kind ||
      !['NicDisposable', 'HHCDisposable', 'Edible'].includes(d.kind)
    )
      invalids.push([d, 'kind inválido']);
    if (!(Number.isFinite(d.min_price) && Number.isFinite(d.suggested_price)))
      invalids.push([d, 'precios inválidos']);
    if (d.suggested_price < d.min_price)
      invalids.push([d, 'suggested_price < min_price']);
  };

  nic.forEach(checkBase);
  hhc.forEach(checkBase);
  ed.forEach(checkBase);

  if (invalids.length) {
    console.error('❌ Documentos inválidos:');
    for (const [doc, reason] of invalids.slice(0, 10)) {
      console.error('—', reason, {
        brand: doc.brand,
        model: doc.model,
        kind: doc.kind,
      });
    }
    if (invalids.length > 10) console.error(`… y ${invalids.length - 10} más`);
    throw new Error('Seed abortado por datos inválidos.');
  }
}

/** RESET: borra e inserta por discriminador */
async function seedReset(groups) {
  await Product.createCollection().catch(() => {});
  await Product.syncIndexes();
  await cleanCollection();

  const results = [];
  if (groups.nic.length) {
    const r = await NicDisposable.insertMany(groups.nic, { ordered: false });
    results.push(r.length);
  }
  if (groups.hhc.length) {
    const r = await HHCDisposable.insertMany(groups.hhc, { ordered: false });
    results.push(r.length);
  }
  if (groups.ed.length) {
    const r = await Edible.insertMany(groups.ed, { ordered: false });
    results.push(r.length);
  }
  const total = results.reduce((a, b) => a + b, 0);
  console.log(
    `🌱 insertMany (por discriminador) -> ${total} productos insertados`
  );
}

/** UPSERT: por discriminador, usando (brand, model, kind) como clave lógica */
async function seedUpsert(groups) {
  await Product.createCollection().catch(() => {});
  await Product.syncIndexes();

  const doUpsert = async (Model, arr) => {
    if (!arr.length) return { upserts: 0, modified: 0 };
    const ops = arr.map((d) => ({
      updateOne: {
        filter: { brand: d.brand, model: d.model, kind: d.kind },
        update: { $set: d },
        upsert: true,
      },
    }));
    const res = await Model.bulkWrite(ops, { ordered: false });
    return {
      upserts: res?.upsertedCount ?? 0,
      modified: res?.modifiedCount ?? 0,
    };
  };

  const r1 = await doUpsert(NicDisposable, groups.nic);
  const r2 = await doUpsert(HHCDisposable, groups.hhc);
  const r3 = await doUpsert(Edible, groups.ed);

  console.log(
    `🔁 upsert -> upserts: ${
      r1.upserts + r2.upserts + r3.upserts
    }, modificados: ${r1.modified + r2.modified + r3.modified}`
  );
}

async function main() {
  await connect();

  const groups = normalizeAndSplit(PRODUCTS);
  validateGroups(groups);

  if (SEED_MODE === 'upsert') {
    await seedUpsert(groups);
  } else {
    await seedReset(groups);
  }

  await mongoose.disconnect();
  console.log('🧪 Listo: seed completado y desconectado');
}

main().catch(async (err) => {
  console.error('❌ Error en seed:', err);
  try {
    await mongoose.disconnect();
  } catch {}
  process.exit(1);
});
