import { Container, Box, Toolbar } from "@mui/material";
import { Routes, Route } from "react-router-dom";
import Sidebar from "../../components/common/Sidebar";
import Header from "../../components/common/Header";
import BookCatalog from "../../components/student/BookCatalog";
import MyTransactions from "../../components/student/MyTransactions";
import MyReservations from "../../components/student/MyReservations";
import MyFines from "../../components/student/MyFines";
import MyPayments from "../../components/student/MyPayments";

function StudentDashboard() {
  return (
    <Box sx={{ display: "flex" }}>
      <Header />
      <Toolbar />
      <Sidebar role="Student" />
      <Box component="main" sx={{ flexGrow: 1, p: 3, pt: 8 }}>
        <Container>
          <Routes>
            <Route path="books" element={<BookCatalog />} />
            <Route path="transactions" element={<MyTransactions />} />
            <Route path="reservations" element={<MyReservations />} />
            <Route path="fines" element={<MyFines />} />
            <Route path="payments" element={<MyPayments />} />
          </Routes>
        </Container>
      </Box>
    </Box>
  );
}

export default StudentDashboard;
