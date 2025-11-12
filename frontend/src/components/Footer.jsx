import React from 'react';
import { Box, Typography, Link as MuiLink, Grid } from '@mui/material';

export default function Footer() {
  return (
    <Box component="footer" sx={{ bgcolor: 'background.paper', py: 4, mt: 6 }}>
      <Grid container spacing={2} sx={{ px: 4 }}>
        <Grid item xs={12} md={4}>
          <Typography variant="h6">UniMart</Typography>
          <Typography>Seamless online shopping experience.</Typography>
        </Grid>
        <Grid item xs={6} md={2}>
          <Typography variant="subtitle1">Company</Typography>
          <MuiLink href="#" display="block">About Us</MuiLink>
          <MuiLink href="#" display="block">Contact Us</MuiLink>
        </Grid>
        <Grid item xs={6} md={2}>
          <Typography variant="subtitle1">Legal</Typography>
          <MuiLink href="#" display="block">Privacy Policy</MuiLink>
          <MuiLink href="#" display="block">Terms & Conditions</MuiLink>
        </Grid>
        <Grid item xs={12} md={4}>
          <Typography variant="subtitle1">Follow Us</Typography>
          <MuiLink href="#" display="block">Twitter</MuiLink>
          <MuiLink href="#" display="block">Facebook</MuiLink>
          <MuiLink href="#" display="block">Instagram</MuiLink>
        </Grid>
      </Grid>
      <Typography align="center" sx={{ mt: 3 }}>
        © UniMart 2025 — All rights reserved.
      </Typography>
    </Box>
  );
}
