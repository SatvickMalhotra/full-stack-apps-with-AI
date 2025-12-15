import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Alert,
  Tooltip,
  InputAdornment,
  Grid,
  CircularProgress,
  TablePagination,
  Card,
  CardContent,
  Avatar,
  Tabs,
  Tab,
  Badge,
  Divider,
  LinearProgress,
  Collapse,
  Switch,
  FormControlLabel,
} from "@mui/material";
import {
  Add,
  Edit,
  Delete,
  Visibility,
  Search,
  Refresh,
  People,
  PersonAdd,
  LocalHospital,
  Shield,
  DirectionsWalk,
  SupervisorAccount,
  CheckCircle,
  Cancel,
  Email,
  Phone,
  Lock,
  Badge as BadgeIcon,
  Business,
  TrendingUp,
  FilterList,
  ExpandMore,
  ExpandLess,
  Download,
  Upload,
  Warning,
} from "@mui/icons-material";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  addDoc,
  setDoc,
} from "firebase/firestore";
import { db, functions, auth } from "../firebaseConfig";
import { httpsCallable } from "firebase/functions";
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
} from "recharts";

// Stats Card Component
const StatsCard = ({ title, value, icon, gradient, subtitle, trend }) => (
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
        transform: "translateY(-4px)",
        boxShadow: "0 12px 24px rgba(0,0,0,0.15)",
      },
    }}
  >
    <CardContent sx={{ p: 2.5, position: "relative", zIndex: 1 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Box>
          <Typography variant="body2" sx={{ opacity: 0.9, mb: 0.5 }}>
            {title}
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            {value}
          </Typography>
          {subtitle && (
            <Typography variant="caption" sx={{ opacity: 0.8 }}>
              {subtitle}
            </Typography>
          )}
        </Box>
        <Box
          sx={{
            bgcolor: "rgba(255,255,255,0.2)",
            borderRadius: 2,
            p: 1.5,
          }}
        >
          {icon}
        </Box>
      </Box>
    </CardContent>
    <Box
      sx={{
        position: "absolute",
        top: -20,
        right: -20,
        width: 80,
        height: 80,
        borderRadius: "50%",
        bgcolor: "rgba(255,255,255,0.1)",
      }}
    />
  </Card>
);

// User Card Component for Grid View
const UserCard = ({ user, onView, onEdit, onDelete, getRoleColor, getDepartmentColor }) => (
  <Card
    elevation={0}
    sx={{
      border: "1px solid",
      borderColor: "divider",
      borderRadius: 3,
      transition: "all 0.3s ease",
      "&:hover": {
        boxShadow: "0 8px 24px rgba(0,0,0,0.1)",
        transform: "translateY(-2px)",
      },
    }}
  >
    <CardContent sx={{ p: 2.5 }}>
      <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
        <Avatar
          sx={{
            width: 48,
            height: 48,
            mr: 2,
            bgcolor: getDepartmentColor(user.department) + ".light",
            color: getDepartmentColor(user.department) + ".main",
            fontWeight: "bold",
          }}
        >
          {user.name?.charAt(0) || "U"}
        </Avatar>
        <Box sx={{ flexGrow: 1, minWidth: 0 }}>
          <Typography variant="subtitle1" fontWeight="bold" noWrap>
            {user.name}
          </Typography>
          <Typography variant="caption" color="text.secondary" noWrap>
            {user.empId || user.id}
          </Typography>
        </Box>
        <Chip
          label={user.status === "active" ? "Active" : "Inactive"}
          size="small"
          color={user.status === "active" ? "success" : "error"}
          sx={{ height: 22 }}
        />
      </Box>

      <Divider sx={{ my: 1.5 }} />

      <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <Email sx={{ fontSize: 16, color: "text.secondary", mr: 1 }} />
          <Typography variant="caption" color="text.secondary" noWrap>
            {user.email}
          </Typography>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <Phone sx={{ fontSize: 16, color: "text.secondary", mr: 1 }} />
          <Typography variant="caption" color="text.secondary">
            {user.mobile || "N/A"}
          </Typography>
        </Box>
      </Box>

      <Box sx={{ display: "flex", gap: 1, mt: 2, flexWrap: "wrap" }}>
        <Chip
          label={user.role}
          size="small"
          color={getRoleColor(user.role)}
          variant="outlined"
          sx={{ borderRadius: 2 }}
        />
        <Chip
          label={user.department}
          size="small"
          sx={{
            borderRadius: 2,
            bgcolor: getDepartmentColor(user.department) + ".light",
            color: getDepartmentColor(user.department) + ".main",
          }}
        />
      </Box>

      <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2, gap: 0.5 }}>
        <Tooltip title="View Details">
          <IconButton size="small" onClick={() => onView(user)}>
            <Visibility fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Edit User">
          <IconButton size="small" color="primary" onClick={() => onEdit(user)}>
            <Edit fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Delete User">
          <IconButton size="small" color="error" onClick={() => onDelete(user)}>
            <Delete fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>
    </CardContent>
  </Card>
);

