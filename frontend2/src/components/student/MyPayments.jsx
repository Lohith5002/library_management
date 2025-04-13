import { useQuery } from "react-query";
import axios from "axios";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@mui/material";
import { useAuth } from "../../context/AuthContext";

function MyPayments() {
  const { user } = useAuth();

  const { data: payments, isLoading } = useQuery(
    ["payments", user.id],
    async () => {
      const response = await axios.get(`/api/payments/user/${user.id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      return response.data.payments;
    }
  );

  if (isLoading) return <div>Loading...</div>;

  return (
    <Table>
      <TableHead>
        <TableRow>
          <TableCell>Book</TableCell>
          <TableCell>Amount</TableCell>
          <TableCell>Payment Method</TableCell>
          <TableCell>Date</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {payments?.map((payment) => (
          <TableRow key={payment.PaymentID}>
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
  );
}

export default MyPayments;
