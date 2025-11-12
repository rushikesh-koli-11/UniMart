import React, { useState } from "react";
import { TextField, Button, Typography, Stack, Alert } from "@mui/material";
import API from "../api/api";
import { useNavigate, Link } from "react-router-dom";

export default function Register() {
  const navigate = useNavigate();
  const [msg, setMsg] = useState("");

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: ""
  });

  const submit = async () => {
    try {
      const res = await API.post("/auth/register", form);
      setMsg("✅ Registered successfully. Redirecting to login...");
      setTimeout(() => navigate("/user/login"), 1200);
    } catch (err) {
      setMsg(err.response?.data?.message || "Registration failed");
    }
  };

  return (
    <Stack spacing={2} sx={{ maxWidth: 400, mx: "auto" }}>
      <Typography variant="h5">User Register</Typography>

      {msg && <Alert severity="info">{msg}</Alert>}

      <TextField label="Full Name" onChange={(e) => setForm({ ...form, name: e.target.value })} />
      <TextField label="Email" onChange={(e) => setForm({ ...form, email: e.target.value })} />
      <TextField label="Phone" onChange={(e) => setForm({ ...form, phone: e.target.value })} />
      <TextField type="password" label="Password" onChange={(e) => setForm({ ...form, password: e.target.value })} />

      <Button variant="contained" onClick={submit}>Register</Button>

      <Typography>
        Already have an account? <Link to="/user/login">Login</Link>
      </Typography>
    </Stack>
  );
}
