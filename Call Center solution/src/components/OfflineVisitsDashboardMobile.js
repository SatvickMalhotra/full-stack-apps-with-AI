import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
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
  CircularProgress,
  Chip,
  Avatar,
  IconButton,
  Snackbar,
  Alert,
  Fab,
  SwipeableDrawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Badge,
  BottomNavigation,
  BottomNavigationAction,
  LinearProgress,
  Slide,
} from "@mui/material";
import {
  Person,
  Search as SearchIcon,
  Refresh,
  DirectionsWalk,
  PhoneInTalk,
  TrendingUp,
  LocationOn,
  Add,
  Menu,
  CloudOff,
  CloudDone,
  Wifi,
  WifiOff,
  SignalCellularAlt,
  Upload,
  History,
  Settings,
  Logout,
  Close,
} from "@mui/icons-material";
import { collection, doc, onSnapshot, query, orderBy, limit } from "firebase/firestore";
import { db } from "../firebaseConfig";
import { useMobileOptimizations } from "../hooks/useMobileOptimizations";
import TripTrackerOptimized from "./TripTrackerOptimized";
import OfflineVisitRecordMobile from "./OfflineVisitRecordMobile";
import ManualLeads from "./ManualLeads";
import { getPendingUploads } from "../utils/offlineUtils";

/**
 * Mobile-Optimized Offline Visits Dashboard
 * Features:
 * - Bottom navigation for easier thumb access
 * - Pull-to-refresh
 * - Network status indicator
 * - Offline queue badge
 * - Better touch targets
 * - Haptic feedback
 */
