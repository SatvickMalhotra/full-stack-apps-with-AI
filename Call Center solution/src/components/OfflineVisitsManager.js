import React, { useState } from "react";
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
  Chip,
  Avatar,
} from "@mui/material";
import {
  DirectionsWalk,
  PhoneInTalk,
  Person,
  Search as SearchIcon,
  FileDownload,
  Refresh,
  TrendingUp,
  Group,
  Circle,
  BarChart as BarChartIcon,
  ShowChart,
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
  LineChart,
  Line,
} from "recharts";

/**
 * Offline Visits Manager - For Super Manager Dashboard
 * Displays all offline visits users, their visit logs, and manual call logs
 */
function OfflineVisitsManager({ offlineVisitsData }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState(0); // 0 = Manual Call Logs, 1 = Offline Visits, 2 = Analytics
  const [showAnalytics, setShowAnalytics] = useState(false);

  const { users, visitLogs, manualCallLogs, trips = [] } = offlineVisitsData;

  // Calculate stats
  const totalUsers = users.length;
  const onlineUsers = users.filter((u) => u.status === "Login").length;
  const totalVisits = visitLogs.length;
  const totalManualCalls = manualCallLogs.length;
  const connectedCalls = manualCallLogs.filter((log) => log.callConnected).length;
  const totalTrips = trips.length;
  const completedTrips = trips.filter((trip) => trip.status === "completed").length;

  // Filter manual call logs based on search query
  const filteredManualLogs = manualCallLogs.filter((log) => {
    const query = searchQuery.toLowerCase();
    return (
      log.userName?.toLowerCase().includes(query) ||
      log.userEmpId?.toLowerCase().includes(query) ||
      log.clientNumber?.includes(query) ||
      log.callType?.toLowerCase().includes(query) ||
      log.partner?.toLowerCase().includes(query) ||
      log.remarks?.toLowerCase().includes(query)
    );
  });

  // Filter offline visits based on search query
  const filteredVisits = visitLogs.filter((visit) => {
    const query = searchQuery.toLowerCase();
    return (
      visit.userName?.toLowerCase().includes(query) ||
      visit.userEmpId?.toLowerCase().includes(query) ||
      visit.clinicCode?.toLowerCase().includes(query) ||
      visit.branchName?.toLowerCase().includes(query) ||
      visit.partnerName?.toLowerCase().includes(query) ||
      visit.bmName?.toLowerCase().includes(query) ||
      visit.branchContactNo?.includes(query) ||
      visit.bmContact?.includes(query)
    );
  });

  // Filter trips based on search query
  const filteredTrips = trips.filter((trip) => {
    const query = searchQuery.toLowerCase();
    return (
      trip.userName?.toLowerCase().includes(query) ||
      trip.userEmpId?.toLowerCase().includes(query) ||
      trip.status?.toLowerCase().includes(query)
    );
  });

  // Format duration from milliseconds
  const formatDuration = (milliseconds) => {
    if (!milliseconds) return "N/A";
    const totalSeconds = Math.floor(milliseconds / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  // Format location coordinates
  const formatLocation = (location) => {
    if (!location || !location.latitude || !location.longitude) return "N/A";
    return `${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}`;
  };

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

  // Analytics Data
  const analyticsData = {
    // Visits by user
    visitsByUser: users.map((user) => ({
      name: user.name || user.empId,
      visits: visitLogs.filter((v) => v.userId === user.id).length,
      calls: manualCallLogs.filter((c) => c.userId === user.id).length,
    })).sort((a, b) => b.visits - a.visits).slice(0, 5),

    // Call status distribution
    callStatus: [
      { name: "Connected", value: connectedCalls },
      { name: "Not Connected", value: totalManualCalls - connectedCalls },
    ],

    // Visits by partner
    visitsByPartner: (() => {
      const partners = {};
      visitLogs.forEach((visit) => {
        const partner = visit.partnerName || "Unknown";
        partners[partner] = (partners[partner] || 0) + 1;
      });
      return Object.entries(partners)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 5);
    })(),

    // Calls by type
    callsByType: (() => {
      const types = {};
      manualCallLogs.forEach((log) => {
        const type = log.callType || "Unknown";
        types[type] = (types[type] || 0) + 1;
      });
      return Object.entries(types).map(([name, value]) => ({ name, value }));
    })(),

    // Visits trend (last 7 days)
    visitsTrend: (() => {
      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (6 - i));
        return date.toISOString().split("T")[0];
      });

      return last7Days.map((date) => {
        const visitsOnDate = visitLogs.filter((v) => {
          if (!v.date) return false;
          // date field is in format YYYY-MM-DD
          return v.date === date;
        });

        const callsOnDate = manualCallLogs.filter((c) => {
          if (!c.timestamp) return false;
          const logDate = new Date(c.timestamp.toDate ? c.timestamp.toDate() : c.timestamp)
            .toISOString()
            .split("T")[0];
          return logDate === date;
        });

        return {
          date: new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
          visits: visitsOnDate.length,
          calls: callsOnDate.length,
        };
      });
    })(),
  };

  const CHART_COLORS = ["#3b82f6", "#22c55e", "#f59e0b", "#ef4444", "#a855f7", "#06b6d4"];

  // Export Manual Call Logs to CSV
  const handleExportManualLogs = () => {
    const headers = [
      "User Name",
      "Employee ID",
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
      log.userName || "N/A",
      log.userEmpId || "N/A",
      log.timestamp ? formatTimestamp(log.timestamp) : "N/A",
      log.clientNumber || "N/A",
      log.callType || "N/A",
      log.callConnected ? "Yes" : "No",
      log.callStatus || "N/A",
      log.callCategory || "N/A",
      log.partner || "N/A",
      log.escalation || "N/A",
      log.department || "N/A",
      formatDuration(log.duration),
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
    link.setAttribute("download", `offline_visits_manual_calls_${new Date().toISOString().split("T")[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export Offline Visits to CSV
  const handleExportVisits = () => {
    const headers = [
      "User Name",
      "Employee ID",
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
      "Visit Duration",
      "Punch In Location",
      "Punch Out Location",
      "Image URLs",
      "Discussion Remarks",
    ];

    const rows = filteredVisits.map((visit) => {
      // Extract date and time from createdAt if date/time fields are missing
      let dateStr = visit.date || "N/A";
      let timeStr = visit.time || "N/A";

      if ((dateStr === "N/A" || timeStr === "N/A") && visit.createdAt) {
        const timestamp = visit.createdAt.toDate ? visit.createdAt.toDate() : new Date(visit.createdAt);
        if (dateStr === "N/A") {
          dateStr = timestamp.toISOString().split("T")[0];
        }
        if (timeStr === "N/A") {
          timeStr = timestamp.toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
          });
        }
      }

      return [
        visit.userName || "N/A",
        visit.userEmpId || "N/A",
        dateStr,
        timeStr,
        visit.clinicCode || "N/A",
        visit.branchName || "N/A",
        visit.partnerName || "N/A",
        visit.bmName || "N/A",
        visit.branchContactNo || visit.bmContact || "N/A",
        visit.state || "N/A",
        visit.opsManagerName || visit.opsManager || "N/A",
        visit.visitType || "N/A",
        visit.punchInData?.durationFormatted || visit.durationFormatted || "N/A",
        visit.punchInData?.punchInLocation || visit.punchInLocation
          ? `${(visit.punchInData?.punchInLocation?.latitude || visit.punchInLocation?.latitude).toFixed(6)}, ${(visit.punchInData?.punchInLocation?.longitude || visit.punchInLocation?.longitude).toFixed(6)}`
          : "N/A",
        visit.punchInData?.punchOutLocation || visit.punchOutLocation
          ? `${(visit.punchInData?.punchOutLocation?.latitude || visit.punchOutLocation?.latitude).toFixed(6)}, ${(visit.punchInData?.punchOutLocation?.longitude || visit.punchOutLocation?.longitude).toFixed(6)}`
          : "N/A",
        visit.images && visit.images.length > 0
          ? (typeof visit.images[0] === 'string' ? visit.images.join(" | ") : visit.images.map(img => img.url).join(" | "))
          : "No images",
        visit.discussionRemarks || visit.remarks || "N/A",
      ];
    });

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
    link.setAttribute("download", `offline_visits_logs_${new Date().toISOString().split("T")[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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
          Offline Visits Management
        </Typography>
        <Typography variant="body1" sx={{ color: "rgba(255,255,255,0.9)" }}>
          View and manage all offline visits users and their activity
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
                <Group sx={{ color: "white", fontSize: 32 }} />
                <Box>
                  <Typography variant="h4" sx={{ color: "white", fontWeight: 700 }}>
                    {totalUsers}
                  </Typography>
                  <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.9)" }}>
                    Total Users
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
              background: "linear-gradient(135deg, #22c55e, #16a34a)",
              borderRadius: "16px",
              boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
            }}
          >
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Circle sx={{ color: "white", fontSize: 32 }} />
                <Box>
                  <Typography variant="h4" sx={{ color: "white", fontWeight: 700 }}>
                    {onlineUsers}
                  </Typography>
                  <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.9)" }}>
                    Online Users
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
                <DirectionsWalk sx={{ color: "white", fontSize: 32 }} />
                <Box>
                  <Typography variant="h4" sx={{ color: "white", fontWeight: 700 }}>
                    {totalVisits}
                  </Typography>
                  <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.9)" }}>
                    Total Visits
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
                <PhoneInTalk sx={{ color: "white", fontSize: 32 }} />
                <Box>
                  <Typography variant="h4" sx={{ color: "white", fontWeight: 700 }}>
                    {totalManualCalls}
                  </Typography>
                  <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.9)" }}>
                    Manual Calls
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
          placeholder="Search by name, phone, clinic, partner..."
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
          variant="outlined"
          startIcon={<BarChartIcon />}
          onClick={() => setShowAnalytics(!showAnalytics)}
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
          {showAnalytics ? "HIDE" : "SHOW"} ANALYTICS
        </Button>
        <Button
          variant="contained"
          startIcon={<FileDownload />}
          onClick={activeTab === 0 ? handleExportManualLogs : handleExportVisits}
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

      {/* Analytics Section */}
      {showAnalytics && (
        <Box sx={{ mb: 4 }}>
          <Typography
            variant="h5"
            sx={{
              color: "white",
              mb: 3,
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              gap: 1,
            }}
          >
            <ShowChart /> Offline Visits Analytics
          </Typography>

          <Grid container spacing={3}>
            {/* Activity Trend (Last 7 Days) */}
            <Grid item xs={12} lg={8}>
              <Card sx={{ bgcolor: "white", borderRadius: "16px", p: 2 }}>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                  Activity Trend (Last 7 Days)
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={analyticsData.visitsTrend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <RechartsTooltip />
                    <Legend />
                    <Line type="monotone" dataKey="visits" stroke="#667eea" name="Visits" strokeWidth={2} />
                    <Line type="monotone" dataKey="calls" stroke="#f093fb" name="Calls" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </Card>
            </Grid>

            {/* Call Status Distribution */}
            <Grid item xs={12} lg={4}>
              <Card sx={{ bgcolor: "white", borderRadius: "16px", p: 2 }}>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                  Call Status
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={analyticsData.callStatus}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={(entry) => `${entry.name}: ${entry.value}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {analyticsData.callStatus.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={index === 0 ? "#22c55e" : "#ef4444"} />
                      ))}
                    </Pie>
                    <RechartsTooltip />
                  </PieChart>
                </ResponsiveContainer>
              </Card>
            </Grid>

            {/* Top Users by Activity */}
            <Grid item xs={12} lg={6}>
              <Card sx={{ bgcolor: "white", borderRadius: "16px", p: 2 }}>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                  Top 5 Users by Activity
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={analyticsData.visitsByUser} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" width={120} />
                    <RechartsTooltip />
                    <Legend />
                    <Bar dataKey="visits" fill="#667eea" name="Visits" />
                    <Bar dataKey="calls" fill="#f093fb" name="Calls" />
                  </BarChart>
                </ResponsiveContainer>
              </Card>
            </Grid>

            {/* Visits by Partner */}
            <Grid item xs={12} lg={6}>
              <Card sx={{ bgcolor: "white", borderRadius: "16px", p: 2 }}>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                  Top 5 Partners by Visits
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={analyticsData.visitsByPartner}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <RechartsTooltip />
                    <Bar dataKey="value" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </Card>
            </Grid>
          </Grid>
        </Box>
      )}

      {/* Users Overview */}
      <Paper
        elevation={0}
        sx={{
          bgcolor: "white",
          borderRadius: "16px",
          p: 3,
          mb: 3,
        }}
      >
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
          Offline Visits Users
        </Typography>
        <Grid container spacing={2}>
          {users.map((user) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={user.id}>
              <Card
                sx={{
                  borderRadius: "12px",
                  border: "1px solid #e2e8f0",
                  transition: "all 0.2s",
                  "&:hover": {
                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                    transform: "translateY(-2px)",
                  },
                }}
              >
                <CardContent>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
                    <Avatar sx={{ bgcolor: "#667eea" }}>
                      <Person />
                    </Avatar>
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                        {user.name}
                      </Typography>
                      <Typography variant="caption" sx={{ color: "#64748b" }}>
                        {user.empId}
                      </Typography>
                    </Box>
                    <Chip
                      label={user.status || "Offline"}
                      size="small"
                      sx={{
                        bgcolor: user.status === "Login" ? "#dcfce7" : "#fee2e2",
                        color: user.status === "Login" ? "#16a34a" : "#dc2626",
                      }}
                    />
                  </Box>
                  <Typography variant="body2" sx={{ color: "#64748b", mb: 0.5 }}>
                    {user.email}
                  </Typography>
                  <Typography variant="body2" sx={{ color: "#64748b" }}>
                    {user.mobile}
                  </Typography>
                  <Box sx={{ mt: 2, display: "flex", gap: 1 }}>
                    <Chip
                      icon={<DirectionsWalk />}
                      label={`${visitLogs.filter((v) => v.userId === user.id).length} Visits`}
                      size="small"
                      variant="outlined"
                    />
                    <Chip
                      icon={<PhoneInTalk />}
                      label={`${manualCallLogs.filter((c) => c.userId === user.id).length} Calls`}
                      size="small"
                      variant="outlined"
                    />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Paper>

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
          <Tab label="Manual Call Logs" icon={<PhoneInTalk />} iconPosition="start" />
          <Tab label="Offline Visits" icon={<DirectionsWalk />} iconPosition="start" />
          <Tab label="Trip Tracking" icon={<TrendingUp />} iconPosition="start" />
        </Tabs>
      </Paper>

      {/* Tab Content */}
      <Paper
        elevation={0}
        sx={{
          bgcolor: "white",
          borderRadius: "0 0 16px 16px",
          minHeight: "400px",
          p: 3,
        }}
      >
        {activeTab === 0 && (
          // Manual Call Logs Table
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: "#f8fafc" }}>
                  <TableCell sx={{ fontWeight: 600 }}>User</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Emp ID</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Timestamp</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Client Number</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Call Type</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Partner</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Duration</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Remarks</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredManualLogs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} align="center" sx={{ py: 4 }}>
                      <Typography variant="body1" sx={{ color: "#64748b" }}>
                        No manual call logs found
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredManualLogs.map((log) => (
                    <TableRow key={log.id} hover>
                      <TableCell>{log.userName || "N/A"}</TableCell>
                      <TableCell>{log.userEmpId || "N/A"}</TableCell>
                      <TableCell>{formatTimestamp(log.timestamp)}</TableCell>
                      <TableCell>{log.clientNumber || "N/A"}</TableCell>
                      <TableCell>{log.callType || "N/A"}</TableCell>
                      <TableCell>
                        <Chip
                          label={log.callConnected ? "Connected" : "Not Connected"}
                          size="small"
                          sx={{
                            bgcolor: log.callConnected ? "#dcfce7" : "#fee2e2",
                            color: log.callConnected ? "#16a34a" : "#dc2626",
                          }}
                        />
                      </TableCell>
                      <TableCell>{log.partner || "N/A"}</TableCell>
                      <TableCell>{formatDuration(log.duration)}</TableCell>
                      <TableCell sx={{ maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis" }}>
                        {log.remarks || "N/A"}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {activeTab === 1 && (
          // Offline Visits Table
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: "#f8fafc" }}>
                  <TableCell sx={{ fontWeight: 600 }}>User</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Emp ID</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Clinic Code</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Branch Name</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Partner</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>BM Name</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Contact</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>State</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Visit Type</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Duration</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Images</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Location</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Remarks</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredVisits.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={14} align="center" sx={{ py: 4 }}>
                      <Typography variant="body1" sx={{ color: "#64748b" }}>
                        No offline visits found
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredVisits.map((visit) => {
                    // Extract date from createdAt if date field is missing
                    let displayDate = visit.date;
                    if (!displayDate && visit.createdAt) {
                      const timestamp = visit.createdAt.toDate ? visit.createdAt.toDate() : new Date(visit.createdAt);
                      displayDate = timestamp.toISOString().split("T")[0];
                    }

                    return (
                      <TableRow key={visit.id} hover>
                        <TableCell>{visit.userName || "N/A"}</TableCell>
                        <TableCell>{visit.userEmpId || "N/A"}</TableCell>
                        <TableCell>{displayDate || "N/A"}</TableCell>
                        <TableCell>{visit.clinicCode || "N/A"}</TableCell>
                      <TableCell>{visit.branchName || "N/A"}</TableCell>
                      <TableCell>{visit.partnerName || "N/A"}</TableCell>
                      <TableCell>{visit.bmName || "N/A"}</TableCell>
                      <TableCell>{visit.branchContactNo || visit.bmContact || "N/A"}</TableCell>
                      <TableCell>{visit.state || "N/A"}</TableCell>
                      <TableCell>
                        <Chip label={visit.visitType || "N/A"} size="small" variant="outlined" />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={visit.punchInData?.durationFormatted || visit.durationFormatted || "N/A"}
                          size="small"
                          sx={{
                            bgcolor: (visit.punchInData || visit.durationFormatted) ? "#dcfce7" : "#fee2e2",
                            color: (visit.punchInData || visit.durationFormatted) ? "#16a34a" : "#dc2626",
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        {visit.images?.length > 0 ? (
                          <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap" }}>
                            {visit.images.map((img, idx) => (
                              <Button
                                key={idx}
                                size="small"
                                variant="outlined"
                                onClick={() => window.open(typeof img === 'string' ? img : img.url, "_blank", "noopener,noreferrer")}
                                sx={{
                                  minWidth: "auto",
                                  px: 1,
                                  py: 0.5,
                                  fontSize: "0.75rem",
                                }}
                              >
                                Photo {idx + 1}
                              </Button>
                            ))}
                          </Box>
                        ) : (
                          <Chip
                            label="No images"
                            size="small"
                            sx={{
                              bgcolor: "#fee2e2",
                              color: "#dc2626",
                            }}
                          />
                        )}
                      </TableCell>
                      <TableCell>
                        {(visit.punchInData?.punchInLocation || visit.punchInLocation) ? (
                          <Typography variant="caption" sx={{ fontFamily: "monospace" }}>
                            {(visit.punchInData?.punchInLocation?.latitude || visit.punchInLocation?.latitude).toFixed(4)},
                            {(visit.punchInData?.punchInLocation?.longitude || visit.punchInLocation?.longitude).toFixed(4)}
                          </Typography>
                        ) : (
                          "N/A"
                        )}
                      </TableCell>
                      <TableCell sx={{ maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis" }}>
                        {visit.discussionRemarks || visit.remarks || "N/A"}
                      </TableCell>
                    </TableRow>
                  );
                  })
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {activeTab === 2 && (
          // Trip Tracking Table
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: "#f8fafc" }}>
                  <TableCell sx={{ fontWeight: 600 }}>User</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Emp ID</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Start Time</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>End Time</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Distance (km)</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Duration</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Start Location</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>End Location</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredTrips.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} align="center" sx={{ py: 4 }}>
                      <Typography variant="body1" sx={{ color: "#64748b" }}>
                        {searchQuery ? "No trips found matching your search" : "Trip data will appear here once agents start tracking trips"}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredTrips.map((trip) => (
                    <TableRow key={trip.id} hover>
                      <TableCell>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          <Avatar sx={{ width: 32, height: 32, bgcolor: "#667eea" }}>
                            {trip.userName?.charAt(0).toUpperCase()}
                          </Avatar>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {trip.userName || "Unknown"}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{trip.userEmpId || "N/A"}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontSize: "0.875rem" }}>
                          {formatTimestamp(trip.startTime)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontSize: "0.875rem" }}>
                          {trip.endTime ? formatTimestamp(trip.endTime) : "In Progress"}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {trip.totalDistance ? `${trip.totalDistance.toFixed(2)} km` : "-"}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontFamily: "monospace" }}>
                          {trip.totalDuration ? formatDuration(trip.totalDuration) : "-"}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontSize: "0.75rem", fontFamily: "monospace" }}>
                          {formatLocation(trip.startLocation)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontSize: "0.75rem", fontFamily: "monospace" }}>
                          {trip.endLocation ? formatLocation(trip.endLocation) : "-"}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={trip.status === "completed" ? "Completed" : "Active"}
                          size="small"
                          sx={{
                            bgcolor: trip.status === "completed" ? "#22c55e" : "#f59e0b",
                            color: "white",
                            fontWeight: 600,
                          }}
                        />
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>
    </Box>
  );
}

export default OfflineVisitsManager;
