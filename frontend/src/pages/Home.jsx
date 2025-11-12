import React, { useEffect, useState } from 'react';
import API from '../api/api';
import ProductCard from '../components/ProductCard';
import { Grid, TextField, Button, MenuItem, Stack, Typography } from '@mui/material';

export default function Home() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subcats, setSubcats] = useState([]);

  const [filters, setFilters] = useState({
    q: "",
    category: "",
    subcategory: ""
  });

  const load = async () => {
    const { data } = await API.get(`/products?q=${encodeURIComponent(filters.q)}`);
    setProducts(data);
  };

  const loadCategories = async () => {
    const { data } = await API.get("/categories");
    setCategories(data);
  };

  useEffect(() => {
    load();
    loadCategories();
  }, []);

  const applyFilters = () => {
    let result = [...products];

    if (filters.category) {
      result = result.filter(p => p.category?._id === filters.category);
    }

    if (filters.subcategory) {
      result = result.filter(p => p.subcategory?._id === filters.subcategory);
    }

    return result;
  };

  return (
    <div>
      <Stack direction="row" spacing={2} sx={{ mb: 3 }}>

        {/* Search */}
        <TextField label="Search" 
          value={filters.q} 
          onChange={e => setFilters({...filters, q: e.target.value })} 
        />
        <Button variant="contained" onClick={load}>Search</Button>

        {/* Category */}
        <TextField select label="Category" value={filters.category}
          onChange={(e) => {
            const catId = e.target.value;
            setFilters({ ...filters, category: catId, subcategory: "" });
            const found = categories.find(c => c._id === catId);
            setSubcats(found?.subcategories || []);
          }}
        >
          <MenuItem value="">All</MenuItem>
          {categories.map(c => (
            <MenuItem key={c._id} value={c._id}>{c.name}</MenuItem>
          ))}
        </TextField>

        {/* Subcategory */}
        {subcats.length > 0 && (
          <TextField select label="Subcategory" value={filters.subcategory}
            onChange={(e) => setFilters({ ...filters, subcategory: e.target.value })}
          >
            <MenuItem value="">All</MenuItem>
            {subcats.map(s => (
              <MenuItem key={s._id} value={s._id}>{s.name}</MenuItem>
            ))}
          </TextField>
        )}

      </Stack>

      <Grid container spacing={2}>
        {applyFilters().map(p => (
          <Grid item xs={12} sm={6} md={4} key={p._id}>
            <ProductCard product={p} />
          </Grid>
        ))}
      </Grid>
    </div>
  );
}
