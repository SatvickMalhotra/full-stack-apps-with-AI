import React, { useState, useEffect, useRef } from "react";
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  Paper,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  RadioGroup,
  FormControlLabel,
  Radio,
  FormLabel,
  InputAdornment,
  IconButton,
  Tabs,
  Tab,
  Alert,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  Avatar,
  TablePagination,
  Badge,
  Tooltip,
} from "@mui/material";
import {
  Person,
  Circle,
  TrendingUp,
  AccessTime,
  Business,
  Logout as LogoutIcon,
  FileDownload,
  PersonAdd,
  Visibility,
  VisibilityOff,
  Upload,
  CheckCircle,
  Error as ErrorIcon,
  Search as SearchIcon,
  PlayArrow,
  Analytics,
  Dashboard as DashboardIcon,
  Group,
  Phone,
  PhoneInTalk,
  Speed,
  ViewModule,
  ViewList,
  Cancel,
} from "@mui/icons-material";
import {
  collection,
  onSnapshot,
  getDoc,
  doc,
  Timestamp,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db, firebaseConfig } from "../firebaseConfig";
import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { useNavigate, useLocation } from "react-router-dom";
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
  Legend,
} from "recharts";
import CallAnalytics from "./CallAnalytics";

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
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
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
        <Typography variant="h3" sx={{ fontWeight: 800, color: "#fff", fontSize: "2.5rem", lineHeight: 1, mb: 1 }}>
          {animatedValue}
        </Typography>
        <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.9)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "1px", fontSize: "0.75rem" }}>
          {label}
        </Typography>
      </Box>
    </Paper>
  );
};

// Modern Agent Card Component
const AgentCard = ({ agent, onCardClick, isGridView }) => {
  const connectionRate = agent.performance || 0;

  const getStatusConfig = (status) => {
    const configs = {
      Idle: { color: "#10b981", bgColor: "rgba(16, 185, 129, 0.1)", label: "Available", icon: <CheckCircle sx={{ fontSize: 14 }} /> },
      Busy: { color: "#3b82f6", bgColor: "rgba(59, 130, 246, 0.1)", label: "On Call", icon: <PhoneInTalk sx={{ fontSize: 14 }} /> },
      "On Call": { color: "#3b82f6", bgColor: "rgba(59, 130, 246, 0.1)", label: "On Call", icon: <PhoneInTalk sx={{ fontSize: 14 }} /> },
      Break: { color: "#f59e0b", bgColor: "rgba(245, 158, 11, 0.1)", label: "On Break", icon: <AccessTime sx={{ fontSize: 14 }} /> },
      Logout: { color: "#6b7280", bgColor: "rgba(107, 114, 128, 0.1)", label: "Logged Out", icon: <LogoutIcon sx={{ fontSize: 14 }} /> },
    };
    return configs[status] || configs.Logout;
  };

  const statusConfig = getStatusConfig(agent.status);

  if (!isGridView) {
    return (
      <Paper
        elevation={0}
        onClick={() => onCardClick(agent.id, agent.collection)}
        sx={{
          background: "#fff",
          borderRadius: "12px",
          padding: "16px 24px",
          display: "flex",
          alignItems: "center",
          gap: 3,
          cursor: "pointer",
          border: "1px solid rgba(99, 102, 241, 0.1)",
          transition: "all 0.3s ease",
          "&:hover": {
            transform: "translateX(4px)",
            boxShadow: "0 4px 20px rgba(99, 102, 241, 0.1)",
            borderColor: "#6366f1",
          },
        }}
      >
        <Badge
          overlap="circular"
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
          badgeContent={<Box sx={{ width: 12, height: 12, borderRadius: "50%", bgcolor: statusConfig.color, border: "2px solid #fff" }} />}
        >
          <Avatar sx={{ width: 48, height: 48, background: "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)", fontWeight: 700, fontSize: "1.1rem" }}>
            {agent.avatar}
          </Avatar>
        </Badge>

        <Box sx={{ flex: 1 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "#1e293b" }}>{agent.name}</Typography>
          <Typography variant="caption" sx={{ color: "#64748b" }}>{agent.department || "Department Agent"}</Typography>
        </Box>

        <Box sx={{ textAlign: "center", minWidth: 80 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, color: "#6366f1" }}>{agent.totalCalls || 0}</Typography>
          <Typography variant="caption" sx={{ color: "#64748b" }}>Total Calls</Typography>
        </Box>

        <Box sx={{ textAlign: "center", minWidth: 80 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, color: "#10b981" }}>{connectionRate}%</Typography>
          <Typography variant="caption" sx={{ color: "#64748b" }}>Connect Rate</Typography>
        </Box>

        <Chip
          icon={statusConfig.icon}
          label={statusConfig.label}
          size="small"
          sx={{ bgcolor: statusConfig.bgColor, color: statusConfig.color, fontWeight: 600, fontSize: "0.75rem", "& .MuiChip-icon": { color: statusConfig.color } }}
        />
      </Paper>
    );
  }

  return (
    <Card
      elevation={0}
      onClick={() => onCardClick(agent.id, agent.collection)}
      sx={{
        background: "#fff",
        borderRadius: "20px",
        border: "1px solid rgba(99, 102, 241, 0.1)",
        cursor: "pointer",
        position: "relative",
        overflow: "hidden",
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        "&:hover": {
          transform: "translateY(-8px)",
          boxShadow: "0 20px 40px rgba(99, 102, 241, 0.15)",
          borderColor: "#6366f1",
        },
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "4px",
          background: "linear-gradient(90deg, #6366f1 0%, #818cf8 50%, #a5b4fc 100%)",
        },
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", mb: 2 }}>
          <Badge
            overlap="circular"
            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            badgeContent={<Box sx={{ width: 14, height: 14, borderRadius: "50%", bgcolor: statusConfig.color, border: "2px solid #fff", boxShadow: `0 0 0 2px ${statusConfig.bgColor}` }} />}
          >
            <Avatar sx={{ width: 56, height: 56, background: "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)", fontWeight: 700, fontSize: "1.3rem", boxShadow: "0 4px 14px rgba(99, 102, 241, 0.3)" }}>
              {agent.avatar}
            </Avatar>
          </Badge>
          <Chip
            icon={statusConfig.icon}
            label={statusConfig.label}
            size="small"
            sx={{ bgcolor: statusConfig.bgColor, color: statusConfig.color, fontWeight: 600, fontSize: "0.7rem", height: 28, "& .MuiChip-icon": { color: statusConfig.color } }}
          />
        </Box>

        <Typography variant="h6" sx={{ fontWeight: 700, color: "#1e293b", mb: 0.5 }}>{agent.name}</Typography>
        <Typography variant="caption" sx={{ color: "#64748b", display: "block", mb: 2 }}>{agent.department || "Department Agent"}</Typography>

        <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 1, mb: 2 }}>
          <Box sx={{ bgcolor: "rgba(99, 102, 241, 0.05)", borderRadius: "10px", p: 1, textAlign: "center" }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "#6366f1" }}>{agent.totalCalls || 0}</Typography>
            <Typography variant="caption" sx={{ color: "#64748b", fontSize: "0.6rem" }}>Total</Typography>
          </Box>
          <Box sx={{ bgcolor: "rgba(16, 185, 129, 0.05)", borderRadius: "10px", p: 1, textAlign: "center" }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "#10b981" }}>{agent.connectedCalls || 0}</Typography>
            <Typography variant="caption" sx={{ color: "#64748b", fontSize: "0.6rem" }}>Connected</Typography>
          </Box>
          <Box sx={{ bgcolor: "rgba(239, 68, 68, 0.05)", borderRadius: "10px", p: 1, textAlign: "center" }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "#ef4444" }}>{agent.disconnectedCalls || 0}</Typography>
            <Typography variant="caption" sx={{ color: "#64748b", fontSize: "0.6rem" }}>Missed</Typography>
          </Box>
        </Box>

        <Box sx={{ mb: 1 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
            <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 600 }}>Performance</Typography>
            <Typography variant="caption" sx={{ color: "#6366f1", fontWeight: 700 }}>{connectionRate}%</Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={connectionRate}
            sx={{
              height: 6,
              borderRadius: 3,
              bgcolor: "rgba(99, 102, 241, 0.1)",
              "& .MuiLinearProgress-bar": {
                borderRadius: 3,
                background: connectionRate >= 70 ? "linear-gradient(90deg, #10b981 0%, #34d399 100%)" : connectionRate >= 40 ? "linear-gradient(90deg, #f59e0b 0%, #fbbf24 100%)" : "linear-gradient(90deg, #ef4444 0%, #f87171 100%)",
              },
            }}
          />
        </Box>
      </CardContent>
    </Card>
  );
};

function DepartmentManagerDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const { managerId, managerCollection } = location.state || {};

  const [managerData, setManagerData] = useState(null);
  const [agents, setAgents] = useState([]);
  const [callLogs, setCallLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [csvFilter, setCsvFilter] = useState("all");
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
  const [csvFile, setCsvFile] = useState(null);
  const [bulkCreating, setBulkCreating] = useState(false);
  const [bulkProgress, setBulkProgress] = useState(0);
  const [bulkResults, setBulkResults] = useState([]);
  const [last24HoursCalls, setLast24HoursCalls] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [loadingRecordings, setLoadingRecordings] = useState({});
  const [mainTabValue, setMainTabValue] = useState(0);
  const [isGridView, setIsGridView] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Theme colors for Department Manager (Indigo/Purple theme)
  const THEME_COLORS = {
    primary: "#6366f1",
    primaryLight: "#818cf8",
    primaryDark: "#4f46e5",
    secondary: "#a5b4fc",
    success: "#10b981",
    warning: "#f59e0b",
    info: "#3b82f6",
    error: "#ef4444",
    gradient: "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)",
    gradientLight: "linear-gradient(135deg, #818cf8 0%, #6366f1 100%)",
    cardBg: "#ffffff",
    background: "linear-gradient(135deg, #eef2ff 0%, #e0e7ff 50%, #c7d2fe 100%)",
    textPrimary: "#1e293b",
    textSecondary: "#64748b",
  };

  // Filter call logs based on search query
  const filteredCallLogs = callLogs.filter((log) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      (log.agentName || "").toLowerCase().includes(query) ||
      (log.clientNumber || "").toLowerCase().includes(query) ||
      (log.sid || "").toLowerCase().includes(query) ||
      (log.callId || "").toLowerCase().includes(query) ||
      (log.agentId || "").toLowerCase().includes(query)
    );
  });

  // Filter agents based on search query
  const filteredAgents = agents.filter((agent) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    const agentMatches = (
      (agent.name || "").toLowerCase().includes(query) ||
      (agent.mobile || "").toLowerCase().includes(query) ||
      (agent.id || "").toLowerCase().includes(query) ||
      (agent.email || "").toLowerCase().includes(query)
    );

    const agentCallLogs = callLogs.filter((log) => log.agentId === agent.id && log.collectionName === agent.collection);
    const callLogMatches = agentCallLogs.some((log) =>
      (log.clientNumber || "").toLowerCase().includes(query) ||
      (log.sid || "").toLowerCase().includes(query) ||
      (log.callId || "").toLowerCase().includes(query)
    );

    return agentMatches || callLogMatches;
  });

  // Calculate statistics
  const stats = {
    totalAgents: filteredAgents.length,
    available: filteredAgents.filter((a) => a.status === "Idle").length,
    onCall: filteredAgents.filter((a) => a.status === "Busy" || a.status === "On Call").length,
    onBreak: filteredAgents.filter((a) => a.status === "Break").length,
    loggedOut: filteredAgents.filter((a) => a.status === "Logout").length,
    totalCalls: callLogs.length,
    connectedCalls: callLogs.filter((log) => log.callConnected).length,
    connectionRate: callLogs.length > 0 ? Math.round((callLogs.filter((log) => log.callConnected).length / callLogs.length) * 100) : 0,
  };

  // Fetch manager data
  useEffect(() => {
    const fetchManagerData = async () => {
      try {
        const managerDoc = await getDoc(doc(db, managerCollection, managerId));
        if (managerDoc.exists()) {
          setManagerData(managerDoc.data());
        }
      } catch (error) {
        console.error("Error fetching manager data:", error);
      }
    };

    if (managerId && managerCollection) {
      fetchManagerData();
    }
  }, [managerId, managerCollection]);

  // Fetch department agents and their data
  useEffect(() => {
    if (!managerId || !managerCollection) {
      setLoading(false);
      return;
    }

    let mounted = true;
    const allUnsubscribes = [];

    const fetchDepartmentData = async () => {
      try {
        const departmentMembersRef = collection(db, managerCollection, managerId, "departmentMembers");

        const membersUnsubscribe = onSnapshot(departmentMembersRef, (membersSnapshot) => {
          if (!mounted) return;

          membersSnapshot.docs.forEach((memberDoc) => {
            const memberData = memberDoc.data();
            const agentId = memberData.agentId;
            const agentCollection = memberData.collection;

            const agentUnsubscribe = onSnapshot(
              doc(db, agentCollection, agentId),
              (snapshot) => {
                if (!mounted) return;
                const data = snapshot.data();
                if (data) {
                  const updatedAgent = {
                    id: agentId,
                    collection: agentCollection,
                    ...data,
                    avatar: data.avatar || data.name?.slice(0, 2).toUpperCase() || "AG",
                  };

                  setAgents((prevAgents) => {
                    const filtered = prevAgents.filter((a) => !(a.id === agentId && a.collection === agentCollection));
                    return [...filtered, updatedAgent];
                  });
                }
              }
            );
            allUnsubscribes.push(agentUnsubscribe);

            const callLogsRef = collection(db, agentCollection, agentId, "callLogs");
            const logsUnsubscribe = onSnapshot(callLogsRef, (logsSnapshot) => {
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
                    : new Date(),
                  startTime,
                  endTime,
                  agentId,
                  agentName: memberData.agentName,
                  collectionName: agentCollection,
                  department: memberData.department,
                };
              });

              logs.sort((a, b) => (b.startTime || 0) - (a.startTime || 0));

              const totalCalls = logs.length;
              const connectedCalls = logs.filter((log) => log.callConnected).length;
              const disconnectedCalls = totalCalls - connectedCalls;
              const performance = totalCalls > 0 ? Math.round((connectedCalls / totalCalls) * 100) : 0;

              if (mounted) {
                setAgents((prevAgents) => {
                  const existingAgentIndex = prevAgents.findIndex((a) => a.id === agentId && a.collection === agentCollection);
                  if (existingAgentIndex > -1) {
                    const updatedAgents = [...prevAgents];
                    updatedAgents[existingAgentIndex] = {
                      ...updatedAgents[existingAgentIndex],
                      performance,
                      totalCalls,
                      connectedCalls,
                      disconnectedCalls,
                    };
                    return updatedAgents;
                  }
                  return prevAgents;
                });
              }

              setCallLogs((prevLogs) => {
                const filtered = prevLogs.filter((log) => !(log.agentId === agentId && log.collectionName === agentCollection));
                return [...filtered, ...logs];
              });
            });
            allUnsubscribes.push(logsUnsubscribe);
          });
        });
        allUnsubscribes.push(membersUnsubscribe);

        setLoading(false);
      } catch (error) {
        console.error("Error fetching department data:", error);
        setLoading(false);
      }
    };

    fetchDepartmentData();

    return () => {
      mounted = false;
      allUnsubscribes.forEach((unsub) => unsub());
    };
  }, [managerId, managerCollection]);

  // Calculate last 24 hours calls
  useEffect(() => {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentCalls = callLogs.filter((log) => {
      const logDate = log.timestamp instanceof Date ? log.timestamp : new Date(log.timestamp);
      return logDate >= oneDayAgo;
    });
    setLast24HoursCalls(recentCalls.length);
  }, [callLogs]);

  // Prepare chart data
  const getCallTrendData = () => {
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toLocaleDateString("en-US", { weekday: "short" });
      const dayStart = new Date(date.setHours(0, 0, 0, 0));
      const dayEnd = new Date(date.setHours(23, 59, 59, 999));

      const dayLogs = callLogs.filter((log) => {
        const logDate = log.timestamp instanceof Date ? log.timestamp : new Date(log.timestamp);
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
    return [
      { name: "Available", value: stats.available, color: "#10b981" },
      { name: "On Call", value: stats.onCall, color: "#3b82f6" },
      { name: "On Break", value: stats.onBreak, color: "#f59e0b" },
      { name: "Logged Out", value: stats.loggedOut, color: "#6b7280" },
    ].filter((item) => item.value > 0);
  };

  const handleCardClick = (agentId, collectionName) => {
    navigate(`/agent-details/${collectionName}/${agentId}`);
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
    if (!duration) return "N/A";
    if (typeof duration === "object") {
      const { hours = 0, minutes = 0, seconds = 0 } = duration;
      return `${hours}h ${minutes}m ${seconds}s`;
    }
    return duration.toString();
  };

  const handleDownloadCSV = () => {
    let filteredLogs = callLogs;
    const now = new Date();

    if (csvFilter === "daily") {
      const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      filteredLogs = callLogs.filter((log) => log.timestamp >= oneDayAgo);
    } else if (csvFilter === "weekly") {
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      filteredLogs = callLogs.filter((log) => log.timestamp >= oneWeekAgo);
    } else if (csvFilter === "monthly") {
      const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      filteredLogs = callLogs.filter((log) => log.timestamp >= oneMonthAgo);
    }

    const headers = [
      "Agent Name", "Department", "Call ID", "SID", "Client Number", "Call Type",
      "Agent Type", "Escalation", "Department Name", "Call Category", "Partner",
      "Timestamp", "Call Duration", "Call Connected", "Call Status", "Not Connected Reason", "Remarks",
    ];

    const formatTimestamp = (timestamp) => {
      if (!timestamp) return "N/A";
      const date = timestamp instanceof Date ? timestamp : new Date(timestamp);
      return date.toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });
    };

    const rows = filteredLogs.map((log) => [
      log.agentName || "N/A",
      log.department || managerData?.department || "N/A",
      log.callId || "N/A",
      log.sid || "N/A",
      log.clientNumber || "N/A",
      log.callType || "N/A",
      log.agentType || "N/A",
      log.escalation || "N/A",
      log.departmentName || log.department || "N/A",
      log.callCategory || "N/A",
      log.partner || "N/A",
      formatTimestamp(log.timestamp),
      formatDuration(log.duration),
      log.callConnected ? "Connected" : "Not Connected",
      log.callConnected ? log.callStatus || "N/A" : "N/A",
      log.callConnected ? "N/A" : log.notConnectedReason || "N/A",
      log.remarks || "N/A",
    ]);

    const csvContent = [headers, ...rows].map((row) => row.map((cell) => `"${cell}"`).join(",")).join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `${managerData?.department || "department"}_calls_${csvFilter}_${new Date().toISOString().split("T")[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleAddUser = async () => {
    if (!newUserData.name || !newUserData.email || !newUserData.password || !newUserData.id || !newUserData.mobile) {
      alert("Please fill in all required fields");
      return;
    }

    if (newUserData.role === "agent" && !newUserData.agentCollection) {
      alert("Please enter an agent collection");
      return;
    }

    setCreating(true);

    try {
      const secondaryApp = initializeApp(firebaseConfig, "secondary");
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
        department: managerData?.department,
        createdAt: serverTimestamp(),
        createdBy: managerId,
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

      alert(`User created successfully!\n\nDepartment: ${managerData?.department}\nEmail: ${newUserData.email}`);

      setNewUserData({ name: "", email: "", password: "", id: "", mobile: "", role: "agent", designation: "RE", agentCollection: "" });
      setOpenAddUserDialog(false);
    } catch (error) {
      console.error("Error creating user:", error);
      if (error.code === "auth/email-already-in-use") {
        alert("This email is already in use");
      } else if (error.code === "auth/weak-password") {
        alert("Password should be at least 6 characters");
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
        const lines = text.split("\n").filter((line) => line.trim());
        const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());

        const users = [];
        for (let i = 1; i < lines.length; i++) {
          const values = lines[i].split(",").map((v) => v.trim());
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
      const secondaryApp = initializeApp(firebaseConfig, `secondary-${Date.now()}`);
      const secondaryAuth = getAuth(secondaryApp);

      for (let i = 0; i < users.length; i++) {
        const userData = users[i];
        const progress = Math.round(((i + 1) / users.length) * 100);
        setBulkProgress(progress);

        try {
          if (!userData.name || !userData.email || !userData.password || !userData.id || !userData.mobile) {
            results.push({ success: false, email: userData.email || `Row ${i + 2}`, error: "Missing required fields" });
            continue;
          }

          if (userData.role === "agent" && !userData.agentcollection) {
            results.push({ success: false, email: userData.email, error: "Missing agentCollection" });
            continue;
          }

          const userCredential = await createUserWithEmailAndPassword(secondaryAuth, userData.email, userData.password);
          const user = userCredential.user;

          const userDocData = {
            name: userData.name,
            email: userData.email,
            id: userData.id,
            mobile: userData.mobile,
            role: userData.role || "agent",
            designation: userData.designation || "RE",
            status: "Logout",
            department: managerData?.department,
            createdAt: serverTimestamp(),
            createdBy: managerId,
          };

          if (userData.role === "agent") {
            await setDoc(doc(db, userData.agentcollection, user.uid), userDocData);
          } else {
            userDocData.teamMembers = [];
            await setDoc(doc(db, "mswasth", user.uid), userDocData);
          }

          await setDoc(doc(db, "userCollections", user.uid), {
            collection: userData.role === "agent" ? userData.agentcollection : "mswasth",
            email: userData.email,
            role: userData.role || "agent",
            createdAt: serverTimestamp(),
          });

          results.push({ success: true, email: userData.email });
        } catch (error) {
          let errorMsg = error.message;
          if (error.code === "auth/email-already-in-use") {
            errorMsg = "Email already in use";
          } else if (error.code === "auth/weak-password") {
            errorMsg = "Password too weak";
          }
          results.push({ success: false, email: userData.email, error: errorMsg });
        }

        await new Promise((resolve) => setTimeout(resolve, 100));
      }

      await secondaryAuth.signOut();

      setBulkResults(results);
      setBulkProgress(100);

      const successCount = results.filter((r) => r.success).length;
      const failCount = results.filter((r) => !r.success).length;

      alert(`Bulk user creation completed!\n\nSuccessful: ${successCount}\nFailed: ${failCount}`);
    } catch (error) {
      console.error("Error in bulk user creation:", error);
      alert("Error processing CSV file: " + error.message);
    } finally {
      setBulkCreating(false);
    }
  };

  if (loading || !managerData) {
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
        <Typography variant="h6" sx={{ color: THEME_COLORS.textSecondary }}>Loading department data...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: "100vh", background: THEME_COLORS.background, p: { xs: 2, md: 3 } }}>
      {/* Header */}
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
        <Box sx={{ position: "absolute", top: -50, right: -50, width: 200, height: 200, borderRadius: "50%", background: "rgba(255,255,255,0.1)" }} />
        <Box sx={{ position: "absolute", bottom: -30, left: "30%", width: 100, height: 100, borderRadius: "50%", background: "rgba(255,255,255,0.05)" }} />

        <Box sx={{ position: "relative", zIndex: 1 }}>
          <Box sx={{ display: "flex", justifyContent: "center", mb: 3 }}>
            <Box sx={{ backgroundColor: "rgba(255, 255, 255, 0.15)", borderRadius: "16px", padding: "6px", backdropFilter: "blur(10px)" }}>
              <Tabs
                value={mainTabValue}
                onChange={(e, newValue) => setMainTabValue(newValue)}
                sx={{
                  minHeight: "48px",
                  "& .MuiTabs-indicator": { display: "none" },
                  "& .MuiTab-root": {
                    textTransform: "none",
                    fontWeight: 600,
                    fontSize: "1rem",
                    minHeight: "48px",
                    px: 4,
                    color: "rgba(255, 255, 255, 0.7)",
                    borderRadius: "12px",
                    transition: "all 0.3s ease",
                    "&.Mui-selected": { color: THEME_COLORS.primary, backgroundColor: "#fff" },
                    "&:hover": { backgroundColor: "rgba(255, 255, 255, 0.1)" },
                  },
                }}
              >
                <Tab icon={<DashboardIcon />} iconPosition="start" label="Dashboard" />
                <Tab icon={<Analytics />} iconPosition="start" label="Call Analytics" />
              </Tabs>
            </Box>
          </Box>

          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 2 }}>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 800, color: "#fff", fontSize: { xs: "1.5rem", md: "2rem" }, mb: 1 }}>
                {managerData?.department} Department
              </Typography>
              <Typography variant="subtitle1" sx={{ color: "rgba(255,255,255,0.9)", fontWeight: 500 }}>
                Welcome back, {managerData?.name} - Managing {agents.length} team member{agents.length !== 1 ? "s" : ""}
              </Typography>
            </Box>

            <Box sx={{ display: "flex", gap: 2, alignItems: "center", flexWrap: "wrap" }}>
              <TextField
                placeholder="Search agents, calls, SID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                size="small"
                sx={{
                  minWidth: { xs: "100%", sm: 280 },
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
              <Button
                onClick={() => setOpenAddUserDialog(true)}
                startIcon={<PersonAdd />}
                sx={{
                  bgcolor: "rgba(255,255,255,0.2)",
                  color: "#fff",
                  fontWeight: 600,
                  borderRadius: "12px",
                  px: 3,
                  textTransform: "none",
                  backdropFilter: "blur(10px)",
                  "&:hover": { bgcolor: "rgba(255,255,255,0.3)" },
                }}
              >
                Add User
              </Button>
            </Box>
          </Box>
        </Box>
      </Paper>

      {mainTabValue === 0 && (
        <>
          {/* Stats Cards */}
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={6} sm={4} md={2}>
              <AnimatedStatCard value={stats.totalAgents} label="Total Agents" icon={<Group sx={{ fontSize: 24, color: "#fff" }} />} gradient={THEME_COLORS.gradient} delay={0} />
            </Grid>
            <Grid item xs={6} sm={4} md={2}>
              <AnimatedStatCard value={stats.available} label="Available" icon={<CheckCircle sx={{ fontSize: 24, color: "#fff" }} />} gradient="linear-gradient(135deg, #10b981 0%, #059669 100%)" delay={100} />
            </Grid>
            <Grid item xs={6} sm={4} md={2}>
              <AnimatedStatCard value={stats.onCall} label="On Call" icon={<PhoneInTalk sx={{ fontSize: 24, color: "#fff" }} />} gradient="linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)" delay={200} />
            </Grid>
            <Grid item xs={6} sm={4} md={2}>
              <AnimatedStatCard value={stats.loggedOut} label="Offline" icon={<LogoutIcon sx={{ fontSize: 24, color: "#fff" }} />} gradient="linear-gradient(135deg, #6b7280 0%, #4b5563 100%)" delay={300} />
            </Grid>
            <Grid item xs={6} sm={4} md={2}>
              <AnimatedStatCard value={last24HoursCalls} label="Calls (24h)" icon={<Phone sx={{ fontSize: 24, color: "#fff" }} />} gradient="linear-gradient(135deg, #f59e0b 0%, #d97706 100%)" delay={400} />
            </Grid>
            <Grid item xs={6} sm={4} md={2}>
              <AnimatedStatCard value={stats.connectionRate} label="Connect Rate" icon={<Speed sx={{ fontSize: 24, color: "#fff" }} />} gradient="linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)" delay={500} />
            </Grid>
          </Grid>

          {/* Charts Row */}
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} lg={8}>
              <Paper elevation={0} sx={{ bgcolor: "#fff", borderRadius: "20px", p: 3, height: "100%" }}>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 3, color: THEME_COLORS.textPrimary }}>Call Trend (Last 7 Days)</Typography>
                <ResponsiveContainer width="100%" height={250}>
                  <AreaChart data={getCallTrendData()}>
                    <defs>
                      <linearGradient id="colorCallsDept" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={THEME_COLORS.primary} stopOpacity={0.3} />
                        <stop offset="95%" stopColor={THEME_COLORS.primary} stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorConnectedDept" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
                    <XAxis dataKey="name" stroke={THEME_COLORS.textSecondary} fontSize={12} />
                    <YAxis stroke={THEME_COLORS.textSecondary} fontSize={12} />
                    <RechartsTooltip contentStyle={{ backgroundColor: "#fff", border: "none", borderRadius: "12px", boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }} />
                    <Area type="monotone" dataKey="calls" stroke={THEME_COLORS.primary} fillOpacity={1} fill="url(#colorCallsDept)" strokeWidth={2} name="Total Calls" />
                    <Area type="monotone" dataKey="connected" stroke="#10b981" fillOpacity={1} fill="url(#colorConnectedDept)" strokeWidth={2} name="Connected" />
                  </AreaChart>
                </ResponsiveContainer>
              </Paper>
            </Grid>
            <Grid item xs={12} lg={4}>
              <Paper elevation={0} sx={{ bgcolor: "#fff", borderRadius: "20px", p: 3, height: "100%" }}>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 3, color: THEME_COLORS.textPrimary }}>Team Status</Typography>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={getStatusDistribution()} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={5} dataKey="value">
                      {getStatusDistribution().map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <RechartsTooltip contentStyle={{ backgroundColor: "#fff", border: "none", borderRadius: "12px", boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }} />
                    <Legend verticalAlign="bottom" height={36} formatter={(value) => <span style={{ color: THEME_COLORS.textPrimary, fontSize: "0.8rem" }}>{value}</span>} />
                  </PieChart>
                </ResponsiveContainer>
              </Paper>
            </Grid>
          </Grid>

          {/* Controls */}
          <Paper elevation={0} sx={{ bgcolor: "#fff", borderRadius: "16px", p: 2, mb: 3, display: "flex", alignItems: "center", gap: 2, flexWrap: "wrap" }}>
            <FormControl size="small" sx={{ minWidth: 140 }}>
              <Select
                value={csvFilter}
                onChange={(e) => setCsvFilter(e.target.value)}
                sx={{ borderRadius: "10px", "& .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(99, 102, 241, 0.2)" }, "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: THEME_COLORS.primary } }}
              >
                <MenuItem value="all">All Time</MenuItem>
                <MenuItem value="daily">Last 24 Hours</MenuItem>
                <MenuItem value="weekly">Last 7 Days</MenuItem>
                <MenuItem value="monthly">Last 30 Days</MenuItem>
              </Select>
            </FormControl>

            <Button
              onClick={handleDownloadCSV}
              startIcon={<FileDownload />}
              sx={{ bgcolor: THEME_COLORS.primary, color: "#fff", fontWeight: 600, borderRadius: "10px", px: 3, textTransform: "none", "&:hover": { bgcolor: THEME_COLORS.primaryDark } }}
            >
              Download CSV
            </Button>

            <Box sx={{ flex: 1 }} />

            <Box sx={{ display: "flex", gap: 1 }}>
              <Tooltip title="Grid View">
                <IconButton
                  onClick={() => setIsGridView(true)}
                  sx={{ bgcolor: isGridView ? THEME_COLORS.primary : "transparent", color: isGridView ? "#fff" : THEME_COLORS.textSecondary, "&:hover": { bgcolor: isGridView ? THEME_COLORS.primaryDark : "rgba(99, 102, 241, 0.1)" } }}
                >
                  <ViewModule />
                </IconButton>
              </Tooltip>
              <Tooltip title="List View">
                <IconButton
                  onClick={() => setIsGridView(false)}
                  sx={{ bgcolor: !isGridView ? THEME_COLORS.primary : "transparent", color: !isGridView ? "#fff" : THEME_COLORS.textSecondary, "&:hover": { bgcolor: !isGridView ? THEME_COLORS.primaryDark : "rgba(99, 102, 241, 0.1)" } }}
                >
                  <ViewList />
                </IconButton>
              </Tooltip>
            </Box>
          </Paper>

          {/* Matching Call Logs (when searching) */}
          {searchQuery && filteredCallLogs.length > 0 && (
            <Paper elevation={0} sx={{ bgcolor: "#fff", borderRadius: "16px", overflow: "hidden", mb: 3 }}>
              <Box sx={{ p: 2, borderBottom: "1px solid rgba(99, 102, 241, 0.1)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <Typography variant="h6" sx={{ fontWeight: 700, color: THEME_COLORS.textPrimary }}>
                  Matching Call Logs
                  <Chip label={`${filteredCallLogs.length} results`} size="small" sx={{ ml: 1, bgcolor: "rgba(99, 102, 241, 0.1)", color: THEME_COLORS.primary }} />
                </Typography>
              </Box>

              <Box sx={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ background: "rgba(99, 102, 241, 0.05)" }}>
                      {["Date/Time", "Agent", "Client", "SID", "Type", "Status", "Duration", "Recording"].map((header) => (
                        <th key={header} style={{ padding: "16px", textAlign: "left", color: THEME_COLORS.textSecondary, fontWeight: 600, fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.5px" }}>{header}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCallLogs.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((log, index) => (
                      <tr
                        key={`${log.callId}-${index}`}
                        style={{ borderBottom: "1px solid rgba(99, 102, 241, 0.05)", transition: "background-color 0.2s" }}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgba(99, 102, 241, 0.02)")}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                      >
                        <td style={{ padding: "16px", color: THEME_COLORS.textSecondary, fontSize: "0.875rem" }}>
                          {log.timestamp ? (log.timestamp instanceof Date ? log.timestamp : new Date(log.timestamp)).toLocaleString() : "N/A"}
                        </td>
                        <td style={{ padding: "16px", color: THEME_COLORS.textPrimary, fontWeight: 600, fontSize: "0.875rem" }}>{log.agentName || "N/A"}</td>
                        <td style={{ padding: "16px", color: THEME_COLORS.textSecondary, fontSize: "0.875rem" }}>{log.clientNumber || "N/A"}</td>
                        <td style={{ padding: "16px", color: THEME_COLORS.primary, fontSize: "0.8rem", fontFamily: "monospace" }}>{log.sid?.substring(0, 12) || "N/A"}...</td>
                        <td style={{ padding: "16px", color: THEME_COLORS.textSecondary, fontSize: "0.875rem" }}>{log.callType || "N/A"}</td>
                        <td style={{ padding: "16px" }}>
                          <Chip size="small" label={log.callConnected ? "Connected" : "Not Connected"} sx={{ bgcolor: log.callConnected ? "rgba(16, 185, 129, 0.1)" : "rgba(239, 68, 68, 0.1)", color: log.callConnected ? "#10b981" : "#ef4444", fontWeight: 600, fontSize: "0.7rem" }} />
                        </td>
                        <td style={{ padding: "16px", color: THEME_COLORS.textSecondary, fontSize: "0.875rem" }}>{formatDuration(log.duration)}</td>
                        <td style={{ padding: "16px" }}>
                          {log.sid ? (
                            <IconButton size="small" onClick={() => fetchRecording(log.sid)} disabled={loadingRecordings[log.sid]} sx={{ bgcolor: THEME_COLORS.primary, color: "#fff", "&:hover": { bgcolor: THEME_COLORS.primaryDark }, "&:disabled": { bgcolor: "grey.300" } }}>
                              {loadingRecordings[log.sid] ? <CircularProgress size={20} color="inherit" /> : <PlayArrow fontSize="small" />}
                            </IconButton>
                          ) : (
                            <Typography variant="caption" sx={{ color: THEME_COLORS.textSecondary }}>N/A</Typography>
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
                onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
                rowsPerPageOptions={[5, 10, 25, 50]}
                sx={{ borderTop: "1px solid rgba(99, 102, 241, 0.1)", "& .MuiTablePagination-select": { borderRadius: "8px" } }}
              />
            </Paper>
          )}

          {/* Team Members */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="h5" sx={{ fontWeight: 700, color: THEME_COLORS.textPrimary, mb: 2, display: "flex", alignItems: "center", gap: 1 }}>
              <Group sx={{ color: THEME_COLORS.primary }} />
              Team Members
              {searchQuery && <Chip label={`${filteredAgents.length} results`} size="small" sx={{ bgcolor: "rgba(99, 102, 241, 0.1)", color: THEME_COLORS.primary, fontWeight: 600 }} />}
            </Typography>

            {filteredAgents.length === 0 ? (
              <Paper elevation={0} sx={{ bgcolor: "#fff", borderRadius: "16px", p: 6, textAlign: "center" }}>
                <Group sx={{ fontSize: 64, color: "rgba(99, 102, 241, 0.2)", mb: 2 }} />
                <Typography variant="h6" sx={{ color: THEME_COLORS.textSecondary }}>{searchQuery ? "No agents match your search" : "No team members assigned yet"}</Typography>
              </Paper>
            ) : isGridView ? (
              <Grid container spacing={3}>
                {filteredAgents.map((agent) => (
                  <Grid item xs={12} sm={6} md={4} lg={3} key={`${agent.collection}-${agent.id}`}>
                    <AgentCard agent={agent} onCardClick={handleCardClick} isGridView={true} />
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {filteredAgents.map((agent) => (
                  <AgentCard key={`${agent.collection}-${agent.id}`} agent={agent} onCardClick={handleCardClick} isGridView={false} />
                ))}
              </Box>
            )}
          </Box>
        </>
      )}

      {mainTabValue === 1 && (
        <CallAnalytics callLogs={callLogs} agents={agents} onBack={() => setMainTabValue(0)} />
      )}

      {/* Add New User Dialog */}
      <Dialog
        open={openAddUserDialog}
        onClose={() => !creating && !bulkCreating && setOpenAddUserDialog(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { borderRadius: "20px", maxHeight: "90vh" } }}
      >
        <DialogTitle sx={{ borderBottom: "1px solid rgba(99, 102, 241, 0.1)", pb: 0 }}>
          <Typography variant="h5" sx={{ fontWeight: 700, color: THEME_COLORS.textPrimary, mb: 2 }}>Add New User</Typography>
          <Tabs
            value={tabValue}
            onChange={(e, newValue) => setTabValue(newValue)}
            sx={{
              "& .MuiTab-root": { color: THEME_COLORS.textSecondary, textTransform: "none", fontSize: "1rem", fontWeight: 600, "&.Mui-selected": { color: THEME_COLORS.primary } },
              "& .MuiTabs-indicator": { backgroundColor: THEME_COLORS.primary },
            }}
          >
            <Tab label="Single User" />
            <Tab label="Bulk Upload (CSV)" />
          </Tabs>
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          {tabValue === 0 ? (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5, mt: 2 }}>
              <TextField label="Full Name" value={newUserData.name} onChange={(e) => setNewUserData({ ...newUserData, name: e.target.value })} fullWidth required disabled={creating} />
              <TextField label="Email" type="email" value={newUserData.email} onChange={(e) => setNewUserData({ ...newUserData, email: e.target.value })} fullWidth required disabled={creating} />
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
                      <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">{showPassword ? <VisibilityOff /> : <Visibility />}</IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              <TextField label="User ID (e.g., MS01234)" value={newUserData.id} onChange={(e) => setNewUserData({ ...newUserData, id: e.target.value })} fullWidth required disabled={creating} />
              <TextField label="Mobile Number" value={newUserData.mobile} onChange={(e) => setNewUserData({ ...newUserData, mobile: e.target.value })} fullWidth required disabled={creating} />
              <TextField
                label="Agent Collection ID"
                value={newUserData.agentCollection}
                onChange={(e) => setNewUserData({ ...newUserData, agentCollection: e.target.value.toLowerCase() })}
                fullWidth
                required={newUserData.role === "agent"}
                disabled={creating || newUserData.role !== "agent"}
                placeholder="e.g., agent1, agent12"
                helperText={newUserData.role === "agent" ? "Format: agent1, agent2, etc." : "Only required for Agents"}
              />
              <TextField label="Designation" value={newUserData.designation} onChange={(e) => setNewUserData({ ...newUserData, designation: e.target.value })} fullWidth disabled={creating} placeholder="e.g., RE, SE, TL" />
              <FormControl component="fieldset" disabled={creating}>
                <FormLabel component="legend">Role</FormLabel>
                <RadioGroup value={newUserData.role} onChange={(e) => setNewUserData({ ...newUserData, role: e.target.value })} row>
                  <FormControlLabel value="agent" control={<Radio sx={{ "&.Mui-checked": { color: THEME_COLORS.primary } }} />} label="Agent" />
                  <FormControlLabel value="teamlead" control={<Radio sx={{ "&.Mui-checked": { color: THEME_COLORS.primary } }} />} label="Team Lead" />
                </RadioGroup>
              </FormControl>
            </Box>
          ) : (
            <Box sx={{ mt: 2 }}>
              <Alert severity="info" sx={{ mb: 2, borderRadius: "12px" }}>CSV Format: name, email, password, id, mobile, role, designation, agentCollection</Alert>
              <Button
                variant="outlined"
                component="label"
                fullWidth
                startIcon={<Upload />}
                sx={{ borderColor: THEME_COLORS.primary, color: THEME_COLORS.primary, borderRadius: "12px", py: 1.5, "&:hover": { borderColor: THEME_COLORS.primaryDark, bgcolor: "rgba(99, 102, 241, 0.05)" } }}
              >
                Upload CSV
                <input type="file" accept=".csv" hidden onChange={handleCsvFileChange} />
              </Button>
              {csvFile && <Typography sx={{ mt: 1, color: "#10b981", fontWeight: 600 }}>Selected: {csvFile.name}</Typography>}
              {bulkCreating && (
                <Box sx={{ mt: 2 }}>
                  <LinearProgress variant="determinate" value={bulkProgress} sx={{ borderRadius: 4, height: 8, bgcolor: "rgba(99, 102, 241, 0.1)", "& .MuiLinearProgress-bar": { bgcolor: THEME_COLORS.primary } }} />
                  <Typography sx={{ mt: 1, textAlign: "center", color: THEME_COLORS.textSecondary }}>{bulkProgress}% Complete</Typography>
                </Box>
              )}
              {bulkResults.length > 0 && (
                <List sx={{ mt: 2, maxHeight: 200, overflow: "auto", bgcolor: "rgba(99, 102, 241, 0.02)", borderRadius: "12px" }}>
                  {bulkResults.map((result, idx) => (
                    <ListItem key={idx}>
                      {result.success ? <CheckCircle sx={{ color: "#10b981", mr: 1 }} /> : <ErrorIcon sx={{ color: "#ef4444", mr: 1 }} />}
                      <ListItemText primary={result.email} secondary={result.error || "Success"} />
                    </ListItem>
                  ))}
                </List>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ borderTop: "1px solid rgba(99, 102, 241, 0.1)", p: 2 }}>
          <Button onClick={() => setOpenAddUserDialog(false)} sx={{ color: THEME_COLORS.textSecondary, fontWeight: 600 }}>Cancel</Button>
          <Button
            onClick={tabValue === 0 ? handleAddUser : handleBulkCreateUsers}
            variant="contained"
            disabled={creating || bulkCreating}
            sx={{ bgcolor: THEME_COLORS.primary, fontWeight: 600, borderRadius: "10px", px: 4, "&:hover": { bgcolor: THEME_COLORS.primaryDark } }}
          >
            {creating || bulkCreating ? "Creating..." : tabValue === 0 ? "Create User" : "Bulk Create"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default DepartmentManagerDashboard;
