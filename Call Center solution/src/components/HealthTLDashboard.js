import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  collection,
  onSnapshot,
  doc,
  getDoc,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { db } from "../firebaseConfig";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Chip,
  Paper,
  Tabs,
  Tab,
  Button,
  FormControl,
  Select,
  MenuItem,
  TextField,
  InputAdornment,
  IconButton,
  CircularProgress,
  Avatar,
  LinearProgress,
  TablePagination,
  Badge,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Menu,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  InputLabel,
} from "@mui/material";
import {
  Person,
  Circle,
  TrendingUp,
  AccessTime,
  Business,
  Logout as LogoutIcon,
  Group,
  Phone,
  FileDownload,
  Search as SearchIcon,
  PlayArrow,
  PhoneInTalk,
  CheckCircle,
  Cancel,
  Analytics,
  Speed,
  ViewModule,
  ViewList,
  Refresh,
  LocalHospital,
  Healing,
  MedicalServices,
  HealthAndSafety,
  ZoomOutMap,
  MoreVert,
  TableChart,
  Download,
  FilterList,
} from "@mui/icons-material";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend,
  LineChart,
  Line,
} from "recharts";
import AgentView from "./AgentView";

// Custom hook for animated counter
const useAnimatedCounter = (endValue, duration = 1500) => {
  const [count, setCount] = useState(0);
  const countRef = useRef(null);
  const startTimeRef = useRef(null);

  useEffect(() => {
    if (endValue === 0) {
      setCount(0);
      return;
    }

    const animate = (timestamp) => {
      if (!startTimeRef.current) startTimeRef.current = timestamp;
      const progress = Math.min((timestamp - startTimeRef.current) / duration, 1);
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      setCount(Math.floor(easeOutQuart * endValue));

      if (progress < 1) {
        countRef.current = requestAnimationFrame(animate);
      }
    };

    startTimeRef.current = null;
    countRef.current = requestAnimationFrame(animate);

    return () => {
      if (countRef.current) {
        cancelAnimationFrame(countRef.current);
      }
    };
  }, [endValue, duration]);

  return count;
};

// Animated Stat Card Component
const AnimatedStatCard = ({ value, label, icon, gradient, delay = 0 }) => {
  const animatedValue = useAnimatedCounter(value);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <Paper
      elevation={0}
      sx={{
        background: gradient,
        borderRadius: "20px",
        padding: "24px",
        position: "relative",
        overflow: "hidden",
        transform: isVisible ? "translateY(0)" : "translateY(20px)",
        opacity: isVisible ? 1 : 0,
        transition: "all 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: "0 12px 40px rgba(0,0,0,0.15)",
        },
      }}
    >
      {/* Decorative circles */}
      <Box
        sx={{
          position: "absolute",
          top: -20,
          right: -20,
          width: 100,
          height: 100,
          borderRadius: "50%",
          background: "rgba(255,255,255,0.1)",
        }}
      />
      <Box
        sx={{
          position: "absolute",
          bottom: -30,
          left: -30,
          width: 80,
          height: 80,
          borderRadius: "50%",
          background: "rgba(255,255,255,0.05)",
        }}
      />

      <Box sx={{ position: "relative", zIndex: 1 }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            mb: 2,
          }}
        >
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: "12px",
              background: "rgba(255,255,255,0.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backdropFilter: "blur(10px)",
            }}
          >
            {icon}
          </Box>
        </Box>
        <Typography
          variant="h3"
          sx={{
            fontWeight: 800,
            color: "#fff",
            fontSize: "2.5rem",
            lineHeight: 1,
            mb: 1,
          }}
        >
          {animatedValue}
        </Typography>
        <Typography
          variant="body2"
          sx={{
            color: "rgba(255,255,255,0.9)",
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: "1px",
            fontSize: "0.75rem",
          }}
        >
          {label}
        </Typography>
      </Box>
    </Paper>
  );
};

// Health TL Theme Colors (outside component for helper functions)
const HEALTH_TL_THEME = {
  primary: "#14b8a6",
  primaryLight: "#2dd4bf",
  primaryDark: "#0d9488",
  secondary: "#5eead4",
  success: "#10b981",
  warning: "#f59e0b",
  danger: "#ef4444",
  info: "#3b82f6",
  purple: "#8b5cf6",
  pink: "#ec4899",
  gradient: "linear-gradient(135deg, #14b8a6 0%, #0d9488 100%)",
};

// Export to CSV helper
const exportToCSV = (data, filename, columns) => {
  if (!data || data.length === 0) {
    alert("No data to export");
    return;
  }
  const header = columns.join(",");
  const rows = data.map((row) => {
    return columns.map((col) => {
      const value = row[col];
      if (typeof value === "string" && (value.includes(",") || value.includes('"'))) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value ?? "";
    }).join(",");
  });
  const csv = [header, ...rows].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `${filename}_${new Date().toISOString().split("T")[0]}.csv`;
  link.click();
};

// Custom Tooltip for Charts
const CustomChartTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <Paper
        elevation={3}
        sx={{
          p: 1.5,
          borderRadius: "12px",
          bgcolor: "#fff",
          border: `1px solid ${HEALTH_TL_THEME.primary}20`,
        }}
      >
        <Typography variant="subtitle2" fontWeight={700} color={HEALTH_TL_THEME.primary}>
          {label}
        </Typography>
        {payload.map((entry, index) => (
          <Typography key={index} variant="body2" sx={{ color: entry.color }}>
            {entry.name}: {entry.value}
          </Typography>
        ))}
      </Paper>
    );
  }
  return null;
};

