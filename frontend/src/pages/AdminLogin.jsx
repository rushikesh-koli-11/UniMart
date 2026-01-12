import React, { useState, useContext } from "react";
import { Alert } from "@mui/material";
import { AdminAuthContext } from "../contexts/AdminAuthContext";
import { useNavigate, Link } from "react-router-dom";
import API from "../api/api";
import "./AdminLogin.css";

export default function AdminLogin() {
  const { loginAdmin } = useContext(AdminAuthContext);
  const navigate = useNavigate();

  const [form, setForm] = useState({ phone: "", password: "" });
  const [msg, setMsg] = useState("");

  const [forgot, setForgot] = useState(false);
  const [phone, setPhone] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpVerified, setOtpVerified] = useState(false);
  const [newPass, setNewPass] = useState("");

  const submitLogin = async () => {
    if (!/^\d{10}$/.test(form.phone))
      return setMsg("❌ Enter valid 10-digit mobile number");

    try {
      await loginAdmin(form.phone, form.password);
      navigate("/admin/dashboard");
    } catch {
      setMsg("❌ Incorrect number or password");
    }
  };

  const sendOTP = async () => {
    if (!/^\d{10}$/.test(phone))
      return setMsg("Enter valid admin phone");

    try {
      await API.post("/otp/send-otp", {
        phoneNumber: phone,
        purpose: "admin-forgot",
      });

      setOtpSent(true);
      setMsg("📩 OTP sent to admin phone");
    } catch {
      setMsg("❌ Failed to send OTP");
    }
  };

  const verifyOTP = async () => {
    try {
      await API.post("/otp/verify-otp", {
        phoneNumber: phone,
        otp,
      });

      setOtpVerified(true);
      setMsg("✅ OTP verified! Set new password.");
    } catch (err) {
      setMsg(err.response?.data?.message || "❌ Invalid OTP");
    }
  };

  const resetPassword = async () => {
    if (!newPass) return setMsg("Enter new password");

    try {
      await API.post("/admin/reset-password", {
        phone,
        newPassword: newPass,
      });

      setMsg("✅ Password updated!");

      setTimeout(() => {
        setForgot(false);
        setOtpSent(false);
        setOtpVerified(false);
        navigate("/admin/login");
      }, 1500);
    } catch {
      setMsg("❌ Failed to update password");
    }
  };

  return (
    <div className="login-container">
      <div className="login-card shadow-lg">

        <h3 className="text-center mb-4 heading">
          {forgot ? "Reset Admin Password" : "Admin Login"}
        </h3>

        {msg && <Alert severity="info" className="mb-3">{msg}</Alert>}

        {!forgot ? (
          <>
            <input
              className="form-control input-box mb-3"
              placeholder="Admin Phone"
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

            <p className="text-center mb-2">
              <span className="link-btn" onClick={() => setForgot(true)}>
                Forgot Password?
              </span>
            </p>

            <p className="text-center">
              New admin?{" "}
              <Link className="register-link" to="/admin/register">
                Register
              </Link>
            </p>
          </>
        ) : (
          <>
            {!otpSent && (
              <>
                <input
                  className="form-control input-box mb-3"
                  placeholder="Registered Admin Phone"
                  maxLength={10}
                  value={phone}
                  onChange={(e) => {
                    if (/^\d*$/.test(e.target.value)) setPhone(e.target.value);
                  }}
                />
                <button className="login-btn" onClick={sendOTP}>
                  Send OTP
                </button>
              </>
            )}

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

            {otpVerified && (
              <>
                <input
                  type="password"
                  className="form-control input-box mb-3"
                  placeholder="New Password"
                  value={newPass}
                  onChange={(e) => setNewPass(e.target.value)}
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