function UserManagement({ triggerAddUser, onAddUserTriggered }) {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterDepartment, setFilterDepartment] = useState("all");
  const [filterRole, setFilterRole] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [viewMode, setViewMode] = useState("table"); // 'table' or 'grid'
  const [showFilters, setShowFilters] = useState(true);

  // Team Leads and Managers lists for dropdowns
  const [teamLeadsList, setTeamLeadsList] = useState([]);
  const [managersList, setManagersList] = useState([]);

  // Statistics
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    health: 0,
    insurance: 0,
    dc: 0,
    managers: 0,
  });

  // Chart data
  const [departmentChartData, setDepartmentChartData] = useState([]);
  const [roleChartData, setRoleChartData] = useState([]);

  // Dialog states
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openViewDialog, setOpenViewDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // Pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Form states
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobile: "",
    empId: "",
    role: "",
    department: "",
    designation: "",
    status: "active",
    teamLead: "",
    teamLeadId: "",
    manager: "",
    managerId: "",
  });

  const DEPARTMENT_COLORS = {
    Health: "#4caf50",
    Insurance: "#f44336",
    "Offline Visits": "#2196f3",
    Management: "#9c27b0",
  };

  useEffect(() => {
    fetchAllUsers();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [users, searchQuery, filterDepartment, filterRole, filterStatus]);

  // Handle trigger from Overview Quick Actions to open Add User dialog
  useEffect(() => {
    if (triggerAddUser) {
      setOpenAddDialog(true);
      if (onAddUserTriggered) {
        onAddUserTriggered();
      }
    }
  }, [triggerAddUser, onAddUserTriggered]);

  const fetchAllUsers = async () => {
    try {
      setLoading(true);
      const allUsers = [];
      const teamLeads = [];
      const managers = [];

      const collections = [
        { name: "healthAgents", role: "Health Agent", department: "Health" },
        { name: "healthTeamLeads", role: "Health TL", department: "Health" },
        { name: "insuranceAgents", role: "Insurance Agent", department: "Insurance" },
        { name: "insuranceTeamLeads", role: "Insurance TL", department: "Insurance" },
        { name: "offlineVisits", role: "DC Agent", department: "Offline Visits" },
        { name: "managers", role: "Manager", department: "Management" },
      ];

      for (const coll of collections) {
        const snapshot = await getDocs(collection(db, coll.name));
        snapshot.docs.forEach((doc) => {
          const data = doc.data();
          const userData = {
            id: doc.id,
            ...data,
            role: data.role || coll.role,
            department: data.department || coll.department,
            collectionName: coll.name,
          };
          allUsers.push(userData);

          // Collect team leads for dropdown
          if (coll.name === "healthTeamLeads" || coll.name === "insuranceTeamLeads") {
            teamLeads.push({
              id: doc.id,
              uid: data.uid || doc.id,
              name: data.name,
              department: data.department || coll.department,
              collectionName: coll.name,
            });
          }

          // Collect managers for dropdown
          if (coll.name === "managers") {
            managers.push({
              id: doc.id,
              uid: data.uid || doc.id,
              name: data.name,
              department: data.department || "Management",
              collectionName: coll.name,
            });
          }
        });
      }

      setUsers(allUsers);
      setFilteredUsers(allUsers);
      setTeamLeadsList(teamLeads);
      setManagersList(managers);

      // Calculate statistics
      const activeCount = allUsers.filter((u) => u.status === "active" || !u.status).length;
      const healthCount = allUsers.filter((u) => u.department === "Health").length;
      const insuranceCount = allUsers.filter((u) => u.department === "Insurance").length;
      const dcCount = allUsers.filter((u) => u.department === "Offline Visits").length;
      const managersCount = allUsers.filter((u) => u.department === "Management").length;

      setStats({
        total: allUsers.length,
        active: activeCount,
        inactive: allUsers.length - activeCount,
        health: healthCount,
        insurance: insuranceCount,
        dc: dcCount,
        managers: managersCount,
      });

      // Prepare chart data
      setDepartmentChartData([
        { name: "Health", value: healthCount, fill: DEPARTMENT_COLORS.Health },
        { name: "Insurance", value: insuranceCount, fill: DEPARTMENT_COLORS.Insurance },
        { name: "DC", value: dcCount, fill: DEPARTMENT_COLORS["Offline Visits"] },
        { name: "Management", value: managersCount, fill: DEPARTMENT_COLORS.Management },
      ]);

      // Role distribution
      const roleCounts = {};
      allUsers.forEach((u) => {
        roleCounts[u.role] = (roleCounts[u.role] || 0) + 1;
      });
      setRoleChartData(
        Object.entries(roleCounts).map(([role, count]) => ({
          name: role.replace(" Agent", "").replace(" TL", " Lead"),
          count,
        }))
      );
    } catch (error) {
      console.error("Error fetching users:", error);
      setErrorMessage("Failed to fetch users. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...users];

    if (searchQuery) {
      filtered = filtered.filter(
        (user) =>
          user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.empId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.mobile?.includes(searchQuery)
      );
    }

    if (filterDepartment !== "all") {
      filtered = filtered.filter((user) => user.department === filterDepartment);
    }

    if (filterRole !== "all") {
      filtered = filtered.filter((user) => user.role === filterRole);
    }

    if (filterStatus !== "all") {
      filtered = filtered.filter((user) => {
        const userStatus = user.status || "active";
        return userStatus === filterStatus;
      });
    }

    setFilteredUsers(filtered);
    setPage(0);
  };

  const handleAddUser = async () => {
    try {
      setErrorMessage("");
      setSuccessMessage("");

      // Validate required fields
      if (!formData.name || !formData.email || !formData.password || !formData.role) {
        setErrorMessage("Please fill in all required fields (name, email, password, role)");
        return;
      }

      // Map display role to Firestore collection
      const roleToCollectionMap = {
        "Health Agent": "healthAgents",
        "Insurance Agent": "insuranceAgents",
        "Health TL": "healthTeamLeads",
        "Insurance TL": "insuranceTeamLeads",
        "Health Manager": "healthManagers",
        "Insurance Manager": "insuranceManagers",
        "Department Manager": "managers",
        "DC Agent": "offlineVisits",
        "Offline Visits": "offlineVisits",
        "Offline Visits Manager": "offlineVisitsManagers",
      };

      const collectionName = roleToCollectionMap[formData.role];

      if (!collectionName) {
        setErrorMessage("Invalid role selected");
        return;
      }

      // Force token refresh to get updated custom claims (admin role)
      const currentUser = auth.currentUser;
      if (!currentUser) {
        setErrorMessage("You must be logged in to perform this action");
        return;
      }

      console.log("Current user:", currentUser.email, currentUser.uid);
      const token = await currentUser.getIdToken(true); // Force refresh with true parameter
      console.log("Token refreshed successfully");

      // Get and log token claims
      const idTokenResult = await currentUser.getIdTokenResult();
      console.log("Token claims:", idTokenResult.claims);

      // Call Cloud Function to create user with auth
      const createUserFunction = httpsCallable(functions, 'createUser');
      const result = await createUserFunction({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        mobile: formData.mobile,
        empId: formData.empId,
        role: formData.role,
        department: formData.department,
        status: formData.status || "Available",
        collection: collectionName,
        teamLead: formData.teamLeadId || "",
        manager: formData.managerId || "",
      });

      setSuccessMessage(`User ${formData.name} created successfully! They can now log in with their email and password.`);
      setOpenAddDialog(false);
      resetForm();
      fetchAllUsers();
    } catch (error) {
      console.error("Error adding user:", error);
      setErrorMessage(`Failed to add user: ${error.message || error.code}`);
    }
  };

  const handleEditUser = async () => {
    try {
      setErrorMessage("");
      setSuccessMessage("");

      if (!selectedUser) return;

      const userRef = doc(db, selectedUser.collectionName, selectedUser.id);
      const updateData = {
        name: formData.name,
        mobile: formData.mobile,
        department: formData.department,
        designation: formData.designation,
        status: formData.status,
        // Save both team lead name and ID
        teamLead: formData.teamLead || "",
        teamLeadId: formData.teamLeadId || "",
        teamLeadName: formData.teamLead || "",
        // Save both manager name and ID
        manager: formData.manager || "",
        managerId: formData.managerId || "",
        managerName: formData.manager || "",
        updatedAt: new Date().toISOString(),
        updatedBy: "admin",
      };

      await updateDoc(userRef, updateData);

      setSuccessMessage(`User ${formData.name} updated successfully!`);
      setOpenEditDialog(false);
      setSelectedUser(null);
      resetForm();
      fetchAllUsers();
    } catch (error) {
      console.error("Error updating user:", error);
      setErrorMessage(`Failed to update user: ${error.message}`);
    }
  };

  const handleDeleteUser = async () => {
    try {
      setErrorMessage("");
      setSuccessMessage("");

      if (!selectedUser) return;

      const userRef = doc(db, selectedUser.collectionName, selectedUser.id);
      await deleteDoc(userRef);

      setSuccessMessage(`User ${selectedUser.name} deleted successfully!`);
      setOpenDeleteDialog(false);
      setSelectedUser(null);
      fetchAllUsers();
    } catch (error) {
      console.error("Error deleting user:", error);
      setErrorMessage(`Failed to delete user: ${error.message}`);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      password: "",
      mobile: "",
      empId: "",
      role: "",
      department: "",
      designation: "",
      status: "active",
      teamLead: "",
      teamLeadId: "",
      manager: "",
      managerId: "",
    });
  };

  // Helper function to get team lead name from ID
  const getTeamLeadName = (user) => {
    // Check various possible field names for team lead
    if (user.teamLeadName) return user.teamLeadName;
    if (user.teamLead && typeof user.teamLead === "string" && user.teamLead.length > 5) {
      // If teamLead looks like a name (not an ID), return it
      if (!user.teamLead.includes("@") && !/^[a-zA-Z0-9]{20,}$/.test(user.teamLead)) {
        return user.teamLead;
      }
    }

    // Look up team lead by ID
    const tlId = user.teamLeadId || user.teamLead;
    if (tlId) {
      const tl = teamLeadsList.find(t => t.id === tlId || t.uid === tlId);
      if (tl) return tl.name;
    }

    return "";
  };

  // Helper function to get manager name from ID
  const getManagerName = (user) => {
    if (user.managerName) return user.managerName;
    if (user.manager && typeof user.manager === "string" && user.manager.length > 5) {
      if (!user.manager.includes("@") && !/^[a-zA-Z0-9]{20,}$/.test(user.manager)) {
        return user.manager;
      }
    }

    const managerId = user.managerId || user.manager;
    if (managerId) {
      const mgr = managersList.find(m => m.id === managerId || m.uid === managerId);
      if (mgr) return mgr.name;
    }

    return "";
  };

  const openEdit = (user) => {
    setSelectedUser(user);

    // Resolve team lead info
    const teamLeadName = getTeamLeadName(user);
    const teamLeadId = user.teamLeadId || user.teamLead || "";

    // Resolve manager info
    const managerName = getManagerName(user);
    const managerId = user.managerId || user.manager || "";

    setFormData({
      name: user.name || "",
      email: user.email || "",
      mobile: user.mobile || "",
      empId: user.empId || "",
      role: user.role || "",
      department: user.department || "",
      designation: user.designation || "",
      status: user.status || "active",
      teamLead: teamLeadName,
      teamLeadId: teamLeadId,
      manager: managerName,
      managerId: managerId,
    });
    setOpenEditDialog(true);
  };

  const openDelete = (user) => {
    setSelectedUser(user);
    setOpenDeleteDialog(true);
  };

  const openView = (user) => {
    setSelectedUser(user);
    setOpenViewDialog(true);
  };

  const getRoleColor = (role) => {
    if (role?.includes("Agent")) return "primary";
    if (role?.includes("TL")) return "secondary";
    if (role?.includes("Manager")) return "success";
    return "default";
  };

  const getDepartmentColor = (department) => {
    switch (department) {
      case "Health":
        return "success";
      case "Insurance":
        return "error";
      case "Offline Visits":
        return "info";
      case "Management":
        return "secondary";
      default:
        return "primary";
    }
  };

  const getStatusColor = (status) => {
    if (status === "active" || !status) return "success";
    if (status === "inactive") return "error";
    return "default";
  };

  // Custom tooltip for charts
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <Paper sx={{ p: 1.5, boxShadow: 3, borderRadius: 2 }}>
          <Typography variant="body2" fontWeight="bold">
            {payload[0].name || payload[0].payload.name}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {payload[0].value || payload[0].payload.count} users
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
          Loading user data...
        </Typography>
      </Box>
    );
  }

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
            User Management
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage all users across departments
          </Typography>
        </Box>
        <Box sx={{ display: "flex", gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={fetchAllUsers}
            sx={{ borderRadius: 2 }}
          >
            Refresh
          </Button>
          <Button
            variant="contained"
            startIcon={<PersonAdd />}
            onClick={() => {
              resetForm();
              setOpenAddDialog(true);
            }}
            sx={{
              borderRadius: 2,
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              "&:hover": {
                background: "linear-gradient(135deg, #5a6fd6 0%, #6a4190 100%)",
              },
            }}
          >
            Add User
          </Button>
        </Box>
      </Box>

      {/* Alerts */}
      {successMessage && (
        <Alert
          severity="success"
          onClose={() => setSuccessMessage("")}
          sx={{ mb: 2, borderRadius: 2 }}
        >
          {successMessage}
        </Alert>
      )}
      {errorMessage && (
        <Alert
          severity="error"
          onClose={() => setErrorMessage("")}
          sx={{ mb: 2, borderRadius: 2 }}
        >
          {errorMessage}
        </Alert>
      )}

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            title="Total Users"
            value={stats.total}
            icon={<People sx={{ fontSize: 28 }} />}
            gradient="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
            subtitle={`${stats.active} active`}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            title="Health Department"
            value={stats.health}
            icon={<LocalHospital sx={{ fontSize: 28 }} />}
            gradient="linear-gradient(135deg, #11998e 0%, #38ef7d 100%)"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            title="Insurance Department"
            value={stats.insurance}
            icon={<Shield sx={{ fontSize: 28 }} />}
            gradient="linear-gradient(135deg, #eb3349 0%, #f45c43 100%)"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard
            title="DC Agents"
            value={stats.dc}
            icon={<DirectionsWalk sx={{ fontSize: 28 }} />}
            gradient="linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)"
          />
        </Grid>
      </Grid>

      {/* Charts Row */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <Card elevation={0} sx={{ border: "1px solid", borderColor: "divider", borderRadius: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Department Distribution
              </Typography>
              <Box sx={{ height: 250 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={departmentChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                      animationDuration={1500}
                    >
                      {departmentChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <RechartsTooltip content={<CustomTooltip />} />
                    <Legend verticalAlign="bottom" height={36} />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card elevation={0} sx={{ border: "1px solid", borderColor: "divider", borderRadius: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Role Distribution
              </Typography>
              <Box sx={{ height: 250 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={roleChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                    <YAxis />
                    <RechartsTooltip content={<CustomTooltip />} />
                    <Bar
                      dataKey="count"
                      fill="#667eea"
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

      {/* Filters Section */}
      <Card
        elevation={0}
        sx={{ border: "1px solid", borderColor: "divider", borderRadius: 3, mb: 3 }}
      >
        <CardContent sx={{ p: 2 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: showFilters ? 2 : 0,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <FilterList color="action" />
              <Typography variant="subtitle1" fontWeight="bold">
                Filters
              </Typography>
              <Chip
                label={`${filteredUsers.length} results`}
                size="small"
                color="primary"
                sx={{ ml: 1 }}
              />
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Tabs
                value={viewMode}
                onChange={(e, v) => setViewMode(v)}
                sx={{ minHeight: 36 }}
              >
                <Tab
                  value="table"
                  label="Table"
                  sx={{ minHeight: 36, textTransform: "none" }}
                />
                <Tab
                  value="grid"
                  label="Grid"
                  sx={{ minHeight: 36, textTransform: "none" }}
                />
              </Tabs>
              <IconButton size="small" onClick={() => setShowFilters(!showFilters)}>
                {showFilters ? <ExpandLess /> : <ExpandMore />}
              </IconButton>
            </Box>
          </Box>

          <Collapse in={showFilters}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Search by name, email, ID, mobile..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Search />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                    },
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={4} md={2}>
                <FormControl fullWidth size="small">
                  <InputLabel>Department</InputLabel>
                  <Select
                    value={filterDepartment}
                    label="Department"
                    onChange={(e) => setFilterDepartment(e.target.value)}
                    sx={{ borderRadius: 2 }}
                  >
                    <MenuItem value="all">All Departments</MenuItem>
                    <MenuItem value="Health">Health</MenuItem>
                    <MenuItem value="Insurance">Insurance</MenuItem>
                    <MenuItem value="Offline Visits">Offline Visits</MenuItem>
                    <MenuItem value="Management">Management</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={4} md={2}>
                <FormControl fullWidth size="small">
                  <InputLabel>Role</InputLabel>
                  <Select
                    value={filterRole}
                    label="Role"
                    onChange={(e) => setFilterRole(e.target.value)}
                    sx={{ borderRadius: 2 }}
                  >
                    <MenuItem value="all">All Roles</MenuItem>
                    <MenuItem value="Health Agent">Health Agent</MenuItem>
                    <MenuItem value="Health TL">Health TL</MenuItem>
                    <MenuItem value="Insurance Agent">Insurance Agent</MenuItem>
                    <MenuItem value="Insurance TL">Insurance TL</MenuItem>
                    <MenuItem value="DC Agent">DC Agent</MenuItem>
                    <MenuItem value="Manager">Manager</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={4} md={2}>
                <FormControl fullWidth size="small">
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={filterStatus}
                    label="Status"
                    onChange={(e) => setFilterStatus(e.target.value)}
                    sx={{ borderRadius: 2 }}
                  >
                    <MenuItem value="all">All Status</MenuItem>
                    <MenuItem value="active">Active</MenuItem>
                    <MenuItem value="inactive">Inactive</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={2}>
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={() => {
                    setSearchQuery("");
                    setFilterDepartment("all");
                    setFilterRole("all");
                    setFilterStatus("all");
                  }}
                  sx={{ borderRadius: 2, height: 40 }}
                >
                  Clear Filters
                </Button>
              </Grid>
            </Grid>
          </Collapse>
        </CardContent>
      </Card>

      {/* Table View */}
      {viewMode === "table" && (
        <Card elevation={0} sx={{ border: "1px solid", borderColor: "divider", borderRadius: 3 }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: "grey.50" }}>
                  <TableCell sx={{ fontWeight: "bold" }}>User</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Contact</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Role</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Department</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Status</TableCell>
                  <TableCell align="center" sx={{ fontWeight: "bold" }}>
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredUsers
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((user) => (
                    <TableRow
                      key={user.id}
                      hover
                      sx={{
                        "&:hover": {
                          bgcolor: "action.hover",
                        },
                      }}
                    >
                      <TableCell>
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          <Avatar
                            sx={{
                              width: 40,
                              height: 40,
                              mr: 2,
                              bgcolor: getDepartmentColor(user.department) + ".light",
                              color: getDepartmentColor(user.department) + ".main",
                              fontWeight: "bold",
                              fontSize: "0.9rem",
                            }}
                          >
                            {user.name?.charAt(0) || "U"}
                          </Avatar>
                          <Box>
                            <Typography variant="body2" fontWeight={600}>
                              {user.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {user.empId || user.id}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ display: "flex", alignItems: "center" }}>
                          <Email sx={{ fontSize: 14, mr: 0.5, color: "text.secondary" }} />
                          {user.email}
                        </Typography>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ display: "flex", alignItems: "center", mt: 0.5 }}
                        >
                          <Phone sx={{ fontSize: 12, mr: 0.5 }} />
                          {user.mobile || "N/A"}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={user.role}
                          size="small"
                          color={getRoleColor(user.role)}
                          sx={{ borderRadius: 2 }}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={user.department}
                          size="small"
                          sx={{
                            borderRadius: 2,
                            bgcolor: getDepartmentColor(user.department) + ".light",
                            color: getDepartmentColor(user.department) + ".main",
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          icon={
                            user.status === "active" || !user.status ? (
                              <CheckCircle sx={{ fontSize: 14 }} />
                            ) : (
                              <Cancel sx={{ fontSize: 14 }} />
                            )
                          }
                          label={user.status || "active"}
                          size="small"
                          color={getStatusColor(user.status)}
                          sx={{ borderRadius: 2 }}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Box sx={{ display: "flex", justifyContent: "center", gap: 0.5 }}>
                          <Tooltip title="View Details">
                            <IconButton size="small" onClick={() => openView(user)}>
                              <Visibility fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Edit User">
                            <IconButton
                              size="small"
                              color="primary"
                              onClick={() => openEdit(user)}
                            >
                              <Edit fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete User">
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => openDelete(user)}
                            >
                              <Delete fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            component="div"
            count={filteredUsers.length}
            page={page}
            onPageChange={(e, newPage) => setPage(newPage)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(parseInt(e.target.value, 10));
              setPage(0);
            }}
            sx={{ borderTop: "1px solid", borderColor: "divider" }}
          />
        </Card>
      )}

      {/* Grid View */}
      {viewMode === "grid" && (
        <>
          <Grid container spacing={2}>
            {filteredUsers
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((user) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={user.id}>
                  <UserCard
                    user={user}
                    onView={openView}
                    onEdit={openEdit}
                    onDelete={openDelete}
                    getRoleColor={getRoleColor}
                    getDepartmentColor={getDepartmentColor}
                  />
                </Grid>
              ))}
          </Grid>
          <Box sx={{ mt: 3, display: "flex", justifyContent: "center" }}>
            <TablePagination
              component="div"
              count={filteredUsers.length}
              page={page}
              onPageChange={(e, newPage) => setPage(newPage)}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={(e) => {
                setRowsPerPage(parseInt(e.target.value, 10));
                setPage(0);
              }}
            />
          </Box>
        </>
      )}

      {/* Add User Dialog */}
      <Dialog
        open={openAddDialog}
        onClose={() => setOpenAddDialog(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <PersonAdd sx={{ mr: 1, color: "primary.main" }} />
            <Typography variant="h6" fontWeight="bold">
              Add New User
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Full Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <People sx={{ color: "text.secondary" }} />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Email (Login ID)"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Email sx={{ color: "text.secondary" }} />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                helperText="Minimum 6 characters"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock sx={{ color: "text.secondary" }} />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Mobile Number"
                value={formData.mobile}
                onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Phone sx={{ color: "text.secondary" }} />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Employee ID"
                value={formData.empId}
                onChange={(e) => setFormData({ ...formData, empId: e.target.value })}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <BadgeIcon sx={{ color: "text.secondary" }} />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Role</InputLabel>
                <Select
                  value={formData.role}
                  label="Role"
                  onChange={(e) => {
                    const role = e.target.value;
                    let dept = "";
                    if (role.includes("Health")) dept = "Health";
                    else if (role.includes("Insurance")) dept = "Insurance";
                    else if (role === "DC Agent") dept = "Offline Visits";
                    else if (role === "Manager") dept = "Management";
                    setFormData({ ...formData, role, department: dept });
                  }}
                >
                  <MenuItem value="Health Agent">Health Agent</MenuItem>
                  <MenuItem value="Health TL">Health Team Lead</MenuItem>
                  <MenuItem value="Insurance Agent">Insurance Agent</MenuItem>
                  <MenuItem value="Insurance TL">Insurance Team Lead</MenuItem>
                  <MenuItem value="DC Agent">DC Agent</MenuItem>
                  <MenuItem value="Manager">Manager</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Department</InputLabel>
                <Select
                  value={formData.department}
                  label="Department"
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                >
                  <MenuItem value="Health">Health</MenuItem>
                  <MenuItem value="Insurance">Insurance</MenuItem>
                  <MenuItem value="Offline Visits">Offline Visits</MenuItem>
                  <MenuItem value="Management">Management</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Designation"
                value={formData.designation}
                onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={formData.status}
                  label="Status"
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  <MenuItem value="active">
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <CheckCircle sx={{ color: "success.main", mr: 1, fontSize: 18 }} />
                      Active
                    </Box>
                  </MenuItem>
                  <MenuItem value="inactive">
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <Cancel sx={{ color: "error.main", mr: 1, fontSize: 18 }} />
                      Inactive
                    </Box>
                  </MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Team Lead (Optional)</InputLabel>
                <Select
                  value={formData.teamLeadId || ""}
                  label="Team Lead (Optional)"
                  onChange={(e) => {
                    const selectedTL = teamLeadsList.find(t => t.id === e.target.value || t.uid === e.target.value);
                    setFormData({
                      ...formData,
                      teamLeadId: e.target.value,
                      teamLead: selectedTL?.name || "",
                    });
                  }}
                >
                  <MenuItem value="">
                    <em>None</em>
                  </MenuItem>
                  {teamLeadsList
                    .filter(tl => {
                      if (formData.department === "Health") return tl.department === "Health";
                      if (formData.department === "Insurance") return tl.department === "Insurance";
                      return true;
                    })
                    .map((tl) => (
                      <MenuItem key={tl.id} value={tl.uid || tl.id}>
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          <Avatar
                            sx={{
                              width: 24,
                              height: 24,
                              mr: 1,
                              fontSize: "0.7rem",
                              bgcolor: tl.department === "Health" ? "success.light" : "error.light",
                              color: tl.department === "Health" ? "success.main" : "error.main",
                            }}
                          >
                            {tl.name?.charAt(0)}
                          </Avatar>
                          {tl.name}
                        </Box>
                      </MenuItem>
                    ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Manager (Optional)</InputLabel>
                <Select
                  value={formData.managerId || ""}
                  label="Manager (Optional)"
                  onChange={(e) => {
                    const selectedMgr = managersList.find(m => m.id === e.target.value || m.uid === e.target.value);
                    setFormData({
                      ...formData,
                      managerId: e.target.value,
                      manager: selectedMgr?.name || "",
                    });
                  }}
                >
                  <MenuItem value="">
                    <em>None</em>
                  </MenuItem>
                  {managersList.map((mgr) => (
                    <MenuItem key={mgr.id} value={mgr.uid || mgr.id}>
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <Avatar
                          sx={{
                            width: 24,
                            height: 24,
                            mr: 1,
                            fontSize: "0.7rem",
                            bgcolor: "secondary.light",
                            color: "secondary.main",
                          }}
                        >
                          {mgr.name?.charAt(0)}
                        </Avatar>
                        {mgr.name}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2.5, pt: 1 }}>
          <Button onClick={() => setOpenAddDialog(false)} sx={{ borderRadius: 2 }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleAddUser}
            disabled={!formData.name || !formData.email || !formData.role}
            sx={{
              borderRadius: 2,
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              "&:hover": {
                background: "linear-gradient(135deg, #5a6fd6 0%, #6a4190 100%)",
              },
            }}
          >
            Add User
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog
        open={openEditDialog}
        onClose={() => setOpenEditDialog(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <Edit sx={{ mr: 1, color: "primary.main" }} />
            <Typography variant="h6" fontWeight="bold">
              Edit User
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mt: 2, mb: 2, borderRadius: 2 }}>
            Email and Employee ID cannot be edited for security reasons.
          </Alert>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Full Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Mobile Number"
                value={formData.mobile}
                onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Department</InputLabel>
                <Select
                  value={formData.department}
                  label="Department"
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                >
                  <MenuItem value="Health">Health</MenuItem>
                  <MenuItem value="Insurance">Insurance</MenuItem>
                  <MenuItem value="Offline Visits">Offline Visits</MenuItem>
                  <MenuItem value="Management">Management</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Designation"
                value={formData.designation}
                onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={formData.status}
                  label="Status"
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  <MenuItem value="active">
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <CheckCircle sx={{ color: "success.main", mr: 1, fontSize: 18 }} />
                      Active
                    </Box>
                  </MenuItem>
                  <MenuItem value="inactive">
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <Cancel sx={{ color: "error.main", mr: 1, fontSize: 18 }} />
                      Inactive
                    </Box>
                  </MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Team Lead</InputLabel>
                <Select
                  value={formData.teamLeadId || ""}
                  label="Team Lead"
                  onChange={(e) => {
                    const selectedTL = teamLeadsList.find(t => t.id === e.target.value || t.uid === e.target.value);
                    setFormData({
                      ...formData,
                      teamLeadId: e.target.value,
                      teamLead: selectedTL?.name || "",
                    });
                  }}
                >
                  <MenuItem value="">
                    <em>None</em>
                  </MenuItem>
                  {teamLeadsList
                    .filter(tl => {
                      // Filter TLs based on user's department
                      if (formData.department === "Health") {
                        return tl.department === "Health";
                      } else if (formData.department === "Insurance") {
                        return tl.department === "Insurance";
                      }
                      return true;
                    })
                    .map((tl) => (
                      <MenuItem key={tl.id} value={tl.uid || tl.id}>
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          <Avatar
                            sx={{
                              width: 24,
                              height: 24,
                              mr: 1,
                              fontSize: "0.7rem",
                              bgcolor: tl.department === "Health" ? "success.light" : "error.light",
                              color: tl.department === "Health" ? "success.main" : "error.main",
                            }}
                          >
                            {tl.name?.charAt(0)}
                          </Avatar>
                          {tl.name}
                          <Chip
                            label={tl.department}
                            size="small"
                            sx={{ ml: 1, height: 20, fontSize: "0.65rem" }}
                          />
                        </Box>
                      </MenuItem>
                    ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Manager</InputLabel>
                <Select
                  value={formData.managerId || ""}
                  label="Manager"
                  onChange={(e) => {
                    const selectedMgr = managersList.find(m => m.id === e.target.value || m.uid === e.target.value);
                    setFormData({
                      ...formData,
                      managerId: e.target.value,
                      manager: selectedMgr?.name || "",
                    });
                  }}
                >
                  <MenuItem value="">
                    <em>None</em>
                  </MenuItem>
                  {managersList.map((mgr) => (
                    <MenuItem key={mgr.id} value={mgr.uid || mgr.id}>
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <Avatar
                          sx={{
                            width: 24,
                            height: 24,
                            mr: 1,
                            fontSize: "0.7rem",
                            bgcolor: "secondary.light",
                            color: "secondary.main",
                          }}
                        >
                          {mgr.name?.charAt(0)}
                        </Avatar>
                        {mgr.name}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2.5, pt: 1 }}>
          <Button onClick={() => setOpenEditDialog(false)} sx={{ borderRadius: 2 }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleEditUser}
            sx={{
              borderRadius: 2,
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              "&:hover": {
                background: "linear-gradient(135deg, #5a6fd6 0%, #6a4190 100%)",
              },
            }}
          >
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle>
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <Warning sx={{ mr: 1, color: "error.main" }} />
            <Typography variant="h6" fontWeight="bold">
              Confirm Delete
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
            <Avatar
              sx={{
                width: 48,
                height: 48,
                mr: 2,
                bgcolor: "error.light",
                color: "error.main",
              }}
            >
              {selectedUser?.name?.charAt(0)}
            </Avatar>
            <Box>
              <Typography variant="subtitle1" fontWeight="bold">
                {selectedUser?.name}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {selectedUser?.email}
              </Typography>
            </Box>
          </Box>
          <Alert severity="warning" sx={{ borderRadius: 2 }}>
            This action cannot be undone. The user will be permanently removed from the system.
          </Alert>
        </DialogContent>
        <DialogActions sx={{ p: 2.5, pt: 1 }}>
          <Button onClick={() => setOpenDeleteDialog(false)} sx={{ borderRadius: 2 }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleDeleteUser}
            sx={{ borderRadius: 2 }}
          >
            Delete User
          </Button>
        </DialogActions>
      </Dialog>

      {/* View User Dialog */}
      <Dialog
        open={openViewDialog}
        onClose={() => setOpenViewDialog(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <Visibility sx={{ mr: 1, color: "primary.main" }} />
            <Typography variant="h6" fontWeight="bold">
              User Details
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedUser && (
            <Box sx={{ mt: 2 }}>
              {/* User Header */}
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  mb: 3,
                  bgcolor: "grey.50",
                  borderRadius: 3,
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <Avatar
                  sx={{
                    width: 64,
                    height: 64,
                    mr: 2,
                    bgcolor: getDepartmentColor(selectedUser.department) + ".light",
                    color: getDepartmentColor(selectedUser.department) + ".main",
                    fontSize: "1.5rem",
                    fontWeight: "bold",
                  }}
                >
                  {selectedUser.name?.charAt(0)}
                </Avatar>
                <Box>
                  <Typography variant="h6" fontWeight="bold">
                    {selectedUser.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {selectedUser.empId || selectedUser.id}
                  </Typography>
                  <Box sx={{ display: "flex", gap: 1, mt: 1 }}>
                    <Chip
                      label={selectedUser.role}
                      size="small"
                      color={getRoleColor(selectedUser.role)}
                    />
                    <Chip
                      label={selectedUser.status || "active"}
                      size="small"
                      color={getStatusColor(selectedUser.status)}
                    />
                  </Box>
                </Box>
              </Paper>

              {/* Details Grid */}
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 0.5 }}>
                    <Email sx={{ fontSize: 18, color: "text.secondary", mr: 1 }} />
                    <Typography variant="caption" color="text.secondary">
                      Email (Login ID)
                    </Typography>
                  </Box>
                  <Typography variant="body2" fontWeight={500}>
                    {selectedUser.email}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 0.5 }}>
                    <Phone sx={{ fontSize: 18, color: "text.secondary", mr: 1 }} />
                    <Typography variant="caption" color="text.secondary">
                      Mobile
                    </Typography>
                  </Box>
                  <Typography variant="body2" fontWeight={500}>
                    {selectedUser.mobile || "N/A"}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 0.5 }}>
                    <Business sx={{ fontSize: 18, color: "text.secondary", mr: 1 }} />
                    <Typography variant="caption" color="text.secondary">
                      Department
                    </Typography>
                  </Box>
                  <Chip
                    label={selectedUser.department}
                    size="small"
                    sx={{
                      bgcolor: getDepartmentColor(selectedUser.department) + ".light",
                      color: getDepartmentColor(selectedUser.department) + ".main",
                    }}
                  />
                </Grid>
                <Grid item xs={6}>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 0.5 }}>
                    <BadgeIcon sx={{ fontSize: 18, color: "text.secondary", mr: 1 }} />
                    <Typography variant="caption" color="text.secondary">
                      Designation
                    </Typography>
                  </Box>
                  <Typography variant="body2" fontWeight={500}>
                    {selectedUser.designation || selectedUser.role}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 0.5 }}>
                    <SupervisorAccount sx={{ fontSize: 18, color: "text.secondary", mr: 1 }} />
                    <Typography variant="caption" color="text.secondary">
                      Team Lead
                    </Typography>
                  </Box>
                  <Typography variant="body2" fontWeight={500}>
                    {selectedUser.teamLead || "N/A"}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 0.5 }}>
                    <SupervisorAccount sx={{ fontSize: 18, color: "text.secondary", mr: 1 }} />
                    <Typography variant="caption" color="text.secondary">
                      Manager
                    </Typography>
                  </Box>
                  <Typography variant="body2" fontWeight={500}>
                    {selectedUser.manager || "N/A"}
                  </Typography>
                </Grid>
              </Grid>

              <Alert severity="info" sx={{ mt: 3, borderRadius: 2 }}>
                <Typography variant="caption">
                  <strong>Password:</strong> Contact system administrator for password reset
                </Typography>
              </Alert>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2.5, pt: 1 }}>
          <Button
            variant="outlined"
            startIcon={<Edit />}
            onClick={() => {
              setOpenViewDialog(false);
              openEdit(selectedUser);
            }}
            sx={{ borderRadius: 2 }}
          >
            Edit User
          </Button>
          <Button
            onClick={() => setOpenViewDialog(false)}
            sx={{ borderRadius: 2 }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default UserManagement;
