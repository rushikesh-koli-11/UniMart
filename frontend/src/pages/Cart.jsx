import React, { useContext, useEffect, useState } from "react";
import { CartContext } from "../contexts/CartContext";
import { Typography, Button, IconButton } from "@mui/material";

import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import DeleteIcon from "@mui/icons-material/Delete";

import { Link } from "react-router-dom";
import API from "../api/api";
import "./Cart.css";

import ProductCard from "../components/ProductCard";


const getId = (val) =>
  typeof val === "object" && val !== null ? val._id : val || null;

const applyOffersToItem = (item, offers) => {
  let finalPrice = item.price;
  let appliedOffer = null;

  const itemProductId = item._id;
  const itemCategoryId = getId(item.category);
  const itemSubcategoryId = item.subcategory || getId(item.subcategory);

  offers.forEach((offer) => {
    if (!offer.active) return;

    if (
      offer.scopeType === "product" &&
      offer.product &&
      offer.product === itemProductId
    ) {
      appliedOffer = offer;
    }

    if (
      offer.scopeType === "subcategory" &&
      offer.subcategoryId &&
      itemSubcategoryId &&
      offer.subcategoryId === itemSubcategoryId
    ) {
      appliedOffer = offer;
    }

    if (
      offer.scopeType === "category" &&
      offer.category &&
      itemCategoryId &&
      offer.category === itemCategoryId
    ) {
      appliedOffer = offer;
    }
  });

  if (!appliedOffer) return { finalPrice, appliedOffer: null };

  if (appliedOffer.minMrp && item.price < appliedOffer.minMrp) {
    return { finalPrice, appliedOffer: null };
  }

  if (appliedOffer.discountType === "percentage") {
    finalPrice = Math.round(
      item.price - (item.price * appliedOffer.discountValue) / 100
    );
  } else {
    finalPrice = Math.max(0, item.price - appliedOffer.discountValue);
  }

  return { finalPrice, appliedOffer };
};

const applyCartOffer = (cartTotal, offers) => {
  const cartOffers = offers.filter(
    (o) => o.scopeType === "cart" && o.active
  );

  let bestOffer = null;
  let bestSavings = 0;

  cartOffers.forEach((o) => {
    const min = o.minCartAmount || 0;
    if (cartTotal < min) return;

    let savings = 0;
    if (o.discountType === "percentage") {
      savings = (cartTotal * o.discountValue) / 100;
    } else {
      savings = o.discountValue;
    }

    if (savings > bestSavings) {
      bestSavings = savings;
      bestOffer = o;
    }
  });

  if (!bestOffer) {
    return { finalTotal: cartTotal, bestOffer: null, savings: 0 };
  }

  const finalTotal = Math.max(0, cartTotal - bestSavings);
  return { finalTotal, bestOffer, savings: bestSavings };
};


