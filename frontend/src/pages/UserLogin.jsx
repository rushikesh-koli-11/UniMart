import React, { useState, useContext } from "react";
import { TextField, Button, Stack, Typography, Alert } from "@mui/material";
import { UserAuthContext } from "../contexts/UserAuthContext";
import { useNavigate, Link } from "react-router-dom";

export default function UserLogin() {
  const { loginUser } = useContext(UserAuthContext);
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: "", password: "" });
  const [msg, setMsg] = useState("");

  const submit = async () => {
    try {
      await loginUser(form.email, form.password);
      navigate("/");
    } catch (err) {
      setMsg("Login failed. Check your email or password.");
    }
  };

  return (
    <Stack spacing={2} sx={{ maxWidth: 400, mx: "auto" }}>
      <Typography variant="h5">User Login</Typography>

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
        Don't have an account? <Link to="/user/register">Register</Link>
      </Typography>
    </Stack>
  );
}
