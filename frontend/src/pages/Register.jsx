import React, { useState, useEffect } from "react";
import { Alert } from "@mui/material";
import API from "../api/api";
import { useNavigate, Link } from "react-router-dom";
import { auth, setupRecaptcha } from "../firebase";
import { signInWithPhoneNumber } from "firebase/auth";
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

  const [timer, setTimer] = useState(0); // 5 minutes = 300 sec

  // TIMER EFFECT
  useEffect(() => {
    if (timer <= 0) return;

    const interval = setInterval(() => setTimer((t) => t - 1), 1000);
    return () => clearInterval(interval);
  }, [timer]);

  // VALIDATIONS
  const validateInputs = () => {
    if (!form.name) return "Enter full name";

    if (!form.email.endsWith("@gmail.com"))
      return "Email must end with @gmail.com";

    if (!/^\d{10}$/.test(form.phone))
      return "Phone must be 10 digits";

    if (!form.password) return "Enter password";

    if (form.password !== form.confirmPassword)
      return "Passwords do not match";

    return null;
  };

  // SEND FIXED TEST CODE (416779)
  const sendUserCode = async () => {
    const validationError = validateInputs();
    if (validationError) return setMsg(validationError);

    try {
      window.userCode = "416779";

      await API.post("/auth/send-code-sms", { phone: form.phone });

      setMsg("📩 Code sent to your phone");
      setOtpSent(true);
      setTimer(300);
    } catch (err) {
      setMsg("Failed to send code SMS");
    }
  };

  // RESEND CODE
  const resendCode = async () => {
    try {
      await API.post("/auth/send-code-sms", { phone: form.phone });
      setMsg("📩 Code re-sent");
      setTimer(300);
    } catch {
      setMsg("Failed to resend code");
    }
  };

  // VERIFY ENTERED CODE THEN DO FIREBASE TEST VERIFICATION
  const verifyUserCode = async () => {
    if (timer <= 0) return setMsg("⏳ OTP expired. Please resend.");

    if (otp !== "416779") {
      return setMsg("❌ Incorrect code");
    }

    try {
      setupRecaptcha();

      const testPhone = "+919579695273";

      const confirmation = await signInWithPhoneNumber(
        auth,
        testPhone,
        window.recaptchaVerifier
      );

      await confirmation.confirm("416779");

      setOtpVerified(true);
      setMsg("✅ Phone verified");
    } catch (err) {
      console.log(err);
      setMsg("Firebase phone verification failed");
    }
  };

  // REGISTER USER
  const submit = async () => {
    if (!otpVerified) return setMsg("⚠️ Please verify phone first");

    try {
      await API.post("/auth/register", form);
      setMsg("✅ Registered successfully! Redirecting...");
      setTimeout(() => navigate("/user/login"), 1500);
    } catch (err) {
      setMsg(err.response?.data?.message || "Registration failed");
    }
  };

  // FORMAT TIMER
  const formatTime = (sec) => {
    const m = Math.floor(sec / 60).toString().padStart(2, "0");
    const s = (sec % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  return (
    <div className="signup-container">
      <div className="signup-card shadow-lg">
        <h3 className="text-center mb-4 heading">Create User Account</h3>

        <div id="recaptcha-container"></div>

        {msg && <Alert severity="info" className="mb-3">{msg}</Alert>}

        {/* NAME */}
        <input
          className="form-control input-box mb-1"
          placeholder="Full Name"
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />

        {/* EMAIL */}
        <input
          className="form-control input-box mb-0"
          placeholder="Email (@gmail.com only)"
          onChange={(e) => {
            const email = e.target.value;
            setForm({ ...form, email });

            // INLINE WARNING
            if (email && !email.endsWith("@gmail.com")) {
              setMsg("⚠️ Please enter a valid Gmail address to continue.");
            } else {
              setMsg("");
            }
          }}
        />
        {!form.email.endsWith("@gmail.com") && form.email.length > 0 && (
          <small className="text-danger">Email must end with @gmail.com</small>
        )}

        {/* PHONE */}
        <div className="otp-box mt-3 mb-1">
          <input
            className="form-control input-box"
            placeholder="Phone Number (10 digits)"
            disabled={!form.email.endsWith("@gmail.com")}
            maxLength={10}
            value={form.phone}
            onChange={(e) => {
              const val = e.target.value;
              if (!/^\d*$/.test(val)) return;
              setForm({ ...form, phone: val });
            }}
          />
          {!otpSent && (
            <button
              className="btn signup-btn"
              onClick={sendUserCode}
              disabled={!/^\d{10}$/.test(form.phone)}
            >
              Send Code
            </button>
          )}
        </div>

        {!/^\d{10}$/.test(form.phone) && form.phone.length > 0 && (
          <small className="text-danger">Phone must be 10 digits</small>
        )}

        {/* OTP SECTION */}
        {otpSent && (
          <>
            <div className="otp-box mb-2 mt-3">
              <input
                className="form-control input-box"
                placeholder="Enter OTP"
                onChange={(e) => setOtp(e.target.value)}
              />

              {!otpVerified ? (
                <button className="btn signup-btn" onClick={verifyUserCode}>
                  Verify
                </button>
              ) : (
                <Alert severity="success" className="w-100">
                  Phone Verified
                </Alert>
              )}
            </div>

            {/* TIMER + RESEND */}
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

        {/* RE-ENTER PASSWORD */}
        <input
          type="password"
          className="form-control input-box mb-0"
          placeholder="Re-enter Password"
          onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
        />

        {form.confirmPassword &&
          form.password !== form.confirmPassword && (
            <small className="text-danger">Passwords do not match</small>
          )}

        <button
          className="signup-btn mt-3"
          disabled={!otpVerified}
          onClick={submit}
        >
          Register
        </button>

        <p className="text-center mt-3">
          Already have an account?{" "}
          <Link className="register-link" to="/user/login">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