// ChartCard Component with expand, table view, and CSV export
const ChartCard = ({ title, children, chartData, columns, chartElement, height = 300 }) => {
  const [expandedOpen, setExpandedOpen] = useState(false);
  const [tableOpen, setTableOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);

  return (
    <Card
      elevation={0}
      sx={{
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 3,
        position: "relative",
        transition: "all 0.3s ease",
        "&:hover": {
          boxShadow: `0 12px 40px ${HEALTH_TL_THEME.primary}15`,
          transform: "translateY(-4px)",
        },
      }}
    >
      <CardContent sx={{ p: 3 }}>
        {/* Header with Title and Actions */}
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
          <Typography variant="h6" fontWeight={700} color={HEALTH_TL_THEME.primary}>
            {title}
          </Typography>
          <Box sx={{ display: "flex", gap: 0.5 }}>
            {/* Direct Expand Button */}
            <Tooltip title="Expand Chart">
              <IconButton
                size="small"
                onClick={() => setExpandedOpen(true)}
                sx={{
                  bgcolor: `${HEALTH_TL_THEME.primary}15`,
                  "&:hover": {
                    bgcolor: HEALTH_TL_THEME.primary,
                    "& .MuiSvgIcon-root": { color: "#fff" }
                  },
                  transition: "all 0.2s ease",
                }}
              >
                <ZoomOutMap sx={{ color: HEALTH_TL_THEME.primary, fontSize: 20 }} />
              </IconButton>
            </Tooltip>
            {/* More Options Menu */}
            <IconButton
              size="small"
              onClick={(e) => setAnchorEl(e.currentTarget)}
              sx={{
                bgcolor: `${HEALTH_TL_THEME.primary}15`,
                "&:hover": { bgcolor: `${HEALTH_TL_THEME.primary}25` },
              }}
            >
              <MoreVert sx={{ color: HEALTH_TL_THEME.primary, fontSize: 20 }} />
            </IconButton>
          </Box>
        </Box>

        {/* Chart Content */}
        <Box sx={{ height }}>{children}</Box>
      </CardContent>

      {/* More Options Menu */}
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
        <MenuItem
          onClick={() => {
            setExpandedOpen(true);
            setAnchorEl(null);
          }}
        >
          <ZoomOutMap sx={{ mr: 1, fontSize: 20, color: HEALTH_TL_THEME.primary }} />
          Expanded View
        </MenuItem>
        <MenuItem
          onClick={() => {
            setTableOpen(true);
            setAnchorEl(null);
          }}
        >
          <TableChart sx={{ mr: 1, fontSize: 20, color: HEALTH_TL_THEME.primary }} />
          Table View
        </MenuItem>
        <MenuItem
          onClick={() => {
            exportToCSV(chartData, title.replace(/\s+/g, "_"), columns);
            setAnchorEl(null);
          }}
        >
          <Download sx={{ mr: 1, fontSize: 20, color: HEALTH_TL_THEME.primary }} />
          Export CSV
        </MenuItem>
      </Menu>

      {/* Expanded View Dialog */}
      <Dialog
        open={expandedOpen}
        onClose={() => setExpandedOpen(false)}
        maxWidth="xl"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: "20px",
            maxHeight: "90vh",
          }
        }}
      >
        <DialogTitle sx={{
          borderBottom: `1px solid ${HEALTH_TL_THEME.primary}20`,
          background: HEALTH_TL_THEME.gradient,
          color: "#fff",
        }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Typography variant="h5" fontWeight={700}>
              {title}
            </Typography>
            <IconButton onClick={() => setExpandedOpen(false)} sx={{ color: "#fff" }}>
              <Cancel />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ p: 4 }}>
          <Box sx={{ width: "100%", height: 550, pt: 2 }}>{chartElement}</Box>
        </DialogContent>
      </Dialog>

      {/* Table View Dialog */}
      <Dialog
        open={tableOpen}
        onClose={() => setTableOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: { borderRadius: "16px" }
        }}
      >
        <DialogTitle sx={{ borderBottom: `1px solid ${HEALTH_TL_THEME.primary}20` }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Typography variant="h6" fontWeight={600} color={HEALTH_TL_THEME.primary}>
              {title} - Data Table
            </Typography>
            <Button
              startIcon={<Download />}
              onClick={() => exportToCSV(chartData, title.replace(/\s+/g, "_"), columns)}
              size="small"
              sx={{
                bgcolor: `${HEALTH_TL_THEME.primary}15`,
                color: HEALTH_TL_THEME.primary,
                textTransform: "none",
                fontWeight: 600,
                borderRadius: "10px",
                "&:hover": { bgcolor: `${HEALTH_TL_THEME.primary}25` },
              }}
            >
              Export
            </Button>
          </Box>
        </DialogTitle>
        <DialogContent>
          <TableContainer sx={{ mt: 2 }}>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: `${HEALTH_TL_THEME.primary}10` }}>
                  {columns.map((col) => (
                    <TableCell key={col} sx={{ fontWeight: 600, textTransform: "capitalize", color: HEALTH_TL_THEME.primary }}>
                      {col}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {chartData.map((row, idx) => (
                  <TableRow key={idx} hover>
                    {columns.map((col) => (
                      <TableCell key={col}>{row[col]}</TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={() => setTableOpen(false)}
            variant="outlined"
            sx={{
              color: HEALTH_TL_THEME.primary,
              borderColor: HEALTH_TL_THEME.primary,
              borderRadius: "10px",
              "&:hover": {
                bgcolor: `${HEALTH_TL_THEME.primary}10`,
                borderColor: HEALTH_TL_THEME.primary,
              }
            }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
};

// Modern Agent Card Component
const AgentCard = ({ agent, onCardClick, onDownloadCSV, callLogs, isGridView }) => {
  const agentLogs = callLogs.filter((log) => log.agentId === agent.uid);
  const connectedCalls = agentLogs.filter((log) => log.callConnected).length;
  const totalCalls = agentLogs.length;
  const connectionRate = totalCalls > 0 ? Math.round((connectedCalls / totalCalls) * 100) : 0;

  const getStatusConfig = (status) => {
    const configs = {
      // New status values
      Available: {
        color: "#10b981",
        bgColor: "rgba(16, 185, 129, 0.1)",
        label: "Available",
        icon: <CheckCircle sx={{ fontSize: 14 }} />,
      },
      "On Call": {
        color: "#f59e0b",
        bgColor: "rgba(245, 158, 11, 0.1)",
        label: "On Call",
        icon: <PhoneInTalk sx={{ fontSize: 14 }} />,
        animate: true,
      },
      Unavailable: {
        color: "#ef4444",
        bgColor: "rgba(239, 68, 68, 0.1)",
        label: "Unavailable",
        icon: <Cancel sx={{ fontSize: 14 }} />,
      },
      // Legacy status values (for backwards compatibility)
      Idle: {
        color: "#10b981",
        bgColor: "rgba(16, 185, 129, 0.1)",
        label: "Available",
        icon: <CheckCircle sx={{ fontSize: 14 }} />,
      },
      Busy: {
        color: "#f59e0b",
        bgColor: "rgba(245, 158, 11, 0.1)",
        label: "On Call",
        icon: <PhoneInTalk sx={{ fontSize: 14 }} />,
        animate: true,
      },
      Break: {
        color: "#6b7280",
        bgColor: "rgba(107, 114, 128, 0.1)",
        label: "On Break",
        icon: <AccessTime sx={{ fontSize: 14 }} />,
      },
      Logout: {
        color: "#ef4444",
        bgColor: "rgba(239, 68, 68, 0.1)",
        label: "Unavailable",
        icon: <Cancel sx={{ fontSize: 14 }} />,
      },
      "Logged Out": {
        color: "#ef4444",
        bgColor: "rgba(239, 68, 68, 0.1)",
        label: "Unavailable",
        icon: <Cancel sx={{ fontSize: 14 }} />,
      },
    };
    return configs[status] || configs.Unavailable;
  };

  const statusConfig = getStatusConfig(agent.status);

  if (!isGridView) {
    // List View
    return (
      <Paper
        elevation={0}
        onClick={() => onCardClick(agent)}
        sx={{
          background: "#fff",
          borderRadius: "12px",
          padding: "16px 24px",
          display: "flex",
          alignItems: "center",
          gap: 3,
          cursor: "pointer",
          border: "1px solid rgba(20, 184, 166, 0.1)",
          transition: "all 0.3s ease",
          "&:hover": {
            transform: "translateX(4px)",
            boxShadow: "0 4px 20px rgba(20, 184, 166, 0.1)",
            borderColor: "#14b8a6",
          },
        }}
      >
        <Badge
          overlap="circular"
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
          badgeContent={
            <Box
              sx={{
                width: 12,
                height: 12,
                borderRadius: "50%",
                bgcolor: statusConfig.color,
                border: "2px solid #fff",
              }}
            />
          }
        >
          <Avatar
            sx={{
              width: 48,
              height: 48,
              background: "linear-gradient(135deg, #14b8a6 0%, #0d9488 100%)",
              fontWeight: 700,
              fontSize: "1.1rem",
            }}
          >
            {agent.avatar}
          </Avatar>
        </Badge>

        <Box sx={{ flex: 1 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "#1e293b" }}>
            {agent.name}
          </Typography>
          <Typography variant="caption" sx={{ color: "#64748b" }}>
            {agent.empId ? `MSID: ${agent.empId}` : agent.email || "Health Agent"}
          </Typography>
        </Box>

        <Box sx={{ textAlign: "center", minWidth: 80 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, color: "#14b8a6" }}>
            {totalCalls}
          </Typography>
          <Typography variant="caption" sx={{ color: "#64748b" }}>
            Total Calls
          </Typography>
        </Box>

        <Box sx={{ textAlign: "center", minWidth: 80 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, color: "#10b981" }}>
            {connectionRate}%
          </Typography>
          <Typography variant="caption" sx={{ color: "#64748b" }}>
            Connect Rate
          </Typography>
        </Box>

        <Chip
          icon={statusConfig.icon}
          label={statusConfig.label}
          size="small"
          sx={{
            bgcolor: statusConfig.bgColor,
            color: statusConfig.color,
            fontWeight: 600,
            fontSize: "0.75rem",
            "& .MuiChip-icon": {
              color: statusConfig.color,
            },
          }}
        />

        <IconButton
          size="small"
          onClick={(e) => {
            e.stopPropagation();
            onDownloadCSV(agent);
          }}
          sx={{
            bgcolor: "rgba(20, 184, 166, 0.1)",
            color: "#14b8a6",
            "&:hover": {
              bgcolor: "#14b8a6",
              color: "#fff",
            },
          }}
        >
          <FileDownload fontSize="small" />
        </IconButton>
      </Paper>
    );
  }

  // Grid View
  return (
    <Card
      elevation={0}
      onClick={() => onCardClick(agent)}
      sx={{
        background: "#fff",
        borderRadius: "20px",
        border: "1px solid rgba(20, 184, 166, 0.1)",
        cursor: "pointer",
        position: "relative",
        overflow: "hidden",
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        "&:hover": {
          transform: "translateY(-8px)",
          boxShadow: "0 20px 40px rgba(20, 184, 166, 0.15)",
          borderColor: "#14b8a6",
        },
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "4px",
          background: "linear-gradient(90deg, #14b8a6 0%, #2dd4bf 50%, #5eead4 100%)",
        },
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", mb: 2 }}>
          <Badge
            overlap="circular"
            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            badgeContent={
              <Box
                sx={{
                  width: 14,
                  height: 14,
                  borderRadius: "50%",
                  bgcolor: statusConfig.color,
                  border: "2px solid #fff",
                  boxShadow: `0 0 0 2px ${statusConfig.bgColor}`,
                }}
              />
            }
          >
            <Avatar
              sx={{
                width: 56,
                height: 56,
                background: "linear-gradient(135deg, #14b8a6 0%, #0d9488 100%)",
                fontWeight: 700,
                fontSize: "1.3rem",
                boxShadow: "0 4px 14px rgba(20, 184, 166, 0.3)",
              }}
            >
              {agent.avatar}
            </Avatar>
          </Badge>
          <Chip
            icon={statusConfig.icon}
            label={statusConfig.label}
            size="small"
            sx={{
              bgcolor: statusConfig.bgColor,
              color: statusConfig.color,
              fontWeight: 600,
              fontSize: "0.7rem",
              height: 28,
              "& .MuiChip-icon": {
                color: statusConfig.color,
              },
            }}
          />
        </Box>

        <Typography variant="h6" sx={{ fontWeight: 700, color: "#1e293b", mb: 0.5 }}>
          {agent.name}
        </Typography>
        <Typography variant="caption" sx={{ color: "#64748b", display: "block", mb: 2 }}>
          {agent.empId ? `MSID: ${agent.empId}` : agent.email || "Health Agent"}
        </Typography>

        {/* Stats */}
        <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2, mb: 2 }}>
          <Box
            sx={{
              bgcolor: "rgba(20, 184, 166, 0.05)",
              borderRadius: "12px",
              p: 1.5,
              textAlign: "center",
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 700, color: "#14b8a6" }}>
              {totalCalls}
            </Typography>
            <Typography variant="caption" sx={{ color: "#64748b", fontSize: "0.65rem" }}>
              Total Calls
            </Typography>
          </Box>
          <Box
            sx={{
              bgcolor: "rgba(16, 185, 129, 0.05)",
              borderRadius: "12px",
              p: 1.5,
              textAlign: "center",
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 700, color: "#10b981" }}>
              {connectedCalls}
            </Typography>
            <Typography variant="caption" sx={{ color: "#64748b", fontSize: "0.65rem" }}>
              Connected
            </Typography>
          </Box>
        </Box>

        {/* Connection Rate Progress */}
        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
            <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 600 }}>
              Connection Rate
            </Typography>
            <Typography variant="caption" sx={{ color: "#14b8a6", fontWeight: 700 }}>
              {connectionRate}%
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={connectionRate}
            sx={{
              height: 6,
              borderRadius: 3,
              bgcolor: "rgba(20, 184, 166, 0.1)",
              "& .MuiLinearProgress-bar": {
                borderRadius: 3,
                background: "linear-gradient(90deg, #14b8a6 0%, #2dd4bf 100%)",
              },
            }}
          />
        </Box>

        {/* Download Button */}
        <Button
          fullWidth
          size="small"
          startIcon={<FileDownload />}
          onClick={(e) => {
            e.stopPropagation();
            onDownloadCSV(agent);
          }}
          sx={{
            bgcolor: "rgba(20, 184, 166, 0.1)",
            color: "#14b8a6",
            fontWeight: 600,
            borderRadius: "10px",
            textTransform: "none",
            "&:hover": {
              bgcolor: "#14b8a6",
              color: "#fff",
            },
          }}
        >
          Download CSV
        </Button>
      </CardContent>
    </Card>
  );
};

function HealthTLDashboard({ currentUser }) {
  const [teamAgents, setTeamAgents] = useState([]);
  const [tlData, setTlData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const [callLogs, setCallLogs] = useState([]);
  const [allAgentsCallLogs, setAllAgentsCallLogs] = useState([]);
  const [csvFilter, setCsvFilter] = useState("all");
  const [csvTeamFilter, setCsvTeamFilter] = useState("my-team");
  const [customDateFrom, setCustomDateFrom] = useState("");
  const [customDateTo, setCustomDateTo] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [loadingRecordings, setLoadingRecordings] = useState({});
  const [isGridView, setIsGridView] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  // Analytics filters and sub-tabs
  const [analyticsSubTab, setAnalyticsSubTab] = useState(0);
  const [dateRangeFilter, setDateRangeFilter] = useState("last7");
  const [directionFilter, setDirectionFilter] = useState("all");
  const [agentFilter, setAgentFilter] = useState("all");
  const navigate = useNavigate();

  // Theme colors for Health TL (Teal/Emerald theme)
  const THEME_COLORS = {
    primary: "#14b8a6",
    primaryLight: "#2dd4bf",
    primaryDark: "#0d9488",
    secondary: "#5eead4",
    success: "#10b981",
    warning: "#f59e0b",
    info: "#3b82f6",
    gradient: "linear-gradient(135deg, #14b8a6 0%, #0d9488 100%)",
    gradientLight: "linear-gradient(135deg, #2dd4bf 0%, #14b8a6 100%)",
    cardBg: "#ffffff",
    background: "linear-gradient(135deg, #f0fdfa 0%, #ccfbf1 50%, #99f6e4 100%)",
    textPrimary: "#1e293b",
    textSecondary: "#64748b",
  };

  useEffect(() => {
    if (!currentUser || !currentUser.uid) {
      return;
    }

    let mounted = true;
    let unsubscribeFunc = null;

    const fetchTLDataAndTeam = async () => {
      try {
        const healthTLQuery = query(
          collection(db, "healthTeamLeads"),
          where("uid", "==", currentUser.uid)
        );
        const healthTLSnapshot = await getDocs(healthTLQuery);

        if (healthTLSnapshot.empty) {
          console.error("TL document not found for UID:", currentUser.uid);
          if (mounted) setLoading(false);
          return;
        }

        const tlDoc = healthTLSnapshot.docs[0];

        if (mounted) {
          const tlInfo = tlDoc.data();
          setTlData({ id: currentUser.uid, ...tlInfo });

          const agentUIDs = tlInfo.agents || [];

          const healthAgentsRef = collection(db, "healthAgents");
          unsubscribeFunc = onSnapshot(
            healthAgentsRef,
            (snapshot) => {
              if (!mounted) return;

              const agents = [];
              snapshot.docs.forEach((agentDoc) => {
                const agentData = agentDoc.data();
                const agentId = agentDoc.id;

                if (
                  agentData.teamLeadId === currentUser.uid ||
                  agentUIDs.includes(agentId)
                ) {
                  agents.push({
                    uid: agentId,
                    collection: "healthAgents",
                    name: agentData.name || "Unknown Agent",
                    email: agentData.email || "",
                    empId: agentData.empId || "",
                    mobile: agentData.mobile || agentData.phoneNumber || "",
                    status: agentData.status || "Logout",
                    department: "Health",
                    avatar: agentData.avatar || agentData.name?.charAt(0) || "H",
                  });
                }
              });

              if (mounted) {
                setTeamAgents(agents);
                setLoading(false);
              }
            },
            (error) => {
              console.error("Error fetching healthAgents:", error);
              if (mounted) setLoading(false);
            }
          );
        }
      } catch (error) {
        console.error("Error fetching TL data:", error);
        if (mounted) setLoading(false);
      }
    };

    fetchTLDataAndTeam();

    return () => {
      mounted = false;
      if (unsubscribeFunc) {
        unsubscribeFunc();
      }
    };
  }, [currentUser]);

  // Fetch call logs for team members
  useEffect(() => {
    if (!currentUser || !currentUser.uid || teamAgents.length === 0) return;

    let mounted = true;
    const allUnsubscribes = [];

    teamAgents.forEach((agent) => {
      const callLogsRef = collection(
        db,
        agent.collection,
        agent.uid,
        "callLogs"
      );

      const unsubscribe = onSnapshot(
        callLogsRef,
        (snapshot) => {
          if (!mounted) return;

          const logs = snapshot.docs.map((doc) => {
            const data = doc.data();
            return {
              id: doc.id,
              agentId: agent.uid,
              agentName: agent.name,
              agentCollection: agent.collection,
              department: agent.department || "",
              status: agent.status || "",
              timestamp: data.timestamp?.toDate() || new Date(),
              ...data,
            };
          });

          setCallLogs((prevLogs) => {
            const filtered = prevLogs.filter(
              (log) => log.agentId !== agent.uid
            );
            return [...filtered, ...logs];
          });
        },
        (error) => {
          console.error(
            `Error fetching call logs for ${agent.collection}:`,
            error
          );
        }
      );

      allUnsubscribes.push(unsubscribe);
    });

    return () => {
      mounted = false;
      allUnsubscribes.forEach((unsub) => unsub());
    };
  }, [currentUser, teamAgents]);

  // Fetch call logs for ALL Health agents
  useEffect(() => {
    if (!currentUser || !currentUser.uid) return;

    let mounted = true;
    const allUnsubscribes = [];

    const healthAgentsRef = collection(db, "healthAgents");

    getDocs(healthAgentsRef).then((agentsSnapshot) => {
      agentsSnapshot.docs.forEach((agentDoc) => {
        const agentData = agentDoc.data();
        const agentId = agentDoc.id;

        const callLogsRef = collection(db, "healthAgents", agentId, "callLogs");

        const unsubscribe = onSnapshot(
          callLogsRef,
          (snapshot) => {
            if (!mounted) return;

            const logs = snapshot.docs.map((doc) => {
              const data = doc.data();
              return {
                id: doc.id,
                agentId,
                agentName: agentData.name || "",
                agentCollection: "healthAgents",
                department: "Health",
                status: agentData.status || "",
                timestamp: data.timestamp?.toDate() || new Date(),
                ...data,
              };
            });

            setAllAgentsCallLogs((prevLogs) => {
              const filtered = prevLogs.filter((log) => log.agentId !== agentId);
              return [...filtered, ...logs];
            });
          },
          (error) => {
            console.error(`Error fetching logs for healthAgents/${agentId}:`, error);
          }
        );

        allUnsubscribes.push(unsubscribe);
      });
    }).catch((error) => {
      console.error("Error fetching healthAgents collection:", error);
    });

    return () => {
      mounted = false;
      allUnsubscribes.forEach((unsub) => unsub());
    };
  }, [currentUser]);

  // Calculate statistics (supports both new and legacy status values)
  const stats = {
    totalAgents: teamAgents.length,
    available: teamAgents.filter((a) => a.status === "Idle" || a.status === "Available" || a.status === "Login").length,
    onCall: teamAgents.filter((a) => a.status === "Busy" || a.status === "On Call").length,
    onBreak: teamAgents.filter((a) => a.status === "Break").length,
    loggedOut: teamAgents.filter((a) => a.status === "Logout" || a.status === "Unavailable" || a.status === "Logged Out" || !a.status).length,
    totalCalls: callLogs.length,
    connectedCalls: callLogs.filter((log) => log.callConnected).length,
    connectionRate: callLogs.length > 0 ? Math.round((callLogs.filter((log) => log.callConnected).length / callLogs.length) * 100) : 0,
  };

  // Prepare chart data - Fixed date handling
  const getCallTrendData = () => {
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toLocaleDateString("en-US", { weekday: "short" });

      // Create separate date objects for start and end
      const dayStart = new Date(date);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(date);
      dayEnd.setHours(23, 59, 59, 999);

      const dayLogs = callLogs.filter((log) => {
        if (!log.timestamp) return false;
        const logDate = log.timestamp?.toDate ? log.timestamp.toDate() :
                       (log.timestamp instanceof Date ? log.timestamp : new Date(log.timestamp));
        return logDate >= dayStart && logDate <= dayEnd;
      });

      last7Days.push({
        name: dateStr,
        calls: dayLogs.length,
        connected: dayLogs.filter((log) => log.callConnected).length,
      });
    }
    return last7Days;
  };

  const getStatusDistribution = () => {
    const distribution = [
      { name: "Available", value: stats.available, color: "#10b981" },
      { name: "On Call", value: stats.onCall, color: "#3b82f6" },
      { name: "On Break", value: stats.onBreak, color: "#f59e0b" },
      { name: "Offline", value: stats.loggedOut, color: "#6b7280" },
    ].filter((item) => item.value > 0);

    // If all values are 0, show a placeholder
    if (distribution.length === 0) {
      return [{ name: "No Data", value: 1, color: "#e2e8f0" }];
    }
    return distribution;
  };

  // Get top performers data
  const getTopPerformers = () => {
    return teamAgents
      .map((agent) => {
        const agentLogs = callLogs.filter((log) => log.agentId === agent.uid);
        const connected = agentLogs.filter((log) => log.callConnected).length;
        const total = agentLogs.length;
        const rate = total > 0 ? Math.round((connected / total) * 100) : 0;
        return {
          name: agent.name?.split(" ")[0] || "Agent",
          calls: total,
          connected: connected,
          rate: rate,
        };
      })
      .sort((a, b) => b.connected - a.connected || b.rate - a.rate)
      .slice(0, 5);
  };

  // Get call type distribution
  const getCallTypeDistribution = () => {
    const typeCount = {};
    callLogs.forEach((log) => {
      const type = log.callType || "Unknown";
      typeCount[type] = (typeCount[type] || 0) + 1;
    });
    return Object.entries(typeCount)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);
  };

  // Get call category distribution
  const getCallCategoryDistribution = () => {
    const categoryCount = {};
    callLogs.forEach((log) => {
      const category = log.callCategory || "Other";
      categoryCount[category] = (categoryCount[category] || 0) + 1;
    });
    return Object.entries(categoryCount)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);
  };

  // Get hourly call distribution
  const getHourlyDistribution = () => {
    const hourlyCount = {};
    callLogs.forEach((log) => {
      if (!log.timestamp) return;
      const logDate = log.timestamp?.toDate ? log.timestamp.toDate() :
                     (log.timestamp instanceof Date ? log.timestamp : new Date(log.timestamp));
      const hour = logDate.getHours();
      const hourLabel = `${hour.toString().padStart(2, "0")}:00`;
      hourlyCount[hourLabel] = (hourlyCount[hourLabel] || 0) + 1;
    });

    // Return sorted by hour
    return Object.entries(hourlyCount)
      .map(([hour, value]) => ({ hour, calls: value }))
      .sort((a, b) => a.hour.localeCompare(b.hour));
  };

  // Filter callLogs based on selected filters - MUST be defined BEFORE analyticsData
  const getFilteredCallLogs = () => {
    let filtered = [...callLogs];
    const now = new Date();

    if (dateRangeFilter === "today") {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      filtered = filtered.filter(log => {
        const logDate = log.timestamp?.toDate ? log.timestamp.toDate() :
                       (log.timestamp instanceof Date ? log.timestamp : new Date(log.timestamp));
        return logDate >= today;
      });
    } else if (dateRangeFilter === "last7") {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      filtered = filtered.filter(log => {
        const logDate = log.timestamp?.toDate ? log.timestamp.toDate() :
                       (log.timestamp instanceof Date ? log.timestamp : new Date(log.timestamp));
        return logDate >= weekAgo;
      });
    } else if (dateRangeFilter === "last30") {
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      filtered = filtered.filter(log => {
        const logDate = log.timestamp?.toDate ? log.timestamp.toDate() :
                       (log.timestamp instanceof Date ? log.timestamp : new Date(log.timestamp));
        return logDate >= monthAgo;
      });
    }

    if (directionFilter === "inbound") {
      filtered = filtered.filter(log => log.callDirection === "inbound" || log.callType?.toLowerCase().includes("inbound"));
    } else if (directionFilter === "outbound") {
      filtered = filtered.filter(log => log.callDirection === "outbound" || !log.callType?.toLowerCase().includes("inbound"));
    }

    if (agentFilter !== "all") {
      filtered = filtered.filter(log => log.agentId === agentFilter);
    }

    return filtered;
  };

  const filteredLogsForStats = getFilteredCallLogs();
  const filteredStats = {
    totalCalls: filteredLogsForStats.length,
    connectedCalls: filteredLogsForStats.filter(log => log.callConnected).length,
    notConnectedCalls: filteredLogsForStats.filter(log => !log.callConnected).length,
    successRate: filteredLogsForStats.length > 0
      ? Math.round((filteredLogsForStats.filter(log => log.callConnected).length / filteredLogsForStats.length) * 100)
      : 0,
  };

  const resetFilters = () => {
    setDateRangeFilter("last7");
    setDirectionFilter("all");
    setAgentFilter("all");
  };

  // Comprehensive Analytics Data - NOW USES filteredLogsForStats for filter support
  const analyticsData = {
    // Calls by Date (Last 7 Days)
    callsByDate: (() => {
      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (6 - i));
        return date.toISOString().split('T')[0];
      });

      return last7Days.map(date => {
        const logsOnDate = filteredLogsForStats.filter(log => {
          if (!log.timestamp) return false;
          const logDate = log.timestamp?.toDate ? log.timestamp.toDate() :
                         (log.timestamp instanceof Date ? log.timestamp : new Date(log.timestamp));
          const logDateStr = logDate.toISOString().split('T')[0];
          return logDateStr === date;
        });

        return {
          date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          total: logsOnDate.length,
          connected: logsOnDate.filter(l => l.callConnected).length,
          notConnected: logsOnDate.filter(l => !l.callConnected).length,
        };
      });
    })(),

    // Call Status Distribution
    callStatus: [
      { name: 'Connected', value: filteredStats.connectedCalls, color: HEALTH_TL_THEME.success },
      { name: 'Not Connected', value: filteredStats.notConnectedCalls, color: HEALTH_TL_THEME.danger },
    ].filter(item => item.value > 0),

    // Calls by Type
    callsByType: (() => {
      const types = {};
      filteredLogsForStats.forEach(log => {
        const type = log.callType || 'Unknown';
        types[type] = (types[type] || 0) + 1;
      });
      return Object.entries(types).map(([name, value]) => ({ name, value }));
    })(),

    // Top Agents by Calls
    topAgents: teamAgents
      .map(agent => {
        const agentLogs = filteredLogsForStats.filter(log => log.agentId === agent.uid);
        return {
          name: agent.name?.split(' ')[0] || 'Unknown',
          fullName: agent.name,
          totalCalls: agentLogs.length,
          connectedCalls: agentLogs.filter(l => l.callConnected).length,
          successRate: agentLogs.length > 0
            ? Math.round((agentLogs.filter(l => l.callConnected).length / agentLogs.length) * 100)
            : 0,
        };
      })
      .sort((a, b) => b.totalCalls - a.totalCalls)
      .slice(0, 5),

    // Hourly Distribution
    hourlyDistribution: (() => {
      const hours = Array.from({ length: 24 }, (_, i) => ({ hour: `${i.toString().padStart(2, "0")}:00`, calls: 0, connected: 0 }));
      filteredLogsForStats.forEach(log => {
        if (log.timestamp) {
          const logDate = log.timestamp?.toDate ? log.timestamp.toDate() :
                         (log.timestamp instanceof Date ? log.timestamp : new Date(log.timestamp));
          const hour = logDate.getHours();
          hours[hour].calls++;
          if (log.callConnected) hours[hour].connected++;
        }
      });
      return hours;
    })(),

    // Connection Rate Trend
    connectionRateTrend: (() => {
      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (6 - i));
        return date.toISOString().split('T')[0];
      });

      return last7Days.map(date => {
        const logsOnDate = filteredLogsForStats.filter(log => {
          if (!log.timestamp) return false;
          const logDate = log.timestamp?.toDate ? log.timestamp.toDate() :
                         (log.timestamp instanceof Date ? log.timestamp : new Date(log.timestamp));
          const logDateStr = logDate.toISOString().split('T')[0];
          return logDateStr === date;
        });

        const total = logsOnDate.length;
        const connected = logsOnDate.filter(l => l.callConnected).length;
        const rate = total > 0 ? Math.round((connected / total) * 100) : 0;

        return {
          date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          rate,
          total,
        };
      });
    })(),

    // Day of Week Analysis
    dayOfWeekData: (() => {
      const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      const dayMap = new Map();

      days.forEach((day, index) => {
        dayMap.set(index, { day, calls: 0, connected: 0 });
      });

      filteredLogsForStats.forEach(log => {
        if (log.timestamp) {
          const logDate = log.timestamp?.toDate ? log.timestamp.toDate() :
                         (log.timestamp instanceof Date ? log.timestamp : new Date(log.timestamp));
          const dayIndex = logDate.getDay();
          const data = dayMap.get(dayIndex);
          data.calls++;
          if (log.callConnected) data.connected++;
        }
      });

      return Array.from(dayMap.values());
    })(),

    // Calls by Agent Type (Nurse, Branch Manager, Client, etc.) - Uses filtered data
    callsByAgentType: (() => {
      const types = {};
      filteredLogsForStats.forEach(log => {
        // Handle different data structures:
        // - Regular calls: callType = "Client"/"Branch Manager"/"Nurse"
        // - Manual Leads: callType = "Manual Lead", agentType = "Client"/"Branch Manager"/"Nurse"
        // - Inbound: callType = "Inbound", agentType = "Insurance"/"Health"
        let typeValue = 'Unknown';

        if (log.callType === 'Manual Lead' && log.agentType) {
          // For Manual Leads, use agentType field
          typeValue = log.agentType;
        } else if (log.callType && ['Client', 'Branch Manager', 'Nurse'].includes(log.callType)) {
          // For regular calls, use callType field
          typeValue = log.callType;
        } else if (log.agentType && ['Client', 'Branch Manager', 'Nurse'].includes(log.agentType)) {
          // Fallback: use agentType if it has the right values
          typeValue = log.agentType;
        }

        types[typeValue] = (types[typeValue] || 0) + 1;
      });
      return Object.entries(types)
        .map(([name, value]) => ({
          name,
          value,
          color: name === 'Nurse' ? '#ec4899' :
                 name === 'Branch Manager' ? '#8b5cf6' :
                 name === 'Client' ? '#14b8a6' :
                 '#6b7280'
        }))
        .filter(item => item.value > 0);
    })(),

    // Agent Status Distribution
    agentStatusDistribution: [
      { name: "Available", value: stats.available, color: HEALTH_TL_THEME.success },
      { name: "On Call", value: stats.onCall, color: HEALTH_TL_THEME.info },
      { name: "On Break", value: stats.onBreak, color: HEALTH_TL_THEME.warning },
      { name: "Offline", value: stats.loggedOut, color: "#6b7280" },
    ].filter(item => item.value > 0),
  };

  // Filter functions
  const filteredCallLogs = allAgentsCallLogs.filter((log) => {
    if (!searchQuery.trim()) return true;

    const q = searchQuery.toLowerCase();
    const agentName = (log.agentName || "").toLowerCase();
    const clientNumber = (log.clientNumber || "").toLowerCase();
    const sid = (log.sid || "").toLowerCase();
    const callId = (log.callId || "").toLowerCase();
    const agentId = (log.agentId || "").toLowerCase();

    return (
      agentName.includes(q) ||
      clientNumber.includes(q) ||
      sid.includes(q) ||
      callId.includes(q) ||
      agentId.includes(q)
    );
  });

  const filteredTeamAgents = teamAgents.filter((agent) => {
    if (!searchQuery.trim()) return true;

    const q = searchQuery.toLowerCase();
    const agentName = (agent.name || "").toLowerCase();
    const agentPhone = (agent.mobile || "").toLowerCase();
    const agentId = (agent.uid || "").toLowerCase();
    const agentEmail = (agent.email || "").toLowerCase();

    const agentMatches = (
      agentName.includes(q) ||
      agentPhone.includes(q) ||
      agentId.includes(q) ||
      agentEmail.includes(q)
    );

    const agentCallLogs = allAgentsCallLogs.filter(
      (log) => log.agentId === agent.uid && log.collectionName === agent.collection
    );

    const callLogMatches = agentCallLogs.some((log) => {
      const clientNumber = (log.clientNumber || "").toLowerCase();
      const sid = (log.sid || "").toLowerCase();
      const callId = (log.callId || "").toLowerCase();

      return (
        clientNumber.includes(q) ||
        sid.includes(q) ||
        callId.includes(q)
      );
    });

    return agentMatches || callLogMatches;
  });

  const handleCardClick = (agent) => {
    navigate(`/tl/agent-details/${agent.collection}/${agent.uid}`);
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const fetchRecording = async (sid) => {
    if (!sid) {
      alert("No call SID available for this call");
      return;
    }

    setLoadingRecordings((prev) => ({ ...prev, [sid]: true }));

    try {
      const ACCOUNT_SID = process.env.REACT_APP_ACCOUNT_SID;
      const recordingUrl = `https://my.exotel.com/${ACCOUNT_SID}/calls/${sid}`;
      window.open(recordingUrl, "_blank");
      alert("Recording page opened in new tab. You may need to log into your Exotel account to access it.");
    } catch (error) {
      console.error("Error opening recording:", error);
      alert("Failed to open recording. Please try again or contact support.");
    } finally {
      setLoadingRecordings((prev) => ({ ...prev, [sid]: false }));
    }
  };

  const formatDuration = (duration) => {
    if (!duration || typeof duration !== "object" || (!duration.hours && !duration.minutes && !duration.seconds))
      return "N/A";
    return `${duration.hours || 0}h ${duration.minutes || 0}m ${duration.seconds || 0}s`;
  };

  const handleDownloadTeamCSV = () => {
    let sourceLogs = csvTeamFilter === "my-team" ? callLogs : allAgentsCallLogs;
    let filteredLogs = sourceLogs;
    const now = new Date();

    if (csvFilter === "daily") {
      const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      filteredLogs = sourceLogs.filter((log) => {
        const logTimestamp = log.timestamp?.toDate ? log.timestamp.toDate() : (log.timestamp instanceof Date ? log.timestamp : new Date(log.timestamp));
        return logTimestamp && logTimestamp >= oneDayAgo;
      });
    } else if (csvFilter === "weekly") {
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      filteredLogs = sourceLogs.filter((log) => {
        const logTimestamp = log.timestamp?.toDate ? log.timestamp.toDate() : (log.timestamp instanceof Date ? log.timestamp : new Date(log.timestamp));
        return logTimestamp && logTimestamp >= oneWeekAgo;
      });
    } else if (csvFilter === "monthly") {
      const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      filteredLogs = sourceLogs.filter((log) => {
        const logTimestamp = log.timestamp?.toDate ? log.timestamp.toDate() : (log.timestamp instanceof Date ? log.timestamp : new Date(log.timestamp));
        return logTimestamp && logTimestamp >= oneMonthAgo;
      });
    } else if (csvFilter === "custom" && customDateFrom && customDateTo) {
      const fromDate = new Date(customDateFrom);
      fromDate.setHours(0, 0, 0, 0);
      const toDate = new Date(customDateTo);
      toDate.setHours(23, 59, 59, 999);
      filteredLogs = sourceLogs.filter((log) => {
        const logTimestamp = log.timestamp?.toDate ? log.timestamp.toDate() : (log.timestamp instanceof Date ? log.timestamp : new Date(log.timestamp));
        return logTimestamp && logTimestamp >= fromDate && logTimestamp <= toDate;
      });
    }

    const headers = [
      "Agent Name", "MSID", "SID", "Call ID", "Client Number", "Call Type",
      "Agent Type", "Escalation", "Call Category", "Partner", "Timestamp",
      "Call Duration", "Call Connected", "Call Status", "Not Connected Reason", "Remarks",
    ];

    const rows = filteredLogs.map((log) => {
      const agent = teamAgents.find(a => a.uid === log.agentId);
      return [
        log.agentName || "",
        agent?.empId || "N/A",
        log.sid || "N/A",
        log.callId || "N/A",
        log.clientNumber || "",
        log.callType || "",
        log.agentType || "",
        log.escalation || "",
        log.callCategory || "",
        log.partner || log.partnerName || "",
        log.timestamp
          ? (log.timestamp?.toDate ? log.timestamp.toDate() : (log.timestamp instanceof Date ? log.timestamp : new Date(log.timestamp))).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })
          : "",
        formatDuration(log.duration),
        log.callConnected ? "Connected" : "Not Connected",
        log.callConnected ? log.callStatus || "" : "",
        log.callConnected ? "" : log.notConnectedReason || "",
        log.remarks || "",
      ];
    });

    const csvContent = [headers, ...rows]
      .map((row) => row.map((cell) => `"${cell}"`).join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `health_${csvTeamFilter === "my-team" ? "my_team" : "all_agents"}_calls_${csvFilter}_${
        new Date().toISOString().split("T")[0]
      }.csv`
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadAgentCSV = (agent) => {
    const agentLogs = callLogs.filter((log) => log.agentId === agent.uid);
    let filteredLogs = agentLogs;
    const now = new Date();

    if (csvFilter === "daily") {
      const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      filteredLogs = agentLogs.filter(
        (log) => log.timestamp && log.timestamp >= oneDayAgo
      );
    } else if (csvFilter === "weekly") {
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      filteredLogs = agentLogs.filter(
        (log) => log.timestamp && log.timestamp >= oneWeekAgo
      );
    } else if (csvFilter === "monthly") {
      const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      filteredLogs = agentLogs.filter(
        (log) => log.timestamp && log.timestamp >= oneMonthAgo
      );
    } else if (csvFilter === "custom" && customDateFrom && customDateTo) {
      const fromDate = new Date(customDateFrom);
      fromDate.setHours(0, 0, 0, 0);
      const toDate = new Date(customDateTo);
      toDate.setHours(23, 59, 59, 999);
      filteredLogs = agentLogs.filter((log) => {
        const logTimestamp = log.timestamp?.toDate ? log.timestamp.toDate() : (log.timestamp instanceof Date ? log.timestamp : new Date(log.timestamp));
        return logTimestamp && logTimestamp >= fromDate && logTimestamp <= toDate;
      });
    }

    const headers = [
      "Agent Name", "MSID", "SID", "Call ID", "Client Number", "Call Type",
      "Agent Type", "Escalation", "Call Category", "Partner", "Timestamp",
      "Call Duration", "Call Connected", "Call Status", "Not Connected Reason", "Remarks",
    ];

    const rows = filteredLogs.map((log) => [
      log.agentName || agent.name || "",
      agent.empId || "N/A",
      log.sid || "N/A",
      log.callId || "N/A",
      log.clientNumber || "",
      log.callType || "",
      log.agentType || "",
      log.escalation || "",
      log.callCategory || "",
      log.partner || log.partnerName || "",
      log.timestamp
        ? (log.timestamp?.toDate ? log.timestamp.toDate() : (log.timestamp instanceof Date ? log.timestamp : new Date(log.timestamp))).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })
        : "",
      formatDuration(log.duration),
      log.callConnected ? "Connected" : "Not Connected",
      log.callConnected ? log.callStatus || "" : "",
      log.callConnected ? "" : log.notConnectedReason || "",
      log.remarks || "",
    ]);

    const csvContent = [headers, ...rows]
      .map((row) => row.map((cell) => `"${cell}"`).join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `health_${agent.name}_calls_${csvFilter}_${
        new Date().toISOString().split("T")[0]
      }.csv`
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          background: THEME_COLORS.background,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          gap: 2,
        }}
      >
        <CircularProgress sx={{ color: THEME_COLORS.primary }} size={48} />
        <Typography variant="h6" sx={{ color: THEME_COLORS.textSecondary }}>
          Loading team data...
        </Typography>
      </Box>
    );
  }

  // Calculate additional stats for the new layout
  const avgDuration = (() => {
    const logsWithDuration = callLogs.filter(log => log.duration);
    if (logsWithDuration.length === 0) return "0m 0s";
    const totalSeconds = logsWithDuration.reduce((sum, log) => {
      const d = log.duration;
      return sum + ((d.hours || 0) * 3600 + (d.minutes || 0) * 60 + (d.seconds || 0));
    }, 0);
    const avgSecs = Math.round(totalSeconds / logsWithDuration.length);
    const mins = Math.floor(avgSecs / 60);
    const secs = avgSecs % 60;
    return `${mins}m ${secs}s`;
  })();

  const totalTalkTime = (() => {
    const totalSeconds = callLogs.reduce((sum, log) => {
      if (!log.duration) return sum;
      const d = log.duration;
      return sum + ((d.hours || 0) * 3600 + (d.minutes || 0) * 60 + (d.seconds || 0));
    }, 0);
    const hours = Math.floor(totalSeconds / 3600);
    return `${hours}h`;
  })();

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: THEME_COLORS.background,
        p: { xs: 2, md: 3 },
      }}
    >
      {/* Main Tabs */}
      <Paper
        elevation={0}
        sx={{
          bgcolor: "#fff",
          borderRadius: "16px",
          mb: 3,
          overflow: "hidden",
        }}
      >
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          sx={{
            borderBottom: "1px solid rgba(20, 184, 166, 0.1)",
            "& .MuiTab-root": {
              color: THEME_COLORS.textSecondary,
              fontWeight: 600,
              textTransform: "none",
              fontSize: "1rem",
              minHeight: 64,
              "&.Mui-selected": {
                color: THEME_COLORS.primary,
              },
            },
            "& .MuiTabs-indicator": {
              backgroundColor: THEME_COLORS.primary,
              height: 3,
              borderRadius: "3px 3px 0 0",
            },
          }}
        >
          <Tab icon={<Group />} iconPosition="start" label="My Team" />
          <Tab icon={<Analytics />} iconPosition="start" label="Analytics" />
          <Tab icon={<Phone />} iconPosition="start" label="Log Calls" />
        </Tabs>
      </Paper>

      {/* Tab 0: Team View */}
      {activeTab === 0 && (
        <>
          {/* Header for Team View */}
          <Paper
            elevation={0}
            sx={{
              background: THEME_COLORS.gradient,
              borderRadius: "24px",
              p: { xs: 3, md: 4 },
              mb: 3,
              position: "relative",
              overflow: "hidden",
            }}
          >
            <Box
              sx={{
                position: "absolute",
                top: -50,
                right: -50,
                width: 200,
                height: 200,
                borderRadius: "50%",
                background: "rgba(255,255,255,0.1)",
              }}
            />
            <Box
              sx={{
                position: "relative",
                zIndex: 1,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: 2,
              }}
            >
              <Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 1 }}>
                  <HealthAndSafety sx={{ fontSize: 40, color: "#fff" }} />
                  <Typography
                    variant="h4"
                    sx={{
                      fontWeight: 800,
                      color: "#fff",
                      fontSize: { xs: "1.5rem", md: "2rem" },
                    }}
                  >
                    Health Team Lead Dashboard
                  </Typography>
                </Box>
                <Typography
                  variant="subtitle1"
                  sx={{ color: "rgba(255,255,255,0.9)", fontWeight: 500 }}
                >
                  Welcome back, {tlData?.name} - Managing {teamAgents.length} team member{teamAgents.length !== 1 ? "s" : ""}
                </Typography>
              </Box>

              <TextField
                placeholder="Search agents, calls, SID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                size="small"
                sx={{
                  minWidth: { xs: "100%", sm: 300 },
                  "& .MuiOutlinedInput-root": {
                    bgcolor: "rgba(255,255,255,0.15)",
                    backdropFilter: "blur(10px)",
                    borderRadius: "12px",
                    color: "#fff",
                    "& fieldset": { border: "none" },
                    "&:hover": { bgcolor: "rgba(255,255,255,0.2)" },
                  },
                  "& input::placeholder": { color: "rgba(255,255,255,0.7)" },
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ color: "rgba(255,255,255,0.7)" }} />
                    </InputAdornment>
                  ),
                }}
              />
            </Box>
          </Paper>

          {/* Stats Cards */}
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={6} sm={6} md={3}>
              <AnimatedStatCard
                value={stats.available}
                label="Available"
                icon={<CheckCircle sx={{ fontSize: 24, color: "#fff" }} />}
                gradient="linear-gradient(135deg, #10b981 0%, #059669 100%)"
                delay={0}
              />
            </Grid>
            <Grid item xs={6} sm={6} md={3}>
              <AnimatedStatCard
                value={stats.onCall}
                label="On Call"
                icon={<PhoneInTalk sx={{ fontSize: 24, color: "#fff" }} />}
                gradient="linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)"
                delay={100}
              />
            </Grid>
            <Grid item xs={6} sm={6} md={3}>
              <AnimatedStatCard
                value={stats.onBreak}
                label="On Break"
                icon={<AccessTime sx={{ fontSize: 24, color: "#fff" }} />}
                gradient="linear-gradient(135deg, #f59e0b 0%, #d97706 100%)"
                delay={200}
              />
            </Grid>
            <Grid item xs={6} sm={6} md={3}>
              <AnimatedStatCard
                value={stats.totalAgents}
                label="Total Team"
                icon={<Group sx={{ fontSize: 24, color: "#fff" }} />}
                gradient={THEME_COLORS.gradient}
                delay={300}
              />
            </Grid>
          </Grid>

          {/* Controls */}
          <Paper
            elevation={0}
            sx={{
              bgcolor: "#fff",
              borderRadius: "16px",
              p: 2,
              mb: 3,
              display: "flex",
              alignItems: "center",
              gap: 2,
              flexWrap: "wrap",
            }}
          >
            <FormControl size="small" sx={{ minWidth: 140 }}>
              <Select
                value={csvFilter}
                onChange={(e) => setCsvFilter(e.target.value)}
                sx={{
                  borderRadius: "10px",
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: "rgba(20, 184, 166, 0.2)",
                  },
                  "&:hover .MuiOutlinedInput-notchedOutline": {
                    borderColor: THEME_COLORS.primary,
                  },
                }}
              >
                <MenuItem value="all">All Time</MenuItem>
                <MenuItem value="daily">Last 24 Hours</MenuItem>
                <MenuItem value="weekly">Last 7 Days</MenuItem>
                <MenuItem value="monthly">Last 30 Days</MenuItem>
                <MenuItem value="custom">Custom Date Range</MenuItem>
              </Select>
            </FormControl>

            {csvFilter === "custom" && (
              <>
                <TextField
                  type="date"
                  size="small"
                  label="From Date"
                  value={customDateFrom}
                  onChange={(e) => setCustomDateFrom(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  sx={{
                    minWidth: 150,
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "10px",
                      "& fieldset": { borderColor: "rgba(20, 184, 166, 0.2)" },
                      "&:hover fieldset": { borderColor: THEME_COLORS.primary },
                    },
                  }}
                />
                <TextField
                  type="date"
                  size="small"
                  label="To Date"
                  value={customDateTo}
                  onChange={(e) => setCustomDateTo(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  sx={{
                    minWidth: 150,
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "10px",
                      "& fieldset": { borderColor: "rgba(20, 184, 166, 0.2)" },
                      "&:hover fieldset": { borderColor: THEME_COLORS.primary },
                    },
                  }}
                />
              </>
            )}

            <FormControl size="small" sx={{ minWidth: 140 }}>
              <Select
                value={csvTeamFilter}
                onChange={(e) => setCsvTeamFilter(e.target.value)}
                sx={{
                  borderRadius: "10px",
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: "rgba(20, 184, 166, 0.2)",
                  },
                  "&:hover .MuiOutlinedInput-notchedOutline": {
                    borderColor: THEME_COLORS.primary,
                  },
                }}
              >
                <MenuItem value="my-team">My Team Only</MenuItem>
                <MenuItem value="all-agents">All Agents</MenuItem>
              </Select>
            </FormControl>

            <Button
              onClick={handleDownloadTeamCSV}
              startIcon={<FileDownload />}
              sx={{
                bgcolor: THEME_COLORS.primary,
                color: "#fff",
                fontWeight: 600,
                borderRadius: "10px",
                px: 3,
                textTransform: "none",
                "&:hover": {
                  bgcolor: THEME_COLORS.primaryDark,
                },
              }}
            >
              Download CSV
            </Button>

            <Box sx={{ flex: 1 }} />

            <Box sx={{ display: "flex", gap: 1 }}>
              <Tooltip title="Grid View">
                <IconButton
                  onClick={() => setIsGridView(true)}
                  sx={{
                    bgcolor: isGridView ? THEME_COLORS.primary : "transparent",
                    color: isGridView ? "#fff" : THEME_COLORS.textSecondary,
                    "&:hover": {
                      bgcolor: isGridView ? THEME_COLORS.primaryDark : "rgba(20, 184, 166, 0.1)",
                    },
                  }}
                >
                  <ViewModule />
                </IconButton>
              </Tooltip>
              <Tooltip title="List View">
                <IconButton
                  onClick={() => setIsGridView(false)}
                  sx={{
                    bgcolor: !isGridView ? THEME_COLORS.primary : "transparent",
                    color: !isGridView ? "#fff" : THEME_COLORS.textSecondary,
                    "&:hover": {
                      bgcolor: !isGridView ? THEME_COLORS.primaryDark : "rgba(20, 184, 166, 0.1)",
                    },
                  }}
                >
                  <ViewList />
                </IconButton>
              </Tooltip>
            </Box>
          </Paper>

          {/* Team Members */}
          <Box sx={{ mb: 3 }}>
            <Typography
              variant="h5"
              sx={{
                fontWeight: 700,
                color: THEME_COLORS.textPrimary,
                mb: 2,
                display: "flex",
                alignItems: "center",
                gap: 1,
              }}
            >
              <MedicalServices sx={{ color: THEME_COLORS.primary }} />
              Team Members
              {searchQuery && (
                <Chip
                  label={`${filteredTeamAgents.length} results`}
                  size="small"
                  sx={{
                    bgcolor: "rgba(20, 184, 166, 0.1)",
                    color: THEME_COLORS.primary,
                    fontWeight: 600,
                  }}
                />
              )}
            </Typography>

            {filteredTeamAgents.length === 0 ? (
              <Paper
                elevation={0}
                sx={{
                  bgcolor: "#fff",
                  borderRadius: "16px",
                  p: 6,
                  textAlign: "center",
                }}
              >
                <Group sx={{ fontSize: 64, color: "rgba(20, 184, 166, 0.2)", mb: 2 }} />
                <Typography variant="h6" sx={{ color: THEME_COLORS.textSecondary }}>
                  {searchQuery ? "No agents match your search" : "No team members assigned yet"}
                </Typography>
              </Paper>
            ) : isGridView ? (
              <Grid container spacing={3}>
                {filteredTeamAgents.map((agent) => (
                  <Grid item xs={12} sm={6} md={4} lg={3} key={`${agent.collection}-${agent.uid}`}>
                    <AgentCard
                      agent={agent}
                      onCardClick={handleCardClick}
                      onDownloadCSV={handleDownloadAgentCSV}
                      callLogs={callLogs}
                      isGridView={true}
                    />
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {filteredTeamAgents.map((agent) => (
                  <AgentCard
                    key={`${agent.collection}-${agent.uid}`}
                    agent={agent}
                    onCardClick={handleCardClick}
                    onDownloadCSV={handleDownloadAgentCSV}
                    callLogs={callLogs}
                    isGridView={false}
                  />
                ))}
              </Box>
            )}
          </Box>

          {/* Matching Call Logs (when searching) */}
          {searchQuery && filteredCallLogs.length > 0 && (
            <Paper
              elevation={0}
              sx={{
                bgcolor: "#fff",
                borderRadius: "16px",
                overflow: "hidden",
              }}
            >
              <Box
                sx={{
                  p: 2,
                  borderBottom: "1px solid rgba(20, 184, 166, 0.1)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Typography variant="h6" sx={{ fontWeight: 700, color: THEME_COLORS.textPrimary }}>
                  Matching Call Logs
                  <Chip
                    label={`${filteredCallLogs.length} results`}
                    size="small"
                    sx={{ ml: 1, bgcolor: "rgba(20, 184, 166, 0.1)", color: THEME_COLORS.primary }}
                  />
                </Typography>
              </Box>

              <Box sx={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ background: "rgba(20, 184, 166, 0.05)" }}>
                      {["Date/Time", "Agent", "Client", "SID", "Type", "Status", "Duration", "Recording"].map((header) => (
                        <th
                          key={header}
                          style={{
                            padding: "16px",
                            textAlign: "left",
                            color: THEME_COLORS.textSecondary,
                            fontWeight: 600,
                            fontSize: "0.75rem",
                            textTransform: "uppercase",
                            letterSpacing: "0.5px",
                          }}
                        >
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCallLogs.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((log, index) => (
                      <tr
                        key={`${log.callId}-${index}`}
                        style={{
                          borderBottom: "1px solid rgba(20, 184, 166, 0.05)",
                          transition: "background-color 0.2s",
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgba(20, 184, 166, 0.02)")}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                      >
                        <td style={{ padding: "16px", color: THEME_COLORS.textSecondary, fontSize: "0.875rem" }}>
                          {log.timestamp ? new Date(log.timestamp.seconds * 1000).toLocaleString() : "N/A"}
                        </td>
                        <td style={{ padding: "16px", color: THEME_COLORS.textPrimary, fontWeight: 600, fontSize: "0.875rem" }}>
                          {log.agentName || "N/A"}
                        </td>
                        <td style={{ padding: "16px", color: THEME_COLORS.textSecondary, fontSize: "0.875rem" }}>
                          {log.clientNumber || "N/A"}
                        </td>
                        <td style={{ padding: "16px", color: THEME_COLORS.primary, fontSize: "0.8rem", fontFamily: "monospace" }}>
                          {log.sid?.substring(0, 12) || "N/A"}...
                        </td>
                        <td style={{ padding: "16px", color: THEME_COLORS.textSecondary, fontSize: "0.875rem" }}>
                          {log.callType || "N/A"}
                        </td>
                        <td style={{ padding: "16px" }}>
                          <Chip
                            size="small"
                            label={log.callConnected ? "Connected" : "Not Connected"}
                            sx={{
                              bgcolor: log.callConnected ? "rgba(16, 185, 129, 0.1)" : "rgba(239, 68, 68, 0.1)",
                              color: log.callConnected ? "#10b981" : "#ef4444",
                              fontWeight: 600,
                              fontSize: "0.7rem",
                            }}
                          />
                        </td>
                        <td style={{ padding: "16px", color: THEME_COLORS.textSecondary, fontSize: "0.875rem" }}>
                          {formatDuration(log.duration)}
                        </td>
                        <td style={{ padding: "16px" }}>
                          {log.sid ? (
                            <IconButton
                              size="small"
                              onClick={() => fetchRecording(log.sid)}
                              disabled={loadingRecordings[log.sid]}
                              sx={{
                                bgcolor: THEME_COLORS.primary,
                                color: "#fff",
                                "&:hover": { bgcolor: THEME_COLORS.primaryDark },
                                "&:disabled": { bgcolor: "grey.300" },
                              }}
                            >
                              {loadingRecordings[log.sid] ? (
                                <CircularProgress size={20} color="inherit" />
                              ) : (
                                <PlayArrow fontSize="small" />
                              )}
                            </IconButton>
                          ) : (
                            <Typography variant="caption" sx={{ color: THEME_COLORS.textSecondary }}>
                              N/A
                            </Typography>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Box>

              <TablePagination
                component="div"
                count={filteredCallLogs.length}
                page={page}
                onPageChange={(e, newPage) => setPage(newPage)}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={(e) => {
                  setRowsPerPage(parseInt(e.target.value, 10));
                  setPage(0);
                }}
                rowsPerPageOptions={[5, 10, 25, 50]}
                sx={{
                  borderTop: "1px solid rgba(20, 184, 166, 0.1)",
                  "& .MuiTablePagination-select": {
                    borderRadius: "8px",
                  },
                }}
              />
            </Paper>
          )}
        </>
      )}

      {/* Tab 1: Analytics */}
      {activeTab === 1 && (
        <Box>
          {/* Analytics Header with Gradient */}
          <Paper
            elevation={0}
            sx={{
              background: "linear-gradient(135deg, #059669 0%, #10b981 50%, #34d399 100%)",
              borderRadius: "24px",
              p: { xs: 3, md: 4 },
              mb: 3,
              position: "relative",
              overflow: "hidden",
            }}
          >
            {/* Decorative wave */}
            <Box
              sx={{
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                height: "40%",
                background: "rgba(255,255,255,0.1)",
                borderRadius: "100% 100% 0 0",
              }}
            />

            <Box sx={{ position: "relative", zIndex: 1 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: "12px",
                    bgcolor: "rgba(255,255,255,0.2)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Analytics sx={{ color: "#fff", fontSize: 28 }} />
                </Box>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 800, color: "#fff" }}>
                    Call Analytics Dashboard
                  </Typography>
                  <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.9)" }}>
                    Comprehensive insights into call performance and trends
                  </Typography>
                </Box>
              </Box>

              {/* Stats Cards Row - 4 cards */}
              <Grid container spacing={2} sx={{ mt: 2 }}>
                <Grid item xs={6} sm={6} md={3}>
                  <Paper
                    elevation={0}
                    sx={{
                      bgcolor: "#059669",
                      borderRadius: "16px",
                      p: 2,
                      textAlign: "center",
                      position: "relative",
                      overflow: "hidden",
                    }}
                  >
                    <Box sx={{ position: "absolute", top: 8, right: 8, opacity: 0.3 }}>
                      <Phone sx={{ fontSize: 28, color: "#fff" }} />
                    </Box>
                    <Typography variant="h3" sx={{ fontWeight: 800, color: "#fff", fontSize: { xs: "1.8rem", md: "2.5rem" } }}>
                      {filteredStats.totalCalls}
                    </Typography>
                    <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.9)", textTransform: "uppercase", fontWeight: 600, letterSpacing: 1 }}>
                      Total Calls
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={6} sm={6} md={3}>
                  <Paper
                    elevation={0}
                    sx={{
                      bgcolor: "#22c55e",
                      borderRadius: "16px",
                      p: 2,
                      textAlign: "center",
                      position: "relative",
                      overflow: "hidden",
                    }}
                  >
                    <Box sx={{ position: "absolute", top: 8, right: 8, opacity: 0.3 }}>
                      <CheckCircle sx={{ fontSize: 28, color: "#fff" }} />
                    </Box>
                    <Typography variant="h3" sx={{ fontWeight: 800, color: "#fff", fontSize: { xs: "1.8rem", md: "2.5rem" } }}>
                      {filteredStats.connectedCalls}
                    </Typography>
                    <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.9)", textTransform: "uppercase", fontWeight: 600, letterSpacing: 1 }}>
                      Connected
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={6} sm={6} md={3}>
                  <Paper
                    elevation={0}
                    sx={{
                      bgcolor: "#ef4444",
                      borderRadius: "16px",
                      p: 2,
                      textAlign: "center",
                      position: "relative",
                      overflow: "hidden",
                    }}
                  >
                    <Box sx={{ position: "absolute", top: 8, right: 8, opacity: 0.3 }}>
                      <Cancel sx={{ fontSize: 28, color: "#fff" }} />
                    </Box>
                    <Typography variant="h3" sx={{ fontWeight: 800, color: "#fff", fontSize: { xs: "1.8rem", md: "2.5rem" } }}>
                      {filteredStats.notConnectedCalls}
                    </Typography>
                    <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.9)", textTransform: "uppercase", fontWeight: 600, letterSpacing: 1 }}>
                      Not Connected
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={6} sm={4} md={3}>
                  <Paper
                    elevation={0}
                    sx={{
                      bgcolor: "#f59e0b",
                      borderRadius: "16px",
                      p: 2,
                      textAlign: "center",
                      position: "relative",
                      overflow: "hidden",
                    }}
                  >
                    <Box sx={{ position: "absolute", top: 8, right: 8, opacity: 0.3 }}>
                      <TrendingUp sx={{ fontSize: 28, color: "#fff" }} />
                    </Box>
                    <Typography variant="h3" sx={{ fontWeight: 800, color: "#fff", fontSize: { xs: "1.8rem", md: "2.5rem" } }}>
                      {filteredStats.successRate}%
                    </Typography>
                    <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.9)", textTransform: "uppercase", fontWeight: 600, letterSpacing: 1 }}>
                      Success Rate
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>
            </Box>
          </Paper>

          {/* Filters Section */}
          <Paper
            elevation={0}
            sx={{
              bgcolor: "#fff",
              borderRadius: "16px",
              p: 3,
              mb: 3,
            }}
          >
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, color: THEME_COLORS.primary }}>
                Filters
              </Typography>
              <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", alignItems: "center" }}>
                <FormControl size="small" sx={{ minWidth: 140 }}>
                  <InputLabel>Date Range</InputLabel>
                  <Select
                    value={dateRangeFilter}
                    onChange={(e) => setDateRangeFilter(e.target.value)}
                    label="Date Range"
                    sx={{ borderRadius: "10px" }}
                  >
                    <MenuItem value="today">Today</MenuItem>
                    <MenuItem value="last7">Last 7 Days</MenuItem>
                    <MenuItem value="last30">Last 30 Days</MenuItem>
                    <MenuItem value="all">All Time</MenuItem>
                  </Select>
                </FormControl>
                <FormControl size="small" sx={{ minWidth: 140 }}>
                  <InputLabel>Direction</InputLabel>
                  <Select
                    value={directionFilter}
                    onChange={(e) => setDirectionFilter(e.target.value)}
                    label="Direction"
                    sx={{ borderRadius: "10px" }}
                  >
                    <MenuItem value="all">All Directions</MenuItem>
                    <MenuItem value="inbound">Inbound</MenuItem>
                    <MenuItem value="outbound">Outbound</MenuItem>
                  </Select>
                </FormControl>
                <FormControl size="small" sx={{ minWidth: 140 }}>
                  <InputLabel>Agent</InputLabel>
                  <Select
                    value={agentFilter}
                    onChange={(e) => setAgentFilter(e.target.value)}
                    label="Agent"
                    sx={{ borderRadius: "10px" }}
                    startAdornment={
                      <InputAdornment position="start">
                        <SearchIcon sx={{ fontSize: 18 }} />
                      </InputAdornment>
                    }
                  >
                    <MenuItem value="all">All Agents</MenuItem>
                    {teamAgents.map((agent) => (
                      <MenuItem key={agent.uid} value={agent.uid}>
                        {agent.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <Button
                  onClick={resetFilters}
                  startIcon={<Refresh />}
                  sx={{
                    color: THEME_COLORS.primary,
                    textTransform: "none",
                    fontWeight: 600,
                  }}
                >
                  Reset
                </Button>
              </Box>
            </Box>
          </Paper>

          {/* Analytics Sub-tabs */}
          <Paper
            elevation={0}
            sx={{
              bgcolor: "#fff",
              borderRadius: "16px",
              mb: 3,
              overflow: "hidden",
            }}
          >
            <Tabs
              value={analyticsSubTab}
              onChange={(e, newVal) => setAnalyticsSubTab(newVal)}
              sx={{
                borderBottom: "1px solid rgba(5, 150, 105, 0.1)",
                "& .MuiTab-root": {
                  color: THEME_COLORS.textSecondary,
                  fontWeight: 600,
                  textTransform: "none",
                  fontSize: "0.95rem",
                  minHeight: 56,
                  "&.Mui-selected": { color: "#10b981" },
                },
                "& .MuiTabs-indicator": { backgroundColor: "#10b981", height: 3 },
              }}
            >
              <Tab icon={<TrendingUp sx={{ mr: 1 }} />} iconPosition="start" label="Overview" />
              <Tab icon={<Analytics sx={{ mr: 1 }} />} iconPosition="start" label="Trends" />
              <Tab icon={<Group sx={{ mr: 1 }} />} iconPosition="start" label="Agent Performance" />
              <Tab icon={<Analytics sx={{ mr: 1 }} />} iconPosition="start" label="Daily Stats" />
            </Tabs>
          </Paper>

          {/* Sub-tab 0: Overview */}
          {analyticsSubTab === 0 && (
            <Grid container spacing={3}>
              {/* Call Trend Chart */}
              <Grid item xs={12} lg={8}>
                <ChartCard
                  title="Calls Trend (Last 7 Days)"
                  chartData={analyticsData.callsByDate}
                  columns={["date", "total", "connected", "notConnected"]}
                  height={300}
                  chartElement={
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={analyticsData.callsByDate}>
                        <defs>
                          <linearGradient id="colorConnectedHealthTL" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                          </linearGradient>
                          <linearGradient id="colorNotConnectedHealthTL" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                        <YAxis tick={{ fontSize: 12 }} />
                        <RechartsTooltip content={<CustomChartTooltip />} />
                        <Legend />
                        <Area type="monotone" dataKey="connected" stroke="#22c55e" fillOpacity={1} fill="url(#colorConnectedHealthTL)" name="Connected" strokeWidth={2} />
                        <Area type="monotone" dataKey="notConnected" stroke="#ef4444" fillOpacity={1} fill="url(#colorNotConnectedHealthTL)" name="Not Connected" strokeWidth={2} />
                      </AreaChart>
                    </ResponsiveContainer>
                  }
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={analyticsData.callsByDate}>
                      <defs>
                        <linearGradient id="colorConnectedHealthTLSmall" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="colorNotConnectedHealthTLSmall" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <RechartsTooltip content={<CustomChartTooltip />} />
                      <Legend />
                      <Area type="monotone" dataKey="connected" stroke="#22c55e" fillOpacity={1} fill="url(#colorConnectedHealthTLSmall)" name="Connected" strokeWidth={2} />
                      <Area type="monotone" dataKey="notConnected" stroke="#ef4444" fillOpacity={1} fill="url(#colorNotConnectedHealthTLSmall)" name="Not Connected" strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </ChartCard>
              </Grid>

              {/* Call Status Distribution */}
              <Grid item xs={12} lg={4}>
                <ChartCard
                  title="Call Status Distribution"
                  chartData={analyticsData.callStatus}
                  columns={["name", "value"]}
                  height={300}
                  chartElement={
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={analyticsData.callStatus} cx="50%" cy="50%" innerRadius={80} outerRadius={130} dataKey="value" label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}>
                          {analyticsData.callStatus.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <RechartsTooltip content={<CustomChartTooltip />} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  }
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={analyticsData.callStatus} cx="50%" cy="50%" innerRadius={60} outerRadius={100} dataKey="value" label={({ percent }) => `${(percent * 100).toFixed(0)}%`}>
                        {analyticsData.callStatus.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <RechartsTooltip content={<CustomChartTooltip />} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </ChartCard>
              </Grid>

              {/* Calls by Type - Shows Manual Leads, Inbound, etc. */}
              <Grid item xs={12} md={6}>
                <ChartCard
                  title="Calls by Type"
                  chartData={analyticsData.callsByType}
                  columns={["name", "value"]}
                  height={280}
                  chartElement={
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={analyticsData.callsByType}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                        <YAxis tick={{ fontSize: 11 }} />
                        <RechartsTooltip content={<CustomChartTooltip />} />
                        <Bar dataKey="value" fill="#10b981" radius={[8, 8, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  }
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analyticsData.callsByType}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 10 }} />
                      <RechartsTooltip content={<CustomChartTooltip />} />
                      <Bar dataKey="value" fill="#10b981" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartCard>
              </Grid>
            </Grid>
          )}

          {/* Sub-tab 1: Trends */}
          {analyticsSubTab === 1 && (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <ChartCard
                  title="Connection Rate Trend"
                  chartData={analyticsData.connectionRateTrend}
                  columns={["date", "rate", "total"]}
                  height={350}
                  chartElement={
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={analyticsData.connectionRateTrend}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                        <YAxis tick={{ fontSize: 12 }} domain={[0, 100]} />
                        <RechartsTooltip content={<CustomChartTooltip />} />
                        <Legend />
                        <Line type="monotone" dataKey="rate" stroke="#f59e0b" name="Success Rate %" strokeWidth={3} dot={{ r: 5 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  }
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={analyticsData.connectionRateTrend}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} domain={[0, 100]} />
                      <RechartsTooltip content={<CustomChartTooltip />} />
                      <Line type="monotone" dataKey="rate" stroke="#f59e0b" name="Success Rate %" strokeWidth={2} dot={{ r: 3 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartCard>
              </Grid>

              <Grid item xs={12} md={6}>
                <ChartCard
                  title="Day of Week Analysis"
                  chartData={analyticsData.dayOfWeekData}
                  columns={["day", "calls", "connected"]}
                  height={300}
                  chartElement={
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={analyticsData.dayOfWeekData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis dataKey="day" />
                        <YAxis />
                        <RechartsTooltip content={<CustomChartTooltip />} />
                        <Legend />
                        <Bar dataKey="calls" fill="#10b981" name="Total Calls" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="connected" fill="#22c55e" name="Connected" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  }
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analyticsData.dayOfWeekData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <RechartsTooltip content={<CustomChartTooltip />} />
                      <Legend wrapperStyle={{ fontSize: 10 }} />
                      <Bar dataKey="calls" fill="#10b981" name="Total Calls" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="connected" fill="#22c55e" name="Connected" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartCard>
              </Grid>

              <Grid item xs={12} md={6}>
                <ChartCard
                  title="Hourly Call Distribution"
                  chartData={analyticsData.hourlyDistribution.filter(h => h.calls > 0)}
                  columns={["hour", "calls", "connected"]}
                  height={300}
                  chartElement={
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={analyticsData.hourlyDistribution.filter(h => h.calls > 0)}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis dataKey="hour" />
                        <YAxis />
                        <RechartsTooltip content={<CustomChartTooltip />} />
                        <Legend />
                        <Area type="monotone" dataKey="calls" stroke="#6366f1" fill="#6366f1" fillOpacity={0.3} name="Total" />
                        <Area type="monotone" dataKey="connected" stroke="#22c55e" fill="#22c55e" fillOpacity={0.3} name="Connected" />
                      </AreaChart>
                    </ResponsiveContainer>
                  }
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={analyticsData.hourlyDistribution.filter(h => h.calls > 0)}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="hour" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 10 }} />
                      <RechartsTooltip content={<CustomChartTooltip />} />
                      <Area type="monotone" dataKey="calls" stroke="#6366f1" fill="#6366f1" fillOpacity={0.2} name="Total" />
                    </AreaChart>
                  </ResponsiveContainer>
                </ChartCard>
              </Grid>
            </Grid>
          )}

          {/* Sub-tab 2: Agent Performance */}
          {analyticsSubTab === 2 && (
            <Grid container spacing={3}>
              <Grid item xs={12} lg={6}>
                <ChartCard
                  title="Top 5 Performers"
                  chartData={analyticsData.topAgents}
                  columns={["name", "totalCalls", "connectedCalls", "successRate"]}
                  height={350}
                  chartElement={
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={analyticsData.topAgents} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis type="number" />
                        <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 12 }} />
                        <RechartsTooltip content={<CustomChartTooltip />} />
                        <Legend />
                        <Bar dataKey="connectedCalls" fill="#22c55e" name="Connected" radius={[0, 4, 4, 0]} />
                        <Bar dataKey="totalCalls" fill="#10b981" name="Total Calls" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  }
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analyticsData.topAgents} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis type="number" tick={{ fontSize: 10 }} />
                      <YAxis dataKey="name" type="category" width={80} tick={{ fontSize: 10 }} />
                      <RechartsTooltip content={<CustomChartTooltip />} />
                      <Legend wrapperStyle={{ fontSize: 10 }} />
                      <Bar dataKey="connectedCalls" fill="#22c55e" name="Connected" radius={[0, 4, 4, 0]} />
                      <Bar dataKey="totalCalls" fill="#10b981" name="Total" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartCard>
              </Grid>

              {/* Agent Leaderboard Card */}
              <Grid item xs={12} lg={6}>
                <Card
                  elevation={0}
                  sx={{
                    border: "1px solid",
                    borderColor: "divider",
                    borderRadius: 3,
                    height: "100%",
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Typography variant="h6" fontWeight={700} color="#10b981" sx={{ mb: 2 }}>
                      Agent Leaderboard
                    </Typography>
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                      {analyticsData.topAgents.map((agent, index) => (
                        <Box
                          key={agent.name}
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 2,
                            p: 2,
                            borderRadius: 2,
                            bgcolor: index === 0 ? "rgba(16, 185, 129, 0.1)" : "#f8fafc",
                            border: index === 0 ? "1px solid #10b981" : "none",
                          }}
                        >
                          <Typography
                            variant="h5"
                            sx={{
                              fontWeight: 800,
                              color: index === 0 ? "#10b981" : index === 1 ? "#6b7280" : "#9ca3af",
                              width: 30,
                            }}
                          >
                            #{index + 1}
                          </Typography>
                          <Avatar sx={{ bgcolor: "#10b981", width: 40, height: 40, fontSize: "1rem" }}>
                            {agent.name?.charAt(0) || "A"}
                          </Avatar>
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="subtitle2" fontWeight={600}>
                              {agent.fullName || agent.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {agent.totalCalls} calls • {agent.successRate}% success
                            </Typography>
                          </Box>
                          <Chip
                            label={`${agent.connectedCalls} connected`}
                            size="small"
                            sx={{
                              bgcolor: "rgba(34, 197, 94, 0.1)",
                              color: "#22c55e",
                              fontWeight: 600,
                            }}
                          />
                        </Box>
                      ))}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}

          {/* Sub-tab 3: Daily Stats */}
          {analyticsSubTab === 3 && (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <ChartCard
                  title="Daily Call Volume"
                  chartData={analyticsData.callsByDate}
                  columns={["date", "total", "connected", "notConnected"]}
                  height={400}
                  chartElement={
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={analyticsData.callsByDate}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <RechartsTooltip content={<CustomChartTooltip />} />
                        <Legend />
                        <Bar dataKey="connected" stackId="a" fill="#22c55e" name="Connected" />
                        <Bar dataKey="notConnected" stackId="a" fill="#ef4444" name="Not Connected" />
                      </BarChart>
                    </ResponsiveContainer>
                  }
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analyticsData.callsByDate}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <RechartsTooltip content={<CustomChartTooltip />} />
                      <Legend />
                      <Bar dataKey="connected" stackId="a" fill="#22c55e" name="Connected" />
                      <Bar dataKey="notConnected" stackId="a" fill="#ef4444" name="Not Connected" />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartCard>
              </Grid>
            </Grid>
          )}
        </Box>
      )}

      {/* Tab 2: Log Calls (Agent View) */}
      {activeTab === 2 && (
        <Paper
          elevation={0}
          sx={{
            bgcolor: "#fff",
            borderRadius: "20px",
            p: 3,
          }}
        >
          <AgentView
            currentUser={currentUser}
            onStatusChange={(agentId, newStatus) => {}}
          />
        </Paper>
      )}
    </Box>
  );
}

export default HealthTLDashboard;
