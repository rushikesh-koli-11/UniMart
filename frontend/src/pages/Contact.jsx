import React, { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/api";
import { UserAuthContext } from "../contexts/UserAuthContext";
import "./Contact.css";

const Contact = () => {
  const { user } = useContext(UserAuthContext);

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    comment: "",
  });

  const [status, setStatus] = useState(null);
  const navigate = useNavigate();

  // Autofill user data when logged in
  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        comment: "",
      });
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      return setStatus({
        type: "error",
        text: "You must be logged in to submit feedback.",
      });
    }

    if (!form.comment.trim()) {
      return setStatus({
        type: "error",
        text: "Please write your message before submitting.",
      });
    }

    try {
      await API.post("/feedback", form);

      setStatus({
        type: "success",
        text: "Thank you for your feedback! We’ll get back to you shortly.",
      });

      setForm({ ...form, comment: "" });

      setTimeout(() => navigate("/"), 1200);
    } catch (err) {
      setStatus({
        type: "error",
        text: "Unable to submit feedback. Try again later.",
      });
    }
  };

  return (
    <div className="contact-page">
      {/* HERO SECTION */}
      <div className="contact-hero">
        <h1>
          Contact <span>UniMart</span>
        </h1>
        <p>We are here to help you with orders, issues, or general inquiries.</p>
      </div>

      <div className="contact-grid">
        {/* LEFT — INFO CARD */}
        <div className="contact-info-card">
          <h2>Get in Touch</h2>

          <p className="info-desc">
            Reach out to our support team for questions about orders, delivery,
            refunds, or your shopping experience.
          </p>

          <div className="contact-detail">
            <i className="bi bi-envelope-fill"></i>
            <span>support@unimart.com</span>
          </div>

          <div className="contact-detail">
            <i className="bi bi-phone-fill"></i>
            <span>+91 9588958895</span>
          </div>

          <div className="contact-detail">
            <i className="bi bi-geo-alt-fill"></i>
            <span>UniMart HQ, Pune, Maharashtra, India</span>
          </div>

          <div className="contact-detail">
            <i className="bi bi-clock-fill"></i>
            <span>Support Hours: 8 AM – 10 PM (All Days)</span>
          </div>

          <div className="info-note">
            Your feedback helps us improve your grocery experience.
          </div>
        </div>

        {/* RIGHT — FORM CARD */}
        <div className="contact-form-card">
          <h2 className="form-title">Send Us a Message</h2>

          {status && (
            <div
              className={`alert ${
                status.type === "success" ? "alert-success" : "alert-danger"
              }`}
            >
              {status.text}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* NAME */}
            <label className="input-label">Full Name</label>
            <input
              value={form.name}
              className="input-field"
              readOnly
              placeholder="Login required"
              required
            />

            {/* EMAIL */}
            <label className="input-label">Email</label>
            <input
              value={form.email}
              className="input-field"
              readOnly
              placeholder="Login required"
              required
            />

            {/* PHONE */}
            <label className="input-label ">Phone</label>
            <input
              value={form.phone}
              className="input-field"
              readOnly
              placeholder="Login required"
            />

            {/* COMMENT */}
            <label className="input-label">Message</label>
            <textarea placeholder="Enter your message here..."
              value={form.comment}
              onChange={(e) =>
                setForm({ ...form, comment: e.target.value })
              }
              rows="4"
              className="input-field"
              required
            ></textarea>

            <button className="submit-btn">Submit Message</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Contact;
