import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  Button,
  Menu,
  MenuItem,
  Card,
  CardContent,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  Chip,
  LinearProgress,
  Divider,
  ImageList,
  ImageListItem,
  ImageListItemBar,
  Alert,
  Snackbar,
  CircularProgress,
  Rating,
} from "@mui/material";
import {
  Add,
  Delete,
  Edit,
  CloudUpload,
  Close,
  AccessTime,
  Phone,
  Groups,
  LocalHospital,
  Save,
  CheckCircle,
  Star,
  Image as ImageIcon,
  ExpandMore,
} from "@mui/icons-material";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import {
  collection,
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db, storage } from "../firebaseConfig";

// Task Types
const TASK_TYPES = {
  MEETING: "Meeting/Huddle/Training",
  AWARENESS: "Awareness Call",
  BM_DISCUSSION: "BM Discussion on Policy Target",
  CLINIC_WORK: "Clinic Work Assigned by RO/DRO",
};

// Rating calculation based on percentage
const getRating = (percentage) => {
  if (percentage >= 90) return { stars: 5, label: "Excellent", color: "#4caf50" };
  if (percentage >= 75) return { stars: 4, label: "Good", color: "#8bc34a" };
  if (percentage >= 50) return { stars: 3, label: "Average", color: "#ff9800" };
  if (percentage >= 25) return { stars: 2, label: "Below Average", color: "#ff5722" };
  return { stars: 1, label: "Needs Improvement", color: "#f44336" };
};

// Format minutes to hours and minutes
const formatDuration = (minutes) => {
  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hrs === 0) return `${mins}m`;
  if (mins === 0) return `${hrs}h`;
  return `${hrs}h ${mins}m`;
};

// Generate unique ID
const generateId = () => Math.random().toString(36).substr(2, 9);

