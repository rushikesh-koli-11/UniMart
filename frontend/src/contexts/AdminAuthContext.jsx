import { createContext, useState, useEffect } from "react";
import API from "../api/api";

export const AdminAuthContext = createContext();

export const AdminAuthProvider = ({ children }) => {
  const storedAdmin = localStorage.getItem("admin");
  const storedToken = localStorage.getItem("admin_token");

  const [admin, setAdmin] = useState(storedAdmin ? JSON.parse(storedAdmin) : null);
  const [token, setToken] = useState(storedToken || null);
  const [loading, setLoading] = useState(true);

  /* ============================================
     FETCH ADMIN PROFILE IF TOKEN EXISTS
  ============================================= */
  useEffect(() => {
    const fetchAdmin = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const res = await API.get("/admin/me", {
          headers: { Authorization: `Bearer ${token}` },
        });

        setAdmin(res.data.admin);
        localStorage.setItem("admin", JSON.stringify(res.data.admin));
      } catch (err) {
        // Token expired or invalid → logout admin
        logoutAdmin();
      } finally {
        setLoading(false);
      }
    };

    fetchAdmin();
  }, [token]);

  /* ============================================
     LOGIN ADMIN
  ============================================= */
  const loginAdmin = async (phone, password) => {
    const { data } = await API.post("/admin/login", { phone, password });

    // Save session data
    localStorage.setItem("admin_token", data.token);
    localStorage.setItem("admin", JSON.stringify(data.admin));

    setToken(data.token);
    setAdmin(data.admin);
  };

  /* ============================================
     LOGOUT ADMIN
  ============================================= */
  const logoutAdmin = () => {
    localStorage.removeItem("admin_token");
    localStorage.removeItem("admin");

    setAdmin(null);
    setToken(null);
  };

  return (
    <AdminAuthContext.Provider
      value={{
        admin,
        token,
        loading,
        loginAdmin,
        logoutAdmin,
        setAdmin,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
};
