import React from 'react';
import { Box, Drawer, List, ListItemButton, ListItemText } from '@mui/material';
import { useNavigate } from 'react-router-dom';

export default function AdminLayout({ children }) {
  const navigate = useNavigate();
  return (
    <Box sx={{ display: 'flex' }}>
      <Drawer variant="permanent" anchor="left">
        <Box sx={{ width: 240, mt: 8 }}>
          <List>
            <ListItemButton onClick={() => navigate('/admin/dashboard')}><ListItemText primary="Dashboard" /></ListItemButton>
            <ListItemButton onClick={() => navigate('/admin/products')}><ListItemText primary="Products" /></ListItemButton>
            <ListItemButton onClick={() => navigate('/admin/orders')}><ListItemText primary="Orders" /></ListItemButton>
            <ListItemButton onClick={() => navigate('/admin/users')}><ListItemText primary="Users" /></ListItemButton>
            <ListItemButton onClick={() => navigate('/admin/feedback')}><ListItemText primary="Feedback" /></ListItemButton>
            <ListItemButton onClick={() => navigate('/admin/categories')}>
              <ListItemText primary="Categories" />
            </ListItemButton>
          </List>
        </Box>
      </Drawer>
      <Box sx={{ flex: 1, ml: '240px', p: 3 }}>{children}</Box>
    </Box>
  );
}
