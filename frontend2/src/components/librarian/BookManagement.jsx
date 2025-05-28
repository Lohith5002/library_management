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
  MenuItem,
  Select,
  InputLabel,
  FormControl,
} from "@mui/material";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";

function BookManagement() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);
  const [filterCategory, setFilterCategory] = useState("");
  const [filterAuthor, setFilterAuthor] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("title");

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

  const filteredBooks = books
    ?.filter((book) =>
      book.Title.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter((book) =>
      filterCategory ? book.CategoryID === filterCategory : true
    )
    .filter((book) =>
      filterAuthor
        ? book.Author.toLowerCase().includes(filterAuthor.toLowerCase())
        : true
    )
    .sort((a, b) => {
      if (sortBy === "title") {
        return a.Title.localeCompare(b.Title);
      } else if (sortBy === "publicationYear") {
        return a.PublicationYear - b.PublicationYear;
      } else if (sortBy === "availableCopies") {
        return a.AvailableCopies - b.AvailableCopies;
      }
      return 0;
    });

  if (isLoading) return <div>Loading...</div>;

  return (
    <>
      <Button onClick={handleCreate}>Add Book</Button>
      <Box sx={{ display: "flex", gap: 2, marginBottom: 2 }}>
        <TextField
          label="Search by Title"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          fullWidth
        />

        <TextField
          label="Filter by Author"
          value={filterAuthor}
          onChange={(e) => setFilterAuthor(e.target.value)}
          fullWidth
        />
        <FormControl fullWidth>
          <InputLabel>Sort By</InputLabel>
          <Select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            label="Sort By"
          >
            <MenuItem value="title">Title</MenuItem>
            <MenuItem value="publicationYear">Publication Year</MenuItem>
            <MenuItem value="availableCopies">Available Copies</MenuItem>
          </Select>
        </FormControl>
      </Box>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>ID</TableCell>
            <TableCell>Title</TableCell>
            <TableCell>Author</TableCell>
            <TableCell>ISBN</TableCell>
            <TableCell>Category</TableCell>
            <TableCell>Copies</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {filteredBooks?.map((book) => (
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
