import React, { useEffect, useState } from "react";
import API from "../../api/api";
import {
  Typography, Button, TextField, Stack, Card, CardContent, CardActions, Dialog,
  DialogContent, DialogTitle, Grid
} from "@mui/material";

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);

  const [open, setOpen] = useState(false);
  const [openSub, setOpenSub] = useState(false);

  const [form, setForm] = useState({ name: "", description: "" });
  const [subForm, setSubForm] = useState({ name: "", description: "" });
  const [selectedCat, setSelectedCat] = useState(null);

  const load = async () => {
    const { data } = await API.get("/categories");
    setCategories(data);
  };

  useEffect(() => { load(); }, []);

  const addCategory = async () => {
    await API.post(`/categories`, form);
    setForm({ name: "", description: "" });
    setOpen(false);
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
    setSubForm({ name: "", description: "" });
    setOpenSub(true);
  };

  const addSubcategory = async () => {
    await API.post(`/categories/${selectedCat._id}/sub`, subForm);
    setOpenSub(false);
    load();
  };

  const deleteSub = async (catId, subId) => {
    await API.delete(`/categories/${catId}/sub/${subId}`);
    load();
  };

  return (
    <div>
      <Typography variant="h5" sx={{ mb: 2 }}>Categories</Typography>

      <Button variant="contained" onClick={() => setOpen(true)}>Add Category</Button>

      <Grid container spacing={2} sx={{ mt: 2 }}>
        {categories.map(cat => (
          <Grid item xs={12} md={6} key={cat._id}>
            <Card>
              <CardContent>
                <Typography variant="h6">{cat.name}</Typography>
                <Typography variant="body2">{cat.description}</Typography>

                <Typography sx={{ mt: 1, fontWeight: "bold" }}>Subcategories:</Typography>
                {cat.subcategories.map(sub => (
                  <Stack direction="row" alignItems="center" key={sub._id}>
                    <Typography>- {sub.name}</Typography>
                    <Button size="small" color="error" onClick={() => deleteSub(cat._id, sub._id)}>Delete</Button>
                  </Stack>
                ))}
              </CardContent>

              <CardActions>
                <Button onClick={() => openAddSub(cat)}>Add Subcategory</Button>
                <Button color="error" onClick={() => deleteCategory(cat._id)}>Delete</Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Add Category Dialog */}
      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>Add Category</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField label="Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
            <TextField label="Description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
            <Button variant="contained" onClick={addCategory}>Save</Button>
          </Stack>
        </DialogContent>
      </Dialog>

      {/* Add Subcategory Dialog */}
      <Dialog open={openSub} onClose={() => setOpenSub(false)}>
        <DialogTitle>Add Subcategory</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField label="Name" value={subForm.name} onChange={e => setSubForm({ ...subForm, name: e.target.value })} />
            <TextField label="Description" value={subForm.description} onChange={e => setSubForm({ ...subForm, description: e.target.value })} />
            <Button variant="contained" onClick={addSubcategory}>Save</Button>
          </Stack>
        </DialogContent>
      </Dialog>

    </div>
  );
}
