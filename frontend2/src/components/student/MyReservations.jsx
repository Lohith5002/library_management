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

function MyReservations() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: reservations, isLoading } = useQuery(
    ["reservations", user.id],
    async () => {
      const response = await axios.get(`/api/reservations/user/${user.id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      return response.data.reservations;
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
        queryClient.invalidateQueries(["reservations", user.id]);
        toast.success("Reservation cancelled successfully");
      },
      onError: () => toast.error("Failed to cancel reservation"),
    }
  );

  if (isLoading) return <div>Loading...</div>;

  return (
    <Table>
      <TableHead>
        <TableRow>
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
            <TableCell>{reservation.BookTitle}</TableCell>
            <TableCell>
              {new Date(reservation.ReservedAt).toLocaleDateString()}
            </TableCell>
            <TableCell>
              {new Date(reservation.ExpiryDate).toLocaleDateString()}
            </TableCell>
            <TableCell>{reservation.Status}</TableCell>
            <TableCell>
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
  );
}

export default MyReservations;
