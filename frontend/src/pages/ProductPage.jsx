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

import ProductCard from "../components/ProductCard"; // ⭐ REQUIRED

import "./ProductPage.css";

const applyOffersToProduct = (product, offers) => {
  if (!product) return { finalPrice: product?.price || 0, appliedOffer: null };

  let finalPrice = product.price;
  let appliedOffer = null;

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

  // ⭐ NEW: Similar products state
  const [similarProducts, setSimilarProducts] = useState([]);

  useEffect(() => {
    const loadProductWithOffers = async () => {
      try {
        const [prodRes, offersRes] = await Promise.all([
          API.get(`/products/${id}`),
          API.get("/offers/active").catch(() => ({ data: [] })),
        ]);

        const product = prodRes.data;
        const offers = offersRes.data || [];

        const { finalPrice, appliedOffer } = applyOffersToProduct(
          product,
          offers
        );

        setP({
          ...product,
          originalPrice: product.price,
          price: finalPrice,
          appliedOffer,
        });

        setMainImg(product?.images?.[0]?.url);

        if (product.subcategory?._id) {
  const simRes = await API.get(
    `/products?subcategory=${product.subcategory._id}`
  );


          const filtered = simRes.data.filter(
            (item) => item._id !== product._id
          );

          setSimilarProducts(filtered);
        }
      } catch (err) {
        console.error("Error loading product/offers:", err);
      }
    };

    loadProductWithOffers();
  }, [id]);

  if (!p) return <div className="loading">Loading...</div>;


  const Toast = Swal.mixin({
    toast: true,
    position: "top-end",
    showConfirmButton: false,
    timer: 1600,
    timerProgressBar: true,
    background: "#fff",
    color: "#031576",
    customClass: { popup: "toast-below-navbar" },
  });

  const validateStockBeforeAdd = () => {
    if (p.stock <= 0) {
      Toast.fire({ icon: "error", title: "Out of Stock!" });
      return false;
    }
    return true;
  };

  const handleAddToCart = () => {
    addToCart(p);
    Toast.fire({ icon: "success", title: "Added to cart" });
  };

  const handleBuyNow = () => {
    addToCart(p);
    navigate("/cart");
  };

  const submitReview = async () => {
    if (!user) return Toast.fire({ icon: "error", title: "Login required" });
    if (!comment.trim())
      return Toast.fire({ icon: "error", title: "Comment is required" });

    try {
      const res = await API.post(`/products/${id}/reviews`, {
        rating,
        comment,
      });

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

      {similarProducts.length > 0 && (
        <div className="similar-products mt-5">
          <h3 className="review-heading">Similar Products</h3>
          <Divider className="mb-3" />

          <div className="product-row">
            {similarProducts.map((prod) => (
              <ProductCard key={prod._id} product={prod} />
            ))}
          </div>
        </div>
      )}

      <div className="reviews-section text-center mt-5">
        <h3 className="review-heading">Customer Reviews</h3>
        <Divider className="mb-3" />

        <div className="avg-rating-box">
          <h4>⭐ {p.avgRating?.toFixed(1) || 0} / 5</h4>
          <span>({p.reviews?.length || 0} Reviews)</span>
        </div>

        {p.reviews?.length === 0 && <p>No reviews yet</p>}

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

        {user ? (
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
        ) : (
          <p className="text-muted mt-4">
            <i>Please login to write a review.</i>
          </p>
        )}
      </div>
    </div>
  );
}
