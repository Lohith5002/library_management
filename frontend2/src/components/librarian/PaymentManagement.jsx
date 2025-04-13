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
  MenuItem,
} from "@mui/material";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";

function PaymentManagement() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const { register, handleSubmit, reset } = useForm();

  const { data: payments, isLoading } = useQuery("payments", async () => {
    const response = await axios.get("/api/payments", {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    return response.data.payments;
  });

  const createPayment = useMutation(
    (data) =>
      axios.post("/api/payments", data, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries("payments");
        toast.success("Payment created successfully");
        setOpen(false);
        reset();
      },
      onError: () => toast.error("Failed to create payment"),
    }
  );

  const handleCreate = () => {
    setOpen(true);
    reset();
  };

  const onSubmit = (data) => {
    createPayment.mutate(data);
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <>
      <Button onClick={handleCreate}>Create Payment</Button>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>User</TableCell>
            <TableCell>Book</TableCell>
            <TableCell>Amount</TableCell>
            <TableCell>Method</TableCell>
            <TableCell>Date</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {payments?.map((payment) => (
            <TableRow key={payment.PaymentID}>
              <TableCell>{payment.UserName}</TableCell>
              <TableCell>{payment.BookTitle || "N/A"}</TableCell>
              <TableCell>${payment.AmountPaid}</TableCell>
              <TableCell>{payment.PaymentMethod}</TableCell>
              <TableCell>
                {new Date(payment.PaymentDate).toLocaleDateString()}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>Create Payment</DialogTitle>
        <DialogContent>
          <Box
            component="form"
            onSubmit={handleSubmit(onSubmit)}
            sx={{ mt: 1 }}
          >
            <TextField
              margin="normal"
              fullWidth
              label="User ID"
              type="number"
              {...register("userId", { required: true })}
            />
            <TextField
              margin="normal"
              fullWidth
              label="Transaction ID"
              type="number"
              {...register("transactionId", { required: true })}
            />
            <TextField
              margin="normal"
              fullWidth
              label="Amount Paid"
              type="number"
              {...register("amountPaid", { required: true })}
            />
            <TextField
              margin="normal"
              fullWidth
              select
              label="Payment Method"
              defaultValue="Cash"
              {...register("paymentMethod", { required: true })}
            >
              <MenuItem value="Cash">Cash</MenuItem>
              <MenuItem value="Card">Card</MenuItem>
              <MenuItem value="Online">Online</MenuItem>
            </TextField>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button type="submit" onClick={handleSubmit(onSubmit)}>
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default PaymentManagement;
