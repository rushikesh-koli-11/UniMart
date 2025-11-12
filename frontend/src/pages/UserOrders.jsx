import React, { useEffect, useState } from "react";
import API from "../api/api";
import { Typography, Card, CardContent, Stack } from "@mui/material";

export default function UserOrders() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const { data } = await API.get("/orders/my");
      setOrders(data);
    } catch (err) {
      console.log("ORDERS ERROR:", err.response?.data);
    }
  };

  return (
    <div>
      <Typography variant="h5" sx={{ mb: 2 }}>My Orders</Typography>

      <Stack spacing={2}>
        {orders.map((order) => (
          <Card key={order._id}>
            <CardContent>
              <Typography variant="subtitle1">
                Order ID: {order._id}
              </Typography>
              <Typography>Total: ₹{order.total}</Typography>
              <Typography>Status: {order.status}</Typography>
              <Typography>
                Placed on: {new Date(order.createdAt).toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        ))}
      </Stack>
    </div>
  );
}
