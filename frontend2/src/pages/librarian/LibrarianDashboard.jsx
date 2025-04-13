import { Container, Box, Toolbar } from "@mui/material";
import { Routes, Route } from "react-router-dom";
import Sidebar from "../../components/common/Sidebar";
import Header from "../../components/common/Header";
import BookManagement from "../../components/librarian/BookManagement";
import CategoryManagement from "../../components/librarian/CategoryManagement";
import TransactionManagement from "../../components/librarian/TransactionManagement";
import ReservationManagement from "../../components/librarian/ReservationManagement";
import FineManagement from "../../components/librarian/FineManagement";
import PaymentManagement from "../../components/librarian/PaymentManagement";
import ReportManagement from "../../components/admin/ReportManagement";

function LibrarianDashboard() {
  return (
    <Box sx={{ display: "flex" }}>
      <Header />
      <Sidebar role="Librarian" />
      <Box component="main" sx={{ flexGrow: 1, p: 3, pt: 8 }}>
        <Toolbar />
        <Container>
          <Routes>
            <Route path="books" element={<BookManagement />} />
            <Route path="categories" element={<CategoryManagement />} />
            <Route path="transactions" element={<TransactionManagement />} />
            <Route path="reservations" element={<ReservationManagement />} />
            <Route path="fines" element={<FineManagement />} />
            <Route path="payments" element={<PaymentManagement />} />
            <Route path="reports" element={<ReportManagement />} />
          </Routes>
        </Container>
      </Box>
    </Box>
  );
}

export default LibrarianDashboard;
