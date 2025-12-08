import React, { useContext, useState, useEffect } from "react";
import {
  TextField,
  Button,
  Typography,
  Stack,
  Alert,
  Card,
} from "@mui/material";
import { CartContext } from "../contexts/CartContext";
import { UserAuthContext } from "../contexts/UserAuthContext";
import API from "../api/api";
import { useNavigate } from "react-router-dom";
import "./Checkout.css"; // ⭐ NEW CSS FILE

export default function Checkout() {
  const { cart, clearCart } = useContext(CartContext);
  const { user, setUser } = useContext(UserAuthContext);
  const navigate = useNavigate();

  const addresses = user?.addresses || [];
  const defaultAddr = addresses.find((a) => a.isDefault);

  const [selectedAddress, setSelectedAddress] = useState(
    defaultAddr?._id || ""
  );

  const [form, setForm] = useState({
    name: user?.name || "",
    surname: "",
    phone: user?.phone || "",
    address: defaultAddr?.address || "",
  });

  useEffect(() => {
    if (!selectedAddress) return;
    const chosen = addresses.find((a) => a._id === selectedAddress);
    if (chosen) {
      setForm((prev) => ({
        ...prev,
        address: chosen.address,
      }));
    }
  }, [selectedAddress]);

  const [msg, setMsg] = useState("");

  const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

  const placeOrder = async () => {
    if (!form.name || !form.surname || !form.phone || !form.address) {
      setMsg("All fields are required.");
      return;
    }

    // ⭐ CITY VALIDATION — ONLY ALLOW SOLAPUR
    const addressLower = form.address.toLowerCase();
    if (!addressLower.includes("solapur")) {
      setMsg("❌ We currently deliver only within Solapur city.");
      return;
    }

    try {
      // STEP 1 — SAVE TYPED ADDRESS IF NEW
      const exists = addresses.some(
        (a) => a.address.toLowerCase() === form.address.toLowerCase()
      );

      if (!exists) {
        const res = await API.post("/auth/address/save-from-checkout", {
          label: "Other",
          address: form.address,
        });

        setUser(res.data.user);
        localStorage.setItem("user", JSON.stringify(res.data.user));
      }

      // STEP 2 — CREATE ORDER
      await API.post("/orders", {
        items: cart.map((i) => ({
          product: i._id,
          quantity: i.qty,
          price: i.price,
        })),
        total,
        shippingInfo: form,
        paymentDetails: { status: "pending" },
      });

      clearCart();
      navigate("/user/orders");
    } catch (err) {
      setMsg(err.response?.data?.message || "Order failed.");
    }
  };

  return (
    <div className="checkout-page">

      {/* HERO */}
      <div className="checkout-hero">
        <h1>Checkout</h1>
        <p>Almost there! Complete your delivery details to confirm your order.</p>
      </div>

      {/* ADDRESS SELECTION */}
      <div className="checkout-container">
        <Typography variant="h6" className="section-title">
          Select Delivery Address
        </Typography>

        {addresses.length === 0 && (
          <Alert severity="info" sx={{ my: 2 }}>
            No saved addresses. Add one in your Dashboard.
          </Alert>
        )}

        {addresses.map((a) => (
          <Card key={a._id} className="address-card">
            <label className="address-label">
              <input
                type="radio"
                checked={selectedAddress === a._id}
                onChange={() => setSelectedAddress(a._id)}
              />
              <div>
                <Typography className="address-title">
                  <b>{a.label}</b> {a.isDefault && "(Default)"}
                </Typography>
                <Typography className="address-text">{a.address}</Typography>
              </div>
            </label>
          </Card>
        ))}

        {/* DELIVERY DETAILS FORM */}
        <Typography variant="h6" className="section-title mt-4">
          Enter Delivery Details
        </Typography>

        {msg && <Alert severity="error">{msg}</Alert>}

        <Card className="details-card">
          <Stack spacing={2}>
            <TextField
              label="First Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              fullWidth
            />

            <TextField
              label="Surname"
              value={form.surname}
              onChange={(e) => setForm({ ...form, surname: e.target.value })}
              fullWidth
            />

            <TextField
              label="Mobile Number"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              fullWidth
            />

            <TextField
              label="Address"
              multiline
              rows={3}
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              fullWidth
            />
          </Stack>
        </Card>

        {/* SUMMARY BOX */}
        <Card className="summary-card">
          <Typography className="summary-title">Order Summary</Typography>

          <div className="summary-line">
            <span>Items Total:</span>
            <span>₹{total}</span>
          </div>

          <div className="summary-line total">
            <span>Payable Amount:</span>
            <span>₹{total}</span>
          </div>

          <Button className="place-order-btn" fullWidth onClick={placeOrder}>
            Place Order
          </Button>
        </Card>
      </div>
    </div>
  );
}
