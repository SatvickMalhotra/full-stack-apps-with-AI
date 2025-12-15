import React, { useState, useMemo, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Chip,
  Autocomplete,
  IconButton,
  Menu,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  InputAdornment,
  Avatar,
  Tabs,
  Tab,
  LinearProgress,
  Tooltip,
  Badge,
  Fade,
  Zoom,
} from "@mui/material";
import {
  Phone,
  TrendingUp,
  CheckCircle,
  Cancel,
  AccessTime,
  MoreVert,
  ZoomOutMap,
  TableChart,
  Download,
  Refresh,
  Search,
  ArrowBack,
  PhoneCallback,
  PhoneForwarded,
  Timer,
  Speed,
  EmojiEvents,
  Analytics,
  BarChart as BarChartIcon,
  PieChart as PieChartIcon,
  ShowChart,
  CallMade,
  CallReceived,
  Warning,
  Star,
  Person,
  Groups,
  CalendarToday,
  Schedule,
} from "@mui/icons-material";
import {
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  RadialBarChart,
  RadialBar,
} from "recharts";

// Modern Analytics Theme - Cyan/Blue gradient theme
const ANALYTICS_GRADIENTS = {
  primary: "linear-gradient(135deg, #0891b2 0%, #0e7490 100%)",
  secondary: "linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)",
  accent: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
  success: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
  danger: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
  purple: "linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)",
  pink: "linear-gradient(135deg, #ec4899 0%, #db2777 100%)",
  indigo: "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)",
  dark: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)",
};

const ANALYTICS_COLORS = {
  primary: "#0891b2",
  secondary: "#06b6d4",
  accent: "#f59e0b",
  success: "#10b981",
  danger: "#ef4444",
  warning: "#f59e0b",
  purple: "#8b5cf6",
  pink: "#ec4899",
  indigo: "#6366f1",
  text: "#0f172a",
  textSecondary: "#64748b",
  background: "#f8fafc",
  cardBg: "#ffffff",
};

// Animated Counter Hook
const useAnimatedCounter = (end, duration = 1500) => {
  const [count, setCount] = useState(0);
  const countRef = useRef(null);

  useEffect(() => {
    if (end === 0) {
      setCount(0);
      return;
    }

    const startTime = Date.now();
    const animate = () => {
      const now = Date.now();
      const progress = Math.min((now - startTime) / duration, 1);
      const easeOut = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(end * easeOut));
      if (progress < 1) {
        countRef.current = requestAnimationFrame(animate);
      }
    };
    countRef.current = requestAnimationFrame(animate);
    return () => {
      if (countRef.current) cancelAnimationFrame(countRef.current);
    };
  }, [end, duration]);

  return count;
};

// Animated Stat Card Component
const AnimatedStatCard = ({ title, value, subtitle, icon, gradient, suffix = "", isString = false, delay = 0 }) => {
  const numericValue = isString ? 0 : (typeof value === 'number' ? value : parseFloat(value) || 0);
  const animatedValue = useAnimatedCounter(numericValue, 1500 + delay);
  const displayValue = isString ? value : `${animatedValue.toLocaleString()}${suffix}`;

  return (
    <Zoom in={true} style={{ transitionDelay: `${delay}ms` }}>
      <Card
        sx={{
          background: gradient,
          borderRadius: "20px",
          height: "150px",
          position: "relative",
          overflow: "hidden",
          transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
          boxShadow: "0 10px 40px rgba(8, 145, 178, 0.3)",
          "&:hover": {
            transform: "translateY(-8px) scale(1.02)",
            boxShadow: "0 20px 60px rgba(8, 145, 178, 0.4)",
          },
        }}
      >
        {/* Decorative circles */}
        <Box
          sx={{
            position: "absolute",
            top: -30,
            right: -30,
            width: 120,
            height: 120,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.1)",
          }}
        />
        <Box
          sx={{
            position: "absolute",
            bottom: -40,
            left: -40,
            width: 100,
            height: 100,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.08)",
          }}
        />

        <CardContent sx={{ height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", position: "relative", zIndex: 1, p: 2.5 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <Box
              sx={{
                bgcolor: "rgba(255, 255, 255, 0.2)",
                borderRadius: "14px",
                p: 1.2,
                backdropFilter: "blur(10px)",
              }}
            >
              {icon}
            </Box>
          </Box>
          <Box>
            <Typography
              variant="h3"
              fontWeight={800}
              color="#fff"
              sx={{
                textShadow: "0 2px 10px rgba(0,0,0,0.2)",
                fontSize: { xs: "1.8rem", md: "2.2rem" },
                letterSpacing: "-0.5px",
              }}
            >
              {displayValue}
            </Typography>
            <Typography
              variant="body2"
              color="rgba(255, 255, 255, 0.95)"
              fontWeight={600}
              sx={{ textTransform: "uppercase", letterSpacing: "1px", fontSize: "0.75rem" }}
            >
              {title}
            </Typography>
            {subtitle && (
              <Typography variant="caption" color="rgba(255, 255, 255, 0.8)" sx={{ display: "block", mt: 0.3 }}>
                {subtitle}
              </Typography>
            )}
          </Box>
        </CardContent>
      </Card>
    </Zoom>
  );
};

