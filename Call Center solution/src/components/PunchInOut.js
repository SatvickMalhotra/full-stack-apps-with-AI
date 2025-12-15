import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Typography,
  Chip,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import {
  FiberManualRecord,
  Timer,
  LocationOn,
  CheckCircle,
} from "@mui/icons-material";

/**
 * Punch In/Out Component
 * Tracks punch in/out times and locations for each visit
 * Returns punch data to be stored with the offline visit record
 */
function PunchInOut({ onPunchData, visitLocation }) {
  const [punchedIn, setPunchedIn] = useState(false);
  const [punchInData, setPunchInData] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [startTime, setStartTime] = useState(null);
  const [locationError, setLocationError] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState(false);

  // Timer effect
  useEffect(() => {
    let interval;
    if (punchedIn && startTime) {
      interval = setInterval(() => {
        setElapsedTime(Date.now() - startTime);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [punchedIn, startTime]);

  // Format elapsed time
  const formatTime = (milliseconds) => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  // Get current location
  const getCurrentLocation = () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Geolocation is not supported by your browser"));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: new Date().toISOString(),
          });
        },
        (error) => {
          let errorMessage = "Unable to get your location";
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = "Location permission denied. Please enable location access in your browser settings.";
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = "Location information unavailable.";
              break;
            case error.TIMEOUT:
              errorMessage = "Location request timed out.";
              break;
            default:
              errorMessage = "An unknown error occurred.";
          }
          reject(new Error(errorMessage));
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      );
    });
  };

  // Punch In
  const handlePunchIn = async () => {
    try {
      setLocationError(null);
      const location = await getCurrentLocation();

      const punchData = {
        punchInLocation: location,
        punchInTime: new Date().toISOString(),
      };

      setPunchInData(punchData);
      setStartTime(Date.now());
      setPunchedIn(true);
      setElapsedTime(0);

      alert(`Punch In successful!\n\nLocation captured at:\nLat: ${location.latitude.toFixed(6)}\nLng: ${location.longitude.toFixed(6)}\n\nYou can now proceed with your visit.`);
    } catch (error) {
      console.error("Error during punch in:", error);
      setLocationError(error.message);
      alert(error.message);
    }
  };

  // Punch Out
  const handlePunchOut = async () => {
    try {
      setLocationError(null);
      const location = await getCurrentLocation();

      const totalDuration = Date.now() - startTime;

      const completePunchData = {
        ...punchInData,
        punchOutLocation: location,
        punchOutTime: new Date().toISOString(),
        totalDuration: totalDuration,
        durationFormatted: formatTime(totalDuration),
      };

      // Send punch data back to parent component
      onPunchData(completePunchData);

      setPunchedIn(false);
      setPunchInData(null);
      setStartTime(null);
      setElapsedTime(0);
      setConfirmDialog(false);

      alert(`Punch Out successful!\n\nTotal visit duration: ${formatTime(totalDuration)}\n\nYou can now submit your offline visit record.`);
    } catch (error) {
      console.error("Error during punch out:", error);
      setLocationError(error.message);
      alert(error.message);
    }
  };

  return (
    <Box
      sx={{
        p: 3,
        background: punchedIn
          ? "linear-gradient(135deg, #22c55e, #16a34a)"
          : "linear-gradient(135deg, #3b82f6, #2563eb)",
        borderRadius: "16px",
        color: "white",
        boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
        <FiberManualRecord sx={{ fontSize: 32 }} />
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Location Punch System
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.9 }}>
            {punchedIn ? "You are currently punched in" : "Punch in when you arrive at the location"}
          </Typography>
        </Box>
        <Chip
          label={punchedIn ? "Active" : "Inactive"}
          icon={punchedIn ? <CheckCircle /> : <FiberManualRecord />}
          sx={{
            bgcolor: "rgba(255,255,255,0.25)",
            color: "white",
            fontWeight: 600,
          }}
        />
      </Box>

      {locationError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {locationError}
        </Alert>
      )}

      {punchedIn && (
        <Box sx={{ mb: 3 }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 2,
              bgcolor: "rgba(255,255,255,0.2)",
              p: 2,
              borderRadius: "12px",
              mb: 2,
            }}
          >
            <Timer sx={{ fontSize: 28 }} />
            <Box>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Visit Duration
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                {formatTime(elapsedTime)}
              </Typography>
            </Box>
          </Box>

          {punchInData && (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 2,
                bgcolor: "rgba(255,255,255,0.2)",
                p: 2,
                borderRadius: "12px",
              }}
            >
              <LocationOn sx={{ fontSize: 28 }} />
              <Box sx={{ flexGrow: 1 }}>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Punch In Location
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600, fontFamily: "monospace" }}>
                  {punchInData.punchInLocation.latitude.toFixed(6)}, {punchInData.punchInLocation.longitude.toFixed(6)}
                </Typography>
                <Typography variant="caption" sx={{ opacity: 0.8 }}>
                  Accuracy: ±{punchInData.punchInLocation.accuracy.toFixed(0)}m
                </Typography>
              </Box>
            </Box>
          )}
        </Box>
      )}

      <Box sx={{ display: "flex", gap: 2 }}>
        {!punchedIn ? (
          <Button
            variant="contained"
            fullWidth
            size="large"
            startIcon={<FiberManualRecord />}
            onClick={handlePunchIn}
            sx={{
              bgcolor: "white",
              color: "#3b82f6",
              fontWeight: 700,
              py: 1.5,
              fontSize: "1rem",
              "&:hover": {
                bgcolor: "#f8fafc",
              },
            }}
          >
            PUNCH IN
          </Button>
        ) : (
          <Button
            variant="contained"
            fullWidth
            size="large"
            startIcon={<CheckCircle />}
            onClick={() => setConfirmDialog(true)}
            sx={{
              bgcolor: "white",
              color: "#22c55e",
              fontWeight: 700,
              py: 1.5,
              fontSize: "1rem",
              "&:hover": {
                bgcolor: "#f8fafc",
              },
            }}
          >
            PUNCH OUT
          </Button>
        )}
      </Box>

      <Alert severity="info" sx={{ mt: 2, bgcolor: "rgba(255,255,255,0.2)", color: "white" }}>
        <Typography variant="caption" sx={{ fontWeight: 600 }}>
          ⚠️ MANDATORY: You must punch in when arriving at the visit location and punch out before leaving. This data is used to verify your visit credibility.
        </Typography>
      </Alert>

      {/* Confirmation Dialog */}
      <Dialog open={confirmDialog} onClose={() => setConfirmDialog(false)}>
        <DialogTitle>Punch Out?</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to punch out? Make sure you have completed your visit.
          </Typography>
          <Typography sx={{ mt: 2, fontWeight: 600 }}>
            Visit Duration: {formatTime(elapsedTime)}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialog(false)}>Cancel</Button>
          <Button onClick={handlePunchOut} variant="contained" color="success">
            Punch Out
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default PunchInOut;
