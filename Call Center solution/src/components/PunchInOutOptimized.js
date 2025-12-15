import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Box,
  Button,
  Typography,
  Chip,
  Alert,
  CircularProgress,
  Snackbar,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from "@mui/material";
import {
  FiberManualRecord,
  Timer,
  LocationOn,
  CheckCircle,
  WifiOff,
  Wifi,
  Refresh,
  History,
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
  saveActivePunch,
  getActivePunch,
  clearActivePunch,
  isOnline,
  addNetworkListener,
  getLocationWithRetry,
  retryWithBackoff,
} from "../utils/offlineUtils";

/**
 * Punch In/Out Component - OPTIMIZED VERSION
 * Features:
 * - Persistent state across page refresh
 * - Retry logic with exponential backoff
 * - Network status indicator
 * - Better error handling
 * - Retroactive punch option
 * - Improved geolocation with fallback
 */
function PunchInOutOptimized({ onPunchData, initialPunchData, agentId, agentCollection }) {
  const [punchInData, setPunchInData] = useState(initialPunchData || null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [locationError, setLocationError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activePunchId, setActivePunchId] = useState(null);
  const [online, setOnline] = useState(isOnline());
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "info" });
  const [retrying, setRetrying] = useState(false);

  // Retroactive punch dialog
  const [retroactiveDialog, setRetroactiveDialog] = useState(false);
  const [retroactiveReason, setRetroactiveReason] = useState("");
  const [retroactiveType, setRetroactiveType] = useState(null); // 'punchIn' or 'punchOut'

  const timerRef = useRef(null);
  const unsubscribeRef = useRef(null);

  // Network status listener
  useEffect(() => {
    const cleanup = addNetworkListener(
      () => {
        setOnline(true);
        setSnackbar({ open: true, message: "Back online!", severity: "success" });
      },
      () => {
        setOnline(false);
        setSnackbar({ open: true, message: "You are offline", severity: "warning" });
      }
    );
    return cleanup;
  }, []);

  // Load persisted punch data on mount
  useEffect(() => {
    const loadPersistedData = async () => {
      if (!agentId) return;

      try {
        const localPunch = await getActivePunch(agentId);
        if (localPunch && localPunch.status === "active") {
          setPunchInData(localPunch);
        }
      } catch (error) {
        console.error("Error loading persisted punch:", error);
      }
    };

    loadPersistedData();
  }, [agentId]);

  // Listen to active punch from Firestore
  useEffect(() => {
    if (!agentId || !agentCollection) return;

    const punchesRef = collection(db, agentCollection, agentId, "activePunch");
    const activePunchQuery = query(
      punchesRef,
      where("status", "==", "active"),
      orderBy("punchInTime", "desc"),
      limit(1)
    );

    unsubscribeRef.current = onSnapshot(
      activePunchQuery,
      (snapshot) => {
        if (!snapshot.empty) {
          const punchDoc = snapshot.docs[0];
          const data = punchDoc.data();
          setActivePunchId(punchDoc.id);

          const punchData = {
            punchInTime: data.punchInTime?.toDate?.()?.toISOString() || data.punchInTime,
            punchInLocation: data.punchInLocation,
            punchOutTime: data.punchOutTime?.toDate?.()?.toISOString() || data.punchOutTime,
            punchOutLocation: data.punchOutLocation,
            totalDuration: data.totalDuration,
            durationFormatted: data.durationFormatted,
            status: data.status,
            retroactive: data.retroactive,
            retroactiveReason: data.retroactiveReason,
          };

          setPunchInData(punchData);

          // Save to localStorage for offline persistence
          saveActivePunch({
            ...punchData,
            agentId,
            agentCollection,
          });
        } else {
          if (!initialPunchData) {
            setPunchInData(null);
            setActivePunchId(null);
            clearActivePunch(agentId);
          }
        }
      },
      (error) => {
        console.error("Error listening to active punch:", error);

        // Fallback to localStorage
        getActivePunch(agentId).then((localPunch) => {
          if (localPunch && localPunch.status === "active") {
            setPunchInData(localPunch);
            setSnackbar({
              open: true,
              message: "Loaded punch data from local storage",
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
  }, [agentId, agentCollection, initialPunchData]);

  // Calculate elapsed time
  useEffect(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    if (punchInData && punchInData.punchInTime && !punchInData.punchOutTime) {
      const updateElapsed = () => {
        const punchInDate = new Date(punchInData.punchInTime);
        const now = new Date();
        const elapsed = now - punchInDate;
        setElapsedTime(elapsed);
      };

      updateElapsed();
      timerRef.current = setInterval(updateElapsed, 1000);
    } else if (punchInData && punchInData.totalDuration) {
      setElapsedTime(punchInData.totalDuration);
    } else {
      setElapsedTime(0);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [punchInData]);

  // Format elapsed time
  const formatTime = useCallback((milliseconds) => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  }, []);

  // Punch In with retry logic
  const handlePunchIn = async () => {
    try {
      setLocationError(null);
      setLoading(true);
      setRetrying(false);

      const location = await getLocationWithRetry();

      if (agentId && agentCollection) {
        const punchData = {
          punchInLocation: location,
          punchInTime: serverTimestamp(),
          status: "active",
          createdAt: serverTimestamp(),
        };

        await retryWithBackoff(async () => {
          await addDoc(collection(db, agentCollection, agentId, "activePunch"), punchData);
        }, 3, 1000);

        // Save to localStorage immediately
        const localPunchData = {
          ...punchData,
          punchInTime: new Date().toISOString(),
          agentId,
          agentCollection,
        };
        await saveActivePunch(localPunchData);

        setSnackbar({
          open: true,
          message: `Punch In successful! Location: ${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`,
          severity: "success",
        });
      } else {
        // Fallback to local state
        const punchInTime = new Date().toISOString();
        const localPunchData = {
          punchInLocation: location,
          punchInTime: punchInTime,
        };
        setPunchInData(localPunchData);
        setSnackbar({ open: true, message: "Punch In successful!", severity: "success" });
      }
    } catch (error) {
      console.error("Error during punch in:", error);
      setLocationError(error.message);
      setRetrying(true);
      setSnackbar({
        open: true,
        message: `Punch In failed: ${error.message}`,
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  // Punch Out with retry logic
  const handlePunchOut = async () => {
    try {
      setLocationError(null);
      setLoading(true);
      setRetrying(false);

      const location = await getLocationWithRetry();

      const punchInDate = new Date(punchInData.punchInTime);
      const punchOutDate = new Date();
      const totalDuration = punchOutDate - punchInDate;

      if (agentId && agentCollection && activePunchId) {
        await retryWithBackoff(async () => {
          const punchRef = doc(db, agentCollection, agentId, "activePunch", activePunchId);
          await updateDoc(punchRef, {
            punchOutLocation: location,
            punchOutTime: serverTimestamp(),
            totalDuration: totalDuration,
            durationFormatted: formatTime(totalDuration),
            status: "completed",
            updatedAt: serverTimestamp(),
          });
        }, 3, 1000);

        const completePunchData = {
          ...punchInData,
          punchOutLocation: location,
          punchOutTime: new Date().toISOString(),
          totalDuration: totalDuration,
          durationFormatted: formatTime(totalDuration),
          status: "completed",
        };

        setPunchInData(completePunchData);
        await clearActivePunch(agentId);

        if (onPunchData) {
          onPunchData(completePunchData);
        }

        setSnackbar({
          open: true,
          message: `Punch Out successful! Duration: ${formatTime(totalDuration)}`,
          severity: "success",
        });
      } else {
        // Fallback to local state
        const completePunchData = {
          ...punchInData,
          punchOutLocation: location,
          punchOutTime: new Date().toISOString(),
          totalDuration: totalDuration,
          durationFormatted: formatTime(totalDuration),
        };

        setPunchInData(completePunchData);
        if (onPunchData) {
          onPunchData(completePunchData);
        }

        setSnackbar({ open: true, message: "Punch Out successful!", severity: "success" });
      }
    } catch (error) {
      console.error("Error during punch out:", error);
      setLocationError(error.message);
      setRetrying(true);
      setSnackbar({
        open: true,
        message: `Punch Out failed: ${error.message}`,
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  // Retroactive punch submission
  const handleRetroactivePunch = async () => {
    if (!retroactiveReason.trim()) {
      setSnackbar({ open: true, message: "Please provide a reason", severity: "error" });
      return;
    }

    try {
      setLoading(true);

      // Get current location (even for retroactive, we need to know where they are now)
      let location;
      try {
        location = await getLocationWithRetry();
      } catch (locError) {
        // If location fails, proceed without it for retroactive
        location = {
          latitude: 0,
          longitude: 0,
          accuracy: 0,
          timestamp: new Date().toISOString(),
          locationUnavailable: true,
        };
      }

      if (retroactiveType === "punchIn") {
        const punchData = {
          punchInLocation: location,
          punchInTime: serverTimestamp(),
          status: "active",
          createdAt: serverTimestamp(),
          retroactive: true,
          retroactiveReason: retroactiveReason.trim(),
          retroactiveType: "late_punch_in",
        };

        await addDoc(collection(db, agentCollection, agentId, "activePunch"), punchData);

        setSnackbar({
          open: true,
          message: "Retroactive Punch In recorded successfully",
          severity: "success",
        });
      } else if (retroactiveType === "punchOut") {
        const punchInDate = new Date(punchInData.punchInTime);
        const punchOutDate = new Date();
        const totalDuration = punchOutDate - punchInDate;

        const punchRef = doc(db, agentCollection, agentId, "activePunch", activePunchId);
        await updateDoc(punchRef, {
          punchOutLocation: location,
          punchOutTime: serverTimestamp(),
          totalDuration: totalDuration,
          durationFormatted: formatTime(totalDuration),
          status: "completed",
          updatedAt: serverTimestamp(),
          retroactive: true,
          retroactiveReason: retroactiveReason.trim(),
          retroactiveType: "late_punch_out",
        });

        const completePunchData = {
          ...punchInData,
          punchOutLocation: location,
          punchOutTime: new Date().toISOString(),
          totalDuration: totalDuration,
          durationFormatted: formatTime(totalDuration),
          status: "completed",
          retroactive: true,
          retroactiveReason: retroactiveReason.trim(),
        };

        setPunchInData(completePunchData);
        await clearActivePunch(agentId);

        if (onPunchData) {
          onPunchData(completePunchData);
        }

        setSnackbar({
          open: true,
          message: "Retroactive Punch Out recorded successfully",
          severity: "success",
        });
      }

      setRetroactiveDialog(false);
      setRetroactiveReason("");
      setRetroactiveType(null);
    } catch (error) {
      console.error("Error during retroactive punch:", error);
      setSnackbar({
        open: true,
        message: `Failed: ${error.message}`,
        severity: "error",
      });
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
      {/* Header */}
      <Box sx={{ display: "flex", alignItems: "center", gap: { xs: 1.5, sm: 2 }, mb: { xs: 1.5, sm: 2 }, flexWrap: "wrap" }}>
        <FiberManualRecord sx={{ fontSize: { xs: 28, sm: 32 } }} />
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, fontSize: { xs: "1.1rem", sm: "1.25rem" } }}>
            Location Punch System
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.9, fontSize: { xs: "0.8rem", sm: "0.875rem" } }}>
            {isPunchedOut
              ? "Visit completed - punch data recorded"
              : isPunchedIn
              ? "You are currently punched in"
              : "Punch in when you arrive at the location"}
          </Typography>
        </Box>
        <Box sx={{ display: "flex", gap: 1 }}>
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
            label={isPunchedOut ? "Completed" : isPunchedIn ? "Active" : "Inactive"}
            icon={isPunchedOut ? <CheckCircle /> : isPunchedIn ? <CheckCircle /> : <FiberManualRecord />}
            sx={{
              bgcolor: "rgba(255,255,255,0.25)",
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
              <Button
                color="inherit"
                size="small"
                onClick={isPunchedIn ? handlePunchOut : handlePunchIn}
                startIcon={<Refresh />}
              >
                Retry
              </Button>
            )
          }
        >
          {locationError}
        </Alert>
      )}

      {/* Loading Progress */}
      {loading && (
        <Box sx={{ mb: 2 }}>
          <LinearProgress sx={{ bgcolor: "rgba(255,255,255,0.2)", "& .MuiLinearProgress-bar": { bgcolor: "white" } }} />
          <Typography variant="caption" sx={{ opacity: 0.9 }}>
            Getting location...
          </Typography>
        </Box>
      )}

      {/* Retroactive Flag */}
      {punchInData?.retroactive && (
        <Alert severity="warning" sx={{ mb: 2, bgcolor: "rgba(255,255,255,0.2)", color: "white" }}>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            ⚠️ Retroactive Entry
          </Typography>
          <Typography variant="caption">Reason: {punchInData.retroactiveReason}</Typography>
        </Alert>
      )}

      {/* Active Punch Info */}
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
              <Typography variant="body2" sx={{ opacity: 0.9, fontSize: { xs: "0.75rem", sm: "0.875rem" } }}>
                Visit Duration
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 700, fontSize: { xs: "1.75rem", sm: "2.125rem" } }}>
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
              <Typography variant="body2" sx={{ opacity: 0.9, fontSize: { xs: "0.75rem", sm: "0.875rem" } }}>
                Punch In Location
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 600, fontFamily: "monospace", fontSize: { xs: "0.7rem", sm: "0.875rem" } }}>
                {punchInData.punchInLocation?.latitude?.toFixed(6)}, {punchInData.punchInLocation?.longitude?.toFixed(6)}
              </Typography>
              {punchInData.punchInLocation?.accuracy && (
                <Typography variant="caption" sx={{ opacity: 0.8, fontSize: { xs: "0.65rem", sm: "0.75rem" } }}>
                  Accuracy: ±{punchInData.punchInLocation.accuracy.toFixed(0)}m
                </Typography>
              )}
            </Box>
          </Box>
        </Box>
      )}

      {/* Completed Punch Info */}
      {isPunchedOut && (
        <Box sx={{ mb: { xs: 2, sm: 3 } }}>
          <Alert severity="success" sx={{ bgcolor: "rgba(255,255,255,0.2)", color: "white" }}>
            <Typography variant="body2" sx={{ fontWeight: 600, fontSize: { xs: "0.85rem", sm: "0.875rem" } }}>
              ✅ Punch In/Out Completed!
            </Typography>
            <Typography variant="caption" sx={{ fontSize: { xs: "0.7rem", sm: "0.75rem" } }}>
              Duration: {punchInData.durationFormatted}
            </Typography>
          </Alert>
        </Box>
      )}

      {/* Action Buttons */}
      {!isPunchedOut && (
        <Box sx={{ display: "flex", gap: { xs: 1.5, sm: 2 }, flexDirection: { xs: "column", sm: "row" } }}>
          {!isPunchedIn ? (
            <>
              <Button
                variant="contained"
                fullWidth
                size="large"
                startIcon={loading ? <CircularProgress size={20} sx={{ color: "#3b82f6" }} /> : <FiberManualRecord />}
                onClick={handlePunchIn}
                disabled={loading}
                sx={{
                  bgcolor: "white",
                  color: "#3b82f6",
                  fontWeight: 700,
                  py: { xs: 1.25, sm: 1.5 },
                  fontSize: { xs: "0.875rem", sm: "1rem" },
                  "&:hover": { bgcolor: "#f8fafc" },
                }}
              >
                {loading ? "PUNCHING IN..." : "PUNCH IN"}
              </Button>
              <Button
                variant="outlined"
                size="large"
                startIcon={<History />}
                onClick={() => {
                  setRetroactiveType("punchIn");
                  setRetroactiveDialog(true);
                }}
                disabled={loading}
                sx={{
                  borderColor: "rgba(255,255,255,0.5)",
                  color: "white",
                  fontWeight: 600,
                  py: { xs: 1, sm: 1.25 },
                  fontSize: { xs: "0.75rem", sm: "0.875rem" },
                  "&:hover": { borderColor: "white", bgcolor: "rgba(255,255,255,0.1)" },
                }}
              >
                LATE PUNCH IN
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="contained"
                fullWidth
                size="large"
                startIcon={loading ? <CircularProgress size={20} sx={{ color: "#22c55e" }} /> : <CheckCircle />}
                onClick={handlePunchOut}
                disabled={loading}
                sx={{
                  bgcolor: "white",
                  color: "#22c55e",
                  fontWeight: 700,
                  py: { xs: 1.25, sm: 1.5 },
                  fontSize: { xs: "0.875rem", sm: "1rem" },
                  "&:hover": { bgcolor: "#f8fafc" },
                }}
              >
                {loading ? "PUNCHING OUT..." : "PUNCH OUT"}
              </Button>
              <Button
                variant="outlined"
                size="large"
                startIcon={<History />}
                onClick={() => {
                  setRetroactiveType("punchOut");
                  setRetroactiveDialog(true);
                }}
                disabled={loading}
                sx={{
                  borderColor: "rgba(255,255,255,0.5)",
                  color: "white",
                  fontWeight: 600,
                  py: { xs: 1, sm: 1.25 },
                  fontSize: { xs: "0.75rem", sm: "0.875rem" },
                  "&:hover": { borderColor: "white", bgcolor: "rgba(255,255,255,0.1)" },
                }}
              >
                LATE PUNCH OUT
              </Button>
            </>
          )}
        </Box>
      )}

      {/* Info Alert */}
      <Alert severity="info" sx={{ mt: { xs: 1.5, sm: 2 }, bgcolor: "rgba(255,255,255,0.2)", color: "white" }}>
        <Typography variant="caption" sx={{ fontWeight: 600, fontSize: { xs: "0.7rem", sm: "0.75rem" } }}>
          ⚠️ MANDATORY: Punch in when arriving and punch out before leaving. Use "Late Punch" only if you forgot.
        </Typography>
      </Alert>

      {/* Retroactive Punch Dialog */}
      <Dialog open={retroactiveDialog} onClose={() => !loading && setRetroactiveDialog(false)}>
        <DialogTitle>
          {retroactiveType === "punchIn" ? "Late Punch In" : "Late Punch Out"}
        </DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            This will be flagged as a retroactive entry and requires manager approval.
          </Alert>
          <TextField
            autoFocus
            margin="dense"
            label="Reason for late punch"
            fullWidth
            multiline
            rows={3}
            value={retroactiveReason}
            onChange={(e) => setRetroactiveReason(e.target.value)}
            placeholder="E.g., I forgot to punch in when I arrived at the clinic due to urgent patient situation..."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRetroactiveDialog(false)} disabled={loading}>
            Cancel
          </Button>
          <Button
            onClick={handleRetroactivePunch}
            variant="contained"
            disabled={loading || !retroactiveReason.trim()}
            startIcon={loading && <CircularProgress size={16} />}
          >
            {loading ? "Submitting..." : "Submit"}
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
    </Box>
  );
}

export default PunchInOutOptimized;
