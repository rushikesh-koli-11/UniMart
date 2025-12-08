import React, { useContext, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CartContext } from "../contexts/CartContext";
import API from "../api/api";
import "./ProductCard.css";

function applyOffersToProduct(product, offers) {
  let finalPrice = product.price;
  let appliedOffer = null;

  if (!product) return { finalPrice, appliedOffer };

  offers.forEach((offer) => {
    if (!offer.active) return;

    if (offer.scopeType === "product" && offer.product === product._id) {
      appliedOffer = offer;
    }

    if (
      offer.scopeType === "subcategory" &&
      product.subcategory &&
      product.subcategory === offer.subcategoryId
    ) {
      appliedOffer = offer;
    }

    if (
      offer.scopeType === "category" &&
      product.category &&
      product.category === offer.category
    ) {
      appliedOffer = offer;
    }
  });

  if (!appliedOffer) return { finalPrice, appliedOffer: null };

  if (appliedOffer.discountType === "percentage") {
    finalPrice = Math.round(
      finalPrice - (finalPrice * appliedOffer.discountValue) / 100
    );
  } else {
    finalPrice = Math.max(0, finalPrice - appliedOffer.discountValue);
  }

  return { finalPrice, appliedOffer };
}

export default function ProductCard({ product }) {
  const { addToCart } = useContext(CartContext);
  const navigate = useNavigate();

  const [finalPrice, setFinalPrice] = useState(product.price);
  const [appliedOffer, setAppliedOffer] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const loadOffers = async () => {
      try {
        const { data } = await API.get("/offers/active");
        if (!isMounted) return;

        const { finalPrice, appliedOffer } = applyOffersToProduct(product, data);
        setFinalPrice(finalPrice);
        setAppliedOffer(appliedOffer);
      } catch (err) {
        console.error("Failed to load offers for product card:", err);
      }
    };

    loadOffers();

    return () => {
      isMounted = false;
    };
  }, [product._id]);

  const handleAddToCart = (e) => {
    e.stopPropagation();
    e.preventDefault();

    const productForCart = appliedOffer
      ? {
        ...product,
        originalPrice: product.price,
        price: finalPrice,
        appliedOffer,
      }
      : product;

    addToCart(productForCart);
  };

  const effectiveRating =
    product.reviews?.length > 0 ? product.avgRating?.toFixed(1) : "5.0";

  return (
    <div
      className="small-card translate-safe mb-2"
      onClick={() => navigate(`/product/${product._id}`)}
      style={{ cursor: "pointer" }}
    >
      <div className="rating-number-badge">{effectiveRating} ★</div>

      {appliedOffer && (
        <div className="offer-badge">
          {appliedOffer.discountType === "percentage"
            ? `${appliedOffer.discountValue}% OFF`
            : `₹${appliedOffer.discountValue} OFF`}
        </div>
      )}

      <img src={product.images?.[0]?.url || "/placeholder.png"} alt={product.title} />

      <div className="small-card-content">
        <div className="small-title">{product.title}</div>

        <div className="small-price">
          {appliedOffer ? (
            <>
              <span className="old-price">₹{product.price}</span>
              <span className="new-price">₹{finalPrice}</span>
            </>
          ) : (
            <>₹{product.price}</>
          )}
        </div>
      </div>

      {/* ⭐ NEW BUTTONS (Buy + Add) */}
      <div className="small-actions">
        <button
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/product/${product._id}`);
          }}
        >
          Buy Now
        </button>

        <button
          className="add-btns"
          onClick={(e) => {
            e.stopPropagation();
            handleAddToCart(e);
          }}
        >
          Add to Cart
        </button>
      </div>
    </div>
  );
}



