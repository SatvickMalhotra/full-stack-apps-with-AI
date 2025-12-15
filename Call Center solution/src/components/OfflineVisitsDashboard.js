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
} from "@mui/material";
import {
  Person,
  Phone,
  Search as SearchIcon,
  FileDownload,
  Refresh,
  DirectionsWalk,
  PhoneInTalk,
} from "@mui/icons-material";
import { collection, doc, onSnapshot, query, orderBy } from "firebase/firestore";
import { db } from "../firebaseConfig";
import OfflineVisitRecord from "./OfflineVisitRecord";
import ManualLeads from "./ManualLeads";

/**
 * Offline Visits Dashboard
 * Manages offline visit users from the offlineVisits collection
 * Each user has two subcollections: manualCallLogs and offlineVisits
 */
function OfflineVisitsDashboard({ currentUser }) {
  const [offlineVisitLogs, setOfflineVisitLogs] = useState([]);
  const [manualCallLogs, setManualCallLogs] = useState([]);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState(0);
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

  // Filter logs based on search query
  const filteredOfflineVisits = offlineVisitLogs.filter((visit) => {
    const query = searchQuery.toLowerCase();
    return (
      visit.clinicCode?.toLowerCase().includes(query) ||
      visit.branchName?.toLowerCase().includes(query) ||
      visit.partnerName?.toLowerCase().includes(query) ||
      visit.bmName?.toLowerCase().includes(query) ||
      visit.branchContactNo?.includes(query)
    );
  });

  const filteredManualLogs = manualCallLogs.filter((log) => {
    const query = searchQuery.toLowerCase();
    return (
      log.clientNumber?.includes(query) ||
      log.callType?.toLowerCase().includes(query) ||
      log.partner?.toLowerCase().includes(query) ||
      log.remarks?.toLowerCase().includes(query)
    );
  });

  // Format timestamp
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return "N/A";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Export to CSV - Offline Visits
  const handleExportOfflineVisits = () => {
    const headers = [
      "Date",
      "Time",
      "Clinic Code",
      "Branch Name",
      "Partner Name",
      "BM Name",
      "Branch Contact No",
      "State",
      "OPS Manager Name",
      "Visit Type",
      "Discussion Remarks",
    ];

    const rows = filteredOfflineVisits.map((visit) => [
      visit.date || "N/A",
      visit.time || "N/A",
      visit.clinicCode || "N/A",
      visit.branchName || "N/A",
      visit.partnerName || "N/A",
      visit.bmName || "N/A",
      visit.branchContactNo || "N/A",
      visit.state || "N/A",
      visit.opsManagerName || "N/A",
      visit.visitType || "N/A",
      visit.discussionRemarks || "N/A",
    ]);

    if (rows.length === 0) {
      rows.push(Array(headers.length).fill("No data available"));
    }

    const csvContent = [
      headers.join(","),
      ...rows.map((row) =>
        row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `offline_visits_${new Date().toISOString().split("T")[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export to CSV - Manual Call Logs
  const handleExportManualLogs = () => {
    const headers = [
      "Timestamp",
      "Client Number",
      "Call Type",
      "Call Connected",
      "Call Status",
      "Call Category",
      "Partner",
      "Escalation",
      "Department",
      "Duration",
      "Remarks",
    ];

    const rows = filteredManualLogs.map((log) => [
      log.timestamp ? formatTimestamp(log.timestamp) : "N/A",
      log.clientNumber || "N/A",
      log.callType || "N/A",
      log.callConnected ? "Yes" : "No",
      log.callStatus || "N/A",
      log.callCategory || "N/A",
      log.partner || "N/A",
      log.escalation || "N/A",
      log.department || "N/A",
      log.duration ? `${log.duration.hours || 0}h ${log.duration.minutes || 0}m ${log.duration.seconds || 0}s` : "N/A",
      log.remarks || "N/A",
    ]);

    if (rows.length === 0) {
      rows.push(Array(headers.length).fill("No data available"));
    }

    const csvContent = [
      headers.join(","),
      ...rows.map((row) =>
        row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `manual_call_logs_${new Date().toISOString().split("T")[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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
        p: 3,
      }}
    >
      {/* Header Section */}
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h4"
          sx={{
            color: "white",
            fontWeight: 700,
            mb: 1,
            display: "flex",
            alignItems: "center",
            gap: 2,
          }}
        >
          <DirectionsWalk sx={{ fontSize: 40 }} />
          Offline Visits Dashboard
        </Typography>
        <Typography variant="body1" sx={{ color: "rgba(255,255,255,0.9)" }}>
          {userData?.name || currentUser?.email}
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card
            elevation={0}
            sx={{
              background: "linear-gradient(135deg, #667eea, #764ba2)",
              borderRadius: "16px",
              boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
            }}
          >
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <DirectionsWalk sx={{ color: "white", fontSize: 32 }} />
                <Box>
                  <Typography variant="h4" sx={{ color: "white", fontWeight: 700 }}>
                    {offlineVisitLogs.length}
                  </Typography>
                  <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.9)" }}>
                    Total Offline Visits
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card
            elevation={0}
            sx={{
              background: "linear-gradient(135deg, #f093fb, #f5576c)",
              borderRadius: "16px",
              boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
            }}
          >
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <PhoneInTalk sx={{ color: "white", fontSize: 32 }} />
                <Box>
                  <Typography variant="h4" sx={{ color: "white", fontWeight: 700 }}>
                    {manualCallLogs.length}
                  </Typography>
                  <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.9)" }}>
                    Manual Call Logs
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card
            elevation={0}
            sx={{
              background: "linear-gradient(135deg, #4facfe, #00f2fe)",
              borderRadius: "16px",
              boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
            }}
          >
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Person sx={{ color: "white", fontSize: 32 }} />
                <Box>
                  <Typography variant="h4" sx={{ color: "white", fontWeight: 700 }}>
                    {userData?.empId || "N/A"}
                  </Typography>
                  <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.9)" }}>
                    Employee ID
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card
            elevation={0}
            sx={{
              background: "linear-gradient(135deg, #43e97b, #38f9d7)",
              borderRadius: "16px",
              boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
            }}
          >
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Phone sx={{ color: "white", fontSize: 32 }} />
                <Box>
                  <Typography variant="h4" sx={{ color: "white", fontWeight: 700 }}>
                    {userData?.mobile || "N/A"}
                  </Typography>
                  <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.9)" }}>
                    Contact Number
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Search and Export Section */}
      <Box sx={{ mb: 3, display: "flex", gap: 2, flexWrap: "wrap" }}>
        <TextField
          placeholder="Search visits, calls, phone numbers..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          sx={{
            flexGrow: 1,
            minWidth: 300,
            bgcolor: "white",
            borderRadius: "12px",
            "& .MuiOutlinedInput-root": {
              "& fieldset": { border: "none" },
            },
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
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
              bgcolor: "rgba(255, 255, 255, 0.1)",
            },
            borderRadius: "12px",
            px: 3,
          }}
        >
          REFRESH
        </Button>
        <Button
          variant="contained"
          startIcon={<FileDownload />}
          onClick={activeTab === 0 ? handleExportManualLogs : handleExportOfflineVisits}
          sx={{
            bgcolor: "#22c55e",
            "&:hover": { bgcolor: "#16a34a" },
            borderRadius: "12px",
            px: 3,
          }}
        >
          EXPORT CSV
        </Button>
      </Box>

      {/* Tabs Section */}
      <Paper
        elevation={0}
        sx={{
          bgcolor: "white",
          borderRadius: "16px 16px 0 0",
          mb: 0,
        }}
      >
        <Tabs
          value={activeTab}
          onChange={(e, newValue) => setActiveTab(newValue)}
          sx={{
            "& .MuiTab-root": {
              textTransform: "none",
              fontSize: "1rem",
              fontWeight: 600,
              minHeight: 64,
            },
            "& .Mui-selected": {
              color: "#667eea !important",
            },
          }}
        >
          <Tab label="Manual Call Leads" icon={<PhoneInTalk />} iconPosition="start" />
          <Tab label="Offline Visits" icon={<DirectionsWalk />} iconPosition="start" />
        </Tabs>
      </Paper>

      {/* Tab Content */}
      <Paper
        elevation={0}
        sx={{
          bgcolor: "white",
          borderRadius: "0 0 16px 16px",
          minHeight: "400px",
        }}
      >
        {activeTab === 0 ? (
          <Box sx={{ p: 3 }}>
            <ManualLeads
              agentId={currentUser.uid}
              agentCollection="offlineVisits"
              agentName={userData?.name || currentUser?.email}
            />
          </Box>
        ) : (
          <Box sx={{ p: 3 }}>
            <OfflineVisitRecord
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

export default OfflineVisitsDashboard;
