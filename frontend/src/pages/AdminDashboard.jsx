import React, { useEffect, useState, useContext } from "react";
import { Card, CardContent, Typography, Grid } from "@mui/material";
import API from "../api/api";
import { AdminAuthContext } from "../contexts/AdminAuthContext";

export default function AdminDashboard() {
  const { admin } = useContext(AdminAuthContext);
  const [stats, setStats] = useState({ products: 0, orders: 0, users: 0 });

  useEffect(() => {
    const loadStats = async () => {
      try {
        const { data } = await API.get("/stats");
        setStats(data);
      } catch (err) {
        console.log("STATS ERROR:", err.response?.data?.message);
      }
    };
    loadStats();
  }, []);

  return (
    <div>
      <Typography variant="h4" sx={{ mb: 3 }}>
        Welcome Back, {admin?.name}
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6">Total Products</Typography>
              <Typography variant="h4">{stats.products}</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6">Total Orders</Typography>
              <Typography variant="h4">{stats.orders}</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6">Total Users</Typography>
              <Typography variant="h4">{stats.users}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </div>
  );
}
