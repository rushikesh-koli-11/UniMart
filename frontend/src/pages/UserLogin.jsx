import React, { useState, useContext } from "react";
import { Alert } from "@mui/material";
import { UserAuthContext } from "../contexts/UserAuthContext";
import { useNavigate, Link } from "react-router-dom";
import API from "../api/api";
import "./UserLogin.css";

export default function UserLogin() {
  const { loginUser } = useContext(UserAuthContext);
  const navigate = useNavigate();

  const [form, setForm] = useState({ phone: "", password: "" });
  const [msg, setMsg] = useState("");

  // Forgot Password states
  const [forgot, setForgot] = useState(false);
  const [phone, setPhone] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpVerified, setOtpVerified] = useState(false);
  const [newPassword, setNewPassword] = useState("");

  /* ================================================
     LOGIN USING MOBILE + PASSWORD
  ================================================= */
  const submitLogin = async () => {
    if (!/^\d{10}$/.test(form.phone))
      return setMsg("❌ Enter valid 10-digit mobile number");

    try {
      await loginUser(form.phone, form.password);
      navigate("/");
    } catch (err) {
      setMsg(err.response?.data?.message || "❌ Invalid phone or password");
    }
  };

  /* ================================================
     SEND REAL OTP using /otp/send-otp
  ================================================= */
  const sendOTP = async () => {
    if (!/^\d{10}$/.test(phone))
      return setMsg("Enter valid 10-digit registered phone number");

    try {
      await API.post("/otp/send-otp", {
        phoneNumber: phone,
        purpose: "forgot",
      });

      setOtpSent(true);
      setMsg("📩 OTP sent to your phone");
    } catch (err) {
      setMsg(err.response?.data?.message || "❌ Failed to send OTP");
    }
  };

  /* ================================================
     VERIFY OTP using /otp/verify-otp
  ================================================= */
  const verifyOTP = async () => {
    try {
      await API.post("/otp/verify-otp", {
        phoneNumber: phone,
        otp,
      });

      setOtpVerified(true);
      setMsg("✅ OTP Verified! Set your new password.");
    } catch (err) {
      setMsg(err.response?.data?.message || "❌ Incorrect or expired OTP");
    }
  };

  /* ================================================
     SET NEW PASSWORD IN BACKEND
  ================================================= */
  const resetPassword = async () => {
    if (!newPassword) return setMsg("Enter new password");

    try {
      await API.post("/auth/reset-password", {
        phone,
        newPassword,
      });

      setMsg("✅ Password updated successfully!");

      setTimeout(() => {
        setForgot(false);
        setOtpSent(false);
        setOtpVerified(false);
        navigate("/user/login");
      }, 1500);
    } catch (err) {
      setMsg(err.response?.data?.message || "❌ Failed to update password.");
    }
  };

  /* ---------------- UI ---------------- */

  return (
    <div className="login-container">
      <div className="login-card shadow-lg">

        <h3 className="text-center mb-4 heading">
          {forgot ? "Reset Password" : "User Login"}
        </h3>

        {msg && <Alert severity="info" className="mb-3">{msg}</Alert>}

        {/* ========== LOGIN FORM ========== */}
        {!forgot ? (
          <>
            <input
              className="form-control input-box mb-3"
              placeholder="Mobile Number (10 digits)"
              maxLength={10}
              value={form.phone}
              onChange={(e) => {
                if (/^\d*$/.test(e.target.value))
                  setForm({ ...form, phone: e.target.value });
              }}
            />

            <input
              type="password"
              className="form-control input-box mb-3"
              placeholder="Password"
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />

            <button className="login-btn mb-2" onClick={submitLogin}>
              Login
            </button>

            <p className="text-center">
              <span className="link-btn" onClick={() => setForgot(true)}>
                Forgot Password?
              </span>
            </p>

            <p className="text-center mt-2">
              Don’t have an account?{" "}
              <Link className="register-link" to="/user/register">Register</Link>
            </p>
          </>
        ) : (
          <>
            {/* ========== ENTER PHONE FOR RESET ========== */}
            {!otpSent && (
              <>
                <input
                  className="form-control input-box mb-3"
                  placeholder="Registered Phone Number"
                  value={phone}
                  maxLength={10}
                  onChange={(e) => {
                    if (/^\d*$/.test(e.target.value))
                      setPhone(e.target.value);
                  }}
                />

                <button className="login-btn" onClick={sendOTP}>
                  Send OTP
                </button>
              </>
            )}

            {/* ========== ENTER OTP ========== */}
            {otpSent && !otpVerified && (
              <>
                <input
                  className="form-control input-box mb-3"
                  placeholder="Enter OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                />

                <button className="login-btn" onClick={verifyOTP}>
                  Verify OTP
                </button>
              </>
            )}

            {/* ========== SET NEW PASSWORD ========== */}
            {otpVerified && (
              <>
                <input
                  type="password"
                  className="form-control input-box mb-3"
                  placeholder="New Password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />

                <button className="login-btn" onClick={resetPassword}>
                  Save New Password
                </button>
              </>
            )}

            <p className="text-center mt-3">
              <span
                className="link-btn"
                onClick={() => {
                  setForgot(false);
                  setOtpSent(false);
                  setOtpVerified(false);
                }}
              >
                ← Back to Login
              </span>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
