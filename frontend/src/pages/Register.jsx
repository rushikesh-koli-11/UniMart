import React, { useState, useEffect } from "react";
import { Alert } from "@mui/material";
import API from "../api/api";
import { useNavigate, Link } from "react-router-dom";
import "./Register.css";

export default function Register() {
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

  useEffect(() => {
    if (timer <= 0) return;
    const interval = setInterval(() => setTimer((t) => t - 1), 1000);
    return () => clearInterval(interval);
  }, [timer]);

  const validateBeforeOtp = () => {
    if (!form.name) return "Enter full name";
    if (!form.email.endsWith("@gmail.com"))
      return "Email must end with @gmail.com";
    if (!/^\d{10}$/.test(form.phone))
      return "Phone must be 10 digits";
    return null;
  };

  const sendOTP = async () => {
    const err = validateBeforeOtp();
    if (err) return setMsg(err);

    try {
      await API.post("/otp/send-otp", {
        phoneNumber: form.phone,
        purpose: "signup",
      });

      setOtpSent(true);
      setTimer(120);
      setMsg("📩 OTP sent successfully");
    } catch (err) {
      setMsg(err.response?.data?.message || "Failed to send OTP");
    }
  };

  const verifyOTP = async () => {
    try {
      await API.post("/otp/verify-otp", {
        phoneNumber: form.phone,
        otp,
      });

      setOtpVerified(true);
      setMsg("✅ Mobile number verified!");
    } catch (err) {
      setMsg(err.response?.data?.message || "Invalid OTP");
    }
  };

  const submit = async () => {
    if (!otpVerified) return setMsg("⚠️ Please verify phone first");

    if (form.password !== form.confirmPassword)
      return setMsg("Passwords do not match");

    try {
      await API.post("/auth/register", form);
      setMsg("✅ Registered successfully! Redirecting...");
      setTimeout(() => navigate("/user/login"), 1500);
    } catch (err) {
      setMsg(err.response?.data?.message || "Registration failed");
    }
  };

  const formatTime = (sec) => {
    const m = Math.floor(sec / 60).toString().padStart(2, "0");
    const s = (sec % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  return (
    <div className="signup-container">
      <div className="signup-card shadow-lg">
        <h3 className="text-center mb-4 heading">Create User Account</h3>

        {msg && <Alert severity="info" className="mb-3">{msg}</Alert>}

        <input
          className="form-control input-box mb-1"
          placeholder="Full Name"
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />

        <input
          className="form-control input-box mb-0"
          placeholder="Email (@gmail.com only)"
          onChange={(e) => {
            const email = e.target.value;
            setForm({ ...form, email });
            if (!email.endsWith("@gmail.com")) setMsg("⚠️ Enter valid Gmail");
            else setMsg("");
          }}
        />

        <div className="otp-box mt-3 mb-1">
          <input
            className="form-control input-box"
            placeholder="Phone Number"
            maxLength={10}
            value={form.phone}
            onChange={(e) => {
              const val = e.target.value;
              if (/^\d*$/.test(val))
                setForm({ ...form, phone: val });
            }}
          />

          {!otpSent && (
            <button className="btn signup-btn" onClick={sendOTP}>
              Send OTP
            </button>
          )}
        </div>

        {otpSent && !otpVerified && (
          <>
            <div className="otp-box mb-2 mt-3">
              <input
                className="form-control input-box"
                placeholder="Enter OTP"
                onChange={(e) => setOtp(e.target.value)}
              />

              <button className="btn signup-btn" onClick={verifyOTP}>
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

        {otpVerified && (
          <>
            <input
              type="password"
              className="form-control input-box mb-1"
              placeholder="Create Password"
              onChange={(e) =>
                setForm({ ...form, password: e.target.value })
              }
            />

            <input
              type="password"
              className="form-control input-box mb-0"
              placeholder="Confirm Password"
              onChange={(e) =>
                setForm({ ...form, confirmPassword: e.target.value })
              }
            />

            {form.confirmPassword &&
              form.password !== form.confirmPassword && (
                <small className="text-danger">Passwords do not match</small>
              )}

            <button className="signup-btn mt-3" onClick={submit}>
              Register
            </button>
          </>
        )}

        <p className="text-center mt-3">
          Already have an account?
          <Link className="register-link" to="/user/login"> Login</Link>
        </p>
      </div>
    </div>
  );
}
