import axios from "axios";

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:5000/api",
});

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

  if (path.includes("/reviews")) {
    if (userToken)
      config.headers.Authorization = `Bearer ${userToken}`;
    return config;
  }

  if (path === "/feedback" && config.method === "post") {
    return config;
  }

  if (path.includes("feedback") || path.includes("feedbacks")) {
    if (adminToken)
      config.headers.Authorization = `Bearer ${adminToken}`;
    return config;
  }
  if (
    (path === "/products" && config.method === "post") ||
    (path.startsWith("/products/") &&
      ["put", "delete"].includes(config.method))
  ) {
    if (adminToken)
      config.headers.Authorization = `Bearer ${adminToken}`;
    return config;
  }

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

  if (
    path.startsWith("/orders") ||
    path.startsWith("/checkout") ||
    path.startsWith("/user")
  ) {
    if (userToken)
      config.headers.Authorization = `Bearer ${userToken}`;
    return config;
  }

  if (userToken) {
    config.headers.Authorization = `Bearer ${userToken}`;
  }

  return config;
});

export default API;
