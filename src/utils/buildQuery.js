export function buildProductFilters(q) {
  const filter = {};

  if (q.category) filter.category = q.category;
  if (q.brand) filter.brand = new RegExp(`^${q.brand}$`, 'i');

  if (q.available !== undefined) {
    filter.available = q.available === 'true' || q.available === true;
  }

  if (q.minPuffs)
    filter.puffs = { ...(filter.puffs || {}), $gte: Number(q.minPuffs) };
  if (q.maxPuffs)
    filter.puffs = { ...(filter.puffs || {}), $lte: Number(q.maxPuffs) };

  if (q.search) {
    const s = String(q.search).trim();
    filter.$or = [
      { brand: { $regex: s, $options: 'i' } },
      { model: { $regex: s, $options: 'i' } },
      { description: { $regex: s, $options: 'i' } },
      { flavors: { $elemMatch: { $regex: s, $options: 'i' } } },
    ];
  }

  return filter;
}
