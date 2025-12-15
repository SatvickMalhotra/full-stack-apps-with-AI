import React, { useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  Alert,
  IconButton,
  ImageList,
  ImageListItem,
  ImageListItemBar,
} from "@mui/material";
import {
  CloudUpload,
  Delete,
  CheckCircle,
} from "@mui/icons-material";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "../firebaseConfig";
import PunchInOutNew from "./PunchInOutNew";
import ClinicCodeAutocomplete from "./ClinicCodeAutocomplete";

/**
 * DCOfflineVisitRecord Component
 * Simplified visit recording for DC agents
 */
const DCOfflineVisitRecord = ({ userId, userRole, userName, userEmpId }) => {
  // Punch In/Out data
  const [punchData, setPunchData] = useState(null);

  // Selected clinic from autocomplete
  const [selectedClinic, setSelectedClinic] = useState(null);

  // Editable clinic fields
  const [clinicCode, setClinicCode] = useState("");
  const [partnerName, setPartnerName] = useState("");
  const [branchName, setBranchName] = useState("");
  const [state, setState] = useState("");
  const [region, setRegion] = useState("");
  const [opsManager, setOpsManager] = useState("");
  const [opsManagerContact, setOpsManagerContact] = useState("");

  // Manual entry fields
  const [bmName, setBmName] = useState("");
  const [bmContact, setBmContact] = useState("");
  const [remarks, setRemarks] = useState("");

  // Image uploads
  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [uploadingImages, setUploadingImages] = useState(false);

  // UI state
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const MAX_IMAGES = 5;
  const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB

  // Handle clinic selection from autocomplete
  const handleClinicSelect = (clinic) => {
    setSelectedClinic(clinic);
    // Populate editable fields with clinic data
    setClinicCode(clinic.clinicCode || "");
    setPartnerName(clinic.partnerName || "");
    setBranchName(clinic.branchName || "");
    setState(clinic.state || "");
    setRegion(clinic.region || "");
    setOpsManager(clinic.assignedOpsManager || "");
    setOpsManagerContact(clinic.opsManagerContact || "");
    setErrorMessage("");
  };

  // Handle image selection
  const handleImageSelect = (event) => {
    const files = Array.from(event.target.files);
    setErrorMessage("");

    if (images.length + files.length > MAX_IMAGES) {
      setErrorMessage(`Maximum ${MAX_IMAGES} images allowed`);
      return;
    }

    const validFiles = [];
    const newPreviews = [];

    files.forEach((file) => {
      if (!file.type.startsWith("image/")) {
        setErrorMessage("Only image files are allowed");
        return;
      }

      if (file.size > MAX_FILE_SIZE) {
        setErrorMessage(`Image ${file.name} exceeds 20MB limit`);
        return;
      }

      validFiles.push(file);
      newPreviews.push(URL.createObjectURL(file));
    });

    setImages([...images, ...validFiles]);
    setImagePreviews([...imagePreviews, ...newPreviews]);
  };

  // Remove image
  const removeImage = (index) => {
    URL.revokeObjectURL(imagePreviews[index]);
    setImages(images.filter((_, i) => i !== index));
    setImagePreviews(imagePreviews.filter((_, i) => i !== index));
  };

  // Upload images to Firebase Storage
  const uploadImages = async () => {
    if (images.length === 0) return [];

    setUploadingImages(true);
    const imageUrls = [];

    try {
      for (const image of images) {
        const imageRef = ref(
          storage,
          `offline_visits_dc/${userId}/${Date.now()}_${image.name}`
        );
        await uploadBytes(imageRef, image);
        const url = await getDownloadURL(imageRef);
        imageUrls.push(url);
      }
    } catch (error) {
      console.error("Error uploading images:", error);
      throw error;
    } finally {
      setUploadingImages(false);
    }

    return imageUrls;
  };

  // Validate form
  const validateForm = () => {
    if (!punchData || punchData.status !== "completed") {
      setErrorMessage("Please complete punch out before submitting");
      return false;
    }

    if (!selectedClinic) {
      setErrorMessage("Please select a clinic code");
      return false;
    }

    if (!bmName.trim()) {
      setErrorMessage("BM Name is required");
      return false;
    }

    if (!bmContact.trim()) {
      setErrorMessage("BM Contact Number is required");
      return false;
    }

    const contactRegex = /^[0-9]{10}$/;
    if (!contactRegex.test(bmContact.trim())) {
      setErrorMessage("BM Contact Number must be 10 digits");
      return false;
    }

    return true;
  };

  // Submit visit
  const handleSubmit = async () => {
    setErrorMessage("");
    setSuccessMessage("");

    if (!validateForm()) return;

    try {
      setSubmitting(true);

      // Upload images
      const imageUrls = await uploadImages();

      // Get current date and time for consistency with regular offline visits
      const now = new Date();
      const dateStr = now.toISOString().split("T")[0]; // YYYY-MM-DD
      const timeStr = now.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });

      // Create visit document
      const visitData = {
        // User info
        userId,
        userName,
        userEmpId,
        userRole,
        department: "offline_visits_dc",

        // Clinic info (editable fields)
        clinicCode: clinicCode.trim(),
        partnerName: partnerName.trim(),
        region: region.trim(),
        state: state.trim(),
        branchName: branchName.trim(),
        opsManager: opsManager.trim(),
        opsManagerEmpId: selectedClinic.opsManagerEmpId || "",
        opsManagerContact: opsManagerContact.trim(),

        // Manual entry fields
        bmName: bmName.trim(),
        bmContact: bmContact.trim(),
        remarks: remarks.trim() || "",

        // Punch in/out data
        punchInTime: punchData.punchInTime,
        punchInLocation: punchData.punchInLocation,
        punchOutTime: punchData.punchOutTime,
        punchOutLocation: punchData.punchOutLocation,
        totalDuration: punchData.totalDuration,
        durationFormatted: punchData.durationFormatted,

        // Images
        images: imageUrls,
        imageCount: imageUrls.length,

        // Date and Time (for consistency with regular offline visits)
        date: dateStr,
        time: timeStr,

        // Metadata
        visitType: "dc_clinic_visit",
        status: "completed",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      // Save to visitLogs subcollection
      await addDoc(
        collection(db, "offlineVisits", userId, "visitLogs"),
        visitData
      );

      setSuccessMessage("Visit record submitted successfully!");

      // Reset form
      setTimeout(() => {
        setPunchData(null);
        setSelectedClinic(null);
        // Reset clinic fields
        setClinicCode("");
        setPartnerName("");
        setBranchName("");
        setState("");
        setRegion("");
        setOpsManager("");
        setOpsManagerContact("");
        // Reset other fields
        setBmName("");
        setBmContact("");
        setRemarks("");
        setImages([]);
        setImagePreviews([]);
        setSuccessMessage("");
      }, 2000);
    } catch (error) {
      console.error("Error submitting visit:", error);
      setErrorMessage("Failed to submit visit: " + error.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 3, fontWeight: 600, color: "#1e293b" }}>
        Record Clinic Visit
      </Typography>

      {errorMessage && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setErrorMessage("")}>
          {errorMessage}
        </Alert>
      )}

      {successMessage && (
        <Alert severity="success" icon={<CheckCircle />} sx={{ mb: 3 }}>
          {successMessage}
        </Alert>
      )}

      {/* Punch In/Out Section */}
      <Box sx={{ mb: 4 }}>
        <PunchInOutNew
          agentId={userId}
          agentCollection="offlineVisits"
          initialPunchData={punchData}
          onPunchData={setPunchData}
        />
      </Box>

      {/* Clinic Selection */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" sx={{ mb: 2, color: "#1e293b", fontWeight: 600 }}>
          Clinic Details
        </Typography>
        <ClinicCodeAutocomplete
          agentId={userEmpId}
          onClinicSelect={handleClinicSelect}
          disabled={!punchData || punchData.status !== "completed"}
        />
      </Box>

      {/* Editable Clinic Details */}
      {selectedClinic && (
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" sx={{ mb: 2, color: "#1e293b", fontWeight: 600 }}>
            Clinic Details (Editable)
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Clinic Code"
                value={clinicCode}
                onChange={(e) => setClinicCode(e.target.value)}
                fullWidth
                helperText="You can edit if incorrect"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="Partner Name"
                value={partnerName}
                onChange={(e) => setPartnerName(e.target.value)}
                fullWidth
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="Branch Name"
                value={branchName}
                onChange={(e) => setBranchName(e.target.value)}
                fullWidth
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="State"
                value={state}
                onChange={(e) => setState(e.target.value)}
                fullWidth
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="Region"
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                fullWidth
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="OPS Manager"
                value={opsManager}
                onChange={(e) => setOpsManager(e.target.value)}
                fullWidth
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="OPS Manager Contact"
                value={opsManagerContact}
                onChange={(e) => setOpsManagerContact(e.target.value)}
                fullWidth
                inputMode="tel"
                inputProps={{
                  maxLength: 10,
                  style: { fontSize: '16px' } // Prevents iOS zoom
                }}
              />
            </Grid>
          </Grid>
        </Box>
      )}

      {/* Manual Entry Fields */}
      {selectedClinic && (
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" sx={{ mb: 2, color: "#1e293b", fontWeight: 600 }}>
            Visit Details
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="BM Name *"
                value={bmName}
                onChange={(e) => setBmName(e.target.value)}
                fullWidth
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="BM Contact Number *"
                value={bmContact}
                onChange={(e) => setBmContact(e.target.value)}
                fullWidth
                required
                inputProps={{
                  maxLength: 10,
                  style: { fontSize: '16px' } // Prevents iOS zoom
                }}
                inputMode="tel"
                helperText="10-digit mobile number"
                sx={{
                  '& .MuiInputBase-input': {
                    minHeight: '44px', // Better touch target
                  }
                }}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                label="Remarks (Optional)"
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                fullWidth
                multiline
                rows={3}
              />
            </Grid>
          </Grid>
        </Box>
      )}

      {/* Image Upload */}
      {selectedClinic && (
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" sx={{ mb: 2, color: "#1e293b", fontWeight: 600 }}>
            Upload Images (Max {MAX_IMAGES})
          </Typography>

          <Button
            variant="outlined"
            component="label"
            startIcon={<CloudUpload />}
            disabled={images.length >= MAX_IMAGES}
            sx={{
              borderRadius: "12px",
              textTransform: "none",
              mb: 2,
              minHeight: "48px", // Better touch target for mobile
              fontSize: "16px", // Prevents iOS zoom
              borderColor: "#667eea",
              color: "#667eea",
              "&:hover": {
                borderColor: "#5a67d8",
                bgcolor: "rgba(102, 126, 234, 0.04)",
              },
            }}
          >
            Choose Images
            <input
              type="file"
              hidden
              multiple
              accept="image/*"
              capture="environment"
              onChange={handleImageSelect}
            />
          </Button>

          {imagePreviews.length > 0 && (
            <ImageList cols={3} gap={12} sx={{ mt: 2 }}>
              {imagePreviews.map((preview, index) => (
                <ImageListItem key={index} sx={{ borderRadius: 2, overflow: "hidden" }}>
                  <img
                    src={preview}
                    alt={`Preview ${index + 1}`}
                    loading="lazy"
                    style={{ height: 150, objectFit: "cover" }}
                  />
                  <ImageListItemBar
                    actionIcon={
                      <IconButton
                        onClick={() => removeImage(index)}
                        sx={{ color: "white" }}
                      >
                        <Delete />
                      </IconButton>
                    }
                    sx={{ background: "linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.3) 70%, rgba(0,0,0,0) 100%)" }}
                  />
                </ImageListItem>
              ))}
            </ImageList>
          )}
        </Box>
      )}

      {/* Submit Button */}
      {selectedClinic && (
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={submitting || uploadingImages || !punchData || punchData.status !== "completed"}
          fullWidth
          sx={{
            bgcolor: "#22c55e",
            py: 1.5,
            minHeight: "52px", // Larger touch target for submit button
            borderRadius: "12px",
            fontSize: "16px", // Prevents iOS zoom
            fontWeight: 600,
            textTransform: "none",
            "&:hover": {
              bgcolor: "#16a34a",
            },
            "&:disabled": {
              bgcolor: "#cbd5e1",
              color: "#64748b",
            },
          }}
        >
          {submitting || uploadingImages ? "Submitting..." : "Submit Visit"}
        </Button>
      )}
    </Box>
  );
};

export default DCOfflineVisitRecord;
