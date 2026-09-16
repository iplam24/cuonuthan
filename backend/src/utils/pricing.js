export function resolveProductPrice(product) {
  const price = Number(product.price || 0);
  const salePrice = product.sale_price != null ? Number(product.sale_price) : null;
  const hasValidSale = salePrice != null && !Number.isNaN(salePrice) && salePrice > 0 && salePrice <= price;
  return { current_price: hasValidSale ? salePrice : price, original_price: hasValidSale ? price : null };
}
