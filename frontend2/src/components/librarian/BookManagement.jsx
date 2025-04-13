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
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  TextField,
} from "@mui/material";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";

function BookManagement() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);
  const { register, handleSubmit, reset } = useForm();

  const { data: books, isLoading } = useQuery("books", async () => {
    const response = await axios.get("/api/books", {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    return response.data.books;
  });

  const createBook = useMutation(
    (data) =>
      axios.post("/api/books", data, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries("books");
        toast.success("Book created successfully");
        setOpen(false);
        reset();
      },
      onError: () => toast.error("Failed to create book"),
    }
  );

  const updateBook = useMutation(
    ({ id, data }) =>
      axios.put(`/api/books/${id}`, data, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries("books");
        toast.success("Book updated successfully");
        setOpen(false);
        reset();
      },
      onError: () => toast.error("Failed to update book"),
    }
  );

  const deleteBook = useMutation(
    (bookId) =>
      axios.delete(`/api/books/${bookId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries("books");
        toast.success("Book deleted successfully");
      },
      onError: () => toast.error("Failed to delete book"),
    }
  );

  const handleCreate = () => {
    setIsEdit(false);
    setOpen(true);
    reset();
  };

  const handleEdit = (book) => {
    setIsEdit(true);
    setSelectedBook(book);
    setOpen(true);
    reset({
      title: book.Title,
      author: book.Author,
      isbn: book.ISBN,
      publicationYear: book.PublicationYear,
      publisher: book.Publisher,
      totalCopies: book.TotalCopies,
      categoryId: book.CategoryID,
    });
  };

  const onSubmit = (data) => {
    if (isEdit) {
      updateBook.mutate({ id: selectedBook.BookID, data });
    } else {
      createBook.mutate(data);
    }
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <>
      <Button onClick={handleCreate}>Add Book</Button>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>BookID</TableCell>
            <TableCell>Title</TableCell>
            <TableCell>Author</TableCell>
            <TableCell>ISBN</TableCell>
            <TableCell>Category</TableCell>
            <TableCell>Copies</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {books?.map((book) => (
            <TableRow key={book.BookID}>
              <TableCell>{book.BookID}</TableCell>
              <TableCell>{book.Title}</TableCell>
              <TableCell>{book.Author}</TableCell>
              <TableCell>{book.ISBN}</TableCell>
              <TableCell>{book.CategoryName}</TableCell>
              <TableCell>
                {book.AvailableCopies}/{book.TotalCopies}
              </TableCell>
              <TableCell>
                <Button onClick={() => handleEdit(book)}>Edit</Button>
                <Button
                  color="error"
                  onClick={() => deleteBook.mutate(book.BookID)}
                >
                  Delete
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>{isEdit ? "Edit Book" : "Add Book"}</DialogTitle>
        <DialogContent>
          <Box
            component="form"
            onSubmit={handleSubmit(onSubmit)}
            sx={{ mt: 1 }}
          >
            <TextField
              margin="normal"
              fullWidth
              label="Title"
              {...register("title", { required: true })}
            />
            <TextField
              margin="normal"
              fullWidth
              label="Author"
              {...register("author", { required: true })}
            />
            <TextField
              margin="normal"
              fullWidth
              label="ISBN"
              {...register("isbn")}
            />
            <TextField
              margin="normal"
              fullWidth
              label="Publication Year"
              type="number"
              {...register("publicationYear")}
            />
            <TextField
              margin="normal"
              fullWidth
              label="Publisher"
              {...register("publisher")}
            />
            <TextField
              margin="normal"
              fullWidth
              label="Total Copies"
              type="number"
              {...register("totalCopies", { required: true })}
            />
            <TextField
              margin="normal"
              fullWidth
              label="Category ID"
              type="number"
              {...register("categoryId")}
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

export default BookManagement;
