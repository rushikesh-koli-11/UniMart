import React, { useState } from "react";
import "./About.css";

import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import SecurityIcon from "@mui/icons-material/Security";
import StarRateIcon from "@mui/icons-material/StarRate";
import PhoneIcon from "@mui/icons-material/Phone";
import EmailIcon from "@mui/icons-material/Email";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";

export default function About() {
  const [openFAQ, setOpenFAQ] = useState(null);

  const toggleFAQ = (i) => setOpenFAQ(openFAQ === i ? null : i);

  const faqs = [
    {
      question: "How fast is UniMart delivery?",
      answer: "Most orders arrive within 60–120 minutes depending on location.",
    },
    {
      question: "Do you offer cash on delivery?",
      answer: "Yes, we support COD, UPI, cards, and wallet payments.",
    },
    {
      question: "Are products fresh?",
      answer: "We source directly from verified suppliers to ensure freshness.",
    },
    {
      question: "What if an item arrives damaged?",
      answer: "You can request a replacement or full refund instantly.",
    },
  ];

  return (
    <div className="about-wrapper">

      <section className="about-hero">
        <h1>Welcome to <span>UniMart</span></h1>
        <p>Your modern grocery shopping destination.</p>
      </section>

      <section className="about-section card-section">
        <div className="section-header">
          <div className="line"></div>
          <h2>Who We Are</h2>
          <div className="line"></div>
        </div>
        <p>
          UniMart is an innovative online grocery platform designed to bring
          convenience and quality directly to your doorstep. We focus on fresh
          products, seamless delivery, and affordable pricing.
        </p>
      </section>

      <section className="about-section highlight-section">
        <h2>Our Mission</h2>
        <p>
          Our mission is to simplify everyday shopping with dependable,
          affordable, and fast grocery delivery for everyone.
        </p>
      </section>

      <section className="about-section card-section">
        <div className="section-header">
          <div className="line"></div>
          <h2>Why Choose Us?</h2>
          <div className="line"></div>
        </div>

        <div className="feature-grid">

          <div className="feature-card styled-card">
            <ShoppingCartIcon className="feature-icon" />
            <h3>Huge Product Range</h3>
            <p>Everything from essentials to premium items.</p>
          </div>

          <div className="feature-card styled-card">
            <LocalShippingIcon className="feature-icon" />
            <h3>Lightning Delivery</h3>
            <p>Groceries delivered to your home in minutes.</p>
          </div>

          <div className="feature-card styled-card">
            <SecurityIcon className="feature-icon" />
            <h3>Secure Payments</h3>
            <p>Your money and data are always safe.</p>
          </div>

          <div className="feature-card styled-card">
            <StarRateIcon className="feature-icon" />
            <h3>Trusted Service</h3>
            <p>Thousands of happy customers every day.</p>
          </div>

        </div>
      </section>

      <section className="about-section contact-section styled-card">
        <h2>Contact Us</h2>
        <div className="contact-info">
          <p><EmailIcon /> support@unimart.com</p>
          <p><PhoneIcon /> +919588985888</p>
        </div>
      </section>

      <section className="about-section card-section">
        <div className="section-header">
          <div className="line"></div>
          <h2>Frequently Asked Questions</h2>
          <div className="line"></div>
        </div>

        <div className="faq-list">
          {faqs.map((f, i) => (
            <div className="faq-item" key={i}>
              <div className="faq-question" onClick={() => toggleFAQ(i)}>
                <span>{f.question}</span>
                {openFAQ === i ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              </div>

              <div
                className={`faq-answer ${openFAQ === i ? "open" : ""}`}
              >
                <p>{f.answer}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}
