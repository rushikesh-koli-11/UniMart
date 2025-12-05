import { createContext, useState } from "react";
import API from "../api/api";

export const AdminAuthContext = createContext();

export const AdminAuthProvider = ({ children }) => {
  const stored = localStorage.getItem("admin");
  const [admin, setAdmin] = useState(stored ? JSON.parse(stored) : null);

  const loginAdmin = async (phone, password) => {
    const { data } = await API.post("/admin/login", { phone, password });
    localStorage.setItem("admin_token", data.token);
    localStorage.setItem("admin", JSON.stringify(data.admin));
    setAdmin(data.admin);
  };

  const logoutAdmin = () => {
    localStorage.removeItem("admin_token");
    localStorage.removeItem("admin");
    setAdmin(null);
  };

  return (
    <AdminAuthContext.Provider value={{ admin, loginAdmin, logoutAdmin }}>
      {children}
    </AdminAuthContext.Provider>
  );
};
