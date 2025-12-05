import React, { useState, useContext } from "react";
import { Alert } from "@mui/material";
import { AdminAuthContext } from "../contexts/AdminAuthContext";
import { useNavigate, Link } from "react-router-dom";
import API from "../api/api";
import { auth, setupRecaptcha } from "../firebase";
import { signInWithPhoneNumber } from "firebase/auth";
import "./AdminLogin.css";

export default function AdminLogin() {
  const { loginAdmin } = useContext(AdminAuthContext);
  const navigate = useNavigate();

  const [form, setForm] = useState({ phone: "", password: "" });
  const [msg, setMsg] = useState("");

  // Forgot password states
  const [forgot, setForgot] = useState(false);
  const [phone, setPhone] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpVerified, setOtpVerified] = useState(false);
  const [newPass, setNewPass] = useState("");

  /* ================================
        LOGIN USING MOBILE + PASSWORD
  =================================*/
  const submitLogin = async () => {
    if (!/^\d{10}$/.test(form.phone))
      return setMsg("❌ Enter valid 10-digit mobile number");

    try {
      await loginAdmin(form.phone, form.password);
      navigate("/admin/dashboard");
    } catch {
      setMsg("❌ Incorrect mobile number or password");
    }
  };

  /* ================================
      SEND FIXED TEST OTP VIA Fast2SMS
  =================================*/
  const sendOTP = async () => {
    if (!/^\d{10}$/.test(phone))
      return setMsg("❌ Enter valid 10-digit phone number");

    try {
      await API.post("/admin/send-code-sms", { phone });

      window.adminCode = "416779";
      setOtpSent(true);
      setMsg("📩 Code sent to your phone");
    } catch {
      setMsg("❌ Failed to send SMS");
    }
  };

  /* ================================
      VERIFY OTP THEN FIREBASE TEST
  =================================*/
  const verifyOTP = async () => {
    if (otp !== "416779")
      return setMsg("❌ Incorrect code");

    try {
      setupRecaptcha();

      const confirmation = await signInWithPhoneNumber(
        auth,
        "+919579695273", // your Firebase test phone
        window.recaptchaVerifier
      );

      await confirmation.confirm("416779");

      setOtpVerified(true);
      setMsg("✅ OTP Verified! Set new password.");
    } catch {
      setMsg("❌ Firebase verification failed");
    }
  };

  /* ================================
      RESET PASSWORD IN BACKEND
  =================================*/
  const resetPassword = async () => {
    if (!newPass) return setMsg("Enter new password");

    try {
      await API.post("/admin/reset-password", {
        phone,
        newPassword: newPass,
      });

      setMsg("✅ Password updated successfully!");

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

        <div id="recaptcha-container"></div>

        {msg && <Alert severity="info" className="mb-3">{msg}</Alert>}

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

            <p className="text-center mb-2">
              <span className="link-btn" onClick={() => setForgot(true)}>
                Forgot Password?
              </span>
            </p>

            <p className="text-center">
              Need an admin account?{" "}
              <Link className="register-link" to="/admin/register">
                Register
              </Link>
            </p>
          </>
        ) : (
          <>
            {/* PHONE INPUT */}
            {!otpSent && (
              <>
                <input
                  className="form-control input-box mb-3"
                  placeholder="Registered Phone Number"
                  maxLength={10}
                  value={phone}
                  onChange={(e) => {
                    if (/^\d*$/.test(e.target.value)) setPhone(e.target.value);
                  }}
                />
                <button className="login-btn" onClick={sendOTP}>
                  Send Code
                </button>
              </>
            )}

            {/* OTP INPUT */}
            {otpSent && !otpVerified && (
              <>
                <input
                  className="form-control input-box mb-3"
                  placeholder="Enter Code"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                />

                <button className="login-btn" onClick={verifyOTP}>
                  Verify Code
                </button>
              </>
            )}

            {/* NEW PASSWORD */}
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
