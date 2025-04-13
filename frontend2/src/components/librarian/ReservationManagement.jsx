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
  TextField,
  MenuItem,
} from "@mui/material";
import { useState } from "react";
import { toast } from "react-toastify";

function ReservationManagement() {
  const queryClient = useQueryClient();
  const [openCreate, setOpenCreate] = useState(false);
  const [openStatus, setOpenStatus] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [userId, setUserId] = useState("");
  const [bookId, setBookId] = useState("");
  const [status, setStatus] = useState("Pending");

  const { data: reservations, isLoading } = useQuery(
    "reservations",
    async () => {
      const response = await axios.get("/api/reservations", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      return response.data.reservations;
    }
  );

  const createReservation = useMutation(
    (data) =>
      axios.post("/api/reservations", data, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries("reservations");
        toast.success("Reservation created successfully");
        setOpenCreate(false);
        setUserId("");
        setBookId("");
      },
      onError: () => toast.error("Failed to create reservation"),
    }
  );

  const updateReservationStatus = useMutation(
    ({ id, status }) =>
      axios.put(
        `/api/reservations/${id}/status`,
        { status },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      ),
    {
      onSuccess: () => {
        queryClient.invalidateQueries("reservations");
        toast.success("Reservation status updated successfully");
        setOpenStatus(false);
      },
      onError: (error) => {
        console.error("Error updating status:", error);
        toast.error("Failed to update reservation status");
      },
    }
  );

  const cancelReservation = useMutation(
    (reservationId) =>
      axios.put(
        `/api/reservations/${reservationId}/cancel`,
        {},
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      ),
    {
      onSuccess: () => {
        queryClient.invalidateQueries("reservations");
        toast.success("Reservation cancelled successfully");
      },
      onError: () => toast.error("Failed to cancel reservation"),
    }
  );

  const handleCreate = () => {
    setOpenCreate(true);
    setUserId("");
    setBookId("");
  };

  const handleStatusUpdate = (reservation) => {
    setSelectedReservation(reservation);
    setStatus(reservation.Status || "Pending");
    setOpenStatus(true);
    console.log("Selected reservation for update:", reservation);
  };

  const handleCreateSubmit = () => {
    if (!userId || !bookId) {
      toast.error("User ID and Book ID are required");
      return;
    }
    createReservation.mutate({ userId, bookId });
  };

  const handleStatusSubmit = () => {
    console.log("Submitting status update:", status);
    console.log("For reservation:", selectedReservation);

    if (!selectedReservation) {
      console.error("No reservation selected");
      toast.error("No reservation selected");
      return;
    }

    updateReservationStatus.mutate({
      id: selectedReservation.ReservationID,
      status: status,
    });
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <>
      <Button onClick={handleCreate}>Create Reservation</Button>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>User</TableCell>
            <TableCell>Book</TableCell>
            <TableCell>Reservation Date</TableCell>
            <TableCell>Expiry Date</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {reservations?.map((reservation) => (
            <TableRow key={reservation.ReservationID}>
              <TableCell>{reservation.UserName}</TableCell>
              <TableCell>{reservation.BookTitle}</TableCell>
              <TableCell>
                {new Date(reservation.ReservedAt).toLocaleDateString()}
              </TableCell>
              <TableCell>
                {new Date(reservation.ExpiryDate).toLocaleDateString()}
              </TableCell>
              <TableCell>{reservation.Status}</TableCell>
              <TableCell>
                <Button onClick={() => handleStatusUpdate(reservation)}>
                  Update Status
                </Button>
                {reservation.Status === "Pending" && (
                  <Button
                    color="error"
                    onClick={() =>
                      cancelReservation.mutate(reservation.ReservationID)
                    }
                  >
                    Cancel
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Create Reservation Dialog */}
      <Dialog open={openCreate} onClose={() => setOpenCreate(false)}>
        <DialogTitle>Create Reservation</DialogTitle>
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
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCreate(false)}>Cancel</Button>
          <Button onClick={handleCreateSubmit}>Create</Button>
        </DialogActions>
      </Dialog>

      {/* Update Status Dialog */}
      <Dialog open={openStatus} onClose={() => setOpenStatus(false)}>
        <DialogTitle>Update Reservation Status</DialogTitle>
        <DialogContent>
          <TextField
            margin="normal"
            fullWidth
            select
            label="Status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <MenuItem value="Pending">Pending</MenuItem>
            <MenuItem value="Fulfilled">Fulfilled</MenuItem>
            <MenuItem value="Cancelled">Cancelled</MenuItem>
            <MenuItem value="Expired">Expired</MenuItem>
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

export default ReservationManagement;