export default function Cart() {
  const { cart, incrementQty, decrementQty, clearCart } =
    useContext(CartContext);

  const [offers, setOffers] = useState([]);

  const [similarProducts, setSimilarProducts] = useState([]);

  useEffect(() => {
    const loadSimilarProducts = async () => {
      if (cart.length === 0) return;

      const firstItem = cart[0];

      const subId =
        typeof firstItem.subcategory === "object"
          ? firstItem.subcategory._id
          : firstItem.subcategory;

      if (!subId) return;

      try {
        const res = await API.get(`/products?subcategory=${subId}`);

        const filtered = res.data.filter(
          (p) => !cart.some((c) => c._id === p._id)
        );

        setSimilarProducts(filtered);
      } catch (err) {
        console.error("Failed to load similar products", err);
      }
    };

    loadSimilarProducts();
  }, [cart]);

  useEffect(() => {
    const loadOffers = async () => {
      try {
        const { data } = await API.get("/offers/active");
        setOffers(data);
      } catch (err) {
        console.error("Failed to load offers", err);
      }
    };
    loadOffers();
  }, []);

  const removeItem = (id) => {
    const updated = cart.filter((item) => item._id !== id);
    localStorage.setItem("cart", JSON.stringify(updated));
    window.location.reload();
  };

  const handleIncrement = (item) => {
    if (item.qty >= item.stock) return;
    incrementQty(item._id);
  };

  const updateQty = (id, value, stock) => {
    let qty = Number(value);

    if (qty < 1 || isNaN(qty)) qty = 1;
    if (qty > stock) qty = stock;

    const updated = cart.map((item) =>
      item._id === id ? { ...item, qty } : item
    );

    localStorage.setItem("cart", JSON.stringify(updated));
    window.location.reload();
  };

  const totals = cart.reduce(
    (acc, item) => {
      const { finalPrice } = applyOffersToItem(item, offers);

      const baseTotal = item.price * item.qty;
      const discountedTotal = finalPrice * item.qty;

      acc.base += baseTotal;
      acc.discounted += discountedTotal;
      return acc;
    },
    { base: 0, discounted: 0 }
  );

  const itemLevelSavings = totals.base - totals.discounted;

  const {
    finalTotal,
    bestOffer: bestCartOffer,
    savings: cartOfferSavings,
  } = applyCartOffer(totals.discounted, offers);

  const totalSavings = itemLevelSavings + cartOfferSavings;

  const hasOutOfStock = cart.some((item) => item.stock <= 0);

  return (
    <div className="container cart-page">
<div className="cart-hero mb-4">
  <h1>
    Your <span>Cart</span>
  </h1>

  <p>Review your items before checkout.</p>

  <p className="delivery-time mt-2" style={{ fontSize: "15px", fontWeight: "600", color: "#e67e22" }}>
    🚚 Fast Delivery: Expected within <strong>120 – 180 minutes</strong>
  </p>
</div>


      {cart.length === 0 && (
        <div className="empty-cart-box text-center">
          <h3>Your cart is empty</h3>
          <p>Add items to continue shopping.</p>
          <Button
            variant="contained"
            className="shop-now-btn"
            component={Link}
            to="/"
          >
            Shop Now
          </Button>
        </div>
      )}

      {cart.length > 0 && (
        <div className="cart-card shadow-sm p-3 rounded">
          <div className="d-none d-md-block">
            <table className="table improved-table align-middle text-center">
              <thead>
                <tr>
                  <th className="col-product">Product</th>
                  <th className="col-price">Price</th>
                  <th className="col-qty">Qty</th>
                  <th className="col-total">Total</th>
                  <th className="col-action"></th>
                </tr>
              </thead>

              <tbody>
                {cart.map((item) => {
                  const { finalPrice, appliedOffer } = applyOffersToItem(
                    item,
                    offers
                  );
                  const rowTotal = finalPrice * item.qty;

                  return (
                    <tr
                      key={item._id}
                      className={item.stock <= 0 ? "out-of-stock-row" : ""}
                    >
                      <td className="text-start">
                        <Link
                          to={`/product/${item._id}`}
                          className="cart-product"
                        >
                          <div className="img-box">
                            <img
                              src={item.images?.[0]?.url || "/no-image.png"}
                              className="product-img img-fluid"
                              alt={item.title}
                            />
                          </div>

                          <div>
                            <div className="prod-title">{item.title}</div>
                            {item.stock <= 0 && (
                              <div className="out-stock-badge">
                                Out of Stock
                              </div>
                            )}
                            {appliedOffer && (
                              <div className="offer-applied-pill">
                                {appliedOffer.discountType === "percentage"
                                  ? `${appliedOffer.discountValue}% OFF`
                                  : `₹${appliedOffer.discountValue} OFF`}
                              </div>
                            )}
                          </div>
                        </Link>
                      </td>

                      <td>
                        {appliedOffer ? (
                          <>
                            <span className="old-price">
                              ₹{item.price}
                            </span>
                            <span className="new-price ms-1">
                              ₹{finalPrice}
                            </span>
                          </>
                        ) : (
                          <>₹{item.price}</>
                        )}
                      </td>

                      <td>
                        <div className="qty-box">
                          <IconButton
                            className="qty-btn"
                            onClick={() => decrementQty(item._id)}
                            disabled={item.qty <= 1}
                          >
                            <RemoveIcon />
                          </IconButton>

                          <input
                            type="number"
                            className="qty-input"
                            value={item.qty}
                            min="1"
                            max={item.stock}
                            onChange={(e) =>
                              updateQty(item._id, e.target.value, item.stock)
                            }
                          />

                          <IconButton
                            className="qty-btn"
                            onClick={() => handleIncrement(item)}
                            disabled={item.qty >= item.stock}
                          >
                            <AddIcon />
                          </IconButton>
                        </div>

                        {item.qty >= item.stock && (
                          <div className="stock-warning">
                            Only {item.stock} left
                          </div>
                        )}
                      </td>

                      <td>₹{rowTotal}</td>

                      <td>
                        <IconButton
                          className={`delete-icon ${
                            item.stock <= 0 ? "blink-delete" : ""
                          }`}
                          onClick={() => removeItem(item._id)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* MOBILE VIEW */}
          <div className="d-md-none">
            {cart.map((item) => {
              const { finalPrice, appliedOffer } = applyOffersToItem(
                item,
                offers
              );
              const rowTotal = finalPrice * item.qty;

              return (
                <div
                  key={item._id}
                  className="mobile-cart-card shadow-sm p-3 mb-3 rounded"
                >
                  <div className="d-flex gap-3">
                    <div className="img-box-mobile">
                      <img
                        src={item.images?.[0]?.url || "/no-image.png"}
                        className="mobile-cart-img img-fluid"
                        alt={item.title}
                      />
                    </div>

                    <div className="flex-grow-1">
                      <h6 className="fw-bold">{item.title}</h6>

                      {appliedOffer ? (
                        <p className="mb-1">
                          Price:{" "}
                          <span className="old-price">₹{item.price}</span>{" "}
                          <span className="new-price">₹{finalPrice}</span>
                        </p>
                      ) : (
                        <p className="mb-1">Price: ₹{item.price}</p>
                      )}

                      {appliedOffer && (
                        <div className="offer-applied-pill mb-1">
                          {appliedOffer.discountType === "percentage"
                            ? `${appliedOffer.discountValue}% OFF`
                            : `₹${appliedOffer.discountValue} OFF`}
                        </div>
                      )}

                      <div className="d-flex align-items-center mt-2">
                        <IconButton
                          className="qty-btn"
                          onClick={() => decrementQty(item._id)}
                          disabled={item.qty <= 1}
                        >
                          <RemoveIcon />
                        </IconButton>

                        <input
                          type="number"
                          value={item.qty}
                          className="qty-input mx-1"
                          min="1"
                          max={item.stock}
                          onChange={(e) =>
                            updateQty(item._id, e.target.value, item.stock)
                          }
                        />

                        <IconButton
                          className="qty-btn"
                          onClick={() => handleIncrement(item)}
                          disabled={item.qty >= item.stock}
                        >
                          <AddIcon />
                        </IconButton>
                      </div>

                      <p className="fw-bold mt-2">Total: ₹{rowTotal}</p>

                      <IconButton
                        className="delete-icon"
                        onClick={() => removeItem(item._id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="cart-footer text-center mt-4">
            <div className="mb-2">
              <div>Cart value (before offers): ₹{totals.base}</div>
              {itemLevelSavings > 0 && (
                <div className="text-success">
                  Item discounts: -₹{itemLevelSavings}
                </div>
              )}
              {bestCartOffer && (
                <div className="text-success">
                  Cart offer ({bestCartOffer.title}): -₹{cartOfferSavings}
                </div>
              )}
              {totalSavings > 0 && (
                <div className="cart-savings-pill mt-1">
                  You saved ₹{totalSavings} 🎉
                </div>
              )}
            </div>

            <h2>Payable Total: ₹{finalTotal}</h2>

            {hasOutOfStock && (
              <p className="cart-warning">
                Some items are out of stock. Remove them to continue.
              </p>
            )}

            <div className="row g-3 mt-3">
              <div className="col-12 col-sm-6">
                <Button
                  variant="contained"
                  fullWidth
                  className="checkout-btn"
                  component={Link}
                  to={hasOutOfStock ? "#" : "/checkout"}
                  disabled={hasOutOfStock}
                >
                  {hasOutOfStock ? "Fix Cart Items" : "Proceed to Checkout"}
                </Button>
              </div>

              <div className="col-12 col-sm-6">
                <Button
                  variant="outlined"
                  color="error"
                  fullWidth
                  onClick={clearCart}
                >
                  Clear Cart
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}


      {similarProducts.length > 0 && (
        <div className="similar-products mt-5">
          <h3 className="review-heading">You May Also Like</h3>
          <hr className="mb-3" />

          <div className="product-row">
            {similarProducts.map((prod) => (
              <ProductCard key={prod._id} product={prod} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
