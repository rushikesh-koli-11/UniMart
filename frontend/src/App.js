// frontend/src/App.jsx
import React from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "leaflet/dist/leaflet.css";
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
import MyOrders from "./pages/MyOrders";
import Contact from "./pages/Contact";

import AdminProducts from "./pages/admin/AdminProducts";
import AdminOrders from "./pages/admin/AdminOrders";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminFeedback from "./pages/admin/AdminFeedback";
import AdminCategories from "./pages/admin/AdminCategories";
import AdminOffers from "./pages/admin/AdminOffers";
import ManageSlider from "./pages/admin/ManageSlider";
import AdminMostlyUsed from "./pages/admin/AdminMostlyUsed";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import About from "./pages/About";
import ProtectedUserRoute from "./components/ProtectedUserRoute";
import ProtectedAdminRoute from "./components/ProtectedAdminRoute";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsAndConditions from "./pages/TermsAndConditions";
import SubcategoryProducts from "./pages/SubcategoryProducts";
import SearchResults from "./pages/SearchResults";

import { Container } from "@mui/material";
import ScrollToTop from "./components/ScrollToTop";
import SliderWrapper from "./components/SliderWrapper";

export default function App() {
  const location = useLocation();

  return (
    <>
      <ScrollToTop />
      <Navbar />

      {/* ⭐ Show slider only on homepage */}
      {location.pathname === "/" && <SliderWrapper />}

      <Container >
        <Routes>
          {/* PUBLIC ROUTES */}
          <Route path="/" element={<Home />} />
          <Route path="/product/:id" element={<ProductPage />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/about" element={<About />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<TermsAndConditions />} />
          <Route path="/subcategory/:subcategoryId" element={<SubcategoryProducts />} />
          <Route path="/search" element={<SearchResults />} />

          {/* USER AUTH */}
          <Route path="/user/login" element={<UserLogin />} />
          <Route path="/user/register" element={<Register />} />

          {/* USER PROTECTED ROUTES */}
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

          <Route
            path="/user/dashboard"
            element={
              <ProtectedUserRoute>
                <UserDashboard />
              </ProtectedUserRoute>
            }
          />

          {/* ADMIN AUTH */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/register" element={<AdminRegister />} />

          {/* ADMIN PROTECTED ROUTES */}
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
            path="/admin/feedbacks"
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

          <Route
            path="/admin/manage-slider"
            element={
              <ProtectedAdminRoute>
                <ManageSlider />
              </ProtectedAdminRoute>
            }
          />

          <Route
            path="/admin/mostly-used"
            element={
              <ProtectedAdminRoute>
                <AdminMostlyUsed />
              </ProtectedAdminRoute>
            }
          />

          <Route
            path="/admin/offers"
            element={
              <ProtectedAdminRoute>
                <AdminOffers />
              </ProtectedAdminRoute>
            }
          />
        </Routes>
      </Container>

      <Footer />
    </>
  );
}
