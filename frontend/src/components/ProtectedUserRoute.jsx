import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { UserAuthContext } from "../contexts/UserAuthContext";

export default function ProtectedUserRoute({ children }) {
  const { user } = useContext(UserAuthContext);
  return user ? children : <Navigate to="/user/login" />;
}
