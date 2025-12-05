import React, { useEffect, useState } from "react";
import API from "../../api/api";
import { Button } from "react-bootstrap";
import DeleteIcon from "@mui/icons-material/Delete";
import "./AdminUsers.css";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);

  const loadUsers = async () => {
    try {
      const { data } = await API.get("/users");
      setUsers(data);
    } catch (err) {
      console.log("USERS LOAD ERROR:", err.response?.data?.message);
    }
  };

  const deleteUser = async (id) => {
    if (!window.confirm("Delete this user?")) return;
    await API.delete(`/users/${id}`);
    loadUsers();
  };

  useEffect(() => {
    loadUsers();
  }, []);

  return (
    <div className="container-fluid admin-users-wrapper py-3">

      {/* HERO */}
      <div className="admin-users-hero text-center mb-4">
        <h2 className="hero-title">Manage Users</h2>
        <p className="hero-subtitle">View, monitor, and manage all registered users</p>
      </div>

      {/* TABLE SECTION */}
      <div className="table-responsive shadow-sm rounded admin-users-table-container">
        <table className="table table-bordered table-hover text-center align-middle admin-users-table">
          <thead className="table-header">
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Joined</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {users.map((u) => (
              <tr key={u._id}>
                <td>{u.name}</td>
                <td>{u.email}</td>
                <td>{u.phone || "-"}</td>
                <td>{new Date(u.createdAt).toLocaleDateString()}</td>

                <td>
                  <button
                    className="btn btn-sm btn-delete-user"
                    onClick={() => deleteUser(u._id)}
                  >
                    <DeleteIcon fontSize="small" /> Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {users.length === 0 && (
        <p className="text-center text-muted mt-3">No users found.</p>
      )}
    </div>
  );
}
