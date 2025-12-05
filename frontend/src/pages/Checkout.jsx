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

export default function Checkout() {
  const { cart, clearCart } = useContext(CartContext);
  const { user, setUser } = useContext(UserAuthContext);
  const navigate = useNavigate();

  const addresses = user?.addresses || [];
  const defaultAddr = addresses.find((a) => a.isDefault);

  // Saved address selection
  const [selectedAddress, setSelectedAddress] = useState(
    defaultAddr?._id || ""
  );

  // Old fields
  const [form, setForm] = useState({
    name: user?.name || "",
    surname: "",
    phone: user?.phone || "",
    address: defaultAddr?.address || "",
  });

  // Sync address form when user selects a saved address
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

        // update user context
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
    <div>
      <Typography variant="h5">Checkout</Typography>

      <Typography sx={{ mt: 2 }}>Select Delivery Address</Typography>

      {addresses.length === 0 && (
        <Alert severity="info" sx={{ my: 2 }}>
          No saved addresses. Add one in your Dashboard.
        </Alert>
      )}

      {addresses.map((a) => (
        <Card key={a._id} sx={{ p: 2, my: 1 }}>
          <label style={{ display: "flex", gap: "10px" }}>
            <input
              type="radio"
              checked={selectedAddress === a._id}
              onChange={() => setSelectedAddress(a._id)}
            />
            <div>
              <Typography>
                <b>{a.label}</b> {a.isDefault && "(Default)"}
              </Typography>
              <Typography>{a.address}</Typography>
            </div>
          </label>
        </Card>
      ))}

      <Typography sx={{ mt: 2, mb: 1 }}>Enter Delivery Details</Typography>

      {msg && <Alert severity="error">{msg}</Alert>}

      <Stack spacing={2} sx={{ maxWidth: 400 }}>
        <TextField
          label="First Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />

        <TextField
          label="Surname"
          value={form.surname}
          onChange={(e) => setForm({ ...form, surname: e.target.value })}
        />

        <TextField
          label="Mobile Number"
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
        />

        <TextField
          label="Address"
          multiline
          rows={3}
          value={form.address}
          onChange={(e) => setForm({ ...form, address: e.target.value })}
        />

        <Typography>Total Amount: ₹{total}</Typography>

        <Button variant="contained" onClick={placeOrder}>
          Place Order
        </Button>
      </Stack>
    </div>
  );
}
