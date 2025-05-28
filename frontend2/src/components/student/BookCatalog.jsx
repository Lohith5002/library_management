import { useQuery, useMutation, useQueryClient } from "react-query";
import axios from "axios";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Button,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Box,
} from "@mui/material";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { useAuth } from "../../context/AuthContext";

function BookCatalog() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [openReserve, setOpenReserve] = useState(false);
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

  const borrowBook = useMutation(
    (bookId) =>
      axios.post(
        "/api/transactions/borrow",
        { bookId, userId: user.id },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      ),
    {
      onSuccess: () => {
        queryClient.invalidateQueries("books");
        toast.success("Book borrowed successfully");
      },
      onError: () => toast.error("Failed to borrow book"),
    }
  );

  const reserveBook = useMutation(
    (bookId) =>
      axios.post(
        "/api/reservations",
        { bookId, userId: user.id },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      ),
    {
      onSuccess: () => {
        queryClient.invalidateQueries("books");
        toast.success("Book reserved successfully");
        setOpenReserve(false);
        reset();
      },
      onError: () => toast.error("Failed to reserve book"),
    }
  );

  const handleReserve = (book) => {
    setSelectedBook(book);
    setOpenReserve(true);
  };

  const onReserveSubmit = () => {
    reserveBook.mutate(selectedBook.BookID);
  };

  // Filter and sort books based on the selected options
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
      } else if (sortBy === "availableCopies") {
        return a.AvailableCopies - b.AvailableCopies;
      } else if (sortBy === "category") {
        return a.CategoryName.localeCompare(b.CategoryName);
      }
      return 0;
    });

  if (isLoading) return <div>Loading...</div>;

  return (
    <>
      <Box
        sx={{ display: "flex", gap: 2, marginBottom: 2, paddingTop: "100px" }}
      >
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
            <MenuItem value="availableCopies">Available Copies</MenuItem>
            <MenuItem value="category">Category</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <Table>
        <TableHead>
          <TableRow>
            <TableCell>ID</TableCell>
            <TableCell>Title</TableCell>
            <TableCell>Author</TableCell>
            <TableCell>Category</TableCell>
            <TableCell>Available Copies</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {filteredBooks?.map((book) => (
            <TableRow key={book.BookID}>
              <TableCell>{book.BookID}</TableCell>
              <TableCell>{book.Title}</TableCell>
              <TableCell>{book.Author}</TableCell>
              <TableCell>{book.CategoryName}</TableCell>
              <TableCell>{book.AvailableCopies}</TableCell>
              <TableCell>
                {book.AvailableCopies > 0 ? (
                  <Button onClick={() => borrowBook.mutate(book.BookID)}>
                    Borrow
                  </Button>
                ) : (
                  <Button onClick={() => handleReserve(book)}>Reserve</Button>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={openReserve} onClose={() => setOpenReserve(false)}>
        <DialogTitle>Reserve Book</DialogTitle>
        <DialogContent>
          <Typography>Reserve "{selectedBook?.Title}"?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenReserve(false)}>Cancel</Button>
          <Button onClick={onReserveSubmit}>Reserve</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default BookCatalog;
