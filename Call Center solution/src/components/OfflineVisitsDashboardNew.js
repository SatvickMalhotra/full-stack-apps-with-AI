import React, { useState, useEffect } from "react";
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
  Tabs,
  Tab,
  Chip,
  Avatar,
} from "@mui/material";
import {
  Person,
  Phone,
  Search as SearchIcon,
  Refresh,
  DirectionsWalk,
  PhoneInTalk,
  TrendingUp,
  LocationOn,
  Image as ImageIcon,
} from "@mui/icons-material";
import { collection, doc, onSnapshot, query, orderBy } from "firebase/firestore";
import { db } from "../firebaseConfig";
import OfflineVisitRecordNew from "./OfflineVisitRecordNew";
import ManualLeads from "./ManualLeads";
import TripTrackerNew from "./TripTrackerNew";

/**
 * Redesigned Offline Visits Dashboard
 * Features:
 * - No CSV export (manager-only feature)
 * - Trip Tracker integration
 * - Modern, beautiful UI
 * - Image upload support
 * - Location tracking
 */
function OfflineVisitsDashboardNew({ currentUser }) {
  const [offlineVisitLogs, setOfflineVisitLogs] = useState([]);
  const [manualCallLogs, setManualCallLogs] = useState([]);
  const [tripLogs, setTripLogs] = useState([]);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState(0); // 0 = Trip Tracker, 1 = Offline Visits, 2 = Manual Calls
  const navigate = useNavigate();

  useEffect(() => {
    if (!currentUser) return;

    let mounted = true;
    const unsubscribes = [];

    const fetchOfflineVisitsData = async () => {
      try {
        setLoading(true);

        // Get user document from offlineVisits collection
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

        // Listen to offlineVisits subcollection
        const offlineVisitsRef = collection(db, "offlineVisits", currentUser.uid, "offlineVisits");
        const offlineVisitsQuery = query(offlineVisitsRef, orderBy("timestamp", "desc"));

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

        // Listen to manualCallLogs subcollection
        const manualCallLogsRef = collection(db, "offlineVisits", currentUser.uid, "manualCallLogs");
        const manualCallLogsQuery = query(manualCallLogsRef, orderBy("timestamp", "desc"));

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

        // Listen to trips subcollection
        const tripsRef = collection(db, "offlineVisits", currentUser.uid, "trips");
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

  // Calculate stats
  const todayVisits = offlineVisitLogs.filter((visit) => {
    if (!visit.date) return false;
    return visit.date === new Date().toLocaleDateString("en-CA");
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
              {userData?.name?.charAt(0) || "U"}
            </Avatar>
            <Box>
              <Typography variant="h4" sx={{ color: "white", fontWeight: 700, fontSize: { xs: "1.5rem", sm: "2.125rem" } }}>
                {userData?.name || currentUser?.email}
              </Typography>
              <Typography variant="body1" sx={{ color: "rgba(255,255,255,0.9)", fontSize: { xs: "0.875rem", sm: "1rem" } }}>
                ID: {userData?.empId || "N/A"} • {userData?.department || "Field Operations"}
              </Typography>
            </Box>
          </Box>
          <Chip
            label={userData?.status || "Offline"}
            sx={{
              bgcolor: userData?.status === "Login" ? "#22c55e" : "rgba(255,255,255,0.2)",
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
                    {offlineVisitLogs.length}
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
                <TrendingUp sx={{ color: "white", fontSize: 36 }} />
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="h3" sx={{ color: "white", fontWeight: 700 }}>
                    {tripLogs.length}
                  </Typography>
                  <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.95)" }}>
                    Total Trips
                  </Typography>
                </Box>
              </Box>
              <Chip
                label={activeTrips > 0 ? `${activeTrips} active` : "No active trips"}
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
                <LocationOn sx={{ color: "white", fontSize: 36 }} />
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="h3" sx={{ color: "white", fontWeight: 700 }}>
                    {totalDistanceThisMonth.toFixed(1)}
                  </Typography>
                  <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.95)" }}>
                    km This Month
                  </Typography>
                </Box>
              </Box>
              <Chip
                label="For reimbursement"
                size="small"
                sx={{ bgcolor: "rgba(255,255,255,0.3)", color: "white", fontWeight: 600 }}
              />
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Trip Tracker Card - Always visible */}
      <Box sx={{ mb: 4 }}>
        <TripTrackerNew agentId={currentUser.uid} agentCollection="offlineVisits" />
      </Box>

      {/* Search Section */}
      <Box sx={{ mb: 3, display: "flex", gap: 2, flexWrap: "wrap" }}>
        <TextField
          placeholder="Search visits, calls, partners..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          sx={{
            flexGrow: 1,
            minWidth: 300,
            bgcolor: "white",
            borderRadius: "16px",
            "& .MuiOutlinedInput-root": {
              "& fieldset": { border: "none" },
              borderRadius: "16px",
            },
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: "#64748b" }} />
              </InputAdornment>
            ),
          }}
        />
        <Button
          variant="outlined"
          startIcon={<Refresh />}
          onClick={() => window.location.reload()}
          sx={{
            borderColor: "white",
            color: "white",
            "&:hover": {
              borderColor: "#e2e8f0",
              bgcolor: "rgba(255, 255, 255, 0.15)",
            },
            borderRadius: "16px",
            px: 4,
            fontWeight: 600,
          }}
        >
          REFRESH
        </Button>
      </Box>

      {/* Tabs Section */}
      <Paper
        elevation={0}
        sx={{
          bgcolor: "white",
          borderRadius: "20px 20px 0 0",
          mb: 0,
        }}
      >
        <Tabs
          value={activeTab}
          onChange={(e, newValue) => setActiveTab(newValue)}
          sx={{
            px: 2,
            "& .MuiTab-root": {
              textTransform: "none",
              fontSize: "1.1rem",
              fontWeight: 600,
              minHeight: 72,
              color: "#64748b",
              "&.Mui-selected": {
                color: "#667eea",
              },
            },
            "& .MuiTabs-indicator": {
              height: 4,
              borderRadius: "4px 4px 0 0",
              background: "linear-gradient(90deg, #667eea 0%, #764ba2 100%)",
            },
          }}
        >
          <Tab label="Offline Visits" icon={<DirectionsWalk />} iconPosition="start" />
          <Tab label="Manual Call Leads" icon={<PhoneInTalk />} iconPosition="start" />
        </Tabs>
      </Paper>

      {/* Tab Content */}
      <Paper
        elevation={0}
        sx={{
          bgcolor: "white",
          borderRadius: "0 0 20px 20px",
          minHeight: "500px",
          p: 4,
        }}
      >
        {activeTab === 0 ? (
          <Box>
            <OfflineVisitRecordNew
              agentId={currentUser.uid}
              agentCollection="offlineVisits"
              agentName={userData?.name || currentUser?.email}
            />
          </Box>
        ) : (
          <Box>
            <ManualLeads
              agentId={currentUser.uid}
              agentCollection="offlineVisits"
              agentName={userData?.name || currentUser?.email}
            />
          </Box>
        )}
      </Paper>
    </Box>
  );
}

export default OfflineVisitsDashboardNew;
