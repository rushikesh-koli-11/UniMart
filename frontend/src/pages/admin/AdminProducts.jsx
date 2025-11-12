import React, { useEffect, useState, useRef } from "react";
import API from "../../api/api";
import {
  Typography, Button, TextField, Stack, Dialog, DialogContent, DialogTitle,
  Card, CardMedia, CardContent, CardActions, Grid, IconButton, MenuItem, Alert
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const allProductsRef = useRef([]); // ✅ Store original product list
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
    images: []
  });

  const load = async () => {
    const { data } = await API.get("/products");
    setProducts(data);
    allProductsRef.current = data; // ✅ Keep full list
  };

  const loadCategories = async () => {
    const { data } = await API.get("/categories");
    setCategories(data);
  };

  useEffect(() => {
    load();
    loadCategories();
  }, []);

  const handleMultiUpload = async (e) => {
  const files = Array.from(e.target.files);
  for (const file of files) {
    const fd = new FormData();
    fd.append("image", file); // ✅ must match backend upload.single("image")
    try {
      const { data } = await API.post("/upload/image", fd, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      setForm(prev => ({ ...prev, images: [...prev.images, data] }));
    } catch (err) {
      console.error("Upload error:", err.response?.data || err.message);
      alert(err.response?.data?.message || "Upload failed");
    }
  }
};


  const removeImage = (i) =>
    setForm(prev => ({ ...prev, images: prev.images.filter((_, idx) => idx !== i) }));

  const saveProduct = async () => {
    try {
      setError("");
      if (!form.category) return setError("Category is required");
      if (!form.subcategory._id) return setError("Subcategory is required");

      if (editing) {
        await API.put(`/products/${editing}`, form);
      } else {
        await API.post(`/products`, form);
      }

      setOpen(false);
      setEditing(null);
      setForm({
        title: "", description: "", price: "", stock: 0,
        category: "", subcategory: { _id: "", name: "" }, images: []
      });
      load();
    } catch (err) {
      setError(err.response?.data?.message || "Error saving product");
    }
  };

  const editProduct = (p) => {
    const cat = categories.find(c => c._id === p.category?._id);
    setSubcats(cat?.subcategories || []);

    setEditing(p._id);
    setForm({
      title: p.title,
      description: p.description,
      price: p.price,
      stock: p.stock || 0,
      category: p.category?._id || "",
      subcategory: p.subcategory?._id
        ? { _id: p.subcategory._id, name: p.subcategory.name }
        : { _id: "", name: "" },
      images: p.images || []
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
    <div>
      <Typography variant="h5" sx={{ mb: 2 }}>Manage Products</Typography>

      {/* ✅ FILTER BAR */}
      <Stack direction="row" spacing={2} sx={{ mb: 3 }}>

        <TextField label="Search Products" size="small"
          onChange={(e) => {
            const val = e.target.value.toLowerCase();
            if (!val) return setProducts(allProductsRef.current);
            const filtered = allProductsRef.current.filter(p =>
              p.title.toLowerCase().includes(val) ||
              (p.description || "").toLowerCase().includes(val)
            );
            setProducts(filtered);
          }}
        />

        <TextField select size="small" label="Category" sx={{ minWidth: 160 }}
          onChange={(e) => {
            const catId = e.target.value;
            if (!catId) {
              setSubcats([]);
              return setProducts(allProductsRef.current);
            }
            const cat = categories.find(c => c._id === catId);
            setSubcats(cat?.subcategories || []);
            setProducts(allProductsRef.current.filter(p => p.category?._id === catId));
          }}
        >
          <MenuItem value="">All Categories</MenuItem>
          {categories.map(c => <MenuItem key={c._id} value={c._id}>{c.name}</MenuItem>)}
        </TextField>

        {subcats.length > 0 && (
          <TextField select size="small" label="Subcategory" sx={{ minWidth: 160 }}
            onChange={(e) => {
              const subId = e.target.value;
              if (!subId) return;
              setProducts(allProductsRef.current.filter(p => p.subcategory?._id === subId));
            }}
          >
            <MenuItem value="">All Subcategories</MenuItem>
            {subcats.map(s => <MenuItem key={s._id} value={s._id}>{s.name}</MenuItem>)}
          </TextField>
        )}

        <Button variant="contained" onClick={() => {
          setEditing(null);
          setForm({
            title: "", description: "", price: "", stock: 0,
            category: "", subcategory: { _id: "", name: "" }, images: []
          });
          setSubcats([]);
          setOpen(true);
        }}>Add Product</Button>
      </Stack>

      {/* ✅ PRODUCT LIST */}
      <Grid container spacing={2}>
        {products.map((p) => (
          <Grid item xs={12} sm={6} md={4} key={p._id}>
            <Card>
              <CardMedia component="img" height="180" image={p.images?.[0]?.url} />
              <CardContent>
                <Typography variant="h6">{p.title}</Typography>
                <Typography>₹{p.price}</Typography>
                <Typography>Stock: {p.stock}</Typography>
                <Typography variant="caption">{p.category?.name} → {p.subcategory?.name}</Typography>
              </CardContent>
              <CardActions>
                <Button onClick={() => editProduct(p)}>Edit</Button>
                <Button color="error" onClick={() => deleteProduct(p._id)}>Delete</Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* ✅ ADD / EDIT DIALOG */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editing ? "Edit Product" : "Add Product"}</DialogTitle>
        <DialogContent>

          {error && <Alert severity="error">{error}</Alert>}

          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField label="Title" value={form.title}
              onChange={e => setForm({ ...form, title: e.target.value })} />

            <TextField multiline rows={3} label="Description" value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })} />

            <TextField label="Price" type="number" value={form.price}
              onChange={e => setForm({ ...form, price: e.target.value })} />

            <TextField label="Stock" type="number" value={form.stock}
              onChange={e => setForm({ ...form, stock: e.target.value })} />

            <TextField select label="Category" value={form.category}
              onChange={(e) => {
                const catId = e.target.value;
                setForm({ ...form, category: catId, subcategory: { _id: "", name: "" } });
                const found = categories.find(c => c._id === catId);
                setSubcats(found?.subcategories || []);
              }}>
              {categories.map(c => <MenuItem key={c._id} value={c._id}>{c.name}</MenuItem>)}
            </TextField>

            {subcats.length > 0 && (
              <TextField select label="Subcategory" value={form.subcategory._id}
                onChange={(e) => {
                  const sub = subcats.find(s => s._id === e.target.value);
                  setForm({ ...form, subcategory: { _id: sub._id, name: sub.name } });
                }}>
                {subcats.map(s => <MenuItem key={s._id} value={s._id}>{s.name}</MenuItem>)}
              </TextField>
            )}

            <Button component="label" variant="outlined">
              Upload Images
              <input type="file" hidden multiple onChange={handleMultiUpload} />
            </Button>

            <Stack direction="row" spacing={1} flexWrap="wrap">
              {form.images.map((img, i) => (
                <Stack key={i} position="relative">
                  <img src={img.url} alt="" style={{ width: 70, height: 70, borderRadius: 4 }} />
                  <IconButton size="small" onClick={() => removeImage(i)}
                    sx={{ position: "absolute", top: -8, right: -8, bgcolor: "white" }}>
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Stack>
              ))}
            </Stack>

            <Button variant="contained" onClick={saveProduct}>
              {editing ? "Save Changes" : "Add Product"}
            </Button>
          </Stack>
        </DialogContent>
      </Dialog>

    </div>
  );
}
