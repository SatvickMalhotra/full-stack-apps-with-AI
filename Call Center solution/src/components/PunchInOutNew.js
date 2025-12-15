import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Typography,
  Chip,
  Alert,
} from "@mui/material";
import {
  FiberManualRecord,
  Timer,
  LocationOn,
  CheckCircle,
} from "@mui/icons-material";
import { collection, addDoc, doc, updateDoc, serverTimestamp, query, where, onSnapshot, orderBy, limit } from "firebase/firestore";
import { db } from "../firebaseConfig";

/**
 * Punch In/Out Component - NEW VERSION
 * Saves punch data to Firestore for persistence across page refresh
 * Real-time listener maintains state from database
 */
function PunchInOutNew({ onPunchData, initialPunchData, agentId, agentCollection }) {
  const [punchInData, setPunchInData] = useState(initialPunchData || null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [locationError, setLocationError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activePunchId, setActivePunchId] = useState(null);

  // Listen to active punch from Firestore (if agentId and agentCollection are provided)
  useEffect(() => {
    if (!agentId || !agentCollection) return;

    const punchesRef = collection(db, agentCollection, agentId, "activePunch");
    // Only get ACTIVE punch records (not completed ones)
    const activePunchQuery = query(
      punchesRef,
      where("status", "==", "active"),
      orderBy("punchInTime", "desc"),
      limit(1)
    );

    const unsubscribe = onSnapshot(activePunchQuery, (snapshot) => {
      if (!snapshot.empty) {
        const punchDoc = snapshot.docs[0];
        const data = punchDoc.data();
        setActivePunchId(punchDoc.id);

        // Convert Firestore timestamp to ISO string for compatibility
        const punchData = {
          punchInTime: data.punchInTime?.toDate?.()?.toISOString() || data.punchInTime,
          punchInLocation: data.punchInLocation,
          punchOutTime: data.punchOutTime?.toDate?.()?.toISOString() || data.punchOutTime,
          punchOutLocation: data.punchOutLocation,
          totalDuration: data.totalDuration,
          durationFormatted: data.durationFormatted,
          status: data.status,
        };

        setPunchInData(punchData);
      } else {
        // No active punch found
        // Only clear state if parent has also cleared (initialPunchData is null)
        // This allows completed punch data to persist until parent resets
        if (!initialPunchData) {
          setPunchInData(null);
          setActivePunchId(null);
        }
      }
    });

    return () => unsubscribe();
  }, [agentId, agentCollection, initialPunchData]); // Removed onPunchData from dependencies to prevent infinite loop

  // Calculate elapsed time from punch in timestamp
  useEffect(() => {
    let interval;
    // Only run timer if punched in AND not yet punched out
    if (punchInData && punchInData.punchInTime && !punchInData.punchOutTime) {
      const updateElapsed = () => {
        const punchInDate = new Date(punchInData.punchInTime);
        const now = new Date();
        const elapsed = now - punchInDate;
        setElapsedTime(elapsed);
      };

      updateElapsed(); // Initial update
      interval = setInterval(updateElapsed, 1000);
    } else if (punchInData && punchInData.totalDuration) {
      // If punched out, show the final duration
      setElapsedTime(punchInData.totalDuration);
    } else {
      setElapsedTime(0);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [punchInData]);

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
      setLoading(true);
      const location = await getCurrentLocation();

      // If agentId and agentCollection are provided, save to Firestore
      if (agentId && agentCollection) {
        const punchData = {
          punchInLocation: location,
          punchInTime: serverTimestamp(),
          status: "active",
          createdAt: serverTimestamp(),
        };

        await addDoc(
          collection(db, agentCollection, agentId, "activePunch"),
          punchData
        );

        alert(`Punch In successful!\n\nLocation captured at:\nLat: ${location.latitude.toFixed(6)}\nLng: ${location.longitude.toFixed(6)}\n\nYou can now proceed with your visit.`);
      } else {
        // Fallback to local state only (for backward compatibility)
        const punchInTime = new Date().toISOString();
        const punchData = {
          punchInLocation: location,
          punchInTime: punchInTime,
        };
        setPunchInData(punchData);
        alert(`Punch In successful!\n\nLocation captured at:\nLat: ${location.latitude.toFixed(6)}\nLng: ${location.longitude.toFixed(6)}\n\nYou can now proceed with your visit.`);
      }
    } catch (error) {
      console.error("Error during punch in:", error);
      setLocationError(error.message);
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Punch Out
  const handlePunchOut = async () => {
    try {
      setLocationError(null);
      setLoading(true);
      const location = await getCurrentLocation();

      // Calculate duration
      const punchInDate = new Date(punchInData.punchInTime);
      const punchOutDate = new Date();
      const totalDuration = punchOutDate - punchInDate;

      if (agentId && agentCollection && activePunchId) {
        // Update Firestore document
        const punchRef = doc(db, agentCollection, agentId, "activePunch", activePunchId);
        await updateDoc(punchRef, {
          punchOutLocation: location,
          punchOutTime: serverTimestamp(),
          totalDuration: totalDuration,
          durationFormatted: formatTime(totalDuration),
          status: "completed",
          updatedAt: serverTimestamp(),
        });

        // Create completed punch data for local state and parent
        const completePunchData = {
          ...punchInData,
          punchOutLocation: location,
          punchOutTime: new Date().toISOString(),
          totalDuration: totalDuration,
          durationFormatted: formatTime(totalDuration),
          status: "completed",
        };

        // Update local state with completed data
        setPunchInData(completePunchData);

        // Send to parent component
        if (onPunchData) {
          onPunchData(completePunchData);
        }

        alert(`Punch Out successful!\n\nTotal visit duration: ${formatTime(totalDuration)}\n\nYou can now submit your offline visit record.`);
      } else {
        // Fallback to local state only
        const punchOutTime = new Date().toISOString();
        const completePunchData = {
          ...punchInData,
          punchOutLocation: location,
          punchOutTime: punchOutTime,
          totalDuration: totalDuration,
          durationFormatted: formatTime(totalDuration),
        };

        setPunchInData(completePunchData);
        if (onPunchData) {
          onPunchData(completePunchData);
        }

        alert(`Punch Out successful!\n\nTotal visit duration: ${formatTime(totalDuration)}\n\nYou can now submit your offline visit record.`);
      }
    } catch (error) {
      console.error("Error during punch out:", error);
      setLocationError(error.message);
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  const isPunchedIn = punchInData && !punchInData.punchOutTime;
  const isPunchedOut = punchInData && punchInData.punchOutTime;

  return (
    <Box
      sx={{
        p: { xs: 2, sm: 3 },
        background: isPunchedOut
          ? "linear-gradient(135deg, #22c55e, #16a34a)"
          : isPunchedIn
          ? "linear-gradient(135deg, #22c55e, #16a34a)"
          : "linear-gradient(135deg, #3b82f6, #2563eb)",
        borderRadius: "16px",
        color: "white",
        boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: { xs: 1.5, sm: 2 }, mb: { xs: 1.5, sm: 2 }, flexWrap: "wrap" }}>
        <FiberManualRecord sx={{ fontSize: { xs: 28, sm: 32 } }} />
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, fontSize: { xs: '1.1rem', sm: '1.25rem' } }}>
            Location Punch System
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.9, fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
            {isPunchedOut
              ? "Visit completed - punch data recorded"
              : isPunchedIn
              ? "You are currently punched in"
              : "Punch in when you arrive at the location"}
          </Typography>
        </Box>
        <Chip
          label={isPunchedOut ? "Completed" : isPunchedIn ? "Active" : "Inactive"}
          icon={isPunchedOut ? <CheckCircle /> : isPunchedIn ? <CheckCircle /> : <FiberManualRecord />}
          sx={{
            bgcolor: "rgba(255,255,255,0.25)",
            color: "white",
            fontWeight: 600,
            px: { xs: 1.5, sm: 2 },
            fontSize: { xs: '0.75rem', sm: '0.8125rem' },
          }}
        />
      </Box>

      {locationError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {locationError}
        </Alert>
      )}

      {isPunchedIn && !isPunchedOut && (
        <Box sx={{ mb: { xs: 2, sm: 3 } }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: { xs: 1.5, sm: 2 },
              bgcolor: "rgba(255,255,255,0.2)",
              p: { xs: 1.5, sm: 2 },
              borderRadius: "12px",
              mb: { xs: 1.5, sm: 2 },
            }}
          >
            <Timer sx={{ fontSize: { xs: 24, sm: 28 } }} />
            <Box>
              <Typography variant="body2" sx={{ opacity: 0.9, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                Visit Duration
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 700, fontSize: { xs: '1.75rem', sm: '2.125rem' } }}>
                {formatTime(elapsedTime)}
              </Typography>
            </Box>
          </Box>

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: { xs: 1.5, sm: 2 },
              bgcolor: "rgba(255,255,255,0.2)",
              p: { xs: 1.5, sm: 2 },
              borderRadius: "12px",
            }}
          >
            <LocationOn sx={{ fontSize: { xs: 24, sm: 28 } }} />
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="body2" sx={{ opacity: 0.9, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                Punch In Location
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 600, fontFamily: "monospace", fontSize: { xs: '0.7rem', sm: '0.875rem' } }}>
                {punchInData.punchInLocation.latitude.toFixed(6)}, {punchInData.punchInLocation.longitude.toFixed(6)}
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.8, fontSize: { xs: '0.65rem', sm: '0.75rem' } }}>
                Accuracy: ±{punchInData.punchInLocation.accuracy.toFixed(0)}m
              </Typography>
            </Box>
          </Box>
        </Box>
      )}

      {isPunchedOut && (
        <Box sx={{ mb: { xs: 2, sm: 3 } }}>
          <Alert severity="success" sx={{ bgcolor: "rgba(255,255,255,0.2)", color: "white" }}>
            <Typography variant="body2" sx={{ fontWeight: 600, fontSize: { xs: '0.85rem', sm: '0.875rem' } }}>
              ✅ Punch In/Out Completed!
            </Typography>
            <Typography variant="caption" sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
              Duration: {punchInData.durationFormatted}
            </Typography>
          </Alert>
        </Box>
      )}

      {!isPunchedOut && (
        <Box sx={{ display: "flex", gap: { xs: 1.5, sm: 2 } }}>
          {!isPunchedIn ? (
            <Button
              variant="contained"
              fullWidth
              size="large"
              startIcon={<FiberManualRecord />}
              onClick={handlePunchIn}
              disabled={loading}
              sx={{
                bgcolor: "white",
                color: "#3b82f6",
                fontWeight: 700,
                py: { xs: 1.25, sm: 1.5 },
                fontSize: { xs: '0.875rem', sm: '1rem' },
                "&:hover": {
                  bgcolor: "#f8fafc",
                },
              }}
            >
              {loading ? "PUNCHING IN..." : "PUNCH IN"}
            </Button>
          ) : (
            <Button
              variant="contained"
              fullWidth
              size="large"
              startIcon={<CheckCircle />}
              onClick={handlePunchOut}
              disabled={loading}
              sx={{
                bgcolor: "white",
                color: "#22c55e",
                fontWeight: 700,
                py: { xs: 1.25, sm: 1.5 },
                fontSize: { xs: '0.875rem', sm: '1rem' },
                "&:hover": {
                  bgcolor: "#f8fafc",
                },
              }}
            >
              {loading ? "PUNCHING OUT..." : "PUNCH OUT"}
            </Button>
          )}
        </Box>
      )}

      <Alert severity="info" sx={{ mt: { xs: 1.5, sm: 2 }, bgcolor: "rgba(255,255,255,0.2)", color: "white" }}>
        <Typography variant="caption" sx={{ fontWeight: 600, fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
          ⚠️ MANDATORY: You must punch in when arriving at the visit location and punch out before leaving. This data is used to verify your visit credibility.
        </Typography>
      </Alert>
    </Box>
  );
}

export default PunchInOutNew;