const DailyTaskForm = ({ agentId, agentName, agentCollection, currentUser }) => {
  // State
  const [tasks, setTasks] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);
  const [openDialog, setOpenDialog] = useState(null);
  const [editingTask, setEditingTask] = useState(null);
  const [showSummary, setShowSummary] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  const [existingData, setExistingData] = useState(null);

  // Form states for dialogs
  const [meetingForm, setMeetingForm] = useState({
    images: [],
    imagePreviews: [],
    startTime: "",
    endTime: "",
    comment: "",
  });

  const [awarenessForm, setAwarenessForm] = useState({
    connectedCalls: "",
    notConnectedCalls: "",
  });

  const [bmDiscussionForm, setBmDiscussionForm] = useState({
    meetingCount: "",
  });

  const [clinicWorkForm, setClinicWorkForm] = useState({
    description: "",
    hours: "",
    minutes: "",
  });

  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split("T")[0];

  // Calculate total duration
  const totalDuration = tasks.reduce((sum, task) => sum + (task.duration || 0), 0);
  const shiftDuration = 480; // 8 hours in minutes
  const percentage = Math.min((totalDuration / shiftDuration) * 100, 100);
  const rating = getRating(percentage);

  // Load existing data on mount
  useEffect(() => {
    loadExistingData();
  }, [agentId]);

  const loadExistingData = async () => {
    if (!agentId) return;
    setLoading(true);
    try {
      const docRef = doc(db, agentCollection, agentId, "dailyTasks", today);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setExistingData(data);
        setTasks(data.tasks || []);
      }
    } catch (error) {
      console.error("Error loading daily tasks:", error);
    } finally {
      setLoading(false);
    }
  };

  // Handle menu
  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleSelectTaskType = (type) => {
    handleMenuClose();
    setEditingTask(null);
    resetForms();
    setOpenDialog(type);
  };

  // Reset all forms
  const resetForms = () => {
    setMeetingForm({ images: [], imagePreviews: [], startTime: "", endTime: "", comment: "" });
    setAwarenessForm({ connectedCalls: "", notConnectedCalls: "" });
    setBmDiscussionForm({ meetingCount: "" });
    setClinicWorkForm({ description: "", hours: "", minutes: "" });
  };

  // Handle image upload for meetings
  const handleImageUpload = (event) => {
    const files = Array.from(event.target.files);
    const validFiles = files.filter((file) => {
      if (file.size > 20 * 1024 * 1024) {
        setSnackbar({ open: true, message: "Image size must be less than 20MB", severity: "error" });
        return false;
      }
      return true;
    });

    // Create previews
    const newPreviews = validFiles.map((file) => URL.createObjectURL(file));

    setMeetingForm((prev) => ({
      ...prev,
      images: [...prev.images, ...validFiles],
      imagePreviews: [...prev.imagePreviews, ...newPreviews],
    }));
  };

  const removeImage = (index) => {
    setMeetingForm((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
      imagePreviews: prev.imagePreviews.filter((_, i) => i !== index),
    }));
  };

  // Calculate meeting duration
  const calculateMeetingDuration = () => {
    if (!meetingForm.startTime || !meetingForm.endTime) return 0;
    const [startHour, startMin] = meetingForm.startTime.split(":").map(Number);
    const [endHour, endMin] = meetingForm.endTime.split(":").map(Number);
    const startMins = startHour * 60 + startMin;
    const endMins = endHour * 60 + endMin;
    return Math.max(0, endMins - startMins);
  };

  // Upload images to Firebase Storage
  const uploadImages = async (images) => {
    const uploadedUrls = [];
    for (let i = 0; i < images.length; i++) {
      const file = images[i];
      const timestamp = Date.now();
      const fileName = `daily_tasks/${agentId}/${today}/${timestamp}_${i}_${file.name}`;
      const storageRef = ref(storage, fileName);

      try {
        const snapshot = await uploadBytes(storageRef, file);
        const downloadURL = await getDownloadURL(snapshot.ref);
        uploadedUrls.push({
          url: downloadURL,
          fileName: file.name,
          size: file.size,
          uploadedAt: new Date().toISOString(),
        });
      } catch (error) {
        console.error("Error uploading image:", error);
        throw error;
      }
    }
    return uploadedUrls;
  };

  // Add Meeting Task
  const handleAddMeeting = async () => {
    if (!meetingForm.startTime || !meetingForm.endTime) {
      setSnackbar({ open: true, message: "Please enter start and end time", severity: "error" });
      return;
    }

    setSaving(true);
    try {
      let imageUrls = [];
      if (meetingForm.images.length > 0) {
        imageUrls = await uploadImages(meetingForm.images);
      }

      const duration = calculateMeetingDuration();
      const newTask = {
        id: editingTask?.id || generateId(),
        type: "MEETING",
        images: imageUrls,
        startTime: meetingForm.startTime,
        endTime: meetingForm.endTime,
        duration,
        comment: meetingForm.comment,
        createdAt: new Date().toISOString(),
      };

      if (editingTask) {
        setTasks((prev) => prev.map((t) => (t.id === editingTask.id ? newTask : t)));
      } else {
        setTasks((prev) => [...prev, newTask]);
      }

      setOpenDialog(null);
      resetForms();
      setSnackbar({ open: true, message: "Meeting task added successfully", severity: "success" });
    } catch (error) {
      setSnackbar({ open: true, message: "Error adding meeting task", severity: "error" });
    } finally {
      setSaving(false);
    }
  };

  // Add Awareness Call Task
  const handleAddAwarenessCall = () => {
    const connected = parseInt(awarenessForm.connectedCalls) || 0;
    const notConnected = parseInt(awarenessForm.notConnectedCalls) || 0;

    if (connected === 0 && notConnected === 0) {
      setSnackbar({ open: true, message: "Please enter at least one call count", severity: "error" });
      return;
    }

    const duration = connected * 5 + notConnected * 1; // 5 mins per connected, 1 min per not connected

    const newTask = {
      id: editingTask?.id || generateId(),
      type: "AWARENESS",
      connectedCalls: connected,
      notConnectedCalls: notConnected,
      duration,
      createdAt: new Date().toISOString(),
    };

    if (editingTask) {
      setTasks((prev) => prev.map((t) => (t.id === editingTask.id ? newTask : t)));
    } else {
      setTasks((prev) => [...prev, newTask]);
    }

    setOpenDialog(null);
    resetForms();
    setSnackbar({ open: true, message: "Awareness call task added successfully", severity: "success" });
  };

  // Add BM Discussion Task
  const handleAddBmDiscussion = () => {
    const count = parseInt(bmDiscussionForm.meetingCount) || 0;

    if (count === 0) {
      setSnackbar({ open: true, message: "Please enter meeting count", severity: "error" });
      return;
    }

    const duration = count * 10; // 10 mins per meeting

    const newTask = {
      id: editingTask?.id || generateId(),
      type: "BM_DISCUSSION",
      meetingCount: count,
      duration,
      createdAt: new Date().toISOString(),
    };

    if (editingTask) {
      setTasks((prev) => prev.map((t) => (t.id === editingTask.id ? newTask : t)));
    } else {
      setTasks((prev) => [...prev, newTask]);
    }

    setOpenDialog(null);
    resetForms();
    setSnackbar({ open: true, message: "BM Discussion task added successfully", severity: "success" });
  };

  // Add Clinic Work Task
  const handleAddClinicWork = () => {
    const hours = parseInt(clinicWorkForm.hours) || 0;
    const minutes = parseInt(clinicWorkForm.minutes) || 0;

    if (hours === 0 && minutes === 0) {
      setSnackbar({ open: true, message: "Please enter time spent", severity: "error" });
      return;
    }

    if (!clinicWorkForm.description.trim()) {
      setSnackbar({ open: true, message: "Please enter work description", severity: "error" });
      return;
    }

    const duration = hours * 60 + minutes;

    const newTask = {
      id: editingTask?.id || generateId(),
      type: "CLINIC_WORK",
      description: clinicWorkForm.description,
      hours,
      minutes,
      duration,
      createdAt: new Date().toISOString(),
    };

    if (editingTask) {
      setTasks((prev) => prev.map((t) => (t.id === editingTask.id ? newTask : t)));
    } else {
      setTasks((prev) => [...prev, newTask]);
    }

    setOpenDialog(null);
    resetForms();
    setSnackbar({ open: true, message: "Clinic work task added successfully", severity: "success" });
  };

  // Edit task
  const handleEditTask = (task) => {
    setEditingTask(task);

    switch (task.type) {
      case "MEETING":
        setMeetingForm({
          images: [],
          imagePreviews: task.images?.map((img) => img.url) || [],
          startTime: task.startTime,
          endTime: task.endTime,
          comment: task.comment || "",
        });
        setOpenDialog("MEETING");
        break;
      case "AWARENESS":
        setAwarenessForm({
          connectedCalls: task.connectedCalls.toString(),
          notConnectedCalls: task.notConnectedCalls.toString(),
        });
        setOpenDialog("AWARENESS");
        break;
      case "BM_DISCUSSION":
        setBmDiscussionForm({
          meetingCount: task.meetingCount.toString(),
        });
        setOpenDialog("BM_DISCUSSION");
        break;
      case "CLINIC_WORK":
        setClinicWorkForm({
          description: task.description,
          hours: task.hours.toString(),
          minutes: task.minutes.toString(),
        });
        setOpenDialog("CLINIC_WORK");
        break;
      default:
        break;
    }
  };

  // Delete task
  const handleDeleteTask = (taskId) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
    setSnackbar({ open: true, message: "Task deleted", severity: "info" });
  };

  // Save draft
  const handleSaveDraft = async () => {
    if (tasks.length === 0) {
      setSnackbar({ open: true, message: "No tasks to save", severity: "warning" });
      return;
    }

    setSaving(true);
    try {
      const docRef = doc(db, agentCollection, agentId, "dailyTasks", today);
      await setDoc(docRef, {
        date: today,
        agentId,
        agentName: agentName || currentUser?.displayName || "Unknown",
        tasks,
        totalDuration,
        shiftDuration,
        percentage: Math.round(percentage * 10) / 10,
        rating: rating.label,
        status: "draft",
        createdAt: existingData?.createdAt || serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      setSnackbar({ open: true, message: "Draft saved successfully", severity: "success" });
    } catch (error) {
      console.error("Error saving draft:", error);
      setSnackbar({ open: true, message: "Error saving draft", severity: "error" });
    } finally {
      setSaving(false);
    }
  };

  // Submit final
  const handleSubmit = async () => {
    if (tasks.length === 0) {
      setSnackbar({ open: true, message: "No tasks to submit", severity: "warning" });
      return;
    }

    setSaving(true);
    try {
      const docRef = doc(db, agentCollection, agentId, "dailyTasks", today);
      await setDoc(docRef, {
        date: today,
        agentId,
        agentName: agentName || currentUser?.displayName || "Unknown",
        tasks,
        totalDuration,
        shiftDuration,
        percentage: Math.round(percentage * 10) / 10,
        rating: rating.label,
        status: "submitted",
        createdAt: existingData?.createdAt || serverTimestamp(),
        submittedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      setShowSummary(false);
      setSnackbar({ open: true, message: "Daily tasks submitted successfully!", severity: "success" });
      setExistingData({ status: "submitted" });
    } catch (error) {
      console.error("Error submitting:", error);
      setSnackbar({ open: true, message: "Error submitting tasks", severity: "error" });
    } finally {
      setSaving(false);
    }
  };

  // Render task card
  const renderTaskCard = (task) => {
    const getTaskIcon = () => {
      switch (task.type) {
        case "MEETING":
          return <Groups sx={{ color: "#26a69a" }} />;
        case "AWARENESS":
          return <Phone sx={{ color: "#42a5f5" }} />;
        case "BM_DISCUSSION":
          return <Groups sx={{ color: "#ab47bc" }} />;
        case "CLINIC_WORK":
          return <LocalHospital sx={{ color: "#ef5350" }} />;
        default:
          return <AccessTime />;
      }
    };

    const getTaskContent = () => {
      switch (task.type) {
        case "MEETING":
          return (
            <>
              <Typography variant="body2" color="text.secondary">
                {task.startTime} - {task.endTime} ({formatDuration(task.duration)})
              </Typography>
              {task.comment && (
                <Typography variant="body2" sx={{ mt: 0.5, fontStyle: "italic" }}>
                  "{task.comment}"
                </Typography>
              )}
              {task.images?.length > 0 && (
                <Chip
                  icon={<ImageIcon />}
                  label={`${task.images.length} image${task.images.length > 1 ? "s" : ""}`}
                  size="small"
                  sx={{ mt: 1 }}
                />
              )}
            </>
          );
        case "AWARENESS":
          return (
            <Typography variant="body2" color="text.secondary">
              Connected: {task.connectedCalls} ({task.connectedCalls * 5}m) | Not Connected:{" "}
              {task.notConnectedCalls} ({task.notConnectedCalls}m)
            </Typography>
          );
        case "BM_DISCUSSION":
          return (
            <Typography variant="body2" color="text.secondary">
              {task.meetingCount} meeting{task.meetingCount > 1 ? "s" : ""} × 10 mins
            </Typography>
          );
        case "CLINIC_WORK":
          return (
            <>
              <Typography variant="body2" color="text.secondary">
                Time: {task.hours > 0 ? `${task.hours}h ` : ""}
                {task.minutes > 0 ? `${task.minutes}m` : ""}
              </Typography>
              <Typography variant="body2" sx={{ mt: 0.5, fontStyle: "italic" }}>
                "{task.description}"
              </Typography>
            </>
          );
        default:
          return null;
      }
    };

    const isSubmitted = existingData?.status === "submitted";

    return (
      <Card
        key={task.id}
        sx={{
          mb: 2,
          borderRadius: 2,
          border: "1px solid",
          borderColor: "divider",
          "&:hover": {
            boxShadow: 2,
          },
        }}
      >
        <CardContent>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              {getTaskIcon()}
              <Box>
                <Typography variant="subtitle1" fontWeight={600}>
                  {TASK_TYPES[task.type]}
                </Typography>
                {getTaskContent()}
              </Box>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Chip
                label={formatDuration(task.duration)}
                color="primary"
                size="small"
                icon={<AccessTime />}
              />
              {!isSubmitted && (
                <>
                  <IconButton size="small" onClick={() => handleEditTask(task)}>
                    <Edit fontSize="small" />
                  </IconButton>
                  <IconButton size="small" color="error" onClick={() => handleDeleteTask(task.id)}>
                    <Delete fontSize="small" />
                  </IconButton>
                </>
              )}
            </Box>
          </Box>
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  const isSubmitted = existingData?.status === "submitted";

  return (
    <Box sx={{ p: 2 }}>
      {/* Header */}
      <Paper
        sx={{
          p: 3,
          mb: 3,
          borderRadius: 3,
          background: "linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)",
          color: "white",
        }}
      >
        <Typography variant="h5" fontWeight={700}>
          Daily Task Log
        </Typography>
        <Typography variant="body2" sx={{ opacity: 0.9 }}>
          {new Date().toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </Typography>
        {isSubmitted && (
          <Chip
            icon={<CheckCircle />}
            label="Submitted"
            sx={{ mt: 1, bgcolor: "rgba(255,255,255,0.2)", color: "white" }}
          />
        )}
      </Paper>

      {/* Add Task Button */}
      {!isSubmitted && (
        <Button
          variant="contained"
          startIcon={<Add />}
          endIcon={<ExpandMore />}
          onClick={handleMenuOpen}
          sx={{
            mb: 3,
            borderRadius: 2,
            background: "linear-gradient(135deg, #26a69a 0%, #00897b 100%)",
            "&:hover": {
              background: "linear-gradient(135deg, #00897b 0%, #00695c 100%)",
            },
          }}
        >
          Add Task
        </Button>
      )}

      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
        <MenuItem onClick={() => handleSelectTaskType("MEETING")}>
          <Groups sx={{ mr: 1, color: "#26a69a" }} />
          {TASK_TYPES.MEETING}
        </MenuItem>
        <MenuItem onClick={() => handleSelectTaskType("AWARENESS")}>
          <Phone sx={{ mr: 1, color: "#42a5f5" }} />
          {TASK_TYPES.AWARENESS}
        </MenuItem>
        <MenuItem onClick={() => handleSelectTaskType("BM_DISCUSSION")}>
          <Groups sx={{ mr: 1, color: "#ab47bc" }} />
          {TASK_TYPES.BM_DISCUSSION}
        </MenuItem>
        <MenuItem onClick={() => handleSelectTaskType("CLINIC_WORK")}>
          <LocalHospital sx={{ mr: 1, color: "#ef5350" }} />
          {TASK_TYPES.CLINIC_WORK}
        </MenuItem>
      </Menu>

      {/* Tasks List */}
      {tasks.length === 0 ? (
        <Paper
          sx={{
            p: 4,
            textAlign: "center",
            borderRadius: 3,
            bgcolor: "grey.50",
          }}
        >
          <AccessTime sx={{ fontSize: 48, color: "grey.400", mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            No tasks logged yet
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Click "Add Task" to start logging your daily activities
          </Typography>
        </Paper>
      ) : (
        <Box>{tasks.map(renderTaskCard)}</Box>
      )}

      {/* Progress Summary */}
      {tasks.length > 0 && (
        <Paper sx={{ p: 3, mt: 3, borderRadius: 3 }}>
          <Typography variant="h6" gutterBottom>
            Daily Progress
          </Typography>

          <Box sx={{ mb: 2 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
              <Typography variant="body2">
                {formatDuration(totalDuration)} / {formatDuration(shiftDuration)}
              </Typography>
              <Typography variant="body2" fontWeight={600}>
                {Math.round(percentage)}%
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={percentage}
              sx={{
                height: 10,
                borderRadius: 5,
                bgcolor: "grey.200",
                "& .MuiLinearProgress-bar": {
                  bgcolor: rating.color,
                  borderRadius: 5,
                },
              }}
            />
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Rating value={rating.stars} readOnly size="large" />
            <Typography variant="h6" sx={{ color: rating.color }}>
              {rating.label}
            </Typography>
          </Box>

          {/* Action Buttons */}
          {!isSubmitted && (
            <Box sx={{ display: "flex", gap: 2, mt: 3 }}>
              <Button
                variant="outlined"
                startIcon={<Save />}
                onClick={handleSaveDraft}
                disabled={saving}
              >
                Save Draft
              </Button>
              <Button
                variant="contained"
                startIcon={<CheckCircle />}
                onClick={() => setShowSummary(true)}
                disabled={saving}
                sx={{
                  background: "linear-gradient(135deg, #26a69a 0%, #00897b 100%)",
                }}
              >
                Review & Submit
              </Button>
            </Box>
          )}
        </Paper>
      )}

      {/* Meeting Dialog */}
      <Dialog
        open={openDialog === "MEETING"}
        onClose={() => setOpenDialog(null)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Groups sx={{ color: "#26a69a" }} />
            {editingTask ? "Edit" : "Add"} Meeting/Huddle/Training
          </Box>
        </DialogTitle>
        <DialogContent>
          {/* Image Upload */}
          <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>
            Upload Images (Optional)
          </Typography>
          <Box sx={{ mb: 2 }}>
            <input
              accept="image/*"
              style={{ display: "none" }}
              id="meeting-image-upload"
              type="file"
              multiple
              onChange={handleImageUpload}
            />
            <label htmlFor="meeting-image-upload">
              <Button
                variant="outlined"
                component="span"
                startIcon={<CloudUpload />}
              >
                Upload Images
              </Button>
            </label>
          </Box>

          {meetingForm.imagePreviews.length > 0 && (
            <ImageList cols={3} rowHeight={100} sx={{ mb: 2 }}>
              {meetingForm.imagePreviews.map((preview, index) => (
                <ImageListItem key={index}>
                  <img
                    src={preview}
                    alt={`Preview ${index + 1}`}
                    style={{ objectFit: "cover", height: 100 }}
                  />
                  <ImageListItemBar
                    actionIcon={
                      <IconButton
                        sx={{ color: "white" }}
                        size="small"
                        onClick={() => removeImage(index)}
                      >
                        <Close />
                      </IconButton>
                    }
                  />
                </ImageListItem>
              ))}
            </ImageList>
          )}

          {/* Time Inputs */}
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={6}>
              <TextField
                label="Start Time"
                type="time"
                value={meetingForm.startTime}
                onChange={(e) => setMeetingForm((prev) => ({ ...prev, startTime: e.target.value }))}
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="End Time"
                type="time"
                value={meetingForm.endTime}
                onChange={(e) => setMeetingForm((prev) => ({ ...prev, endTime: e.target.value }))}
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
          </Grid>

          {meetingForm.startTime && meetingForm.endTime && (
            <Alert severity="info" sx={{ mb: 2 }}>
              Duration: {formatDuration(calculateMeetingDuration())}
            </Alert>
          )}

          {/* Comment */}
          <TextField
            label="Comments (What was this meeting about?)"
            multiline
            rows={3}
            value={meetingForm.comment}
            onChange={(e) => setMeetingForm((prev) => ({ ...prev, comment: e.target.value }))}
            fullWidth
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(null)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleAddMeeting}
            disabled={saving}
            startIcon={saving ? <CircularProgress size={16} /> : null}
          >
            {editingTask ? "Update" : "Add"} Meeting
          </Button>
        </DialogActions>
      </Dialog>

      {/* Awareness Call Dialog */}
      <Dialog
        open={openDialog === "AWARENESS"}
        onClose={() => setOpenDialog(null)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Phone sx={{ color: "#42a5f5" }} />
            {editingTask ? "Edit" : "Add"} Awareness Call
          </Box>
        </DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mt: 2, mb: 2 }}>
            Connected calls = 5 mins each | Not connected calls = 1 min each
          </Alert>

          <Grid container spacing={2}>
            <Grid item xs={6}>
              <TextField
                label="Connected Calls"
                type="number"
                value={awarenessForm.connectedCalls}
                onChange={(e) =>
                  setAwarenessForm((prev) => ({ ...prev, connectedCalls: e.target.value }))
                }
                fullWidth
                inputProps={{ min: 0 }}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Not Connected Calls"
                type="number"
                value={awarenessForm.notConnectedCalls}
                onChange={(e) =>
                  setAwarenessForm((prev) => ({ ...prev, notConnectedCalls: e.target.value }))
                }
                fullWidth
                inputProps={{ min: 0 }}
              />
            </Grid>
          </Grid>

          {(awarenessForm.connectedCalls || awarenessForm.notConnectedCalls) && (
            <Alert severity="success" sx={{ mt: 2 }}>
              Total Duration:{" "}
              {formatDuration(
                (parseInt(awarenessForm.connectedCalls) || 0) * 5 +
                  (parseInt(awarenessForm.notConnectedCalls) || 0) * 1
              )}
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(null)}>Cancel</Button>
          <Button variant="contained" onClick={handleAddAwarenessCall}>
            {editingTask ? "Update" : "Add"} Awareness Call
          </Button>
        </DialogActions>
      </Dialog>

      {/* BM Discussion Dialog */}
      <Dialog
        open={openDialog === "BM_DISCUSSION"}
        onClose={() => setOpenDialog(null)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Groups sx={{ color: "#ab47bc" }} />
            {editingTask ? "Edit" : "Add"} BM Discussion on Policy Target
          </Box>
        </DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mt: 2, mb: 2 }}>
            Each BM discussion meeting = 10 mins
          </Alert>

          <TextField
            label="Number of Meetings"
            type="number"
            value={bmDiscussionForm.meetingCount}
            onChange={(e) =>
              setBmDiscussionForm((prev) => ({ ...prev, meetingCount: e.target.value }))
            }
            fullWidth
            inputProps={{ min: 0 }}
          />

          {bmDiscussionForm.meetingCount && (
            <Alert severity="success" sx={{ mt: 2 }}>
              Total Duration: {formatDuration((parseInt(bmDiscussionForm.meetingCount) || 0) * 10)}
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(null)}>Cancel</Button>
          <Button variant="contained" onClick={handleAddBmDiscussion}>
            {editingTask ? "Update" : "Add"} BM Discussion
          </Button>
        </DialogActions>
      </Dialog>

      {/* Clinic Work Dialog */}
      <Dialog
        open={openDialog === "CLINIC_WORK"}
        onClose={() => setOpenDialog(null)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <LocalHospital sx={{ color: "#ef5350" }} />
            {editingTask ? "Edit" : "Add"} Clinic Work Assigned by RO/DRO
          </Box>
        </DialogTitle>
        <DialogContent>
          <TextField
            label="Work Description"
            multiline
            rows={3}
            value={clinicWorkForm.description}
            onChange={(e) =>
              setClinicWorkForm((prev) => ({ ...prev, description: e.target.value }))
            }
            fullWidth
            sx={{ mt: 2, mb: 2 }}
            placeholder="Describe the clinic work assigned..."
          />

          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            Time Spent
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <TextField
                label="Hours"
                type="number"
                value={clinicWorkForm.hours}
                onChange={(e) =>
                  setClinicWorkForm((prev) => ({ ...prev, hours: e.target.value }))
                }
                fullWidth
                inputProps={{ min: 0, max: 8 }}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Minutes"
                type="number"
                value={clinicWorkForm.minutes}
                onChange={(e) =>
                  setClinicWorkForm((prev) => ({ ...prev, minutes: e.target.value }))
                }
                fullWidth
                inputProps={{ min: 0, max: 59 }}
              />
            </Grid>
          </Grid>

          {(clinicWorkForm.hours || clinicWorkForm.minutes) && (
            <Alert severity="success" sx={{ mt: 2 }}>
              Total Duration:{" "}
              {formatDuration(
                (parseInt(clinicWorkForm.hours) || 0) * 60 +
                  (parseInt(clinicWorkForm.minutes) || 0)
              )}
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(null)}>Cancel</Button>
          <Button variant="contained" onClick={handleAddClinicWork}>
            {editingTask ? "Update" : "Add"} Clinic Work
          </Button>
        </DialogActions>
      </Dialog>

      {/* Summary Dialog */}
      <Dialog open={showSummary} onClose={() => setShowSummary(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <CheckCircle sx={{ color: "#26a69a" }} />
            Daily Task Summary
          </Box>
        </DialogTitle>
        <DialogContent>
          <Paper sx={{ p: 2, mb: 2, bgcolor: "grey.50", borderRadius: 2 }}>
            <Typography variant="subtitle2" color="text.secondary">
              Date
            </Typography>
            <Typography variant="h6">
              {new Date().toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </Typography>
            <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 1 }}>
              Agent
            </Typography>
            <Typography variant="h6">
              {agentName || currentUser?.displayName || "Unknown"}
            </Typography>
          </Paper>

          <Divider sx={{ my: 2 }} />

          <Typography variant="h6" gutterBottom>
            Tasks Completed ({tasks.length})
          </Typography>

          {tasks.map((task, index) => (
            <Paper key={task.id} sx={{ p: 2, mb: 1, borderRadius: 2 }}>
              <Typography variant="subtitle1" fontWeight={600}>
                {index + 1}. {TASK_TYPES[task.type]}
              </Typography>
              {task.type === "MEETING" && (
                <>
                  <Typography variant="body2">
                    • {task.startTime} - {task.endTime} ({formatDuration(task.duration)})
                  </Typography>
                  {task.comment && (
                    <Typography variant="body2">• {task.comment}</Typography>
                  )}
                  {task.images?.length > 0 && (
                    <Typography variant="body2">
                      • {task.images.length} image{task.images.length > 1 ? "s" : ""} attached
                    </Typography>
                  )}
                </>
              )}
              {task.type === "AWARENESS" && (
                <>
                  <Typography variant="body2">
                    • Connected: {task.connectedCalls} calls ({task.connectedCalls * 5} mins)
                  </Typography>
                  <Typography variant="body2">
                    • Not Connected: {task.notConnectedCalls} calls ({task.notConnectedCalls} mins)
                  </Typography>
                  <Typography variant="body2">
                    • Total: {formatDuration(task.duration)}
                  </Typography>
                </>
              )}
              {task.type === "BM_DISCUSSION" && (
                <Typography variant="body2">
                  • {task.meetingCount} meeting{task.meetingCount > 1 ? "s" : ""} ({formatDuration(task.duration)})
                </Typography>
              )}
              {task.type === "CLINIC_WORK" && (
                <>
                  <Typography variant="body2">• {task.description}</Typography>
                  <Typography variant="body2">• Time: {formatDuration(task.duration)}</Typography>
                </>
              )}
            </Paper>
          ))}

          <Divider sx={{ my: 2 }} />

          <Paper
            sx={{
              p: 2,
              borderRadius: 2,
              background: "linear-gradient(135deg, #f5f5f5 0%, #e0e0e0 100%)",
            }}
          >
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Total Time Logged
                </Typography>
                <Typography variant="h5" fontWeight={700}>
                  {formatDuration(totalDuration)}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Shift Duration
                </Typography>
                <Typography variant="h5" fontWeight={700}>
                  {formatDuration(shiftDuration)}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Completion
                </Typography>
                <Typography variant="h5" fontWeight={700}>
                  {Math.round(percentage)}%
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Rating
                </Typography>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Rating value={rating.stars} readOnly />
                  <Typography variant="h6" sx={{ color: rating.color }}>
                    {rating.label}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowSummary(false)} startIcon={<Edit />}>
            Edit Tasks
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={saving}
            startIcon={saving ? <CircularProgress size={16} /> : <CheckCircle />}
            sx={{
              background: "linear-gradient(135deg, #26a69a 0%, #00897b 100%)",
            }}
          >
            Submit
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
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
};

export default DailyTaskForm;
