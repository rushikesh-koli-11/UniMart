import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../api/api";
import {
  Typography,
  Button,
  Divider,
  Rating,
  Box
} from "@mui/material";
import Swal from "sweetalert2";

import { UserAuthContext } from "../contexts/UserAuthContext";
import { CartContext } from "../contexts/CartContext";

import "./ProductPage.css";

/* ===========================================
   OFFER ENGINE FOR SINGLE PRODUCT
=========================================== */
const applyOffersToProduct = (product, offers) => {
  if (!product) return { finalPrice: product?.price || 0, appliedOffer: null };

  let finalPrice = product.price;
  let appliedOffer = null;

  offers.forEach((offer) => {
    if (!offer.active) return;

    // ✅ Product-level offer
    if (offer.scopeType === "product" && offer.product === product._id) {
      appliedOffer = offer;
    }

    // ✅ Subcategory-level offer
    if (
      offer.scopeType === "subcategory" &&
      product.subcategory &&
      product.subcategory === offer.subcategoryId
    ) {
      appliedOffer = offer;
    }

    // ✅ Category-level offer
    if (
      offer.scopeType === "category" &&
      product.category &&
      product.category === offer.category
    ) {
      appliedOffer = offer;
    }
  });

  if (!appliedOffer) {
    return { finalPrice, appliedOffer: null };
  }

  // Apply discount
  if (appliedOffer.discountType === "percentage") {
    finalPrice = Math.round(
      finalPrice - (finalPrice * appliedOffer.discountValue) / 100
    );
  } else {
    finalPrice = Math.max(0, finalPrice - appliedOffer.discountValue);
  }

  return { finalPrice, appliedOffer };
};

