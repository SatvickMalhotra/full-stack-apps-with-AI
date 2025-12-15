import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Paper,
  TextField,
  InputAdornment,
  Button,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Divider,
  Tooltip,
  CircularProgress,
  Badge,
  LinearProgress,
} from "@mui/material";
import {
  DirectionsWalk,
  Search as SearchIcon,
  FileDownload,
  Refresh,
  Group,
  LocationOn,
  Timeline,
  Business,
  Close,
  Phone,
  Email,
  Badge as BadgeIcon,
  TrendingUp,
  LocalShipping,
  FilterList,
  GridView,
  ViewList,
  CheckCircle,
  ArrowUpward,
  ArrowDownward,
  Assessment,
  Map,
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
  AreaChart,
  Area,
} from "recharts";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { db, auth } from "../firebaseConfig";

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
const AnimatedStatCard = ({ title, value, icon, gradient, subtitle, suffix = "" }) => {
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
              {animatedValue}{suffix}
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
const AgentCard = ({ agent, agentData, onClick }) => {
  const totalActivity = agentData.visits.length + agentData.trips.length + agentData.calls.length;

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
          borderColor: "#10b981",
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
              <Box
                sx={{
                  width: 14,
                  height: 14,
                  borderRadius: "50%",
                  bgcolor: isAgentActive(agent.status) ? "#22c55e" : "#94a3b8",
                  border: "2px solid white",
                }}
              />
            }
          >
            <Avatar
              sx={{
                width: 56,
                height: 56,
                background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                fontSize: "1.5rem",
                fontWeight: 600,
              }}
            >
              {agent.name ? agent.name.charAt(0).toUpperCase() : "?"}
            </Avatar>
          </Badge>
          <Box sx={{ flexGrow: 1, minWidth: 0 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.5 }} noWrap>
              {agent.name || "No Name"}
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
        </Box>

        <Divider sx={{ my: 2 }} />

        <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
          <Box sx={{ flex: 1, textAlign: "center", p: 1, bgcolor: "#f0fdf4", borderRadius: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, color: "#10b981" }}>
              {agentData.visits.length}
            </Typography>
            <Typography variant="caption" sx={{ color: "text.secondary" }}>
              Visits
            </Typography>
          </Box>
          <Box sx={{ flex: 1, textAlign: "center", p: 1, bgcolor: "#fef3c7", borderRadius: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, color: "#d97706" }}>
              {agentData.trips.length}
            </Typography>
            <Typography variant="caption" sx={{ color: "text.secondary" }}>
              Trips
            </Typography>
          </Box>
          <Box sx={{ flex: 1, textAlign: "center", p: 1, bgcolor: "#e0f2fe", borderRadius: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, color: "#0284c7" }}>
              {agentData.calls.length}
            </Typography>
            <Typography variant="caption" sx={{ color: "text.secondary" }}>
              Calls
            </Typography>
          </Box>
        </Box>

        <Box>
          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
            <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 500 }}>
              Activity Score
            </Typography>
            <Typography variant="caption" sx={{ fontWeight: 700, color: "#10b981" }}>
              {totalActivity}
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={Math.min(totalActivity * 5, 100)}
            sx={{
              height: 8,
              borderRadius: 4,
              bgcolor: "#e2e8f0",
              "& .MuiLinearProgress-bar": {
                borderRadius: 4,
                background: "linear-gradient(90deg, #10b981 0%, #059669 100%)",
              },
            }}
          />
        </Box>
      </CardContent>
    </Card>
  );
};

// Gradient definitions for Offline Visits theme (Green/Emerald theme)
const OFFLINE_GRADIENTS = {
  primary: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
  secondary: "linear-gradient(135deg, #34d399 0%, #10b981 100%)",
  accent: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
  info: "linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)",
  purple: "linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)",
  pink: "linear-gradient(135deg, #ec4899 0%, #db2777 100%)",
};

const CHART_COLORS = ["#10b981", "#34d399", "#f59e0b", "#0ea5e9", "#8b5cf6", "#ec4899"];

// Helper function to check if agent is active/online
const isAgentActive = (status) => {
  return status === "Available" || status === "On Call" ||
         status === "Login" || status === "Idle" || status === "Busy";
};

