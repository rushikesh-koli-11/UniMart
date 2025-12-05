import React, { useContext, useState } from "react";
import { UserAuthContext } from "../contexts/UserAuthContext";
import {
  Typography,
  TextField,
  Button,
  Alert,
  Stack,
} from "@mui/material";
import "./UserDashboard.css";

export default function UserDashboard() {
  const {
    user,
    updateUser,
    addAddress,
    removeAddress,
    setDefaultAddress,
  } = useContext(UserAuthContext);

  if (!user) return <Typography>Loading...</Typography>;

  const addresses = user.addresses || [];

  /* PROFILE STATE */
  const [profile, setProfile] = useState({
    name: user.name || "",
    email: user.email || "",
    phone: user.phone || "",
  });

  const [msg, setMsg] = useState("");

  const saveAllChanges = async () => {
    await updateUser(profile);

    if (newAddr.address.trim()) {
      await addAddress(newAddr);
      setNewAddr({ label: "Home", address: "" });
    }

    setMsg("Changes saved successfully!");
    setTimeout(() => setMsg(""), 2000);
  };

  /* NEW ADDRESS */
  const [newAddr, setNewAddr] = useState({
    label: "Home",
    address: "",
  });

  /* COLLAPSE */
  const [openIndex, setOpenIndex] = useState(null);
  const toggleOpen = (i) => setOpenIndex(openIndex === i ? null : i);

  return (
    <div className="container py-3">

      {/* HERO */}
      <section className="ud-hero mb-4 text-center">
        <h1>
          My <span>Account</span>
        </h1>
        <p className="mt-2">Manage your personal details and delivery addresses.</p>
      </section>

      <section className="row justify-content-center">
        <div className="col-lg-8 col-md-10 col-12">

          {/* CARD */}
          <div className="profile-card styled-card">

            {msg && <Alert severity="success">{msg}</Alert>}

            {/* PROFILE DETAILS */}
            <h3 className="sub-title mt-3">Profile Details</h3>

            <Stack spacing={2} className="ud-form">
              <TextField
                label="Full Name"
                fullWidth
                value={profile.name}
                onChange={(e) =>
                  setProfile({ ...profile, name: e.target.value })
                }
              />

              <TextField
                label="Email"
                fullWidth
                value={profile.email}
                onChange={(e) =>
                  setProfile({ ...profile, email: e.target.value })
                }
              />

              <TextField
                label="Mobile Number"
                fullWidth
                value={profile.phone}
                disabled
              />

              <Typography variant="body2">
                Member Since:{" "}
                <b>{new Date(user.createdAt).toLocaleDateString()}</b>
              </Typography>
            </Stack>

            <hr className="divider" />

            {/* ADDRESS LIST */}
            <h3 className="sub-title">Saved Addresses</h3>

            {addresses.length === 0 && (
              <Alert severity="info">No saved addresses found.</Alert>
            )}

            <div className="address-compact-list">
              {addresses.map((a, i) => {
                const isOpen = openIndex === i;

                return (
                  <div className="compact-item" key={a._id}>
                    <div
                      className="compact-head"
                      onClick={() => toggleOpen(i)}
                    >
                      <div className="ch-left">
                        <span className="ch-icon">
                          {a.label === "Home"
                            ? "🏠"
                            : a.label === "Office"
                            ? "🏢"
                            : "📦"}
                        </span>

                        <div>
                          <p className="ch-title">
                            {a.label}
                            {a.isDefault && (
                              <span className="ch-default">DEFAULT</span>
                            )}
                          </p>

                          <p className="ch-short">
                            {a.address.length > 40
                              ? a.address.slice(0, 40) + "..."
                              : a.address}
                          </p>
                        </div>
                      </div>

                      <div
                        className="ch-right-icons"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <span
                          className="action-icon edit-icon"
                          onClick={() => {
                            setNewAddr({
                              label: a.label,
                              address: a.address,
                            });
                          }}
                        >
                          ✏️
                        </span>

                        <span
                          className="action-icon delete-icon"
                          onClick={() => removeAddress(a._id)}
                        >
                          🗑
                        </span>
                      </div>
                    </div>

                    <div
                      className="compact-body"
                      style={{ maxHeight: isOpen ? "180px" : "0px" }}
                    >
                      <p className="ch-full">{a.address}</p>

                      <div className="ch-actions">
                        {!a.isDefault && (
                          <Button
                            className="primary-outline-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              setDefaultAddress(a._id);
                            }}
                          >
                            Set Default
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <hr className="divider" />

            {/* ADD NEW ADDRESS */}
            <h3 className="sub-title">Add / Edit Address</h3>

            <Stack spacing={2} className="ud-form">
              <select
                className="ud-select"
                value={newAddr.label}
                onChange={(e) =>
                  setNewAddr({ ...newAddr, label: e.target.value })
                }
              >
                <option value="Home">Home</option>
                <option value="Office">Office</option>
                <option value="Other">Other</option>
              </select>

              <TextField
                label="Address"
                fullWidth
                multiline
                rows={2}
                value={newAddr.address}
                error={!newAddr.address.trim() && newAddr.address.length > 0}
                helperText={
                  !newAddr.address.trim() && newAddr.address.length > 0
                    ? "Address cannot be empty"
                    : ""
                }
                onChange={(e) =>
                  setNewAddr({ ...newAddr, address: e.target.value })
                }
              />
            </Stack>

            <hr className="divider" />

            {/* ONE BUTTON */}
            <div className="text-center my-3">
              <Button
                className="primary-btn big-save-btn w-100"
                onClick={saveAllChanges}
              >
                Save Changes
              </Button>
            </div>

          </div>
        </div>
      </section>
    </div>
  );
}
