// frontend/src/pages/Home.jsx
import React, { useEffect, useState } from "react";
import API from "../api/api";
import Slider from "../components/Slider";
import MostlyUsedLinks from "../components/MostlyUsedLinks";
import ProductCard from "../components/ProductCard";
import GrocerySubcategories from "../components/GrocerySubcategories"; // ⭐ NEW
import { Typography } from "@mui/material";
import { Link, useSearchParams } from "react-router-dom";
import "./Home.css";

export default function Home() {
  const [products, setProducts] = useState([]);
  const [sliderImages, setSliderImages] = useState([]);
  const [searchParams] = useSearchParams();

  const loadSlider = async () => {
    try {
      const { data } = await API.get("/slider");
      setSliderImages(data);
    } catch (err) {
      console.error("Slider error:", err);
    }
  };

  const loadProducts = async () => {
    const q = searchParams.get("q");
    const category = searchParams.get("category");
    const subcategory = searchParams.get("subcategory");

    let url = `/products?`;

    if (q) url += `q=${encodeURIComponent(q)}&`;
    if (category) url += `category=${encodeURIComponent(category)}&`;
    if (subcategory) url += `subcategory=${encodeURIComponent(subcategory)}&`;

    try {
      const { data } = await API.get(url);
      setProducts(data);
    } catch (err) {
      console.error("Products error:", err);
    }
  };

  useEffect(() => {
    loadSlider();
    loadProducts();
  }, [searchParams]);

  const grouped = () => {
    const map = {};

    products.forEach((p) => {
      const cat = p.category?.name || "Other";
      const sub = p.subcategory?.name || "Other";

      if (!map[cat]) map[cat] = {};
      if (!map[cat][sub]) map[cat][sub] = [];

      map[cat][sub].push(p);
    });

    return map;
  };

  return (
    <div>

      {/* 🔹 SLIDER */}
      <Slider sliderImages={sliderImages} />

      {/* 🔹 GROCERY SUBCATEGORY SECTION */}
      <GrocerySubcategories />
      <hr />

      {/* 🔹 PRODUCTS SECTION */}
      <div className="translate-safe">
      {Object.entries(grouped()).map(([categoryName, subgroups]) => (
        <div key={categoryName} style={{ marginBottom: 40 }}>


          {Object.entries(subgroups).map(([subName, items]) => (
            <div key={subName} style={{ marginBottom: 25 }}>

              <h3 className="subcat-title">{subName}</h3>

              <div className="product-row">
                {items.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>

            </div>
          ))}
          
        </div>
      ))}
      </div>

      {/* 🔹 MOSTLY USED LINKS */}
      <MostlyUsedLinks />

    </div>
  );
}
