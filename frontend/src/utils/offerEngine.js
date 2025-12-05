// PRIORITY:
// 1) Product offer
// 2) Subcategory offer
// 3) Category offer

export const applyOffersToProduct = (product, offers) => {
  if (!product || !offers) {
    return { finalPrice: product?.price || 0, appliedOffer: null };
  }

  let finalPrice = product.price;
  let appliedOffer = null;

  let productOffer = null;
  let subcategoryOffer = null;
  let categoryOffer = null;

  offers.forEach((offer) => {
    if (!offer.active) return;

    // PRODUCT LEVEL
    if (offer.scopeType === "product" && offer.product === product._id) {
      productOffer = offer;
    }

    // SUBCATEGORY LEVEL
    if (
      offer.scopeType === "subcategory" &&
      product.subcategory?._id === offer.subcategoryId
    ) {
      subcategoryOffer = offer;
    }

    // CATEGORY LEVEL
    if (
      offer.scopeType === "category" &&
      product.category?.toString() === offer.category?.toString()
    ) {
      categoryOffer = offer;
    }
  });

  // PRIORITY MECHANISM
  const finalOffer = productOffer || subcategoryOffer || categoryOffer;

  if (!finalOffer) {
    return { finalPrice, appliedOffer: null };
  }

  appliedOffer = finalOffer;

  // Apply discount
  if (finalOffer.discountType === "percentage") {
    finalPrice = Math.round(
      finalPrice - (finalPrice * finalOffer.discountValue) / 100
    );
  } else {
    finalPrice = Math.max(0, finalPrice - finalOffer.discountValue);
  }

  return { finalPrice, appliedOffer };
};
