import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
} from "@mui/material";
import {
  People,
  Book,
  Category,
  History,
  Receipt,
  Payment,
  Report,
  ExitToApp,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

function Sidebar({ role }) {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const adminMenu = [
    { text: "Users", icon: <People />, path: "/admin/users" },
    { text: "Reports", icon: <Report />, path: "/admin/reports" },
    { text: "Books", icon: <Book />, path: "/admin/books" },
    { text: "Categories", icon: <Category />, path: "/admin/categories" },
    { text: "Transactions", icon: <History />, path: "/admin/transactions" },
    { text: "Fines", icon: <Receipt />, path: "/admin/fines" },
    { text: "Payments", icon: <Payment />, path: "/admin/payments" },
  ];

  const librarianMenu = [
    { text: "Books", icon: <Book />, path: "/librarian/books" },
    { text: "Categories", icon: <Category />, path: "/librarian/categories" },
    {
      text: "Transactions",
      icon: <History />,
      path: "/librarian/transactions",
    },
    {
      text: "Reservations",
      icon: <History />,
      path: "/librarian/reservations",
    },
    { text: "Fines", icon: <Receipt />, path: "/librarian/fines" },
    { text: "Payments", icon: <Payment />, path: "/librarian/payments" },
    { text: "Reports", icon: <Report />, path: "/librarian/reports" },
  ];

  const studentMenu = [
    { text: "Books", icon: <Book />, path: "/student/books" },
    {
      text: "My Transactions",
      icon: <History />,
      path: "/student/transactions",
    },
    {
      text: "My Reservations",
      icon: <History />,
      path: "/student/reservations",
    },
    { text: "My Fines", icon: <Receipt />, path: "/student/fines" },
    { text: "My Payments", icon: <Payment />, path: "/student/payments" },
  ];

  const menuItems =
    role === "Admin"
      ? adminMenu
      : role === "Librarian"
      ? librarianMenu
      : studentMenu;

  return (
    <Drawer variant="permanent" sx={{ width: 240, flexShrink: 0 }}>
      <List sx={{ pt: 8 }}>
        {menuItems.map((item) => (
          <ListItem button key={item.text} onClick={() => navigate(item.path)}>
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItem>
        ))}
      </List>
      <Divider />
      <List>
        <ListItem button onClick={logout}>
          <ListItemIcon>
            <ExitToApp />
          </ListItemIcon>
          <ListItemText primary="Logout" />
        </ListItem>
      </List>
    </Drawer>
  );
}

export default Sidebar;
