import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  collection,
  onSnapshot,
  getDoc,
  getDocs,
  doc,
  Timestamp,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db, firebaseConfig } from "../firebaseConfig";
import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
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
  RadioGroup,
  FormControlLabel,
  Radio,
  FormLabel,
  Alert,
  List,
  ListItem,
  ListItemText,
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
  Security,
  CheckCircle,
  Cancel,
  AccessTime,
  ArrowUpward,
  ArrowDownward,
  Visibility,
  VisibilityOff,
  GridView,
  ViewList,
  PhoneCallback,
  PhoneForwarded,
  Timeline,
  Assessment,
  PlayArrow,
  PersonAdd,
  Upload,
  Error as ErrorIcon,
  Business,
  Logout as LogoutIcon,
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
          borderColor: "#667eea",
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
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
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
              {agent.id} {agent.department === "Team Lead" && "(TL)"}
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
                bgcolor: "#f0f9ff",
                color: "#667eea",
                "&:hover": {
                  bgcolor: "#e0e7ff",
                  transform: "scale(1.1)",
                },
              }}
            >
              <FileDownload fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>

        <Divider sx={{ my: 2 }} />

        <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
          <Box sx={{ flex: 1, textAlign: "center", p: 1, bgcolor: "#f8fafc", borderRadius: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, color: "#667eea" }}>
              {agent.totalCalls || 0}
            </Typography>
            <Typography variant="caption" sx={{ color: "text.secondary" }}>
              Total Calls
            </Typography>
          </Box>
          <Box sx={{ flex: 1, textAlign: "center", p: 1, bgcolor: "#f0fdf4", borderRadius: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, color: "#22c55e" }}>
              {agent.connectedCalls || 0}
            </Typography>
            <Typography variant="caption" sx={{ color: "text.secondary" }}>
              Connected
            </Typography>
          </Box>
          <Box sx={{ flex: 1, textAlign: "center", p: 1, bgcolor: "#fef2f2", borderRadius: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, color: "#ef4444" }}>
              {agent.disconnectedCalls || 0}
            </Typography>
            <Typography variant="caption" sx={{ color: "text.secondary" }}>
              Missed
            </Typography>
          </Box>
        </Box>

        <Box>
          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
            <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 500 }}>
              Success Rate
            </Typography>
            <Typography variant="caption" sx={{ fontWeight: 700, color: "#667eea" }}>
              {successRate}%
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={successRate}
            sx={{
              height: 8,
              borderRadius: 4,
              bgcolor: "#e2e8f0",
              "& .MuiLinearProgress-bar": {
                borderRadius: 4,
                background: successRate >= 70
                  ? "linear-gradient(90deg, #22c55e 0%, #16a34a 100%)"
                  : successRate >= 40
                  ? "linear-gradient(90deg, #eab308 0%, #ca8a04 100%)"
                  : "linear-gradient(90deg, #ef4444 0%, #dc2626 100%)",
              },
            }}
          />
        </Box>
      </CardContent>
    </Card>
  );
};

// Insurance gradient color scheme (Purple/Indigo theme for Insurance)
const INSURANCE_GRADIENTS = {
  primary: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  secondary: "linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%)",
  accent: "linear-gradient(135deg, #9f7aea 0%, #805ad5 100%)",
  success: "linear-gradient(135deg, #48bb78 0%, #38a169 100%)",
  warning: "linear-gradient(135deg, #ed8936 0%, #dd6b20 100%)",
  error: "linear-gradient(135deg, #fc8181 0%, #f56565 100%)",
};

const CHART_COLORS = ["#667eea", "#764ba2", "#9f7aea", "#48bb78", "#ed8936", "#fc8181"];

// Helper function to check if agent is active/online
const isAgentActive = (status) => {
  return status === "Available" || status === "On Call" ||
         status === "Login" || status === "Idle" || status === "Busy";
};

// Helper function to get status display config (supports both old and new status values)
const getStatusConfig = (status) => {
  const configs = {
    "Available": { label: "Available", color: "#16a34a", bgColor: "#dcfce7" },
    "On Call": { label: "On Call", color: "#2563eb", bgColor: "#dbeafe" },
    "Unavailable": { label: "Offline", color: "#64748b", bgColor: "#f1f5f9" },
    // Legacy status backwards compatibility
    "Idle": { label: "Available", color: "#16a34a", bgColor: "#dcfce7" },
    "Busy": { label: "On Call", color: "#2563eb", bgColor: "#dbeafe" },
    "Break": { label: "On Break", color: "#d97706", bgColor: "#fef3c7" },
    "Login": { label: "Available", color: "#16a34a", bgColor: "#dcfce7" },
    "Logout": { label: "Offline", color: "#64748b", bgColor: "#f1f5f9" },
    "Logged Out": { label: "Offline", color: "#64748b", bgColor: "#f1f5f9" },
  };
  return configs[status] || configs["Unavailable"];
};

