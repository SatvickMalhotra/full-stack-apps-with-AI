import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Button,
  IconButton,
  Tooltip,
  LinearProgress,
  Divider,
  Paper,
  useTheme,
} from "@mui/material";
import {
  People,
  Groups,
  Business,
  PersonAdd,
  TrendingUp,
  Refresh,
  ArrowUpward,
  ArrowDownward,
  AccessTime,
  CheckCircle,
  Warning,
  Speed,
  Storage,
  CloudDone,
  MoreVert,
  LocalHospital,
  Shield,
  DirectionsWalk,
  SupervisorAccount,
} from "@mui/icons-material";
import { collection, getDocs, query, orderBy, limit, where } from "firebase/firestore";
import { db } from "../firebaseConfig";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  AreaChart,
  Area,
} from "recharts";

// Animated counter hook
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

// Animated Stat Card Component
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
          <Box
            sx={{
              bgcolor: "rgba(255,255,255,0.2)",
              borderRadius: 2,
              p: 1.5,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {icon}
          </Box>
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

// System Health Card
const SystemHealthCard = ({ status, uptime, lastSync }) => {
  const isHealthy = status === "healthy";

  return (
    <Card elevation={0} sx={{ border: "1px solid", borderColor: "divider", borderRadius: 3, height: "100%" }}>
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
          <Speed sx={{ fontSize: 28, color: isHealthy ? "success.main" : "warning.main", mr: 1.5 }} />
          <Typography variant="h6" fontWeight="bold">
            System Health
          </Typography>
        </Box>

        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
            <CheckCircle sx={{ fontSize: 20, color: "success.main", mr: 1 }} />
            <Typography variant="body2">Firebase Connection</Typography>
            <Chip label="Active" size="small" color="success" sx={{ ml: "auto" }} />
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
            <Storage sx={{ fontSize: 20, color: "info.main", mr: 1 }} />
            <Typography variant="body2">Database Status</Typography>
            <Chip label="Online" size="small" color="info" sx={{ ml: "auto" }} />
          </Box>
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <CloudDone sx={{ fontSize: 20, color: "primary.main", mr: 1 }} />
            <Typography variant="body2">Cloud Functions</Typography>
            <Chip label="Running" size="small" color="primary" sx={{ ml: "auto" }} />
          </Box>
        </Box>

        <Divider sx={{ my: 2 }} />

        <Box>
          <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
            System Uptime
          </Typography>
          <LinearProgress
            variant="determinate"
            value={uptime}
            sx={{
              height: 8,
              borderRadius: 4,
              bgcolor: "grey.200",
              "& .MuiLinearProgress-bar": {
                borderRadius: 4,
                background: "linear-gradient(90deg, #667eea 0%, #764ba2 100%)",
              },
            }}
          />
          <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: "block" }}>
            {uptime}% - Last sync: {lastSync}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

// Quick Actions Card
const QuickActionsCard = ({ onRefresh, onAddUser, onManageTeams, onViewReports, onDepartmentSettings }) => {
  const actions = [
    { label: "Add New User", icon: <PersonAdd />, color: "#667eea", onClick: onAddUser },
    { label: "View Reports", icon: <TrendingUp />, color: "#764ba2", onClick: onViewReports },
    { label: "Manage Teams", icon: <Groups />, color: "#f093fb", onClick: onManageTeams },
    { label: "Department Settings", icon: <Business />, color: "#f5576c", onClick: onDepartmentSettings },
  ];

  return (
    <Card elevation={0} sx={{ border: "1px solid", borderColor: "divider", borderRadius: 3, height: "100%" }}>
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 3 }}>
          <Typography variant="h6" fontWeight="bold">
            Quick Actions
          </Typography>
          <Tooltip title="Refresh Data">
            <IconButton size="small" onClick={onRefresh}>
              <Refresh />
            </IconButton>
          </Tooltip>
        </Box>

        <Grid container spacing={2}>
          {actions.map((action, index) => (
            <Grid item xs={6} key={index}>
              <Button
                fullWidth
                variant="outlined"
                onClick={action.onClick}
                sx={{
                  py: 2,
                  borderRadius: 2,
                  display: "flex",
                  flexDirection: "column",
                  borderColor: "divider",
                  color: action.color,
                  transition: "all 0.2s ease",
                  "&:hover": {
                    borderColor: action.color,
                    bgcolor: `${action.color}10`,
                    transform: "translateY(-2px)",
                  },
                }}
              >
                <Box sx={{ color: action.color, mb: 0.5 }}>{action.icon}</Box>
                <Typography variant="caption" sx={{ color: "text.primary", fontWeight: 500 }}>
                  {action.label}
                </Typography>
              </Button>
            </Grid>
          ))}
        </Grid>
      </CardContent>
    </Card>
  );
};

