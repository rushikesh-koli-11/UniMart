import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import API from "../api/api";
import ProductCard from "../components/ProductCard";
import "./SubcategoryProducts.css";

export default function SubcategoryProducts() {
  const { subcategoryId } = useParams(); // ⬅️ FIXED

  const [products, setProducts] = useState([]);
  const [subcategoryName, setSubcategoryName] = useState("");

  const loadProducts = async () => {
    try {
      const { data } = await API.get(`/products?subcategory=${subcategoryId}`);
      setProducts(data);
    } catch (err) {
      console.error("Error loading subcategory products:", err);
    }
  };

  const loadSubcategoryName = async () => {
    try {
      const { data } = await API.get(`/subcategories/${subcategoryId}`);
      setSubcategoryName(data.name);
    } catch (err) {
      console.error("Subcategory name error:", err);
    }
  };

  useEffect(() => {
    if (subcategoryId) {
      loadProducts();
      loadSubcategoryName();
    }
  }, [subcategoryId]);

  return (
    <div className="subcategory-page">
      <h2 className="subcategory-title">{subcategoryName} Products</h2>

      <div className="subcategory-product-grid">
        {products.length > 0 ? (
          products.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))
        ) : (
          <p style={{ textAlign: "center", marginTop: "40px" }}>
            No products found for this subcategory.
          </p>
        )}
      </div>
    </div>
  );
}
