import React from "react";
import {
  Box,
  Typography,
  Card,
  Grid,
  Chip,
} from "@mui/material";

/**
 * DCVisitHistory Component
 * Displays visit history for DC agents
 */
const DCVisitHistory = ({ visitLogs }) => {
  // Format timestamp
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return "N/A";
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return date.toLocaleString();
    } catch (error) {
      return "N/A";
    }
  };

  if (visitLogs.length === 0) {
    return (
      <Box
        sx={{
          textAlign: "center",
          py: 8,
        }}
      >
        <Typography variant="h6" sx={{ color: "#64748b", mb: 2 }}>
          No visits recorded yet
        </Typography>
        <Typography variant="body2" sx={{ color: "#94a3b8" }}>
          Your visit history will appear here once you start recording clinic visits
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 3, fontWeight: 600, color: "#1e293b" }}>
        Visit History ({visitLogs.length})
      </Typography>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {visitLogs.map((log) => (
          <Card
            key={log.id}
            sx={{
              p: 3,
              border: "1px solid #e2e8f0",
              borderRadius: "12px",
              "&:hover": {
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                transition: "box-shadow 0.2s",
              },
            }}
          >
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                mb: 2,
                flexWrap: "wrap",
                gap: 2,
              }}
            >
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 600, color: "#1e293b" }}>
                  {log.clinicCode}
                </Typography>
                <Typography variant="body2" sx={{ color: "#64748b" }}>
                  {log.branchName}, {log.state}
                </Typography>
              </Box>
              <Chip
                label={log.status || "Completed"}
                sx={{
                  bgcolor: "#22c55e",
                  color: "white",
                  fontWeight: 600,
                }}
                size="small"
              />
            </Box>

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={4}>
                <Typography variant="caption" sx={{ color: "#64748b", display: "block" }}>
                  Partner
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  {log.partnerName || "N/A"}
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6} md={4}>
                <Typography variant="caption" sx={{ color: "#64748b", display: "block" }}>
                  BM Name
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  {log.bmName || "N/A"}
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6} md={4}>
                <Typography variant="caption" sx={{ color: "#64748b", display: "block" }}>
                  BM Contact
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  {log.bmContact || "N/A"}
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6} md={4}>
                <Typography variant="caption" sx={{ color: "#64748b", display: "block" }}>
                  Duration
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  {log.durationFormatted || "N/A"}
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6} md={4}>
                <Typography variant="caption" sx={{ color: "#64748b", display: "block" }}>
                  Visit Date
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  {formatTimestamp(log.createdAt)}
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6} md={4}>
                <Typography variant="caption" sx={{ color: "#64748b", display: "block" }}>
                  Ops Manager
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  {log.opsManager || "N/A"}
                </Typography>
              </Grid>

              {log.remarks && (
                <Grid item xs={12}>
                  <Typography variant="caption" sx={{ color: "#64748b", display: "block" }}>
                    Remarks
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {log.remarks}
                  </Typography>
                </Grid>
              )}

              {log.images && log.images.length > 0 && (
                <Grid item xs={12}>
                  <Typography variant="caption" sx={{ color: "#64748b", display: "block", mb: 1 }}>
                    Images ({log.images.length})
                  </Typography>
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                    {log.images.map((imageUrl, index) => (
                      <a
                        key={index}
                        href={imageUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Box
                          component="img"
                          src={imageUrl}
                          alt={`Visit ${index + 1}`}
                          sx={{
                            width: 100,
                            height: 100,
                            objectFit: "cover",
                            borderRadius: 2,
                            cursor: "pointer",
                            border: "2px solid #e2e8f0",
                            transition: "all 0.2s",
                            "&:hover": {
                              border: "2px solid #667eea",
                              transform: "scale(1.05)",
                            },
                          }}
                        />
                      </a>
                    ))}
                  </Box>
                </Grid>
              )}
            </Grid>
          </Card>
        ))}
      </Box>
    </Box>
  );
};

export default DCVisitHistory;
