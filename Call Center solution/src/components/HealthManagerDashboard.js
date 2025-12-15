import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  collection,
  onSnapshot,
  getDocs,
  Timestamp,
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
  TextField,
  InputAdornment,
  Button,
  CircularProgress,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Avatar,
  LinearProgress,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Divider,
  Badge,
  Menu,
} from "@mui/material";
import {
  Person,
  Circle,
  Phone,
  Search as SearchIcon,
  Group,
  TrendingUp,
  FileDownload,
  FilterList,
  Refresh,
  BarChart as BarChartIcon,
  ShowChart,
  LocalHospital,
  CheckCircle,
  Cancel,
  AccessTime,
  ArrowUpward,
  ArrowDownward,
  Visibility,
  GridView,
  ViewList,
  PhoneCallback,
  PhoneForwarded,
  Timeline,
  Assessment,
  ZoomOutMap,
  MoreVert,
  TableChart,
  Download,
} from "@mui/icons-material";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area,
} from "recharts";

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
    const startValue = 0;

    const animate = () => {
      const now = Date.now();
      const progress = Math.min((now - startTime) / duration, 1);
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const currentValue = Math.floor(startValue + (end - startValue) * easeOut);

      setCount(currentValue);

      if (progress < 1) {
        countRef.current = requestAnimationFrame(animate);
      }
    };

    countRef.current = requestAnimationFrame(animate);

    return () => {
      if (countRef.current) {
        cancelAnimationFrame(countRef.current);
      }
    };
  }, [end, duration]);

  return count;
};

// Animated Stat Card
const AnimatedStatCard = ({ title, value, icon, gradient, subtitle, trend, trendValue }) => {
  const animatedValue = useAnimatedCounter(value);

  return (
    <Card
      elevation={0}
      sx={{
        background: gradient,
        color: "white",
        borderRadius: 3,
        overflow: "hidden",
        position: "relative",
        transition: "all 0.3s ease",
        "&:hover": {
          transform: "translateY(-8px)",
          boxShadow: "0 20px 40px rgba(0,0,0,0.15)",
        },
      }}
    >
      <CardContent sx={{ p: 3, position: "relative", zIndex: 1 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <Box>
            <Typography variant="body2" sx={{ opacity: 0.9, mb: 1, fontWeight: 500 }}>
              {title}
            </Typography>
            <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
              {animatedValue}
            </Typography>
            {subtitle && (
              <Chip
                label={subtitle}
                size="small"
                sx={{
                  bgcolor: "rgba(255,255,255,0.2)",
                  color: "white",
                  fontWeight: 600,
                  fontSize: "0.7rem",
                }}
              />
            )}
            {trend && (
              <Box sx={{ display: "flex", alignItems: "center", mt: 1 }}>
                {trend === "up" ? (
                  <ArrowUpward sx={{ fontSize: 16, mr: 0.5 }} />
                ) : (
                  <ArrowDownward sx={{ fontSize: 16, mr: 0.5 }} />
                )}
                <Typography variant="caption" sx={{ fontWeight: 600 }}>
                  {trendValue}
                </Typography>
              </Box>
            )}
          </Box>
          <Avatar
            sx={{
              bgcolor: "rgba(255,255,255,0.2)",
              width: 56,
              height: 56,
            }}
          >
            {icon}
          </Avatar>
        </Box>
      </CardContent>
      {/* Decorative circles */}
      <Box
        sx={{
          position: "absolute",
          top: -30,
          right: -30,
          width: 120,
          height: 120,
          borderRadius: "50%",
          bgcolor: "rgba(255,255,255,0.1)",
        }}
      />
      <Box
        sx={{
          position: "absolute",
          bottom: -40,
          right: 40,
          width: 80,
          height: 80,
          borderRadius: "50%",
          bgcolor: "rgba(255,255,255,0.08)",
        }}
      />
    </Card>
  );
};

// Agent Card Component
const AgentCard = ({ agent, onDownload, onClick }) => {
  const successRate = agent.totalCalls > 0
    ? Math.round((agent.connectedCalls / agent.totalCalls) * 100)
    : 0;

  return (
    <Card
      elevation={0}
      sx={{
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 3,
        cursor: "pointer",
        transition: "all 0.3s ease",
        "&:hover": {
          transform: "translateY(-6px)",
          boxShadow: "0 12px 24px rgba(0,0,0,0.1)",
          borderColor: "#11998e",
        },
      }}
      onClick={onClick}
    >
      <CardContent sx={{ p: 2.5 }}>
        <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2 }}>
          <Badge
            overlap="circular"
            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            badgeContent={
              <Circle
                sx={{
                  fontSize: 14,
                  color: isAgentActive(agent.status) ? "#22c55e" : "#94a3b8",
                }}
              />
            }
          >
            <Avatar
              sx={{
                width: 56,
                height: 56,
                bgcolor: "linear-gradient(135deg, #11998e 0%, #38ef7d 100%)",
                background: "linear-gradient(135deg, #11998e 0%, #38ef7d 100%)",
                fontSize: "1.5rem",
                fontWeight: 600,
              }}
            >
              {agent.avatar}
            </Avatar>
          </Badge>
          <Box sx={{ flexGrow: 1, minWidth: 0 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.5 }} noWrap>
              {agent.name}
            </Typography>
            <Typography variant="caption" sx={{ color: "text.secondary", display: "block" }}>
              {agent.empId}
            </Typography>
            <Chip
              label={getStatusConfig(agent.status).label}
              size="small"
              sx={{
                mt: 0.5,
                height: 22,
                bgcolor: getStatusConfig(agent.status).bgColor,
                color: getStatusConfig(agent.status).color,
                fontWeight: 600,
                fontSize: "0.7rem",
              }}
            />
          </Box>
          <Tooltip title="Download Report">
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                onDownload(e, agent);
              }}
              sx={{
                bgcolor: "#f0fdf4",
                color: "#11998e",
                "&:hover": { bgcolor: "#dcfce7" },
              }}
            >
              <FileDownload fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>

        {/* Stats Row */}
        <Box sx={{ mt: 2, pt: 2, borderTop: "1px solid", borderColor: "divider" }}>
          <Grid container spacing={2}>
            <Grid item xs={4}>
              <Box sx={{ textAlign: "center" }}>
                <Typography variant="h6" sx={{ fontWeight: 700, color: "#3b82f6" }}>
                  {agent.totalCalls || 0}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Total
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={4}>
              <Box sx={{ textAlign: "center" }}>
                <Typography variant="h6" sx={{ fontWeight: 700, color: "#22c55e" }}>
                  {agent.connectedCalls || 0}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Connected
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={4}>
              <Box sx={{ textAlign: "center" }}>
                <Typography variant="h6" sx={{ fontWeight: 700, color: "#f59e0b" }}>
                  {successRate}%
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Success
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Box>

        {/* Progress Bar */}
        <Box sx={{ mt: 2 }}>
          <LinearProgress
            variant="determinate"
            value={successRate}
            sx={{
              height: 6,
              borderRadius: 3,
              bgcolor: "#e2e8f0",
              "& .MuiLinearProgress-bar": {
                borderRadius: 3,
                background: "linear-gradient(90deg, #11998e 0%, #38ef7d 100%)",
              },
            }}
          />
        </Box>
      </CardContent>
    </Card>
  );
};

