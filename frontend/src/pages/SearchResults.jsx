import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import API from "../api/api";
import ProductCard from "../components/ProductCard";
import "./SubcategoryProducts.css"; 

export default function SearchResults() {
  const location = useLocation();

  const [products, setProducts] = useState([]);

  const params = new URLSearchParams(location.search);

  const q = params.get("q") || "";
  const category = params.get("category") || "";
  const subcategory = params.get("subcategory") || "";

  const loadSearchProducts = async () => {
    try {
      const { data } = await API.get("/products/search", {
        params: { q, category, subcategory }
      });
      setProducts(data || []);
    } catch (err) {
      console.error("Search error:", err);
    }
  };

  useEffect(() => {
    loadSearchProducts();
  }, [q, category, subcategory]);

  return (
    <div className="subcategory-page">
      <h2 className="subcategory-title">
        Search Results for: <span style={{ color: "#031576" }}>{q}</span>
      </h2>

      <div className="subcategory-product-grid">
        {products.length > 0 ? (
          products.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))
        ) : (
          <p style={{ textAlign: "center", marginTop: "40px" }}>
            No products found for this search.
          </p>
        )}
      </div>
    </div>
  );
}
