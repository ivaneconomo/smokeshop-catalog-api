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
