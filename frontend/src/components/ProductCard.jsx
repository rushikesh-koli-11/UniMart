import React, { useContext } from 'react';
import { Card, CardMedia, CardContent, Typography, CardActions, Button } from '@mui/material';
import { Link } from 'react-router-dom';
import { CartContext } from '../contexts/CartContext';

export default function ProductCard({ product }) {
  const { addToCart } = useContext(CartContext);

  return (
    <Card>
      <CardMedia
        component="img"
        height="180"
        image={product.images?.[0]?.url || '/placeholder.png'}
        alt={product.title}
      />
      <CardContent>
        <Typography variant="h6">{product.title}</Typography>
        <Typography variant="body2">{product.description?.slice(0, 80)}</Typography>
        <Typography variant="subtitle1">₹{product.price}</Typography>
      </CardContent>
      <CardActions>
        <Button size="small" component={Link} to={`/product/${product._id}`}>
          View
        </Button>
        <Button size="small" onClick={() => addToCart(product)}>
          Add to Cart
        </Button>
      </CardActions>
    </Card>
  );
}