function OfflineVisitsDashboardMobile({ currentUser }) {
  const [offlineVisitLogs, setOfflineVisitLogs] = useState([]);
  const [manualCallLogs, setManualCallLogs] = useState([]);
  const [tripLogs, setTripLogs] = useState([]);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState(0);
  const [pendingUploads, setPendingUploads] = useState(0);
  const [showNetworkSnackbar, setShowNetworkSnackbar] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  // Mobile optimizations hook
  const {
    isOnline,
    connectionType,
    isMobile,
    isSlowConnection,
    lightTap,
    success: hapticSuccess,
  } = useMobileOptimizations();

  // Check pending uploads count
  useEffect(() => {
    const checkPendingUploads = async () => {
      try {
        const pending = await getPendingUploads();
        setPendingUploads(pending.length);
      } catch (error) {
        console.error("Error checking pending uploads:", error);
      }
    };

    checkPendingUploads();
    // Check every 30 seconds
    const interval = setInterval(checkPendingUploads, 30000);
    return () => clearInterval(interval);
  }, []);

  // Show network status changes
  useEffect(() => {
    if (!isOnline) {
      setShowNetworkSnackbar(true);
    }
  }, [isOnline]);

  useEffect(() => {
    if (!currentUser) return;

    let mounted = true;
    const unsubscribes = [];

    const fetchOfflineVisitsData = async () => {
      try {
        setLoading(true);

        // Get user document
        const userDocRef = doc(db, "offlineVisits", currentUser.uid);
        const unsubUser = onSnapshot(userDocRef, (docSnapshot) => {
          if (mounted && docSnapshot.exists()) {
            setUserData({
              uid: docSnapshot.id,
              ...docSnapshot.data(),
            });
          }
        });
        unsubscribes.push(unsubUser);

        // Offline visits - limit to recent 50 for performance
        const offlineVisitsRef = collection(db, "offlineVisits", currentUser.uid, "offlineVisits");
        const offlineVisitsQuery = query(offlineVisitsRef, orderBy("timestamp", "desc"), limit(50));

        const unsubOfflineVisits = onSnapshot(offlineVisitsQuery, (snapshot) => {
          if (mounted) {
            const visits = snapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            }));
            setOfflineVisitLogs(visits);
          }
        });
        unsubscribes.push(unsubOfflineVisits);

        // Manual call logs - limit to recent 50
        const manualCallLogsRef = collection(db, "offlineVisits", currentUser.uid, "manualCallLogs");
        const manualCallLogsQuery = query(manualCallLogsRef, orderBy("timestamp", "desc"), limit(50));

        const unsubManualLogs = onSnapshot(manualCallLogsQuery, (snapshot) => {
          if (mounted) {
            const logs = snapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            }));
            setManualCallLogs(logs);
          }
        });
        unsubscribes.push(unsubManualLogs);

        // Trips - limit to recent 20
        const tripsRef = collection(db, "offlineVisits", currentUser.uid, "trips");
        const tripsQuery = query(tripsRef, orderBy("startTime", "desc"), limit(20));

        const unsubTrips = onSnapshot(tripsQuery, (snapshot) => {
          if (mounted) {
            const trips = snapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            }));
            setTripLogs(trips);
          }
        });
        unsubscribes.push(unsubTrips);

        setLoading(false);
      } catch (error) {
        console.error("Error fetching offline visits data:", error);
        setLoading(false);
      }
    };

    fetchOfflineVisitsData();

    return () => {
      mounted = false;
      unsubscribes.forEach((unsub) => unsub());
    };
  }, [currentUser]);

  // Pull to refresh handler
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    lightTap();
    // Simulate refresh delay
    await new Promise((resolve) => setTimeout(resolve, 1000));
    hapticSuccess();
    setRefreshing(false);
    window.location.reload();
  }, [lightTap, hapticSuccess]);

  // Calculate stats
  const todayVisits = offlineVisitLogs.filter((visit) => {
    if (!visit.date) return false;
    return visit.date === new Date().toLocaleDateString("en-CA");
  }).length;

  const activeTrips = tripLogs.filter((trip) => trip.status === "active").length;

  const totalDistanceThisMonth = tripLogs
    .filter((trip) => {
      if (!trip.endTime) return false;
      const tripDate = trip.endTime.toDate?.() || new Date(trip.endTime);
      const now = new Date();
      return tripDate.getMonth() === now.getMonth() && tripDate.getFullYear() === now.getFullYear();
    })
    .reduce((sum, trip) => sum + (trip.totalDistance || 0), 0);

  // Network status indicator
  const NetworkIndicator = () => (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 0.5,
        px: 1.5,
        py: 0.5,
        borderRadius: "20px",
        bgcolor: isOnline
          ? connectionType === "4g" || connectionType === "wifi"
            ? "rgba(34, 197, 94, 0.15)"
            : "rgba(245, 158, 11, 0.15)"
          : "rgba(239, 68, 68, 0.15)",
      }}
    >
      {isOnline ? (
        connectionType === "4g" || connectionType === "wifi" ? (
          <SignalCellularAlt sx={{ fontSize: 16, color: "#22c55e" }} />
        ) : (
          <Wifi sx={{ fontSize: 16, color: "#f59e0b" }} />
        )
      ) : (
        <WifiOff sx={{ fontSize: 16, color: "#ef4444" }} />
      )}
      <Typography
        variant="caption"
        sx={{
          fontWeight: 600,
          color: isOnline ? (isSlowConnection ? "#f59e0b" : "#22c55e") : "#ef4444",
          fontSize: "0.6875rem",
        }}
      >
        {isOnline ? (isSlowConnection ? "Slow" : "Online") : "Offline"}
      </Typography>
    </Box>
  );

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          gap: 2,
        }}
      >
        <CircularProgress sx={{ color: "white" }} size={48} />
        <Typography sx={{ color: "white", fontWeight: 500 }}>
          Loading dashboard...
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        pb: { xs: 10, sm: 4 }, // Extra padding for bottom nav on mobile
      }}
    >
      {/* Refresh Indicator */}
      {refreshing && (
        <LinearProgress
          sx={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            zIndex: 2000,
            "& .MuiLinearProgress-bar": {
              background: "linear-gradient(90deg, #fff, #e2e8f0)",
            },
          }}
        />
      )}

      {/* Header Section - Compact for mobile */}
      <Box sx={{ p: { xs: 2, sm: 3 } }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            mb: 2,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Avatar
              sx={{
                width: { xs: 44, sm: 56 },
                height: { xs: 44, sm: 56 },
                bgcolor: "white",
                color: "#667eea",
                fontSize: { xs: "1.125rem", sm: "1.5rem" },
                fontWeight: 700,
              }}
            >
              {userData?.name?.charAt(0) || "U"}
            </Avatar>
            <Box>
              <Typography
                variant="h6"
                sx={{
                  color: "white",
                  fontWeight: 700,
                  fontSize: { xs: "1rem", sm: "1.25rem" },
                  lineHeight: 1.2,
                }}
              >
                {userData?.name?.split(" ")[0] || "User"}
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  color: "rgba(255,255,255,0.85)",
                  fontSize: { xs: "0.6875rem", sm: "0.75rem" },
                }}
              >
                {userData?.empId || "Field Agent"}
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <NetworkIndicator />
            {pendingUploads > 0 && (
              <Badge
                badgeContent={pendingUploads}
                color="warning"
                sx={{
                  "& .MuiBadge-badge": {
                    fontSize: "0.625rem",
                    minWidth: 18,
                    height: 18,
                  },
                }}
              >
                <IconButton
                  sx={{ color: "white", bgcolor: "rgba(255,255,255,0.15)" }}
                  size="small"
                >
                  <Upload sx={{ fontSize: 18 }} />
                </IconButton>
              </Badge>
            )}
            <IconButton
              onClick={() => setMenuOpen(true)}
              sx={{ color: "white" }}
            >
              <Menu />
            </IconButton>
          </Box>
        </Box>

        {/* Quick Stats - Horizontal scroll on mobile */}
        <Box
          sx={{
            display: "flex",
            gap: 1.5,
            overflowX: "auto",
            pb: 1,
            mx: -2,
            px: 2,
            "&::-webkit-scrollbar": { display: "none" },
            scrollbarWidth: "none",
          }}
        >
          {/* Today's Visits */}
          <Card
            sx={{
              minWidth: { xs: 130, sm: 160 },
              background: "rgba(255,255,255,0.15)",
              backdropFilter: "blur(10px)",
              borderRadius: "16px",
              border: "1px solid rgba(255,255,255,0.2)",
              flexShrink: 0,
            }}
          >
            <CardContent sx={{ p: "12px !important" }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <DirectionsWalk sx={{ color: "white", fontSize: 24 }} />
                <Box>
                  <Typography
                    variant="h5"
                    sx={{ color: "white", fontWeight: 700, lineHeight: 1 }}
                  >
                    {todayVisits}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{ color: "rgba(255,255,255,0.8)", fontSize: "0.625rem" }}
                  >
                    Today's Visits
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>

          {/* Active Trips */}
          <Card
            sx={{
              minWidth: { xs: 130, sm: 160 },
              background: activeTrips > 0
                ? "linear-gradient(135deg, #22c55e, #16a34a)"
                : "rgba(255,255,255,0.15)",
              backdropFilter: "blur(10px)",
              borderRadius: "16px",
              border: "1px solid rgba(255,255,255,0.2)",
              flexShrink: 0,
            }}
          >
            <CardContent sx={{ p: "12px !important" }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <TrendingUp sx={{ color: "white", fontSize: 24 }} />
                <Box>
                  <Typography
                    variant="h5"
                    sx={{ color: "white", fontWeight: 700, lineHeight: 1 }}
                  >
                    {activeTrips > 0 ? "Active" : tripLogs.length}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{ color: "rgba(255,255,255,0.8)", fontSize: "0.625rem" }}
                  >
                    {activeTrips > 0 ? "Trip Running" : "Total Trips"}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>

          {/* Distance */}
          <Card
            sx={{
              minWidth: { xs: 130, sm: 160 },
              background: "rgba(255,255,255,0.15)",
              backdropFilter: "blur(10px)",
              borderRadius: "16px",
              border: "1px solid rgba(255,255,255,0.2)",
              flexShrink: 0,
            }}
          >
            <CardContent sx={{ p: "12px !important" }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <LocationOn sx={{ color: "white", fontSize: 24 }} />
                <Box>
                  <Typography
                    variant="h5"
                    sx={{ color: "white", fontWeight: 700, lineHeight: 1 }}
                  >
                    {totalDistanceThisMonth.toFixed(1)}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{ color: "rgba(255,255,255,0.8)", fontSize: "0.625rem" }}
                  >
                    km This Month
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>

          {/* Call Logs */}
          <Card
            sx={{
              minWidth: { xs: 130, sm: 160 },
              background: "rgba(255,255,255,0.15)",
              backdropFilter: "blur(10px)",
              borderRadius: "16px",
              border: "1px solid rgba(255,255,255,0.2)",
              flexShrink: 0,
            }}
          >
            <CardContent sx={{ p: "12px !important" }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <PhoneInTalk sx={{ color: "white", fontSize: 24 }} />
                <Box>
                  <Typography
                    variant="h5"
                    sx={{ color: "white", fontWeight: 700, lineHeight: 1 }}
                  >
                    {manualCallLogs.length}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{ color: "rgba(255,255,255,0.8)", fontSize: "0.625rem" }}
                  >
                    Call Logs
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Box>

      {/* Trip Tracker Card */}
      <Box sx={{ px: { xs: 2, sm: 3 }, mb: 2 }}>
        <TripTrackerOptimized
          agentId={currentUser.uid}
          agentCollection="offlineVisits"
        />
      </Box>

      {/* Main Content Area */}
      <Paper
        sx={{
          bgcolor: "white",
          borderRadius: { xs: "24px 24px 0 0", sm: "24px" },
          minHeight: { xs: "calc(100vh - 320px)", sm: "auto" },
          mx: { xs: 0, sm: 3 },
          p: { xs: 2, sm: 3 },
        }}
      >
        {/* Tab Content */}
        {activeTab === 0 && (
          <OfflineVisitRecordMobile
            agentId={currentUser.uid}
            agentCollection="offlineVisits"
            agentName={userData?.name || currentUser?.email}
          />
        )}

        {activeTab === 1 && (
          <ManualLeads
            agentId={currentUser.uid}
            agentCollection="offlineVisits"
            agentName={userData?.name || currentUser?.email}
          />
        )}

        {activeTab === 2 && (
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
              Visit History
            </Typography>
            {offlineVisitLogs.length === 0 ? (
              <Box sx={{ textAlign: "center", py: 4 }}>
                <DirectionsWalk sx={{ fontSize: 48, color: "#cbd5e1", mb: 1 }} />
                <Typography color="text.secondary">
                  No visits recorded yet
                </Typography>
              </Box>
            ) : (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                {offlineVisitLogs.slice(0, 10).map((visit) => (
                  <Card
                    key={visit.id}
                    sx={{
                      borderRadius: "12px",
                      border: "1px solid #e2e8f0",
                      boxShadow: "none",
                    }}
                  >
                    <CardContent sx={{ p: "12px !important" }}>
                      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                        <Box>
                          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                            {visit.partnerName || visit.clinicCode}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {visit.branchName} • {visit.visitType}
                          </Typography>
                        </Box>
                        <Chip
                          label={visit.date}
                          size="small"
                          sx={{
                            fontSize: "0.625rem",
                            height: 22,
                            bgcolor: "#f1f5f9",
                          }}
                        />
                      </Box>
                    </CardContent>
                  </Card>
                ))}
              </Box>
            )}
          </Box>
        )}
      </Paper>

      {/* Bottom Navigation - Mobile Only */}
      {isMobile && (
        <Paper
          sx={{
            position: "fixed",
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 1000,
            borderRadius: "20px 20px 0 0",
            boxShadow: "0 -4px 20px rgba(0,0,0,0.1)",
          }}
          elevation={3}
        >
          <BottomNavigation
            value={activeTab}
            onChange={(event, newValue) => {
              lightTap();
              setActiveTab(newValue);
            }}
            sx={{
              height: 70,
              "& .MuiBottomNavigationAction-root": {
                minWidth: 60,
                py: 1,
                "&.Mui-selected": {
                  color: "#667eea",
                },
              },
              "& .MuiBottomNavigationAction-label": {
                fontSize: "0.6875rem",
                fontWeight: 600,
                mt: 0.5,
              },
            }}
          >
            <BottomNavigationAction
              label="New Visit"
              icon={<Add sx={{ fontSize: 26 }} />}
            />
            <BottomNavigationAction
              label="Call Logs"
              icon={<PhoneInTalk sx={{ fontSize: 24 }} />}
            />
            <BottomNavigationAction
              label="History"
              icon={
                <Badge
                  badgeContent={offlineVisitLogs.length}
                  color="primary"
                  max={99}
                  sx={{
                    "& .MuiBadge-badge": {
                      fontSize: "0.5625rem",
                      minWidth: 16,
                      height: 16,
                    },
                  }}
                >
                  <History sx={{ fontSize: 24 }} />
                </Badge>
              }
            />
          </BottomNavigation>
        </Paper>
      )}

      {/* Side Menu Drawer */}
      <SwipeableDrawer
        anchor="right"
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        onOpen={() => setMenuOpen(true)}
        PaperProps={{
          sx: {
            width: { xs: "80%", sm: 320 },
            borderRadius: "24px 0 0 24px",
          },
        }}
      >
        <Box sx={{ p: 3 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Menu
            </Typography>
            <IconButton onClick={() => setMenuOpen(false)}>
              <Close />
            </IconButton>
          </Box>

          {/* User Info */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 2,
              p: 2,
              bgcolor: "#f8fafc",
              borderRadius: "16px",
              mb: 3,
            }}
          >
            <Avatar
              sx={{
                width: 56,
                height: 56,
                bgcolor: "#667eea",
                fontSize: "1.5rem",
                fontWeight: 700,
              }}
            >
              {userData?.name?.charAt(0) || "U"}
            </Avatar>
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                {userData?.name || "User"}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {userData?.empId || "Field Agent"} • {userData?.department || "Operations"}
              </Typography>
            </Box>
          </Box>

          <List>
            <ListItem
              button
              onClick={handleRefresh}
              sx={{ borderRadius: "12px", mb: 1 }}
            >
              <ListItemIcon>
                <Refresh />
              </ListItemIcon>
              <ListItemText primary="Refresh Data" />
            </ListItem>

            {pendingUploads > 0 && (
              <ListItem
                button
                sx={{ borderRadius: "12px", mb: 1, bgcolor: "#fef3c7" }}
              >
                <ListItemIcon>
                  <Badge badgeContent={pendingUploads} color="warning">
                    <CloudOff />
                  </Badge>
                </ListItemIcon>
                <ListItemText
                  primary="Pending Uploads"
                  secondary="Will sync when online"
                />
              </ListItem>
            )}

            <Divider sx={{ my: 2 }} />

            <ListItem
              button
              sx={{ borderRadius: "12px", mb: 1 }}
            >
              <ListItemIcon>
                <Settings />
              </ListItemIcon>
              <ListItemText primary="Settings" />
            </ListItem>

            <ListItem
              button
              onClick={() => navigate("/logout")}
              sx={{ borderRadius: "12px", color: "#ef4444" }}
            >
              <ListItemIcon>
                <Logout sx={{ color: "#ef4444" }} />
              </ListItemIcon>
              <ListItemText primary="Logout" />
            </ListItem>
          </List>
        </Box>
      </SwipeableDrawer>

      {/* Network Status Snackbar */}
      <Snackbar
        open={showNetworkSnackbar && !isOnline}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        TransitionComponent={Slide}
      >
        <Alert
          severity="warning"
          icon={<WifiOff />}
          sx={{
            width: "100%",
            borderRadius: "12px",
            "& .MuiAlert-message": {
              fontWeight: 600,
            },
          }}
          action={
            <IconButton
              size="small"
              color="inherit"
              onClick={() => setShowNetworkSnackbar(false)}
            >
              <Close fontSize="small" />
            </IconButton>
          }
        >
          You're offline. Changes will sync when back online.
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default OfflineVisitsDashboardMobile;
