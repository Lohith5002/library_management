import { useQuery, useMutation, useQueryClient } from "react-query";
import axios from "axios";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Button,
} from "@mui/material";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-toastify";

function MyTransactions() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: transactions, isLoading } = useQuery(
    ["transactions", user.id],
    async () => {
      const response = await axios.get(`/api/transactions/my/transactions`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      return response.data.transactions;
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
        queryClient.invalidateQueries(["transactions", user.id]);
        toast.success("Book returned successfully");
      },
      onError: () => toast.error("Failed to return book"),
    }
  );

  if (isLoading) return <div>Loading...</div>;

  return (
    <Table>
      <TableHead>
        <TableRow>
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
                <Button
                  onClick={() => returnBook.mutate(transaction.TransactionID)}
                >
                  Return
                </Button>
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

export default MyTransactions;
