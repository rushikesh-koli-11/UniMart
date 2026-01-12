import { createContext, useState } from "react";
import API from "../api/api";

export const UserAuthContext = createContext();

export function UserAuthProvider({ children }) {
  const stored = localStorage.getItem("user");
  const [user, setUser] = useState(stored ? JSON.parse(stored) : null);

  const loginUser = async (phone, password) => {
    const { data } = await API.post("/auth/login", { phone, password });
    localStorage.setItem("user_token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));
    setUser(data.user);
  };

  const logoutUser = () => {
    localStorage.removeItem("user_token");
    localStorage.removeItem("user");
    setUser(null);
  };

  const updateUser = async (updates) => {
    const { data } = await API.put("/auth/update", updates);
    localStorage.setItem("user", JSON.stringify(data.user));
    setUser(data.user);
  };


  const addAddress = async (addr) => {
    const { data } = await API.post("/auth/address/add", addr);
    localStorage.setItem("user", JSON.stringify(data.user));
    setUser(data.user);
  };

  const updateAddress = async (id, addr) => {
    const { data } = await API.put(`/auth/address/update/${id}`, addr);
    localStorage.setItem("user", JSON.stringify(data.user));
    setUser(data.user);
  };

  const removeAddress = async (id) => {
    const { data } = await API.delete(`/auth/address/remove/${id}`);
    localStorage.setItem("user", JSON.stringify(data.user));
    setUser(data.user);
  };

  const setDefaultAddress = async (id) => {
    const { data } = await API.put(`/auth/address/default/${id}`);
    localStorage.setItem("user", JSON.stringify(data.user));
    setUser(data.user);
  };

  const saveAddressFromCheckout = async (address) => {
    const { data } = await API.post("/auth/address/save-from-checkout", {
      label: "Other",
      address,
    });
    localStorage.setItem("user", JSON.stringify(data.user));
    setUser(data.user);
  };

  return (
    <UserAuthContext.Provider
      value={{
        user,
        setUser,
        loginUser,
        logoutUser,
        updateUser,
        addAddress,
        updateAddress,
        removeAddress,
        setDefaultAddress,
        saveAddressFromCheckout,
      }}
    >
      {children}
    </UserAuthContext.Provider>
  );
}
