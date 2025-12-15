// Shared Theme Constants for M-Swasth Application
// Reference: Offline Visits Manager Dashboard

export const THEME = {
  primary: "#26a69a",      // Teal
  secondary: "#66bb6a",    // Light Green
  accent: "#ff7043",       // Orange
  success: "#4caf50",      // Green
  warning: "#ffa726",      // Light Orange
  error: "#ef5350",        // Red
  background: "#f5f7fa",   // Light gray
  cardBg: "#ffffff",       // White
  textPrimary: "#26a69a",  // Teal for primary text
  textSecondary: "#546e7a", // Gray for secondary text
  analyticsCardBg: "#1e293b", // Dark slate for analytics cards
  analyticsText: "#ffffff", // White text on dark analytics
  analyticsSecondary: "#94a3b8", // Light gray for analytics secondary text
  analyticsGrid: "#334155", // Grid lines on dark analytics
};

export const CHART_COLORS = [
  THEME.primary,
  THEME.secondary,
  THEME.accent,
  THEME.success,
  THEME.warning
];

export const CARD_STYLES = {
  base: {
    borderRadius: "16px",
    border: `1px solid ${THEME.primary}20`,
    transition: "all 0.3s ease",
    backgroundColor: THEME.cardBg,
  },
  hover: {
    transform: "translateY(-4px)",
    boxShadow: 4,
    borderColor: THEME.primary,
  },
  statistics: {
    borderRadius: "16px",
    height: "140px",
    padding: "24px",
    transition: "all 0.3s ease",
  }
};

export const BUTTON_STYLES = {
  base: {
    borderRadius: "12px",
    textTransform: "none",
    transition: "all 0.3s ease",
  },
  primary: {
    borderRadius: "12px",
    textTransform: "none",
    backgroundColor: THEME.primary,
    '&:hover': {
      backgroundColor: "#1e8a7f",
    }
  },
  secondary: {
    borderRadius: "12px",
    textTransform: "none",
    borderColor: THEME.primary,
    color: THEME.primary,
    '&:hover': {
      borderColor: "#1e8a7f",
      backgroundColor: `${THEME.primary}10`,
    }
  }
};

export const DIALOG_STYLES = {
  borderRadius: "20px",
  maxWidth: "lg",
};

export const ANALYTICS_CARD = {
  backgroundColor: THEME.analyticsCardBg,
  color: THEME.analyticsText,
  borderRadius: "16px",
  padding: "24px",
  boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
};

export const TABLE_STYLES = {
  borderRadius: "8px",
  '& .MuiTableCell-head': {
    backgroundColor: THEME.primary,
    color: '#fff',
    fontWeight: 700,
  },
  '& .MuiTableRow-root:hover': {
    backgroundColor: `${THEME.primary}10`,
  }
};
