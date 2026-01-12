import React, { useEffect, useState } from "react";
import API from "../../api/api";
import {
  Typography,
  Button,
  TextField,
  Stack,
  Card,
  CardContent,
  CardActions,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Divider,
  Avatar
} from "@mui/material";

import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import ImageIcon from "@mui/icons-material/Image";

import "./AdminCategories.css";

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);

  const [imagePreview, setImagePreview] = useState(null);


  const [open, setOpen] = useState(false);
  const [openSub, setOpenSub] = useState(false);
  const [openEditCat, setOpenEditCat] = useState(false);
  const [openEditSub, setOpenEditSub] = useState(false);

  const [form, setForm] = useState({
    name: "",
    description: "",
    image: null
  });

  const [subForm, setSubForm] = useState({
    name: "",
    description: "",
    image: null
  });

  const [selectedCat, setSelectedCat] = useState(null);
  const [selectedSub, setSelectedSub] = useState(null);

  const load = async () => {
    const { data } = await API.get("/categories");

    const sorted = data
      .map((cat) => ({
        ...cat,
        subcategories: cat.subcategories.sort((a, b) =>
          a.name.localeCompare(b.name)
        ),
      }))
      .sort((a, b) => a.name.localeCompare(b.name));

    setCategories(sorted);
  };

  useEffect(() => {
    load();
  }, []);

  const uploadImage = async (file) => {
    try {
      const formData = new FormData();
      formData.append("image", file);
      formData.append("type", "category");   

      const { data } = await API.post("/upload/image", formData);

      console.log("Uploaded:", data);
      return data;

    } catch (error) {
      console.error("Upload failed:", error.response?.data || error.message);
      alert(error.response?.data?.message || "Upload failed");
      throw error;
    }
  };



  const handleImage = async (e, setter) => {
    const file = e.target.files[0];
    if (!file) return;

    const uploaded = await uploadImage(file);
    setter((prev) => ({ ...prev, image: uploaded }));
  };


  const addCategory = async () => {
    if (!form.name.trim()) return alert("Enter Category Name!");

    await API.post(`/categories`, form);
    setForm({ name: "", description: "", image: null });
    setOpen(false);
    load();
  };

  const openEditCategory = (cat) => {
    setSelectedCat(cat);
    setForm({
      name: cat.name,
      description: cat.description,
      image: cat.image || null
    });
    setOpenEditCat(true);
  };

  const updateCategory = async () => {
    await API.put(`/categories/${selectedCat._id}`, form);
    setOpenEditCat(false);
    load();
  };

  const deleteCategory = async (id) => {
    if (window.confirm("Delete category?")) {
      await API.delete(`/categories/${id}`);
      load();
    }
  };


  const openAddSub = (cat) => {
    setSelectedCat(cat);
    setSubForm({ name: "", description: "", image: null });
    setOpenSub(true);
  };

  const addSubcategory = async () => {
    if (!subForm.name.trim()) return alert("Enter Subcategory Name!");
    await API.post(`/categories/${selectedCat._id}/sub`, subForm);
    setOpenSub(false);
    load();
  };

  const openEditSubcategory = (cat, sub) => {
    setSelectedCat(cat);
    setSelectedSub(sub);
    setSubForm({
      name: sub.name,
      description: sub.description,
      image: sub.image || null
    });
    setOpenEditSub(true);
  };

  const updateSubcategory = async () => {
    await API.put(
      `/categories/${selectedCat._id}/sub/${selectedSub._id}`,
      subForm
    );
    setOpenEditSub(false);
    load();
  };

  const deleteSub = async (catId, subId) => {
    if (window.confirm("Delete subcategory?")) {
      await API.delete(`/categories/${catId}/sub/${subId}`);
      load();
    }
  };

  return (
    <div className="container py-3 admin-category-page">

      <div className="admin-cat-hero">
        <h1>Category Management</h1>
        <p>Organize & manage categories and subcategories effortlessly</p>
      </div>

      <div className="text-center mb-4">
        <Button
          variant="contained"
          className="add-btn"
          startIcon={<AddIcon />}
          onClick={() => setOpen(true)}
        >
          Add New Category
        </Button>
      </div>

      <div className="row g-4">
        {categories.map((cat) => (
          <div className="col-12" key={cat._id}>
            <Card className="cat-card shadow-sm">
              <CardContent>

                <div className="d-flex justify-content-between align-items-center">
                  <Stack direction="row" spacing={2} alignItems="center">
                    <div 
  className="cat-image-box"
  onClick={() => cat.image?.url && setImagePreview(cat.image.url)}
  style={{ cursor: "pointer" }}
>
  {cat.image?.url ? (
    <img src={cat.image.url} alt={cat.name} className="cat-image" />
  ) : (
    <div className="no-image">No Image</div>
  )}
</div>


                    <Typography className="cat-title">{cat.name}</Typography>
                  </Stack>

                  <IconButton
                    size="small"
                    className="edit-btn"
                    onClick={() => openEditCategory(cat)}
                  >
                    <EditIcon />
                  </IconButton>
                </div>

                <Typography className="cat-description">
                  {cat.description || "No description"}
                </Typography>

                <Divider className="my-3" />

                <Typography className="sub-title">Subcategories</Typography>

                <div className="sub-grid">
                  {cat.subcategories.length === 0 && (
                    <p className="no-sub">No subcategories</p>
                  )}

                  {cat.subcategories.map((sub) => (
                    <div className="sub-item" key={sub._id}>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <div 
  className="sub-image-box"
  onClick={() => sub.image?.url && setImagePreview(sub.image.url)}
  style={{ cursor: "pointer" }}
>
  {sub.image?.url ? (
    <img src={sub.image.url} alt={sub.name} className="sub-image" />
  ) : (
    <div className="no-image small">No</div>
  )}
</div>

                        <span className="sub-name">{sub.name}</span>
                      </Stack>

                      <span>
                        <IconButton
                          size="small"
                          className="edit-sub-btn mx-2"
                          onClick={() => openEditSubcategory(cat, sub)}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>

                        <IconButton
                          size="small"
                          className="delete-sub-btn"
                          onClick={() => deleteSub(cat._id, sub._id)}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </span>
                    </div>
                  ))}
                </div>

              </CardContent>

              <CardActions className="cat-actions">
                <Button size="small" startIcon={<AddIcon />} onClick={() => openAddSub(cat)}>
                  Add Subcategory
                </Button>

                <Button size="small" color="error" startIcon={<DeleteIcon />} onClick={() => deleteCategory(cat._id)}>
                  Delete
                </Button>
              </CardActions>

            </Card>
          </div>
        ))}
      </div>

      <Dialog open={open} onClose={() => setOpen(false)} className="dialog-box">
        <DialogTitle>Add Category</DialogTitle>
        <DialogContent>
          <Stack spacing={2}>
            <TextField label="Category Name" value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })} />

            <TextField label="Description" value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })} />

            <Button component="label" startIcon={<ImageIcon />}>
              Upload Image
              <input hidden type="file" onChange={(e) => handleImage(e, setForm)} />
            </Button>

            {form.image && <img src={form.image.url} width="80" />}

            <Button variant="contained" onClick={addCategory} className="add-btn">Save</Button>
          </Stack>
        </DialogContent>
      </Dialog>

      <Dialog open={openEditCat} onClose={() => setOpenEditCat(false)} className="dialog-box">
        <DialogTitle>Edit Category</DialogTitle>
        <DialogContent>
          <Stack spacing={2}>
            <TextField label="Category Name" value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })} />

            <TextField label="Description" value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })} />

            <Button component="label" startIcon={<ImageIcon />}>
              Change Image
              <input hidden type="file" onChange={(e) => handleImage(e, setForm)} />
            </Button>

            {form.image && <img src={form.image.url} width="80" />}

            <Button variant="contained" onClick={updateCategory} className="add-btn">Update</Button>
          </Stack>
        </DialogContent>
      </Dialog>

      <Dialog open={openSub} onClose={() => setOpenSub(false)} className="dialog-box">
        <DialogTitle>Add Subcategory</DialogTitle>
        <DialogContent>
          <Stack spacing={2}>
            <TextField label="Subcategory Name" value={subForm.name}
              onChange={(e) => setSubForm({ ...subForm, name: e.target.value })} />

            <TextField label="Description" value={subForm.description}
              onChange={(e) => setSubForm({ ...subForm, description: e.target.value })} />

            <Button component="label" startIcon={<ImageIcon />}>
              Upload Image
              <input hidden type="file" onChange={(e) => handleImage(e, setSubForm)} />
            </Button>

            {subForm.image && <img src={subForm.image.url} width="80" />}

            <Button variant="contained" onClick={addSubcategory} className="add-btn">Save</Button>
          </Stack>
        </DialogContent>
      </Dialog>

      <Dialog open={openEditSub} onClose={() => setOpenEditSub(false)} className="dialog-box">
        <DialogTitle>Edit Subcategory</DialogTitle>
        <DialogContent>
          <Stack spacing={2}>
            <TextField label="Subcategory Name" value={subForm.name}
              onChange={(e) => setSubForm({ ...subForm, name: e.target.value })} />

            <TextField label="Description" value={subForm.description}
              onChange={(e) => setSubForm({ ...subForm, description: e.target.value })} />

            <Button component="label" startIcon={<ImageIcon />}>
              Change Image
              <input hidden type="file" onChange={(e) => handleImage(e, setSubForm)} />
            </Button>

            {subForm.image && <img src={subForm.image.url} width="80" />}

            <Button variant="contained" onClick={updateSubcategory} className="add-btn">Update</Button>
          </Stack>
        </DialogContent>
      </Dialog>

      <Dialog
  open={!!imagePreview}
  onClose={() => setImagePreview(null)}
  className="image-preview-dialog"
>
  <DialogContent className="image-preview-content">
    <img src={imagePreview} alt="Preview" className="preview-image" />
  </DialogContent>
</Dialog>


    </div>
  );
}
