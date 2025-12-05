import React, { useEffect, useState, useRef } from "react";
import API from "../../api/api";

import {
  Typography,
  Button,
  TextField,
  Stack,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  MenuItem,
  Alert,
  Box,
} from "@mui/material";

import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import AddPhotoAlternateIcon from "@mui/icons-material/AddPhotoAlternate";

import "./AdminProducts.css";
import "bootstrap/dist/css/bootstrap.min.css";

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [lowStock, setLowStock] = useState([]);

  const allProductsRef = useRef([]);
  const [categories, setCategories] = useState([]);
  const [subcats, setSubcats] = useState([]);

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    title: "",
    description: "",
    price: "",
    stock: 0,
    category: "",
    subcategory: { _id: "", name: "" },
    images: [],
  });

  // LOAD ALL DATA
  useEffect(() => {
    load();
    loadCategories();
  }, []);

  const load = async () => {
    const { data } = await API.get("/products");
    setProducts(data);
    allProductsRef.current = data;
    setLowStock(data.filter((p) => p.stock < 5));
  };

  const loadCategories = async () => {
    const { data } = await API.get("/categories");
    setCategories(data);
  };

  // MULTIPLE IMAGE UPLOAD
  // MULTIPLE IMAGE UPLOAD
const handleMultiUpload = async (e) => {
  const files = Array.from(e.target.files);

  for (const file of files) {
    const fd = new FormData();
    fd.append("image", file);
    fd.append("type", "product");   // ✅ tells backend: this is product image

    try {
      const { data } = await API.post("/upload/image", fd); 
      // DO NOT manually add headers, axios + interceptor handles it

      setForm((prev) => ({
        ...prev,
        images: [...prev.images, data],
      }));

    } catch (err) {
      console.error("Upload error:", err.response?.data || err.message);
      alert(err.response?.data?.message || "Upload failed");
    }
  }
};


  const removeImage = (i) =>
    setForm((prev) => ({
      ...prev,
      images: prev.images.filter((_, idx) => idx !== i),
    }));

  // SAVE PRODUCT
  const saveProduct = async () => {
  try {
    setError("");

    if (!form.category) return setError("Category is required");
    if (!form.subcategory._id) return setError("Subcategory is required");

    const payload = {
      title: form.title,
      description: form.description,
      price: form.price,
      stock: form.stock,
      category: form.category,

      // ⭐ CORRECT STRUCTURE
      subcategory: {
        _id: form.subcategory._id,
        name: form.subcategory.name,
      },

      images: form.images,
    };

    if (editing) {
      await API.put(`/products/${editing}`, payload);
    } else {
      await API.post("/products", payload);
    }

    setOpen(false);
    setEditing(null);

    setForm({
      title: "",
      description: "",
      price: "",
      stock: 0,
      category: "",
      subcategory: { _id: "", name: "" },
      images: [],
    });

    load();
  } catch (err) {
    setError(err.response?.data?.message || "Error saving product");
  }
};


  // EDIT PRODUCT
  const editProduct = (p) => {
    const cat = categories.find((c) => c._id === p.category?._id);
    setSubcats(cat?.subcategories || []);

    setEditing(p._id);
    setForm({
      title: p.title,
      description: p.description,
      price: p.price,
      stock: p.stock || 0,
      category: p.category?._id || "",
      subcategory: p.subcategory
        ? { _id: p.subcategory._id, name: p.subcategory.name }
        : { _id: "", name: "" },
      images: p.images || [],
    });

    setOpen(true);
  };

  const deleteProduct = async (id) => {
    if (window.confirm("Delete product?")) {
      await API.delete(`/products/${id}`);
      load();
    }
  };

  return (
    <div className="container-fluid admin-products-wrapper mt-3">

      {/* HERO SECTION */}
      <div className="admin-products-hero">
        <h1>Products Dashboard</h1>
        <p>Manage all products, categories, and stock levels</p>
      </div>


      {/* FILTER BAR */}
      <div className="row g-3 filter-row justify-content-center">

        {/* SEARCH */}
        <div className="col-12 col-md-4">
          <TextField
            label="Search Products"
            size="small"
            fullWidth
            className="filter-input"
            onChange={(e) => {
              const val = e.target.value.toLowerCase();
              if (!val) {
                setProducts(allProductsRef.current);
                setLowStock(allProductsRef.current.filter((x) => x.stock < 5));
                return;
              }
              const filtered = allProductsRef.current.filter(
                (p) =>
                  p.title.toLowerCase().includes(val) ||
                  (p.description || "").toLowerCase().includes(val)
              );
              setProducts(filtered);
              setLowStock(filtered.filter((x) => x.stock < 5));
            }}
          />
        </div>

        {/* CATEGORY */}
        <div className="col-6 col-md-3">
          <TextField
            select
            size="small"
            label="Category"
            fullWidth
            onChange={(e) => {
              const catId = e.target.value;

              if (!catId) {
                setSubcats([]);
                setProducts(allProductsRef.current);
                setLowStock(allProductsRef.current.filter((x) => x.stock < 5));
                return;
              }

              const cat = categories.find((c) => c._id === catId);
              setSubcats(cat?.subcategories || []);

              const filtered = allProductsRef.current.filter(
                (p) => p.category?._id === catId
              );
              setProducts(filtered);
              setLowStock(filtered.filter((x) => x.stock < 5));
            }}
          >
            <MenuItem value="">All</MenuItem>
            {categories.map((c) => (
              <MenuItem key={c._id} value={c._id}>
                {c.name}
              </MenuItem>
            ))}
          </TextField>
        </div>

        {/* SUBCATEGORY */}
        <div className="col-6 col-md-3">
          {subcats.length > 0 && (
            <TextField
              select
              size="small"
              label="Subcategory"
              fullWidth
              onChange={(e) => {
                const subId = e.target.value;
                const filtered = allProductsRef.current.filter(
                  (p) => p.subcategory?._id === subId
                );
                setProducts(filtered);
                setLowStock(filtered.filter((x) => x.stock < 5));
              }}
            >
              <MenuItem value="">All</MenuItem>
              {subcats.map((s) => (
                <MenuItem key={s._id} value={s._id}>
                  {s.name}
                </MenuItem>
              ))}
            </TextField>
          )}
        </div>

        {/* ADD PRODUCT BUTTON */}
        <div className="col-12 col-md-2 text-md-end">
          <Button
            variant="contained"
            fullWidth
            className="add-btn"
            onClick={() => {
              setEditing(null);
              setForm({
                title: "",
                description: "",
                price: "",
                stock: 0,
                category: "",
                subcategory: { _id: "", name: "" },
                images: [],
              });
              setSubcats([]);
              setOpen(true);
            }}
          >
            Add Product
          </Button>
        </div>
      </div>

      {/* LOW STOCK TABLE */}
      {lowStock.length > 0 && (
        <div className="low-stock-box">
          <Typography className="low-stock-title">
            ⚠ Low Stock Products ({lowStock.length})
          </Typography>

          <div className="table-responsive">
            <table className="table table-bordered admin-products-table low-table">
              <thead>
                <tr>
                  <th>Image</th>
                  <th>Title</th>
                  <th>Stock</th>
                  <th>Edit</th>
                  <th>Delete</th>
                </tr>
              </thead>

              <tbody>
                {lowStock.map((p) => (
                  <tr key={p._id}>
                    <td>
                      <img
                        src={p.images?.[0]?.url}
                        className="table-img"
                        alt=""
                      />
                    </td>

                    <td className="prod-title">{p.title}</td>

                    <td>
                      <span className="stock-badge low">{p.stock}</span>
                    </td>

                    <td>
                      <button
                        className="btn-action edit"
                        onClick={() => editProduct(p)}
                      >
                        <EditIcon fontSize="small" />
                      </button>
                    </td>

                    <td>
                      <button
                        className="btn-action delete"
                        onClick={() => deleteProduct(p._id)}
                      >
                        <DeleteIcon fontSize="small" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MAIN PRODUCT TABLE */}
      <div className="table-responsive admin-products-table-box">
        <table className="table table-bordered admin-products-table">
          <thead>
            <tr>
              <th>Image</th>
              <th>Title</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Category</th>
              <th>Subcategory</th>
              <th>Edit</th>
              <th>Delete</th>
            </tr>
          </thead>

          <tbody>
            {products.map((p) => (
              <tr key={p._id}>
                <td>
                  <img src={p.images?.[0]?.url} className="table-img" alt="" />
                </td>

                <td className="prod-title">{p.title}</td>

                <td className="price">₹{p.price}</td>

                <td>
                  <span
                    className={`stock-badge ${
                      p.stock === 0
                        ? "out"
                        : p.stock < 5
                        ? "low"
                        : "good"
                    }`}
                  >
                    {p.stock}
                  </span>
                </td>

                <td>{p.category?.name}</td>
                <td>{p.subcategory?.name}</td>

                <td>
                  <button
                    className="btn-action edit"
                    onClick={() => editProduct(p)}
                  >
                    <EditIcon fontSize="small" />
                  </button>
                </td>

                <td>
                  <button
                    className="btn-action delete"
                    onClick={() => deleteProduct(p._id)}
                  >
                    <DeleteIcon fontSize="small" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ADD / EDIT PRODUCT MODAL */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle className="dialog-title">
          {editing ? "Edit Product" : "Add Product"}
        </DialogTitle>

        <DialogContent>
          {error && <Alert severity="error">{error}</Alert>}

          <Stack spacing={2} sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />

            <TextField
              fullWidth
              rows={3}
              multiline
              label="Description"
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
            />

            <TextField
              fullWidth
              label="Price"
              type="number"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
            />

            {/* STOCK INPUT */}
            <Box className="stock-box">
              <Button
                className="stock-btn minus"
                onClick={() => {
                  if (form.stock > 0)
                    setForm({
                      ...form,
                      stock: Number(form.stock) - 1,
                    });
                }}
              >
                -
              </Button>

              <TextField
                type="number"
                className="stock-input"
                value={form.stock}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setForm({ ...form, stock: val < 0 ? 0 : val });
                }}
              />

              <Button
                className="stock-btn plus"
                onClick={() =>
                  setForm({ ...form, stock: Number(form.stock) + 1 })
                }
              >
                +
              </Button>
            </Box>

            <TextField
              select
              fullWidth
              label="Category"
              value={form.category}
              onChange={(e) => {
                const catId = e.target.value;
                setForm({
                  ...form,
                  category: catId,
                  subcategory: { _id: "", name: "" },
                });

                const found = categories.find((c) => c._id === catId);
                setSubcats(found?.subcategories || []);
              }}
            >
              {categories.map((c) => (
                <MenuItem key={c._id} value={c._id}>
                  {c.name}
                </MenuItem>
              ))}
            </TextField>

            {subcats.length > 0 && (
              <TextField
                select
                fullWidth
                label="Subcategory"
                value={form.subcategory._id}
                onChange={(e) => {
                  const sub = subcats.find((s) => s._id === e.target.value);
                  setForm({
                    ...form,
                    subcategory: { _id: sub._id, name: sub.name },
                  });
                }}
              >
                {subcats.map((s) => (
                  <MenuItem key={s._id} value={s._id}>
                    {s.name}
                  </MenuItem>
                ))}
              </TextField>
            )}

            <Button variant="outlined" component="label" className="upload-btn">
              <AddPhotoAlternateIcon /> Upload Images
              <input type="file" hidden multiple onChange={handleMultiUpload} />
            </Button>

            <Stack direction="row" spacing={1} flexWrap="wrap">
              {form.images.map((img, i) => (
                <Box key={i} className="image-preview">
                  <img src={img.url} alt="" className="preview-img" />
                  <IconButton
                    size="small"
                    className="remove-img-btn"
                    onClick={() => removeImage(i)}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Box>
              ))}
            </Stack>

            <Button variant="contained" className="save-btn" onClick={saveProduct}>
              {editing ? "Save Changes" : "Add Product"}
            </Button>
          </Stack>
        </DialogContent>
      </Dialog>

    </div>
  );
}
