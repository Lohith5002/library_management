import { useQuery, useMutation, useQueryClient } from "react-query";
import axios from "axios";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Button,
  Dialog,
  MenuItem,
  Box,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from "@mui/material";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";

function UserManagement() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const { register, handleSubmit, reset } = useForm();

  const { data: users, isLoading } = useQuery("users", async () => {
    const response = await axios.get("/api/users", {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    return response.data.users;
  });

  const deleteUser = useMutation(
    (userId) =>
      axios.delete(`/api/users/${userId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries("users");
        toast.success("User deleted successfully");
      },
      onError: () => toast.error("Failed to delete user"),
    }
  );

  const updateUser = useMutation(
    ({ id, data }) =>
      axios.put(`/api/users/${id}`, data, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries("users");
        toast.success("User updated successfully");
        setOpen(false);
        reset();
      },
      onError: () => toast.error("Failed to update user"),
    }
  );

  const handleEdit = (user) => {
    setSelectedUser(user);
    setOpen(true);
    reset({ name: user.Name, email: user.Email, role: user.Role });
  };

  const onSubmit = (data) => {
    updateUser.mutate({ id: selectedUser.UserID, data });
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>UserID</TableCell>
            <TableCell>Name</TableCell>
            <TableCell>Email</TableCell>
            <TableCell>Role</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {users?.map((user) => (
            <TableRow key={user.UserID}>
              <TableCell>{user.UserID}</TableCell>
              <TableCell>{user.Name}</TableCell>
              <TableCell>{user.Email}</TableCell>
              <TableCell>{user.Role}</TableCell>
              <TableCell>
                <Button onClick={() => handleEdit(user)}>Edit</Button>
                <Button
                  color="error"
                  onClick={() => deleteUser.mutate(user.UserID)}
                >
                  Delete
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>Edit User</DialogTitle>
        <DialogContent>
          <Box
            component="form"
            onSubmit={handleSubmit(onSubmit)}
            sx={{ mt: 1 }}
          >
            <TextField
              margin="normal"
              fullWidth
              label="Name"
              {...register("name", { required: true })}
            />
            <TextField
              margin="normal"
              fullWidth
              label="Email"
              {...register("email", { required: true })}
            />
            <TextField
              margin="normal"
              fullWidth
              select
              label="Role"
              {...register("role", { required: true })}
            >
              <MenuItem value="Student">Student</MenuItem>
              <MenuItem value="Librarian">Librarian</MenuItem>
              <MenuItem value="Admin">Admin</MenuItem>
            </TextField>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button type="submit" onClick={handleSubmit(onSubmit)}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default UserManagement;
