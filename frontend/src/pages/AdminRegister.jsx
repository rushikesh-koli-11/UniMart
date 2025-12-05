import React, { useState, useEffect } from "react";
import { Alert } from "@mui/material";
import API from "../api/api";
import { useNavigate, Link } from "react-router-dom";
import { auth, setupRecaptcha } from "../firebase";
import { signInWithPhoneNumber } from "firebase/auth";
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

  // Immediate warnings
  const [emailWarning, setEmailWarning] = useState("");
  const [phoneWarning, setPhoneWarning] = useState("");
  const [passwordWarning, setPasswordWarning] = useState("");

  const FIXED_OTP = "416779";

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

  /* ---------------- SEND CODE ---------------- */
  const sendAdminCode = async () => {
    if (emailWarning || phoneWarning || passwordWarning)
      return setMsg("Fix form errors first");

    try {
      await API.post("/admin/send-code-sms", { phone: form.phone });

      window.adminCode = FIXED_OTP;
      setOtpSent(true);
      setTimer(300);

      setMsg("📩 Verification code sent to your phone");
    } catch (err) {
      setMsg("❌ Failed to send SMS");
    }
  };

  /* ---------------- RESEND CODE ---------------- */
  const resendCode = async () => {
    try {
      await API.post("/admin/send-code-sms", { phone: form.phone });
      setMsg("📩 Code re-sent");
      setTimer(300);
    } catch {
      setMsg("❌ Failed to resend code");
    }
  };

  /* ---------------- VERIFY OTP ---------------- */
  const verifyAdminCode = async () => {
    if (timer <= 0) return setMsg("⏳ OTP expired. Please resend.");

    if (otp !== FIXED_OTP) {
      return setMsg("❌ Incorrect code");
    }

    try {
      setupRecaptcha();

      const confirmation = await signInWithPhoneNumber(
        auth,
        "+919579695273", // Firebase test number
        window.recaptchaVerifier
      );

      await confirmation.confirm(FIXED_OTP);

      setOtpVerified(true);
      setMsg("✅ Phone verified!");
    } catch (err) {
      console.log(err);
      setMsg("❌ Firebase verification failed");
    }
  };

  /* ---------------- REGISTER ADMIN ---------------- */
  const submit = async () => {
    if (!otpVerified) return setMsg("⚠️ Please verify phone first");

    try {
      await API.post("/admin/register", form);
      setMsg("✅ Admin registered successfully! Redirecting...");

      setTimeout(() => navigate("/admin/login"), 1500);
    } catch (err) {
      setMsg(err.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div className="register-container">
      <div className="register-card shadow-lg">

        <h3 className="text-center mb-4 heading">Admin Register</h3>
        <div id="recaptcha-container"></div>

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

            if (!email.endsWith("@gmail.com")) {
              setEmailWarning("⚠️ Enter a valid email address.");
            } else {
              setEmailWarning("");
            }
          }}
        />
        {emailWarning && <small className="text-danger">{emailWarning}</small>}

        {/* PHONE */}
        <div className="d-flex gap-2 mt-3 mb-2">
          <input
            className="form-control input-box"
            placeholder="Enter a valid phone number"
            disabled={!form.email.endsWith("@gmail.com")}
            maxLength={10}
            value={form.phone}
            onChange={(e) => {
              const v = e.target.value;
              if (!/^\d*$/.test(v)) return;

              setForm({ ...form, phone: v });

              if (v.length !== 10) {
                setPhoneWarning("⚠️Enter a valid phone number");
              } else {
                setPhoneWarning("");
              }
            }}
          />

          {!otpSent && (
            <button
              className="register-btn"
              disabled={phoneWarning || emailWarning}
              onClick={sendAdminCode}
            >
              Send Code
            </button>
          )}
        </div>

        {phoneWarning && <small className="text-danger">{phoneWarning}</small>}

        {/* OTP SECTION */}
        {otpSent && (
          <>
            <div className="d-flex gap-2 mt-3 mb-2">
              <input
                className="form-control input-box"
                placeholder="Enter OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
              />

              {!otpVerified ? (
                <button className="register-btn" onClick={verifyAdminCode}>
                  Verify
                </button>
              ) : (
                <Alert severity="success" className="w-100">
                  Phone Verified
                </Alert>
              )}
            </div>

            {/* OTP LIVE WARNING */}
            {otp && otp !== FIXED_OTP && !otpVerified && (
              <small className="text-danger">Incorrect OTP</small>
            )}

            {/* TIMER */}
            <div className="text-center mb-3">
              {timer > 0 ? (
                <p className="text-muted">OTP expires in {formatTime(timer)}</p>
              ) : (
                <button className="btn btn-link" onClick={resendCode}>
                  Resend Code
                </button>
              )}
            </div>
          </>
        )}

        {/* PASSWORD */}
        <input
          type="password"
          className="form-control input-box mb-1"
          placeholder="Password"
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />

        {/* CONFIRM PASSWORD */}
        <input
          type="password"
          className="form-control input-box mb-0"
          placeholder="Re-enter Password"
          value={form.confirmPassword}
          onChange={(e) => {
            const val = e.target.value;
            setForm({ ...form, confirmPassword: val });

            if (val !== form.password) {
              setPasswordWarning("❌ Passwords do not match");
            } else {
              setPasswordWarning("");
            }
          }}
        />

        {passwordWarning && (
          <small className="text-danger">{passwordWarning}</small>
        )}

        {/* SUBMIT */}
        <button
          className="register-btn mt-3"
          disabled={!otpVerified || emailWarning || phoneWarning}
          onClick={submit}
        >
          Register Admin
        </button>

        <p className="text-center mt-3">
          Already an admin?{" "}
          <Link className="register-link" to="/admin/login">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
