import React, { useEffect, useState } from "react";
import API from "../api/api";
import MostlyUsedLinks from "../components/MostlyUsedLinks";
import ProductCard from "../components/ProductCard";
import GrocerySubcategories from "../components/GrocerySubcategories";
import { useSearchParams } from "react-router-dom";
import "./Home.css";
import HomeLoader from "../components/HomeLoader"; // 

const SectionRow = ({ title, products }) => {
  if (!products || products.length === 0) return null;

  return (
    <div className="homepage-section">
      <h3 className="section-title">{title}</h3>
      <div className="product-row">
        {products.map((p) => (
          <ProductCard key={p._id} product={p} />
        ))}
      </div>
    </div>
  );
};

export default function Home() {
  const [products, setProducts] = useState([]);
  const [trending, setTrending] = useState([]);
  const [topRated, setTopRated] = useState([]);
  const [bestOffers, setBestOffers] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);

  const [loading, setLoading] = useState(true); 
  const [searchParams] = useSearchParams();

  const loadProducts = async () => {
    const q = searchParams.get("q");
    const category = searchParams.get("category");
    const subcategory = searchParams.get("subcategory");

    let url = `/products?`;
    if (q) url += `q=${encodeURIComponent(q)}&`;
    if (category) url += `category=${encodeURIComponent(category)}&`;
    if (subcategory) url += `subcategory=${encodeURIComponent(subcategory)}&`;

    const { data } = await API.get(url);
    setProducts(data);
  };

  const loadHomepageSections = async () => {
    const [trRes, topRes, offerRes, newRes] = await Promise.all([
      API.get("/products?sort=trending&limit=10"),
      API.get("/products?sort=top-rated&limit=10"),
      API.get("/products?sort=offers&limit=10"),
      API.get("/products?sort=new&limit=10"),
    ]);

    setTrending(trRes.data);
    setTopRated(topRes.data);
    setBestOffers(offerRes.data);
    setNewArrivals(newRes.data);
  };

  useEffect(() => {
    const loadAll = async () => {
      try {
        setLoading(true);
        await Promise.all([loadHomepageSections(), loadProducts()]);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadAll();
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

  if (loading) {
    return <HomeLoader />;
  }

  return (
    <div>
      <SectionRow title="🔥 Trending Products" products={trending} />
      <SectionRow title="🆕 New Arrivals" products={newArrivals} />

      <GrocerySubcategories />
      <hr />

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

      <MostlyUsedLinks />
    </div>
  );
}