// Chart Colors
const CHART_COLORS = ["#11998e", "#38ef7d", "#22c55e", "#3b82f6", "#f59e0b", "#ef4444"];

// Health Manager Theme
const HEALTH_THEME = {
  primary: "#11998e",
  primaryLight: "#38ef7d",
  success: "#22c55e",
  danger: "#ef4444",
  accent: "#f59e0b",
  purple: "#8b5cf6",
  pink: "#ec4899",
  gradient: "linear-gradient(135deg, #11998e 0%, #38ef7d 100%)",
};

// Helper function to check if agent is active/online
const isAgentActive = (status) => {
  return status === "Available" || status === "On Call" ||
         status === "Login" || status === "Idle" || status === "Busy";
};

// Helper function to get status display config
const getStatusConfig = (status) => {
  const configs = {
    "Available": { label: "Available", color: "#22c55e", bgColor: "#dcfce7" },
    "On Call": { label: "On Call", color: "#f59e0b", bgColor: "#fef3c7" },
    "Unavailable": { label: "Offline", color: "#64748b", bgColor: "#f1f5f9" },
    // Legacy status backwards compatibility
    "Login": { label: "Available", color: "#22c55e", bgColor: "#dcfce7" },
    "Logout": { label: "Offline", color: "#64748b", bgColor: "#f1f5f9" },
    "Logged Out": { label: "Offline", color: "#64748b", bgColor: "#f1f5f9" },
    "Idle": { label: "Available", color: "#22c55e", bgColor: "#dcfce7" },
    "Busy": { label: "On Call", color: "#f59e0b", bgColor: "#fef3c7" },
  };
  return configs[status] || configs["Unavailable"];
};

// Export to CSV helper
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
          border: `1px solid ${HEALTH_THEME.primary}30`,
          borderRadius: "12px",
        }}
      >
        <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>
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

