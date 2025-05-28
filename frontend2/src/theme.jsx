import {
  createTheme,
  ThemeProvider as MUIThemeProvider,
} from "@mui/material/styles";

const theme = createTheme({
  palette: {
    primary: {
      main: "#4a6fee", // Bright blue for primary elements
      light: "#7b9bff",
      dark: "#1846bb",
      contrastText: "#ffffff",
    },
    secondary: {
      main: "#ff6b6b", // Coral accent color for highlights
      light: "#ff9898",
      dark: "#c73e3e",
      contrastText: "#ffffff",
    },
    background: {
      default: "#f5f7fa",
      paper: "#ffffff",
    },
    tableHeader: {
      main: "#edf2ff", // Light blue for table headers
      text: "#1a237e", // Dark blue text in headers
    },
    success: {
      main: "#2ecc71",
    },
    warning: {
      main: "#f39c12",
    },
    error: {
      main: "#e74c3c",
    },
    info: {
      main: "#3498db",
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 600,
      fontSize: "clamp(1.8rem, 4vw, 2.5rem)", // Responsive font size
    },
    h2: {
      fontWeight: 600,
      fontSize: "clamp(1.6rem, 3.5vw, 2rem)",
    },
    h3: {
      fontWeight: 600,
      fontSize: "clamp(1.4rem, 3vw, 1.75rem)",
    },
    h4: {
      fontWeight: 500,
      fontSize: "clamp(1.2rem, 2.5vw, 1.5rem)",
    },
    h5: {
      fontWeight: 500,
      fontSize: "clamp(1.1rem, 2vw, 1.25rem)",
    },
    h6: {
      fontWeight: 500,
      fontSize: "clamp(1rem, 1.5vw, 1.1rem)",
    },
    body1: {
      fontSize: "clamp(0.875rem, 1vw, 1rem)",
    },
    body2: {
      fontSize: "clamp(0.8rem, 0.9vw, 0.875rem)",
    },
    button: {
      textTransform: "none",
    },
  },
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 960,
      lg: 1280,
      xl: 1920,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: "6px",
          padding: "8px 16px",
          transition: "all 0.2s ease",
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: "8px",
          overflow: "hidden",
          boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
        },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          backgroundColor: "#edf2ff", // Light blue background for table headers
          "& .MuiTableCell-head": {
            backgroundColor: "#edf2ff",
            color: "#1a237e", // Dark blue text
            fontWeight: 600,
            fontSize: "0.95rem",
            padding: "16px",
            whiteSpace: "nowrap",
          },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          padding: "12px 16px",
          "@media (max-width: 600px)": {
            padding: "8px 12px",
            fontSize: "0.875rem",
          },
        },
        head: {
          fontWeight: 600,
        },
      },
    },
    MuiTable: {
      styleOverrides: {
        root: {
          tableLayout: "auto",
          "@media (max-width: 600px)": {
            tableLayout: "fixed",
          },
        },
      },
    },
    MuiTableContainer: {
      styleOverrides: {
        root: {
          overflowX: "auto",
          "&::-webkit-scrollbar": {
            height: "6px",
          },
          "&::-webkit-scrollbar-thumb": {
            borderRadius: "3px",
            backgroundColor: "rgba(0,0,0,0.1)",
          },
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          "&:nth-of-type(even)": {
            backgroundColor: "rgba(0,0,0,0.02)",
          },
          "&:hover": {
            backgroundColor: "rgba(74,111,238,0.05)",
          },
        },
      },
    },
    MuiPagination: {
      styleOverrides: {
        ul: {
          justifyContent: "center",
          marginTop: "16px",
          "@media (max-width: 600px)": {
            "& .MuiPaginationItem-root": {
              minWidth: "30px",
              height: "30px",
              fontSize: "0.8rem",
            },
          },
        },
      },
    },
  },
});

// You'll need to include Inter font in your HTML head or import it in your CSS
// <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">

function ThemeProvider({ children }) {
  return <MUIThemeProvider theme={theme}>{children}</MUIThemeProvider>;
}

export default ThemeProvider;
