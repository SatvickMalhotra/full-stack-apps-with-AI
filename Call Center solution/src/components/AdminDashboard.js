import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  Container,
  Tabs,
  Tab,
  Paper,
  IconButton,
  Tooltip,
  CircularProgress,
} from "@mui/material";
import {
  Logout,
  AdminPanelSettings,
  People,
  Groups,
  Business,
  Dashboard as DashboardIcon,
} from "@mui/icons-material";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../firebaseConfig";
import UserManagement from "./AdminUserManagement";
import TeamManagement from "./AdminTeamManagement";
import DepartmentManagement from "./AdminDepartmentManagement";
import AdminOverview from "./AdminOverview";

function AdminDashboard() {
  const [activeTab, setActiveTab] = useState(0);
  const [adminData, setAdminData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [triggerAddUser, setTriggerAddUser] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check session storage first
    const isAuthenticated = sessionStorage.getItem("adminAuthenticated");
    const loginId = sessionStorage.getItem("adminLoginId");

    if (!isAuthenticated || isAuthenticated !== "true") {
      navigate("/admin/login");
      return;
    }

    // Listen for Firebase Auth state changes
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          // Verify user is still an admin
          const adminDoc = await getDoc(doc(db, "admin", user.uid));
          if (adminDoc.exists()) {
            setAdminData({
              loginId: loginId || user.email,
              role: "admin",
              uid: user.uid
            });
          } else {
            // User is not an admin anymore
            console.warn("User is not an admin");
            handleLogout();
          }
        } catch (error) {
          console.error("Error verifying admin status:", error);
          // Still set admin data from session if Firestore check fails
          setAdminData({ loginId: loginId || user.email, role: "admin", uid: user.uid });
        }
      } else {
        // No user signed in, redirect to login
        console.warn("No Firebase user signed in");
        handleLogout();
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [navigate]);

  const handleLogout = () => {
    auth.signOut();
    sessionStorage.removeItem("adminAuthenticated");
    sessionStorage.removeItem("adminLoginId");
    sessionStorage.removeItem("adminUid");
    sessionStorage.removeItem("adminEmail");
    navigate("/admin/login");
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  // Quick Action handlers from Overview
  const handleAddUserFromOverview = () => {
    setTriggerAddUser(true);
    setActiveTab(1); // Switch to User Management tab
  };

  const handleManageTeams = () => {
    setActiveTab(2); // Switch to Team Management tab
  };

  const handleViewReports = () => {
    // For now, go to User Management with a view of all users
    // In the future, this could be a dedicated reports/analytics page
    setActiveTab(1);
  };

  const handleDepartmentSettings = () => {
    setActiveTab(3); // Switch to Department Management tab
  };

  // Reset trigger after it's consumed
  const handleAddUserTriggered = () => {
    setTriggerAddUser(false);
  };

  if (loading || !adminData) {
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
        <CircularProgress size={60} sx={{ color: "white" }} />
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f5f5f5" }}>
      {/* Top App Bar */}
      <AppBar
        position="sticky"
        sx={{
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        }}
      >
        <Toolbar>
          <AdminPanelSettings sx={{ mr: 2, fontSize: 32 }} />
          <Typography variant="h5" component="div" sx={{ flexGrow: 1, fontWeight: "bold" }}>
            M-Swasth Admin Portal
          </Typography>
          <Typography variant="body1" sx={{ mr: 2 }}>
            Admin: {adminData.loginId}
          </Typography>
          <Tooltip title="Logout">
            <IconButton color="inherit" onClick={handleLogout}>
              <Logout />
            </IconButton>
          </Tooltip>
        </Toolbar>
      </AppBar>

      {/* Navigation Tabs */}
      <Box sx={{ bgcolor: "white", borderBottom: 1, borderColor: "divider" }}>
        <Container maxWidth="xl">
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            aria-label="admin tabs"
            sx={{
              "& .MuiTab-root": {
                textTransform: "none",
                fontSize: "1rem",
                fontWeight: 500,
                minHeight: 64,
              },
            }}
          >
            <Tab icon={<DashboardIcon />} iconPosition="start" label="Overview" />
            <Tab icon={<People />} iconPosition="start" label="User Management" />
            <Tab icon={<Groups />} iconPosition="start" label="Team Management" />
            <Tab icon={<Business />} iconPosition="start" label="Department Management" />
          </Tabs>
        </Container>
      </Box>

      {/* Main Content */}
      <Container maxWidth="xl" sx={{ mt: 3, mb: 4 }}>
        <Paper elevation={0} sx={{ p: 3, borderRadius: 2 }}>
          {activeTab === 0 && (
            <AdminOverview
              onAddUser={handleAddUserFromOverview}
              onManageTeams={handleManageTeams}
              onViewReports={handleViewReports}
              onDepartmentSettings={handleDepartmentSettings}
            />
          )}
          {activeTab === 1 && (
            <UserManagement
              adminData={adminData}
              triggerAddUser={triggerAddUser}
              onAddUserTriggered={handleAddUserTriggered}
            />
          )}
          {activeTab === 2 && <TeamManagement adminData={adminData} />}
          {activeTab === 3 && <DepartmentManagement adminData={adminData} />}
        </Paper>
      </Container>
    </Box>
  );
}

export default AdminDashboard;
