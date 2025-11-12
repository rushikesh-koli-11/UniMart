import React, { useContext, useState } from "react";
import { UserAuthContext } from "../contexts/UserAuthContext";
import { Typography, Card, CardContent, TextField, Button, Stack, Alert } from "@mui/material";

export default function UserDashboard() {
  const { user, updateUser } = useContext(UserAuthContext);
  const [form, setForm] = useState({
    name: user?.name || "",
    phone: user?.phone || ""
  });

  const [msg, setMsg] = useState("");

  const saveChanges = async () => {
    try {
      await updateUser(form);
      setMsg("✅ Profile updated successfully");
      setTimeout(() => setMsg(""), 2000);
    } catch {
      setMsg("❌ Failed to update profile");
    }
  };

  if (!user) return <Typography>Loading...</Typography>;

  return (
    <Card sx={{ maxWidth: 450, mx: "auto", p: 3 }}>
      <CardContent>
        <Typography variant="h5" sx={{ mb: 2 }}>
          My Profile
        </Typography>

        {msg && <Alert severity="info">{msg}</Alert>}

        <Stack spacing={2}>
          <TextField
            label="Full Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />

          <TextField
            label="Email"
            value={user.email}
            disabled
          />

          <TextField
            label="Phone"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
          />

          <Typography>
            <strong>Member Since:</strong>{" "}
            {new Date(user.createdAt).toLocaleDateString()}
          </Typography>

          <Button variant="contained" onClick={saveChanges}>
            Save Changes
          </Button>
        </Stack>
      </CardContent>
    </Card>
  );
}
