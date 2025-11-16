import {
  Product,
  NicDisposable,
  HHCDisposable,
  Edible,
} from '../models/product.model.js';

export const getAllProducts = async () => Product.find().lean();
export const getNicDisposables = async () => NicDisposable.find().lean();
export const getHHCDisposables = async () => HHCDisposable.find().lean();
export const getEdibles = async () => Edible.find().lean();

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
  color = 'white',
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
    color: color?.trim() || 'white',
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
