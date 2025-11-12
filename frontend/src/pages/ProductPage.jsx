import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../api/api";
import { Typography, Button } from "@mui/material";
import { UserAuthContext } from "../contexts/UserAuthContext";
import { CartContext } from "../contexts/CartContext";

export default function ProductPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [p, setP] = useState(null);

  const { user } = useContext(UserAuthContext);
  const { addToCart } = useContext(CartContext);

  useEffect(() => {
    API.get(`/products/${id}`).then((r) => setP(r.data));
  }, [id]);

  if (!p) return <div>Loading...</div>;

  return (
    <div>
      <img src={p.images?.[0]?.url} alt={p.title} style={{ maxWidth: 400 }} />

      <Typography variant="h4">{p.title}</Typography>
      <Typography>{p.description}</Typography>
      <Typography variant="h6">₹{p.price}</Typography>

      <Button variant="contained" onClick={() => addToCart(p)}>
        Add to Cart
      </Button>

      <Button
        variant="outlined"
        sx={{ ml: 2 }}
        onClick={() => {
          addToCart(p);
          navigate("/checkout");
        }}
      >
        Buy Now
      </Button>
    </div>
  );
}
