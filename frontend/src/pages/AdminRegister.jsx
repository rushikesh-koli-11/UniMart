import React, { useState, useEffect } from "react";
import { Alert } from "@mui/material";
import API from "../api/api";
import { useNavigate, Link } from "react-router-dom";
import "./AdminRegister.css";

export default function AdminRegister() {
  const navigate = useNavigate();
  const [msg, setMsg] = useState("");

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [timer, setTimer] = useState(0);

  // Live warnings
  const [emailWarning, setEmailWarning] = useState("");
  const [phoneWarning, setPhoneWarning] = useState("");

  /* ---------------- TIMER ---------------- */
  useEffect(() => {
    if (timer <= 0) return;
    const interval = setInterval(() => setTimer((t) => t - 1), 1000);
    return () => clearInterval(interval);
  }, [timer]);

  const formatTime = (sec) => {
    const m = Math.floor(sec / 60).toString().padStart(2, "0");
    const s = (sec % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  /* ---------------- SEND OTP ---------------- */
  const sendOTP = async () => {
    if (emailWarning || phoneWarning)
      return setMsg("Fix validation errors first");

    try {
      await API.post("/otp/send-otp", {
        phoneNumber: form.phone,
        purpose: "admin-signup",
      });

      setOtpSent(true);
      setTimer(120);
      setMsg("📩 OTP sent to admin phone");
    } catch (err) {
      setMsg(err.response?.data?.message || "Failed to send OTP");
    }
  };

  /* ---------------- VERIFY OTP ---------------- */
  const verifyOTP = async () => {
    try {
      await API.post("/otp/verify-otp", {
        phoneNumber: form.phone,
        otp,
      });

      setOtpVerified(true);
      setMsg("✅ Phone verified successfully!");
    } catch (err) {
      setMsg(err.response?.data?.message || "Invalid OTP");
    }
  };

  /* ---------------- REGISTER ADMIN ---------------- */
  const submit = async () => {
    if (!otpVerified)
      return setMsg("⚠️ Verify phone number before registration");

    if (form.password !== form.confirmPassword)
      return setMsg("Passwords do not match");

    try {
      await API.post("/admin/register", form);
      setMsg("✅ Admin registered! Redirecting...");
      setTimeout(() => navigate("/admin/login"), 1500);
    } catch (err) {
      setMsg(err.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div className="register-container">
      <div className="register-card shadow-lg">
        <h3 className="text-center mb-4 heading">Admin Register</h3>

        {msg && <Alert severity="info" className="mb-3">{msg}</Alert>}

        {/* NAME */}
        <input
          className="form-control input-box mb-3"
          placeholder="Full Name"
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />

        {/* EMAIL */}
        <input
          className="form-control input-box mb-0"
          placeholder="Admin Email (@gmail.com)"
          value={form.email}
          onChange={(e) => {
            const email = e.target.value;
            setForm({ ...form, email });

            if (!email.endsWith("@gmail.com"))
              setEmailWarning("⚠️ Email must end with @gmail.com");
            else setEmailWarning("");
          }}
        />
        {emailWarning && <small className="text-danger">{emailWarning}</small>}

        {/* PHONE + SEND OTP */}
        <div className="d-flex gap-2 mt-3 mb-2">
          <input
            className="form-control input-box"
            placeholder="Valid admin phone"
            maxLength={10}
            value={form.phone}
            onChange={(e) => {
              const v = e.target.value;
              if (!/^\d*$/.test(v)) return;

              setForm({ ...form, phone: v });
              if (v.length !== 10)
                setPhoneWarning("⚠️ Phone must be 10 digits");
              else setPhoneWarning("");
            }}
          />

          {!otpSent && (
            <button
              className="register-btn"
              disabled={emailWarning || phoneWarning}
              onClick={sendOTP}
            >
              Send OTP
            </button>
          )}
        </div>

        {phoneWarning && <small className="text-danger">{phoneWarning}</small>}

        {/* OTP FIELD */}
        {otpSent && !otpVerified && (
          <>
            <div className="d-flex gap-2 mt-3 mb-2">
              <input
                className="form-control input-box"
                placeholder="Enter OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
              />

              <button className="register-btn" onClick={verifyOTP}>
                Verify
              </button>
            </div>

            <div className="text-center mb-3">
              {timer > 0 ? (
                <p className="text-muted">OTP expires in {formatTime(timer)}</p>
              ) : (
                <button className="btn btn-link" onClick={sendOTP}>
                  Resend OTP
                </button>
              )}
            </div>
          </>
        )}

        {/* PASSWORD FIELDS — ONLY AFTER OTP VERIFIED */}
        {otpVerified && (
          <>
            <input
              type="password"
              className="form-control input-box mb-1"
              placeholder="Password"
              onChange={(e) =>
                setForm({ ...form, password: e.target.value })
              }
            />

            <input
              type="password"
              className="form-control input-box mb-0"
              placeholder="Re-enter Password"
              onChange={(e) =>
                setForm({ ...form, confirmPassword: e.target.value })
              }
            />

            <button className="register-btn mt-3" onClick={submit}>
              Register Admin
            </button>
          </>
        )}

        <p className="text-center mt-3">
          Already an admin?
          <Link className="register-link" to="/admin/login"> Login</Link>
        </p>
      </div>
    </div>
  );
}
