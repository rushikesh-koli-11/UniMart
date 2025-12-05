
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { BrowserRouter } from "react-router-dom";
import 'bootstrap/dist/css/bootstrap.min.css';
import './pages/admin/AdminOrders.css';  
import { UserAuthProvider } from "./contexts/UserAuthContext";
import { AdminAuthProvider } from "./contexts/AdminAuthContext";
import { CartProvider } from "./contexts/CartContext";

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <BrowserRouter>
    <AdminAuthProvider>     {/* ✅ Admin first */}
      <UserAuthProvider>    {/* ✅ Then user */}
        <CartProvider>      {/* ✅ Cart last */}
          <App />
        </CartProvider>
      </UserAuthProvider>
    </AdminAuthProvider>
  </BrowserRouter>
);
