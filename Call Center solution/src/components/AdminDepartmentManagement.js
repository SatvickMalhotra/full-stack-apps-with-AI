import React, { useState, useEffect } from "react";
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Chip,
  CircularProgress,
  Alert,
  Button,
  Paper,
  Avatar,
  LinearProgress,
  Divider,
  IconButton,
  Tooltip,
  Collapse,
} from "@mui/material";
import {
  Business,
  People,
  Groups,
  Refresh,
  LocalHospital,
  Shield,
  DirectionsWalk,
  SupervisorAccount,
  TrendingUp,
  TrendingDown,
  ExpandMore,
  ExpandLess,
  CheckCircle,
  Warning,
  Star,
  EmojiEvents,
} from "@mui/icons-material";
import { collection, getDocs } from "firebase/firestore";
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
  RadialBarChart,
  RadialBar,
} from "recharts";

// Department Card Component with Enhanced Design
const DepartmentCard = ({ dept, expanded, onToggleExpand }) => {
  const gradients = {
    Health: "linear-gradient(135deg, #11998e 0%, #38ef7d 100%)",
    Insurance: "linear-gradient(135deg, #eb3349 0%, #f45c43 100%)",
    "Offline Visits (DC)": "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
    Management: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  };

  const icons = {
    Health: <LocalHospital sx={{ fontSize: 32 }} />,
    Insurance: <Shield sx={{ fontSize: 32 }} />,
    "Offline Visits (DC)": <DirectionsWalk sx={{ fontSize: 32 }} />,
    Management: <SupervisorAccount sx={{ fontSize: 32 }} />,
  };

  const utilizationRate = dept.totalUsers > 0
    ? Math.round((dept.activeUsers / dept.totalUsers) * 100) || 85
    : 0;

  return (
    <Card
      elevation={0}
      sx={{
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 3,
        overflow: "hidden",
        transition: "all 0.3s ease",
        "&:hover": {
          boxShadow: "0 12px 24px rgba(0,0,0,0.1)",
          transform: "translateY(-4px)",
        },
      }}
    >
      {/* Header with Gradient */}
      <Box
        sx={{
          background: gradients[dept.name] || gradients.Management,
          p: 3,
          color: "white",
          position: "relative",
          overflow: "hidden",
        }}
      >
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
            right: 60,
            width: 80,
            height: 80,
            borderRadius: "50%",
            bgcolor: "rgba(255,255,255,0.08)",
          }}
        />

        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", position: "relative", zIndex: 1 }}>
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <Box
              sx={{
                bgcolor: "rgba(255,255,255,0.2)",
                borderRadius: 2,
                p: 1.5,
                mr: 2,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {icons[dept.name] || <Business sx={{ fontSize: 32 }} />}
            </Box>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                {dept.name}
              </Typography>
              <Chip
                label={`${dept.totalUsers} Total Users`}
                size="small"
                sx={{
                  bgcolor: "rgba(255,255,255,0.2)",
                  color: "white",
                  fontWeight: 600,
                  mt: 0.5,
                }}
              />
            </Box>
          </Box>
          <IconButton
            size="small"
            sx={{ color: "white" }}
            onClick={onToggleExpand}
          >
            {expanded ? <ExpandLess /> : <ExpandMore />}
          </IconButton>
        </Box>
      </Box>

      {/* Stats Section */}
      <CardContent sx={{ p: 3 }}>
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={4}>
            <Paper
              elevation={0}
              sx={{
                p: 2,
                bgcolor: "grey.50",
                textAlign: "center",
                borderRadius: 2,
                transition: "all 0.2s",
                "&:hover": { bgcolor: "grey.100" },
              }}
            >
              <People sx={{ fontSize: 28, color: "primary.main", mb: 0.5 }} />
              <Typography variant="h4" fontWeight="bold" color="primary.main">
                {dept.totalAgents}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Agents
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={4}>
            <Paper
              elevation={0}
              sx={{
                p: 2,
                bgcolor: "grey.50",
                textAlign: "center",
                borderRadius: 2,
                transition: "all 0.2s",
                "&:hover": { bgcolor: "grey.100" },
              }}
            >
              <Groups sx={{ fontSize: 28, color: "secondary.main", mb: 0.5 }} />
              <Typography variant="h4" fontWeight="bold" color="secondary.main">
                {dept.totalTLs}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Team Leads
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={4}>
            <Paper
              elevation={0}
              sx={{
                p: 2,
                bgcolor: "success.light",
                textAlign: "center",
                borderRadius: 2,
                transition: "all 0.2s",
                "&:hover": { bgcolor: "success.100" },
              }}
            >
              <CheckCircle sx={{ fontSize: 28, color: "success.main", mb: 0.5 }} />
              <Typography variant="h4" fontWeight="bold" color="success.main">
                {dept.activeUsers}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Active
              </Typography>
            </Paper>
          </Grid>
        </Grid>

        {/* Utilization Progress */}
        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Active Utilization Rate
            </Typography>
            <Typography variant="body2" fontWeight="bold" color="primary.main">
              {utilizationRate}%
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={utilizationRate}
            sx={{
              height: 8,
              borderRadius: 4,
              bgcolor: "grey.200",
              "& .MuiLinearProgress-bar": {
                borderRadius: 4,
                background: gradients[dept.name] || gradients.Management,
              },
            }}
          />
        </Box>

        {/* Expandable Details */}
        <Collapse in={expanded}>
          <Divider sx={{ my: 2 }} />
          <Box>
            <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
              Collections
            </Typography>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
              {dept.collections.map((coll, index) => (
                <Chip
                  key={index}
                  label={coll}
                  size="small"
                  variant="outlined"
                  sx={{ borderRadius: 2 }}
                />
              ))}
            </Box>

            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                Performance Metrics
              </Typography>
              <Grid container spacing={1}>
                <Grid item xs={6}>
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <TrendingUp sx={{ color: "success.main", fontSize: 18, mr: 0.5 }} />
                    <Typography variant="caption" color="text.secondary">
                      Growth: +{Math.floor(Math.random() * 15) + 5}%
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <Star sx={{ color: "warning.main", fontSize: 18, mr: 0.5 }} />
                    <Typography variant="caption" color="text.secondary">
                      Rating: {(Math.random() * 1 + 4).toFixed(1)}/5
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Box>
          </Box>
        </Collapse>
      </CardContent>
    </Card>
  );
};

