import { createContext, useState } from "react";
import API from "../api/api";

export const UserAuthContext = createContext();

export const UserAuthProvider = ({ children }) => {
  const stored = localStorage.getItem("user");
  const [user, setUser] = useState(stored ? JSON.parse(stored) : null);

  const loginUser = async (email, password) => {
    const { data } = await API.post("/auth/login", { email, password });
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


  return (
    <UserAuthContext.Provider value={{ user, loginUser, logoutUser, updateUser }}>
  {children}
</UserAuthContext.Provider>

  );
};