// Helper function to get status display config
const getStatusConfig = (status) => {
  const configs = {
    "Available": { label: "Available", color: "#16a34a", bgColor: "#dcfce7" },
    "On Call": { label: "On Call", color: "#f59e0b", bgColor: "#fef3c7" },
    "Unavailable": { label: "Offline", color: "#64748b", bgColor: "#f1f5f9" },
    // Legacy status backwards compatibility
    "Login": { label: "Available", color: "#16a34a", bgColor: "#dcfce7" },
    "Logout": { label: "Offline", color: "#64748b", bgColor: "#f1f5f9" },
    "Logged Out": { label: "Offline", color: "#64748b", bgColor: "#f1f5f9" },
    "Idle": { label: "Available", color: "#16a34a", bgColor: "#dcfce7" },
    "Busy": { label: "On Call", color: "#f59e0b", bgColor: "#fef3c7" },
  };
  return configs[status] || configs["Unavailable"];
};

function OfflineVisitsManagerDashboard({ currentUser }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewMode, setViewMode] = useState("grid");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [dcAgents, setDcAgents] = useState([]);
  const [visitLogs, setVisitLogs] = useState([]);
  const [trips, setTrips] = useState([]);
  const [manualCallLogs, setManualCallLogs] = useState([]);

  // Fetch all offline visits data
  useEffect(() => {
    let mounted = true;
    const unsubscribes = [];

    const fetchOfflineVisitsData = async () => {
      try {
        const offlineVisitsRef = collection(db, "offlineVisits");
        const offlineVisitsUnsubscribe = onSnapshot(offlineVisitsRef, (snapshot) => {
          if (!mounted) return;

          const users = [];

          snapshot.docs.forEach((userDoc) => {
            const userData = userDoc.data();
            const userId = userDoc.id;

            users.push({
              id: userId,
              ...userData,
            });

            // Listen to visitLogs subcollection
            const visitLogsRef = collection(db, "offlineVisits", userId, "visitLogs");
            const visitLogsQuery = query(visitLogsRef, orderBy("createdAt", "desc"));
            const visitLogsUnsubscribe = onSnapshot(visitLogsQuery, (visitLogsSnapshot) => {
              if (!mounted) return;
              const userVisits = [];
              visitLogsSnapshot.docs.forEach((visitDoc) => {
                userVisits.push({
                  id: visitDoc.id,
                  visitorId: userId,
                  userId,
                  userName: userData.name,
                  userEmpId: userData.empId,
                  ...visitDoc.data(),
                });
              });

              setVisitLogs((prev) => {
                const filtered = prev.filter((log) => log.userId !== userId);
                return [...filtered, ...userVisits];
              });
            });
            unsubscribes.push(visitLogsUnsubscribe);

            // Listen to trips subcollection
            const tripsRef = collection(db, "offlineVisits", userId, "trips");
            const tripsQuery = query(tripsRef, orderBy("startTime", "desc"));
            const tripsUnsubscribe = onSnapshot(tripsQuery, (tripsSnapshot) => {
              if (!mounted) return;
              const userTrips = [];
              tripsSnapshot.docs.forEach((tripDoc) => {
                userTrips.push({
                  id: tripDoc.id,
                  userId,
                  userName: userData.name,
                  userEmpId: userData.empId,
                  ...tripDoc.data(),
                });
              });

              setTrips((prev) => {
                const filtered = prev.filter((trip) => trip.userId !== userId);
                return [...filtered, ...userTrips];
              });
            });
            unsubscribes.push(tripsUnsubscribe);

            // Listen to manual call logs subcollection
            const manualLogsRef = collection(db, "offlineVisits", userId, "manualCallLogs");
            const manualLogsQuery = query(manualLogsRef, orderBy("timestamp", "desc"));
            const manualLogsUnsubscribe = onSnapshot(manualLogsQuery, (logsSnapshot) => {
              if (!mounted) return;
              const userLogs = [];
              logsSnapshot.docs.forEach((logDoc) => {
                userLogs.push({
                  id: logDoc.id,
                  userId,
                  userName: userData.name,
                  userEmpId: userData.empId,
                  ...logDoc.data(),
                });
              });

              setManualCallLogs((prev) => {
                const filtered = prev.filter((log) => log.userId !== userId);
                return [...filtered, ...userLogs];
              });
            });
            unsubscribes.push(manualLogsUnsubscribe);
          });

          setDcAgents(users);
          setLoading(false);
        });

        unsubscribes.push(offlineVisitsUnsubscribe);
      } catch (error) {
        console.error("Error fetching offline visits data:", error);
        setLoading(false);
      }
    };

    fetchOfflineVisitsData();

    return () => {
      mounted = false;
      unsubscribes.forEach((unsubscribe) => unsubscribe());
    };
  }, []);

  // Calculate statistics (supports both new and legacy status values)
  const totalAgents = dcAgents.length;
  const onlineAgents = dcAgents.filter((agent) => isAgentActive(agent.status)).length;
  const totalVisits = visitLogs.length;
  const totalTrips = trips.length;
  const totalDistance = trips.reduce((sum, trip) => sum + (trip.totalDistance || 0), 0);
  const uniqueClinics = new Set(visitLogs.map((v) => v.clinicCode)).size;
  const totalCalls = manualCallLogs.length;

  // Filter functions
  const filteredVisitLogs = visitLogs.filter((log) => {
    const q = searchQuery.toLowerCase();
    return (
      log.userName?.toLowerCase().includes(q) ||
      log.userEmpId?.toLowerCase().includes(q) ||
      log.clinicCode?.toLowerCase().includes(q) ||
      log.clinicName?.toLowerCase().includes(q)
    );
  });

  const filteredTrips = trips.filter((trip) => {
    const q = searchQuery.toLowerCase();
    return (
      trip.userName?.toLowerCase().includes(q) ||
      trip.userEmpId?.toLowerCase().includes(q)
    );
  });

  const filteredDcAgents = dcAgents.filter((agent) => {
    const q = searchQuery.toLowerCase();
    return (
      agent.name?.toLowerCase().includes(q) ||
      agent.empId?.toLowerCase().includes(q) ||
      agent.email?.toLowerCase().includes(q)
    );
  });

  // Get agent-specific data
  const getAgentData = (agentId) => {
    return {
      visits: visitLogs.filter((v) => v.userId === agentId),
      trips: trips.filter((t) => t.userId === agentId),
      calls: manualCallLogs.filter((c) => c.userId === agentId),
    };
  };

  // Analytics data
  const visitsByAgent = dcAgents
    .map((agent) => {
      const data = getAgentData(agent.id);
      return {
        name: agent.name?.split(" ")[0] || agent.empId,
        visits: data.visits.length,
        trips: data.trips.length,
        calls: data.calls.length,
      };
    })
    .sort((a, b) => b.visits - a.visits)
    .slice(0, 5);

  const visitsByType = (() => {
    const types = {};
    visitLogs.forEach((visit) => {
      const type = visit.visitType || "Unknown";
      types[type] = (types[type] || 0) + 1;
    });
    return Object.entries(types).map(([name, value]) => ({ name, value }));
  })();

  // Weekly trend data
  const getWeeklyTrend = () => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toLocaleDateString('en-US', { weekday: 'short' });
      const dayStart = new Date(date.setHours(0, 0, 0, 0));
      const dayEnd = new Date(date.setHours(23, 59, 59, 999));

      const dayVisits = visitLogs.filter(log => {
        if (!log.createdAt) return false;
        const logDate = log.createdAt.toDate ? log.createdAt.toDate() : new Date(log.createdAt);
        return logDate >= dayStart && logDate <= dayEnd;
      });

      const dayTrips = trips.filter(trip => {
        if (!trip.startTime) return false;
        const tripDate = trip.startTime.toDate ? trip.startTime.toDate() : new Date(trip.startTime);
        return tripDate >= dayStart && tripDate <= dayEnd;
      });

      days.push({
        day: dateStr,
        visits: dayVisits.length,
        trips: dayTrips.length,
      });
    }
    return days;
  };

  const weeklyTrendData = getWeeklyTrend();

  // Format functions
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return "N/A";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDuration = (milliseconds) => {
    if (!milliseconds) return "N/A";
    const hours = Math.floor(milliseconds / 3600000);
    const minutes = Math.floor((milliseconds % 3600000) / 60000);
    return `${hours}h ${minutes}m`;
  };

  // Handle agent card click
  const handleAgentClick = (agent) => {
    setSelectedAgent(agent);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedAgent(null);
  };

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  // CSV Download
  const handleDownloadCSV = () => {
    const csvData = [];
    csvData.push("Offline Visits Manager Report");
    csvData.push(`Generated: ${new Date().toLocaleString()}`);
    csvData.push("");
    csvData.push("Summary Statistics");
    csvData.push(`Total DC Agents,${totalAgents}`);
    csvData.push(`Online Agents,${onlineAgents}`);
    csvData.push(`Total Visits,${totalVisits}`);
    csvData.push(`Total Trips,${totalTrips}`);
    csvData.push(`Total Distance (km),${totalDistance.toFixed(2)}`);
    csvData.push(`Unique Clinics,${uniqueClinics}`);
    csvData.push("");
    csvData.push("Visit Logs");
    csvData.push("Date,Agent Name,Agent ID,Clinic Code,Clinic Name,Visit Type,Purpose,Notes");
    visitLogs.forEach((log) => {
      const date = log.createdAt ? formatTimestamp(log.createdAt) : "N/A";
      csvData.push(
        `${date},"${log.userName || ""}","${log.userEmpId || ""}","${log.clinicCode || ""}","${log.clinicName || ""}","${log.visitType || ""}","${log.purpose || ""}","${log.notes || ""}"`
      );
    });

    const csvContent = csvData.join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `offline_visits_report_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
        }}
      >
        <Box sx={{ textAlign: "center" }}>
          <CircularProgress size={60} sx={{ color: "white", mb: 2 }} />
          <Typography variant="h6" sx={{ color: "white" }}>
            Loading Offline Visits...
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
          background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
          color: "white",
          p: 3,
          borderRadius: 0,
        }}
      >
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 2 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <DirectionsWalk sx={{ fontSize: 40 }} />
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
                Offline Visits Manager
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Monitor DC agents, clinic visits, and trip tracking
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
            <TextField
              placeholder="Search agents, clinics, visits..."
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
              startIcon={<FileDownload />}
              onClick={handleDownloadCSV}
              sx={{
                bgcolor: "rgba(255,255,255,0.2)",
                color: "white",
                borderRadius: 2,
                textTransform: "none",
                "&:hover": { bgcolor: "rgba(255,255,255,0.3)" },
              }}
            >
              Export CSV
            </Button>
          </Box>
        </Box>
      </Paper>

      {/* Stats Cards */}
      <Box sx={{ p: 3 }}>
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={4} lg={2}>
            <AnimatedStatCard
              title="DC Agents"
              value={totalAgents}
              icon={<Group sx={{ fontSize: 28 }} />}
              gradient={OFFLINE_GRADIENTS.primary}
              subtitle={`${onlineAgents} online`}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4} lg={2}>
            <AnimatedStatCard
              title="Clinic Visits"
              value={totalVisits}
              icon={<Business sx={{ fontSize: 28 }} />}
              gradient={OFFLINE_GRADIENTS.secondary}
              subtitle={`${uniqueClinics} unique`}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4} lg={2}>
            <AnimatedStatCard
              title="Trips Logged"
              value={totalTrips}
              icon={<Timeline sx={{ fontSize: 28 }} />}
              gradient={OFFLINE_GRADIENTS.accent}
              subtitle="Total trips"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4} lg={2}>
            <AnimatedStatCard
              title="Distance"
              value={Math.round(totalDistance)}
              icon={<LocationOn sx={{ fontSize: 28 }} />}
              gradient={OFFLINE_GRADIENTS.info}
              subtitle="Kilometers"
              suffix=" km"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4} lg={2}>
            <AnimatedStatCard
              title="Manual Calls"
              value={totalCalls}
              icon={<Phone sx={{ fontSize: 28 }} />}
              gradient={OFFLINE_GRADIENTS.purple}
              subtitle="Logged calls"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4} lg={2}>
            <AnimatedStatCard
              title="Online Now"
              value={onlineAgents}
              icon={<CheckCircle sx={{ fontSize: 28 }} />}
              gradient={OFFLINE_GRADIENTS.pink}
              subtitle="Active agents"
            />
          </Grid>
        </Grid>

        {/* Tabs */}
        <Paper elevation={0} sx={{ borderRadius: 3, overflow: "hidden", mb: 3 }}>
          <Box sx={{ borderBottom: 1, borderColor: "divider", px: 2, bgcolor: "#f8fafc" }}>
            <Tabs
              value={activeTab}
              onChange={(e, newValue) => setActiveTab(newValue)}
              sx={{
                "& .MuiTab-root": {
                  textTransform: "none",
                  fontWeight: 600,
                  fontSize: "0.95rem",
                  minHeight: 56,
                },
                "& .Mui-selected": { color: "#10b981" },
                "& .MuiTabs-indicator": { backgroundColor: "#10b981", height: 3 },
              }}
            >
              <Tab icon={<Group sx={{ mr: 1 }} />} iconPosition="start" label={`DC Agents (${filteredDcAgents.length})`} />
              <Tab icon={<Business sx={{ mr: 1 }} />} iconPosition="start" label={`Visit Logs (${filteredVisitLogs.length})`} />
              <Tab icon={<LocalShipping sx={{ mr: 1 }} />} iconPosition="start" label={`Trip Logs (${filteredTrips.length})`} />
              <Tab icon={<Assessment sx={{ mr: 1 }} />} iconPosition="start" label="Analytics" />
            </Tabs>
          </Box>

          {/* Tab Content */}
          <Box sx={{ p: 3 }}>
            {/* Tab 0: DC Agents */}
            {activeTab === 0 && (
              <Box>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    DC Agents ({filteredDcAgents.length})
                  </Typography>
                  <Box sx={{ display: "flex", gap: 1 }}>
                    <Tooltip title={viewMode === "grid" ? "List View" : "Grid View"}>
                      <IconButton
                        onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}
                        sx={{ bgcolor: "#f1f5f9" }}
                      >
                        {viewMode === "grid" ? <ViewList /> : <GridView />}
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Box>

                {viewMode === "grid" ? (
                  <Grid container spacing={3}>
                    {filteredDcAgents
                      .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                      .map((agent) => (
                        <Grid item xs={12} sm={6} md={4} lg={3} key={agent.id}>
                          <AgentCard
                            agent={agent}
                            agentData={getAgentData(agent.id)}
                            onClick={() => handleAgentClick(agent)}
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
                          <TableCell sx={{ fontWeight: 600 }} align="center">Visits</TableCell>
                          <TableCell sx={{ fontWeight: 600 }} align="center">Trips</TableCell>
                          <TableCell sx={{ fontWeight: 600 }} align="center">Calls</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {filteredDcAgents
                          .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                          .map((agent) => {
                            const data = getAgentData(agent.id);
                            return (
                              <TableRow
                                key={agent.id}
                                hover
                                sx={{ cursor: "pointer" }}
                                onClick={() => handleAgentClick(agent)}
                              >
                                <TableCell>
                                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                                    <Avatar
                                      sx={{
                                        width: 40,
                                        height: 40,
                                        background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                                      }}
                                    >
                                      {agent.name?.charAt(0).toUpperCase() || "?"}
                                    </Avatar>
                                    <Box>
                                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                        {agent.name || "No Name"}
                                      </Typography>
                                      <Typography variant="caption" sx={{ color: "text.secondary" }}>
                                        {agent.empId}
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
                                <TableCell align="center">{data.visits.length}</TableCell>
                                <TableCell align="center">{data.trips.length}</TableCell>
                                <TableCell align="center">{data.calls.length}</TableCell>
                              </TableRow>
                            );
                          })}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}

                <TablePagination
                  component="div"
                  count={filteredDcAgents.length}
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

            {/* Tab 1: Visit Logs */}
            {activeTab === 1 && (
              <Box>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow sx={{ bgcolor: "#10b981" }}>
                        <TableCell sx={{ color: "white", fontWeight: 600 }}>Date & Time</TableCell>
                        <TableCell sx={{ color: "white", fontWeight: 600 }}>Agent Name</TableCell>
                        <TableCell sx={{ color: "white", fontWeight: 600 }}>Agent ID</TableCell>
                        <TableCell sx={{ color: "white", fontWeight: 600 }}>Clinic Code</TableCell>
                        <TableCell sx={{ color: "white", fontWeight: 600 }}>Clinic Name</TableCell>
                        <TableCell sx={{ color: "white", fontWeight: 600 }}>Visit Type</TableCell>
                        <TableCell sx={{ color: "white", fontWeight: 600 }}>Purpose</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filteredVisitLogs
                        .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                        .map((log) => (
                          <TableRow key={log.id} hover>
                            <TableCell>{formatTimestamp(log.createdAt)}</TableCell>
                            <TableCell sx={{ fontWeight: 500 }}>{log.userName}</TableCell>
                            <TableCell>{log.userEmpId}</TableCell>
                            <TableCell sx={{ fontFamily: "monospace" }}>{log.clinicCode || "N/A"}</TableCell>
                            <TableCell>{log.clinicName || "N/A"}</TableCell>
                            <TableCell>
                              <Chip
                                label={log.visitType || "N/A"}
                                size="small"
                                sx={{ bgcolor: "#dcfce7", color: "#16a34a", fontWeight: 600 }}
                              />
                            </TableCell>
                            <TableCell>{log.purpose || "N/A"}</TableCell>
                          </TableRow>
                        ))}
                      {filteredVisitLogs.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                            <Typography color="text.secondary">No visit logs found</Typography>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>

                <TablePagination
                  component="div"
                  count={filteredVisitLogs.length}
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

            {/* Tab 2: Trip Logs */}
            {activeTab === 2 && (
              <Box>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow sx={{ bgcolor: "#10b981" }}>
                        <TableCell sx={{ color: "white", fontWeight: 600 }}>Date</TableCell>
                        <TableCell sx={{ color: "white", fontWeight: 600 }}>Agent Name</TableCell>
                        <TableCell sx={{ color: "white", fontWeight: 600 }}>Start Time</TableCell>
                        <TableCell sx={{ color: "white", fontWeight: 600 }}>End Time</TableCell>
                        <TableCell sx={{ color: "white", fontWeight: 600 }}>Distance (km)</TableCell>
                        <TableCell sx={{ color: "white", fontWeight: 600 }}>Duration</TableCell>
                        <TableCell sx={{ color: "white", fontWeight: 600 }}>Status</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filteredTrips
                        .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                        .map((trip) => (
                          <TableRow key={trip.id} hover>
                            <TableCell>
                              {trip.startTime ? formatTimestamp(trip.startTime).split(",")[0] : "N/A"}
                            </TableCell>
                            <TableCell sx={{ fontWeight: 500 }}>{trip.userName}</TableCell>
                            <TableCell>{formatTimestamp(trip.startTime)}</TableCell>
                            <TableCell>{formatTimestamp(trip.endTime)}</TableCell>
                            <TableCell>
                              <Typography sx={{ fontWeight: 600, color: "#10b981" }}>
                                {trip.totalDistance ? trip.totalDistance.toFixed(2) : "0"}
                              </Typography>
                            </TableCell>
                            <TableCell>{formatDuration(trip.duration)}</TableCell>
                            <TableCell>
                              <Chip
                                label={trip.status || "N/A"}
                                size="small"
                                sx={{
                                  bgcolor: trip.status === "completed" ? "#dcfce7" : "#fef3c7",
                                  color: trip.status === "completed" ? "#16a34a" : "#d97706",
                                  fontWeight: 600,
                                }}
                              />
                            </TableCell>
                          </TableRow>
                        ))}
                      {filteredTrips.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                            <Typography color="text.secondary">No trip logs found</Typography>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>

                <TablePagination
                  component="div"
                  count={filteredTrips.length}
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

            {/* Tab 3: Analytics */}
            {activeTab === 3 && (
              <Box>
                <Grid container spacing={3}>
                  {/* Weekly Trend */}
                  <Grid item xs={12} lg={8}>
                    <Card elevation={0} sx={{ p: 3, borderRadius: 3, border: "1px solid", borderColor: "divider" }}>
                      <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                        Weekly Activity Trend
                      </Typography>
                      <ResponsiveContainer width="100%" height={300}>
                        <AreaChart data={weeklyTrendData}>
                          <defs>
                            <linearGradient id="colorVisits" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                              <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="colorTrips" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                              <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                          <XAxis dataKey="day" stroke="#64748b" />
                          <YAxis stroke="#64748b" />
                          <RechartsTooltip />
                          <Legend />
                          <Area
                            type="monotone"
                            dataKey="visits"
                            stroke="#10b981"
                            fill="url(#colorVisits)"
                            strokeWidth={2}
                            name="Visits"
                          />
                          <Area
                            type="monotone"
                            dataKey="trips"
                            stroke="#f59e0b"
                            fill="url(#colorTrips)"
                            strokeWidth={2}
                            name="Trips"
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </Card>
                  </Grid>

                  {/* Visit Distribution */}
                  <Grid item xs={12} lg={4}>
                    <Card elevation={0} sx={{ p: 3, borderRadius: 3, border: "1px solid", borderColor: "divider", height: "100%" }}>
                      <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                        Visit Types
                      </Typography>
                      <ResponsiveContainer width="100%" height={250}>
                        <PieChart>
                          <Pie
                            data={visitsByType}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={90}
                            paddingAngle={5}
                            dataKey="value"
                          >
                            {visitsByType.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
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
                        <BarChart data={visitsByAgent} layout="vertical">
                          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                          <XAxis type="number" stroke="#64748b" />
                          <YAxis dataKey="name" type="category" stroke="#64748b" width={80} />
                          <RechartsTooltip />
                          <Legend />
                          <Bar dataKey="visits" fill="#10b981" name="Visits" radius={[0, 4, 4, 0]} />
                          <Bar dataKey="trips" fill="#f59e0b" name="Trips" radius={[0, 4, 4, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </Card>
                  </Grid>

                  {/* Summary Stats */}
                  <Grid item xs={12} md={6}>
                    <Grid container spacing={3}>
                      <Grid item xs={12}>
                        <Card elevation={0} sx={{ p: 3, borderRadius: 3, bgcolor: "#1e293b", color: "white" }}>
                          <Typography variant="subtitle2" sx={{ color: "#94a3b8", mb: 2 }}>
                            Performance Metrics
                          </Typography>
                          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                            <Box>
                              <Typography variant="h3" sx={{ fontWeight: 700 }}>
                                {totalAgents > 0 ? (totalVisits / totalAgents).toFixed(1) : 0}
                              </Typography>
                              <Typography variant="body2" sx={{ color: "#94a3b8" }}>
                                Avg Visits per Agent
                              </Typography>
                            </Box>
                            <Avatar sx={{ bgcolor: "rgba(16, 185, 129, 0.2)", width: 60, height: 60 }}>
                              <TrendingUp sx={{ fontSize: 32, color: "#10b981" }} />
                            </Avatar>
                          </Box>
                          <Divider sx={{ my: 2, borderColor: "#334155" }} />
                          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                            <Typography variant="body2" sx={{ color: "#94a3b8" }}>
                              Avg Distance/Trip
                            </Typography>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              {totalTrips > 0 ? (totalDistance / totalTrips).toFixed(2) : 0} km
                            </Typography>
                          </Box>
                        </Card>
                      </Grid>
                      <Grid item xs={12}>
                        <Card elevation={0} sx={{ p: 3, borderRadius: 3, bgcolor: "#1e293b", color: "white" }}>
                          <Typography variant="subtitle2" sx={{ color: "#94a3b8", mb: 2 }}>
                            Distance Statistics
                          </Typography>
                          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                            <Box>
                              <Typography variant="h3" sx={{ fontWeight: 700 }}>
                                {totalDistance.toFixed(0)}
                              </Typography>
                              <Typography variant="body2" sx={{ color: "#94a3b8" }}>
                                Total Kilometers
                              </Typography>
                            </Box>
                            <Avatar sx={{ bgcolor: "rgba(245, 158, 11, 0.2)", width: 60, height: 60 }}>
                              <LocalShipping sx={{ fontSize: 32, color: "#f59e0b" }} />
                            </Avatar>
                          </Box>
                          <Divider sx={{ my: 2, borderColor: "#334155" }} />
                          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                            <Typography variant="body2" sx={{ color: "#94a3b8" }}>
                              Unique Clinics
                            </Typography>
                            <Typography variant="body2" sx={{ fontWeight: 600, color: "#10b981" }}>
                              {uniqueClinics}
                            </Typography>
                          </Box>
                        </Card>
                      </Grid>
                    </Grid>
                  </Grid>
                </Grid>
              </Box>
            )}
          </Box>
        </Paper>
      </Box>

      {/* Agent Detail Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        {selectedAgent && (
          <>
            <DialogTitle
              sx={{
                background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                color: "white",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Box display="flex" alignItems="center">
                <Avatar
                  sx={{
                    bgcolor: "white",
                    color: "#10b981",
                    mr: 2,
                    width: 56,
                    height: 56,
                    fontSize: "1.5rem",
                    fontWeight: 700,
                  }}
                >
                  {selectedAgent.name?.charAt(0).toUpperCase() || "?"}
                </Avatar>
                <Box>
                  <Typography variant="h5" fontWeight={700}>
                    {selectedAgent.name || "No Name"}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    {selectedAgent.empId}
                  </Typography>
                </Box>
              </Box>
              <IconButton onClick={handleCloseDialog} sx={{ color: "white" }}>
                <Close />
              </IconButton>
            </DialogTitle>

            <DialogContent sx={{ pt: 3 }}>
              {/* Contact Information */}
              <Box mb={3}>
                <Typography variant="h6" fontWeight={700} sx={{ color: "#10b981", mb: 2 }}>
                  Contact Information
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Email sx={{ color: "#64748b" }} />
                      <Typography variant="body2">{selectedAgent.email || "N/A"}</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Phone sx={{ color: "#64748b" }} />
                      <Typography variant="body2">{selectedAgent.mobile || "N/A"}</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Box display="flex" alignItems="center" gap={1}>
                      <BadgeIcon sx={{ color: "#64748b" }} />
                      <Typography variant="body2">{selectedAgent.department || "Offline Visits"}</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Chip
                      label={getStatusConfig(selectedAgent.status).label}
                      sx={{
                        bgcolor: getStatusConfig(selectedAgent.status).bgColor,
                        color: getStatusConfig(selectedAgent.status).color,
                        fontWeight: 600,
                      }}
                    />
                  </Grid>
                </Grid>
              </Box>

              <Divider />

              {/* Activity Summary */}
              <Box my={3}>
                <Typography variant="h6" fontWeight={700} sx={{ color: "#10b981", mb: 2 }}>
                  Activity Summary
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={4}>
                    <Paper sx={{ p: 2, textAlign: "center", borderRadius: 2, bgcolor: "#f0fdf4" }}>
                      <Typography variant="h4" fontWeight={700} sx={{ color: "#10b981" }}>
                        {getAgentData(selectedAgent.id).visits.length}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Total Visits
                      </Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={4}>
                    <Paper sx={{ p: 2, textAlign: "center", borderRadius: 2, bgcolor: "#fef3c7" }}>
                      <Typography variant="h4" fontWeight={700} sx={{ color: "#d97706" }}>
                        {getAgentData(selectedAgent.id).trips.length}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Total Trips
                      </Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={4}>
                    <Paper sx={{ p: 2, textAlign: "center", borderRadius: 2, bgcolor: "#e0f2fe" }}>
                      <Typography variant="h4" fontWeight={700} sx={{ color: "#0284c7" }}>
                        {getAgentData(selectedAgent.id).calls.length}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Total Calls
                      </Typography>
                    </Paper>
                  </Grid>
                </Grid>
              </Box>

              <Divider />

              {/* Recent Visits */}
              <Box mt={3}>
                <Typography variant="h6" fontWeight={700} sx={{ color: "#10b981", mb: 2 }}>
                  Recent Visits
                </Typography>
                {getAgentData(selectedAgent.id).visits.slice(0, 5).map((visit) => (
                  <Paper
                    key={visit.id}
                    sx={{
                      p: 2,
                      mb: 2,
                      borderRadius: 2,
                      border: "1px solid",
                      borderColor: "divider",
                    }}
                  >
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Box>
                        <Typography variant="body1" fontWeight={600}>
                          {visit.clinicName || visit.clinicCode || "Unknown Clinic"}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {formatTimestamp(visit.createdAt)}
                        </Typography>
                      </Box>
                      <Chip
                        label={visit.visitType || "N/A"}
                        size="small"
                        sx={{ bgcolor: "#dcfce7", color: "#16a34a", fontWeight: 600 }}
                      />
                    </Box>
                  </Paper>
                ))}
                {getAgentData(selectedAgent.id).visits.length === 0 && (
                  <Typography variant="body2" color="text.secondary">
                    No visits recorded
                  </Typography>
                )}
              </Box>
            </DialogContent>

            <DialogActions sx={{ p: 3 }}>
              <Button
                onClick={handleCloseDialog}
                variant="contained"
                sx={{
                  borderRadius: 2,
                  textTransform: "none",
                  bgcolor: "#10b981",
                  "&:hover": { bgcolor: "#059669" },
                }}
              >
                Close
              </Button>
            </DialogActions>
          </>
        )}
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

export default OfflineVisitsManagerDashboard;
