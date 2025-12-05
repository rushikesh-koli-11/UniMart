import React from "react";
import "./LegalPages.css";

export default function TermsAndConditions() {
  return (
    <div className="legal-wrapper">

      {/* HERO SECTION */}
      <section className="legal-hero">
        <h1>Terms & Conditions</h1>
        <p>Please read these terms carefully before using UniMart.</p>
      </section>

      {/* CONTENT */}
      <div className="container py-4 legal-content">

        <h3 className="section-title">1. Acceptance of Terms</h3>
        <p>
          By accessing UniMart, you agree to follow these Terms and Conditions.
        </p>

        <h3 className="section-title">2. Account Responsibilities</h3>
        <ul>
          <li>You must provide accurate information.</li>
          <li>You are responsible for maintaining account confidentiality.</li>
        </ul>

        <h3 className="section-title">3. Orders & Payments</h3>
        <p>
          All orders are processed upon successful payment. UniMart reserves the
          right to cancel orders in case of suspicious activity.
        </p>

        <h3 className="section-title">4. Prohibited Activities</h3>
        <ul>
          <li>Using the platform for fraud or illegal activities.</li>
          <li>Interfering with the site's performance.</li>
        </ul>

        <h3 className="section-title">5. Changes to Terms</h3>
        <p>
          We may update our terms periodically. Continued use means you accept
          the new terms.
        </p>
      </div>
    </div>
  );
}
