import React, { useState, useEffect } from "react";
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Chip,
  Avatar,
  CircularProgress,
  Tabs,
  Tab,
} from "@mui/material";
import {
  DirectionsWalk,
  PhoneInTalk,
  LocalHospital,
  LocationOn,
} from "@mui/icons-material";
import { collection, doc, onSnapshot, query, orderBy } from "firebase/firestore";
import { db } from "../firebaseConfig";
import DCOfflineVisitRecord from "./DCOfflineVisitRecord";
import DCCustomVisit from "./DCCustomVisit";
import ManualLeads from "./ManualLeads";
import TripTrackerEnhanced from "./TripTrackerEnhanced";
import DCVisitHistory from "./DCVisitHistory";
import DCClinicsView from "./DCClinicsView";

/**
 * DCDashboard Component - Redesigned to match OfflineVisitsDashboardNew
 *
 * Dashboard for DC (Diagnostic Center) agents with:
 * - Trip Tracker
 * - Record Clinic Visits
 * - Manual Call Logs
 * - Visit History
 * - My Clinics
 */
const DCDashboard = ({ userId, userRole, userData: initialUserData }) => {
  const [activeTab, setActiveTab] = useState(0); // 0 = Trip Tracker, 1 = Record Visit, 2 = Custom Visit, 3 = Manual Calls, 4 = Visit History, 5 = My Clinics
  const [visitLogs, setVisitLogs] = useState([]);
  const [manualCallLogs, setManualCallLogs] = useState([]);
  const [tripLogs, setTripLogs] = useState([]);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch full user data and all logs
  useEffect(() => {
    if (!userId) return;

    let mounted = true;
    const unsubscribes = [];

    const fetchData = async () => {
      try {
        setLoading(true);

        // Get user document
        const userDocRef = doc(db, "offlineVisits", userId);
        const unsubUser = onSnapshot(userDocRef, (docSnapshot) => {
          if (mounted && docSnapshot.exists()) {
            setUserData({
              uid: docSnapshot.id,
              ...docSnapshot.data(),
            });
          }
        });
        unsubscribes.push(unsubUser);

        // Listen to visitLogs subcollection
        const logsRef = collection(db, "offlineVisits", userId, "visitLogs");
        const logsQuery = query(logsRef, orderBy("createdAt", "desc"));
        const unsubVisits = onSnapshot(logsQuery, (snapshot) => {
          if (mounted) {
            const logs = snapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            }));
            setVisitLogs(logs);
          }
        });
        unsubscribes.push(unsubVisits);

        // Listen to manualCallLogs subcollection
        const callLogsRef = collection(db, "offlineVisits", userId, "manualCallLogs");
        const callLogsQuery = query(callLogsRef, orderBy("timestamp", "desc"));
        const unsubCalls = onSnapshot(callLogsQuery, (snapshot) => {
          if (mounted) {
            const logs = snapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            }));
            setManualCallLogs(logs);
          }
        });
        unsubscribes.push(unsubCalls);

        // Listen to trips subcollection
        const tripsRef = collection(db, "offlineVisits", userId, "trips");
        const tripsQuery = query(tripsRef, orderBy("startTime", "desc"));
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
        console.error("Error fetching data:", error);
        setLoading(false);
      }
    };

    fetchData();

    return () => {
      mounted = false;
      unsubscribes.forEach((unsub) => unsub());
    };
  }, [userId]);

  // Calculate stats
  const todayVisits = visitLogs.filter((visit) => {
    if (!visit.createdAt) return false;
    const visitDate = visit.createdAt.toDate();
    const today = new Date();
    return visitDate.toDateString() === today.toDateString();
  }).length;

  const activeTrips = tripLogs.filter((trip) => trip.status === "active").length;

  const totalDistanceThisMonth = tripLogs
    .filter((trip) => {
      if (!trip.endTime) return false;
      const tripDate = trip.endTime.toDate();
      const now = new Date();
      return tripDate.getMonth() === now.getMonth() && tripDate.getFullYear() === now.getFullYear();
    })
    .reduce((sum, trip) => sum + (trip.totalDistance || 0), 0);

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        }}
      >
        <CircularProgress sx={{ color: "white" }} size={60} />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        p: { xs: 2, sm: 3 },
      }}
    >
      {/* Header Section */}
      <Box sx={{ mb: { xs: 3, sm: 4 } }}>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2, flexWrap: "wrap", gap: 2 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Avatar
              sx={{
                width: { xs: 48, sm: 56 },
                height: { xs: 48, sm: 56 },
                bgcolor: "white",
                color: "#667eea",
                fontSize: { xs: "1.25rem", sm: "1.5rem" },
                fontWeight: 700,
              }}
            >
              {userData?.name?.charAt(0) || "D"}
            </Avatar>
            <Box>
              <Typography variant="h4" sx={{ color: "white", fontWeight: 700, fontSize: { xs: "1.5rem", sm: "2.125rem" } }}>
                {userData?.name || "DC Agent"}
              </Typography>
              <Typography variant="body1" sx={{ color: "rgba(255,255,255,0.9)", fontSize: { xs: "0.875rem", sm: "1rem" } }}>
                ID: {userData?.empId || "N/A"} • DC Agent
              </Typography>
            </Box>
          </Box>
          <Chip
            label="Active"
            sx={{
              bgcolor: "#22c55e",
              color: "white",
              fontWeight: 600,
              px: { xs: 1.5, sm: 2 },
              py: { xs: 2, sm: 3 },
              fontSize: { xs: "0.875rem", sm: "1rem" },
            }}
          />
        </Box>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={{ xs: 2, sm: 3 }} sx={{ mb: { xs: 3, sm: 4 } }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card
            elevation={0}
            sx={{
              background: "linear-gradient(135deg, #f093fb, #f5576c)",
              borderRadius: "20px",
              boxShadow: "0 12px 40px rgba(240, 147, 251, 0.3)",
              transition: "transform 0.2s",
              "&:hover": {
                transform: "translateY(-4px)",
              },
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 1 }}>
                <DirectionsWalk sx={{ color: "white", fontSize: 36 }} />
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="h3" sx={{ color: "white", fontWeight: 700 }}>
                    {visitLogs.length}
                  </Typography>
                  <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.95)" }}>
                    Total Visits
                  </Typography>
                </Box>
              </Box>
              <Chip
                label={`${todayVisits} today`}
                size="small"
                sx={{ bgcolor: "rgba(255,255,255,0.3)", color: "white", fontWeight: 600 }}
              />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card
            elevation={0}
            sx={{
              background: "linear-gradient(135deg, #4facfe, #00f2fe)",
              borderRadius: "20px",
              boxShadow: "0 12px 40px rgba(79, 172, 254, 0.3)",
              transition: "transform 0.2s",
              "&:hover": {
                transform: "translateY(-4px)",
              },
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 1 }}>
                <PhoneInTalk sx={{ color: "white", fontSize: 36 }} />
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="h3" sx={{ color: "white", fontWeight: 700 }}>
                    {manualCallLogs.length}
                  </Typography>
                  <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.95)" }}>
                    Call Logs
                  </Typography>
                </Box>
              </Box>
              <Chip
                label={`${manualCallLogs.filter((l) => l.callConnected).length} connected`}
                size="small"
                sx={{ bgcolor: "rgba(255,255,255,0.3)", color: "white", fontWeight: 600 }}
              />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card
            elevation={0}
            sx={{
              background: "linear-gradient(135deg, #43e97b, #38f9d7)",
              borderRadius: "20px",
              boxShadow: "0 12px 40px rgba(67, 233, 123, 0.3)",
              transition: "transform 0.2s",
              "&:hover": {
                transform: "translateY(-4px)",
              },
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 1 }}>
                <LocationOn sx={{ color: "white", fontSize: 36 }} />
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="h3" sx={{ color: "white", fontWeight: 700 }}>
                    {activeTrips}
                  </Typography>
                  <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.95)" }}>
                    Active Trips
                  </Typography>
                </Box>
              </Box>
              <Chip
                label={`${totalDistanceThisMonth.toFixed(1)} km this month`}
                size="small"
                sx={{ bgcolor: "rgba(255,255,255,0.3)", color: "white", fontWeight: 600 }}
              />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card
            elevation={0}
            sx={{
              background: "linear-gradient(135deg, #fa709a, #fee140)",
              borderRadius: "20px",
              boxShadow: "0 12px 40px rgba(250, 112, 154, 0.3)",
              transition: "transform 0.2s",
              "&:hover": {
                transform: "translateY(-4px)",
              },
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 1 }}>
                <LocalHospital sx={{ color: "white", fontSize: 36 }} />
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="h3" sx={{ color: "white", fontWeight: 700 }}>
                    {userData?.totalClinics || 0}
                  </Typography>
                  <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.95)" }}>
                    Assigned Clinics
                  </Typography>
                </Box>
              </Box>
              <Chip
                label="View All"
                size="small"
                sx={{ bgcolor: "rgba(255,255,255,0.3)", color: "white", fontWeight: 600 }}
                onClick={() => setActiveTab(5)}
              />
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Card
        elevation={0}
        sx={{
          borderRadius: "20px 20px 0 0",
          overflow: "hidden",
        }}
      >
        <Tabs
          value={activeTab}
          onChange={(e, newValue) => setActiveTab(newValue)}
          sx={{
            bgcolor: "white",
            "& .MuiTab-root": {
              fontWeight: 600,
              fontSize: { xs: "0.75rem", sm: "0.875rem", md: "1rem" },
              textTransform: "none",
              minHeight: { xs: "48px", sm: "56px" },
              px: { xs: 1, sm: 2 },
            },
            "& .Mui-selected": {
              color: "#667eea !important",
            },
            "& .MuiTabs-indicator": {
              backgroundColor: "#667eea",
              height: 3,
            },
          }}
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label="🚗 Trip Tracker" />
          <Tab label="🏥 Record Visit" />
          <Tab label="📍 Custom Visit" />
          <Tab label="📞 Manual Calls" />
          <Tab label="📋 Visit History" />
          <Tab label="🏨 My Clinics" />
        </Tabs>
      </Card>

      {/* Tab Content */}
      <Box
        sx={{
          bgcolor: "white",
          borderRadius: "0 0 20px 20px",
          p: { xs: 2, sm: 3 },
          minHeight: "60vh",
        }}
      >
        {activeTab === 0 && (
          <TripTrackerEnhanced agentId={userId} agentCollection="offlineVisits" />
        )}

        {activeTab === 1 && (
          <DCOfflineVisitRecord
            userId={userId}
            userRole={userRole}
            userName={userData?.name}
            userEmpId={userData?.empId}
          />
        )}

        {activeTab === 2 && (
          <DCCustomVisit
            userId={userId}
            userRole={userRole}
            userName={userData?.name}
            userEmpId={userData?.empId}
          />
        )}

        {activeTab === 3 && (
          <ManualLeads userId={userId} agentCollection="offlineVisits" />
        )}

        {activeTab === 4 && (
          <DCVisitHistory visitLogs={visitLogs} />
        )}

        {activeTab === 5 && (
          <DCClinicsView
            assignedClinics={userData?.assignedClinics || []}
            onRecordVisit={() => setActiveTab(1)}
          />
        )}
      </Box>
    </Box>
  );
};

export default DCDashboard;
