import React, { useContext } from 'react';
import { CartContext } from '../contexts/CartContext';
import { Typography, Button } from '@mui/material';
import { Link } from 'react-router-dom';

export default function Cart() {
  const { cart, clearCart } = useContext(CartContext);

  const total = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);

  return (
    <div>
      <Typography variant="h5">Your Cart</Typography>
      {cart.length === 0 && <Typography>No items in cart</Typography>}
      {cart.map((item) => (
        <Typography key={item._id}>
          {item.title} — ₹{item.price} × {item.qty}
        </Typography>
      ))}
      {cart.length > 0 && (
        <>
          <Typography sx={{ mt: 2 }}><b>Total: ₹{total}</b></Typography>
          <Button variant="contained" sx={{ mt: 2, mr: 2 }} component={Link} to="/checkout">
            Proceed to Checkout
          </Button>
          <Button variant="outlined" sx={{ mt: 2 }} onClick={clearCart}>
            Clear Cart
          </Button>
        </>
      )}
    </div>
  );
}