// Recent Activity Card
const RecentActivityCard = ({ activities, onRefresh, loading }) => (
  <Card elevation={0} sx={{ border: "1px solid", borderColor: "divider", borderRadius: 3 }}>
    <CardContent sx={{ p: 3 }}>
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
        <Typography variant="h6" fontWeight="bold">
          Recent Activity
        </Typography>
        <Tooltip title="Refresh Activities">
          <IconButton size="small" onClick={onRefresh} disabled={loading}>
            <Refresh sx={{ animation: loading ? "spin 1s linear infinite" : "none", "@keyframes spin": { "0%": { transform: "rotate(0deg)" }, "100%": { transform: "rotate(360deg)" } } }} />
          </IconButton>
        </Tooltip>
      </Box>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
          <CircularProgress size={30} />
        </Box>
      ) : activities.length === 0 ? (
        <Box sx={{ textAlign: "center", py: 4 }}>
          <Typography variant="body2" color="text.secondary">
            No recent activity found
          </Typography>
        </Box>
      ) : (
        <List sx={{ p: 0 }}>
          {activities.map((activity, index) => (
            <ListItem
              key={index}
              sx={{
                px: 0,
                py: 1.5,
                borderBottom: index < activities.length - 1 ? "1px solid" : "none",
                borderColor: "divider",
              }}
            >
              <ListItemAvatar>
                <Avatar
                  sx={{
                    bgcolor: activity.color + ".light",
                    color: activity.color + ".main",
                    width: 40,
                    height: 40,
                  }}
                >
                  {activity.icon}
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={
                  <Typography variant="body2" fontWeight={600}>
                    {activity.title}
                  </Typography>
                }
                secondary={
                  <Box sx={{ display: "flex", alignItems: "center", mt: 0.5 }}>
                    <AccessTime sx={{ fontSize: 14, mr: 0.5, color: "text.disabled" }} />
                    <Typography variant="caption" color="text.secondary">
                      {activity.time}
                    </Typography>
                  </Box>
                }
              />
            </ListItem>
          ))}
        </List>
      )}
    </CardContent>
  </Card>
);

