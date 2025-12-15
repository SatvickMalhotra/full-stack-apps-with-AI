import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  List,
  ListItem,
  Chip,
  Divider,
  IconButton,
  CircularProgress,
} from "@mui/material";
import {
  Phone,
  PlayArrow,
  Search,
  FilterList,
  AccessTime,
} from "@mui/icons-material";

const CallHistory = ({ callLogs, agentName }) => {
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [timeFilter, setTimeFilter] = useState("24h");
  const [loadingRecordings, setLoadingRecordings] = useState({});

  // Filter logs based on time period and search term
  useEffect(() => {
    let filtered = [...callLogs];

    // Apply time filter
    const now = new Date();
    let cutoffTime;

    switch (timeFilter) {
      case "24h":
        cutoffTime = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case "week":
        cutoffTime = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case "month":
        cutoffTime = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      default:
        cutoffTime = new Date(0); // Show all
    }

    filtered = filtered.filter((log) => {
      if (!log.timestamp) return false;
      const logTime = log.timestamp.toDate();
      return logTime >= cutoffTime;
    });

    // Apply search filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (log) =>
          (log.clientNumber && log.clientNumber.includes(search)) ||
          (log.sid && log.sid.toLowerCase().includes(search)) ||
          (log.agentName && log.agentName.toLowerCase().includes(search)) ||
          (log.callerId && log.callerId.includes(search)) ||
          (log.partnerName && log.partnerName.toLowerCase().includes(search)) ||
          (log.remarks && log.remarks.toLowerCase().includes(search))
      );
    }

    // Sort by timestamp (latest first)
    filtered.sort((a, b) => {
      if (!a.timestamp) return 1;
      if (!b.timestamp) return -1;
      return b.timestamp.toDate() - a.timestamp.toDate();
    });

    setFilteredLogs(filtered);
  }, [callLogs, timeFilter, searchTerm]);

  const formatDuration = (duration) => {
    if (
      !duration ||
      typeof duration !== "object" ||
      (!duration.hours && !duration.minutes && !duration.seconds)
    )
      return null;
    return `${duration.hours || 0}h ${duration.minutes || 0}m ${
      duration.seconds || 0
    }s`;
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return "";
    const date = timestamp.toDate();
    const now = new Date();
    const diff = now - date;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (hours < 1) {
      return `${minutes} min${minutes !== 1 ? "s" : ""} ago`;
    } else if (hours < 24) {
      return `${hours} hour${hours !== 1 ? "s" : ""} ago`;
    } else {
      return date.toLocaleString();
    }
  };

  const fetchRecording = async (sid) => {
    if (!sid) {
      alert("No call SID available for this call");
      return;
    }

    setLoadingRecordings((prev) => ({ ...prev, [sid]: true }));

    try {
      const ACCOUNT_SID = process.env.REACT_APP_ACCOUNT_SID;

      // Construct the direct Exotel call details URL
      // Format: https://my.exotel.com/{AccountSid}/calls/{CallSid}
      const recordingUrl = `https://my.exotel.com/${ACCOUNT_SID}/calls/${sid}`;

      // Open in new tab - user will need to log into Exotel if not already logged in
      window.open(recordingUrl, "_blank");

      alert("Recording page opened in new tab. You may need to log into your Exotel account to access it.");
    } catch (error) {
      console.error("Error opening recording:", error);
      alert("Failed to open recording. Please try again or contact support.");
    } finally {
      setLoadingRecordings((prev) => ({ ...prev, [sid]: false }));
    }
  };

  return (
    <Box sx={{ width: "100%", p: 2 }}>
      {/* Filters and Search */}
      <Box
        sx={{
          display: "flex",
          gap: 2,
          mb: 3,
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >
        <TextField
          placeholder="Search by number, name, SID, partner..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: <Search sx={{ mr: 1, color: "text.secondary" }} />,
          }}
          size="small"
          sx={{ flexGrow: 1, minWidth: "250px" }}
        />

        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Time Period</InputLabel>
          <Select
            value={timeFilter}
            label="Time Period"
            onChange={(e) => setTimeFilter(e.target.value)}
            startAdornment={<FilterList sx={{ mr: 1 }} />}
          >
            <MenuItem value="24h">Last 24 Hours</MenuItem>
            <MenuItem value="week">Last Week</MenuItem>
            <MenuItem value="month">Last Month</MenuItem>
            <MenuItem value="all">All Time</MenuItem>
          </Select>
        </FormControl>

        <Box>
          <Typography variant="body2" color="text.secondary">
            {filteredLogs.length} call{filteredLogs.length !== 1 ? "s" : ""}{" "}
            found
          </Typography>
        </Box>
      </Box>

      {/* Call History List */}
      <Paper elevation={0} sx={{ border: "1px solid #e0e0e0" }}>
        <List disablePadding>
          {filteredLogs.length === 0 ? (
            <ListItem sx={{ py: 8, justifyContent: "center" }}>
              <Box textAlign="center">
                <Phone sx={{ fontSize: 48, color: "text.secondary", mb: 2 }} />
                <Typography variant="h6" color="text.secondary">
                  No calls found
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {searchTerm
                    ? "Try adjusting your search or filter"
                    : "Start making calls to see them here"}
                </Typography>
              </Box>
            </ListItem>
          ) : (
            filteredLogs.map((log, index) => (
              <React.Fragment key={log.id || index}>
                <ListItem
                  sx={{
                    py: 2,
                    px: 3,
                    "&:hover": { bgcolor: "rgba(0, 0, 0, 0.02)" },
                  }}
                >
                  <Box sx={{ width: "100%" }}>
                    {/* Header Row */}
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        mb: 1,
                      }}
                    >
                      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                        <Phone sx={{ color: "primary.main" }} />
                        <Box>
                          <Typography variant="subtitle1" fontWeight={600}>
                            {log.clientNumber}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {formatTimestamp(log.timestamp)}
                          </Typography>
                        </Box>
                      </Box>

                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        {log.sid && (
                          <IconButton
                            size="small"
                            onClick={() => fetchRecording(log.sid)}
                            disabled={loadingRecordings[log.sid]}
                            sx={{
                              bgcolor: "primary.main",
                              color: "white",
                              "&:hover": { bgcolor: "primary.dark" },
                              "&:disabled": { bgcolor: "grey.300" },
                            }}
                          >
                            {loadingRecordings[log.sid] ? (
                              <CircularProgress size={20} color="inherit" />
                            ) : (
                              <PlayArrow />
                            )}
                          </IconButton>
                        )}
                        <Chip
                          label={log.callConnected ? "Connected" : "Not Connected"}
                          color={log.callConnected ? "success" : "error"}
                          size="small"
                        />
                      </Box>
                    </Box>

                    {/* Details Grid */}
                    <Box
                      sx={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                        gap: 2,
                        mt: 2,
                        p: 2,
                        bgcolor: "rgba(0, 0, 0, 0.02)",
                        borderRadius: 1,
                      }}
                    >
                      {log.callType && (
                        <Box>
                          <Typography variant="caption" color="text.secondary">
                            Call Type
                          </Typography>
                          <Typography variant="body2" fontWeight={500}>
                            {log.callType}
                          </Typography>
                        </Box>
                      )}

                      {log.callerId && (
                        <Box>
                          <Typography variant="caption" color="text.secondary">
                            Caller ID
                          </Typography>
                          <Typography variant="body2" fontWeight={500}>
                            {log.callerId}
                          </Typography>
                        </Box>
                      )}

                      {log.agentType && (
                        <Box>
                          <Typography variant="caption" color="text.secondary">
                            Agent Type
                          </Typography>
                          <Typography variant="body2" fontWeight={500}>
                            {log.agentType}
                          </Typography>
                        </Box>
                      )}

                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Status
                        </Typography>
                        <Typography variant="body2" fontWeight={500}>
                          {log.callConnected
                            ? log.callStatus
                            : log.notConnectedReason}
                        </Typography>
                      </Box>

                      {log.callConnected && formatDuration(log.duration) && (
                        <Box>
                          <Typography variant="caption" color="text.secondary">
                            Duration
                          </Typography>
                          <Typography variant="body2" fontWeight={500}>
                            <AccessTime sx={{ fontSize: 14, mr: 0.5 }} />
                            {formatDuration(log.duration)}
                          </Typography>
                        </Box>
                      )}

                      {log.sid && (
                        <Box>
                          <Typography variant="caption" color="text.secondary">
                            Call SID
                          </Typography>
                          <Typography
                            variant="body2"
                            fontWeight={500}
                            sx={{
                              fontFamily: "monospace",
                              fontSize: "0.75rem",
                            }}
                          >
                            {log.sid}
                          </Typography>
                        </Box>
                      )}

                      {log.remarks && (
                        <Box sx={{ gridColumn: "1 / -1" }}>
                          <Typography variant="caption" color="text.secondary">
                            Remarks
                          </Typography>
                          <Typography variant="body2">{log.remarks}</Typography>
                        </Box>
                      )}
                    </Box>
                  </Box>
                </ListItem>
                {index < filteredLogs.length - 1 && <Divider />}
              </React.Fragment>
            ))
          )}
        </List>
      </Paper>
    </Box>
  );
};

export default CallHistory;
