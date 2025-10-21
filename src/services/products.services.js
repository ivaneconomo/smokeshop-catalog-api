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
        [`flavors.$[flavor].available_location.${storeId}.available`]: available,
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
