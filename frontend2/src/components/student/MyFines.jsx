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

function MyFines() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: fines, isLoading } = useQuery(["fines", user.id], async () => {
    const response = await axios.get(`/api/fines/user/${user.id}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    return response.data.fines;
  });

  const payFine = useMutation(
    (fineId) =>
      axios.post(
        `/api/fines/${fineId}/pay`,
        { paymentMethod: "Cash" },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      ),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["fines", user.id]);
        toast.success("Fine paid successfully");
      },
      onError: () => toast.error("Failed to pay fine"),
    }
  );

  if (isLoading) return <div>Loading...</div>;

  return (
    <Table>
      <TableHead>
        <TableRow>
          <TableCell>Book</TableCell>
          <TableCell>Amount</TableCell>
          <TableCell>Status</TableCell>
          <TableCell>Actions</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {fines?.map((fine) => (
          <TableRow key={fine.FineID}>
            <TableCell>{fine.BookTitle}</TableCell>
            <TableCell>${fine.Amount}</TableCell>
            <TableCell>{fine.Status}</TableCell>
            <TableCell>
              {fine.Status === "Unpaid" && (
                <Button onClick={() => payFine.mutate(fine.FineID)}>Pay</Button>
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

export default MyFines;
