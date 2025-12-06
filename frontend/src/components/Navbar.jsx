import React, { useContext, useEffect, useState } from "react";
import {
  AppBar,
  Toolbar,
  Button,
  IconButton,
  Badge,
  Box,
  Menu,
  MenuItem,
  TextField,
  InputAdornment,
  Divider
} from "@mui/material";

import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import SearchIcon from "@mui/icons-material/Search";

import { Link, useNavigate, useLocation } from "react-router-dom";

import { UserAuthContext } from "../contexts/UserAuthContext";
import { AdminAuthContext } from "../contexts/AdminAuthContext";
import { CartContext } from "../contexts/CartContext";

import API from "../api/api";
import "./Navbar.css";
import Logo from "../assets/UniMart.png";

export default function Navbar() {
  const { user, logoutUser } = useContext(UserAuthContext);
  const { admin, logoutAdmin } = useContext(AdminAuthContext);
  const { cart } = useContext(CartContext);

  const navigate = useNavigate();
  const location = useLocation();

  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuAnchor, setUserMenuAnchor] = useState(null);
  const [filtersMenuAnchor, setFiltersMenuAnchor] = useState(null);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  const [search, setSearch] = useState("");
  const [categories, setCategories] = useState([]);
  const [categoryId, setCategoryId] = useState("");
  const [subcategories, setSubcategories] = useState([]);
  const [subcatId, setSubcatId] = useState("");

  const [recentSearches, setRecentSearches] = useState([]);

  const [language, setLanguage] = useState(localStorage.getItem("lang") || "en");

  /* ========================================================
      🌍 GOOGLE TRANSLATE LANGUAGE HANDLER
  ======================================================== */
