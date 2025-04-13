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

  if (isLoading) return <div>Loading...</div>;

  return (
    <>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Title</TableCell>
            <TableCell>Author</TableCell>
            <TableCell>Category</TableCell>
            <TableCell>Available Copies</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {books?.map((book) => (
            <TableRow key={book.BookID}>
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
