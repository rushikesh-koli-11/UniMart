import axios from "axios";

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:5000/api",
});

// ===================================================
//  🔧 NORMALIZE PATH for reliable matching
// ===================================================
const normalizePath = (config) => {
  let path = (config.url || "").toLowerCase();

  if (!path.startsWith("/")) {
    path = "/" + path;
  }
  return path;
};

API.interceptors.request.use((config) => {
  const userToken = localStorage.getItem("user_token");
  const adminToken = localStorage.getItem("admin_token");

  const path = normalizePath(config);

  // ===================================================
  // ⭐ ALWAYS - Reviews use user token ONLY
  // ===================================================
  if (path.includes("/reviews")) {
    if (userToken)
      config.headers.Authorization = `Bearer ${userToken}`;
    return config;
  }

  // ===================================================
  // ⭐ PUBLIC FEEDBACK POST ONLY (User form)
  // ===================================================
  if (path === "/feedback" && config.method === "post") {
    return config;
  }

  // ===================================================
  // ⭐ ADMIN - FEEDBACK LIST, DELETE, ANY FEEDBACK ACTION
  // ===================================================
  if (path.includes("feedback") || path.includes("feedbacks")) {
    if (adminToken)
      config.headers.Authorization = `Bearer ${adminToken}`;
    return config;
  }

  // ===================================================
  // ⭐ ADMIN PRODUCT CRUD
  // ===================================================
  if (
    (path === "/products" && config.method === "post") ||
    (path.startsWith("/products/") &&
      ["put", "delete"].includes(config.method))
  ) {
    if (adminToken)
      config.headers.Authorization = `Bearer ${adminToken}`;
    return config;
  }

  // ===================================================
  // ⭐ OTHER ADMIN ROUTES
  // ===================================================
  if (
    path.includes("/admin") ||
    path.includes("/offers") || 
    path.includes("/upload") ||
    path.includes("/slider") ||
    path.includes("/mostly-used") ||
    path.includes("/stats") ||
    path.includes("/users") ||
    path.includes("/categories")
  ) {
    if (adminToken)
      config.headers.Authorization = `Bearer ${adminToken}`;
    return config;
  }

  // ===================================================
  // ⭐ USER ROUTES
  // ===================================================
  if (
    path.startsWith("/orders") ||
    path.startsWith("/checkout") ||
    path.startsWith("/user")
  ) {
    if (userToken)
      config.headers.Authorization = `Bearer ${userToken}`;
    return config;
  }

  // ===================================================
  // ⭐ DEFAULT → assign user token if available
  // ===================================================
  if (userToken) {
    config.headers.Authorization = `Bearer ${userToken}`;
  }

  return config;
});

export default API;
