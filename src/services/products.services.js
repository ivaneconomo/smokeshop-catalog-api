import {
  Product,
  Nicotine,
  Kits,
  Edibles,
} from '../models/product.model.js';

export const getAllProducts = async () => Product.find().lean();

export const updateFlavorAvailability = async ({
  productId,
  flavorId,
  flavorName,
  storeId,
  available,
}) => {
  const filter = { _id: productId };
  const arrayFilter = {};

  if (flavorId) {
    filter['flavors._id'] = flavorId;
    arrayFilter['flavor._id'] = flavorId;
  } else {
    filter['flavors.name'] = flavorName;
    arrayFilter['flavor.name'] = flavorName;
  }

  const updatedProduct = await Product.findOneAndUpdate(
    filter,
    {
      $set: {
        [`flavors.$[flavor].available_location.${storeId}.available`]:
          available,
      },
    },
    {
      new: true,
      arrayFilters: [arrayFilter],
    }
  ).lean();

  if (!updatedProduct) {
    return { ok: false, reason: 'not_found' };
  }

  return { ok: true };
};

export const addFlavorToProductService = async ({
  productId,
  name,
  color = 'slate',
  available_location,
}) => {
  if (!productId || !name) {
    throw new Error('productId y name son obligatorios');
  }

  const product = await Product.findById(productId);

  if (!product) {
    const err = new Error('Producto no encontrado');
    err.code = 'NOT_FOUND';
    throw err;
  }

  const normalizedName = name.trim();

  // Evitar sabores duplicados por nombre (opcional pero útil)
  const exists = product.flavors.some(
    (f) => f.name.toLowerCase() === normalizedName.toLowerCase()
  );
  if (exists) {
    const err = new Error('Ya existe un sabor con ese nombre en este producto');
    err.code = 'DUPLICATED_FLAVOR';
    throw err;
  }

  const newFlavor = {
    name: normalizedName,
    color: color?.trim() || 'slate',
  };

  // available_location es un Map en el schema, pero podés pasar un objeto plano
  if (available_location && typeof available_location === 'object') {
    newFlavor.available_location = available_location;
  }

  product.flavors.push(newFlavor);

  await product.save();

  const createdFlavor = product.flavors[product.flavors.length - 1];

  return {
    product,
    flavor: createdFlavor,
  };
};

const productModelsByKind = {
  Nicotine,
  Kits,
  Edibles,
};

export const createProductService = async (data) => {
  const kind = data?.kind;
  const ProductModel = productModelsByKind[kind];

  if (!ProductModel) {
    const err = new Error('Tipo de producto inválido');
    err.code = 'INVALID_KIND';
    throw err;
  }

  const product = await ProductModel.create(data);
  return product.toObject();
};

export const createNicProductService = async (data) =>
  createProductService({ ...data, kind: 'Nicotine' });

export const reorderProductsService = async (ids) => {
  const ops = ids.map((id, index) => ({
    updateOne: {
      filter: { _id: id },
      update: { $set: { sort_order: index } },
    },
  }));
  return Product.bulkWrite(ops);
};

const STORES = ['store_6', 'store_8', 'store_22', 'store_28'];
const defaultAvailability = () =>
  Object.fromEntries(STORES.map((s) => [s, { available: true, quantity: 0 }]));

export const getProductByIdService = async (id) =>
  Product.findById(id).lean();

export const updateProductService = async (id, data) => {
  const { flavors: rawFlavors, strains: rawStrains, ...fields } = data;

  const current = await Product.findById(id);
  if (!current) {
    const err = new Error('Producto no encontrado');
    err.code = 'NOT_FOUND';
    throw err;
  }

  if (rawFlavors !== undefined) {
    fields.flavors = rawFlavors.map(({ name, color, strain }) => {
      const found = current.flavors.find(
        (f) => f.name.toLowerCase() === name.trim().toLowerCase(),
      );
      if (found) {
        const obj = found.toObject();
        obj.strain = strain || '';
        return obj;
      }
      return {
        name: name.trim(),
        color: color || 'slate',
        strain: strain || '',
        available_location: defaultAvailability(),
      };
    });
  }

  if (rawStrains !== undefined) {
    fields.strains = rawStrains.map(({ name }) => {
      const found = (current.strains ?? []).find((s) => s.name === name);
      return found ? found.toObject() : { name, available_location: defaultAvailability() };
    });
  }

  // Raw update para permitir cambiar el discriminator key (kind)
  await Product.collection.updateOne({ _id: current._id }, { $set: fields });

  return Product.findById(id).lean();
};