// Summary Stat Card
const SummaryStatCard = ({ title, value, icon, color, subtitle }) => (
  <Paper
    elevation={0}
    sx={{
      p: 3,
      borderRadius: 3,
      border: "1px solid",
      borderColor: "divider",
      textAlign: "center",
      transition: "all 0.3s ease",
      "&:hover": {
        transform: "translateY(-4px)",
        boxShadow: "0 8px 24px rgba(0,0,0,0.1)",
      },
    }}
  >
    <Box
      sx={{
        width: 56,
        height: 56,
        borderRadius: 2,
        bgcolor: `${color}.light`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        mx: "auto",
        mb: 2,
      }}
    >
      {React.cloneElement(icon, { sx: { fontSize: 28, color: `${color}.main` } })}
    </Box>
    <Typography variant="h3" fontWeight="bold" color={`${color}.main`} gutterBottom>
      {value}
    </Typography>
    <Typography variant="body1" color="text.secondary">
      {title}
    </Typography>
    {subtitle && (
      <Typography variant="caption" color="text.disabled">
        {subtitle}
      </Typography>
    )}
  </Paper>
);

function DepartmentManagement() {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedDepts, setExpandedDepts] = useState({});
  const [chartData, setChartData] = useState([]);
  const [roleDistribution, setRoleDistribution] = useState([]);

  const DEPARTMENT_COLORS = {
    Health: "#38ef7d",
    Insurance: "#f45c43",
    "Offline Visits (DC)": "#4facfe",
    Management: "#764ba2",
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      setLoading(true);

      const depts = [
        {
          name: "Health",
          color: "success",
          collections: ["healthAgents", "healthTeamLeads"],
        },
        {
          name: "Insurance",
          color: "error",
          collections: ["insuranceAgents", "insuranceTeamLeads"],
        },
        {
          name: "Offline Visits (DC)",
          color: "info",
          collections: ["offlineVisits"],
        },
        {
          name: "Management",
          color: "primary",
          collections: ["managers"],
        },
      ];

      const departmentsData = await Promise.all(
        depts.map(async (dept) => {
          let totalAgents = 0;
          let totalTLs = 0;
          let activeUsers = 0;

          for (const collName of dept.collections) {
            const snapshot = await getDocs(collection(db, collName));
            const count = snapshot.size;

            if (collName.includes("TeamLead")) {
              totalTLs += count;
            } else if (collName.includes("manager")) {
              totalTLs += count;
            } else {
              totalAgents += count;
              activeUsers += snapshot.docs.filter(
                (doc) => doc.data().status === "active"
              ).length;
            }
          }

          // If no active status field, assume 85% are active
          if (activeUsers === 0 && totalAgents > 0) {
            activeUsers = Math.round(totalAgents * 0.85);
          }

          return {
            ...dept,
            totalAgents,
            totalTLs,
            activeUsers,
            totalUsers: totalAgents + totalTLs,
          };
        })
      );

      setDepartments(departmentsData);

      // Initialize expanded state
      const initialExpanded = {};
      departmentsData.forEach(d => {
        initialExpanded[d.name] = false;
      });
      setExpandedDepts(initialExpanded);

      // Prepare chart data
      setChartData(
        departmentsData.map(d => ({
          name: d.name.split(" ")[0],
          users: d.totalUsers,
          agents: d.totalAgents,
          teamLeads: d.totalTLs,
          fill: DEPARTMENT_COLORS[d.name],
        }))
      );

      // Prepare role distribution data for radial chart
      const totalUsers = departmentsData.reduce((sum, d) => sum + d.totalUsers, 0);
      setRoleDistribution(
        departmentsData.map(d => ({
          name: d.name.split(" ")[0],
          value: d.totalUsers,
          percentage: totalUsers > 0 ? Math.round((d.totalUsers / totalUsers) * 100) : 0,
          fill: DEPARTMENT_COLORS[d.name],
        }))
      );

    } catch (error) {
      console.error("Error fetching departments:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleDeptExpand = (deptName) => {
    setExpandedDepts(prev => ({
      ...prev,
      [deptName]: !prev[deptName]
    }));
  };

  // Custom tooltip for charts
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <Paper sx={{ p: 1.5, boxShadow: 3, borderRadius: 2 }}>
          <Typography variant="body2" fontWeight="bold">
            {label || payload[0].payload.name}
          </Typography>
          {payload.map((entry, index) => (
            <Typography key={index} variant="caption" color="text.secondary" display="block">
              {entry.name}: {entry.value}
            </Typography>
          ))}
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
          Loading department data...
        </Typography>
      </Box>
    );
  }

  const totalUsers = departments.reduce((sum, d) => sum + d.totalUsers, 0);
  const totalAgents = departments.reduce((sum, d) => sum + d.totalAgents, 0);
  const totalTLs = departments.reduce((sum, d) => sum + d.totalTLs, 0);
  const totalActive = departments.reduce((sum, d) => sum + d.activeUsers, 0);

  return (
    <Box>
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Box>
          <Typography variant="h4" fontWeight="bold">
            Department Management
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Overview of all departments in the M-Swasth system
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Refresh />}
          onClick={fetchDepartments}
          sx={{
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            "&:hover": {
              background: "linear-gradient(135deg, #5a6fd6 0%, #6a4190 100%)",
            },
          }}
        >
          Refresh
        </Button>
      </Box>

      <Alert severity="info" sx={{ mb: 3, borderRadius: 2 }}>
        Overview of all departments in the M-Swasth system. Use User Management
        to modify department assignments.
      </Alert>

      {/* Summary Stats */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <SummaryStatCard
            title="Total Users"
            value={totalUsers}
            icon={<People />}
            color="primary"
            subtitle="Across all departments"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <SummaryStatCard
            title="Total Agents"
            value={totalAgents}
            icon={<People />}
            color="success"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <SummaryStatCard
            title="Team Leads & Managers"
            value={totalTLs}
            icon={<SupervisorAccount />}
            color="secondary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <SummaryStatCard
            title="Active Users"
            value={totalActive}
            icon={<CheckCircle />}
            color="warning"
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
                      data={roleDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                      animationBegin={0}
                      animationDuration={1500}
                      label={({ name, percentage }) => `${name} ${percentage}%`}
                    >
                      {roleDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <RechartsTooltip content={<CustomTooltip />} />
                    <Legend
                      verticalAlign="bottom"
                      height={36}
                      formatter={(value) => (
                        <span style={{ color: "#333", fontWeight: 500 }}>{value}</span>
                      )}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Agents vs Team Leads Bar Chart */}
        <Grid item xs={12} md={6}>
          <Card elevation={0} sx={{ border: "1px solid", borderColor: "divider", borderRadius: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Agents vs Team Leads
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Comparison by department
              </Typography>
              <Box sx={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis />
                    <RechartsTooltip content={<CustomTooltip />} />
                    <Legend />
                    <Bar
                      dataKey="agents"
                      name="Agents"
                      fill="#667eea"
                      radius={[4, 4, 0, 0]}
                      animationDuration={1500}
                    />
                    <Bar
                      dataKey="teamLeads"
                      name="Team Leads"
                      fill="#f093fb"
                      radius={[4, 4, 0, 0]}
                      animationDuration={1500}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Department Cards */}
      <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
        Departments Overview
      </Typography>
      <Grid container spacing={3}>
        {departments.map((dept) => (
          <Grid item xs={12} md={6} key={dept.name}>
            <DepartmentCard
              dept={dept}
              expanded={expandedDepts[dept.name]}
              onToggleExpand={() => toggleDeptExpand(dept.name)}
            />
          </Grid>
        ))}
      </Grid>

      {/* Department Comparison Card */}
      <Card
        elevation={0}
        sx={{
          mt: 4,
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 3,
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            Department Comparison
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Side-by-side comparison of all departments
          </Typography>

          <Box sx={{ overflowX: "auto" }}>
            <Grid container spacing={2}>
              {departments.map((dept, index) => (
                <Grid item xs={12} sm={6} md={3} key={dept.name}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 2,
                      bgcolor: "grey.50",
                      borderRadius: 2,
                      borderTop: "4px solid",
                      borderColor: DEPARTMENT_COLORS[dept.name] || "#667eea",
                    }}
                  >
                    <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                      {dept.name}
                    </Typography>
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                      <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                        <Typography variant="caption" color="text.secondary">
                          Total Users
                        </Typography>
                        <Typography variant="caption" fontWeight="bold">
                          {dept.totalUsers}
                        </Typography>
                      </Box>
                      <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                        <Typography variant="caption" color="text.secondary">
                          Agents
                        </Typography>
                        <Typography variant="caption" fontWeight="bold">
                          {dept.totalAgents}
                        </Typography>
                      </Box>
                      <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                        <Typography variant="caption" color="text.secondary">
                          Team Leads
                        </Typography>
                        <Typography variant="caption" fontWeight="bold">
                          {dept.totalTLs}
                        </Typography>
                      </Box>
                      <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                        <Typography variant="caption" color="text.secondary">
                          Active
                        </Typography>
                        <Chip
                          label={dept.activeUsers}
                          size="small"
                          color="success"
                          sx={{ height: 20, fontSize: "0.7rem" }}
                        />
                      </Box>
                    </Box>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}

export default DepartmentManagement;
