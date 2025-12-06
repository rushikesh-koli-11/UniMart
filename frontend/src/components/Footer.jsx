import React from "react";
import {
  Box,
  Typography,
  Link as MuiLink,
  Grid,
  IconButton
} from "@mui/material";
import {
   LinkedIn, Instagram, WhatsApp,
  Email,
  Phone,
  LocationOn
} from "@mui/icons-material";

import { Link } from "react-router-dom";

import "./Footer.css";
import logo from "../assets/UniMart.png";

export default function Footer() {
  return (
    <Box component="footer" className="footer-wrapper">

      <Grid container spacing={3} className="footer-grid">

        {/* BRAND + LOGO */}
        <Grid item xs={12} md={3}>
          <div className="footer-logo-box">
            <img
              src={logo}
              alt="UniMart Logo"
              className="footer-logo"
            />
          </div>

          <Typography className="footer-text">
            Seamless online shopping experience.
          </Typography>
        </Grid>

        {/* QUICK LINKS */}
<Grid item xs={6} md={2}>
  <Typography className="footer-title">Quick Links</Typography>

  <MuiLink component={Link} to="/about" className="footer-link">
    About Us
  </MuiLink>

  <MuiLink component={Link} to="/contact" className="footer-link">
    Contact Us
  </MuiLink>

  <MuiLink component={Link} to="/privacy-policy" className="footer-link">
    Privacy Policy
  </MuiLink>

  <MuiLink component={Link} to="/terms" className="footer-link">
    Terms & Conditions
  </MuiLink>
</Grid>


        {/* CONTACT INFO */}
        <Grid item xs={12} md={3}>
          <Typography className="footer-title">Contact</Typography>

          <div className="footer-contact">
            <Typography className="footer-contact-item">
              <Email className="footer-icon" /> support@unimart.com
            </Typography>

            <Typography className="footer-contact-item">
              <Phone className="footer-icon" /> +91 98765 43210
            </Typography>

            <Typography className="footer-contact-item">
              <LocationOn className="footer-icon" /> Mumbai, India
            </Typography>
          </div>
        </Grid>

        {/* SOCIAL ICONS */}
        <Grid item xs={12} md={2}>
  <Typography className="footer-title">Follow Us</Typography>

  <div className="footer-social">
    {/* LinkedIn */}
    <IconButton
      className="social-icon"
      component="a"
      href="https://www.linkedin.com/in/rushikeshkoli"
      target="_blank"
      rel="noopener noreferrer"
    >
      <LinkedIn />
    </IconButton>

    {/* Instagram */}
    <IconButton
      className="social-icon"
      component="a"
      href="https://www.instagram.com/rushikeshkoli2358?igsh=YnRkcXQ0aW8zeXk4&utm_source=qr"
      target="_blank"
      rel="noopener noreferrer"
    >
      <Instagram />
    </IconButton>

    {/* WhatsApp */}
    <IconButton
      className="social-icon"
      component="a"
      href="https://wa.me/9579695273"
      target="_blank"
      rel="noopener noreferrer"
    >
      <WhatsApp />
    </IconButton>
  </div>
</Grid>

      </Grid>

      {/* COPYRIGHT */}
      <Typography align="center" className="footer-bottom">
        © UniMart 2025 — All rights reserved.
      </Typography>

      <Typography align="center" className="developer-credit mt-2">
        Designed & Developed by{" "}
        <span>
          <MuiLink
            href="https://www.linkedin.com/in/rushikeshkoli"
            target="_blank"
            rel="noopener noreferrer"
            className="name"
          >
            Rushikesh Koli
          </MuiLink>
        </span>
      </Typography>
    </Box>
  );
}
