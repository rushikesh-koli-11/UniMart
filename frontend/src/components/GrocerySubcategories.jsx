import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/api";
import "./GrocerySubcategories.css";

/* ✅ Fallback Icons */
import { FaAppleAlt, FaCarrot, FaBreadSlice, FaCheese, FaWineBottle } from "react-icons/fa";
import { GiMilkCarton, GiWheat, GiMeat, GiChiliPepper } from "react-icons/gi";
import { MdRiceBowl, MdLocalGroceryStore } from "react-icons/md";

export default function GrocerySubcategories() {
  const [subcategories, setSubcategories] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    loadGrocerySubcategories();
  }, []);

  const loadGrocerySubcategories = async () => {
    try {
      const { data } = await API.get("/categories");

      const groceryCategory = data.find(
        (cat) => cat.name.toLowerCase() === "grocery"
      );

      if (!groceryCategory || !groceryCategory.subcategories) return;

      setSubcategories(groceryCategory.subcategories);
    } catch (err) {
      console.error("Error loading grocery subcategories:", err);
    }
  };

  const openSubcategory = (subcategory) => {
  navigate(`/subcategory/${subcategory._id}`);
};


  const getIcon = (name) => {
    const n = name.toLowerCase();

    if (n.includes("fruit")) return <FaAppleAlt />;
    if (n.includes("vegetable")) return <FaCarrot />;
    if (n.includes("bread")) return <FaBreadSlice />;
    if (n.includes("dairy")) return <FaCheese />;
    if (n.includes("milk")) return <GiMilkCarton />;
    if (n.includes("grain")) return <GiWheat />;
    if (n.includes("rice")) return <MdRiceBowl />;
    if (n.includes("spice")) return <GiChiliPepper />;
    if (n.includes("meat")) return <GiMeat />;
    if (n.includes("oil")) return <FaWineBottle />;

    return <MdLocalGroceryStore />;
  };

  return (
    <div className="grocery-wrapper mt-3">
      <h2 className="grocery-title text-center">Shop by Grocery Category</h2>
      
      <div className="container-fluid">
        <div className="row g-3 mt-3 justify-content-center">

          {subcategories.map((subcat) => (
            <div
              key={subcat._id}
              className="col-6 col-sm-4 col-md-3 col-lg-2 col-xl-2 text-center"
            >
              <div
                className="grocery-img-wrapper"
                onClick={() => openSubcategory(subcat)}
              >
                {subcat.image?.url ? (
                  <img
                    src={subcat.image.url}
                    alt={subcat.name}
                    className="grocery-sub-img"
                  />
                ) : (
                  <div className="fallback-icon">
                    {getIcon(subcat.name)}
                  </div>
                )}
              </div>
            </div>
          ))}

          {subcategories.length === 0 && (
            <p className="text-center text-muted mt-3">
              No grocery subcategories available.
            </p>
          )}

        </div>
      </div>
    </div>
  );
}