const handleLanguageChange = (lang) => {
  setLanguage(lang);                    // update dropdown instantly
  localStorage.setItem("lang", lang);   // persist it

  const select = document.querySelector(".goog-te-combo");
  if (select) {
    select.value = lang;
    select.dispatchEvent(new Event("change"));
  }
};




 useEffect(() => {
  const savedLang = localStorage.getItem("lang");
  if (!savedLang) return;

  setLanguage(savedLang); // <-- update dropdown immediately

  let attempts = 0;
  const interval = setInterval(() => {
    const combo = document.querySelector(".goog-te-combo");
    if (combo) {
      combo.value = savedLang;
      combo.dispatchEvent(new Event("change"));
      clearInterval(interval);
    }
    if (attempts++ > 20) clearInterval(interval);
  }, 300);
}, []);



  /* --------------------------------------------- */
  const activeClass = (path) => {
    const current = location.pathname;
    if (current === path) return "active-nav";
    if (current.startsWith(path + "/")) return "active-nav";
    if (current.startsWith(path)) return "active-nav";
    return "";
  };

  /* --------------------------------------------- */
  useEffect(() => {
    let mounted = true;

    const loadCategories = async () => {
      try {
        const { data } = await API.get("/categories");
        if (mounted) setCategories(data || []);
      } catch (err) {
        console.log(err);
      }
    };

    loadCategories();

    const params = new URLSearchParams(window.location.search);
    setSearch(params.get("q") || "");
    setCategoryId(params.get("category") || "");
    setSubcatId(params.get("subcategory") || "");

    const saved = JSON.parse(localStorage.getItem("recentSearches")) || [];
    setRecentSearches(saved);

    return () => {
      mounted = false;
    };
  }, []);

  /* -------------------------------------------------- */
  useEffect(() => {
    if (!categoryId) {
      setSubcategories([]);
      setSubcatId("");
      return;
    }
    const cat = categories.find((c) => String(c._id) === String(categoryId));
    setSubcategories(cat?.subcategories || []);
  }, [categoryId, categories]);

  /* --------------------------------------------- */
  const saveSearchHistory = (term) => {
    if (!term.trim()) return;
    const updated = [term, ...recentSearches.filter((x) => x !== term)].slice(
      0,
      5
    );
    setRecentSearches(updated);
    localStorage.setItem("recentSearches", JSON.stringify(updated));
  };

  /* --------------------------------------------- */
  const applyFilters = (forcedSubId = null, forcedQ = null, forcedCat = null) => {
    const params = new URLSearchParams();

    const qVal = forcedQ ?? search;
    const cVal = forcedCat ?? categoryId;
    const sVal = forcedSubId ?? subcatId;

    if (qVal?.trim()) {
      params.set("q", qVal.trim());
      saveSearchHistory(qVal.trim());
    }
    if (cVal) params.set("category", cVal);
    if (sVal) params.set("subcategory", sVal);

    navigate(`/search?${params.toString()}`);

    setFiltersMenuAnchor(null);
    setMenuOpen(false);
  };

  /* --------------------------------------------- */
  const clearFilters = () => {
    setSearch("");
    setSubcatId("");
    setCategoryId("");
    navigate("/");
    setFiltersMenuAnchor(null);
    setMenuOpen(false);
  };

  const handleNavClick = (to) => {
    setMenuOpen(false);
    navigate(to);
  };

  return (
    <AppBar position="sticky" className="navbar-main">
      <Toolbar className="navbar-toolbar">

        {/* LOGO */}
        <Box component={Link} to="/" className="navbar-logo-img">
          <img src={Logo} className="logo-img" alt="UniMart Logo" />
        </Box>

        {/* DESKTOP SEARCH */}
        {!admin && (
          <Box className="nav-center desktop-only">
            <TextField
              fullWidth
              size="small"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) =>
                e.key === "Enter" && applyFilters(null, search, categoryId)
              }
              className="fullwidth-search"
              InputProps={{
                sx: { background: "#fff", borderRadius: "6px" },
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => applyFilters(null, search, categoryId)}
                    >
                      <SearchIcon style={{ color: "#031576" }} />
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
          </Box>
        )}

        {/* FILTER BUTTON */}
        {!admin && (
          <Button
            className="nav-link-btn desktop-only"
            endIcon={<ArrowDropDownIcon />}
            onClick={(e) => {
              setFiltersMenuAnchor(e.currentTarget);
            }}
          >
            Filters
          </Button>
        )}

        {/* =============== 🌍 LANGUAGE DROPDOWN (DESKTOP) =============== */}
        <Box className="desktop-only" sx={{ ml: 2 }}>
          <select
            className="language-dropdown"
            value={language}
            onChange={(e) => handleLanguageChange(e.target.value)}
          >
            <option value="en">English</option>
            <option value="mr">Marathi</option>
            <option value="hi">Hindi</option>
            <option value="bn">Bengali</option>
            <option value="ta">Tamil</option>
            <option value="te">Telugu</option>
            <option value="gu">Gujarati</option>
            <option value="kn">Kannada</option>
          </select>
        </Box>

        {/* FILTER MENU */}
        <Menu
          anchorEl={filtersMenuAnchor}
          open={Boolean(filtersMenuAnchor)}
          onClose={() => setFiltersMenuAnchor(null)}
        >
          <MenuItem sx={{ color: "red", fontWeight: 600 }} onClick={clearFilters}>
            Clear Filters
          </MenuItem>

          <Divider sx={{ my: 1 }} />

          <MenuItem disabled sx={{ fontWeight: 700 }}>
            Category
          </MenuItem>

          {categories.map((c) => (
            <MenuItem
              key={c._id}
              selected={String(categoryId) === String(c._id)}
              onClick={() => {
                setCategoryId(c._id);
                setSubcatId("");
                setSubcategories(c.subcategories || []);
              }}
            >
              {c.name}
            </MenuItem>
          ))}

          <Divider sx={{ my: 1 }} />

          <MenuItem disabled sx={{ fontWeight: 700 }}>
            Subcategory
          </MenuItem>

          {subcategories.length === 0 && (
            <MenuItem disabled>(No subcategories)</MenuItem>
          )}

          {subcategories.map((s) => (
            <MenuItem
              key={s._id}
              selected={String(subcatId) === String(s._id)}
              onClick={() => {
                navigate(`/subcategory/${s._id}`);
                setFiltersMenuAnchor(null);
                setMenuOpen(false);
              }}
            >
              {s.name}
            </MenuItem>
          ))}

          <Divider sx={{ my: 1 }} />

          <MenuItem sx={{ fontWeight: 700 }} onClick={() => applyFilters()}>
            Apply Filters
          </MenuItem>
        </Menu>

        {/* DESKTOP RIGHT NAV */}
        <Box className="nav-right desktop-only" sx={{ marginLeft: "auto" }}>
          {!admin && (
            <>
              <Button
                onClick={() => handleNavClick("/about")}
                className={`nav-link-btn ${activeClass("/about")}`}
              >
                About
              </Button>

              <Button
                onClick={() => handleNavClick("/contact")}
                className={`nav-link-btn ${activeClass("/contact")}`}
              >
                Contact
              </Button>

              <IconButton
                onClick={() => handleNavClick("/cart")}
                className={`nav-icon-btn ${activeClass("/cart")}`}
              >
                <Badge badgeContent={cart.length} color="secondary">
                  <ShoppingCartIcon />
                </Badge>
              </IconButton>
            </>
          )}

          {/* USER MENU */}
          {user && !admin && (
            <>
              <Button
                className="nav-user-btn"
                endIcon={<ArrowDropDownIcon />}
                onClick={(e) => setUserMenuAnchor(e.currentTarget)}
              >
                Hello, {user.name}
              </Button>

              <Menu
                anchorEl={userMenuAnchor}
                open={Boolean(userMenuAnchor)}
                onClose={() => setUserMenuAnchor(null)}
              >
                <MenuItem
                  onClick={() => {
                    setUserMenuAnchor(null);
                    handleNavClick("/user/dashboard");
                  }}
                >
                  My Profile
                </MenuItem>

                <MenuItem
                  onClick={() => {
                    setUserMenuAnchor(null);
                    handleNavClick("/user/orders");
                  }}
                >
                  Orders
                </MenuItem>

                <MenuItem
                  onClick={() => {
                    setUserMenuAnchor(null);
                    logoutUser();
                    handleNavClick("/");
                  }}
                >
                  Logout
                </MenuItem>
              </Menu>
            </>
          )}

          {/* ADMIN NAV */}
          {admin && (
            <Box sx={{ display: "flex", gap: "12px", marginLeft: "auto" }}>
              <Button
                className={`nav-link-btn ${activeClass("/admin/dashboard")}`}
                onClick={() => handleNavClick("/admin/dashboard")}
              >
                Dashboard
              </Button>

              <Button
                className={`nav-link-btn ${activeClass("/admin/products")}`}
                onClick={() => handleNavClick("/admin/products")}
              >
                Products
              </Button>

              <Button
                className={`nav-link-btn ${activeClass("/admin/orders")}`}
                onClick={() => handleNavClick("/admin/orders")}
              >
                Orders
              </Button>

              <Button
                className={`nav-link-btn ${activeClass("/admin/categories")}`}
                onClick={() => handleNavClick("/admin/categories")}
              >
                Categories
              </Button>

              <Button
                className={`nav-link-btn ${activeClass("/admin/users")}`}
                onClick={() => handleNavClick("/admin/users")}
              >
                Users
              </Button>

              <Button
                className={`nav-link-btn ${activeClass("/admin/feedbacks")}`}
                onClick={() => handleNavClick("/admin/feedbacks")}
              >
                Feedbacks
              </Button>

              <Button
                className={`nav-link-btn ${activeClass("/admin/manage-slider")}`}
                onClick={() => handleNavClick("/admin/manage-slider")}
              >
                Manage Slider
              </Button>

              <Button
                className={`nav-link-btn ${activeClass("/admin/mostly-used")}`}
                onClick={() => handleNavClick("/admin/mostly-used")}
              >
                Manage Used Links
              </Button>

              <Button
                className={`nav-link-btn ${activeClass("/admin/offers")}`}
                onClick={() => handleNavClick("/admin/offers")}
              >
                Manage offers
              </Button>

              <Button
                className="nav-logout-btn"
                onClick={() => {
                  logoutAdmin();
                  handleNavClick("/admin/login");
                }}
              >
                Logout
              </Button>
            </Box>
          )}

          {!user && !admin && (
            <Button
              onClick={() => handleNavClick("/user/login")}
              className="nav-auth-btn login-btn"
            >
              Login
            </Button>
          )}
        </Box>

        {/* MOBILE ICONS */}
        <Box
          className="mobile-only"
          sx={{ marginLeft: "auto", display: "flex", gap: "12px" }}
        >
          {!admin && (
            <IconButton onClick={() => setMobileSearchOpen(true)}>
              <SearchIcon style={{ color: "#fff" }} />
            </IconButton>
          )}

          {!admin && (
            <IconButton onClick={() => handleNavClick("/cart")}>
              <Badge badgeContent={cart.length} color="secondary">
                <ShoppingCartIcon style={{ color: "#fff" }} />
              </Badge>
            </IconButton>
          )}

          <IconButton
            className="hamburger-btn"
            onClick={() => setMenuOpen((s) => !s)}
          >
            {menuOpen ? <CloseIcon /> : <MenuIcon />}
          </IconButton>
        </Box>
      </Toolbar>

      {/* MOBILE MENU */}
      {menuOpen && (
        <Box className="mobile-menu">

          {/* 🌍 LANGUAGE DROPDOWN (MOBILE) */}
          <select
            className="language-dropdown"
            value={localStorage.getItem("lang") || "en"}
            onChange={(e) => handleLanguageChange(e.target.value)}
            style={{ width: "90%", margin: "10px auto", display: "block" }}
          >
            <option value="en">English</option>
            <option value="mr">Marathi</option>
            <option value="hi">Hindi</option>
            <option value="bn">Bengali</option>
            <option value="ta">Tamil</option>
            <option value="te">Telugu</option>
            <option value="gu">Gujarati</option>
            <option value="kn">Kannada</option>
          </select>

          {!admin && (
            <Button
              className="mobile-menu-btn"
              onClick={(e) => {
                setFiltersMenuAnchor(e.currentTarget);
              }}
            >
              Filters
            </Button>
          )}

          {!admin && (
            <>
              <Button
                component={Link}
                to="/about"
                className={`mobile-menu-btn ${activeClass("/about")}`}
                onClick={() => setMenuOpen(false)}
              >
                About
              </Button>

              <Button
                component={Link}
                to="/contact"
                className={`mobile-menu-btn ${activeClass("/contact")}`}
                onClick={() => setMenuOpen(false)}
              >
                Contact
              </Button>
            </>
          )}

          {user && !admin && (
            <>
              <Button
                component={Link}
                to="/user/dashboard"
                className={`mobile-menu-btn ${activeClass("/user/dashboard")}`}
                onClick={() => setMenuOpen(false)}
              >
                My Profile
              </Button>

              <Button
                component={Link}
                to="/user/orders"
                className={`mobile-menu-btn ${activeClass("/user/orders")}`}
                onClick={() => setMenuOpen(false)}
              >
                Orders
              </Button>

              <Button
                className="mobile-logout-btn"
                onClick={() => {
                  logoutUser();
                  setMenuOpen(false);
                  navigate("/");
                }}
              >
                Logout
              </Button>
            </>
          )}

          {admin && (
            <>
              <Button
                component={Link}
                to="/admin/dashboard"
                className={`mobile-menu-btn ${activeClass("/admin/dashboard")}`}
                onClick={() => setMenuOpen(false)}
              >
                Dashboard
              </Button>

              <Button
                component={Link}
                to="/admin/products"
                className={`mobile-menu-btn ${activeClass("/admin/products")}`}
                onClick={() => setMenuOpen(false)}
              >
                Products
              </Button>

              <Button
                component={Link}
                to="/admin/orders"
                className={`mobile-menu-btn ${activeClass("/admin/orders")}`}
                onClick={() => setMenuOpen(false)}
              >
                Orders
              </Button>

              <Button
                component={Link}
                to="/admin/categories"
                className={`mobile-menu-btn ${activeClass("/admin/categories")}`}
                onClick={() => setMenuOpen(false)}
              >
                Categories
              </Button>

              <Button
                component={Link}
                to="/admin/users"
                className={`mobile-menu-btn ${activeClass("/admin/users")}`}
                onClick={() => setMenuOpen(false)}
              >
                Users
              </Button>

              <Button
                component={Link}
                to="/admin/feedbacks"
                className={`mobile-menu-btn ${activeClass("/admin/feedbacks")}`}
                onClick={() => setMenuOpen(false)}
              >
                Feedbacks
              </Button>

              <Button
                component={Link}
                to="/admin/manage-slider"
                className={`mobile-menu-btn ${activeClass("/admin/manage-slider")}`}
                onClick={() => setMenuOpen(false)}
              >
                Manage Slider
              </Button>

              <Button
                component={Link}
                to="/admin/mostly-used"
                className={`mobile-menu-btn ${activeClass("/admin/mostly-used")}`}
                onClick={() => setMenuOpen(false)}
              >
                Manage Used Links
              </Button>

              <Button
                component={Link}
                to="/admin/offers"
                className={`mobile-menu-btn ${activeClass("/admin/offers")}`}
                onClick={() => setMenuOpen(false)}
              >
                Manage Offers
              </Button>

              <Button
                className="mobile-logout-btn"
                onClick={() => {
                  logoutAdmin();
                  setMenuOpen(false);
                  navigate("/admin/login");
                }}
              >
                Logout
              </Button>
            </>
          )}

          {!user && !admin && (
            <Button
              component={Link}
              to="/user/login"
              className="mobile-menu-btn login-btn"
              onClick={() => setMenuOpen(false)}
            >
              Login
            </Button>
          )}
        </Box>
      )}

      {/* MOBILE SEARCH MODAL */}
      {mobileSearchOpen && !admin && (
        <Box
          className="mobile-search-modal"
          sx={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: "rgba(255,255,255,0.98)",
            zIndex: 9999,
            p: 2,
            display: "flex",
            flexDirection: "column"
          }}
        >
          <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
            <IconButton onClick={() => setMobileSearchOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Box>

          <TextField
            autoFocus
            fullWidth
            size="medium"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                applyFilters(null, search, categoryId);
                setMobileSearchOpen(false);
              }
            }}
            InputProps={{
              sx: { background: "#fff", borderRadius: "8px", mt: 2 },
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => {
                      applyFilters(null, search, categoryId);
                      setMobileSearchOpen(false);
                    }}
                  >
                    <SearchIcon />
                  </IconButton>
                </InputAdornment>
              )
            }}
          />

          {recentSearches.length > 0 && (
            <Box sx={{ mt: 3 }}>
              <strong>Recent Searches</strong>
              <ul style={{ marginTop: "10px", paddingLeft: "20px" }}>
                {recentSearches.map((item, index) => (
                  <li
                    key={index}
                    onClick={() => {
                      setSearch(item);
                      applyFilters(null, item, categoryId);
                      setMobileSearchOpen(false);
                    }}
                    style={{ cursor: "pointer" }}
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </Box>
          )}
        </Box>
      )}
    </AppBar>
  );
}
