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

function FineManagement() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [selectedFine, setSelectedFine] = useState(null);
  const { register, handleSubmit, reset } = useForm();

  const { data: fines, isLoading } = useQuery("fines", async () => {
    const response = await axios.get("/api/fines", {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    return response.data.fines;
  });

  const payFine = useMutation(
    ({ id, paymentMethod }) =>
      axios.post(
        `/api/fines/${id}/pay`,
        { paymentMethod },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      ),
    {
      onSuccess: () => {
        queryClient.invalidateQueries("fines");
        toast.success("Fine paid successfully");
        setOpen(false);
        reset();
      },
      onError: () => toast.error("Failed to pay fine"),
    }
  );

  const handlePay = (fine) => {
    setSelectedFine(fine);
    setOpen(true);
    reset({ paymentMethod: "Cash" });
  };

  const onSubmit = (data) => {
    payFine.mutate({
      id: selectedFine.FineID,
      paymentMethod: data.paymentMethod,
    });
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>User</TableCell>
            <TableCell>Book</TableCell>
            <TableCell>Amount</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {fines?.map((fine) => (
            <TableRow key={fine.FineID}>
              <TableCell>{fine.UserName}</TableCell>
              <TableCell>{fine.BookTitle}</TableCell>
              <TableCell>${fine.Amount}</TableCell>
              <TableCell>{fine.Status}</TableCell>
              <TableCell>
                {fine.Status === "Unpaid" && (
                  <Button onClick={() => handlePay(fine)}>Pay</Button>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>Pay Fine</DialogTitle>
        <DialogContent>
          <Box
            component="form"
            onSubmit={handleSubmit(onSubmit)}
            sx={{ mt: 1 }}
          >
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
            Pay
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default FineManagement;
