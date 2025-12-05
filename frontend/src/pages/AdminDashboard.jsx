import React, { useEffect, useState, useContext } from "react";
import { Card, CardContent, Typography, Grid, Box } from "@mui/material";
import API from "../api/api";
import { AdminAuthContext } from "../contexts/AdminAuthContext";

import Inventory2Icon from "@mui/icons-material/Inventory2";
import ShoppingBagIcon from "@mui/icons-material/ShoppingBag";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";

import "bootstrap/dist/css/bootstrap.min.css";
import "./AdminDashboard.css";

export default function AdminDashboard() {
  const { admin } = useContext(AdminAuthContext);
  const [stats, setStats] = useState({
    products: 0,
    orders: 0,
    users: 0,
    todayRevenue: 0,
    weeklyRevenue: 0,
    monthlyRevenue: 0,
  });

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
    <div className="container-fluid p-0 admin-dashboard-wrapper mt-3">

      {/* HERO SECTION */}
      <div className="dashboard-hero d-flex align-items-center justify-content-center text-center">
        <div>
          <h1 className="hero-title">Welcome Back, {admin?.name} 👋</h1>
          <p className="hero-subtitle">Here’s your store performance overview</p>
        </div>
      </div>

      {/* MAIN STATS */}
      <div className="container mt-4">
        <div className="row g-4">

          {/* PRODUCTS */}
          <div className="col-12 col-md-4">
            <Card className="stat-card shadow-sm">
              <CardContent className="stat-content">
                <Box className="stat-icon products">
                  <Inventory2Icon fontSize="large" />
                </Box>
                <Typography className="stat-label">Total Products</Typography>
                <Typography className="stat-value">{stats.products}</Typography>
              </CardContent>
            </Card>
          </div>

          {/* ORDERS */}
          <div className="col-12 col-md-4">
            <Card className="stat-card shadow-sm">
              <CardContent className="stat-content">
                <Box className="stat-icon orders">
                  <ShoppingBagIcon fontSize="large" />
                </Box>
                <Typography className="stat-label">Total Orders</Typography>
                <Typography className="stat-value">{stats.orders}</Typography>
              </CardContent>
            </Card>
          </div>

          {/* USERS */}
          <div className="col-12 col-md-4">
            <Card className="stat-card shadow-sm">
              <CardContent className="stat-content">
                <Box className="stat-icon users">
                  <PeopleAltIcon fontSize="large" />
                </Box>
                <Typography className="stat-label">Total Users</Typography>
                <Typography className="stat-value">{stats.users}</Typography>
              </CardContent>
            </Card>
          </div>

        </div>

        {/* REVENUE SECTION */}
        <h3 className="fw-bold mt-5 mb-3 section-title">💰 Revenue Overview</h3>

        <div className="row g-4">

          {/* TODAY */}
          <div className="col-12 col-md-4">
            <Card className="stat-card revenue-card shadow-sm">
              <CardContent className="stat-content">
                <Box className="stat-icon revenue today">
                  <MonetizationOnIcon fontSize="large" />
                </Box>
                <Typography className="stat-label">Today's Revenue</Typography>
                <Typography className="stat-value">
                  ₹{stats.todayRevenue}
                </Typography>
              </CardContent>
            </Card>
          </div>

          {/* WEEKLY */}
          <div className="col-12 col-md-4">
            <Card className="stat-card revenue-card shadow-sm">
              <CardContent className="stat-content">
                <Box className="stat-icon revenue week">
                  <MonetizationOnIcon fontSize="large" />
                </Box>
                <Typography className="stat-label">Weekly Revenue</Typography>
                <Typography className="stat-value">
                  ₹{stats.weeklyRevenue}
                </Typography>
              </CardContent>
            </Card>
          </div>

          {/* MONTHLY */}
          <div className="col-12 col-md-4">
            <Card className="stat-card revenue-card shadow-sm">
              <CardContent className="stat-content">
                <Box className="stat-icon revenue month">
                  <MonetizationOnIcon fontSize="large" />
                </Box>
                <Typography className="stat-label">Monthly Revenue</Typography>
                <Typography className="stat-value">
                  ₹{stats.monthlyRevenue}
                </Typography>
              </CardContent>
            </Card>
          </div>

        </div>
      </div>
    </div>
  );
}
