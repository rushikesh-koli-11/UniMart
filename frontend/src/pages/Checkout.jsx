import React, { useContext, useState } from "react";
import { TextField, Button, Typography, Stack, Alert } from "@mui/material";
import { CartContext } from "../contexts/CartContext";
import { UserAuthContext } from "../contexts/UserAuthContext";import API from "../api/api";
import { useNavigate } from "react-router-dom";

export default function Checkout() {
  const { cart, clearCart } = useContext(CartContext);
const { user } = useContext(UserAuthContext);  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    surname: "",
    phone: "",
    address: ""
  });

  const [msg, setMsg] = useState("");

  const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

  const placeOrder = async () => {
    if (!form.name || !form.surname || !form.phone || !form.address) {
      setMsg("All fields are required.");
      return;
    }

    try {
      await API.post("/orders", {
        items: cart.map((item) => ({
          product: item._id,
          quantity: item.qty,
          price: item.price
        })),
        total,
        paymentDetails: { status: "pending" },
        shippingInfo: form // ✅ Matching backend schema
      });

      clearCart();
      navigate("/user/orders");
    } catch (err) {
      console.log("ORDER ERROR:", err.response?.data);
      setMsg(err.response?.data?.message || "Order failed. Try again.");
    }
  };

  return (
    <div>
      <Typography variant="h5" sx={{ mb: 2 }}>Checkout</Typography>

      <Typography variant="subtitle1" sx={{ mb: 2 }}>
        Total Amount: ₹{total}
      </Typography>

      {msg && <Alert severity="error">{msg}</Alert>}

      <Stack spacing={2} sx={{ maxWidth: 400 }}>

        <TextField label="First Name" value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })} />

        <TextField label="Surname" value={form.surname}
          onChange={(e) => setForm({ ...form, surname: e.target.value })} />

        <TextField label="Mobile Number" value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })} />

        <TextField label="Address" multiline rows={3} value={form.address}
          onChange={(e) => setForm({ ...form, address: e.target.value })} />

        <Button variant="contained" onClick={placeOrder}>
          Place Order
        </Button>

      </Stack>
    </div>
  );
}