function InsuranceManagerDashboard({ currentUser }) {
  const [agents, setAgents] = useState([]);
  const [callLogs, setCallLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [csvFilter, setCsvFilter] = useState("all");
  const [customDateFrom, setCustomDateFrom] = useState("");
  const [customDateTo, setCustomDateTo] = useState("");
  const [openAddUserDialog, setOpenAddUserDialog] = useState(false);
  const [newUserData, setNewUserData] = useState({
    name: "",
    email: "",
    password: "",
    id: "",
    mobile: "",
    role: "agent",
    designation: "RE",
    agentCollection: "",
  });
  const [creating, setCreating] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [dialogTabValue, setDialogTabValue] = useState(0);
  const [csvFile, setCsvFile] = useState(null);
  const [bulkCreating, setBulkCreating] = useState(false);
  const [bulkProgress, setBulkProgress] = useState(0);
  const [bulkResults, setBulkResults] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState("grid");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [openFilterDialog, setOpenFilterDialog] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [loadingRecordings, setLoadingRecordings] = useState({});
  const navigate = useNavigate();

  // Filter call logs based on search query
  const filteredCallLogs = callLogs.filter((log) => {
    if (!searchQuery.trim()) return true;

    const query = searchQuery.toLowerCase();
    const agentName = (log.agentName || "").toLowerCase();
    const clientNumber = (log.clientNumber || "").toLowerCase();
    const sid = (log.sid || "").toLowerCase();
    const callId = (log.callId || "").toLowerCase();
    const agentId = (log.agentId || "").toLowerCase();

    return (
      agentName.includes(query) ||
      clientNumber.includes(query) ||
      sid.includes(query) ||
      callId.includes(query) ||
      agentId.includes(query)
    );
  });

  // Filter agents based on search query and status
  const filteredAgents = agents.filter((agent) => {
    if (!searchQuery.trim() && statusFilter === "all") return true;

    const query = searchQuery.toLowerCase();
    const agentName = (agent.name || "").toLowerCase();
    const agentPhone = (agent.mobile || "").toLowerCase();
    const agentId = (agent.id || "").toLowerCase();
    const agentEmail = (agent.email || "").toLowerCase();

    const matchesSearch = !searchQuery.trim() || (
      agentName.includes(query) ||
      agentPhone.includes(query) ||
      agentId.includes(query) ||
      agentEmail.includes(query)
    );

    const matchesStatus = statusFilter === "all" || agent.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Calculate stats (supports both new and legacy status values)
  const stats = {
    totalAgents: agents.length,
    availableAgents: agents.filter(a => a.status === "Idle" || a.status === "Available" || a.status === "Login").length,
    onCallAgents: agents.filter(a => a.status === "Busy" || a.status === "On Call").length,
    onBreakAgents: agents.filter(a => a.status === "Break").length,
    loggedOutAgents: agents.filter(a => a.status === "Logout" || a.status === "Unavailable" || a.status === "Logged Out").length,
    totalCalls: callLogs.length,
    connectedCalls: callLogs.filter(log => log.callConnected).length,
    disconnectedCalls: callLogs.filter(log => !log.callConnected).length,
    teamLeads: agents.filter(a => a.department === "Team Lead").length,
  };

  // Prepare chart data
  const statusDistribution = [
    { name: "Available", value: stats.availableAgents, color: "#48bb78" },
    { name: "On Call", value: stats.onCallAgents, color: "#667eea" },
    { name: "On Break", value: stats.onBreakAgents, color: "#ed8936" },
    { name: "Logged Out", value: stats.loggedOutAgents, color: "#a0aec0" },
  ].filter(item => item.value > 0);

  const callStatusData = [
    { name: "Connected", value: stats.connectedCalls, color: "#48bb78" },
    { name: "Not Connected", value: stats.disconnectedCalls, color: "#fc8181" },
  ].filter(item => item.value > 0);

  // Top performers
  const topPerformers = [...agents]
    .sort((a, b) => (b.performance || 0) - (a.performance || 0))
    .slice(0, 5)
    .map(agent => ({
      name: agent.name?.split(" ")[0] || "Agent",
      calls: agent.totalCalls || 0,
      connected: agent.connectedCalls || 0,
      performance: agent.performance || 0,
    }));

  // Call type distribution
  const callTypeData = callLogs.reduce((acc, log) => {
    const type = log.callType || "Unknown";
    const existing = acc.find(item => item.name === type);
    if (existing) {
      existing.value++;
    } else {
      acc.push({ name: type, value: 1 });
    }
    return acc;
  }, []);

  // Daily call trend (last 7 days)
  const getDailyTrend = () => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toLocaleDateString('en-US', { weekday: 'short' });
      const dayStart = new Date(date.setHours(0, 0, 0, 0));
      const dayEnd = new Date(date.setHours(23, 59, 59, 999));

      const dayCalls = callLogs.filter(log => {
        if (!log.timestamp) return false;
        const logDate = log.timestamp;
        return logDate >= dayStart && logDate <= dayEnd;
      });

      days.push({
        day: dateStr,
        total: dayCalls.length,
        connected: dayCalls.filter(l => l.callConnected).length,
        missed: dayCalls.filter(l => !l.callConnected).length,
      });
    }
    return days;
  };

  const dailyTrendData = getDailyTrend();

  useEffect(() => {
    let mounted = true;
    if (!currentUser || !currentUser.uid) {
      if (mounted) setLoading(false);
      return;
    }

    const fetchManagerRole = async () => {
      try {
        const userDoc = await getDoc(doc(db, "admin", currentUser.uid));
        if (userDoc.exists() && userDoc.data().role === "manager") {
          const agentCollections = ["insuranceAgents"];
          const allUnsubscribes = [];

          // Listen to insuranceTeamLeads collection
          const insuranceTLsRef = collection(db, "insuranceTeamLeads");
          const tlUnsubscribe = onSnapshot(
            insuranceTLsRef,
            (snapshot) => {
              if (!mounted) return;
              snapshot.docs.forEach((tlDoc) => {
                const tlData = tlDoc.data();
                const tlId = tlDoc.id;

                const tlCallLogsRef = collection(db, "insuranceTeamLeads", tlId, "callLogs");
                const tlLogsUnsubscribe = onSnapshot(
                  tlCallLogsRef,
                  (logsSnapshot) => {
                    if (!mounted) return;
                    const logs = logsSnapshot.docs.map((log) => {
                      const data = log.data();
                      let startTime = null;
                      let endTime = null;
                      if (data.startTime instanceof Timestamp) {
                        startTime = data.startTime.toDate();
                      } else if (typeof data.startTime === "string") {
                        startTime = new Date(data.startTime);
                        if (isNaN(startTime)) startTime = null;
                      }
                      if (data.endTime instanceof Timestamp) {
                        endTime = data.endTime.toDate();
                      } else if (typeof data.endTime === "string") {
                        endTime = new Date(data.endTime);
                        if (isNaN(endTime)) endTime = null;
                      }
                      return {
                        id: log.id,
                        ...data,
                        timestamp: data.timestamp
                          ? data.timestamp instanceof Timestamp
                            ? data.timestamp.toDate()
                            : new Date(data.timestamp)
                          : null,
                        startTime,
                        endTime,
                        agentId: tlId,
                        agentName: tlData.name || "Unknown TL",
                        collectionName: "insuranceTeamLeads",
                      };
                    });
                    logs.sort((a, b) => (b.startTime || 0) - (a.startTime || 0));
                    const totalCalls = logs.length;
                    const connectedCalls = logs.filter((log) => log.callConnected).length;
                    const disconnectedCalls = totalCalls - connectedCalls;
                    const performance =
                      totalCalls > 0 ? Math.round((connectedCalls / totalCalls) * 100) : 0;

                    if (mounted) {
                      setAgents((prevAgents) => {
                        const existingTLIndex = prevAgents.findIndex(
                          (a) => a.id === tlId && a.collection === "insuranceTeamLeads"
                        );
                        const tlAgent = {
                          id: tlId,
                          collection: "insuranceTeamLeads",
                          name: tlData.name || "Unknown TL",
                          status: tlData.status || "Idle",
                          avatar: tlData.avatar || tlData.name?.charAt(0)?.toUpperCase() || "TL",
                          department: "Team Lead",
                          performance,
                          totalCalls,
                          connectedCalls,
                          disconnectedCalls,
                        };
                        if (existingTLIndex > -1) {
                          const updatedAgents = [...prevAgents];
                          updatedAgents[existingTLIndex] = tlAgent;
                          return updatedAgents;
                        }
                        return [...prevAgents, tlAgent];
                      });

                      setCallLogs((prevLogs) => [
                        ...prevLogs.filter(
                          (log) => log.agentId !== tlId || log.collectionName !== "insuranceTeamLeads"
                        ),
                        ...logs,
                      ]);
                    }
                  },
                  (error) => {
                    console.error(`Error fetching TL call logs for ${tlId}:`, error);
                  }
                );
                allUnsubscribes.push(tlLogsUnsubscribe);
              });
            },
            (error) => {
              console.error("Error fetching TL data:", error);
            }
          );
          allUnsubscribes.push(tlUnsubscribe);

          agentCollections.forEach((collectionName) => {
            const agentsRef = collection(db, collectionName);
            const unsubscribe = onSnapshot(
              agentsRef,
              (snapshot) => {
                if (!mounted) return;
                const agentDocs = snapshot.docs.map((agentDoc) => {
                  const agentData = agentDoc.data();
                  const agentId = agentDoc.id;
                  const callLogsRef = collection(db, collectionName, agentId, "callLogs");
                  const logsUnsubscribe = onSnapshot(
                    callLogsRef,
                    (logsSnapshot) => {
                      if (!mounted) return;
                      const logs = logsSnapshot.docs.map((log) => {
                        const data = log.data();
                        let startTime = null;
                        let endTime = null;
                        if (data.startTime instanceof Timestamp) {
                          startTime = data.startTime.toDate();
                        } else if (typeof data.startTime === "string") {
                          startTime = new Date(data.startTime);
                          if (isNaN(startTime)) startTime = null;
                        }
                        if (data.endTime instanceof Timestamp) {
                          endTime = data.endTime.toDate();
                        } else if (typeof data.endTime === "string") {
                          endTime = new Date(data.endTime);
                          if (isNaN(endTime)) endTime = null;
                        }
                        return {
                          id: log.id,
                          ...data,
                          timestamp: data.timestamp
                            ? data.timestamp instanceof Timestamp
                              ? data.timestamp.toDate()
                              : new Date(data.timestamp)
                            : null,
                          startTime,
                          endTime,
                          agentId,
                          agentName: agentData.name || "Unknown Agent",
                          collectionName,
                        };
                      });
                      logs.sort((a, b) => (b.startTime || 0) - (a.startTime || 0));
                      const totalCalls = logs.length;
                      const connectedCalls = logs.filter((log) => log.callConnected).length;
                      const disconnectedCalls = totalCalls - connectedCalls;
                      const performance =
                        totalCalls > 0 ? Math.round((connectedCalls / totalCalls) * 100) : 0;

                      if (mounted) {
                        setAgents((prevAgents) => {
                          const existingAgentIndex = prevAgents.findIndex(
                            (a) => a.id === agentId && a.collection === collectionName
                          );
                          const agent = {
                            id: agentId,
                            collection: collectionName,
                            name: agentData.name || "Unknown Agent",
                            status: agentData.status || "Idle",
                            avatar: agentData.avatar || agentId.slice(0, 2).toUpperCase(),
                            department: agentData.department || "Insurance",
                            performance,
                            totalCalls,
                            connectedCalls,
                            disconnectedCalls,
                            empId: agentData.empId || agentId,
                          };
                          if (existingAgentIndex > -1) {
                            const updatedAgents = [...prevAgents];
                            updatedAgents[existingAgentIndex] = agent;
                            return updatedAgents;
                          }
                          return [...prevAgents, agent];
                        });

                        setCallLogs((prevLogs) => [
                          ...prevLogs.filter(
                            (log) => log.agentId !== agentId || log.collectionName !== collectionName
                          ),
                          ...logs,
                        ]);
                      }
                    },
                    (error) => {
                      console.error(`Error fetching call logs for ${collectionName}/${agentId}:`, error);
                    }
                  );
                  allUnsubscribes.push(logsUnsubscribe);
                  return {
                    id: agentDoc.id,
                    collection: collectionName,
                    name: agentData.name || "Unknown Agent",
                    status: agentData.status || "Idle",
                    avatar: agentData.avatar || agentId.slice(0, 2).toUpperCase(),
                    department: agentData.department || "Insurance",
                    empId: agentData.empId || agentId,
                  };
                });

                if (mounted) {
                  setAgents((prevAgents) => [
                    ...prevAgents.filter((a) => !agentCollections.includes(a.collection)),
                    ...agentDocs,
                  ]);
                  setLoading(false);
                }
              },
              (error) => {
                console.error(`Error fetching agents for ${collectionName}:`, error);
                if (mounted) setLoading(false);
              }
            );

            allUnsubscribes.push(unsubscribe);
          });

          return () => allUnsubscribes.forEach((unsub) => unsub());
        } else {
          if (mounted) setLoading(false);
        }
      } catch (error) {
        console.error("Error in fetchManagerRole:", error);
        if (mounted) setLoading(false);
      }
    };

    fetchManagerRole();

    return () => {
      mounted = false;
    };
  }, [currentUser]);

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  const formatDuration = (duration) => {
    if (!duration || typeof duration !== "object" || (!duration.hours && !duration.minutes && !duration.seconds))
      return "N/A";
    return `${duration.hours || 0}h ${duration.minutes || 0}m ${duration.seconds || 0}s`;
  };

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
      alert("Failed to open recording. Please try again.");
    } finally {
      setLoadingRecordings((prev) => ({ ...prev, [sid]: false }));
    }
  };

  const handleDownloadCSV = () => {
    let filteredLogs = callLogs;
    const now = new Date();

    if (csvFilter === "daily") {
      const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      filteredLogs = callLogs.filter(log => log.timestamp && log.timestamp >= oneDayAgo);
    } else if (csvFilter === "weekly") {
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      filteredLogs = callLogs.filter(log => log.timestamp && log.timestamp >= oneWeekAgo);
    } else if (csvFilter === "monthly") {
      const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      filteredLogs = callLogs.filter(log => log.timestamp && log.timestamp >= oneMonthAgo);
    } else if (csvFilter === "custom" && customDateFrom && customDateTo) {
      const fromDate = new Date(customDateFrom);
      fromDate.setHours(0, 0, 0, 0);
      const toDate = new Date(customDateTo);
      toDate.setHours(23, 59, 59, 999);
      filteredLogs = callLogs.filter(log => {
        if (!log.timestamp) return false;
        return log.timestamp >= fromDate && log.timestamp <= toDate;
      });
    }

    const headers = [
      "Agent Name", "Department", "Call ID", "SID", "Client Number", "Call Type",
      "Agent Type", "Escalation", "Call Category", "Partner", "Timestamp",
      "Call Duration", "Call Connected", "Call Status", "Not Connected Reason", "Remarks"
    ];

    const rows = filteredLogs.map((log) => {
      const agent = agents.find((a) => a.id === log.agentId && a.collection === log.collectionName);
      let remarksText = log.remarks || "N/A";
      if (remarksText !== "N/A") {
        try {
          if (remarksText.includes('%')) remarksText = decodeURIComponent(remarksText);
          remarksText = remarksText
            .replace(/&amp;/g, '&')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&quot;/g, '"')
            .replace(/&#39;/g, "'");
        } catch (e) {
          console.warn('Failed to decode remarks:', e);
        }
      }

      return [
        agent?.name || "N/A",
        agent?.department || "N/A",
        log.callId || "N/A",
        log.sid || "N/A",
        log.clientNumber || "N/A",
        log.callType || "N/A",
        log.agentType || "N/A",
        log.escalation || "N/A",
        log.callCategory || "N/A",
        log.partner || "N/A",
        log.timestamp ? formatTimestamp(log.timestamp) : "N/A",
        formatDuration(log.duration),
        log.callConnected ? "Connected" : "Not Connected",
        log.callConnected ? log.callStatus || "N/A" : "N/A",
        log.callConnected ? "N/A" : log.notConnectedReason || "N/A",
        remarksText,
      ];
    });

    if (rows.length === 0) {
      agents.forEach((agent) => {
        rows.push([agent.name || "N/A", agent.department || "N/A", ...Array(14).fill("N/A")]);
      });
    }

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((field) => `"${String(field).replace(/"/g, '""')}"`).join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `insurance_department_calls_${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleDownloadAgentCSV = (event, agent) => {
    event.stopPropagation();

    const headers = [
      "Agent Name", "ID", "SID", "Call ID", "Client Number", "Call Type",
      "Agent Type", "Escalation", "Call Category", "Partner", "Timestamp",
      "Call Duration", "Call Connected", "Not Connected Reason", "Remarks"
    ];

    const agentLogs = callLogs.filter(log => log.agentId === agent.id) || [];
    const rows = agentLogs.map((log) => {
      let remarksText = log.remarks || "N/A";
      if (remarksText !== "N/A") {
        try {
          if (remarksText.includes('%')) remarksText = decodeURIComponent(remarksText);
          remarksText = remarksText
            .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
            .replace(/&quot;/g, '"').replace(/&#39;/g, "'");
        } catch (e) {
          console.warn('Failed to decode remarks:', e);
        }
      }

      return [
        agent.name || "N/A",
        agent.empId || agent.id || "N/A",
        log.sid || "N/A",
        log.callId || "N/A",
        log.clientNumber || "N/A",
        log.callType || "N/A",
        log.agentType || "N/A",
        log.escalation ? "Yes" : "No",
        log.callCategory || "N/A",
        log.partner || "N/A",
        log.timestamp ? formatTimestamp(log.timestamp) : "N/A",
        formatDuration(log.duration),
        log.callConnected ? "Yes" : "No",
        log.callConnected ? "N/A" : log.notConnectedReason || "N/A",
        remarksText,
      ];
    });

    if (rows.length === 0) {
      rows.push([agent.name || "N/A", agent.empId || "N/A", ...Array(13).fill("N/A")]);
    }

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((field) => `"${String(field).replace(/"/g, '""')}"`).join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${agent.name?.replace(/\s+/g, "_") || "agent"}_calls_${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  const handleCardClick = (agentId, collectionName) => {
    navigate(`/agent-details/${collectionName}/${agentId}`);
  };

  const handleCreateUser = async () => {
    if (!newUserData.name || !newUserData.email || !newUserData.password || !newUserData.id || !newUserData.mobile) {
      alert("Please fill in all required fields");
      return;
    }

    if (newUserData.role === "agent" && !newUserData.agentCollection) {
      alert("Please enter Agent Collection ID (e.g., agent1, agent12)");
      return;
    }

    if (newUserData.role === "agent") {
      const collectionPattern = /^agent\d+$/;
      if (!collectionPattern.test(newUserData.agentCollection)) {
        alert("Agent Collection ID must be in format: agent1, agent2, agent12, etc.");
        return;
      }
    }

    setCreating(true);

    try {
      if (newUserData.role === "agent") {
        const collectionRef = collection(db, newUserData.agentCollection);
        const snapshot = await getDocs(collectionRef);
        if (!snapshot.empty) {
          alert(`Agent Collection "${newUserData.agentCollection}" already exists! Please choose a different collection ID.`);
          setCreating(false);
          return;
        }
      }

      const secondaryApp = initializeApp(firebaseConfig, `secondary-${Date.now()}`);
      const secondaryAuth = getAuth(secondaryApp);

      const userCredential = await createUserWithEmailAndPassword(secondaryAuth, newUserData.email, newUserData.password);
      const user = userCredential.user;

      await secondaryAuth.signOut();

      const userDocData = {
        name: newUserData.name,
        email: newUserData.email,
        id: newUserData.id,
        mobile: newUserData.mobile,
        role: newUserData.role,
        designation: newUserData.designation,
        status: "Logout",
        department: newUserData.role === "agent" ? "Insurance" : "Management",
        createdAt: serverTimestamp(),
        createdBy: currentUser.uid,
      };

      if (newUserData.role === "agent") {
        await setDoc(doc(db, newUserData.agentCollection, user.uid), userDocData);
      } else {
        userDocData.teamMembers = [];
        await setDoc(doc(db, "mswasth", user.uid), userDocData);
      }

      try {
        await setDoc(doc(db, "userCollections", user.uid), {
          collection: newUserData.role === "agent" ? newUserData.agentCollection : "mswasth",
          email: newUserData.email,
          role: newUserData.role,
          createdAt: serverTimestamp(),
        });
      } catch (mappingError) {
        console.warn("Could not create collection mapping:", mappingError);
      }

      alert(`${newUserData.role === "agent" ? "Agent" : "Team Lead"} created successfully!\n\nCollection: ${newUserData.role === "agent" ? newUserData.agentCollection : "mswasth"}\nEmail: ${newUserData.email}`);

      setNewUserData({
        name: "", email: "", password: "", id: "", mobile: "",
        role: "agent", designation: "RE", agentCollection: "",
      });
      setOpenAddUserDialog(false);
    } catch (error) {
      console.error("Error creating user:", error);
      if (error.code === "auth/email-already-in-use") {
        alert("This email is already in use.");
      } else if (error.code === "auth/weak-password") {
        alert("Password should be at least 6 characters.");
      } else {
        alert("Error creating user: " + error.message);
      }
    } finally {
      setCreating(false);
    }
  };

  const handleCsvFileChange = (event) => {
    const file = event.target.files[0];
    if (file && file.type === "text/csv") {
      setCsvFile(file);
      setBulkResults([]);
    } else {
      alert("Please select a valid CSV file");
      setCsvFile(null);
    }
  };

  const parseCsvFile = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target.result;
        const lines = text.split('\n').filter(line => line.trim());
        const headers = lines[0].split(',').map(h => h.trim().toLowerCase());

        const users = [];
        for (let i = 1; i < lines.length; i++) {
          const values = lines[i].split(',').map(v => v.trim());
          if (values.length >= headers.length && values[0]) {
            const user = {};
            headers.forEach((header, index) => {
              user[header] = values[index] || "";
            });
            users.push(user);
          }
        }
        resolve(users);
      };
      reader.onerror = () => reject(new Error("Error reading file"));
      reader.readAsText(file);
    });
  };

  const handleBulkCreateUsers = async () => {
    if (!csvFile) {
      alert("Please select a CSV file first");
      return;
    }

    setBulkCreating(true);
    setBulkProgress(0);
    setBulkResults([]);

    try {
      const users = await parseCsvFile(csvFile);

      if (users.length === 0) {
        alert("No valid user data found in CSV file");
        setBulkCreating(false);
        return;
      }

      const results = [];

      for (let i = 0; i < users.length; i++) {
        const userData = users[i];
        const progress = Math.round(((i + 1) / users.length) * 100);
        setBulkProgress(progress);

        try {
          if (!userData.name || !userData.email || !userData.password || !userData.id || !userData.mobile) {
            results.push({ success: false, email: userData.email || `Row ${i + 2}`, error: "Missing required fields" });
            continue;
          }

          const role = userData.role?.toLowerCase() || "agent";
          let agentCollection = userData.agentcollection || userData.collection || "";

          if (role === "agent") {
            if (!agentCollection) {
              results.push({ success: false, email: userData.email, error: "Missing agent collection ID" });
              continue;
            }

            const collectionPattern = /^agent\d+$/;
            if (!collectionPattern.test(agentCollection)) {
              results.push({ success: false, email: userData.email, error: "Invalid agent collection format" });
              continue;
            }

            const collectionRef = collection(db, agentCollection);
            const snapshot = await getDocs(collectionRef);
            if (!snapshot.empty) {
              results.push({ success: false, email: userData.email, error: `Collection "${agentCollection}" exists` });
              continue;
            }
          }

          const secondaryApp = initializeApp(firebaseConfig, `secondary-bulk-${Date.now()}-${i}`);
          const secondaryAuth = getAuth(secondaryApp);

          const userCredential = await createUserWithEmailAndPassword(secondaryAuth, userData.email, userData.password);
          const user = userCredential.user;

          await secondaryAuth.signOut();

          const userDocData = {
            name: userData.name,
            email: userData.email,
            id: userData.id,
            mobile: userData.mobile,
            role: role,
            designation: userData.designation || "RE",
            status: "Logout",
            department: role === "agent" ? "Insurance" : "Management",
            createdAt: serverTimestamp(),
            createdBy: currentUser.uid,
          };

          if (role === "agent") {
            await setDoc(doc(db, agentCollection, user.uid), userDocData);
          } else {
            userDocData.teamMembers = [];
            await setDoc(doc(db, "mswasth", user.uid), userDocData);
          }

          try {
            await setDoc(doc(db, "userCollections", user.uid), {
              collection: role === "agent" ? agentCollection : "mswasth",
              email: userData.email,
              role: role,
              createdAt: serverTimestamp(),
            });
          } catch (mappingError) {
            console.warn("Could not create collection mapping:", mappingError);
          }

          results.push({ success: true, email: userData.email, collection: role === "agent" ? agentCollection : "mswasth" });
        } catch (error) {
          console.error(`Error creating user ${userData.email}:`, error);
          let errorMsg = error.message;
          if (error.code === "auth/email-already-in-use") errorMsg = "Email already in use";
          else if (error.code === "auth/weak-password") errorMsg = "Password too weak";
          results.push({ success: false, email: userData.email, error: errorMsg });
        }

        await new Promise(resolve => setTimeout(resolve, 100));
      }

      setBulkResults(results);
      setBulkProgress(100);

      const successCount = results.filter(r => r.success).length;
      const failCount = results.filter(r => !r.success).length;
      alert(`Bulk user creation completed!\n\nSuccessful: ${successCount}\nFailed: ${failCount}`);
    } catch (error) {
      console.error("Error in bulk user creation:", error);
      alert("Error processing CSV file: " + error.message);
    } finally {
      setBulkCreating(false);
    }
  };

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        }}
      >
        <Box sx={{ textAlign: "center" }}>
          <CircularProgress size={60} sx={{ color: "white", mb: 2 }} />
          <Typography variant="h6" sx={{ color: "white" }}>
            Loading Insurance Department...
          </Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f8fafc" }}>
      {/* Header */}
      <Paper
        elevation={0}
        sx={{
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          color: "white",
          p: 3,
          borderRadius: 0,
        }}
      >
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 2 }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
              Insurance Department
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              Monitor your insurance team's real-time status and performance
            </Typography>
          </Box>
          <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
            <TextField
              placeholder="Search agents, calls, SID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              size="small"
              sx={{
                minWidth: 250,
                "& .MuiOutlinedInput-root": {
                  bgcolor: "rgba(255,255,255,0.15)",
                  color: "white",
                  borderRadius: 2,
                  "& fieldset": { borderColor: "rgba(255,255,255,0.3)" },
                  "&:hover fieldset": { borderColor: "rgba(255,255,255,0.5)" },
                  "&.Mui-focused fieldset": { borderColor: "white" },
                },
                "& .MuiInputBase-input::placeholder": { color: "rgba(255,255,255,0.7)" },
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: "rgba(255,255,255,0.7)" }} />
                  </InputAdornment>
                ),
              }}
            />
            <Tooltip title="Refresh Data">
              <IconButton
                onClick={handleRefresh}
                sx={{
                  bgcolor: "rgba(255,255,255,0.15)",
                  color: "white",
                  "&:hover": { bgcolor: "rgba(255,255,255,0.25)" },
                }}
              >
                <Refresh className={refreshing ? "spin" : ""} />
              </IconButton>
            </Tooltip>
            <Button
              variant="contained"
              startIcon={<PersonAdd />}
              onClick={() => setOpenAddUserDialog(true)}
              sx={{
                bgcolor: "rgba(255,255,255,0.2)",
                color: "white",
                borderRadius: 2,
                textTransform: "none",
                "&:hover": { bgcolor: "rgba(255,255,255,0.3)" },
              }}
            >
              Add User
            </Button>
          </Box>
        </Box>
      </Paper>

      {/* Stats Cards */}
      <Box sx={{ p: 3 }}>
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <AnimatedStatCard
              title="Total Team Members"
              value={stats.totalAgents}
              icon={<Group sx={{ fontSize: 28 }} />}
              gradient={INSURANCE_GRADIENTS.primary}
              subtitle={`${stats.teamLeads} Team Leads`}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <AnimatedStatCard
              title="Available"
              value={stats.availableAgents}
              icon={<CheckCircle sx={{ fontSize: 28 }} />}
              gradient={INSURANCE_GRADIENTS.success}
              subtitle="Ready to take calls"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <AnimatedStatCard
              title="Total Calls"
              value={stats.totalCalls}
              icon={<Phone sx={{ fontSize: 28 }} />}
              gradient={INSURANCE_GRADIENTS.secondary}
              subtitle={`${stats.connectedCalls} connected`}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <AnimatedStatCard
              title="Success Rate"
              value={stats.totalCalls > 0 ? Math.round((stats.connectedCalls / stats.totalCalls) * 100) : 0}
              icon={<TrendingUp sx={{ fontSize: 28 }} />}
              gradient={INSURANCE_GRADIENTS.accent}
              subtitle="Connection rate"
            />
          </Grid>
        </Grid>

        {/* Tabs */}
        <Paper elevation={0} sx={{ borderRadius: 3, overflow: "hidden", mb: 3 }}>
          <Box sx={{ borderBottom: 1, borderColor: "divider", px: 2, bgcolor: "#f8fafc" }}>
            <Tabs
              value={tabValue}
              onChange={(e, newValue) => setTabValue(newValue)}
              sx={{
                "& .MuiTab-root": {
                  textTransform: "none",
                  fontWeight: 600,
                  fontSize: "0.95rem",
                  minHeight: 56,
                },
                "& .Mui-selected": { color: "#667eea" },
                "& .MuiTabs-indicator": { backgroundColor: "#667eea", height: 3 },
              }}
            >
              <Tab icon={<Group sx={{ mr: 1 }} />} iconPosition="start" label="Team Members" />
              <Tab icon={<Assessment sx={{ mr: 1 }} />} iconPosition="start" label="Analytics" />
              <Tab icon={<Timeline sx={{ mr: 1 }} />} iconPosition="start" label="Call Logs" />
            </Tabs>
          </Box>

          {/* Tab Content */}
          <Box sx={{ p: 3 }}>
            {/* Team Members Tab */}
            {tabValue === 0 && (
              <Box>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Team Members ({filteredAgents.length})
                  </Typography>
                  <Box sx={{ display: "flex", gap: 1 }}>
                    <Tooltip title="Filter">
                      <IconButton
                        onClick={() => setOpenFilterDialog(true)}
                        sx={{
                          bgcolor: statusFilter !== "all" ? "#e0e7ff" : "#f1f5f9",
                          color: statusFilter !== "all" ? "#667eea" : "#64748b",
                        }}
                      >
                        <FilterList />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title={viewMode === "grid" ? "List View" : "Grid View"}>
                      <IconButton
                        onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}
                        sx={{ bgcolor: "#f1f5f9" }}
                      >
                        {viewMode === "grid" ? <ViewList /> : <GridView />}
                      </IconButton>
                    </Tooltip>
                    <Button
                      variant="outlined"
                      startIcon={<FileDownload />}
                      onClick={handleDownloadCSV}
                      sx={{
                        borderColor: "#667eea",
                        color: "#667eea",
                        textTransform: "none",
                        borderRadius: 2,
                        "&:hover": { bgcolor: "#f0f9ff", borderColor: "#5a67d8" },
                      }}
                    >
                      Export All
                    </Button>
                  </Box>
                </Box>

                {viewMode === "grid" ? (
                  <Grid container spacing={3}>
                    {filteredAgents
                      .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                      .map((agent) => (
                        <Grid item xs={12} sm={6} md={4} lg={3} key={`${agent.collection}-${agent.id}`}>
                          <AgentCard
                            agent={agent}
                            onDownload={handleDownloadAgentCSV}
                            onClick={() => handleCardClick(agent.id, agent.collection)}
                          />
                        </Grid>
                      ))}
                  </Grid>
                ) : (
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow sx={{ bgcolor: "#f8fafc" }}>
                          <TableCell sx={{ fontWeight: 600 }}>Agent</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                          <TableCell sx={{ fontWeight: 600 }} align="center">Total Calls</TableCell>
                          <TableCell sx={{ fontWeight: 600 }} align="center">Connected</TableCell>
                          <TableCell sx={{ fontWeight: 600 }} align="center">Performance</TableCell>
                          <TableCell sx={{ fontWeight: 600 }} align="center">Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {filteredAgents
                          .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                          .map((agent) => (
                            <TableRow
                              key={`${agent.collection}-${agent.id}`}
                              hover
                              sx={{ cursor: "pointer" }}
                              onClick={() => handleCardClick(agent.id, agent.collection)}
                            >
                              <TableCell>
                                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                                  <Avatar
                                    sx={{
                                      width: 40,
                                      height: 40,
                                      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                                    }}
                                  >
                                    {agent.avatar}
                                  </Avatar>
                                  <Box>
                                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                      {agent.name}
                                    </Typography>
                                    <Typography variant="caption" sx={{ color: "text.secondary" }}>
                                      {agent.id}
                                    </Typography>
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
                                    fontWeight: 600,
                                  }}
                                />
                              </TableCell>
                              <TableCell align="center">{agent.totalCalls || 0}</TableCell>
                              <TableCell align="center">{agent.connectedCalls || 0}</TableCell>
                              <TableCell align="center">
                                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 1 }}>
                                  <LinearProgress
                                    variant="determinate"
                                    value={agent.performance || 0}
                                    sx={{
                                      width: 60,
                                      height: 6,
                                      borderRadius: 3,
                                      bgcolor: "#e2e8f0",
                                      "& .MuiLinearProgress-bar": {
                                        borderRadius: 3,
                                        bgcolor: agent.performance >= 70 ? "#22c55e" :
                                                 agent.performance >= 40 ? "#eab308" : "#ef4444",
                                      },
                                    }}
                                  />
                                  <Typography variant="caption" sx={{ fontWeight: 600 }}>
                                    {agent.performance || 0}%
                                  </Typography>
                                </Box>
                              </TableCell>
                              <TableCell align="center">
                                <IconButton
                                  size="small"
                                  onClick={(e) => handleDownloadAgentCSV(e, agent)}
                                  sx={{ color: "#667eea" }}
                                >
                                  <FileDownload fontSize="small" />
                                </IconButton>
                              </TableCell>
                            </TableRow>
                          ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}

                <TablePagination
                  component="div"
                  count={filteredAgents.length}
                  page={page}
                  onPageChange={(e, newPage) => setPage(newPage)}
                  rowsPerPage={rowsPerPage}
                  onRowsPerPageChange={(e) => {
                    setRowsPerPage(parseInt(e.target.value, 10));
                    setPage(0);
                  }}
                  rowsPerPageOptions={[8, 12, 24, 48]}
                />
              </Box>
            )}

            {/* Analytics Tab */}
            {tabValue === 1 && (
              <Box>
                <Grid container spacing={3}>
                  {/* Daily Call Trend */}
                  <Grid item xs={12} lg={8}>
                    <Card elevation={0} sx={{ p: 3, borderRadius: 3, border: "1px solid", borderColor: "divider" }}>
                      <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                        Weekly Call Trend
                      </Typography>
                      <ResponsiveContainer width="100%" height={300}>
                        <AreaChart data={dailyTrendData}>
                          <defs>
                            <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#667eea" stopOpacity={0.3} />
                              <stop offset="95%" stopColor="#667eea" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="colorConnected" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#48bb78" stopOpacity={0.3} />
                              <stop offset="95%" stopColor="#48bb78" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                          <XAxis dataKey="day" stroke="#64748b" />
                          <YAxis stroke="#64748b" />
                          <RechartsTooltip />
                          <Legend />
                          <Area
                            type="monotone"
                            dataKey="total"
                            stroke="#667eea"
                            fill="url(#colorTotal)"
                            strokeWidth={2}
                            name="Total Calls"
                          />
                          <Area
                            type="monotone"
                            dataKey="connected"
                            stroke="#48bb78"
                            fill="url(#colorConnected)"
                            strokeWidth={2}
                            name="Connected"
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </Card>
                  </Grid>

                  {/* Agent Status Distribution */}
                  <Grid item xs={12} lg={4}>
                    <Card elevation={0} sx={{ p: 3, borderRadius: 3, border: "1px solid", borderColor: "divider", height: "100%" }}>
                      <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                        Team Status
                      </Typography>
                      <ResponsiveContainer width="100%" height={250}>
                        <PieChart>
                          <Pie
                            data={statusDistribution}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={90}
                            paddingAngle={5}
                            dataKey="value"
                          >
                            {statusDistribution.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <RechartsTooltip />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </Card>
                  </Grid>

                  {/* Top Performers */}
                  <Grid item xs={12} md={6}>
                    <Card elevation={0} sx={{ p: 3, borderRadius: 3, border: "1px solid", borderColor: "divider" }}>
                      <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                        Top Performers
                      </Typography>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={topPerformers} layout="vertical">
                          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                          <XAxis type="number" stroke="#64748b" />
                          <YAxis dataKey="name" type="category" stroke="#64748b" width={80} />
                          <RechartsTooltip />
                          <Bar dataKey="connected" fill="#667eea" name="Connected Calls" radius={[0, 4, 4, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </Card>
                  </Grid>

                  {/* Call Type Distribution */}
                  <Grid item xs={12} md={6}>
                    <Card elevation={0} sx={{ p: 3, borderRadius: 3, border: "1px solid", borderColor: "divider" }}>
                      <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                        Call Types
                      </Typography>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={callTypeData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                          <XAxis dataKey="name" stroke="#64748b" />
                          <YAxis stroke="#64748b" />
                          <RechartsTooltip />
                          <Bar dataKey="value" fill="#764ba2" name="Calls" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </Card>
                  </Grid>
                </Grid>
              </Box>
            )}

            {/* Call Logs Tab */}
            {tabValue === 2 && (
              <Box>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Recent Call Logs ({filteredCallLogs.length})
                  </Typography>
                  <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", alignItems: "center" }}>
                    <FormControl size="small" sx={{ minWidth: 150 }}>
                      <InputLabel>Export Filter</InputLabel>
                      <Select
                        value={csvFilter}
                        onChange={(e) => setCsvFilter(e.target.value)}
                        label="Export Filter"
                      >
                        <MenuItem value="all">All Time</MenuItem>
                        <MenuItem value="daily">Last 24h</MenuItem>
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
                          sx={{ minWidth: 150 }}
                        />
                        <TextField
                          type="date"
                          size="small"
                          label="To Date"
                          value={customDateTo}
                          onChange={(e) => setCustomDateTo(e.target.value)}
                          InputLabelProps={{ shrink: true }}
                          sx={{ minWidth: 150 }}
                        />
                      </>
                    )}
                    <Button
                      variant="contained"
                      startIcon={<FileDownload />}
                      onClick={handleDownloadCSV}
                      sx={{
                        bgcolor: "#667eea",
                        textTransform: "none",
                        borderRadius: 2,
                        "&:hover": { bgcolor: "#5a67d8" },
                      }}
                    >
                      Export CSV
                    </Button>
                  </Box>
                </Box>

                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow sx={{ bgcolor: "#667eea" }}>
                        <TableCell sx={{ color: "white", fontWeight: 600 }}>Date/Time</TableCell>
                        <TableCell sx={{ color: "white", fontWeight: 600 }}>Agent</TableCell>
                        <TableCell sx={{ color: "white", fontWeight: 600 }}>Client</TableCell>
                        <TableCell sx={{ color: "white", fontWeight: 600 }}>Type</TableCell>
                        <TableCell sx={{ color: "white", fontWeight: 600 }}>Partner</TableCell>
                        <TableCell sx={{ color: "white", fontWeight: 600 }}>Status</TableCell>
                        <TableCell sx={{ color: "white", fontWeight: 600 }}>Duration</TableCell>
                        <TableCell sx={{ color: "white", fontWeight: 600 }} align="center">Recording</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filteredCallLogs
                        .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                        .map((log, index) => (
                          <TableRow key={`${log.id}-${index}`} hover>
                            <TableCell>
                              <Typography variant="body2">
                                {formatTimestamp(log.timestamp)}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                {log.agentName || "N/A"}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" sx={{ fontFamily: "monospace" }}>
                                {log.clientNumber || "N/A"}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2">{log.callType || "N/A"}</Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2">{log.partner || "N/A"}</Typography>
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={log.callConnected ? "Connected" : "Not Connected"}
                                size="small"
                                sx={{
                                  bgcolor: log.callConnected ? "#dcfce7" : "#fee2e2",
                                  color: log.callConnected ? "#16a34a" : "#dc2626",
                                  fontWeight: 600,
                                  fontSize: "0.7rem",
                                }}
                              />
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2">
                                {formatDuration(log.duration)}
                              </Typography>
                            </TableCell>
                            <TableCell align="center">
                              {log.sid ? (
                                <IconButton
                                  size="small"
                                  onClick={() => fetchRecording(log.sid)}
                                  disabled={loadingRecordings[log.sid]}
                                  sx={{
                                    bgcolor: "#667eea",
                                    color: "white",
                                    "&:hover": { bgcolor: "#5a67d8" },
                                  }}
                                >
                                  {loadingRecordings[log.sid] ? (
                                    <CircularProgress size={16} color="inherit" />
                                  ) : (
                                    <PlayArrow fontSize="small" />
                                  )}
                                </IconButton>
                              ) : (
                                <Typography variant="caption" sx={{ color: "text.secondary" }}>
                                  N/A
                                </Typography>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </TableContainer>

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
                  rowsPerPageOptions={[10, 25, 50, 100]}
                />
              </Box>
            )}
          </Box>
        </Paper>
      </Box>

      {/* Filter Dialog */}
      <Dialog
        open={openFilterDialog}
        onClose={() => setOpenFilterDialog(false)}
        PaperProps={{ sx: { borderRadius: 3, minWidth: 300 } }}
      >
        <DialogTitle sx={{ fontWeight: 600 }}>Filter Agents</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 1 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              label="Status"
            >
              <MenuItem value="all">All Statuses</MenuItem>
              <MenuItem value="Idle">Available</MenuItem>
              <MenuItem value="Busy">On Call</MenuItem>
              <MenuItem value="Break">On Break</MenuItem>
              <MenuItem value="Logout">Logged Out</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => { setStatusFilter("all"); setOpenFilterDialog(false); }}>
            Clear
          </Button>
          <Button
            variant="contained"
            onClick={() => setOpenFilterDialog(false)}
            sx={{ bgcolor: "#667eea", "&:hover": { bgcolor: "#5a67d8" } }}
          >
            Apply
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add User Dialog */}
      <Dialog
        open={openAddUserDialog}
        onClose={() => !creating && !bulkCreating && setOpenAddUserDialog(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ fontWeight: 600, borderBottom: 1, borderColor: "divider", pb: 0 }}>
          Add New User
          <Tabs
            value={dialogTabValue}
            onChange={(e, newValue) => setDialogTabValue(newValue)}
            sx={{ mt: 2 }}
          >
            <Tab label="Single User" sx={{ textTransform: "none" }} />
            <Tab label="Bulk Upload (CSV)" sx={{ textTransform: "none" }} />
          </Tabs>
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          {dialogTabValue === 0 ? (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5, pt: 1 }}>
              <TextField
                label="Full Name"
                value={newUserData.name}
                onChange={(e) => setNewUserData({ ...newUserData, name: e.target.value })}
                fullWidth
                required
                disabled={creating}
              />
              <TextField
                label="Email"
                type="email"
                value={newUserData.email}
                onChange={(e) => setNewUserData({ ...newUserData, email: e.target.value })}
                fullWidth
                required
                disabled={creating}
              />
              <TextField
                label="Password"
                type={showPassword ? "text" : "password"}
                value={newUserData.password}
                onChange={(e) => setNewUserData({ ...newUserData, password: e.target.value })}
                fullWidth
                required
                disabled={creating}
                helperText="Minimum 6 characters"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              <TextField
                label="User ID (e.g., MS01234)"
                value={newUserData.id}
                onChange={(e) => setNewUserData({ ...newUserData, id: e.target.value })}
                fullWidth
                required
                disabled={creating}
              />
              <TextField
                label="Mobile Number"
                value={newUserData.mobile}
                onChange={(e) => setNewUserData({ ...newUserData, mobile: e.target.value })}
                fullWidth
                required
                disabled={creating}
              />
              <TextField
                label="Agent Collection ID"
                value={newUserData.agentCollection}
                onChange={(e) => setNewUserData({ ...newUserData, agentCollection: e.target.value.toLowerCase() })}
                fullWidth
                required={newUserData.role === "agent"}
                disabled={creating || newUserData.role !== "agent"}
                placeholder="e.g., agent1, agent12"
                helperText={newUserData.role === "agent" ? "Format: agent1, agent2, etc." : "Only for Agents"}
              />
              <TextField
                label="Designation"
                value={newUserData.designation}
                onChange={(e) => setNewUserData({ ...newUserData, designation: e.target.value })}
                fullWidth
                disabled={creating}
                placeholder="e.g., RE, SE, TL"
              />
              <FormControl component="fieldset" disabled={creating}>
                <FormLabel>Role</FormLabel>
                <RadioGroup
                  value={newUserData.role}
                  onChange={(e) => setNewUserData({ ...newUserData, role: e.target.value })}
                  row
                >
                  <FormControlLabel value="agent" control={<Radio />} label="Agent" />
                  <FormControlLabel value="teamlead" control={<Radio />} label="Team Lead" />
                </RadioGroup>
              </FormControl>
            </Box>
          ) : (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 3, pt: 1 }}>
              <Alert severity="info">
                <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                  CSV Format Requirements:
                </Typography>
                <Typography variant="caption" component="div">
                  Required columns: name, email, password, id, mobile, agentCollection (for agents), role, designation
                </Typography>
              </Alert>

              <Button
                variant="contained"
                component="label"
                startIcon={<Upload />}
                disabled={bulkCreating}
                sx={{ bgcolor: "#667eea", "&:hover": { bgcolor: "#5a67d8" } }}
              >
                {csvFile ? `Selected: ${csvFile.name}` : "Select CSV File"}
                <input
                  type="file"
                  accept=".csv"
                  hidden
                  onChange={handleCsvFileChange}
                  disabled={bulkCreating}
                />
              </Button>

              {bulkCreating && (
                <Box>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    Creating users: {bulkProgress}%
                  </Typography>
                  <LinearProgress variant="determinate" value={bulkProgress} />
                </Box>
              )}

              {bulkResults.length > 0 && (
                <Box sx={{ maxHeight: 300, overflowY: "auto", border: 1, borderColor: "divider", borderRadius: 2, p: 1 }}>
                  <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                    Results:
                  </Typography>
                  <List dense>
                    {bulkResults.map((result, index) => (
                      <ListItem key={index} sx={{ borderBottom: 1, borderColor: "divider" }}>
                        <ListItemText
                          primary={
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                              {result.success ? (
                                <CheckCircle sx={{ fontSize: 16, color: "#22c55e" }} />
                              ) : (
                                <ErrorIcon sx={{ fontSize: 16, color: "#ef4444" }} />
                              )}
                              <Typography
                                variant="body2"
                                sx={{ color: result.success ? "#22c55e" : "#ef4444", fontWeight: 500 }}
                              >
                                {result.email}
                              </Typography>
                            </Box>
                          }
                          secondary={result.success ? `Created in ${result.collection}` : `Error: ${result.error}`}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: 1, borderColor: "divider" }}>
          <Button
            onClick={() => {
              setOpenAddUserDialog(false);
              setDialogTabValue(0);
              setCsvFile(null);
              setBulkResults([]);
            }}
            disabled={creating || bulkCreating}
          >
            Cancel
          </Button>
          {dialogTabValue === 0 ? (
            <Button
              variant="contained"
              onClick={handleCreateUser}
              disabled={creating}
              sx={{ bgcolor: "#667eea", "&:hover": { bgcolor: "#5a67d8" } }}
            >
              {creating ? "Creating..." : "Create User"}
            </Button>
          ) : (
            <Button
              variant="contained"
              onClick={handleBulkCreateUsers}
              disabled={bulkCreating || !csvFile}
              sx={{ bgcolor: "#667eea", "&:hover": { bgcolor: "#5a67d8" } }}
            >
              {bulkCreating ? "Creating Users..." : "Create All Users"}
            </Button>
          )}
        </DialogActions>
      </Dialog>

      <style>
        {`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          .spin {
            animation: spin 1s linear infinite;
          }
        `}
      </style>
    </Box>
  );
}

export default InsuranceManagerDashboard;
