import React, { useContext, useState } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Badge,
  Menu,
  MenuItem,
  Box,
} from "@mui/material";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import { Link, useNavigate } from "react-router-dom";
import { UserAuthContext } from "../contexts/UserAuthContext";
import { AdminAuthContext } from "../contexts/AdminAuthContext";
import { CartContext } from "../contexts/CartContext";

export default function Navbar() {
  const { user, logoutUser } = useContext(UserAuthContext);
  const { admin, logoutAdmin } = useContext(AdminAuthContext);
  const { cart } = useContext(CartContext);
  const navigate = useNavigate();

  const [userMenuAnchor, setUserMenuAnchor] = useState(null);
  const [adminMenuAnchor, setAdminMenuAnchor] = useState(null);

  const openUserMenu = (e) => setUserMenuAnchor(e.currentTarget);
  const closeUserMenu = () => setUserMenuAnchor(null);
  const openAdminMenu = (e) => setAdminMenuAnchor(e.currentTarget);
  const closeAdminMenu = () => setAdminMenuAnchor(null);

  return (
    <AppBar position="static" color="primary">
      <Toolbar sx={{ justifyContent: "space-between" }}>
        {/* ===========================
            LEFT SIDE: LOGO + LINKS
        ============================ */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          {/* LOGO */}
          <Typography
            component={Link}
            to="/"
            variant="h6"
            sx={{
              textDecoration: "none",
              color: "inherit",
              fontWeight: "bold",
              mr: 2,
            }}
          >
            UniMart
          </Typography>

          {/* ✅ USER-ONLY NAV LINKS */}
          {!admin && (
            <>
              <Button color="inherit" component={Link} to="/">
                Home
              </Button>
              <Button color="inherit" component={Link} to="/feedback">
                Feedback
              </Button>
            </>
          )}
        </Box>

        {/* ===========================
            RIGHT SIDE: ACCOUNT + CART
        ============================ */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          {/* USER (not admin) */}
          {user && !admin && (
            <>
              {/* CART ICON */}
              <IconButton component={Link} to="/cart" color="inherit">
                <Badge badgeContent={cart.length} color="secondary">
                  <ShoppingCartIcon />
                </Badge>
              </IconButton>

              {/* HELLO USER DROPDOWN */}
              <Button
                color="inherit"
                endIcon={<ArrowDropDownIcon />}
                onClick={openUserMenu}
              >
                Hello, {user.name}
              </Button>

              <Menu
                anchorEl={userMenuAnchor}
                open={Boolean(userMenuAnchor)}
                onClose={closeUserMenu}
              >
                <MenuItem
                  onClick={() => {
                    closeUserMenu();
                    navigate("/user/dashboard");
                  }}
                >
                  My Profile
                </MenuItem>
                <MenuItem
                  onClick={() => {
                    closeUserMenu();
                    navigate("/user/orders");
                  }}
                >
                  My Orders
                </MenuItem>
              </Menu>

              {/* LOGOUT */}
              <Button
                color="inherit"
                onClick={() => {
                  logoutUser();
                  navigate("/");
                }}
              >
                Logout
              </Button>
            </>
          )}

          {/* ADMIN SECTION */}
          {admin && (
            <>
              <Button
                color="inherit"
                endIcon={<ArrowDropDownIcon />}
                onClick={openAdminMenu}
              >
                Hello, {admin.name}
              </Button>

              <Menu
                anchorEl={adminMenuAnchor}
                open={Boolean(adminMenuAnchor)}
                onClose={closeAdminMenu}
              >
                <MenuItem
                  onClick={() => {
                    closeAdminMenu();
                    navigate("/admin/dashboard");
                  }}
                >
                  Dashboard
                </MenuItem>
                <MenuItem
                  onClick={() => {
                    closeAdminMenu();
                    navigate("/admin/products");
                  }}
                >
                  Products
                </MenuItem>
                <MenuItem
                  onClick={() => {
                    closeAdminMenu();
                    navigate("/admin/orders");
                  }}
                >
                  Orders
                </MenuItem>
                <MenuItem
                  onClick={() => {
                    closeAdminMenu();
                    navigate("/admin/users");
                  }}
                >
                  Users
                </MenuItem>
                <MenuItem
                  onClick={() => {
                    closeAdminMenu();
                    navigate("/admin/feedback");
                  }}
                >
                  Feedback
                </MenuItem>
                <MenuItem
                  onClick={() => {
                    closeAdminMenu();
                    navigate("/admin/categories");
                  }}
                >
                  Categories
                </MenuItem>
              </Menu>

              {/* LOGOUT */}
              <Button
                color="inherit"
                onClick={() => {
                  logoutAdmin();
                  navigate("/admin/login");
                }}
              >
                Logout
              </Button>
            </>
          )}

          {/* NO ONE LOGGED IN */}
          {!user && !admin && (
            <>
              <Button color="inherit" component={Link} to="/user/login">
                User Login
              </Button>
              <Button color="inherit" component={Link} to="/admin/login">
                Admin Login
              </Button>
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
}
