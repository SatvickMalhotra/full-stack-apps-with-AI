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
import { collection, addDoc, doc, updateDoc, serverTimestamp, getDoc } from "firebase/firestore";
import { db } from "../firebaseConfig";

/**
 * Trip Tracker Component
 * Tracks the agent's entire trip from start location to end location
 * Captures: Start location, End location, Total distance, Total time
 */
function TripTracker({ agentId, agentCollection }) {
  const [tripActive, setTripActive] = useState(false);
  const [currentTrip, setCurrentTrip] = useState(null);
  const [startTime, setStartTime] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [startLocation, setStartLocation] = useState(null);
  const [locationError, setLocationError] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState(false);

  // Timer effect
  useEffect(() => {
    let interval;
    if (tripActive && startTime) {
      interval = setInterval(() => {
        setElapsedTime(Date.now() - startTime);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [tripActive, startTime]);

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
    return distance.toFixed(2); // Returns distance in km
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
      const location = await getCurrentLocation();

      // Create trip document in Firestore
      const tripData = {
        agentId,
        startLocation: location,
        startTime: serverTimestamp(),
        status: "active",
        createdAt: serverTimestamp(),
      };

      const tripRef = await addDoc(
        collection(db, agentCollection, agentId, "trips"),
        tripData
      );

      setCurrentTrip(tripRef.id);
      setStartLocation(location);
      setStartTime(Date.now());
      setTripActive(true);
      setElapsedTime(0);

      alert("Trip started successfully! Your start location has been recorded.");
    } catch (error) {
      console.error("Error starting trip:", error);
      setLocationError(error.message);
      alert(error.message);
    }
  };

  // End trip
  const handleEndTrip = async () => {
    try {
      setLocationError(null);
      const endLocation = await getCurrentLocation();

      // Calculate distance
      const distance = calculateDistance(
        startLocation.latitude,
        startLocation.longitude,
        endLocation.latitude,
        endLocation.longitude
      );

      // Calculate total time
      const totalTime = Date.now() - startTime;

      // Update trip document
      const tripRef = doc(db, agentCollection, agentId, "trips", currentTrip);
      await updateDoc(tripRef, {
        endLocation,
        endTime: serverTimestamp(),
        totalDistance: parseFloat(distance),
        totalDuration: totalTime,
        status: "completed",
        updatedAt: serverTimestamp(),
      });

      alert(
        `Trip ended successfully!\n\nTotal Distance: ${distance} km\nTotal Duration: ${formatTime(totalTime)}\n\nThis data will be used for reimbursement calculation.`
      );

      // Reset state
      setTripActive(false);
      setCurrentTrip(null);
      setStartTime(null);
      setElapsedTime(0);
      setStartLocation(null);
      setConfirmDialog(false);
    } catch (error) {
      console.error("Error ending trip:", error);
      setLocationError(error.message);
      alert(error.message);
    }
  };

  return (
    <Card
      sx={{
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        color: "white",
        borderRadius: "16px",
        boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
      }}
    >
      <CardContent>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
          <TrendingUp sx={{ fontSize: 32 }} />
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Trip Tracker
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              Track your daily field visits for reimbursement
            </Typography>
          </Box>
          <Chip
            label={tripActive ? "Active" : "Inactive"}
            sx={{
              bgcolor: tripActive ? "#22c55e" : "rgba(255,255,255,0.2)",
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

        {tripActive && (
          <Box sx={{ mb: 3 }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 2,
                bgcolor: "rgba(255,255,255,0.15)",
                p: 2,
                borderRadius: "12px",
                mb: 2,
              }}
            >
              <Timer sx={{ fontSize: 32 }} />
              <Box>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Trip Duration
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 700 }}>
                  {formatTime(elapsedTime)}
                </Typography>
              </Box>
            </Box>

            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 2,
                bgcolor: "rgba(255,255,255,0.15)",
                p: 2,
                borderRadius: "12px",
              }}
            >
              <LocationOn sx={{ fontSize: 32 }} />
              <Box sx={{ flexGrow: 1 }}>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Start Location
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {startLocation?.latitude.toFixed(6)}, {startLocation?.longitude.toFixed(6)}
                </Typography>
              </Box>
            </Box>
          </Box>
        )}

        <Box sx={{ display: "flex", gap: 2 }}>
          {!tripActive ? (
            <Button
              variant="contained"
              fullWidth
              size="large"
              startIcon={<PlayArrow />}
              onClick={handleStartTrip}
              sx={{
                bgcolor: "white",
                color: "#667eea",
                fontWeight: 700,
                py: 1.5,
                "&:hover": {
                  bgcolor: "#f8fafc",
                },
              }}
            >
              START TRIP
            </Button>
          ) : (
            <Button
              variant="contained"
              fullWidth
              size="large"
              startIcon={<Stop />}
              onClick={() => setConfirmDialog(true)}
              sx={{
                bgcolor: "#ef4444",
                color: "white",
                fontWeight: 700,
                py: 1.5,
                "&:hover": {
                  bgcolor: "#dc2626",
                },
              }}
            >
              END TRIP
            </Button>
          )}
        </Box>

        <Typography
          variant="caption"
          sx={{
            display: "block",
            mt: 2,
            opacity: 0.8,
            textAlign: "center",
          }}
        >
          Start trip at the beginning of your day. End trip when you return to your starting location.
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
          <Button onClick={() => setConfirmDialog(false)}>Cancel</Button>
          <Button onClick={handleEndTrip} variant="contained" color="error">
            End Trip
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
}

export default TripTracker;