function AdminOverview({ onAddUser, onManageTeams, onViewReports, onDepartmentSettings }) {
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [activitiesLoading, setActivitiesLoading] = useState(false);
  const [stats, setStats] = useState({
    totalHealthAgents: 0,
    totalHealthTLs: 0,
    totalOfflineVisits: 0,
    totalInsuranceAgents: 0,
    totalInsuranceTLs: 0,
    totalManagers: 0,
    activeUsers: 0,
    totalUsers: 0,
  });
  const [departmentData, setDepartmentData] = useState([]);
  const [roleData, setRoleData] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);

  const COLORS = ["#667eea", "#764ba2", "#f093fb", "#f5576c", "#4facfe", "#00f2fe"];
  const DEPARTMENT_COLORS = {
    Health: "#4caf50",
    Insurance: "#f44336",
    "Offline Visits": "#2196f3",
    Management: "#9c27b0",
  };

  useEffect(() => {
    fetchStatistics();
    fetchRecentActivities();
  }, []);

  const fetchStatistics = async () => {
    try {
      setLoading(true);

      // Fetch Health Agents
      const healthAgentsSnap = await getDocs(collection(db, "healthAgents"));
      const healthAgentsCount = healthAgentsSnap.size;
      const activeHealthAgents = healthAgentsSnap.docs.filter(
        (doc) => doc.data().status === "active"
      ).length;

      // Fetch Health TLs
      const healthTLsSnap = await getDocs(collection(db, "healthTeamLeads"));
      const healthTLsCount = healthTLsSnap.size;

      // Fetch Offline Visits (DC Agents)
      const offlineVisitsSnap = await getDocs(collection(db, "offlineVisits"));
      const offlineVisitsCount = offlineVisitsSnap.size;

      // Fetch Insurance Agents
      const insuranceAgentsSnap = await getDocs(collection(db, "insuranceAgents"));
      const insuranceAgentsCount = insuranceAgentsSnap.size;

      // Fetch Insurance TLs
      const insuranceTLsSnap = await getDocs(collection(db, "insuranceTeamLeads"));
      const insuranceTLsCount = insuranceTLsSnap.size;

      // Fetch Managers
      const managersSnap = await getDocs(collection(db, "managers"));
      const managersCount = managersSnap.size;

      const totalUsers =
        healthAgentsCount +
        healthTLsCount +
        offlineVisitsCount +
        insuranceAgentsCount +
        insuranceTLsCount +
        managersCount;

      setStats({
        totalHealthAgents: healthAgentsCount,
        totalHealthTLs: healthTLsCount,
        totalOfflineVisits: offlineVisitsCount,
        totalInsuranceAgents: insuranceAgentsCount,
        totalInsuranceTLs: insuranceTLsCount,
        totalManagers: managersCount,
        activeUsers: activeHealthAgents,
        totalUsers,
      });

      // Department distribution data for pie chart
      setDepartmentData([
        { name: "Health", value: healthAgentsCount + healthTLsCount, color: DEPARTMENT_COLORS.Health },
        { name: "Insurance", value: insuranceAgentsCount + insuranceTLsCount, color: DEPARTMENT_COLORS.Insurance },
        { name: "Offline Visits", value: offlineVisitsCount, color: DEPARTMENT_COLORS["Offline Visits"] },
        { name: "Management", value: managersCount, color: DEPARTMENT_COLORS.Management },
      ]);

      // Role distribution data for bar chart
      setRoleData([
        { name: "Health Agents", count: healthAgentsCount, fill: "#4caf50" },
        { name: "Health TLs", count: healthTLsCount, fill: "#81c784" },
        { name: "Insurance Agents", count: insuranceAgentsCount, fill: "#f44336" },
        { name: "Insurance TLs", count: insuranceTLsCount, fill: "#ef9a9a" },
        { name: "DC Agents", count: offlineVisitsCount, fill: "#2196f3" },
        { name: "Managers", count: managersCount, fill: "#9c27b0" },
      ]);

    } catch (error) {
      console.error("Error fetching statistics:", error);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to format relative time
  const formatRelativeTime = (dateString) => {
    if (!dateString) return "Unknown time";

    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? "s" : ""} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
    return date.toLocaleDateString();
  };

  // Fetch real recent activities from user collections
  const fetchRecentActivities = async () => {
    try {
      setActivitiesLoading(true);
      const activities = [];

      const collections = [
        { name: "healthAgents", label: "Health Agent", icon: <LocalHospital fontSize="small" />, color: "success" },
        { name: "healthTeamLeads", label: "Health TL", icon: <SupervisorAccount fontSize="small" />, color: "success" },
        { name: "insuranceAgents", label: "Insurance Agent", icon: <Shield fontSize="small" />, color: "error" },
        { name: "insuranceTeamLeads", label: "Insurance TL", icon: <SupervisorAccount fontSize="small" />, color: "error" },
        { name: "offlineVisits", label: "DC Agent", icon: <DirectionsWalk fontSize="small" />, color: "info" },
        { name: "managers", label: "Manager", icon: <Business fontSize="small" />, color: "secondary" },
      ];

      for (const coll of collections) {
        const snapshot = await getDocs(collection(db, coll.name));
        snapshot.docs.forEach((doc) => {
          const data = doc.data();

          // Check for createdAt timestamp
          if (data.createdAt) {
            activities.push({
              title: `New ${coll.label} added: ${data.name || "Unknown"}`,
              time: formatRelativeTime(data.createdAt),
              timestamp: new Date(data.createdAt).getTime(),
              icon: coll.icon,
              color: coll.color,
              type: "created",
            });
          }

          // Check for updatedAt timestamp (only if different from createdAt)
          if (data.updatedAt && data.updatedAt !== data.createdAt) {
            activities.push({
              title: `${coll.label} updated: ${data.name || "Unknown"}`,
              time: formatRelativeTime(data.updatedAt),
              timestamp: new Date(data.updatedAt).getTime(),
              icon: <People fontSize="small" />,
              color: "primary",
              type: "updated",
            });
          }
        });
      }

      // Sort by timestamp (most recent first) and take top 10
      activities.sort((a, b) => b.timestamp - a.timestamp);
      const recentOnly = activities.slice(0, 10);

      setRecentActivities(recentOnly);
    } catch (error) {
      console.error("Error fetching recent activities:", error);
      setRecentActivities([]);
    } finally {
      setActivitiesLoading(false);
    }
  };

  // Custom tooltip for pie chart
  const CustomPieTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <Paper sx={{ p: 1.5, boxShadow: 3 }}>
          <Typography variant="body2" fontWeight="bold">
            {payload[0].name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {payload[0].value} users ({((payload[0].value / stats.totalUsers) * 100).toFixed(1)}%)
          </Typography>
        </Paper>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          minHeight: 400,
        }}
      >
        <CircularProgress size={60} sx={{ color: "#667eea" }} />
        <Typography variant="body1" sx={{ mt: 2, color: "text.secondary" }}>
          Loading dashboard data...
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          System Overview
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Real-time statistics and insights for M-Swasth system
        </Typography>
      </Box>

      {/* Main Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <AnimatedStatCard
            title="Total Users"
            value={stats.totalUsers}
            icon={<People sx={{ fontSize: 32 }} />}
            gradient="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
            trend="up"
            trendValue="+12% this month"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <AnimatedStatCard
            title="Health Department"
            value={stats.totalHealthAgents + stats.totalHealthTLs}
            icon={<LocalHospital sx={{ fontSize: 32 }} />}
            gradient="linear-gradient(135deg, #11998e 0%, #38ef7d 100%)"
            subtitle={`${stats.activeUsers} Active Agents`}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <AnimatedStatCard
            title="Insurance Department"
            value={stats.totalInsuranceAgents + stats.totalInsuranceTLs}
            icon={<Shield sx={{ fontSize: 32 }} />}
            gradient="linear-gradient(135deg, #eb3349 0%, #f45c43 100%)"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <AnimatedStatCard
            title="DC Agents"
            value={stats.totalOfflineVisits}
            icon={<DirectionsWalk sx={{ fontSize: 32 }} />}
            gradient="linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)"
          />
        </Grid>
      </Grid>

      {/* Secondary Stats Row */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={4}>
          <AnimatedStatCard
            title="Health Team Leads"
            value={stats.totalHealthTLs}
            icon={<SupervisorAccount sx={{ fontSize: 28 }} />}
            gradient="linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <AnimatedStatCard
            title="Insurance Team Leads"
            value={stats.totalInsuranceTLs}
            icon={<SupervisorAccount sx={{ fontSize: 28 }} />}
            gradient="linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <AnimatedStatCard
            title="Managers"
            value={stats.totalManagers}
            icon={<Business sx={{ fontSize: 28 }} />}
            gradient="linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)"
          />
        </Grid>
      </Grid>

      {/* Charts Row */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Department Distribution Pie Chart */}
        <Grid item xs={12} md={6}>
          <Card elevation={0} sx={{ border: "1px solid", borderColor: "divider", borderRadius: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Department Distribution
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                User distribution across departments
              </Typography>
              <Box sx={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={departmentData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                      animationBegin={0}
                      animationDuration={1500}
                    >
                      {departmentData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <RechartsTooltip content={<CustomPieTooltip />} />
                    <Legend
                      verticalAlign="bottom"
                      height={36}
                      formatter={(value, entry) => (
                        <span style={{ color: "#333", fontWeight: 500 }}>{value}</span>
                      )}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Role Distribution Bar Chart */}
        <Grid item xs={12} md={6}>
          <Card elevation={0} sx={{ border: "1px solid", borderColor: "divider", borderRadius: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Role Distribution
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                User count by role type
              </Typography>
              <Box sx={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={roleData} layout="vertical" margin={{ left: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 12 }} />
                    <RechartsTooltip
                      contentStyle={{
                        borderRadius: 8,
                        border: "none",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                      }}
                    />
                    <Bar
                      dataKey="count"
                      radius={[0, 4, 4, 0]}
                      animationBegin={0}
                      animationDuration={1500}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Bottom Row - System Health, Quick Actions, Recent Activity */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <SystemHealthCard status="healthy" uptime={99.9} lastSync="Just now" />
        </Grid>
        <Grid item xs={12} md={4}>
          <QuickActionsCard
            onRefresh={fetchStatistics}
            onAddUser={onAddUser}
            onManageTeams={onManageTeams}
            onViewReports={onViewReports}
            onDepartmentSettings={onDepartmentSettings}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <RecentActivityCard
            activities={recentActivities}
            onRefresh={fetchRecentActivities}
            loading={activitiesLoading}
          />
        </Grid>
      </Grid>
    </Box>
  );
}

export default AdminOverview;
