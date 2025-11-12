import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ adminOnly, children }) {
  const user = localStorage.getItem("user");
  const admin = localStorage.getItem("admin");

  if (adminOnly) {
    return admin ? children : <Navigate to="/admin/login" />;
  }

  return user ? children : <Navigate to="/user/login" />;
}
