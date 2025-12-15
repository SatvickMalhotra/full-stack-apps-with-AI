import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Chip,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Snackbar,
  LinearProgress,
} from "@mui/material";
import {
  PlayArrow,
  Stop,
  LocationOn,
  Timer,
  TrendingUp,
  WifiOff,
  Wifi,
  Refresh,
} from "@mui/icons-material";
import {
  collection,
  addDoc,
  doc,
  updateDoc,
  serverTimestamp,
  query,
  where,
  onSnapshot,
  orderBy,
  limit,
} from "firebase/firestore";
import { db } from "../firebaseConfig";
import {
  saveActiveTrip,
  getActiveTrip,
  clearActiveTrip,
  isOnline,
  addNetworkListener,
  getLocationWithRetry,
  retryWithBackoff,
  isNewDay,
} from "../utils/offlineUtils";

/**
 * Trip Tracker Component - OPTIMIZED VERSION
 * Features:
 * - Persistent timer across page refresh (localStorage + Firestore)
 * - Retry logic with exponential backoff
 * - Network status indicator
 * - Better error handling
 * - Midnight auto-reset option
 * - Improved geolocation with fallback
 */
function TripTrackerOptimized({ agentId, agentCollection }) {
  const [activeTrip, setActiveTrip] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [locationError, setLocationError] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState(false);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [online, setOnline] = useState(isOnline());
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "info" });
  const [retrying, setRetrying] = useState(false);

  const unsubscribeRef = useRef(null);
  const timerRef = useRef(null);

  // Network status listener
  useEffect(() => {
    const cleanup = addNetworkListener(
      () => {
        setOnline(true);
        setSnackbar({ open: true, message: "Back online! Syncing data...", severity: "success" });
      },
      () => {
        setOnline(false);
        setSnackbar({ open: true, message: "You are offline. Data will sync when connected.", severity: "warning" });
      }
    );

    return cleanup;
  }, []);

  // Load persisted trip data on mount
  useEffect(() => {
    const loadPersistedData = async () => {
      if (!agentId) return;

      try {
        // First, check localStorage for quick restore
        const localTrip = await getActiveTrip(agentId);
        if (localTrip && localTrip.status === "active") {
          // Check for midnight reset
          if (isNewDay(localTrip.startTime)) {
            // Trip spans midnight - ask user what to do or auto-end
            setSnackbar({
              open: true,
              message: "Trip from previous day detected. Please end this trip.",
              severity: "warning",
            });
          }
          setActiveTrip(localTrip);
        }
      } catch (error) {
        console.error("Error loading persisted trip:", error);
      }
    };

    loadPersistedData();
  }, [agentId]);

  // Listen to active trip from Firestore
  useEffect(() => {
    if (!agentId || !agentCollection) {
      setLoading(false);
      return;
    }

    const tripsRef = collection(db, agentCollection, agentId, "trips");
    const activeTripsQuery = query(
      tripsRef,
      where("status", "==", "active"),
      orderBy("startTime", "desc"),
      limit(1)
    );

    unsubscribeRef.current = onSnapshot(
      activeTripsQuery,
      (snapshot) => {
        if (!snapshot.empty) {
          const tripDoc = snapshot.docs[0];
          const tripData = {
            id: tripDoc.id,
            ...tripDoc.data(),
            // Convert Firestore timestamp to ISO string for localStorage
            startTime: tripDoc.data().startTime?.toDate?.()?.toISOString() || tripDoc.data().startTime,
          };
          setActiveTrip(tripData);

          // Save to localStorage for offline persistence
          saveActiveTrip({
            ...tripData,
            agentId,
            agentCollection,
            status: "active",
          });
        } else {
          setActiveTrip(null);
          setElapsedTime(0);
          clearActiveTrip(agentId);
        }
        setLoading(false);
      },
      (error) => {
        console.error("Error listening to active trips:", error);
        setLocationError("Failed to load trip data. Please check your connection.");
        setLoading(false);

        // Try to load from localStorage as fallback
        getActiveTrip(agentId).then((localTrip) => {
          if (localTrip && localTrip.status === "active") {
            setActiveTrip(localTrip);
            setSnackbar({
              open: true,
              message: "Loaded trip from local storage (offline mode)",
              severity: "info",
            });
          }
        });
      }
    );

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
    };
  }, [agentId, agentCollection]);

  // Calculate elapsed time from start timestamp
  useEffect(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    if (activeTrip && activeTrip.startTime) {
      const updateElapsed = () => {
        let startTimestamp;

        // Handle both Firestore Timestamp and ISO string
        if (activeTrip.startTime?.toDate) {
          startTimestamp = activeTrip.startTime.toDate();
        } else if (typeof activeTrip.startTime === "string") {
          startTimestamp = new Date(activeTrip.startTime);
        } else {
          startTimestamp = new Date(activeTrip.startTime);
        }

        const now = new Date();
        const elapsed = now - startTimestamp;
        setElapsedTime(elapsed);
      };

      updateElapsed(); // Initial update
      timerRef.current = setInterval(updateElapsed, 1000);
    } else {
      setElapsedTime(0);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [activeTrip]);

  // Format elapsed time
  const formatTime = useCallback((milliseconds) => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  }, []);

  // Calculate distance between two coordinates (Haversine formula)
  const calculateDistance = useCallback((lat1, lon1, lat2, lon2) => {
    const R = 6371; // Earth's radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    return distance.toFixed(2);
  }, []);

  // Start trip with retry logic
  const handleStartTrip = async () => {
    try {
      setLocationError(null);
      setActionLoading(true);

      // Get location with retry
      const location = await getLocationWithRetry();

      // Create trip document in Firestore with retry
      const tripData = {
        agentId,
        startLocation: location,
        startTime: serverTimestamp(),
        status: "active",
        createdAt: serverTimestamp(),
      };

      await retryWithBackoff(async () => {
        await addDoc(collection(db, agentCollection, agentId, "trips"), tripData);
      }, 3, 1000);

      // Also save to localStorage immediately for persistence
      const localTripData = {
        ...tripData,
        startTime: new Date().toISOString(),
        agentId,
        agentCollection,
      };
      await saveActiveTrip(localTripData);

      setSnackbar({
        open: true,
        message: "Trip started successfully! Your location has been recorded.",
        severity: "success",
      });
    } catch (error) {
      console.error("Error starting trip:", error);
      setLocationError(error.message);
      setSnackbar({
        open: true,
        message: `Failed to start trip: ${error.message}`,
        severity: "error",
      });
    } finally {
      setActionLoading(false);
    }
  };

  // End trip with retry logic
  const handleEndTrip = async () => {
    try {
      setLocationError(null);
      setActionLoading(true);
      setRetrying(false);

      // Get location with retry
      const endLocation = await getLocationWithRetry();

      // Calculate distance
      const startLoc = activeTrip.startLocation;
      const distance = calculateDistance(
        startLoc.latitude,
        startLoc.longitude,
        endLocation.latitude,
        endLocation.longitude
      );

      // Calculate total time
      let startTime;
      if (activeTrip.startTime?.toDate) {
        startTime = activeTrip.startTime.toDate();
      } else {
        startTime = new Date(activeTrip.startTime);
      }
      const endTime = new Date();
      const totalDuration = endTime - startTime;

      // Update trip document with retry
      await retryWithBackoff(async () => {
        const tripRef = doc(db, agentCollection, agentId, "trips", activeTrip.id);
        await updateDoc(tripRef, {
          endLocation,
          endTime: serverTimestamp(),
          totalDistance: parseFloat(distance),
          totalDuration: totalDuration,
          status: "completed",
          updatedAt: serverTimestamp(),
        });
      }, 3, 1000);

      // Clear local storage
      await clearActiveTrip(agentId);

      // Clear active trip state
      setActiveTrip(null);
      setElapsedTime(0);
      setConfirmDialog(false);

      setSnackbar({
        open: true,
        message: `Trip ended! Distance: ${distance} km | Duration: ${formatTime(totalDuration)}`,
        severity: "success",
      });
    } catch (error) {
      console.error("Error ending trip:", error);
      setLocationError(error.message);
      setRetrying(true);
      setSnackbar({
        open: true,
        message: `Failed to end trip: ${error.message}. Please try again.`,
        severity: "error",
      });
    } finally {
      setActionLoading(false);
    }
  };

  // Retry ending trip
  const handleRetryEndTrip = () => {
    setRetrying(false);
    handleEndTrip();
  };

  if (loading && !activeTrip) {
    return (
      <Card
        sx={{
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          color: "white",
          borderRadius: "16px",
          boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
        }}
      >
        <CardContent sx={{ textAlign: "center", py: 3 }}>
          <CircularProgress sx={{ color: "white", mb: 2 }} />
          <Typography>Loading trip tracker...</Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      sx={{
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        color: "white",
        borderRadius: "16px",
        boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
      }}
    >
      <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
        {/* Header */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: { xs: 1.5, sm: 2 },
            mb: { xs: 2, sm: 3 },
            flexWrap: "wrap",
          }}
        >
          <TrendingUp sx={{ fontSize: { xs: 28, sm: 32 } }} />
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, fontSize: { xs: "1.1rem", sm: "1.25rem" } }}>
              Trip Tracker
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9, fontSize: { xs: "0.8rem", sm: "0.875rem" } }}>
              Track your daily field visits for reimbursement
            </Typography>
          </Box>
          <Box sx={{ display: "flex", gap: 1 }}>
            {/* Network status indicator */}
            <Chip
              icon={online ? <Wifi /> : <WifiOff />}
              label={online ? "Online" : "Offline"}
              size="small"
              sx={{
                bgcolor: online ? "rgba(34, 197, 94, 0.3)" : "rgba(239, 68, 68, 0.3)",
                color: "white",
                fontSize: { xs: "0.7rem", sm: "0.75rem" },
              }}
            />
            <Chip
              label={activeTrip ? "Active" : "Inactive"}
              sx={{
                bgcolor: activeTrip ? "#22c55e" : "rgba(255,255,255,0.2)",
                color: "white",
                fontWeight: 600,
                fontSize: { xs: "0.75rem", sm: "0.8125rem" },
              }}
            />
          </Box>
        </Box>

        {/* Error Alert */}
        {locationError && (
          <Alert
            severity="error"
            sx={{ mb: 2 }}
            action={
              retrying && (
                <Button color="inherit" size="small" onClick={handleRetryEndTrip} startIcon={<Refresh />}>
                  Retry
                </Button>
              )
            }
          >
            {locationError}
          </Alert>
        )}

        {/* Action Loading Progress */}
        {actionLoading && (
          <Box sx={{ mb: 2 }}>
            <LinearProgress sx={{ bgcolor: "rgba(255,255,255,0.2)", "& .MuiLinearProgress-bar": { bgcolor: "white" } }} />
            <Typography variant="caption" sx={{ opacity: 0.9 }}>
              {activeTrip ? "Ending trip..." : "Starting trip..."} Getting location...
            </Typography>
          </Box>
        )}

        {/* Active Trip Info */}
        {activeTrip && (
          <Box sx={{ mb: { xs: 2, sm: 3 } }}>
            {/* Duration */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: { xs: 1.5, sm: 2 },
                bgcolor: "rgba(255,255,255,0.15)",
                p: { xs: 1.5, sm: 2 },
                borderRadius: "12px",
                mb: { xs: 1.5, sm: 2 },
              }}
            >
              <Timer sx={{ fontSize: { xs: 28, sm: 32 } }} />
              <Box>
                <Typography variant="body2" sx={{ opacity: 0.9, fontSize: { xs: "0.75rem", sm: "0.875rem" } }}>
                  Trip Duration
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 700, fontSize: { xs: "1.75rem", sm: "2.125rem" } }}>
                  {formatTime(elapsedTime)}
                </Typography>
              </Box>
            </Box>

            {/* Location */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: { xs: 1.5, sm: 2 },
                bgcolor: "rgba(255,255,255,0.15)",
                p: { xs: 1.5, sm: 2 },
                borderRadius: "12px",
              }}
            >
              <LocationOn sx={{ fontSize: { xs: 28, sm: 32 } }} />
              <Box sx={{ flexGrow: 1 }}>
                <Typography variant="body2" sx={{ opacity: 0.9, fontSize: { xs: "0.75rem", sm: "0.875rem" } }}>
                  Start Location
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ fontWeight: 600, fontFamily: "monospace", fontSize: { xs: "0.7rem", sm: "0.875rem" } }}
                >
                  {activeTrip.startLocation?.latitude?.toFixed(6)}, {activeTrip.startLocation?.longitude?.toFixed(6)}
                </Typography>
              </Box>
            </Box>
          </Box>
        )}

        {/* Action Buttons */}
        <Box sx={{ display: "flex", gap: { xs: 1.5, sm: 2 } }}>
          {!activeTrip ? (
            <Button
              variant="contained"
              fullWidth
              size="large"
              startIcon={actionLoading ? <CircularProgress size={20} sx={{ color: "#667eea" }} /> : <PlayArrow />}
              onClick={handleStartTrip}
              disabled={actionLoading}
              sx={{
                bgcolor: "white",
                color: "#667eea",
                fontWeight: 700,
                py: { xs: 1.25, sm: 1.5 },
                fontSize: { xs: "0.875rem", sm: "0.9375rem" },
                "&:hover": { bgcolor: "#f8fafc" },
                "&:disabled": { bgcolor: "rgba(255,255,255,0.7)", color: "#667eea" },
              }}
            >
              {actionLoading ? "STARTING..." : "START TRIP"}
            </Button>
          ) : (
            <Button
              variant="contained"
              fullWidth
              size="large"
              startIcon={actionLoading ? <CircularProgress size={20} sx={{ color: "white" }} /> : <Stop />}
              onClick={() => setConfirmDialog(true)}
              disabled={actionLoading}
              sx={{
                bgcolor: "#ef4444",
                color: "white",
                fontWeight: 700,
                py: { xs: 1.25, sm: 1.5 },
                fontSize: { xs: "0.875rem", sm: "0.9375rem" },
                "&:hover": { bgcolor: "#dc2626" },
                "&:disabled": { bgcolor: "rgba(239, 68, 68, 0.7)" },
              }}
            >
              {actionLoading ? "ENDING..." : "END TRIP"}
            </Button>
          )}
        </Box>

        {/* Info Text */}
        <Typography
          variant="caption"
          sx={{
            display: "block",
            mt: { xs: 1.5, sm: 2 },
            opacity: 0.8,
            textAlign: "center",
            fontSize: { xs: "0.7rem", sm: "0.75rem" },
            px: { xs: 1, sm: 0 },
          }}
        >
          {activeTrip
            ? "⚠️ Trip is active. Timer persists even if you close the app."
            : "Start trip at the beginning of your day. Timer will persist across page refresh."}
        </Typography>
      </CardContent>

      {/* Confirmation Dialog */}
      <Dialog open={confirmDialog} onClose={() => !actionLoading && setConfirmDialog(false)}>
        <DialogTitle>End Trip?</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to end this trip? Make sure you are back at your starting location.</Typography>
          <Typography sx={{ mt: 2, fontWeight: 600 }}>Trip Duration: {formatTime(elapsedTime)}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialog(false)} disabled={actionLoading}>
            Cancel
          </Button>
          <Button
            onClick={handleEndTrip}
            variant="contained"
            color="error"
            disabled={actionLoading}
            startIcon={actionLoading && <CircularProgress size={16} sx={{ color: "white" }} />}
          >
            {actionLoading ? "Ending..." : "End Trip"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={5000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Card>
  );
}

export default TripTrackerOptimized;
