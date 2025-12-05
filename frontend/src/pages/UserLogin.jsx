import React, { useState, useContext } from "react";
import { Alert } from "@mui/material";
import { UserAuthContext } from "../contexts/UserAuthContext";
import { useNavigate, Link } from "react-router-dom";
import API from "../api/api";
import { auth, setupRecaptcha } from "../firebase";
import { signInWithPhoneNumber } from "firebase/auth";
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
      setMsg("❌ Login failed. Check your number or password.");
    }
  };

  /* ================================================
     SEND FIXED OTP (416779) USING FAST2SMS
  ================================================= */
  const sendOTP = async () => {
    if (!/^\d{10}$/.test(phone))
      return setMsg("Enter valid 10-digit registered phone number");

    try {
      // Send code 416779 via Fast2SMS
      await API.post("/auth/send-code-sms", { phone });

      window.userCode = "416779";

      setOtpSent(true);
      setMsg("📩 Code sent to your phone");
    } catch (err) {
      setMsg("❌ Failed to send SMS");
    }
  };

  /* ================================================
     VERIFY USER ENTERED CODE (416779)
     Then verify Firebase test number (9579695273)
  ================================================= */
  const verifyOTP = async () => {
    if (otp !== "416779")
      return setMsg("❌ Incorrect code");

    try {
      setupRecaptcha();

      const confirmation = await signInWithPhoneNumber(
        auth,
        "+919579695273",  // Firebase test mobile
        window.recaptchaVerifier
      );

      await confirmation.confirm("416779"); // Firebase test OTP

      setOtpVerified(true);
      setMsg("✅ OTP Verified! Set your new password.");
    } catch (err) {
      console.log(err);
      setMsg("❌ Firebase verification failed");
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
      setMsg("❌ Failed to update password.");
    }
  };

  /* ---------------- UI ---------------- */

  return (
    <div className="login-container">
      <div className="login-card shadow-lg">

        <h3 className="text-center mb-4 heading">
          {forgot ? "Reset Password" : "User Login"}
        </h3>

        <div id="recaptcha-container"></div>

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
              Don’t have an account? <Link className="register-link" to="/user/register">Register</Link>
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
                  Send Code
                </button>
              </>
            )}

            {/* ========== ENTER OTP ========== */}
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
