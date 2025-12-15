import React, { useState, useEffect } from "react";
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
} from "@mui/material";
import {
  PlayArrow,
  Stop,
  LocationOn,
  Timer,
  TrendingUp,
} from "@mui/icons-material";
import { collection, addDoc, doc, updateDoc, serverTimestamp, query, where, getDocs, onSnapshot, orderBy, limit } from "firebase/firestore";
import { db } from "../firebaseConfig";

/**
 * Trip Tracker Component - NEW VERSION
 * No client-side timer - all state persisted in Firestore
 * Survives page refresh
 */
function TripTrackerNew({ agentId, agentCollection }) {
  const [activeTrip, setActiveTrip] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [locationError, setLocationError] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState(false);
  const [loading, setLoading] = useState(true);

  // Listen to active trip from Firestore
  useEffect(() => {
    if (!agentId || !agentCollection) return;

    const tripsRef = collection(db, agentCollection, agentId, "trips");
    const activeTripsQuery = query(
      tripsRef,
      where("status", "==", "active"),
      orderBy("startTime", "desc"),
      limit(1)
    );

    const unsubscribe = onSnapshot(
      activeTripsQuery,
      (snapshot) => {
        if (!snapshot.empty) {
          const tripDoc = snapshot.docs[0];
          setActiveTrip({
            id: tripDoc.id,
            ...tripDoc.data(),
          });
        } else {
          setActiveTrip(null);
          setElapsedTime(0); // Reset elapsed time when no active trip
        }
        setLoading(false);
      },
      (error) => {
        console.error("Error listening to active trips:", error);
        setLocationError("Failed to load trip data. Please refresh the page.");
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [agentId, agentCollection]);

  // Calculate elapsed time from Firestore timestamp
  useEffect(() => {
    let interval;
    if (activeTrip && activeTrip.startTime) {
      const startTimestamp = activeTrip.startTime.toDate();

      const updateElapsed = () => {
        const now = new Date();
        const elapsed = now - startTimestamp;
        setElapsedTime(elapsed);
      };

      updateElapsed(); // Initial update
      interval = setInterval(updateElapsed, 1000);
    } else {
      setElapsedTime(0);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [activeTrip]);

  // Format elapsed time
  const formatTime = (milliseconds) => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  // Calculate distance between two coordinates (Haversine formula)
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
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
              errorMessage = "Location permission denied. Please enable location access.";
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

  // Start trip
  const handleStartTrip = async () => {
    try {
      setLocationError(null);
      setLoading(true);
      const location = await getCurrentLocation();

      // Create trip document in Firestore
      const tripData = {
        agentId,
        startLocation: location,
        startTime: serverTimestamp(),
        status: "active",
        createdAt: serverTimestamp(),
      };

      await addDoc(
        collection(db, agentCollection, agentId, "trips"),
        tripData
      );

      alert("Trip started successfully! Your start location has been recorded.");
    } catch (error) {
      console.error("Error starting trip:", error);
      setLocationError(error.message);
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  // End trip
  const handleEndTrip = async () => {
    try {
      setLocationError(null);
      setLoading(true);
      const endLocation = await getCurrentLocation();

      // Calculate distance
      const distance = calculateDistance(
        activeTrip.startLocation.latitude,
        activeTrip.startLocation.longitude,
        endLocation.latitude,
        endLocation.longitude
      );

      // Calculate total time
      const startTime = activeTrip.startTime.toDate();
      const endTime = new Date();
      const totalDuration = endTime - startTime;

      // Update trip document
      const tripRef = doc(db, agentCollection, agentId, "trips", activeTrip.id);
      await updateDoc(tripRef, {
        endLocation,
        endTime: serverTimestamp(),
        totalDistance: parseFloat(distance),
        totalDuration: totalDuration,
        status: "completed",
        updatedAt: serverTimestamp(),
      });

      // Clear active trip state immediately (real-time listener will also update it)
      setActiveTrip(null);
      setElapsedTime(0);
      setConfirmDialog(false);

      alert(
        `Trip ended successfully!\n\nTotal Distance: ${distance} km\nTotal Duration: ${formatTime(totalDuration)}\n\nThis data will be used for reimbursement calculation.`
      );
    } catch (error) {
      console.error("Error ending trip:", error);
      setLocationError(error.message);
      alert(error.message);
    } finally {
      setLoading(false);
    }
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
        <Box sx={{ display: "flex", alignItems: "center", gap: { xs: 1.5, sm: 2 }, mb: { xs: 2, sm: 3 }, flexWrap: "wrap" }}>
          <TrendingUp sx={{ fontSize: { xs: 28, sm: 32 } }} />
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, fontSize: { xs: '1.1rem', sm: '1.25rem' } }}>
              Trip Tracker
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9, fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
              Track your daily field visits for reimbursement
            </Typography>
          </Box>
          <Chip
            label={activeTrip ? "Active" : "Inactive"}
            sx={{
              bgcolor: activeTrip ? "#22c55e" : "rgba(255,255,255,0.2)",
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

        {activeTrip && (
          <Box sx={{ mb: { xs: 2, sm: 3 } }}>
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
                <Typography variant="body2" sx={{ opacity: 0.9, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                  Trip Duration
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
                bgcolor: "rgba(255,255,255,0.15)",
                p: { xs: 1.5, sm: 2 },
                borderRadius: "12px",
              }}
            >
              <LocationOn sx={{ fontSize: { xs: 28, sm: 32 } }} />
              <Box sx={{ flexGrow: 1 }}>
                <Typography variant="body2" sx={{ opacity: 0.9, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                  Start Location
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600, fontFamily: "monospace", fontSize: { xs: '0.7rem', sm: '0.875rem' } }}>
                  {activeTrip.startLocation.latitude.toFixed(6)}, {activeTrip.startLocation.longitude.toFixed(6)}
                </Typography>
              </Box>
            </Box>
          </Box>
        )}

        <Box sx={{ display: "flex", gap: { xs: 1.5, sm: 2 } }}>
          {!activeTrip ? (
            <Button
              variant="contained"
              fullWidth
              size="large"
              startIcon={<PlayArrow />}
              onClick={handleStartTrip}
              disabled={loading}
              sx={{
                bgcolor: "white",
                color: "#667eea",
                fontWeight: 700,
                py: { xs: 1.25, sm: 1.5 },
                fontSize: { xs: '0.875rem', sm: '0.9375rem' },
                "&:hover": {
                  bgcolor: "#f8fafc",
                },
              }}
            >
              {loading ? "STARTING..." : "START TRIP"}
            </Button>
          ) : (
            <Button
              variant="contained"
              fullWidth
              size="large"
              startIcon={<Stop />}
              onClick={() => setConfirmDialog(true)}
              disabled={loading}
              sx={{
                bgcolor: "#ef4444",
                color: "white",
                fontWeight: 700,
                py: { xs: 1.25, sm: 1.5 },
                fontSize: { xs: '0.875rem', sm: '0.9375rem' },
                "&:hover": {
                  bgcolor: "#dc2626",
                },
              }}
            >
              {loading ? "ENDING..." : "END TRIP"}
            </Button>
          )}
        </Box>

        <Typography
          variant="caption"
          sx={{
            display: "block",
            mt: { xs: 1.5, sm: 2 },
            opacity: 0.8,
            textAlign: "center",
            fontSize: { xs: '0.7rem', sm: '0.75rem' },
            px: { xs: 1, sm: 0 },
          }}
        >
          {activeTrip
            ? "⚠️ Trip is active. End trip when you return to your starting location."
            : "Start trip at the beginning of your day. End trip when you return to your starting location."}
        </Typography>
      </CardContent>

      {/* Confirmation Dialog */}
      <Dialog open={confirmDialog} onClose={() => setConfirmDialog(false)}>
        <DialogTitle>End Trip?</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to end this trip? Make sure you are back at your starting location.
          </Typography>
          <Typography sx={{ mt: 2, fontWeight: 600 }}>
            Trip Duration: {formatTime(elapsedTime)}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialog(false)} disabled={loading}>Cancel</Button>
          <Button onClick={handleEndTrip} variant="contained" color="error" disabled={loading}>
            {loading ? "Ending..." : "End Trip"}
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
}

export default TripTrackerNew;
