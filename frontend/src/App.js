// frontend/src/App.jsx
import React from "react";
import { Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import ProductPage from "./pages/ProductPage";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";

import UserLogin from "./pages/UserLogin";
import Register from "./pages/Register";
import Feedback from "./pages/Feedback";

import AdminLogin from "./pages/AdminLogin";
import AdminRegister from "./pages/AdminRegister";

import UserDashboard from "./pages/UserDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import UserOrders from "./pages/UserOrders";
import MyOrders from "./pages/MyOrders";

import AdminProducts from "./pages/admin/AdminProducts";
import AdminOrders from "./pages/admin/AdminOrders";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminFeedback from "./pages/admin/AdminFeedback";
import AdminCategories from "./pages/admin/AdminCategories";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

import ProtectedUserRoute from "./components/ProtectedUserRoute";
import ProtectedAdminRoute from "./components/ProtectedAdminRoute";

import AdminLayout from "./layouts/AdminLayout";

import { Container } from "@mui/material";

export default function App() {
  return (
    <>
      <Navbar />
      <Container sx={{ mt: 3, minHeight: "70vh" }}>
        <Routes>

          {/* Public Pages */}
          <Route path="/" element={<Home />} />
          <Route path="/product/:id" element={<ProductPage />} />
          <Route path="/cart" element={<Cart />} />

          {/* Checkout (User Only) */}
          <Route
            path="/checkout"
            element={
              <ProtectedUserRoute>
                <Checkout />
              </ProtectedUserRoute>
            }
          />

          <Route
            path="/user/orders"
            element={
              <ProtectedUserRoute>
                <MyOrders />
              </ProtectedUserRoute>
            }
          />

          <Route
            path="/feedback"
            element={
              <ProtectedUserRoute>
                <Feedback />
              </ProtectedUserRoute>
            }
          />




          {/* User Auth */}
          <Route path="/user/login" element={<UserLogin />} />
          <Route path="/user/register" element={<Register />} />
          <Route
            path="/user/dashboard"
            element={
              <ProtectedUserRoute>
                <UserDashboard />
              </ProtectedUserRoute>
            }
          />

          {/* Admin Auth */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/register" element={<AdminRegister />} />

          {/* Admin Panel */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedAdminRoute>
                <AdminDashboard />
              </ProtectedAdminRoute>
            }
          />

          <Route
            path="/admin/products"
            element={
              <ProtectedAdminRoute>
                <AdminProducts />
              </ProtectedAdminRoute>
            }
          />

          <Route
            path="/admin/orders"
            element={
              <ProtectedAdminRoute>
                <AdminOrders />
              </ProtectedAdminRoute>
            }
          />

          <Route
            path="/admin/users"
            element={
              <ProtectedAdminRoute>
                <AdminUsers />
              </ProtectedAdminRoute>
            }
          />

          <Route
            path="/admin/feedback"
            element={
              <ProtectedAdminRoute>
                <AdminFeedback />
              </ProtectedAdminRoute>
            }
          />

          <Route
            path="/admin/categories"
            element={
              <ProtectedAdminRoute>

                <AdminCategories />

              </ProtectedAdminRoute>
            }
          />

        </Routes>
      </Container>
      <Footer />
    </>
  );
}
