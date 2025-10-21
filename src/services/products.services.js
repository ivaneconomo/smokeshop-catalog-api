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
  flavorName,
  storeId,
  available,
}) => {
  const updatedProduct = await Product.findOneAndUpdate(
    { _id: productId, 'flavors.name': flavorName },
    {
      $set: {
        [`flavors.$[flavor].available_location.${storeId}.available`]: available,
      },
    },
    {
      new: true,
      arrayFilters: [{ 'flavor.name': flavorName }],
    }
  ).lean();

  if (!updatedProduct) {
    return { ok: false, reason: 'not_found' };
  }

  return { ok: true };
};
