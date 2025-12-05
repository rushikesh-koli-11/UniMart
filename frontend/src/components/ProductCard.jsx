import React, { useContext, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CartContext } from "../contexts/CartContext";
import { Rating } from "@mui/material";
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
    <Link
      to={`/product/${product._id}`}
      className="card-click-wrapper"
      style={{ textDecoration: "none", color: "inherit" }}
    >
      <div className="small-card">

        <div className="rating-number-badge">{effectiveRating} ★</div>

        {appliedOffer && (
          <div className="offer-badge">
            {appliedOffer.discountType === "percentage"
              ? `${appliedOffer.discountValue}% OFF`
              : `₹${appliedOffer.discountValue} OFF`}
          </div>
        )}

        <img
          src={product.images?.[0]?.url || "/placeholder.png"}
          alt={product.title}
        />

        <div className="small-card-content">
          <div className="small-title">{product.title}</div>

          <div className="small-price">
            {appliedOffer ? (
              <>
                <span className="old-price">₹{product.price}</span>
                <span className="new-price ms-1">₹{finalPrice}</span>
              </>
            ) : (
              <>₹{product.price}</>
            )}
          </div>

          {product.stock <= 10 && product.stock > 0 && (
            <div className="small-stock-warning">Only {product.stock} left!</div>
          )}

          {product.stock === 0 && (
            <div className="small-out-stock">Out of Stock</div>
          )}
        </div>

        <div className="small-actions">

          {/* FIXED VIEW BUTTON (no <Link> inside Link) */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/product/${product._id}`);
            }}
          >
            View
          </button>

          {/* ADD BUTTON */}
          <button className="add-btns" onClick={handleAddToCart}>Add</button>
        </div>

      </div>
    </Link>
  );
}
