import React, { useContext, useState } from "react";
import {
  TextField,
  Button,
  Paper,
  Typography,
  Stack,
  Alert,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import API from "../api/api";
import { UserAuthContext } from "../contexts/UserAuthContext";

export default function Feedback() {
  const { user } = useContext(UserAuthContext);
  const [comment, setComment] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    try {
      if (!comment.trim()) {
        return setError("Please write your feedback before submitting.");
      }

      const payload = {
        name: user?.name || "",
        email: user?.email || "",
        phone: user?.phone || "",
        comment,
      };

      await API.post("/feedback", payload);

      setMessage("✅ Thank you! Your feedback has been submitted successfully.");
      setComment("");

      // ✅ Redirect to Home page after short delay (optional)
      setTimeout(() => navigate("/"), 1500);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send feedback");
    }
  };

  return (
    <Paper
      elevation={4}
      sx={{
        maxWidth: 600,
        mx: "auto",
        mt: 4,
        p: 4,
        borderRadius: 3,
        background: "#fafafa",
      }}
    >
      <Typography variant="h5" gutterBottom sx={{ fontWeight: "bold" }}>
        💬 Send Us Your Feedback
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        We value your thoughts — please let us know how we can improve!
      </Typography>

      {message && <Alert severity="success">{message}</Alert>}
      {error && <Alert severity="error">{error}</Alert>}

      <form onSubmit={handleSubmit}>
        <Stack spacing={2}>
          <TextField
            label="Name"
            fullWidth
            value={user?.name || ""}
            InputProps={{ readOnly: true }}
          />

          <TextField
            label="Email"
            fullWidth
            value={user?.email || ""}
            InputProps={{ readOnly: true }}
          />

          <TextField
            label="Mobile Number"
            fullWidth
            value={user?.phone || ""}
            InputProps={{ readOnly: true }}
          />

          <TextField
            label="Your Feedback"
            multiline
            rows={4}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Type your comments here..."
            fullWidth
          />

          <Button type="submit" variant="contained" size="large">
            Submit Feedback
          </Button>
        </Stack>
      </form>
    </Paper>
  );
}