// Agent Performance Card
const AgentPerformanceCard = ({ agent, rank, maxCalls }) => {
  const percentage = maxCalls > 0 ? (agent.totalCalls / maxCalls) * 100 : 0;
  const getRankColor = () => {
    if (rank === 1) return "linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)";
    if (rank === 2) return "linear-gradient(135deg, #94a3b8 0%, #64748b 100%)";
    if (rank === 3) return "linear-gradient(135deg, #f97316 0%, #ea580c 100%)";
    return ANALYTICS_GRADIENTS.primary;
  };

  return (
    <Card
      sx={{
        borderRadius: "16px",
        border: `1px solid ${ANALYTICS_COLORS.primary}20`,
        transition: "all 0.3s ease",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: `0 12px 30px ${ANALYTICS_COLORS.primary}20`,
          borderColor: ANALYTICS_COLORS.primary,
        },
      }}
    >
      <CardContent sx={{ p: 2.5 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
          <Badge
            overlap="circular"
            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            badgeContent={
              rank <= 3 ? (
                <Avatar
                  sx={{
                    width: 22,
                    height: 22,
                    background: getRankColor(),
                    fontSize: "0.7rem",
                    fontWeight: 700,
                    border: "2px solid white",
                  }}
                >
                  {rank}
                </Avatar>
              ) : null
            }
          >
            <Avatar
              sx={{
                width: 50,
                height: 50,
                background: ANALYTICS_GRADIENTS.primary,
                fontSize: "1.2rem",
                fontWeight: 600,
              }}
            >
              {agent.name?.charAt(0) || "A"}
            </Avatar>
          </Badge>
          <Box sx={{ flex: 1 }}>
            <Typography variant="subtitle1" fontWeight={600} color={ANALYTICS_COLORS.text}>
              {agent.name || "Unknown Agent"}
            </Typography>
            <Typography variant="caption" color={ANALYTICS_COLORS.textSecondary}>
              {agent.role || "Agent"}
            </Typography>
          </Box>
          {rank <= 3 && (
            <EmojiEvents
              sx={{
                color: rank === 1 ? "#fbbf24" : rank === 2 ? "#94a3b8" : "#f97316",
                fontSize: 28,
              }}
            />
          )}
        </Box>

        <Grid container spacing={1} sx={{ mb: 2 }}>
          <Grid item xs={4}>
            <Box sx={{ textAlign: "center", p: 1, bgcolor: `${ANALYTICS_COLORS.primary}10`, borderRadius: "10px" }}>
              <Typography variant="h6" fontWeight={700} color={ANALYTICS_COLORS.primary}>
                {agent.totalCalls}
              </Typography>
              <Typography variant="caption" color={ANALYTICS_COLORS.textSecondary}>
                Total
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={4}>
            <Box sx={{ textAlign: "center", p: 1, bgcolor: `${ANALYTICS_COLORS.success}10`, borderRadius: "10px" }}>
              <Typography variant="h6" fontWeight={700} color={ANALYTICS_COLORS.success}>
                {agent.connected}
              </Typography>
              <Typography variant="caption" color={ANALYTICS_COLORS.textSecondary}>
                Connected
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={4}>
            <Box sx={{ textAlign: "center", p: 1, bgcolor: `${ANALYTICS_COLORS.accent}10`, borderRadius: "10px" }}>
              <Typography variant="h6" fontWeight={700} color={ANALYTICS_COLORS.accent}>
                {agent.rate}%
              </Typography>
              <Typography variant="caption" color={ANALYTICS_COLORS.textSecondary}>
                Rate
              </Typography>
            </Box>
          </Grid>
        </Grid>

        <Box>
          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
            <Typography variant="caption" color={ANALYTICS_COLORS.textSecondary}>
              Performance Score
            </Typography>
            <Typography variant="caption" fontWeight={600} color={ANALYTICS_COLORS.primary}>
              {percentage.toFixed(0)}%
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={percentage}
            sx={{
              height: 8,
              borderRadius: 4,
              bgcolor: `${ANALYTICS_COLORS.primary}15`,
              "& .MuiLinearProgress-bar": {
                borderRadius: 4,
                background: ANALYTICS_GRADIENTS.primary,
              },
            }}
          />
        </Box>
      </CardContent>
    </Card>
  );
};

// Helper function to export data to CSV
const exportToCSV = (data, filename, columns) => {
  if (!data || data.length === 0) {
    alert("No data to export");
    return;
  }

  const header = columns.join(",");
  const rows = data.map((row) => {
    return columns
      .map((col) => {
        const value = row[col] !== undefined ? row[col] : "";
        return typeof value === "string" && (value.includes(",") || value.includes('"'))
          ? `"${value.replace(/"/g, '""')}"`
          : value;
      })
      .join(",");
  });

  const csv = [header, ...rows].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", `${filename}_${new Date().toISOString().split("T")[0]}.csv`);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// Chart Card Component with Expand Button
const ChartCard = ({ title, children, chartData, columns, chartElement, height = 320 }) => {
  const [expandedOpen, setExpandedOpen] = useState(false);
  const [tableOpen, setTableOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);

  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        borderRadius: "20px",
        border: `1px solid ${ANALYTICS_COLORS.primary}20`,
        position: "relative",
        transition: "all 0.3s ease",
        "&:hover": {
          boxShadow: `0 12px 40px ${ANALYTICS_COLORS.primary}15`,
          transform: "translateY(-4px)",
        },
      }}
    >
      {/* Header with Title and Actions */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
        <Typography variant="h6" fontWeight={700} color={ANALYTICS_COLORS.primary}>
          {title}
        </Typography>
        <Box sx={{ display: "flex", gap: 0.5 }}>
          {/* Direct Expand Button */}
          <Tooltip title="Expand Chart">
            <IconButton
              size="small"
              onClick={() => setExpandedOpen(true)}
              sx={{
                bgcolor: `${ANALYTICS_COLORS.primary}10`,
                "&:hover": {
                  bgcolor: ANALYTICS_COLORS.primary,
                  "& .MuiSvgIcon-root": { color: "#fff" }
                },
                transition: "all 0.2s ease",
              }}
            >
              <ZoomOutMap sx={{ color: ANALYTICS_COLORS.primary, fontSize: 20 }} />
            </IconButton>
          </Tooltip>
          {/* More Options Menu */}
          <IconButton
            size="small"
            onClick={(e) => setAnchorEl(e.currentTarget)}
            sx={{
              bgcolor: `${ANALYTICS_COLORS.primary}10`,
              "&:hover": { bgcolor: `${ANALYTICS_COLORS.primary}20` },
            }}
          >
            <MoreVert sx={{ color: ANALYTICS_COLORS.primary, fontSize: 20 }} />
          </IconButton>
        </Box>
      </Box>

      {/* Chart Content */}
      <Box sx={{ height }}>{children}</Box>

      {/* More Options Menu */}
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
        <MenuItem
          onClick={() => {
            setExpandedOpen(true);
            setAnchorEl(null);
          }}
        >
          <ZoomOutMap sx={{ mr: 1, fontSize: 20, color: ANALYTICS_COLORS.primary }} />
          Expanded View
        </MenuItem>
        <MenuItem
          onClick={() => {
            setTableOpen(true);
            setAnchorEl(null);
          }}
        >
          <TableChart sx={{ mr: 1, fontSize: 20, color: ANALYTICS_COLORS.primary }} />
          Table View
        </MenuItem>
        <MenuItem
          onClick={() => {
            exportToCSV(chartData, title.replace(/\s+/g, "_"), columns);
            setAnchorEl(null);
          }}
        >
          <Download sx={{ mr: 1, fontSize: 20, color: ANALYTICS_COLORS.primary }} />
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
          borderBottom: `1px solid ${ANALYTICS_COLORS.primary}20`,
          background: ANALYTICS_GRADIENTS.primary,
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
        <DialogTitle sx={{ borderBottom: `1px solid ${ANALYTICS_COLORS.primary}20` }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Typography variant="h6" fontWeight={600} color={ANALYTICS_COLORS.primary}>
              {title} - Data Table
            </Typography>
            <Button
              startIcon={<Download />}
              onClick={() => exportToCSV(chartData, title.replace(/\s+/g, "_"), columns)}
              size="small"
              sx={{
                bgcolor: `${ANALYTICS_COLORS.primary}15`,
                color: ANALYTICS_COLORS.primary,
                textTransform: "none",
                fontWeight: 600,
                borderRadius: "10px",
                "&:hover": { bgcolor: `${ANALYTICS_COLORS.primary}25` },
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
                <TableRow sx={{ bgcolor: `${ANALYTICS_COLORS.primary}10` }}>
                  {columns.map((col) => (
                    <TableCell key={col} sx={{ fontWeight: 600, textTransform: "capitalize", color: ANALYTICS_COLORS.primary }}>
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
              color: ANALYTICS_COLORS.primary,
              borderColor: ANALYTICS_COLORS.primary,
              borderRadius: "10px",
              "&:hover": {
                bgcolor: `${ANALYTICS_COLORS.primary}10`,
                borderColor: ANALYTICS_COLORS.primary,
              }
            }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

// Chart Menu Component (kept for backwards compatibility)
const ChartMenu = ({ chartData, chartTitle, columns, chartElement }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [expandedOpen, setExpandedOpen] = useState(false);
  const [tableOpen, setTableOpen] = useState(false);

  return (
    <>
      <IconButton
        size="small"
        onClick={(e) => setAnchorEl(e.currentTarget)}
        sx={{
          position: "absolute",
          top: 12,
          right: 12,
          bgcolor: `${ANALYTICS_COLORS.primary}10`,
          "&:hover": { bgcolor: `${ANALYTICS_COLORS.primary}20` },
        }}
      >
        <MoreVert sx={{ color: ANALYTICS_COLORS.primary }} />
      </IconButton>

      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
        <MenuItem
          onClick={() => {
            setExpandedOpen(true);
            setAnchorEl(null);
          }}
        >
          <ZoomOutMap sx={{ mr: 1, fontSize: 20, color: ANALYTICS_COLORS.primary }} />
          Expanded View
        </MenuItem>
        <MenuItem
          onClick={() => {
            setTableOpen(true);
            setAnchorEl(null);
          }}
        >
          <TableChart sx={{ mr: 1, fontSize: 20, color: ANALYTICS_COLORS.primary }} />
          Table View
        </MenuItem>
        <MenuItem
          onClick={() => {
            exportToCSV(chartData, chartTitle.replace(/\s+/g, "_"), columns);
            setAnchorEl(null);
          }}
        >
          <Download sx={{ mr: 1, fontSize: 20, color: ANALYTICS_COLORS.primary }} />
          Export CSV
        </MenuItem>
      </Menu>

      {/* Expanded View Dialog */}
      <Dialog open={expandedOpen} onClose={() => setExpandedOpen(false)} maxWidth="lg" fullWidth>
        <DialogTitle sx={{ borderBottom: `1px solid ${ANALYTICS_COLORS.primary}20` }}>
          <Typography variant="h6" fontWeight={600} color={ANALYTICS_COLORS.primary}>
            {chartTitle}
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ width: "100%", height: 500, pt: 2 }}>{chartElement}</Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setExpandedOpen(false)} sx={{ color: ANALYTICS_COLORS.primary }}>
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Table View Dialog */}
      <Dialog open={tableOpen} onClose={() => setTableOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ borderBottom: `1px solid ${ANALYTICS_COLORS.primary}20` }}>
          <Typography variant="h6" fontWeight={600} color={ANALYTICS_COLORS.primary}>
            {chartTitle} - Data Table
          </Typography>
        </DialogTitle>
        <DialogContent>
          <TableContainer sx={{ mt: 2 }}>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: `${ANALYTICS_COLORS.primary}10` }}>
                  {columns.map((col) => (
                    <TableCell key={col} sx={{ fontWeight: 600, textTransform: "capitalize", color: ANALYTICS_COLORS.primary }}>
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
        <DialogActions>
          <Button onClick={() => setTableOpen(false)} sx={{ color: ANALYTICS_COLORS.primary }}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

// Custom Tooltip for Charts
const CustomChartTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <Paper
        elevation={8}
        sx={{
          p: 2,
          bgcolor: "rgba(255, 255, 255, 0.98)",
          backdropFilter: "blur(20px)",
          border: `1px solid ${ANALYTICS_COLORS.primary}30`,
          borderRadius: "12px",
        }}
      >
        <Typography variant="subtitle2" fontWeight={600} color={ANALYTICS_COLORS.text} sx={{ mb: 1 }}>
          {label}
        </Typography>
        {payload.map((entry, index) => (
          <Typography key={index} variant="body2" sx={{ color: entry.color, fontWeight: 500 }}>
            {entry.name}: {entry.value}
          </Typography>
        ))}
      </Paper>
    );
  }
  return null;
};

const CallAnalytics = ({ callLogs, agents, onBack }) => {
  const navigate = useNavigate();
  const [dateRange, setDateRange] = useState("7days");
  const [directionFilter, setDirectionFilter] = useState("all");
  const [agentFilter, setAgentFilter] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [activeTab, setActiveTab] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [tablePage, setTablePage] = useState(0);
  const [tableRowsPerPage, setTableRowsPerPage] = useState(10);

  const handleBack = () => {
    if (onBack && typeof onBack === "function") {
      onBack();
    } else {
      navigate(-1);
    }
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  // Filter call logs based on selected filters
  const filteredLogs = useMemo(() => {
    let filtered = [...callLogs];

    const now = new Date();
    let cutoffDate;

    if (dateRange === "custom" && startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      filtered = filtered.filter((log) => {
        if (!log.timestamp) return false;
        const logDate = new Date(log.timestamp);
        return logDate >= start && logDate <= end;
      });
    } else {
      switch (dateRange) {
        case "24h":
          cutoffDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
          break;
        case "7days":
          cutoffDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case "30days":
          cutoffDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        default:
          cutoffDate = new Date(0);
      }

      if (dateRange !== "all") {
        filtered = filtered.filter((log) => {
          if (!log.timestamp) return false;
          const logDate = new Date(log.timestamp);
          return logDate >= cutoffDate;
        });
      }
    }

    if (directionFilter !== "all") {
      filtered = filtered.filter((log) => {
        const callType = log.callType?.toLowerCase() || "";
        const direction = log.callDirection?.toLowerCase() || "";

        if (directionFilter === "inbound") {
          return callType.includes("inbound") || direction.includes("inbound");
        } else if (directionFilter === "outbound") {
          return !callType.includes("inbound") && !direction.includes("inbound");
        }
        return true;
      });
    }

    if (agentFilter !== "all") {
      filtered = filtered.filter((log) => log.agentId === agentFilter);
    }

    return filtered;
  }, [callLogs, dateRange, directionFilter, agentFilter, startDate, endDate]);

  // Calculate key metrics
  const metrics = useMemo(() => {
    const totalCalls = filteredLogs.length;
    const connectedCalls = filteredLogs.filter((log) => log.callConnected).length;
    const notConnectedCalls = totalCalls - connectedCalls;

    let totalDurationSeconds = 0;
    let durationCount = 0;

    filteredLogs.forEach((log) => {
      if (log.callConnected && log.duration) {
        const hours = log.duration.hours || 0;
        const minutes = log.duration.minutes || 0;
        const seconds = log.duration.seconds || 0;
        totalDurationSeconds += hours * 3600 + minutes * 60 + seconds;
        durationCount++;
      }
    });

    const avgDurationSeconds = durationCount > 0 ? Math.round(totalDurationSeconds / durationCount) : 0;
    const avgDurationMinutes = Math.floor(avgDurationSeconds / 60);
    const avgDurationRemainingSeconds = avgDurationSeconds % 60;

    const completionRate = totalCalls > 0 ? ((connectedCalls / totalCalls) * 100).toFixed(1) : 0;

    // Calculate inbound/outbound
    const inboundCalls = filteredLogs.filter(
      (log) => log.callType?.toLowerCase().includes("inbound") || log.callDirection?.toLowerCase().includes("inbound")
    ).length;
    const outboundCalls = totalCalls - inboundCalls;

    return {
      totalCalls,
      connectedCalls,
      notConnectedCalls,
      avgDuration: `${avgDurationMinutes}m ${avgDurationRemainingSeconds}s`,
      avgDurationSeconds,
      completionRate: parseFloat(completionRate),
      inboundCalls,
      outboundCalls,
      totalDurationHours: (totalDurationSeconds / 3600).toFixed(1),
    };
  }, [filteredLogs]);

  // Agent performance data
  const agentPerformanceData = useMemo(() => {
    const agentMap = new Map();

    filteredLogs.forEach((log) => {
      const agentId = log.agentId || "unknown";
      const agentInfo = agents.find((a) => (a.id || a.uid) === agentId);

      if (!agentMap.has(agentId)) {
        agentMap.set(agentId, {
          id: agentId,
          name: agentInfo?.name || log.agentName || "Unknown",
          role: agentInfo?.role || "Agent",
          totalCalls: 0,
          connected: 0,
          notConnected: 0,
          totalDuration: 0,
        });
      }

      const data = agentMap.get(agentId);
      data.totalCalls++;
      if (log.callConnected) {
        data.connected++;
        if (log.duration) {
          const hours = log.duration.hours || 0;
          const minutes = log.duration.minutes || 0;
          const seconds = log.duration.seconds || 0;
          data.totalDuration += hours * 3600 + minutes * 60 + seconds;
        }
      } else {
        data.notConnected++;
      }
    });

    return Array.from(agentMap.values())
      .map((agent) => ({
        ...agent,
        rate: agent.totalCalls > 0 ? ((agent.connected / agent.totalCalls) * 100).toFixed(1) : 0,
        avgDuration: agent.connected > 0 ? Math.round(agent.totalDuration / agent.connected) : 0,
      }))
      .sort((a, b) => b.totalCalls - a.totalCalls);
  }, [filteredLogs, agents]);

  // Call direction breakdown
  const callDirectionData = useMemo(() => {
    const outbound = filteredLogs.filter(
      (log) => log.callType?.toLowerCase().includes("outbound") || log.callType?.toLowerCase().includes("outgoing")
    ).length;
    const inbound = filteredLogs.filter(
      (log) => log.callType?.toLowerCase().includes("inbound") || log.callType?.toLowerCase().includes("incoming")
    ).length;
    const manual = filteredLogs.filter((log) => log.callType?.toLowerCase().includes("manual")).length;

    return [
      { name: "Outbound", value: outbound, color: ANALYTICS_COLORS.primary },
      { name: "Inbound", value: inbound, color: ANALYTICS_COLORS.success },
      { name: "Manual", value: manual, color: ANALYTICS_COLORS.accent },
    ].filter((item) => item.value > 0);
  }, [filteredLogs]);

  // Call status distribution
  const callStatusData = useMemo(() => {
    const connected = filteredLogs.filter((log) => log.callConnected).length;
    const notConnected = filteredLogs.filter((log) => !log.callConnected).length;

    return [
      { name: "Connected", value: connected, color: ANALYTICS_COLORS.success },
      { name: "Not Connected", value: notConnected, color: ANALYTICS_COLORS.danger },
    ].filter((item) => item.value > 0);
  }, [filteredLogs]);

  // Daily call trends
  const dailyTrendsData = useMemo(() => {
    const dailyMap = new Map();

    filteredLogs.forEach((log) => {
      if (!log.timestamp) return;

      const date = new Date(log.timestamp);
      const dateKey = date.toLocaleDateString("en-US", { month: "short", day: "numeric" });

      if (!dailyMap.has(dateKey)) {
        dailyMap.set(dateKey, {
          date: dateKey,
          total: 0,
          connected: 0,
          notConnected: 0,
          outbound: 0,
          inbound: 0,
        });
      }

      const dayData = dailyMap.get(dateKey);
      dayData.total++;

      if (log.callConnected) {
        dayData.connected++;
      } else {
        dayData.notConnected++;
      }

      const callType = log.callType?.toLowerCase() || "";
      const direction = log.callDirection?.toLowerCase() || "";

      if (callType.includes("inbound") || direction.includes("inbound")) {
        dayData.inbound++;
      } else {
        dayData.outbound++;
      }
    });

    return Array.from(dailyMap.values()).sort((a, b) => {
      const dateA = new Date(a.date + " " + new Date().getFullYear());
      const dateB = new Date(b.date + " " + new Date().getFullYear());
      return dateA - dateB;
    });
  }, [filteredLogs]);

  // Hourly distribution
  const hourlyData = useMemo(() => {
    const hourlyMap = new Map();

    for (let i = 0; i < 24; i++) {
      hourlyMap.set(i, { hour: `${i.toString().padStart(2, "0")}:00`, calls: 0, connected: 0 });
    }

    filteredLogs.forEach((log) => {
      if (!log.timestamp) return;
      const date = new Date(log.timestamp);
      const hour = date.getHours();
      const data = hourlyMap.get(hour);
      data.calls++;
      if (log.callConnected) data.connected++;
    });

    return Array.from(hourlyMap.values());
  }, [filteredLogs]);

  // Peak hours analysis
  const peakHoursData = useMemo(() => {
    const sorted = [...hourlyData].sort((a, b) => b.calls - a.calls);
    return sorted.slice(0, 5);
  }, [hourlyData]);

  // Call type distribution
  const callTypeData = useMemo(() => {
    const typeMap = new Map();

    filteredLogs.forEach((log) => {
      const type = log.callType || "Unknown";
      typeMap.set(type, (typeMap.get(type) || 0) + 1);
    });

    const colors = [
      ANALYTICS_COLORS.primary,
      ANALYTICS_COLORS.success,
      ANALYTICS_COLORS.accent,
      ANALYTICS_COLORS.purple,
      ANALYTICS_COLORS.pink,
      ANALYTICS_COLORS.indigo,
    ];

    return Array.from(typeMap.entries())
      .map(([name, value], index) => ({
        name,
        value,
        color: colors[index % colors.length],
      }))
      .sort((a, b) => b.value - a.value);
  }, [filteredLogs]);

  // Daily stats table
  const dailyStatsTable = useMemo(() => {
    const dailyMap = new Map();

    filteredLogs.forEach((log) => {
      if (!log.timestamp) return;

      const date = new Date(log.timestamp);
      const dateKey = date.toLocaleDateString("en-US");

      if (!dailyMap.has(dateKey)) {
        dailyMap.set(dateKey, {
          date: dateKey,
          totalCalls: 0,
          connected: 0,
          notConnected: 0,
          totalDuration: 0,
          durationCount: 0,
        });
      }

      const dayData = dailyMap.get(dateKey);
      dayData.totalCalls++;

      if (log.callConnected) {
        dayData.connected++;
        if (log.duration) {
          const hours = log.duration.hours || 0;
          const minutes = log.duration.minutes || 0;
          const seconds = log.duration.seconds || 0;
          dayData.totalDuration += hours * 3600 + minutes * 60 + seconds;
          dayData.durationCount++;
        }
      } else {
        dayData.notConnected++;
      }
    });

    return Array.from(dailyMap.values())
      .map((day) => ({
        ...day,
        avgDuration: day.durationCount > 0 ? Math.round(day.totalDuration / day.durationCount) : 0,
        completionRate: day.totalCalls > 0 ? ((day.connected / day.totalCalls) * 100).toFixed(1) : 0,
      }))
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [filteredLogs]);

  // Weekly comparison data
  const weeklyComparisonData = useMemo(() => {
    const weekMap = new Map();

    filteredLogs.forEach((log) => {
      if (!log.timestamp) return;

      const date = new Date(log.timestamp);
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay());
      const weekKey = weekStart.toLocaleDateString("en-US", { month: "short", day: "numeric" });

      if (!weekMap.has(weekKey)) {
        weekMap.set(weekKey, {
          week: weekKey,
          totalCalls: 0,
          connected: 0,
          avgDuration: 0,
          totalDuration: 0,
          durationCount: 0,
        });
      }

      const weekData = weekMap.get(weekKey);
      weekData.totalCalls++;

      if (log.callConnected) {
        weekData.connected++;
        if (log.duration) {
          const hours = log.duration.hours || 0;
          const minutes = log.duration.minutes || 0;
          const seconds = log.duration.seconds || 0;
          weekData.totalDuration += hours * 3600 + minutes * 60 + seconds;
          weekData.durationCount++;
        }
      }
    });

    return Array.from(weekMap.values())
      .map((week) => ({
        ...week,
        rate: week.totalCalls > 0 ? ((week.connected / week.totalCalls) * 100).toFixed(1) : 0,
        avgDurationMin: week.durationCount > 0 ? Math.round(week.totalDuration / week.durationCount / 60) : 0,
      }))
      .sort((a, b) => new Date(a.week) - new Date(b.week));
  }, [filteredLogs]);

  // Connection rate trend data
  const connectionRateTrendData = useMemo(() => {
    return dailyTrendsData.map((day) => ({
      date: day.date,
      rate: day.total > 0 ? ((day.connected / day.total) * 100).toFixed(1) : 0,
      total: day.total,
    }));
  }, [dailyTrendsData]);

  // Duration distribution data
  const durationDistributionData = useMemo(() => {
    const ranges = [
      { name: "< 1 min", min: 0, max: 60, count: 0 },
      { name: "1-3 min", min: 60, max: 180, count: 0 },
      { name: "3-5 min", min: 180, max: 300, count: 0 },
      { name: "5-10 min", min: 300, max: 600, count: 0 },
      { name: "> 10 min", min: 600, max: Infinity, count: 0 },
    ];

    filteredLogs.forEach((log) => {
      if (log.callConnected && log.duration) {
        const hours = log.duration.hours || 0;
        const minutes = log.duration.minutes || 0;
        const seconds = log.duration.seconds || 0;
        const totalSeconds = hours * 3600 + minutes * 60 + seconds;

        for (const range of ranges) {
          if (totalSeconds >= range.min && totalSeconds < range.max) {
            range.count++;
            break;
          }
        }
      }
    });

    const colors = [ANALYTICS_COLORS.primary, ANALYTICS_COLORS.success, ANALYTICS_COLORS.accent, ANALYTICS_COLORS.purple, ANALYTICS_COLORS.pink];
    return ranges.map((range, index) => ({
      name: range.name,
      value: range.count,
      color: colors[index],
    })).filter(item => item.value > 0);
  }, [filteredLogs]);

  // Top 5 performers bar chart data
  const topPerformersData = useMemo(() => {
    return agentPerformanceData
      .slice(0, 5)
      .map((agent) => ({
        name: agent.name?.split(" ")[0] || "Unknown",
        totalCalls: agent.totalCalls,
        connected: agent.connected,
        rate: parseFloat(agent.rate),
      }));
  }, [agentPerformanceData]);

  // Day of week analysis
  const dayOfWeekData = useMemo(() => {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const dayMap = new Map();

    days.forEach((day, index) => {
      dayMap.set(index, { day, calls: 0, connected: 0 });
    });

    filteredLogs.forEach((log) => {
      if (!log.timestamp) return;
      const date = new Date(log.timestamp);
      const dayIndex = date.getDay();
      const data = dayMap.get(dayIndex);
      data.calls++;
      if (log.callConnected) data.connected++;
    });

    return Array.from(dayMap.values());
  }, [filteredLogs]);

  // Agent comparison radar data (for top 3)
  const agentComparisonData = useMemo(() => {
    const top3 = agentPerformanceData.slice(0, 3);
    if (top3.length === 0) return [];

    const maxCalls = Math.max(...top3.map(a => a.totalCalls), 1);
    const maxConnected = Math.max(...top3.map(a => a.connected), 1);
    const maxDuration = Math.max(...top3.map(a => a.avgDuration), 1);

    return top3.map((agent) => ({
      name: agent.name?.split(" ")[0] || "Unknown",
      callVolume: Math.round((agent.totalCalls / maxCalls) * 100),
      successRate: parseFloat(agent.rate),
      avgCallDuration: Math.round((agent.avgDuration / maxDuration) * 100),
    }));
  }, [agentPerformanceData]);

  const handleResetFilters = () => {
    setDateRange("7days");
    setDirectionFilter("all");
    setAgentFilter("all");
    setStartDate("");
    setEndDate("");
  };

  const maxAgentCalls = agentPerformanceData.length > 0 ? agentPerformanceData[0].totalCalls : 0;

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: ANALYTICS_COLORS.background }}>
      {/* Header Section */}
      <Box
        sx={{
          background: ANALYTICS_GRADIENTS.primary,
          pt: 4,
          pb: 6,
          px: 3,
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Decorative elements */}
        <Box
          sx={{
            position: "absolute",
            top: -100,
            right: -100,
            width: 300,
            height: 300,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.1)",
          }}
        />
        <Box
          sx={{
            position: "absolute",
            bottom: -50,
            left: -50,
            width: 200,
            height: 200,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.08)",
          }}
        />

        <Box sx={{ maxWidth: 1600, mx: "auto", position: "relative", zIndex: 1 }}>
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 3 }}>
            <Button
              onClick={handleBack}
              startIcon={<ArrowBack />}
              sx={{
                color: "#fff",
                bgcolor: "rgba(255,255,255,0.15)",
                backdropFilter: "blur(10px)",
                borderRadius: "12px",
                px: 2.5,
                py: 1,
                fontWeight: 600,
                textTransform: "none",
                "&:hover": {
                  bgcolor: "rgba(255,255,255,0.25)",
                  transform: "translateX(-4px)",
                },
                transition: "all 0.3s ease",
              }}
            >
              Back to Dashboard
            </Button>

            <Tooltip title="Refresh Data">
              <IconButton
                onClick={handleRefresh}
                sx={{
                  bgcolor: "rgba(255,255,255,0.15)",
                  color: "#fff",
                  "&:hover": { bgcolor: "rgba(255,255,255,0.25)" },
                }}
              >
                <Refresh
                  sx={{
                    animation: isRefreshing ? "spin 1s linear infinite" : "none",
                    "@keyframes spin": {
                      "0%": { transform: "rotate(0deg)" },
                      "100%": { transform: "rotate(360deg)" },
                    },
                  }}
                />
              </IconButton>
            </Tooltip>
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
            <Avatar
              sx={{
                width: 56,
                height: 56,
                background: "rgba(255,255,255,0.2)",
                backdropFilter: "blur(10px)",
              }}
            >
              <Analytics sx={{ fontSize: 32, color: "#fff" }} />
            </Avatar>
            <Box>
              <Typography variant="h4" fontWeight={800} color="#fff" sx={{ textShadow: "0 2px 10px rgba(0,0,0,0.2)" }}>
                Call Analytics Dashboard
              </Typography>
              <Typography variant="body1" color="rgba(255,255,255,0.9)">
                Comprehensive insights into call performance and trends
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Stat Cards - Overlapping header */}
      <Box sx={{ maxWidth: 1600, mx: "auto", px: 3, mt: -4 }}>
        <Grid container spacing={2.5}>
          <Grid item xs={12} sm={6} md={3} lg={2}>
            <AnimatedStatCard
              title="Total Calls"
              value={metrics.totalCalls}
              subtitle="All calls"
              icon={<Phone sx={{ color: "#fff", fontSize: 26 }} />}
              gradient={ANALYTICS_GRADIENTS.primary}
              delay={0}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3} lg={2}>
            <AnimatedStatCard
              title="Connected"
              value={metrics.connectedCalls}
              subtitle="Successful"
              icon={<CheckCircle sx={{ color: "#fff", fontSize: 26 }} />}
              gradient={ANALYTICS_GRADIENTS.success}
              delay={100}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3} lg={2}>
            <AnimatedStatCard
              title="Not Connected"
              value={metrics.notConnectedCalls}
              subtitle="Missed/Failed"
              icon={<Cancel sx={{ color: "#fff", fontSize: 26 }} />}
              gradient={ANALYTICS_GRADIENTS.danger}
              delay={200}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3} lg={2}>
            <AnimatedStatCard
              title="Avg Duration"
              value={metrics.avgDuration}
              subtitle="Per call"
              icon={<AccessTime sx={{ color: "#fff", fontSize: 26 }} />}
              gradient={ANALYTICS_GRADIENTS.purple}
              delay={300}
              isString={true}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3} lg={2}>
            <AnimatedStatCard
              title="Success Rate"
              value={metrics.completionRate}
              subtitle="Connection rate"
              icon={<TrendingUp sx={{ color: "#fff", fontSize: 26 }} />}
              gradient={ANALYTICS_GRADIENTS.accent}
              suffix="%"
              delay={400}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3} lg={2}>
            <AnimatedStatCard
              title="Talk Time"
              value={metrics.totalDurationHours}
              subtitle="Total hours"
              icon={<Timer sx={{ color: "#fff", fontSize: 26 }} />}
              gradient={ANALYTICS_GRADIENTS.indigo}
              suffix="h"
              delay={500}
            />
          </Grid>
        </Grid>
      </Box>

      {/* Main Content */}
      <Box sx={{ maxWidth: 1600, mx: "auto", px: 3, py: 4 }}>
        {/* Filters Section */}
        <Paper
          elevation={0}
          sx={{
            p: 3,
            mb: 4,
            borderRadius: "20px",
            border: `1px solid ${ANALYTICS_COLORS.primary}20`,
            background: "rgba(255,255,255,0.9)",
            backdropFilter: "blur(20px)",
          }}
        >
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2.5 }}>
            <Typography variant="h6" fontWeight={700} color={ANALYTICS_COLORS.primary}>
              Filters
            </Typography>
            <Button
              startIcon={<Refresh />}
              onClick={handleResetFilters}
              sx={{
                color: ANALYTICS_COLORS.primary,
                textTransform: "none",
                fontWeight: 600,
                "&:hover": { bgcolor: `${ANALYTICS_COLORS.primary}10` },
              }}
            >
              Reset
            </Button>
          </Box>

          <Grid container spacing={2.5}>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Date Range</InputLabel>
                <Select
                  value={dateRange}
                  label="Date Range"
                  onChange={(e) => setDateRange(e.target.value)}
                  sx={{
                    borderRadius: "12px",
                    "& .MuiOutlinedInput-notchedOutline": { borderColor: `${ANALYTICS_COLORS.primary}40` },
                    "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: ANALYTICS_COLORS.primary },
                  }}
                >
                  <MenuItem value="24h">Last 24 Hours</MenuItem>
                  <MenuItem value="7days">Last 7 Days</MenuItem>
                  <MenuItem value="30days">Last 30 Days</MenuItem>
                  <MenuItem value="all">All Time</MenuItem>
                  <MenuItem value="custom">Custom Range</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {dateRange === "custom" && (
              <>
                <Grid item xs={12} sm={6} md={2}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Start Date"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "12px",
                        "& fieldset": { borderColor: `${ANALYTICS_COLORS.primary}40` },
                      },
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={2}>
                  <TextField
                    fullWidth
                    size="small"
                    label="End Date"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "12px",
                        "& fieldset": { borderColor: `${ANALYTICS_COLORS.primary}40` },
                      },
                    }}
                  />
                </Grid>
              </>
            )}

            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Direction</InputLabel>
                <Select
                  value={directionFilter}
                  label="Direction"
                  onChange={(e) => setDirectionFilter(e.target.value)}
                  sx={{
                    borderRadius: "12px",
                    "& .MuiOutlinedInput-notchedOutline": { borderColor: `${ANALYTICS_COLORS.primary}40` },
                  }}
                >
                  <MenuItem value="all">All Directions</MenuItem>
                  <MenuItem value="outbound">Outbound Only</MenuItem>
                  <MenuItem value="inbound">Inbound Only</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6} md={dateRange === "custom" ? 2 : 3}>
              <Autocomplete
                size="small"
                options={[{ id: "all", name: "All Agents", uid: "all" }, ...agents]}
                getOptionLabel={(option) => option.name || ""}
                value={agents.find((a) => (a.id || a.uid) === agentFilter) || { id: "all", name: "All Agents" }}
                onChange={(event, newValue) => {
                  setAgentFilter(newValue ? newValue.id || newValue.uid : "all");
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Agent"
                    placeholder="Search agents..."
                    InputProps={{
                      ...params.InputProps,
                      startAdornment: (
                        <>
                          <InputAdornment position="start">
                            <Search sx={{ color: ANALYTICS_COLORS.textSecondary, fontSize: 20 }} />
                          </InputAdornment>
                          {params.InputProps.startAdornment}
                        </>
                      ),
                    }}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "12px",
                        "& fieldset": { borderColor: `${ANALYTICS_COLORS.primary}40` },
                      },
                    }}
                  />
                )}
                isOptionEqualToValue={(option, value) => (option.id || option.uid) === (value.id || value.uid)}
              />
            </Grid>
          </Grid>
        </Paper>

        {/* Tabs Navigation */}
        <Paper
          elevation={0}
          sx={{
            mb: 3,
            borderRadius: "16px",
            border: `1px solid ${ANALYTICS_COLORS.primary}20`,
            overflow: "hidden",
          }}
        >
          <Tabs
            value={activeTab}
            onChange={(e, val) => setActiveTab(val)}
            variant="fullWidth"
            sx={{
              bgcolor: "white",
              "& .MuiTab-root": {
                textTransform: "none",
                fontWeight: 600,
                fontSize: "0.95rem",
                py: 2,
                color: ANALYTICS_COLORS.textSecondary,
                "&.Mui-selected": {
                  color: ANALYTICS_COLORS.primary,
                },
              },
              "& .MuiTabs-indicator": {
                height: 3,
                borderRadius: "3px 3px 0 0",
                background: ANALYTICS_GRADIENTS.primary,
              },
            }}
          >
            <Tab icon={<ShowChart />} iconPosition="start" label="Overview" />
            <Tab icon={<BarChartIcon />} iconPosition="start" label="Trends" />
            <Tab icon={<Groups />} iconPosition="start" label="Agent Performance" />
            <Tab icon={<TableChart />} iconPosition="start" label="Daily Stats" />
          </Tabs>
        </Paper>

        {/* Tab Content */}
        <Fade in={activeTab === 0}>
          <Box sx={{ display: activeTab === 0 ? "block" : "none" }}>
            {/* Overview Tab */}
            <Grid container spacing={3}>
              {/* Row 1: Calls Trend (Full Width) */}
              <Grid item xs={12}>
                <ChartCard
                  title="Calls Trend (Last 7 Days)"
                  chartData={dailyTrendsData}
                  columns={["date", "total", "connected", "notConnected"]}
                  height={300}
                  chartElement={
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={dailyTrendsData}>
                        <defs>
                          <linearGradient id="colorConnectedOverview" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={ANALYTICS_COLORS.success} stopOpacity={0.3} />
                            <stop offset="95%" stopColor={ANALYTICS_COLORS.success} stopOpacity={0} />
                          </linearGradient>
                          <linearGradient id="colorNotConnectedOverview" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={ANALYTICS_COLORS.danger} stopOpacity={0.3} />
                            <stop offset="95%" stopColor={ANALYTICS_COLORS.danger} stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke={`${ANALYTICS_COLORS.primary}20`} />
                        <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                        <YAxis tick={{ fontSize: 12 }} />
                        <RechartsTooltip content={<CustomChartTooltip />} />
                        <Legend />
                        <Area type="monotone" dataKey="connected" stroke={ANALYTICS_COLORS.success} fillOpacity={1} fill="url(#colorConnectedOverview)" name="Connected" strokeWidth={2} />
                        <Area type="monotone" dataKey="notConnected" stroke={ANALYTICS_COLORS.danger} fillOpacity={1} fill="url(#colorNotConnectedOverview)" name="Not Connected" strokeWidth={2} />
                      </AreaChart>
                    </ResponsiveContainer>
                  }
                >
                  {dailyTrendsData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={dailyTrendsData}>
                        <defs>
                          <linearGradient id="colorConnectedOverviewSmall" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={ANALYTICS_COLORS.success} stopOpacity={0.3} />
                            <stop offset="95%" stopColor={ANALYTICS_COLORS.success} stopOpacity={0} />
                          </linearGradient>
                          <linearGradient id="colorNotConnectedOverviewSmall" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={ANALYTICS_COLORS.danger} stopOpacity={0.3} />
                            <stop offset="95%" stopColor={ANALYTICS_COLORS.danger} stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke={`${ANALYTICS_COLORS.primary}20`} />
                        <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                        <YAxis tick={{ fontSize: 11 }} />
                        <RechartsTooltip content={<CustomChartTooltip />} />
                        <Legend />
                        <Area type="monotone" dataKey="connected" stroke={ANALYTICS_COLORS.success} fillOpacity={1} fill="url(#colorConnectedOverviewSmall)" name="Connected" strokeWidth={2} />
                        <Area type="monotone" dataKey="notConnected" stroke={ANALYTICS_COLORS.danger} fillOpacity={1} fill="url(#colorNotConnectedOverviewSmall)" name="Not Connected" strokeWidth={2} />
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : (
                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%" }}>
                      <Typography color={ANALYTICS_COLORS.textSecondary}>No data available</Typography>
                    </Box>
                  )}
                </ChartCard>
              </Grid>

              {/* Row 2: Call Status Distribution & Top 5 Performers */}
              <Grid item xs={12} md={6} lg={3}>
                <ChartCard
                  title="Call Status Distribution"
                  chartData={callStatusData}
                  columns={["name", "value"]}
                  height={280}
                  chartElement={
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={callStatusData}
                          cx="50%"
                          cy="50%"
                          innerRadius={100}
                          outerRadius={160}
                          dataKey="value"
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                        >
                          {callStatusData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <RechartsTooltip content={<CustomChartTooltip />} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  }
                >
                  {callStatusData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={callStatusData}
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={90}
                          dataKey="value"
                          label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
                        >
                          {callStatusData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <RechartsTooltip content={<CustomChartTooltip />} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%" }}>
                      <Typography color={ANALYTICS_COLORS.textSecondary}>No data available</Typography>
                    </Box>
                  )}
                </ChartCard>
              </Grid>

              <Grid item xs={12} md={6} lg={3}>
                <ChartCard
                  title="Top 5 Performers"
                  chartData={topPerformersData}
                  columns={["name", "totalCalls", "connected"]}
                  height={280}
                  chartElement={
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={topPerformersData} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" stroke={`${ANALYTICS_COLORS.primary}20`} />
                        <XAxis type="number" />
                        <YAxis type="category" dataKey="name" width={80} tick={{ fontSize: 12 }} />
                        <RechartsTooltip content={<CustomChartTooltip />} />
                        <Legend />
                        <Bar dataKey="connected" fill={ANALYTICS_COLORS.success} name="Connected" radius={[0, 4, 4, 0]} />
                        <Bar dataKey="totalCalls" fill={ANALYTICS_COLORS.primary} name="Total Calls" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  }
                >
                  {topPerformersData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={topPerformersData} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" stroke={`${ANALYTICS_COLORS.primary}20`} />
                        <XAxis type="number" tick={{ fontSize: 10 }} />
                        <YAxis type="category" dataKey="name" width={70} tick={{ fontSize: 10 }} />
                        <RechartsTooltip content={<CustomChartTooltip />} />
                        <Legend wrapperStyle={{ fontSize: 10 }} />
                        <Bar dataKey="connected" fill={ANALYTICS_COLORS.success} name="Connected" radius={[0, 4, 4, 0]} />
                        <Bar dataKey="totalCalls" fill={ANALYTICS_COLORS.primary} name="Total Calls" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%" }}>
                      <Typography color={ANALYTICS_COLORS.textSecondary}>No data available</Typography>
                    </Box>
                  )}
                </ChartCard>
              </Grid>

              <Grid item xs={12} md={6} lg={3}>
                <ChartCard
                  title="Calls by Type"
                  chartData={callTypeData}
                  columns={["name", "value"]}
                  height={280}
                  chartElement={
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={callTypeData}>
                        <CartesianGrid strokeDasharray="3 3" stroke={`${ANALYTICS_COLORS.primary}20`} />
                        <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                        <YAxis tick={{ fontSize: 11 }} />
                        <RechartsTooltip content={<CustomChartTooltip />} />
                        <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                          {callTypeData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  }
                >
                  {callTypeData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={callTypeData}>
                        <CartesianGrid strokeDasharray="3 3" stroke={`${ANALYTICS_COLORS.primary}20`} />
                        <XAxis dataKey="name" tick={{ fontSize: 10 }} angle={-15} textAnchor="end" height={60} />
                        <YAxis tick={{ fontSize: 10 }} />
                        <RechartsTooltip content={<CustomChartTooltip />} />
                        <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                          {callTypeData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%" }}>
                      <Typography color={ANALYTICS_COLORS.textSecondary}>No data available</Typography>
                    </Box>
                  )}
                </ChartCard>
              </Grid>

              <Grid item xs={12} md={6} lg={3}>
                <ChartCard
                  title="Connection Rate Trend"
                  chartData={connectionRateTrendData}
                  columns={["date", "rate", "total"]}
                  height={280}
                  chartElement={
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={connectionRateTrendData}>
                        <CartesianGrid strokeDasharray="3 3" stroke={`${ANALYTICS_COLORS.primary}20`} />
                        <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                        <YAxis tick={{ fontSize: 11 }} domain={[0, 100]} />
                        <RechartsTooltip content={<CustomChartTooltip />} />
                        <Legend />
                        <Line type="monotone" dataKey="rate" stroke={ANALYTICS_COLORS.accent} name="Rate %" strokeWidth={3} dot={{ r: 5 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  }
                >
                  {connectionRateTrendData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={connectionRateTrendData}>
                        <CartesianGrid strokeDasharray="3 3" stroke={`${ANALYTICS_COLORS.primary}20`} />
                        <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                        <YAxis tick={{ fontSize: 10 }} domain={[0, 100]} />
                        <RechartsTooltip content={<CustomChartTooltip />} />
                        <Line type="monotone" dataKey="rate" stroke={ANALYTICS_COLORS.accent} name="Rate %" strokeWidth={2} dot={{ r: 3 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%" }}>
                      <Typography color={ANALYTICS_COLORS.textSecondary}>No data available</Typography>
                    </Box>
                  )}
                </ChartCard>
              </Grid>

              {/* Row 3: Duration Distribution, Day of Week, Hourly Distribution */}
              <Grid item xs={12} md={4}>
                <ChartCard
                  title="Call Duration Distribution"
                  chartData={durationDistributionData}
                  columns={["name", "value"]}
                  height={280}
                  chartElement={
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={durationDistributionData}
                          cx="50%"
                          cy="50%"
                          innerRadius={80}
                          outerRadius={140}
                          dataKey="value"
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                        >
                          {durationDistributionData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <RechartsTooltip content={<CustomChartTooltip />} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  }
                >
                  {durationDistributionData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={durationDistributionData}
                          cx="50%"
                          cy="50%"
                          innerRadius={40}
                          outerRadius={80}
                          dataKey="value"
                          label={({ name }) => name}
                          labelLine={false}
                        >
                          {durationDistributionData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <RechartsTooltip content={<CustomChartTooltip />} />
                        <Legend wrapperStyle={{ fontSize: 10 }} />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%" }}>
                      <Typography color={ANALYTICS_COLORS.textSecondary}>No data available</Typography>
                    </Box>
                  )}
                </ChartCard>
              </Grid>

              <Grid item xs={12} md={4}>
                <ChartCard
                  title="Calls by Day of Week"
                  chartData={dayOfWeekData}
                  columns={["day", "calls", "connected"]}
                  height={280}
                  chartElement={
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={dayOfWeekData}>
                        <CartesianGrid strokeDasharray="3 3" stroke={`${ANALYTICS_COLORS.primary}20`} />
                        <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                        <YAxis tick={{ fontSize: 12 }} />
                        <RechartsTooltip content={<CustomChartTooltip />} />
                        <Legend />
                        <Bar dataKey="calls" fill={ANALYTICS_COLORS.primary} name="Total Calls" radius={[6, 6, 0, 0]} />
                        <Bar dataKey="connected" fill={ANALYTICS_COLORS.success} name="Connected" radius={[6, 6, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  }
                >
                  {dayOfWeekData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={dayOfWeekData}>
                        <CartesianGrid strokeDasharray="3 3" stroke={`${ANALYTICS_COLORS.primary}20`} />
                        <XAxis dataKey="day" tick={{ fontSize: 10 }} />
                        <YAxis tick={{ fontSize: 10 }} />
                        <RechartsTooltip content={<CustomChartTooltip />} />
                        <Legend wrapperStyle={{ fontSize: 10 }} />
                        <Bar dataKey="calls" fill={ANALYTICS_COLORS.primary} name="Total" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="connected" fill={ANALYTICS_COLORS.success} name="Connected" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%" }}>
                      <Typography color={ANALYTICS_COLORS.textSecondary}>No data available</Typography>
                    </Box>
                  )}
                </ChartCard>
              </Grid>

              <Grid item xs={12} md={4}>
                <ChartCard
                  title="Hourly Call Distribution"
                  chartData={hourlyData}
                  columns={["hour", "calls", "connected"]}
                  height={280}
                  chartElement={
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={hourlyData}>
                        <defs>
                          <linearGradient id="colorHourlyExpand" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={ANALYTICS_COLORS.purple} stopOpacity={0.4} />
                            <stop offset="95%" stopColor={ANALYTICS_COLORS.purple} stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke={`${ANALYTICS_COLORS.primary}20`} />
                        <XAxis dataKey="hour" tick={{ fontSize: 10 }} interval={2} />
                        <YAxis tick={{ fontSize: 10 }} />
                        <RechartsTooltip content={<CustomChartTooltip />} />
                        <Area type="monotone" dataKey="calls" stroke={ANALYTICS_COLORS.purple} fill="url(#colorHourlyExpand)" name="Calls" strokeWidth={2} />
                      </AreaChart>
                    </ResponsiveContainer>
                  }
                >
                  {hourlyData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={hourlyData}>
                        <defs>
                          <linearGradient id="colorHourlySmall" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={ANALYTICS_COLORS.purple} stopOpacity={0.4} />
                            <stop offset="95%" stopColor={ANALYTICS_COLORS.purple} stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke={`${ANALYTICS_COLORS.primary}20`} />
                        <XAxis dataKey="hour" tick={{ fontSize: 9 }} interval={3} />
                        <YAxis tick={{ fontSize: 9 }} />
                        <RechartsTooltip content={<CustomChartTooltip />} />
                        <Area type="monotone" dataKey="calls" stroke={ANALYTICS_COLORS.purple} fill="url(#colorHourlySmall)" name="Calls" strokeWidth={2} />
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : (
                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%" }}>
                      <Typography color={ANALYTICS_COLORS.textSecondary}>No data available</Typography>
                    </Box>
                  )}
                </ChartCard>
              </Grid>

              {/* Row 4: Peak Hours Analysis & Weekly Comparison */}
              <Grid item xs={12} md={6}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    borderRadius: "20px",
                    border: `1px solid ${ANALYTICS_COLORS.primary}20`,
                    height: "100%",
                    transition: "all 0.3s ease",
                    "&:hover": {
                      boxShadow: `0 12px 40px ${ANALYTICS_COLORS.primary}15`,
                      transform: "translateY(-4px)",
                    },
                  }}
                >
                  <Typography variant="h6" fontWeight={700} color={ANALYTICS_COLORS.primary} sx={{ mb: 3 }}>
                    Peak Hours Analysis
                  </Typography>
                  {peakHoursData.length > 0 ? (
                    <Box>
                      {peakHoursData.map((hour, index) => (
                        <Box
                          key={hour.hour}
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 2,
                            mb: 2,
                            p: 1.5,
                            borderRadius: "12px",
                            bgcolor: index === 0 ? `${ANALYTICS_COLORS.accent}15` : `${ANALYTICS_COLORS.primary}08`,
                            border: index === 0 ? `1px solid ${ANALYTICS_COLORS.accent}40` : "none",
                          }}
                        >
                          <Avatar
                            sx={{
                              width: 40,
                              height: 40,
                              background: index === 0 ? ANALYTICS_GRADIENTS.accent : ANALYTICS_GRADIENTS.primary,
                              fontSize: "0.85rem",
                              fontWeight: 700,
                            }}
                          >
                            {index + 1}
                          </Avatar>
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="subtitle1" fontWeight={600} color={ANALYTICS_COLORS.text}>
                              {hour.hour}
                            </Typography>
                            <Box sx={{ display: "flex", gap: 2 }}>
                              <Typography variant="caption" color={ANALYTICS_COLORS.textSecondary}>
                                {hour.calls} calls
                              </Typography>
                              <Typography variant="caption" color={ANALYTICS_COLORS.success}>
                                {hour.connected} connected
                              </Typography>
                            </Box>
                          </Box>
                          {index === 0 && (
                            <Chip
                              label="Peak"
                              size="small"
                              sx={{
                                background: ANALYTICS_GRADIENTS.accent,
                                color: "#fff",
                                fontWeight: 600,
                              }}
                            />
                          )}
                        </Box>
                      ))}
                    </Box>
                  ) : (
                    <Box sx={{ textAlign: "center", py: 8 }}>
                      <Typography color={ANALYTICS_COLORS.textSecondary}>No data available</Typography>
                    </Box>
                  )}
                </Paper>
              </Grid>

              <Grid item xs={12} md={6}>
                <ChartCard
                  title="Weekly Performance Comparison"
                  chartData={weeklyComparisonData}
                  columns={["week", "totalCalls", "connected", "rate"]}
                  height={280}
                  chartElement={
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={weeklyComparisonData}>
                        <CartesianGrid strokeDasharray="3 3" stroke={`${ANALYTICS_COLORS.primary}20`} />
                        <XAxis dataKey="week" tick={{ fontSize: 12 }} />
                        <YAxis tick={{ fontSize: 12 }} />
                        <RechartsTooltip content={<CustomChartTooltip />} />
                        <Legend />
                        <Bar dataKey="totalCalls" fill={ANALYTICS_COLORS.primary} name="Total Calls" radius={[6, 6, 0, 0]} />
                        <Bar dataKey="connected" fill={ANALYTICS_COLORS.success} name="Connected" radius={[6, 6, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  }
                >
                  {weeklyComparisonData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={weeklyComparisonData}>
                        <CartesianGrid strokeDasharray="3 3" stroke={`${ANALYTICS_COLORS.primary}20`} />
                        <XAxis dataKey="week" tick={{ fontSize: 10 }} />
                        <YAxis tick={{ fontSize: 10 }} />
                        <RechartsTooltip content={<CustomChartTooltip />} />
                        <Legend wrapperStyle={{ fontSize: 10 }} />
                        <Bar dataKey="totalCalls" fill={ANALYTICS_COLORS.primary} name="Total" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="connected" fill={ANALYTICS_COLORS.success} name="Connected" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%" }}>
                      <Typography color={ANALYTICS_COLORS.textSecondary}>No data available</Typography>
                    </Box>
                  )}
                </ChartCard>
              </Grid>
            </Grid>
          </Box>
        </Fade>

        <Fade in={activeTab === 1}>
          <Box sx={{ display: activeTab === 1 ? "block" : "none" }}>
            {/* Trends Tab */}
            <Grid container spacing={3}>
              {/* Daily Call Trends */}
              <Grid item xs={12}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    borderRadius: "20px",
                    border: `1px solid ${ANALYTICS_COLORS.primary}20`,
                    position: "relative",
                    transition: "all 0.3s ease",
                    "&:hover": {
                      boxShadow: `0 12px 40px ${ANALYTICS_COLORS.primary}15`,
                    },
                  }}
                >
                  <Typography variant="h6" fontWeight={700} color={ANALYTICS_COLORS.primary} sx={{ mb: 2 }}>
                    Daily Call Trends
                  </Typography>
                  {dailyTrendsData.length > 0 && (
                    <ChartMenu
                      chartData={dailyTrendsData}
                      chartTitle="Daily Call Trends"
                      columns={["date", "total", "connected", "notConnected"]}
                      chartElement={
                        <ResponsiveContainer width="100%" height={400}>
                          <AreaChart data={dailyTrendsData}>
                            <defs>
                              <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={ANALYTICS_COLORS.primary} stopOpacity={0.3} />
                                <stop offset="95%" stopColor={ANALYTICS_COLORS.primary} stopOpacity={0} />
                              </linearGradient>
                              <linearGradient id="colorConnected" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={ANALYTICS_COLORS.success} stopOpacity={0.3} />
                                <stop offset="95%" stopColor={ANALYTICS_COLORS.success} stopOpacity={0} />
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke={`${ANALYTICS_COLORS.primary}20`} />
                            <XAxis dataKey="date" />
                            <YAxis />
                            <RechartsTooltip content={<CustomChartTooltip />} />
                            <Legend />
                            <Area type="monotone" dataKey="total" stroke={ANALYTICS_COLORS.primary} fillOpacity={1} fill="url(#colorTotal)" name="Total Calls" />
                            <Area type="monotone" dataKey="connected" stroke={ANALYTICS_COLORS.success} fillOpacity={1} fill="url(#colorConnected)" name="Connected" />
                            <Line type="monotone" dataKey="notConnected" stroke={ANALYTICS_COLORS.danger} name="Not Connected" strokeWidth={2} dot={{ r: 4 }} />
                          </AreaChart>
                        </ResponsiveContainer>
                      }
                    />
                  )}
                  {dailyTrendsData.length > 0 ? (
                    <Box sx={{ height: 350 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={dailyTrendsData}>
                          <defs>
                            <linearGradient id="colorTotalMain" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor={ANALYTICS_COLORS.primary} stopOpacity={0.3} />
                              <stop offset="95%" stopColor={ANALYTICS_COLORS.primary} stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="colorConnectedMain" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor={ANALYTICS_COLORS.success} stopOpacity={0.3} />
                              <stop offset="95%" stopColor={ANALYTICS_COLORS.success} stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke={`${ANALYTICS_COLORS.primary}20`} />
                          <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                          <YAxis tick={{ fontSize: 12 }} />
                          <RechartsTooltip content={<CustomChartTooltip />} />
                          <Legend />
                          <Area type="monotone" dataKey="total" stroke={ANALYTICS_COLORS.primary} fillOpacity={1} fill="url(#colorTotalMain)" name="Total Calls" strokeWidth={2} />
                          <Area type="monotone" dataKey="connected" stroke={ANALYTICS_COLORS.success} fillOpacity={1} fill="url(#colorConnectedMain)" name="Connected" strokeWidth={2} />
                          <Line type="monotone" dataKey="notConnected" stroke={ANALYTICS_COLORS.danger} name="Not Connected" strokeWidth={2} dot={{ r: 3 }} />
                        </AreaChart>
                      </ResponsiveContainer>
                    </Box>
                  ) : (
                    <Box sx={{ textAlign: "center", py: 8 }}>
                      <Typography color={ANALYTICS_COLORS.textSecondary}>No data available</Typography>
                    </Box>
                  )}
                </Paper>
              </Grid>

              {/* Inbound vs Outbound */}
              <Grid item xs={12} md={6}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    borderRadius: "20px",
                    border: `1px solid ${ANALYTICS_COLORS.primary}20`,
                    position: "relative",
                    transition: "all 0.3s ease",
                    "&:hover": {
                      boxShadow: `0 12px 40px ${ANALYTICS_COLORS.primary}15`,
                    },
                  }}
                >
                  <Typography variant="h6" fontWeight={700} color={ANALYTICS_COLORS.primary} sx={{ mb: 2 }}>
                    Inbound vs Outbound Trends
                  </Typography>
                  {dailyTrendsData.length > 0 && (
                    <ChartMenu
                      chartData={dailyTrendsData}
                      chartTitle="Inbound vs Outbound Trends"
                      columns={["date", "outbound", "inbound"]}
                      chartElement={
                        <ResponsiveContainer width="100%" height={400}>
                          <BarChart data={dailyTrendsData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" />
                            <YAxis />
                            <RechartsTooltip content={<CustomChartTooltip />} />
                            <Legend />
                            <Bar dataKey="outbound" fill={ANALYTICS_COLORS.primary} name="Outbound" radius={[8, 8, 0, 0]} />
                            <Bar dataKey="inbound" fill={ANALYTICS_COLORS.success} name="Inbound" radius={[8, 8, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      }
                    />
                  )}
                  {dailyTrendsData.length > 0 ? (
                    <Box sx={{ height: 300 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={dailyTrendsData}>
                          <CartesianGrid strokeDasharray="3 3" stroke={`${ANALYTICS_COLORS.primary}20`} />
                          <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                          <YAxis tick={{ fontSize: 12 }} />
                          <RechartsTooltip content={<CustomChartTooltip />} />
                          <Legend />
                          <Bar dataKey="outbound" fill={ANALYTICS_COLORS.primary} name="Outbound" radius={[6, 6, 0, 0]} />
                          <Bar dataKey="inbound" fill={ANALYTICS_COLORS.success} name="Inbound" radius={[6, 6, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </Box>
                  ) : (
                    <Box sx={{ textAlign: "center", py: 8 }}>
                      <Typography color={ANALYTICS_COLORS.textSecondary}>No data available</Typography>
                    </Box>
                  )}
                </Paper>
              </Grid>

              {/* Hourly Distribution */}
              <Grid item xs={12} md={6}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    borderRadius: "20px",
                    border: `1px solid ${ANALYTICS_COLORS.primary}20`,
                    position: "relative",
                    transition: "all 0.3s ease",
                    "&:hover": {
                      boxShadow: `0 12px 40px ${ANALYTICS_COLORS.primary}15`,
                    },
                  }}
                >
                  <Typography variant="h6" fontWeight={700} color={ANALYTICS_COLORS.primary} sx={{ mb: 2 }}>
                    Hourly Call Distribution
                  </Typography>
                  {hourlyData.length > 0 && (
                    <ChartMenu
                      chartData={hourlyData}
                      chartTitle="Hourly Call Distribution"
                      columns={["hour", "calls", "connected"]}
                      chartElement={
                        <ResponsiveContainer width="100%" height={400}>
                          <BarChart data={hourlyData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="hour" />
                            <YAxis />
                            <RechartsTooltip content={<CustomChartTooltip />} />
                            <Legend />
                            <Bar dataKey="calls" fill={ANALYTICS_COLORS.purple} name="Total Calls" radius={[6, 6, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      }
                    />
                  )}
                  {hourlyData.length > 0 ? (
                    <Box sx={{ height: 300 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={hourlyData}>
                          <defs>
                            <linearGradient id="colorHourly" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor={ANALYTICS_COLORS.purple} stopOpacity={0.4} />
                              <stop offset="95%" stopColor={ANALYTICS_COLORS.purple} stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke={`${ANALYTICS_COLORS.primary}20`} />
                          <XAxis dataKey="hour" tick={{ fontSize: 10 }} interval={2} />
                          <YAxis tick={{ fontSize: 12 }} />
                          <RechartsTooltip content={<CustomChartTooltip />} />
                          <Area type="monotone" dataKey="calls" stroke={ANALYTICS_COLORS.purple} fill="url(#colorHourly)" name="Calls" strokeWidth={2} />
                        </AreaChart>
                      </ResponsiveContainer>
                    </Box>
                  ) : (
                    <Box sx={{ textAlign: "center", py: 8 }}>
                      <Typography color={ANALYTICS_COLORS.textSecondary}>No data available</Typography>
                    </Box>
                  )}
                </Paper>
              </Grid>
            </Grid>
          </Box>
        </Fade>

        <Fade in={activeTab === 2}>
          <Box sx={{ display: activeTab === 2 ? "block" : "none" }}>
            {/* Agent Performance Tab */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" fontWeight={700} color={ANALYTICS_COLORS.primary} sx={{ mb: 0.5 }}>
                Agent Performance Rankings
              </Typography>
              <Typography variant="body2" color={ANALYTICS_COLORS.textSecondary}>
                Top performing agents based on call volume and success rate
              </Typography>
            </Box>

            {agentPerformanceData.length > 0 ? (
              <Grid container spacing={2.5}>
                {agentPerformanceData.slice(0, 12).map((agent, index) => (
                  <Grid item xs={12} sm={6} md={4} lg={3} key={agent.id}>
                    <AgentPerformanceCard agent={agent} rank={index + 1} maxCalls={maxAgentCalls} />
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Paper
                elevation={0}
                sx={{
                  p: 6,
                  borderRadius: "20px",
                  border: `1px solid ${ANALYTICS_COLORS.primary}20`,
                  textAlign: "center",
                }}
              >
                <Typography color={ANALYTICS_COLORS.textSecondary}>No agent performance data available</Typography>
              </Paper>
            )}
          </Box>
        </Fade>

        <Fade in={activeTab === 3}>
          <Box sx={{ display: activeTab === 3 ? "block" : "none" }}>
            {/* Daily Stats Tab */}
            <Paper
              elevation={0}
              sx={{
                borderRadius: "20px",
                border: `1px solid ${ANALYTICS_COLORS.primary}20`,
                overflow: "hidden",
              }}
            >
              <Box sx={{ p: 3, borderBottom: `1px solid ${ANALYTICS_COLORS.primary}20` }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <Box>
                    <Typography variant="h6" fontWeight={700} color={ANALYTICS_COLORS.primary}>
                      Daily Call Statistics
                    </Typography>
                    <Typography variant="body2" color={ANALYTICS_COLORS.textSecondary}>
                      Detailed breakdown by day
                    </Typography>
                  </Box>
                  <Button
                    startIcon={<Download />}
                    onClick={() =>
                      exportToCSV(dailyStatsTable, "daily_call_stats", [
                        "date",
                        "totalCalls",
                        "connected",
                        "notConnected",
                        "completionRate",
                        "avgDuration",
                      ])
                    }
                    sx={{
                      bgcolor: `${ANALYTICS_COLORS.primary}15`,
                      color: ANALYTICS_COLORS.primary,
                      textTransform: "none",
                      fontWeight: 600,
                      borderRadius: "12px",
                      "&:hover": { bgcolor: `${ANALYTICS_COLORS.primary}25` },
                    }}
                  >
                    Export CSV
                  </Button>
                </Box>
              </Box>

              {dailyStatsTable.length > 0 ? (
                <>
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow sx={{ bgcolor: `${ANALYTICS_COLORS.primary}08` }}>
                          <TableCell sx={{ fontWeight: 700, color: ANALYTICS_COLORS.primary }}>Date</TableCell>
                          <TableCell align="center" sx={{ fontWeight: 700, color: ANALYTICS_COLORS.primary }}>
                            Total Calls
                          </TableCell>
                          <TableCell align="center" sx={{ fontWeight: 700, color: ANALYTICS_COLORS.primary }}>
                            Connected
                          </TableCell>
                          <TableCell align="center" sx={{ fontWeight: 700, color: ANALYTICS_COLORS.primary }}>
                            Not Connected
                          </TableCell>
                          <TableCell align="center" sx={{ fontWeight: 700, color: ANALYTICS_COLORS.primary }}>
                            Success Rate
                          </TableCell>
                          <TableCell align="center" sx={{ fontWeight: 700, color: ANALYTICS_COLORS.primary }}>
                            Avg Duration
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {dailyStatsTable.slice(tablePage * tableRowsPerPage, tablePage * tableRowsPerPage + tableRowsPerPage).map((day, index) => (
                          <TableRow
                            key={index}
                            hover
                            sx={{
                              "&:hover": { bgcolor: `${ANALYTICS_COLORS.primary}08` },
                            }}
                          >
                            <TableCell>
                              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                <CalendarToday sx={{ fontSize: 18, color: ANALYTICS_COLORS.primary }} />
                                <Typography fontWeight={500}>
                                  {new Date(day.date).toLocaleDateString("en-US", {
                                    year: "numeric",
                                    month: "short",
                                    day: "numeric",
                                  })}
                                </Typography>
                              </Box>
                            </TableCell>
                            <TableCell align="center">
                              <Chip
                                label={day.totalCalls}
                                size="small"
                                sx={{
                                  bgcolor: `${ANALYTICS_COLORS.primary}15`,
                                  color: ANALYTICS_COLORS.primary,
                                  fontWeight: 600,
                                }}
                              />
                            </TableCell>
                            <TableCell align="center">
                              <Chip
                                label={day.connected}
                                size="small"
                                sx={{
                                  bgcolor: `${ANALYTICS_COLORS.success}15`,
                                  color: ANALYTICS_COLORS.success,
                                  fontWeight: 600,
                                }}
                              />
                            </TableCell>
                            <TableCell align="center">
                              <Chip
                                label={day.notConnected}
                                size="small"
                                sx={{
                                  bgcolor: `${ANALYTICS_COLORS.danger}15`,
                                  color: ANALYTICS_COLORS.danger,
                                  fontWeight: 600,
                                }}
                              />
                            </TableCell>
                            <TableCell align="center">
                              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 1 }}>
                                <LinearProgress
                                  variant="determinate"
                                  value={parseFloat(day.completionRate)}
                                  sx={{
                                    width: 60,
                                    height: 6,
                                    borderRadius: 3,
                                    bgcolor: `${ANALYTICS_COLORS.primary}20`,
                                    "& .MuiLinearProgress-bar": {
                                      borderRadius: 3,
                                      bgcolor:
                                        parseFloat(day.completionRate) >= 70
                                          ? ANALYTICS_COLORS.success
                                          : parseFloat(day.completionRate) >= 50
                                          ? ANALYTICS_COLORS.accent
                                          : ANALYTICS_COLORS.danger,
                                    },
                                  }}
                                />
                                <Typography variant="body2" fontWeight={600}>
                                  {day.completionRate}%
                                </Typography>
                              </Box>
                            </TableCell>
                            <TableCell align="center">
                              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 0.5 }}>
                                <Schedule sx={{ fontSize: 16, color: ANALYTICS_COLORS.textSecondary }} />
                                <Typography variant="body2" color={ANALYTICS_COLORS.textSecondary}>
                                  {day.avgDuration > 0 ? `${Math.floor(day.avgDuration / 60)}m ${day.avgDuration % 60}s` : "N/A"}
                                </Typography>
                              </Box>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                  <TablePagination
                    component="div"
                    count={dailyStatsTable.length}
                    page={tablePage}
                    onPageChange={(e, newPage) => setTablePage(newPage)}
                    rowsPerPage={tableRowsPerPage}
                    onRowsPerPageChange={(e) => {
                      setTableRowsPerPage(parseInt(e.target.value, 10));
                      setTablePage(0);
                    }}
                    rowsPerPageOptions={[5, 10, 25, 50]}
                    sx={{
                      borderTop: `1px solid ${ANALYTICS_COLORS.primary}20`,
                      ".MuiTablePagination-select": { borderRadius: "8px" },
                    }}
                  />
                </>
              ) : (
                <Box sx={{ p: 6, textAlign: "center" }}>
                  <Typography color={ANALYTICS_COLORS.textSecondary}>No data available</Typography>
                </Box>
              )}
            </Paper>
          </Box>
        </Fade>
      </Box>
    </Box>
  );
};

export default CallAnalytics;
