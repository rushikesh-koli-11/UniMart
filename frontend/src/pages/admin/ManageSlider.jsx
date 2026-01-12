import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import API from "../../api/api";
import "./ManageSlider.css";

const ManageSlider = () => {
  const [images, setImages] = useState([]);
  const [file, setFile] = useState(null);

  const [mainCategories, setMainCategories] = useState([]);
  const [categoriesMap, setCategoriesMap] = useState({});
  const [products, setProducts] = useState([]);

  const [selectedMain, setSelectedMain] = useState("");
  const [selectedSub, setSelectedSub] = useState("");
  const [selectedProduct, setSelectedProduct] = useState("");

  const [link, setLink] = useState("");

  const loadCategories = async () => {
    try {
      const res = await API.get("/categories");

      const mains = res.data.map((c) => c.name);
      const map = {};
      res.data.forEach((c) => {
        map[c.name] = c.subcategories.map((s) => s.name);
      });

      setMainCategories(mains);
      setCategoriesMap(map);
    } catch (err) {
      console.error("Error loading categories:", err);
    }
  };

  const loadProducts = async () => {
    try {
      const res = await API.get("/products");
      setProducts(res.data);
    } catch (err) {
      console.error("Error loading products:", err);
    }
  };

  const loadImages = async () => {
    try {
      const res = await API.get("/slider");
      const sorted = res.data.sort((a, b) => (a.order || 0) - (b.order || 0));
      setImages(sorted);
    } catch (err) {
      console.error("Error loading images:", err);
      Swal.fire("Error", "Failed to load images", "error");
    }
  };

  useEffect(() => {
    loadCategories();
    loadProducts();
    loadImages();
  }, []);

  const uploadImage = async (e) => {
    e.preventDefault();
    if (!file) return;

    const confirmed = await Swal.fire({
      title: "Upload Image?",
      text: "This will add a new image to your slider.",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Upload",
    });

    if (!confirmed.isConfirmed) return;

    const formData = new FormData();
    formData.append("image", file);
    if (link) formData.append("link", link);

    try {
      await API.post("/slider", formData);

      setFile(null);
      setLink("");
      setSelectedMain("");
      setSelectedSub("");
      setSelectedProduct("");

      Swal.fire({
        icon: "success",
        title: "Uploaded!",
        timer: 1500,
        showConfirmButton: false,
      });

      loadImages();
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Failed to upload image", "error");
    }
  };

  const deleteImg = async (id) => {
    const confirmed = await Swal.fire({
      title: "Delete Image?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Delete",
    });

    if (!confirmed.isConfirmed) return;

    try {
      await API.delete(`/slider/${id}`);

      Swal.fire({
        icon: "success",
        title: "Deleted!",
        timer: 1200,
        showConfirmButton: false,
      });

      loadImages();
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Delete failed", "error");
    }
  };

  const moveImage = (index, direction) => {
    const updated = [...images];

    if (direction === "up" && index > 0) {
      [updated[index], updated[index - 1]] = [updated[index - 1], updated[index]];
    }
    if (direction === "down" && index < updated.length - 1) {
      [updated[index], updated[index + 1]] = [updated[index + 1], updated[index]];
    }

    const reordered = updated.map((img, i) => ({
      ...img,
      order: i + 1,
    }));

    setImages(reordered);
  };

  const saveOrder = async () => {
    const confirmed = await Swal.fire({
      title: "Save Slider Order?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Save",
    });

    if (!confirmed.isConfirmed) return;

    try {
      await API.put("/slider/reorder", { images });

      Swal.fire({
        icon: "success",
        title: "Order Saved!",
        timer: 1500,
        showConfirmButton: false,
      });

      loadImages();
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Failed to save order", "error");
    }
  };

  return (
    <div className="slider-wrapper">
      <div className="slider-container shadow-lg">
        <h3 className="slider-title">Manage Slider Images</h3>
        <div className="underline"></div>

        <form onSubmit={uploadImage} className="upload-box">
          <input
            type="file"
            className="form-control upload-input"
            onChange={(e) => setFile(e.target.files[0])}
            required
          />

          <select
            className="form-select mt-2"
            value={selectedMain}
            onChange={(e) => {
              const main = e.target.value;
              setSelectedMain(main);
              setSelectedSub("");
              setSelectedProduct("");
              setLink("");
            }}
          >
            <option value="">Select Main Category (optional)</option>
            {mainCategories.map((mc, i) => (
              <option key={i} value={mc}>
                {mc}
              </option>
            ))}
          </select>

          {selectedMain && (
            <select
              className="form-select mt-2"
              value={selectedSub}
              onChange={(e) => {
                const sub = e.target.value;
                setSelectedSub(sub);
                setSelectedProduct("");
                setLink(`/products?subcategory=${encodeURIComponent(sub)}`);
              }}
            >
              <option value="">Select Subcategory (optional)</option>
              {categoriesMap[selectedMain]?.map((sub, i) => (
                <option key={i} value={sub}>
                  {sub}
                </option>
              ))}
            </select>
          )}

          {selectedSub && (
            <select
              className="form-select mt-2"
              value={selectedProduct}
              onChange={(e) => {
                const pId = e.target.value;
                setSelectedProduct(pId);
                if (pId) {
                  setLink(`/product/${pId}`);
                } else {
                  setLink(`/products?subcategory=${encodeURIComponent(selectedSub)}`);
                }
              }}
            >
              <option value="">Select Product (optional)</option>
              {products
                .filter((p) => p.subcategory?.name === selectedSub)
                .map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.title}
                  </option>
                ))}
            </select>
          )}

          <input
            type="text"
            className="form-control mt-2"
            placeholder="Or custom link (optional)"
            value={link}
            onChange={(e) => setLink(e.target.value)}
          />

          <button type="submit" className="btn upload-btn mt-3">
            Upload Image
          </button>
        </form>

        <div className="slider-grid mt-4">
          {images.length === 0 ? (
            <p>No images uploaded.</p>
          ) : (
            images.map((img, index) => (
              <div className="slider-grid-item" key={img._id}>
                <div className="image-card">
                  <img src={img.imageUrl} className="slider-img" alt="Slider" />

                  {img.link && (
                    <div className="text-center mt-1">
                      <small className="text-primary">
                        Link: <u>{img.link}</u>
                      </small>
                    </div>
                  )}

                  <div className="image-controls">
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-primary"
                      onClick={() => moveImage(index, "up")}
                      disabled={index === 0}
                    >
                      ↑
                    </button>

                    <button
                      type="button"
                      className="btn btn-sm btn-outline-primary mx-2"
                      onClick={() => moveImage(index, "down")}
                      disabled={index === images.length - 1}
                    >
                      ↓
                    </button>

                    <button
                      type="button"
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => deleteImg(img._id)}
                    >
                      ✖
                    </button>
                  </div>

                  <div className="text-center mt-2">
                    <small>Position: {index + 1}</small>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {images.length > 1 && (
          <div className="text-center mt-4">
            <button className="btn save-btn" onClick={saveOrder}>
              💾 Save Order
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageSlider;
