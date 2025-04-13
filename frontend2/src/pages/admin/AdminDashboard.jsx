import { Container, Box, Toolbar } from "@mui/material";
import { Routes, Route } from "react-router-dom";
import Sidebar from "../../components/common/Sidebar";
import Header from "../../components/common/Header";
import UserManagement from "../../components/admin/UserManagement";
import ReportManagement from "../../components/admin/ReportManagement";
import BookManagement from "../../components/librarian/BookManagement";
import CategoryManagement from "../../components/librarian/CategoryManagement";
import TransactionManagement from "../../components/librarian/TransactionManagement";
import FineManagement from "../../components/librarian/FineManagement";
import PaymentManagement from "../../components/librarian/PaymentManagement";

function AdminDashboard() {
  return (
    <Box sx={{ display: "flex" }}>
      <Header />
      <Sidebar role="Admin" />
      <Box component="main" sx={{ flexGrow: 1, p: 3, pt: 8 }}>
        <Toolbar />
        <Container>
          <Routes>
            <Route path="users" element={<UserManagement />} />
            <Route path="reports" element={<ReportManagement />} />
            <Route path="books" element={<BookManagement />} />
            <Route path="categories" element={<CategoryManagement />} />
            <Route path="transactions" element={<TransactionManagement />} />
            <Route path="fines" element={<FineManagement />} />
            <Route path="payments" element={<PaymentManagement />} />
          </Routes>
        </Container>
      </Box>
    </Box>
  );
}

export default AdminDashboard;
