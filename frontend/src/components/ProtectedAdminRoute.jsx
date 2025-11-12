import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AdminAuthContext } from "../contexts/AdminAuthContext";

export default function ProtectedAdminRoute({ children }) {
  const { admin } = useContext(AdminAuthContext);
  return admin ? children : <Navigate to="/admin/login" />;
}
