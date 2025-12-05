import React, { useContext, useState } from "react";
import {
  TextField,
  Button,
  Paper,
  Typography,
  Stack,
  Alert,
  Box
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import API from "../api/api";
import { UserAuthContext } from "../contexts/UserAuthContext";
import "./Feedback.css";

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

      setMessage("Thank you! Your feedback has been submitted successfully.");
      setComment("");

      setTimeout(() => navigate("/"), 500);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send feedback");
    }
  };

  return (
    <Box className="feedback-wrapper">
      <Paper elevation={4} className="feedback-card">

        <Typography variant="h5" className="feedback-title">
          💬 Send Us Your Feedback
        </Typography>

        <Typography className="feedback-subtext mb-3">
          We value your thoughts — please let us know how we can improve!
        </Typography>

        {message && <Alert severity="success" className="alert-msg">{message}</Alert>}
        {error && <Alert severity="error" className="alert-msg">{error}</Alert>}

        <form onSubmit={handleSubmit}>
          <Stack spacing={2}>

            <TextField
              label="Name"
              fullWidth
              value={user?.name || ""}
              InputProps={{ readOnly: true }}
              className="input-field"
            />

            <TextField
              label="Email"
              fullWidth
              value={user?.email || ""}
              InputProps={{ readOnly: true }}
              className="input-field"
            />

            <TextField
              label="Mobile Number"
              fullWidth
              value={user?.phone || ""}
              InputProps={{ readOnly: true }}
              className="input-field"
            />

            <TextField
              label="Your Feedback"
              multiline
              rows={4}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Type your comments here..."
              fullWidth
              className="input-field"
            />

            <Button type="submit" fullWidth className="feedback-btn">
              Submit Feedback
            </Button>
          </Stack>
        </form>
      </Paper>
    </Box>
  );
}
