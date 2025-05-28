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
  MenuItem,
  DialogActions,
  TextField,
} from "@mui/material";
import { useState } from "react";
import { toast } from "react-toastify";

function TransactionManagement() {
  const queryClient = useQueryClient();
  const [openBorrow, setOpenBorrow] = useState(false);
  const [openStatus, setOpenStatus] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);

  // Form states
  const [userId, setUserId] = useState("");
  const [bookId, setBookId] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [status, setStatus] = useState("Borrowed");

  const { data: transactions, isLoading } = useQuery(
    "transactions",
    async () => {
      const response = await axios.get("/api/transactions", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      return response.data.transactions;
    }
  );

  const borrowBook = useMutation(
    (data) =>
      axios.post("/api/transactions/borrow", data, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries("transactions");
        toast.success("Book borrowed successfully");
        setOpenBorrow(false);
        resetBorrowForm();
      },
      onError: () => toast.error("Failed to borrow book"),
    }
  );

  const returnBook = useMutation(
    (transactionId) =>
      axios.post(
        `/api/transactions/return/${transactionId}`,
        {},
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      ),
    {
      onSuccess: () => {
        queryClient.invalidateQueries("transactions");
        toast.success("Book returned successfully");
      },
      onError: () => toast.error("Failed to return book"),
    }
  );

  const updateStatus = useMutation(
    ({ id, status }) =>
      axios.put(
        `/api/transactions/${id}`,
        { status },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      ),
    {
      onSuccess: () => {
        queryClient.invalidateQueries("transactions");
        toast.success("Status updated successfully");
        setOpenStatus(false);
      },
      onError: (error) => {
        console.error("Error updating status:", error);
        toast.error("Failed to update status");
      },
    }
  );

  const resetBorrowForm = () => {
    setUserId("");
    setBookId("");
    setDueDate("");
  };

  const handleBorrow = () => {
    setOpenBorrow(true);
    resetBorrowForm();
  };

  const handleStatusUpdate = (transaction) => {
    setSelectedTransaction(transaction);
    setStatus(transaction.Status || "Borrowed");
    setOpenStatus(true);
    console.log("Selected transaction for update:", transaction);
  };

  const handleBorrowSubmit = () => {
    if (!userId || !bookId) {
      toast.error("User ID and Book ID are required");
      return;
    }

    const data = {
      userId,
      bookId,
      dueDate: dueDate || undefined,
    };

    console.log("Submitting borrow request:", data);
    borrowBook.mutate(data);
  };

  const handleStatusSubmit = () => {
    console.log("Submitting status update:", status);
    console.log("For transaction:", selectedTransaction);

    if (!selectedTransaction) {
      console.error("No transaction selected");
      toast.error("No transaction selected");
      return;
    }

    updateStatus.mutate({
      id: selectedTransaction.TransactionID,
      status: status,
    });
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <>
      <Button onClick={handleBorrow}>Borrow Book</Button>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>ID</TableCell>
            <TableCell>User</TableCell>
            <TableCell>Book</TableCell>
            <TableCell>Borrow Date</TableCell>
            <TableCell>Due Date</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Fine</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {transactions?.map((transaction) => (
            <TableRow key={transaction.TransactionID}>
              <TableCell>{transaction.TransactionID}</TableCell>
              <TableCell>{transaction.UserName}</TableCell>
              <TableCell>{transaction.BookTitle}</TableCell>
              <TableCell>
                {new Date(transaction.BorrowDate).toLocaleDateString()}
              </TableCell>
              <TableCell>
                {new Date(transaction.DueDate).toLocaleDateString()}
              </TableCell>
              <TableCell>{transaction.Status}</TableCell>
              <TableCell>${transaction.FineAmount || 0}</TableCell>
              <TableCell>
                {transaction.Status !== "Returned" && (
                  <>
                    <Button
                      onClick={() =>
                        returnBook.mutate(transaction.TransactionID)
                      }
                    >
                      Return
                    </Button>
                    <Button onClick={() => handleStatusUpdate(transaction)}>
                      Update Status
                    </Button>
                  </>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Borrow Book Dialog */}
      <Dialog open={openBorrow} onClose={() => setOpenBorrow(false)}>
        <DialogTitle>Borrow Book</DialogTitle>
        <DialogContent>
          <TextField
            margin="normal"
            fullWidth
            label="User ID"
            type="number"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
          />
          <TextField
            margin="normal"
            fullWidth
            label="Book ID"
            type="number"
            value={bookId}
            onChange={(e) => setBookId(e.target.value)}
          />
          <TextField
            margin="normal"
            fullWidth
            label="Due Date"
            type="date"
            InputLabelProps={{ shrink: true }}
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenBorrow(false)}>Cancel</Button>
          <Button onClick={handleBorrowSubmit}>Borrow</Button>
        </DialogActions>
      </Dialog>

      {/* Update Status Dialog */}
      <Dialog open={openStatus} onClose={() => setOpenStatus(false)}>
        <DialogTitle>Update Transaction Status</DialogTitle>
        <DialogContent>
          <TextField
            margin="normal"
            fullWidth
            select
            label="Status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <MenuItem value="Borrowed">Borrowed</MenuItem>
            <MenuItem value="Returned">Returned</MenuItem>
            <MenuItem value="Overdue">Overdue</MenuItem>
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenStatus(false)}>Cancel</Button>
          <Button onClick={handleStatusSubmit}>Update</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default TransactionManagement;
