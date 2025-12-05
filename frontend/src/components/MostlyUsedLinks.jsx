// frontend/src/components/MostlyUsedLinks.jsx
import React, { useEffect, useState } from "react";
import API from "../api/api";
import "./MostlyUsedLinks.css";

export default function MostlyUsedLinks() {
  const [links, setLinks] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const res = await API.get("/mostly-used/all");
      setLinks(res.data.data || []);
    } catch (err) {
      console.error("Error loading links", err);
    }
  };

  if (!links.length) return null;

  return (
    <div className="mostly-used-container">
      <h3 className="mostly-used-title">Product Brands We Serve</h3>

      <div className="marquee">
        <div className="marquee-content">
          {links.map((item, index) => (
            <a key={index} href={item.link} target="_blank" rel="noopener noreferrer" className="logo-item">
              <img src={item.logo} alt="logo" loading="lazy" />
            </a>
          ))}
          {links.map((item, index) => (
            <a key={`dup-${index}`} href={item.link} target="_blank" rel="noopener noreferrer" className="logo-item">
              <img src={item.logo} alt="logo" loading="lazy" />
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