// Chart Card Component with Expand Button
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
          boxShadow: `0 12px 40px ${HEALTH_THEME.primary}15`,
          transform: "translateY(-4px)",
        },
      }}
    >
      <CardContent sx={{ p: 3 }}>
        {/* Header with Title and Actions */}
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
          <Typography variant="h6" fontWeight={700} color={HEALTH_THEME.primary}>
            {title}
          </Typography>
          <Box sx={{ display: "flex", gap: 0.5 }}>
            {/* Direct Expand Button */}
            <Tooltip title="Expand Chart">
              <IconButton
                size="small"
                onClick={() => setExpandedOpen(true)}
                sx={{
                  bgcolor: `${HEALTH_THEME.primary}15`,
                  "&:hover": {
                    bgcolor: HEALTH_THEME.primary,
                    "& .MuiSvgIcon-root": { color: "#fff" }
                  },
                  transition: "all 0.2s ease",
                }}
              >
                <ZoomOutMap sx={{ color: HEALTH_THEME.primary, fontSize: 20 }} />
              </IconButton>
            </Tooltip>
            {/* More Options Menu */}
            <IconButton
              size="small"
              onClick={(e) => setAnchorEl(e.currentTarget)}
              sx={{
                bgcolor: `${HEALTH_THEME.primary}15`,
                "&:hover": { bgcolor: `${HEALTH_THEME.primary}25` },
              }}
            >
              <MoreVert sx={{ color: HEALTH_THEME.primary, fontSize: 20 }} />
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
          <ZoomOutMap sx={{ mr: 1, fontSize: 20, color: HEALTH_THEME.primary }} />
          Expanded View
        </MenuItem>
        <MenuItem
          onClick={() => {
            setTableOpen(true);
            setAnchorEl(null);
          }}
        >
          <TableChart sx={{ mr: 1, fontSize: 20, color: HEALTH_THEME.primary }} />
          Table View
        </MenuItem>
        <MenuItem
          onClick={() => {
            exportToCSV(chartData, title.replace(/\s+/g, "_"), columns);
            setAnchorEl(null);
          }}
        >
          <Download sx={{ mr: 1, fontSize: 20, color: HEALTH_THEME.primary }} />
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
          borderBottom: `1px solid ${HEALTH_THEME.primary}20`,
          background: HEALTH_THEME.gradient,
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
        <DialogTitle sx={{ borderBottom: `1px solid ${HEALTH_THEME.primary}20` }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Typography variant="h6" fontWeight={600} color={HEALTH_THEME.primary}>
              {title} - Data Table
            </Typography>
            <Button
              startIcon={<Download />}
              onClick={() => exportToCSV(chartData, title.replace(/\s+/g, "_"), columns)}
              size="small"
              sx={{
                bgcolor: `${HEALTH_THEME.primary}15`,
                color: HEALTH_THEME.primary,
                textTransform: "none",
                fontWeight: 600,
                borderRadius: "10px",
                "&:hover": { bgcolor: `${HEALTH_THEME.primary}25` },
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
                <TableRow sx={{ bgcolor: `${HEALTH_THEME.primary}10` }}>
                  {columns.map((col) => (
                    <TableCell key={col} sx={{ fontWeight: 600, textTransform: "capitalize", color: HEALTH_THEME.primary }}>
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
              color: HEALTH_THEME.primary,
              borderColor: HEALTH_THEME.primary,
              borderRadius: "10px",
              "&:hover": {
                bgcolor: `${HEALTH_THEME.primary}10`,
                borderColor: HEALTH_THEME.primary,
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

/**
 * Health Manager Dashboard - Revamped
 * Modern UI with animations, charts, and enhanced visualizations
 */
function HealthManagerDashboard({ currentUser }) {
  const [healthAgents, setHealthAgents] = useState([]);
  const [healthTLs, setHealthTLs] = useState([]);
  const [callLogs, setCallLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [viewMode, setViewMode] = useState("grid");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [filters, setFilters] = useState({
    dateFrom: "",
    dateTo: "",
    callType: "all",
    escalation: "all",
    callConnected: "all",
    agentType: "all",
  });
  const navigate = useNavigate();

  useEffect(() => {
    if (!currentUser) return;

    let mounted = true;
    const unsubscribes = [];

    const fetchHealthData = async () => {
      try {
        setLoading(true);

        // Fetch Health TLs from healthTeamLeads collection
        const healthTLsRef = collection(db, "healthTeamLeads");
        const tlUnsubscribe = onSnapshot(healthTLsRef, (snapshot) => {
          if (!mounted) return;
          const tls = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
          }));
          setHealthTLs(tls);
        });
        unsubscribes.push(tlUnsubscribe);

        // Fetch Health Agents from healthAgents collection
        const healthAgentsRef = collection(db, "healthAgents");
        const agentsUnsubscribe = onSnapshot(healthAgentsRef, (snapshot) => {
          if (!mounted) return;

          snapshot.docs.forEach((agentDoc) => {
            const agentData = agentDoc.data();
            const agentId = agentDoc.id;

            // Listen to call logs for this agent
            const callLogsRef = collection(db, "healthAgents", agentId, "callLogs");
            const logsUnsubscribe = onSnapshot(callLogsRef, (logsSnapshot) => {
              if (!mounted) return;

              const logs = logsSnapshot.docs.map((log) => {
                const data = log.data();
                return {
                  id: log.id,
                  ...data,
                  timestamp: data.timestamp instanceof Timestamp
                    ? data.timestamp.toDate()
                    : data.timestamp
                    ? new Date(data.timestamp)
                    : null,
                  startTime: data.startTime instanceof Timestamp
                    ? data.startTime.toDate()
                    : data.startTime
                    ? new Date(data.startTime)
                    : null,
                  endTime: data.endTime instanceof Timestamp
                    ? data.endTime.toDate()
                    : data.endTime
                    ? new Date(data.endTime)
                    : null,
                  agentId,
                  agentName: agentData.name,
                  collectionName: "healthAgents",
                };
              });

              logs.sort((a, b) => (b.startTime || 0) - (a.startTime || 0));

              const totalCalls = logs.length;
              const connectedCalls = logs.filter((log) => log.callConnected === true).length;

              setHealthAgents((prevAgents) => {
                const updatedAgents = prevAgents.filter((a) => a.uid !== agentId);
                updatedAgents.push({
                  uid: agentId,
                  collection: "healthAgents",
                  name: agentData.name || "Unknown Agent",
                  email: agentData.email || "",
                  empId: agentData.empId || "",
                  mobile: agentData.mobile || agentData.phoneNumber || "",
                  status: agentData.status || "Logout",
                  department: "Health",
                  teamLeadId: agentData.teamLeadId || "",
                  avatar: agentData.name?.charAt(0) || "H",
                  totalCalls,
                  connectedCalls,
                  callLogs: logs,
                });
                return updatedAgents.sort((a, b) => a.name.localeCompare(b.name));
              });

              setCallLogs((prevLogs) => [
                ...prevLogs.filter((log) => log.agentId !== agentId),
                ...logs.map(log => ({
                  ...log,
                  agentName: agentData.name || "Unknown Agent",
                  agentEmpId: agentData.empId || "",
                })),
              ]);
            });
            unsubscribes.push(logsUnsubscribe);
          });

          if (mounted) {
            setLoading(false);
          }
        });
        unsubscribes.push(agentsUnsubscribe);
      } catch (error) {
        console.error("Error in fetchHealthData:", error);
        if (mounted) setLoading(false);
      }
    };

    fetchHealthData();

    return () => {
      mounted = false;
      unsubscribes.forEach((unsub) => unsub());
    };
  }, [currentUser]);

  // Filter agents
  const filteredAgents = healthAgents.filter((agent) => {
    const query = searchQuery.toLowerCase();
    const basicMatch =
      agent.name?.toLowerCase().includes(query) ||
      agent.email?.toLowerCase().includes(query) ||
      agent.empId?.toLowerCase().includes(query) ||
      agent.mobile?.includes(query);

    const callLogMatch = agent.callLogs?.some(log =>
      log.sid?.toLowerCase().includes(query) ||
      log.callId?.toLowerCase().includes(query) ||
      log.clientNumber?.includes(query)
    );

    return basicMatch || callLogMatch;
  });

  // Calculate stats
  const totalHealthAgents = healthAgents.length;
  const onlineHealthAgents = healthAgents.filter((a) => isAgentActive(a.status)).length;
  const totalCallsAllAgents = healthAgents.reduce((sum, agent) => sum + (agent.totalCalls || 0), 0);
  const totalConnectedCalls = healthAgents.reduce((sum, agent) => sum + (agent.connectedCalls || 0), 0);
  const overallSuccessRate = totalCallsAllAgents > 0
    ? Math.round((totalConnectedCalls / totalCallsAllAgents) * 100)
    : 0;

  // Analytics Data
  const analyticsData = {
    callsByDate: (() => {
      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (6 - i));
        return date.toISOString().split('T')[0];
      });

      return last7Days.map(date => {
        const logsOnDate = callLogs.filter(log => {
          if (!log.timestamp) return false;
          const logDate = new Date(log.timestamp).toISOString().split('T')[0];
          return logDate === date;
        });

        return {
          date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          total: logsOnDate.length,
          connected: logsOnDate.filter(l => l.callConnected).length,
          notConnected: logsOnDate.filter(l => !l.callConnected).length,
        };
      });
    })(),

    callStatus: [
      { name: 'Connected', value: totalConnectedCalls, color: '#22c55e' },
      { name: 'Not Connected', value: totalCallsAllAgents - totalConnectedCalls, color: '#ef4444' },
    ],

    callsByType: (() => {
      const types = {};
      callLogs.forEach(log => {
        const type = log.callType || 'Unknown';
        types[type] = (types[type] || 0) + 1;
      });
      return Object.entries(types).map(([name, value]) => ({ name, value }));
    })(),

    topAgents: healthAgents
      .map(agent => ({
        name: agent.name?.split(' ')[0] || 'Unknown',
        fullName: agent.name,
        totalCalls: agent.totalCalls || 0,
        connectedCalls: agent.connectedCalls || 0,
        successRate: agent.totalCalls > 0
          ? Math.round((agent.connectedCalls / agent.totalCalls) * 100)
          : 0,
      }))
      .sort((a, b) => b.totalCalls - a.totalCalls)
      .slice(0, 5),

    hourlyDistribution: (() => {
      const hours = Array.from({ length: 24 }, (_, i) => ({ hour: `${i.toString().padStart(2, "0")}:00`, calls: 0, connected: 0 }));
      callLogs.forEach(log => {
        if (log.timestamp) {
          const hour = new Date(log.timestamp).getHours();
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
        const logsOnDate = callLogs.filter(log => {
          if (!log.timestamp) return false;
          const logDate = new Date(log.timestamp).toISOString().split('T')[0];
          return logDate === date;
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

    // Duration Distribution
    durationDistribution: (() => {
      const ranges = [
        { name: "< 1 min", min: 0, max: 60, count: 0 },
        { name: "1-3 min", min: 60, max: 180, count: 0 },
        { name: "3-5 min", min: 180, max: 300, count: 0 },
        { name: "5-10 min", min: 300, max: 600, count: 0 },
        { name: "> 10 min", min: 600, max: Infinity, count: 0 },
      ];

      callLogs.forEach(log => {
        if (log.callConnected && log.startTime && log.endTime) {
          const start = log.startTime instanceof Date ? log.startTime : new Date(log.startTime);
          const end = log.endTime instanceof Date ? log.endTime : new Date(log.endTime);
          const durationSeconds = (end - start) / 1000;

          for (const range of ranges) {
            if (durationSeconds >= range.min && durationSeconds < range.max) {
              range.count++;
              break;
            }
          }
        }
      });

      const colors = [HEALTH_THEME.primary, HEALTH_THEME.success, HEALTH_THEME.accent, HEALTH_THEME.purple, HEALTH_THEME.pink];
      return ranges.map((range, index) => ({
        name: range.name,
        value: range.count,
        color: colors[index],
      })).filter(item => item.value > 0);
    })(),

    // Day of Week Analysis
    dayOfWeekData: (() => {
      const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      const dayMap = new Map();

      days.forEach((day, index) => {
        dayMap.set(index, { day, calls: 0, connected: 0 });
      });

      callLogs.forEach(log => {
        if (log.timestamp) {
          const date = new Date(log.timestamp);
          const dayIndex = date.getDay();
          const data = dayMap.get(dayIndex);
          data.calls++;
          if (log.callConnected) data.connected++;
        }
      });

      return Array.from(dayMap.values());
    })(),

    // Weekly Comparison
    weeklyComparison: (() => {
      const weekMap = new Map();

      callLogs.forEach(log => {
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
          });
        }

        const weekData = weekMap.get(weekKey);
        weekData.totalCalls++;
        if (log.callConnected) weekData.connected++;
      });

      return Array.from(weekMap.values())
        .map(week => ({
          ...week,
          rate: week.totalCalls > 0 ? Math.round((week.connected / week.totalCalls) * 100) : 0,
        }))
        .sort((a, b) => new Date(a.week) - new Date(b.week));
    })(),
  };

  // Format helpers
  const formatTimestamp = (timestamp) => {
    if (!timestamp || isNaN(timestamp)) return "N/A";
    return timestamp.toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
      hour12: true,
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const calculateActualDuration = (startTime, endTime) => {
    if (!startTime || !endTime) return "N/A";
    const start = startTime instanceof Date ? startTime : new Date(startTime);
    const end = endTime instanceof Date ? endTime : new Date(endTime);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) return "N/A";
    const durationMs = end - start;
    if (durationMs < 0) return "N/A";
    const hours = Math.floor(durationMs / (1000 * 60 * 60));
    const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((durationMs % (1000 * 60)) / 1000);
    return `${hours}h ${minutes}m ${seconds}s`;
  };

  const formatDuration = (duration) => {
    if (!duration || typeof duration !== "object") return "N/A";
    return `${duration.hours || 0}h ${duration.minutes || 0}m ${duration.seconds || 0}s`;
  };

  // Apply filters to call logs
  const applyFilters = (logs) => {
    return logs.filter((log) => {
      if (filters.dateFrom) {
        const logDate = log.timestamp ? new Date(log.timestamp) : null;
        const fromDate = new Date(filters.dateFrom);
        if (!logDate || logDate < fromDate) return false;
      }
      if (filters.dateTo) {
        const logDate = log.timestamp ? new Date(log.timestamp) : null;
        const toDate = new Date(filters.dateTo);
        toDate.setHours(23, 59, 59, 999);
        if (!logDate || logDate > toDate) return false;
      }
      if (filters.callType !== "all" && log.callType !== filters.callType) return false;
      if (filters.escalation !== "all") {
        const isEscalated = log.escalation === "Yes" || log.escalation === true;
        if (filters.escalation === "yes" && !isEscalated) return false;
        if (filters.escalation === "no" && isEscalated) return false;
      }
      if (filters.callConnected !== "all") {
        if (filters.callConnected === "connected" && !log.callConnected) return false;
        if (filters.callConnected === "not_connected" && log.callConnected) return false;
      }
      return true;
    });
  };

  // Reset filters
  const handleResetFilters = () => {
    setFilters({
      dateFrom: "",
      dateTo: "",
      callType: "all",
      escalation: "all",
      callConnected: "all",
      agentType: "all",
    });
  };

  // Refresh data
  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = [
      "Agent Name", "MSID", "SID", "Call ID", "Client Number", "Call Type",
      "Agent Type", "Escalation", "Call Category", "Partner", "Timestamp",
      "Manual Duration", "Actual Duration", "Connected", "Status", "Reason", "Remarks",
    ];

    const filteredLogs = applyFilters(callLogs);
    const rows = filteredLogs.map((log) => [
      log.agentName || "N/A",
      log.agentEmpId || "N/A",
      log.sid || "N/A",
      log.callId || log.id || "N/A",
      log.clientNumber || "N/A",
      log.callType || "N/A",
      log.agentType || "N/A",
      log.escalation || "N/A",
      log.callCategory || "N/A",
      log.partner || log.partnerName || "N/A",
      log.timestamp ? formatTimestamp(log.timestamp) : "N/A",
      formatDuration(log.duration),
      log.callConnected ? calculateActualDuration(log.startTime, log.endTime) : "N/A",
      log.callConnected ? "Yes" : "No",
      log.callConnected ? log.callStatus || "N/A" : "N/A",
      log.callConnected ? "N/A" : log.notConnectedReason || "N/A",
      log.remarks || "N/A",
    ]);

    if (rows.length === 0) {
      healthAgents.forEach((agent) => {
        rows.push([agent.name || "N/A", agent.empId || "N/A", ...Array(15).fill("N/A")]);
      });
    }

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((field) => `"${String(field).replace(/"/g, '""')}"`).join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `health_team_calls_${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  // Download individual agent CSV
  const handleDownloadAgentCSV = (event, agent) => {
    event.stopPropagation();

    const headers = [
      "Agent Name", "MSID", "SID", "Call ID", "Client Number", "Call Type",
      "Agent Type", "Escalation", "Partner", "Timestamp", "Duration", "Connected", "Remarks",
    ];

    // Apply date filters to agent logs
    let agentLogs = agent.callLogs || [];
    if (filters.dateFrom || filters.dateTo) {
      agentLogs = agentLogs.filter((log) => {
        const logDate = log.timestamp ? new Date(log.timestamp) : null;
        if (!logDate) return false;
        if (filters.dateFrom) {
          const fromDate = new Date(filters.dateFrom);
          fromDate.setHours(0, 0, 0, 0);
          if (logDate < fromDate) return false;
        }
        if (filters.dateTo) {
          const toDate = new Date(filters.dateTo);
          toDate.setHours(23, 59, 59, 999);
          if (logDate > toDate) return false;
        }
        return true;
      });
    }

    const rows = agentLogs.map((log) => [
      agent.name || "N/A",
      agent.empId || "N/A",
      log.sid || "N/A",
      log.callId || log.id || "N/A",
      log.clientNumber || "N/A",
      log.callType || "N/A",
      log.agentType || "N/A",
      log.escalation ? "Yes" : "No",
      log.partner || "N/A",
      formatTimestamp(log.timestamp),
      log.callConnected ? calculateActualDuration(log.startTime, log.endTime) : "N/A",
      log.callConnected ? "Yes" : "No",
      log.remarks || "N/A",
    ]);

    if (rows.length === 0) {
      rows.push([agent.name || "N/A", agent.empId || "N/A", ...Array(11).fill("N/A")]);
    }

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((field) => `"${String(field).replace(/"/g, '""')}"`).join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${agent.name.replace(/\s+/g, "_")}_calls_${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "60vh",
        }}
      >
        <CircularProgress size={60} sx={{ color: "#11998e", mb: 2 }} />
        <Typography variant="body1" color="text.secondary">
          Loading Health Department data...
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      {/* Loading Progress */}
      {refreshing && <LinearProgress sx={{ position: "absolute", top: 0, left: 0, right: 0 }} />}

      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 2 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Avatar
              sx={{
                width: 56,
                height: 56,
                background: "linear-gradient(135deg, #11998e 0%, #38ef7d 100%)",
              }}
            >
              <LocalHospital sx={{ fontSize: 32 }} />
            </Avatar>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 700, color: "#0f172a" }}>
                Health Department
              </Typography>
              <Typography variant="body2" sx={{ color: "#64748b" }}>
                {totalHealthAgents} agents • {onlineHealthAgents} online
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
            <Tooltip title="Refresh">
              <IconButton
                onClick={handleRefresh}
                sx={{
                  bgcolor: refreshing ? "primary.light" : "#f1f5f9",
                  animation: refreshing ? "spin 1s linear infinite" : "none",
                  "@keyframes spin": {
                    "0%": { transform: "rotate(0deg)" },
                    "100%": { transform: "rotate(360deg)" },
                  },
                }}
              >
                <Refresh />
              </IconButton>
            </Tooltip>
            <Button
              variant="outlined"
              startIcon={<FilterList />}
              onClick={() => setFilterDialogOpen(true)}
              sx={{ borderRadius: 2 }}
            >
              Filters
            </Button>
            <Button
              variant="contained"
              startIcon={<FileDownload />}
              onClick={handleExportCSV}
              sx={{
                borderRadius: 2,
                background: "linear-gradient(135deg, #11998e 0%, #38ef7d 100%)",
                "&:hover": {
                  background: "linear-gradient(135deg, #0d7d71 0%, #2fd36b 100%)",
                },
              }}
            >
              Export CSV
            </Button>
          </Box>
        </Box>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <AnimatedStatCard
            title="Total Agents"
            value={totalHealthAgents}
            icon={<Group sx={{ fontSize: 28 }} />}
            gradient="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
            subtitle={`${healthTLs.length} TLs`}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <AnimatedStatCard
            title="Online Now"
            value={onlineHealthAgents}
            icon={<Circle sx={{ fontSize: 28 }} />}
            gradient="linear-gradient(135deg, #11998e 0%, #38ef7d 100%)"
            trend="up"
            trendValue={`${Math.round((onlineHealthAgents / totalHealthAgents) * 100) || 0}% Active`}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <AnimatedStatCard
            title="Total Calls"
            value={totalCallsAllAgents}
            icon={<Phone sx={{ fontSize: 28 }} />}
            gradient="linear-gradient(135deg, #f093fb 0%, #f5576c 100%)"
            subtitle={`${totalConnectedCalls} Connected`}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <AnimatedStatCard
            title="Success Rate"
            value={overallSuccessRate}
            icon={<TrendingUp sx={{ fontSize: 28 }} />}
            gradient="linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)"
            subtitle={`${overallSuccessRate}% Conversion`}
          />
        </Grid>
      </Grid>

      {/* Tabs for different views */}
      <Box sx={{ mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={(e, v) => setActiveTab(v)}
          sx={{
            borderBottom: 1,
            borderColor: "divider",
            "& .MuiTab-root": {
              textTransform: "none",
              fontWeight: 600,
              fontSize: "0.95rem",
            },
          }}
        >
          <Tab icon={<Group />} iconPosition="start" label="Agents" />
          <Tab icon={<Assessment />} iconPosition="start" label="Analytics" />
          <Tab icon={<Timeline />} iconPosition="start" label="Call Logs" />
        </Tabs>
      </Box>

      {/* Tab Content */}
      {activeTab === 0 && (
        <Box>
          {/* Search and View Toggle */}
          <Box sx={{ mb: 3, display: "flex", gap: 2, flexWrap: "wrap", alignItems: "center" }}>
            <TextField
              placeholder="Search by name, phone, SID, Call ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              sx={{ flexGrow: 1, minWidth: 300 }}
              size="small"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
                sx: { borderRadius: 2 },
              }}
            />
            <Box sx={{ display: "flex", bgcolor: "#f1f5f9", borderRadius: 2, p: 0.5 }}>
              <IconButton
                onClick={() => setViewMode("grid")}
                sx={{
                  bgcolor: viewMode === "grid" ? "white" : "transparent",
                  boxShadow: viewMode === "grid" ? 1 : 0,
                  borderRadius: 1.5,
                }}
              >
                <GridView />
              </IconButton>
              <IconButton
                onClick={() => setViewMode("list")}
                sx={{
                  bgcolor: viewMode === "list" ? "white" : "transparent",
                  boxShadow: viewMode === "list" ? 1 : 0,
                  borderRadius: 1.5,
                }}
              >
                <ViewList />
              </IconButton>
            </Box>
          </Box>

          {/* Agents Grid */}
          {viewMode === "grid" ? (
            <Grid container spacing={3}>
              {filteredAgents.map((agent) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={agent.uid}>
                  <AgentCard
                    agent={agent}
                    onDownload={handleDownloadAgentCSV}
                    onClick={() => navigate(`/agent-details/healthAgents/${agent.uid}`)}
                  />
                </Grid>
              ))}
            </Grid>
          ) : (
            <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 3, border: "1px solid", borderColor: "divider" }}>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: "#f8fafc" }}>
                    <TableCell sx={{ fontWeight: 600 }}>Agent</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 600 }} align="center">Total Calls</TableCell>
                    <TableCell sx={{ fontWeight: 600 }} align="center">Connected</TableCell>
                    <TableCell sx={{ fontWeight: 600 }} align="center">Success Rate</TableCell>
                    <TableCell sx={{ fontWeight: 600 }} align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredAgents.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((agent) => (
                    <TableRow
                      key={agent.uid}
                      hover
                      sx={{ cursor: "pointer" }}
                      onClick={() => navigate(`/agent-details/healthAgents/${agent.uid}`)}
                    >
                      <TableCell>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                          <Avatar sx={{ bgcolor: "#11998e" }}>{agent.avatar}</Avatar>
                          <Box>
                            <Typography variant="body2" fontWeight={600}>{agent.name}</Typography>
                            <Typography variant="caption" color="text.secondary">{agent.empId}</Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={getStatusConfig(agent.status).label}
                          size="small"
                          sx={{
                            bgcolor: getStatusConfig(agent.status).bgColor,
                            color: getStatusConfig(agent.status).color,
                          }}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Typography variant="body2" fontWeight={600}>{agent.totalCalls || 0}</Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Typography variant="body2" fontWeight={600} color="success.main">{agent.connectedCalls || 0}</Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label={`${agent.totalCalls > 0 ? Math.round((agent.connectedCalls / agent.totalCalls) * 100) : 0}%`}
                          size="small"
                          sx={{ bgcolor: "#eff6ff", color: "#3b82f6" }}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Tooltip title="Download Report">
                          <IconButton
                            size="small"
                            onClick={(e) => handleDownloadAgentCSV(e, agent)}
                          >
                            <FileDownload fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="View Details">
                          <IconButton size="small">
                            <Visibility fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={filteredAgents.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={(e, newPage) => setPage(newPage)}
                onRowsPerPageChange={(e) => {
                  setRowsPerPage(parseInt(e.target.value, 10));
                  setPage(0);
                }}
              />
            </TableContainer>
          )}

          {filteredAgents.length === 0 && (
            <Paper sx={{ p: 6, textAlign: "center", borderRadius: 3 }}>
              <Group sx={{ fontSize: 64, color: "#e2e8f0", mb: 2 }} />
              <Typography variant="h6" color="text.secondary">
                No health agents found
              </Typography>
            </Paper>
          )}
        </Box>
      )}

      {activeTab === 1 && (
        <Grid container spacing={3}>
          {/* Row 1: Calls Trend (Full Width) */}
          <Grid item xs={12}>
            <ChartCard
              title="Calls Trend (Last 7 Days)"
              chartData={analyticsData.callsByDate}
              columns={["date", "total", "connected", "notConnected"]}
              height={300}
              chartElement={
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={analyticsData.callsByDate}>
                    <defs>
                      <linearGradient id="colorConnectedHealth" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={HEALTH_THEME.success} stopOpacity={0.3} />
                        <stop offset="95%" stopColor={HEALTH_THEME.success} stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorNotConnectedHealth" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={HEALTH_THEME.danger} stopOpacity={0.3} />
                        <stop offset="95%" stopColor={HEALTH_THEME.danger} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke={`${HEALTH_THEME.primary}20`} />
                    <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <RechartsTooltip content={<CustomChartTooltip />} />
                    <Legend />
                    <Area type="monotone" dataKey="connected" stroke={HEALTH_THEME.success} fillOpacity={1} fill="url(#colorConnectedHealth)" name="Connected" strokeWidth={2} />
                    <Area type="monotone" dataKey="notConnected" stroke={HEALTH_THEME.danger} fillOpacity={1} fill="url(#colorNotConnectedHealth)" name="Not Connected" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              }
            >
              {analyticsData.callsByDate.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={analyticsData.callsByDate}>
                    <defs>
                      <linearGradient id="colorConnectedHealthSmall" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={HEALTH_THEME.success} stopOpacity={0.3} />
                        <stop offset="95%" stopColor={HEALTH_THEME.success} stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorNotConnectedHealthSmall" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={HEALTH_THEME.danger} stopOpacity={0.3} />
                        <stop offset="95%" stopColor={HEALTH_THEME.danger} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke={`${HEALTH_THEME.primary}20`} />
                    <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <RechartsTooltip content={<CustomChartTooltip />} />
                    <Legend />
                    <Area type="monotone" dataKey="connected" stroke={HEALTH_THEME.success} fillOpacity={1} fill="url(#colorConnectedHealthSmall)" name="Connected" strokeWidth={2} />
                    <Area type="monotone" dataKey="notConnected" stroke={HEALTH_THEME.danger} fillOpacity={1} fill="url(#colorNotConnectedHealthSmall)" name="Not Connected" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%" }}>
                  <Typography color="text.secondary">No data available</Typography>
                </Box>
              )}
            </ChartCard>
          </Grid>

          {/* Row 2: Call Status, Top Performers, Calls by Type, Connection Rate */}
          <Grid item xs={12} md={6} lg={3}>
            <ChartCard
              title="Call Status Distribution"
              chartData={analyticsData.callStatus}
              columns={["name", "value"]}
              height={280}
              chartElement={
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={analyticsData.callStatus} cx="50%" cy="50%" innerRadius={100} outerRadius={160} dataKey="value" label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}>
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
              {analyticsData.callStatus.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={analyticsData.callStatus} cx="50%" cy="50%" innerRadius={50} outerRadius={90} dataKey="value" label={({ percent }) => `${(percent * 100).toFixed(0)}%`}>
                      {analyticsData.callStatus.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <RechartsTooltip content={<CustomChartTooltip />} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%" }}>
                  <Typography color="text.secondary">No data available</Typography>
                </Box>
              )}
            </ChartCard>
          </Grid>

          <Grid item xs={12} md={6} lg={3}>
            <ChartCard
              title="Top 5 Performers"
              chartData={analyticsData.topAgents}
              columns={["name", "totalCalls", "connectedCalls"]}
              height={280}
              chartElement={
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analyticsData.topAgents} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke={`${HEALTH_THEME.primary}20`} />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" width={80} tick={{ fontSize: 12 }} />
                    <RechartsTooltip content={<CustomChartTooltip />} />
                    <Legend />
                    <Bar dataKey="connectedCalls" fill={HEALTH_THEME.success} name="Connected" radius={[0, 4, 4, 0]} />
                    <Bar dataKey="totalCalls" fill={HEALTH_THEME.primary} name="Total Calls" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              }
            >
              {analyticsData.topAgents.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analyticsData.topAgents} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke={`${HEALTH_THEME.primary}20`} />
                    <XAxis type="number" tick={{ fontSize: 10 }} />
                    <YAxis dataKey="name" type="category" width={70} tick={{ fontSize: 10 }} />
                    <RechartsTooltip content={<CustomChartTooltip />} />
                    <Legend wrapperStyle={{ fontSize: 10 }} />
                    <Bar dataKey="connectedCalls" fill={HEALTH_THEME.success} name="Connected" radius={[0, 4, 4, 0]} />
                    <Bar dataKey="totalCalls" fill={HEALTH_THEME.primary} name="Total" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%" }}>
                  <Typography color="text.secondary">No data available</Typography>
                </Box>
              )}
            </ChartCard>
          </Grid>

          <Grid item xs={12} md={6} lg={3}>
            <ChartCard
              title="Calls by Type"
              chartData={analyticsData.callsByType}
              columns={["name", "value"]}
              height={280}
              chartElement={
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analyticsData.callsByType}>
                    <CartesianGrid strokeDasharray="3 3" stroke={`${HEALTH_THEME.primary}20`} />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <RechartsTooltip content={<CustomChartTooltip />} />
                    <Bar dataKey="value" fill={HEALTH_THEME.primary} radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              }
            >
              {analyticsData.callsByType.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analyticsData.callsByType}>
                    <CartesianGrid strokeDasharray="3 3" stroke={`${HEALTH_THEME.primary}20`} />
                    <XAxis dataKey="name" tick={{ fontSize: 10 }} angle={-15} textAnchor="end" height={60} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <RechartsTooltip content={<CustomChartTooltip />} />
                    <Bar dataKey="value" fill={HEALTH_THEME.primary} radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%" }}>
                  <Typography color="text.secondary">No data available</Typography>
                </Box>
              )}
            </ChartCard>
          </Grid>

          <Grid item xs={12} md={6} lg={3}>
            <ChartCard
              title="Connection Rate Trend"
              chartData={analyticsData.connectionRateTrend}
              columns={["date", "rate", "total"]}
              height={280}
              chartElement={
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={analyticsData.connectionRateTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke={`${HEALTH_THEME.primary}20`} />
                    <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} domain={[0, 100]} />
                    <RechartsTooltip content={<CustomChartTooltip />} />
                    <Legend />
                    <Line type="monotone" dataKey="rate" stroke={HEALTH_THEME.accent} name="Rate %" strokeWidth={3} dot={{ r: 5 }} />
                  </LineChart>
                </ResponsiveContainer>
              }
            >
              {analyticsData.connectionRateTrend.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={analyticsData.connectionRateTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke={`${HEALTH_THEME.primary}20`} />
                    <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} domain={[0, 100]} />
                    <RechartsTooltip content={<CustomChartTooltip />} />
                    <Line type="monotone" dataKey="rate" stroke={HEALTH_THEME.accent} name="Rate %" strokeWidth={2} dot={{ r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%" }}>
                  <Typography color="text.secondary">No data available</Typography>
                </Box>
              )}
            </ChartCard>
          </Grid>

          {/* Row 3: Duration Distribution, Day of Week, Hourly Distribution */}
          <Grid item xs={12} md={4}>
            <ChartCard
              title="Call Duration Distribution"
              chartData={analyticsData.durationDistribution}
              columns={["name", "value"]}
              height={280}
              chartElement={
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={analyticsData.durationDistribution} cx="50%" cy="50%" innerRadius={80} outerRadius={140} dataKey="value" label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}>
                      {analyticsData.durationDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <RechartsTooltip content={<CustomChartTooltip />} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              }
            >
              {analyticsData.durationDistribution.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={analyticsData.durationDistribution} cx="50%" cy="50%" innerRadius={40} outerRadius={80} dataKey="value" label={({ name }) => name} labelLine={false}>
                      {analyticsData.durationDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <RechartsTooltip content={<CustomChartTooltip />} />
                    <Legend wrapperStyle={{ fontSize: 10 }} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%" }}>
                  <Typography color="text.secondary">No data available</Typography>
                </Box>
              )}
            </ChartCard>
          </Grid>

          <Grid item xs={12} md={4}>
            <ChartCard
              title="Calls by Day of Week"
              chartData={analyticsData.dayOfWeekData}
              columns={["day", "calls", "connected"]}
              height={280}
              chartElement={
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analyticsData.dayOfWeekData}>
                    <CartesianGrid strokeDasharray="3 3" stroke={`${HEALTH_THEME.primary}20`} />
                    <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <RechartsTooltip content={<CustomChartTooltip />} />
                    <Legend />
                    <Bar dataKey="calls" fill={HEALTH_THEME.primary} name="Total Calls" radius={[6, 6, 0, 0]} />
                    <Bar dataKey="connected" fill={HEALTH_THEME.success} name="Connected" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              }
            >
              {analyticsData.dayOfWeekData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analyticsData.dayOfWeekData}>
                    <CartesianGrid strokeDasharray="3 3" stroke={`${HEALTH_THEME.primary}20`} />
                    <XAxis dataKey="day" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <RechartsTooltip content={<CustomChartTooltip />} />
                    <Legend wrapperStyle={{ fontSize: 10 }} />
                    <Bar dataKey="calls" fill={HEALTH_THEME.primary} name="Total" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="connected" fill={HEALTH_THEME.success} name="Connected" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%" }}>
                  <Typography color="text.secondary">No data available</Typography>
                </Box>
              )}
            </ChartCard>
          </Grid>

          <Grid item xs={12} md={4}>
            <ChartCard
              title="Hourly Call Distribution"
              chartData={analyticsData.hourlyDistribution}
              columns={["hour", "calls", "connected"]}
              height={280}
              chartElement={
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={analyticsData.hourlyDistribution}>
                    <defs>
                      <linearGradient id="colorHourlyHealthExpand" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={HEALTH_THEME.purple} stopOpacity={0.4} />
                        <stop offset="95%" stopColor={HEALTH_THEME.purple} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke={`${HEALTH_THEME.primary}20`} />
                    <XAxis dataKey="hour" tick={{ fontSize: 10 }} interval={2} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <RechartsTooltip content={<CustomChartTooltip />} />
                    <Area type="monotone" dataKey="calls" stroke={HEALTH_THEME.purple} fill="url(#colorHourlyHealthExpand)" name="Calls" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              }
            >
              {analyticsData.hourlyDistribution.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={analyticsData.hourlyDistribution}>
                    <defs>
                      <linearGradient id="colorHourlyHealthSmall" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={HEALTH_THEME.purple} stopOpacity={0.4} />
                        <stop offset="95%" stopColor={HEALTH_THEME.purple} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke={`${HEALTH_THEME.primary}20`} />
                    <XAxis dataKey="hour" tick={{ fontSize: 9 }} interval={3} />
                    <YAxis tick={{ fontSize: 9 }} />
                    <RechartsTooltip content={<CustomChartTooltip />} />
                    <Area type="monotone" dataKey="calls" stroke={HEALTH_THEME.purple} fill="url(#colorHourlyHealthSmall)" name="Calls" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%" }}>
                  <Typography color="text.secondary">No data available</Typography>
                </Box>
              )}
            </ChartCard>
          </Grid>

          {/* Row 4: Weekly Comparison */}
          <Grid item xs={12} md={6}>
            <ChartCard
              title="Weekly Performance Comparison"
              chartData={analyticsData.weeklyComparison}
              columns={["week", "totalCalls", "connected", "rate"]}
              height={280}
              chartElement={
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analyticsData.weeklyComparison}>
                    <CartesianGrid strokeDasharray="3 3" stroke={`${HEALTH_THEME.primary}20`} />
                    <XAxis dataKey="week" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <RechartsTooltip content={<CustomChartTooltip />} />
                    <Legend />
                    <Bar dataKey="totalCalls" fill={HEALTH_THEME.primary} name="Total Calls" radius={[6, 6, 0, 0]} />
                    <Bar dataKey="connected" fill={HEALTH_THEME.success} name="Connected" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              }
            >
              {analyticsData.weeklyComparison.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analyticsData.weeklyComparison}>
                    <CartesianGrid strokeDasharray="3 3" stroke={`${HEALTH_THEME.primary}20`} />
                    <XAxis dataKey="week" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <RechartsTooltip content={<CustomChartTooltip />} />
                    <Legend wrapperStyle={{ fontSize: 10 }} />
                    <Bar dataKey="totalCalls" fill={HEALTH_THEME.primary} name="Total" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="connected" fill={HEALTH_THEME.success} name="Connected" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%" }}>
                  <Typography color="text.secondary">No data available</Typography>
                </Box>
              )}
            </ChartCard>
          </Grid>

          {/* Agent Performance Summary Card */}
          <Grid item xs={12} md={6}>
            <Card
              elevation={0}
              sx={{
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 3,
                height: "100%",
                transition: "all 0.3s ease",
                "&:hover": {
                  boxShadow: `0 12px 40px ${HEALTH_THEME.primary}15`,
                  transform: "translateY(-4px)",
                },
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight={700} color={HEALTH_THEME.primary} sx={{ mb: 3 }}>
                  Top Performers Summary
                </Typography>
                {analyticsData.topAgents.length > 0 ? (
                  <Box>
                    {analyticsData.topAgents.map((agent, index) => (
                      <Box
                        key={agent.name}
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 2,
                          mb: 2,
                          p: 1.5,
                          borderRadius: "12px",
                          bgcolor: index === 0 ? `${HEALTH_THEME.accent}15` : `${HEALTH_THEME.primary}08`,
                          border: index === 0 ? `1px solid ${HEALTH_THEME.accent}40` : "none",
                        }}
                      >
                        <Avatar
                          sx={{
                            width: 40,
                            height: 40,
                            background: index === 0 ? `linear-gradient(135deg, ${HEALTH_THEME.accent} 0%, #fbbf24 100%)` : HEALTH_THEME.gradient,
                            fontSize: "0.85rem",
                            fontWeight: 700,
                          }}
                        >
                          {index + 1}
                        </Avatar>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="subtitle1" fontWeight={600} color="text.primary">
                            {agent.fullName || agent.name}
                          </Typography>
                          <Box sx={{ display: "flex", gap: 2 }}>
                            <Typography variant="caption" color="text.secondary">
                              {agent.totalCalls} calls
                            </Typography>
                            <Typography variant="caption" color={HEALTH_THEME.success}>
                              {agent.connectedCalls} connected
                            </Typography>
                            <Typography variant="caption" color={HEALTH_THEME.accent}>
                              {agent.successRate}% rate
                            </Typography>
                          </Box>
                        </Box>
                        {index === 0 && (
                          <Chip
                            label="Top"
                            size="small"
                            sx={{
                              background: `linear-gradient(135deg, ${HEALTH_THEME.accent} 0%, #fbbf24 100%)`,
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
                    <Typography color="text.secondary">No data available</Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {activeTab === 2 && (
        <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 3, border: "1px solid", borderColor: "divider" }}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: "#f8fafc" }}>
                <TableCell sx={{ fontWeight: 600 }}>Agent</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Client Number</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Call Type</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Timestamp</TableCell>
                <TableCell sx={{ fontWeight: 600 }} align="center">Duration</TableCell>
                <TableCell sx={{ fontWeight: 600 }} align="center">Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {applyFilters(callLogs).slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((log) => (
                <TableRow key={log.id} hover>
                  <TableCell>
                    <Typography variant="body2" fontWeight={500}>{log.agentName}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{log.clientNumber || "N/A"}</Typography>
                  </TableCell>
                  <TableCell>
                    <Chip label={log.callType || "N/A"} size="small" sx={{ bgcolor: "#eff6ff", color: "#3b82f6" }} />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{formatTimestamp(log.timestamp)}</Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Typography variant="body2">
                      {log.callConnected ? calculateActualDuration(log.startTime, log.endTime) : "-"}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Chip
                      icon={log.callConnected ? <CheckCircle sx={{ fontSize: 16 }} /> : <Cancel sx={{ fontSize: 16 }} />}
                      label={log.callConnected ? "Connected" : "Not Connected"}
                      size="small"
                      sx={{
                        bgcolor: log.callConnected ? "#dcfce7" : "#fee2e2",
                        color: log.callConnected ? "#16a34a" : "#dc2626",
                      }}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25, 50]}
            component="div"
            count={applyFilters(callLogs).length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={(e, newPage) => setPage(newPage)}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(parseInt(e.target.value, 10));
              setPage(0);
            }}
          />
        </TableContainer>
      )}

      {/* Filter Dialog */}
      <Dialog open={filterDialogOpen} onClose={() => setFilterDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ bgcolor: "#11998e", color: "white" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <FilterList />
            <Typography variant="h6">Filter Options</Typography>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Date From"
                type="date"
                value={filters.dateFrom}
                onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Date To"
                type="date"
                value={filters.dateTo}
                onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Call Type</InputLabel>
                <Select
                  value={filters.callType}
                  label="Call Type"
                  onChange={(e) => setFilters({ ...filters, callType: e.target.value })}
                >
                  <MenuItem value="all">All</MenuItem>
                  <MenuItem value="Client">Client</MenuItem>
                  <MenuItem value="Branch Manager">Branch Manager</MenuItem>
                  <MenuItem value="Nurse">Nurse</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Call Status</InputLabel>
                <Select
                  value={filters.callConnected}
                  label="Call Status"
                  onChange={(e) => setFilters({ ...filters, callConnected: e.target.value })}
                >
                  <MenuItem value="all">All</MenuItem>
                  <MenuItem value="connected">Connected</MenuItem>
                  <MenuItem value="not_connected">Not Connected</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Escalation</InputLabel>
                <Select
                  value={filters.escalation}
                  label="Escalation"
                  onChange={(e) => setFilters({ ...filters, escalation: e.target.value })}
                >
                  <MenuItem value="all">All</MenuItem>
                  <MenuItem value="yes">Yes</MenuItem>
                  <MenuItem value="no">No</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button onClick={handleResetFilters} sx={{ color: "#64748b" }}>
            Reset
          </Button>
          <Button onClick={() => setFilterDialogOpen(false)} variant="outlined">
            Cancel
          </Button>
          <Button
            onClick={() => {
              setFilterDialogOpen(false);
              handleExportCSV();
            }}
            variant="contained"
            sx={{ bgcolor: "#11998e", "&:hover": { bgcolor: "#0d7d71" } }}
            startIcon={<FileDownload />}
          >
            Export Filtered
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default HealthManagerDashboard;
