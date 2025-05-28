import { useQuery, useMutation, useQueryClient } from "react-query";
import axios from "axios";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Button,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from "@mui/material";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";

function CategoryManagement() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const { register, handleSubmit, reset } = useForm();

  const { data: categories, isLoading } = useQuery("categories", async () => {
    const response = await axios.get("/api/categories", {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    return response.data.categories;
  });

  const createCategory = useMutation(
    (data) =>
      axios.post("/api/categories", data, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries("categories");
        toast.success("Category created successfully");
        setOpen(false);
        reset();
      },
      onError: () => toast.error("Failed to create category"),
    }
  );

  const updateCategory = useMutation(
    ({ id, data }) =>
      axios.put(`/api/categories/${id}`, data, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries("categories");
        toast.success("Category updated successfully");
        setOpen(false);
        reset();
      },
      onError: () => toast.error("Failed to update category"),
    }
  );

  const deleteCategory = useMutation(
    (categoryId) =>
      axios.delete(`/api/categories/${categoryId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries("categories");
        toast.success("Category deleted successfully");
      },
      onError: () => toast.error("Failed to delete category"),
    }
  );

  const handleCreate = () => {
    setIsEdit(false);
    setOpen(true);
    reset();
  };

  const handleEdit = (category) => {
    setIsEdit(true);
    setSelectedCategory(category);
    setOpen(true);
    reset({
      categoryName: category.CategoryName,
      description: category.Description,
    });
  };

  const onSubmit = (data) => {
    if (isEdit) {
      updateCategory.mutate({ id: selectedCategory.CategoryID, data });
    } else {
      createCategory.mutate(data);
    }
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <>
      <Button onClick={handleCreate}>Add Category</Button>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>ID</TableCell>
            <TableCell>Name</TableCell>
            <TableCell>Description</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {categories?.map((category) => (
            <TableRow key={category.CategoryID}>
              <TableCell>{category.CategoryID}</TableCell>
              <TableCell>{category.CategoryName}</TableCell>
              <TableCell>{category.Description}</TableCell>
              <TableCell>
                <Button onClick={() => handleEdit(category)}>Edit</Button>
                <Button
                  color="error"
                  onClick={() => deleteCategory.mutate(category.CategoryID)}
                >
                  Delete
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>{isEdit ? "Edit Category" : "Add Category"}</DialogTitle>
        <DialogContent>
          <Box
            component="form"
            onSubmit={handleSubmit(onSubmit)}
            sx={{ mt: 1 }}
          >
            <TextField
              margin="normal"
              fullWidth
              label="Category Name"
              {...register("categoryName", { required: true })}
            />
            <TextField
              margin="normal"
              fullWidth
              label="Description"
              multiline
              rows={4}
              {...register("description")}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button type="submit" onClick={handleSubmit(onSubmit)}>
            {isEdit ? "Update" : "Create"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default CategoryManagement;
