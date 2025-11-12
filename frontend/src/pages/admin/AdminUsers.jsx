import React, { useEffect, useState } from "react";
import {
  Table, TableHead, TableRow, TableCell, TableBody,
  Typography, IconButton, Stack
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import API from "../../api/api";

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
    <div>
      <Typography variant="h4" sx={{ mb: 2 }}>Users</Typography>

      <Table>
        <TableHead>
          <TableRow>
            <TableCell><strong>Name</strong></TableCell>
            <TableCell><strong>Email</strong></TableCell>
            <TableCell><strong>Phone</strong></TableCell>
            <TableCell><strong>Joined</strong></TableCell>
            <TableCell><strong>Action</strong></TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {users.map((u) => (
            <TableRow key={u._id}>
              <TableCell>{u.name}</TableCell>
              <TableCell>{u.email}</TableCell>
              <TableCell>{u.phone || "-"}</TableCell>
              <TableCell>{new Date(u.createdAt).toLocaleDateString()}</TableCell>
              <TableCell>
                <Stack direction="row">
                  <IconButton color="error" onClick={() => deleteUser(u._id)}>
                    <DeleteIcon />
                  </IconButton>
                </Stack>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
