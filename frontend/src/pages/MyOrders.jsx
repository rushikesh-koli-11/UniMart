import React, { useEffect, useState, useContext } from "react";
import { UserAuthContext } from "../contexts/UserAuthContext";
import API from "../api/api";
import {
  Card,
  CardContent,
  Typography,
  Button,
  Stack,
  Divider,
  Box,
} from "@mui/material";

export default function MyOrders() {
  const { user } = useContext(UserAuthContext);
  const [orders, setOrders] = useState([]);

  const loadOrders = async () => {
    try {
      const { data } = await API.get("/orders/my");
      // ✅ Sort newest first
      setOrders(data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
    } catch (err) {
      console.error("Failed to load orders", err);
    }
  };

  const cancelOrder = async (id) => {
    try {
      await API.put(`/orders/${id}/cancel`);
      loadOrders();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to cancel order");
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  if (!orders.length)
    return (
      <Typography sx={{ textAlign: "center", mt: 5 }}>
        🛍️ No orders found.
      </Typography>
    );

  return (
    <Stack spacing={3} sx={{ mb: 5 }}>
      <Typography variant="h5" sx={{ fontWeight: "bold" }}>
        My Orders
      </Typography>

      {orders.map((order) => (
        <Card key={order._id} sx={{ boxShadow: 2, borderRadius: 2 }}>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 1 }}>
              Order ID: {order._id.slice(-8).toUpperCase()}
            </Typography>
            <Typography>
              <strong>Status:</strong> {order.status}
            </Typography>
            <Typography>
              <strong>Payment:</strong> {order.paymentStatus}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Placed on: {new Date(order.createdAt).toLocaleString()}
            </Typography>

            <Divider sx={{ my: 2 }} />

            <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
              Shipping Info
            </Typography>
            <Typography>
              {order.shippingInfo?.name} {order.shippingInfo?.surname}
            </Typography>
            <Typography>📞 {order.shippingInfo?.phone}</Typography>
            <Typography>🏠 {order.shippingInfo?.address}</Typography>

            <Divider sx={{ my: 2 }} />

            <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
              Items
            </Typography>

            {order.items.map((it, index) => {
              const product = it.product; // could be null if deleted
              const subtotal = it.price * it.quantity;

              return (
                <Box
                  key={index}
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    borderBottom: "1px solid #eee",
                    py: 0.7,
                    alignItems: "center",
                  }}
                >
                  <Typography sx={{ flex: 2 }}>
                    <strong>{product?.title || "🗑️ Deleted Product"}</strong>
                  </Typography>
                  <Typography sx={{ flex: 1, textAlign: "center" }}>
                    ₹{it.price} × {it.quantity}
                  </Typography>
                  <Typography sx={{ flex: 1, textAlign: "right" }}>
                    <strong>= ₹{subtotal}</strong>
                  </Typography>
                </Box>
              );
            })}

            <Typography variant="h6" sx={{ mt: 2 }}>
              Total: ₹{order.total}
            </Typography>

            {order.status === "processing" && (
              <Button
                variant="outlined"
                color="error"
                sx={{ mt: 2 }}
                onClick={() => cancelOrder(order._id)}
              >
                Cancel Order
              </Button>
            )}
          </CardContent>
        </Card>
      ))}
    </Stack>
  );
}