export default function ProductPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [p, setP] = useState(null);
  const [mainImg, setMainImg] = useState("");

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  const { addToCart } = useContext(CartContext);
  const { user } = useContext(UserAuthContext);

  useEffect(() => {
    const loadProductWithOffers = async () => {
      try {
        // ✅ Load product and active offers together
        const [prodRes, offersRes] = await Promise.all([
          API.get(`/products/${id}`),
          API.get("/offers/active").catch(() => ({ data: [] })), // fallback if no offers route
        ]);

        const product = prodRes.data;
        const offers = offersRes.data || [];

        const { finalPrice, appliedOffer } = applyOffersToProduct(
          product,
          offers
        );

        setP({
          ...product,
          originalPrice: product.price,   // keep original MRP
          price: finalPrice,              // overwrite price with discounted
          appliedOffer,
        });

        setMainImg(product?.images?.[0]?.url);
      } catch (err) {
        console.error("Error loading product/offers:", err);
      }
    };

    loadProductWithOffers();
  }, [id]);

  if (!p) return <div className="loading">Loading...</div>;

  // SweetAlert Toast
  const Toast = Swal.mixin({
    toast: true,
    position: "top-end",
    showConfirmButton: false,
    timer: 1600,
    timerProgressBar: true,
    background: "#fff",
    color: "#031576",
    customClass: {
      popup: "toast-below-navbar",
    },
  });

  // Validate Stock
  const validateStockBeforeAdd = () => {
    if (p.stock <= 0) {
      Toast.fire({ icon: "error", title: "Out of Stock!" });
      return false;
    }
    return true;
  };

  // Add to Cart (uses discounted price stored in p.price)
  const handleAddToCart = () => {
    addToCart(p);
    Toast.fire({ icon: "success", title: "Added to cart" });
  };

  // Buy Now
  const handleBuyNow = () => {
    addToCart(p);
    navigate("/cart");
  };

  // Submit Review
  const submitReview = async () => {
    if (!user) {
      Toast.fire({ icon: "error", title: "Login required" });
      return;
    }

    if (!comment.trim()) {
      Toast.fire({ icon: "error", title: "Comment is required" });
      return;
    }

    try {
      const res = await API.post(`/products/${id}/reviews`, {
        rating,
        comment,
      });

      // Update frontend
      setP((prev) => ({
        ...prev,
        reviews: res.data.reviews,
        avgRating: res.data.avgRating,
      }));

      Toast.fire({ icon: "success", title: "Review submitted" });
      setComment("");
    } catch (err) {
      Toast.fire({
        icon: "error",
        title: err.response?.data?.message || "Error submitting review",
      });
    }
  };

  const deleteReview = async (reviewId) => {
    try {
      const res = await API.delete(`/products/${id}/reviews/${reviewId}`);

      setP((prev) => ({
        ...prev,
        reviews: res.data.reviews,
        avgRating: res.data.avgRating,
      }));

      Toast.fire({ icon: "success", title: "Review deleted" });
    } catch (err) {
      Toast.fire({
        icon: "error",
        title: err.response?.data?.message || "Delete failed",
      });
    }
  };

  return (
    <div className="container product-page">
      <div className="row g-4 product-wrapper">
        {/* LEFT: IMAGE GALLERY */}
        <div className="col-12 col-md-6 col-lg-5">
          <div className="product-img-box">
            <img src={mainImg} alt={p.title} className="product-img" />
          </div>

          <div className="thumb-row mt-3">
            {p.images?.map((img, i) => (
              <img
                key={i}
                src={img.url}
                alt="thumbnail"
                className={`thumb-img ${
                  mainImg === img.url ? "active-thumb" : ""
                }`}
                onClick={() => setMainImg(img.url)}
              />
            ))}
          </div>
        </div>

        {/* RIGHT: PRODUCT DETAILS */}
        <div className="col-12 col-md-6 col-lg-7">
          <Typography variant="h4" className="product-title">
            {p.title}
          </Typography>

          <Box display="flex" alignItems="center" gap={1}>
            <Rating value={p.avgRating || 0} precision={0.1} readOnly />
            <span>({p.reviews?.length || 0} Reviews)</span>
          </Box>

          <Typography className="product-description mt-2">
            {p.description}
          </Typography>

          <Divider className="divider" />

          {/* ⭐ PRICE WITH OFFER */}
          <Typography variant="h5" className="product-price">
            {p.appliedOffer ? (
              <>
                <span className="old-price">₹{p.originalPrice}</span>
                <span className="new-price ms-2">₹{p.price}</span>
                <span className="offer-tag ms-2">
                  {p.appliedOffer.discountType === "percentage"
                    ? `${p.appliedOffer.discountValue}% OFF`
                    : `₹${p.appliedOffer.discountValue} OFF`}
                </span>
              </>
            ) : (
              <>₹{p.price}</>
            )}
          </Typography>

          {p.stock > 0 ? (
            <p className="in-stock mt-1">Only {p.stock} left</p>
          ) : (
            <p className="out-stock mt-1">Out of Stock</p>
          )}

          <div className="row g-3 mt-4">
            <div className="col-12 col-sm-6">
              <Button
                fullWidth
                variant="contained"
                className="btn-add"
                onClick={() => {
                  if (!validateStockBeforeAdd()) return;
                  handleAddToCart();
                }}
              >
                Add to Cart
              </Button>
            </div>

            <div className="col-12 col-sm-6">
              <Button
                fullWidth
                variant="outlined"
                className="btn-buy"
                onClick={() => {
                  if (!validateStockBeforeAdd()) return;
                  handleBuyNow();
                }}
              >
                Buy Now
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* ⭐ REVIEWS SECTION */}
      <div className="reviews-section text-center mt-5">
        <h3 className="review-heading">Customer Reviews</h3>
        <Divider className="mb-3" />

        <div className="avg-rating-box ">
          <h4>⭐ {p.avgRating?.toFixed(1) || 0} / 5</h4>
          <span>({p.reviews?.length || 0} Reviews)</span>
        </div>

        {/* If no reviews */}
        {p.reviews?.length === 0 && <p>No reviews yet</p>}

        {/* ⭐ HORIZONTAL SCROLL REVIEWS */}
        <div className="review-slider">
          {p.reviews?.map((rev, i) => (
            <div key={i} className="review-card">
              <div className="review-top">
                <strong>{rev.name}</strong>

                {user && (rev.user === user._id || user.isAdmin) && (
                  <button
                    className="delete-review-btn"
                    onClick={() => deleteReview(rev._id)}
                  >
                    ❌
                  </button>
                )}
              </div>

              <Rating value={rev.rating} readOnly size="small" />

              <p className="review-comment text-start">{rev.comment}</p>
              <small className="review-date">
                {new Date(rev.createdAt).toLocaleDateString()}
              </small>
            </div>
          ))}
        </div>

        {/* ADD REVIEW */}
        {user && (
          <div className="add-review mt-4">
            <h4 className="add-review-title">Write a Review</h4>

            <Rating
              value={rating}
              onChange={(e, val) => setRating(val)}
              size="large"
            />

            <textarea
              className="form-control mt-3"
              rows="4"
              placeholder="Write your review..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />

            <Button
              variant="contained"
              className="mt-3 review-btn"
              onClick={submitReview}
            >
              Submit Review
            </Button>
          </div>
        )}

        {!user && (
          <p className="text-muted mt-4">
            <i>Please login to write a review.</i>
          </p>
        )}
      </div>
    </div>
  );
}
