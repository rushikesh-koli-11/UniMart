import React, { useState, useContext } from "react";
import { TextField, Button, Stack, Typography, Alert } from "@mui/material";
import { AdminAuthContext } from "../contexts/AdminAuthContext";
import { useNavigate, Link } from "react-router-dom";

export default function AdminLogin() {
  const { loginAdmin } = useContext(AdminAuthContext);
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: "", password: "" });
  const [msg, setMsg] = useState("");

  const submit = async () => {
    try {
      await loginAdmin(form.email, form.password);
      navigate("/admin/dashboard");
    } catch (err) {
      setMsg("Admin login failed.");
    }
  };

  return (
    <Stack spacing={2} sx={{ maxWidth: 400, mx: "auto" }}>
      <Typography variant="h5">Admin Login</Typography>

      {msg && <Alert severity="error">{msg}</Alert>}

      <TextField
        label="Email"
        onChange={(e) => setForm({ ...form, email: e.target.value })}
      />
      <TextField
        type="password"
        label="Password"
        onChange={(e) => setForm({ ...form, password: e.target.value })}
      />

      <Button variant="contained" onClick={submit}>
        Login
      </Button>

      <Typography>
        Need an admin account? <Link to="/admin/register">Register</Link>
      </Typography>
    </Stack>
  );
}
