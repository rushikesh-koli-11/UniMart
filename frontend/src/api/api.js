import axios from "axios";

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:5000/api",
});

API.interceptors.request.use((config) => {
  const userToken = localStorage.getItem("user_token");
  const adminToken = localStorage.getItem("admin_token");

  // ✅ Admin-only routes
  if (
    config.url.startsWith("/admin") ||
    config.url.startsWith("/stats") ||
    config.url.startsWith("/users") ||
    config.url.startsWith("/categories") ||
    config.url.startsWith("/feedback/all") || // admin view feedback
    (config.method !== "get" && config.url.startsWith("/products")) ||
    (config.method === "get" && config.url === "/orders") // admin get all orders
  ) {
    if (adminToken) config.headers.Authorization = `Bearer ${adminToken}`;
    return config;
  }

  // ✅ User-only routes
  if (
    config.url.startsWith("/orders") ||
    config.url.startsWith("/checkout") ||
    config.url.startsWith("/feedback") // 👈 added this
  ) {
    if (userToken) config.headers.Authorization = `Bearer ${userToken}`;
    return config;
  }

  // ✅ Default (if no match)
  if (userToken) config.headers.Authorization = `Bearer ${userToken}`;
  return config;
});

export default API;
