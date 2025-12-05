import React from "react";
import "./LegalPages.css";

export default function PrivacyPolicy() {
  return (
    <div className="legal-wrapper">

      {/* HERO SECTION */}
      <section className="legal-hero">
        <h1>Privacy Policy</h1>
        <p>Your privacy is important to us.</p>
      </section>

      {/* CONTENT */}
      <div className="container py-4 legal-content">

        <h3 className="section-title">1. Information We Collect</h3>
        <p>
          We collect personal information such as your name, email, phone number,
          and address when you register or place an order. We also collect device
          information like IP address and browser type.
        </p>

        <h3 className="section-title">2. How We Use Your Information</h3>
        <ul>
          <li>To process orders and manage your account.</li>
          <li>To improve our website and user experience.</li>
          <li>To send alerts about offers, updates, and services.</li>
        </ul>

        <h3 className="section-title">3. Sharing of Information</h3>
        <p>
          We do not sell or trade your personal data. We only share data with
          trusted partners like payment processors and delivery providers.
        </p>

        <h3 className="section-title">4. Data Security</h3>
        <p>
          We use strong encryption and secure servers to protect your data.
        </p>

        <h3 className="section-title">5. Contact Us</h3>
        <p>If you have any questions, contact us at: <strong>support@unimart.com</strong></p>
      </div>
    </div>
  );
}
