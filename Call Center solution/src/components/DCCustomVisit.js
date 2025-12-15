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

/**
 * DCCustomVisit Component
 * For logging visits to custom/non-regular locations
 */
const DCCustomVisit = ({ userId, userRole, userName, userEmpId }) => {
  // Punch In/Out data
  const [punchData, setPunchData] = useState(null);

  // Custom location fields
  const [locationName, setLocationName] = useState("");
  const [address, setAddress] = useState("");
  const [contactPerson, setContactPerson] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [purpose, setPurpose] = useState("");
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

    if (!locationName.trim()) {
      setErrorMessage("Location Name is required");
      return false;
    }

    if (!address.trim()) {
      setErrorMessage("Address is required");
      return false;
    }

    if (!contactPerson.trim()) {
      setErrorMessage("Contact Person Name is required");
      return false;
    }

    if (!contactNumber.trim()) {
      setErrorMessage("Contact Number is required");
      return false;
    }

    const contactRegex = /^[0-9]{10}$/;
    if (!contactRegex.test(contactNumber.trim())) {
      setErrorMessage("Contact Number must be 10 digits");
      return false;
    }

    if (!purpose.trim()) {
      setErrorMessage("Purpose of Visit is required");
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

      // Get current date and time
      const now = new Date();
      const dateStr = now.toISOString().split("T")[0];
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

        // Custom location info
        visitType: "custom_location",
        locationName: locationName.trim(),
        address: address.trim(),
        contactPerson: contactPerson.trim(),
        contactNumber: contactNumber.trim(),
        purpose: purpose.trim(),
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

        // Date and Time
        date: dateStr,
        time: timeStr,

        // Metadata
        status: "completed",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      // Save to visitLogs subcollection
      await addDoc(
        collection(db, "offlineVisits", userId, "visitLogs"),
        visitData
      );

      setSuccessMessage("Custom visit record submitted successfully!");

      // Reset form
      setTimeout(() => {
        setPunchData(null);
        setLocationName("");
        setAddress("");
        setContactPerson("");
        setContactNumber("");
        setPurpose("");
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
        Record Custom Location Visit
      </Typography>
      <Typography variant="body2" sx={{ mb: 3, color: "#64748b" }}>
        Use this form to log visits to locations not in your regular clinic list.
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

      {/* Custom Location Details */}
      {punchData && punchData.status === "completed" && (
        <>
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" sx={{ mb: 2, color: "#1e293b", fontWeight: 600 }}>
              Location Details
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  label="Location Name *"
                  value={locationName}
                  onChange={(e) => setLocationName(e.target.value)}
                  fullWidth
                  required
                  placeholder="e.g., ABC Hospital, XYZ Medical Store"
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  label="Address *"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  fullWidth
                  required
                  multiline
                  rows={2}
                  placeholder="Full address of the location"
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  label="Contact Person *"
                  value={contactPerson}
                  onChange={(e) => setContactPerson(e.target.value)}
                  fullWidth
                  required
                  placeholder="Name of person met"
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  label="Contact Number *"
                  value={contactNumber}
                  onChange={(e) => setContactNumber(e.target.value)}
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
                  label="Purpose of Visit *"
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  fullWidth
                  required
                  multiline
                  rows={2}
                  placeholder="Reason for visiting this location"
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  label="Additional Remarks (Optional)"
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  fullWidth
                  multiline
                  rows={3}
                  placeholder="Any additional notes or observations"
                />
              </Grid>
            </Grid>
          </Box>

          {/* Image Upload */}
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
                      sx={{
                        background:
                          "linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.3) 70%, rgba(0,0,0,0) 100%)",
                      }}
                    />
                  </ImageListItem>
                ))}
              </ImageList>
            )}
          </Box>

          {/* Submit Button */}
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={submitting || uploadingImages}
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
            {submitting || uploadingImages ? "Submitting..." : "Submit Custom Visit"}
          </Button>
        </>
      )}
    </Box>
  );
};

export default DCCustomVisit;
