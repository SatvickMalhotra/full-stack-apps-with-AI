import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Card,
  CardContent,
  Alert,
  IconButton,
  ImageList,
  ImageListItem,
  ImageListItemBar,
  LinearProgress,
  Stepper,
  Step,
  StepLabel,
  Paper,
} from "@mui/material";
import {
  Save,
  CloudUpload,
  Delete,
  CheckCircle,
  Info,
  Image as ImageIcon,
} from "@mui/icons-material";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "../firebaseConfig";
import PunchInOutNew from "./PunchInOutNew";

function OfflineVisitRecordNew({ agentId, agentCollection, agentName }) {
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({
    clinicCode: "",
    branchName: "",
    partnerName: "",
    bmName: "",
    branchContactNo: "",
    state: "",
    opsManagerName: "",
    visitType: "",
    discussionRemarks: "",
  });

  const [uploadedImages, setUploadedImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [punchData, setPunchData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [contactNoError, setContactNoError] = useState("");
  const [imageError, setImageError] = useState("");

  const visitTypes = ["BM Review", "AM/RM Review", "Clinic Visit", "Follow-up Visit", "New Partner Visit"];
  const steps = ["Punch In/Out", "Visit Details", "Upload Images", "Review & Submit"];

  const MAX_IMAGES = 3;
  const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB in bytes

  const handleInputChange = (field, value) => {
    if (field === "branchContactNo") {
      const numericValue = value.replace(/[^0-9]/g, "").slice(0, 10);
      setFormData((prev) => ({
        ...prev,
        [field]: numericValue,
      }));
      setContactNoError(
        numericValue.length !== 10 && numericValue.length > 0
          ? "Branch Contact No. must be exactly 10 digits"
          : ""
      );
    } else {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  // Handle image selection
  const handleImageSelect = (event) => {
    const files = Array.from(event.target.files);
    setImageError("");

    // Validate number of images
    if (uploadedImages.length + files.length > MAX_IMAGES) {
      setImageError(`You can only upload up to ${MAX_IMAGES} images`);
      return;
    }

    // Validate each file
    const validFiles = [];
    const newPreviews = [];

    files.forEach((file) => {
      // Check file size
      if (file.size > MAX_FILE_SIZE) {
        setImageError(`File "${file.name}" is too large. Maximum size is 20MB.`);
        return;
      }

      // Check file type
      if (!file.type.startsWith("image/")) {
        setImageError(`File "${file.name}" is not an image.`);
        return;
      }

      validFiles.push(file);

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        newPreviews.push({
          file,
          preview: reader.result,
          name: file.name,
          size: (file.size / (1024 * 1024)).toFixed(2), // Size in MB
        });

        if (newPreviews.length === validFiles.length) {
          setImagePreviews((prev) => [...prev, ...newPreviews]);
          setUploadedImages((prev) => [...prev, ...validFiles]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  // Remove image
  const handleRemoveImage = (index) => {
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
    setUploadedImages((prev) => prev.filter((_, i) => i !== index));
    setImageError("");
  };

  // Handle punch data from PunchInOut component
  const handlePunchData = (data) => {
    setPunchData(data);
  };

  // Upload images to Firebase Storage
  const uploadImages = async () => {
    const imageUrls = [];

    for (let i = 0; i < uploadedImages.length; i++) {
      const file = uploadedImages[i];
      const timestamp = Date.now();
      const fileName = `offline_visits/${agentId}/${timestamp}_${i}_${file.name}`;
      const storageRef = ref(storage, fileName);

      try {
        const snapshot = await uploadBytes(storageRef, file);
        const downloadURL = await getDownloadURL(snapshot.ref);
        imageUrls.push({
          url: downloadURL,
          fileName: file.name,
          size: file.size,
          uploadedAt: new Date().toISOString(),
        });

        setUploadProgress(((i + 1) / uploadedImages.length) * 100);
      } catch (error) {
        console.error(`Error uploading image ${file.name}:`, error);
        throw new Error(`Failed to upload image: ${file.name}`);
      }
    }

    return imageUrls;
  };

  // Validate form
  const validateForm = () => {
    // Step 0: Punch In/Out validation
    if (activeStep === 0) {
      if (!punchData) {
        alert("⚠️ Please complete Punch In and Punch Out before proceeding!");
        return false;
      }
      return true;
    }

    // Step 1: Visit Details validation
    if (activeStep === 1) {
      if (!formData.clinicCode.trim()) {
        alert("Please enter Clinic Code");
        return false;
      }
      if (!formData.branchName.trim()) {
        alert("Please enter Branch Name");
        return false;
      }
      if (!formData.partnerName.trim()) {
        alert("Please enter Partner Name");
        return false;
      }
      if (!formData.bmName.trim()) {
        alert("Please enter BM Name");
        return false;
      }
      if (formData.branchContactNo && formData.branchContactNo.length !== 10) {
        alert("Branch Contact No. must be exactly 10 digits");
        return false;
      }
      if (!formData.state.trim()) {
        alert("Please enter State");
        return false;
      }
      if (!formData.visitType) {
        alert("Please select Visit Type");
        return false;
      }
      if (!formData.discussionRemarks.trim()) {
        alert("Please enter Discussion Remarks");
        return false;
      }
      return true;
    }

    // Step 2: Image validation
    if (activeStep === 2) {
      if (uploadedImages.length === 0) {
        alert("⚠️ You must upload at least 1 image to verify your visit!");
        setImageError("At least 1 image is required");
        return false;
      }
      return true;
    }

    return true;
  };

  // Handle next step
  const handleNext = () => {
    if (validateForm()) {
      setActiveStep((prev) => prev + 1);
    }
  };

  // Handle back step
  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  // Submit form
  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);
      setUploadProgress(0);

      // Upload images first
      const imageUrls = await uploadImages();

      // Prepare the complete visit record
      const visitRecord = {
        ...formData,
        agentId,
        agentName,
        date: new Date().toLocaleDateString("en-CA"), // YYYY-MM-DD format
        time: new Date().toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        images: imageUrls,
        punchInData: punchData,
        timestamp: serverTimestamp(),
        createdAt: serverTimestamp(),
      };

      // Save to Firestore
      await addDoc(
        collection(db, agentCollection, agentId, "offlineVisits"),
        visitRecord
      );

      alert(
        `✅ Offline Visit Record Submitted Successfully!\n\n` +
        `Visit Duration: ${punchData.durationFormatted}\n` +
        `Images Uploaded: ${imageUrls.length}\n` +
        `Location Verified: Yes\n\n` +
        `This visit has been recorded and will be reviewed for reimbursement.`
      );

      // Reset form
      setFormData({
        clinicCode: "",
        branchName: "",
        partnerName: "",
        bmName: "",
        branchContactNo: "",
        state: "",
        opsManagerName: "",
        visitType: "",
        discussionRemarks: "",
      });
      setUploadedImages([]);
      setImagePreviews([]);
      setPunchData(null);
      setActiveStep(0);
      setUploadProgress(0);
    } catch (error) {
      console.error("Error submitting offline visit record:", error);
      alert("Failed to submit visit record. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      {/* Stepper */}
      <Paper sx={{ p: { xs: 2, sm: 3 }, mb: { xs: 2, sm: 3 }, borderRadius: "16px" }}>
        <Stepper activeStep={activeStep} alternativeLabel>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel sx={{ '& .MuiStepLabel-label': { fontSize: { xs: '0.75rem', sm: '0.875rem' } } }}>
                {label}
              </StepLabel>
            </Step>
          ))}
        </Stepper>
      </Paper>

      {/* Step Content */}
      <Box>
        {/* Step 0: Punch In/Out */}
        {activeStep === 0 && (
          <Box>
            <PunchInOutNew
              onPunchData={handlePunchData}
              initialPunchData={punchData}
              agentId={agentId}
              agentCollection={agentCollection}
            />
          </Box>
        )}

        {/* Step 1: Visit Details */}
        {activeStep === 1 && (
          <Card sx={{ borderRadius: "16px" }}>
            <CardContent sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
              <Typography variant="h6" sx={{ mb: { xs: 2, sm: 3 }, fontWeight: 700, fontSize: { xs: '1.1rem', sm: '1.25rem' } }}>
                Visit Information
              </Typography>
              <Grid container spacing={{ xs: 2, sm: 3 }}>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Clinic Code *"
                    fullWidth
                    value={formData.clinicCode}
                    onChange={(e) => handleInputChange("clinicCode", e.target.value)}
                    variant="outlined"
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    label="Branch Name *"
                    fullWidth
                    value={formData.branchName}
                    onChange={(e) => handleInputChange("branchName", e.target.value)}
                    variant="outlined"
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    label="Partner Name *"
                    fullWidth
                    value={formData.partnerName}
                    onChange={(e) => handleInputChange("partnerName", e.target.value)}
                    variant="outlined"
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    label="BM Name *"
                    fullWidth
                    value={formData.bmName}
                    onChange={(e) => handleInputChange("bmName", e.target.value)}
                    variant="outlined"
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    label="Branch Contact No."
                    fullWidth
                    value={formData.branchContactNo}
                    onChange={(e) => handleInputChange("branchContactNo", e.target.value)}
                    variant="outlined"
                    error={!!contactNoError}
                    helperText={contactNoError}
                    inputProps={{ maxLength: 10 }}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    label="State *"
                    fullWidth
                    value={formData.state}
                    onChange={(e) => handleInputChange("state", e.target.value)}
                    variant="outlined"
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    label="OPS Manager Name"
                    fullWidth
                    value={formData.opsManagerName}
                    onChange={(e) => handleInputChange("opsManagerName", e.target.value)}
                    variant="outlined"
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <FormControl fullWidth variant="outlined">
                    <InputLabel id="visit-type-label">Visit Type *</InputLabel>
                    <Select
                      labelId="visit-type-label"
                      value={formData.visitType}
                      onChange={(e) => handleInputChange("visitType", e.target.value)}
                      label="Visit Type *"
                      MenuProps={{
                        PaperProps: {
                          sx: {
                            maxHeight: 300,
                            '& .MuiMenuItem-root': {
                              fontSize: '1rem',
                              padding: '12px 16px',
                            },
                          },
                        },
                      }}
                    >
                      {visitTypes.map((type) => (
                        <MenuItem key={type} value={type}>
                          {type}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    label="Discussion Remarks *"
                    fullWidth
                    multiline
                    rows={4}
                    value={formData.discussionRemarks}
                    onChange={(e) => handleInputChange("discussionRemarks", e.target.value)}
                    variant="outlined"
                    placeholder="Describe the discussion, key points, outcomes, and any follow-up actions..."
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Upload Images */}
        {activeStep === 2 && (
          <Card sx={{ borderRadius: "16px" }}>
            <CardContent sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
              <Typography variant="h6" sx={{ mb: { xs: 1.5, sm: 2 }, fontWeight: 700, fontSize: { xs: '1.1rem', sm: '1.25rem' } }}>
                Upload Visit Images
              </Typography>

              <Alert severity="info" icon={<Info />} sx={{ mb: { xs: 2, sm: 3 } }}>
                <Typography variant="body2" sx={{ fontWeight: 600, fontSize: { xs: '0.85rem', sm: '0.875rem' } }}>
                  Upload 1-3 images of your visit to verify credibility
                </Typography>
                <Typography variant="caption" sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
                  • Minimum: 1 image (required)
                  • Maximum: 3 images
                  • Max file size: 20MB per image
                  • Accepted formats: JPG, PNG, HEIC
                </Typography>
              </Alert>

              {imageError && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {imageError}
                </Alert>
              )}

              <Box sx={{ mb: 3 }}>
                <input
                  accept="image/*"
                  style={{ display: "none" }}
                  id="image-upload"
                  type="file"
                  multiple
                  onChange={handleImageSelect}
                  disabled={uploadedImages.length >= MAX_IMAGES}
                />
                <label htmlFor="image-upload">
                  <Button
                    variant="contained"
                    component="span"
                    startIcon={<CloudUpload />}
                    disabled={uploadedImages.length >= MAX_IMAGES}
                    size="large"
                    fullWidth
                    sx={{
                      py: 2,
                      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    }}
                  >
                    {uploadedImages.length === 0
                      ? "Upload Images"
                      : `Upload More Images (${uploadedImages.length}/${MAX_IMAGES})`}
                  </Button>
                </label>
              </Box>

              {imagePreviews.length > 0 && (
                <ImageList cols={{ xs: 1, sm: 2, md: 3 }} gap={{ xs: 12, sm: 16 }}>
                  {imagePreviews.map((image, index) => (
                    <ImageListItem key={index}>
                      <img
                        src={image.preview}
                        alt={`Upload ${index + 1}`}
                        loading="lazy"
                        style={{
                          height: "200px",
                          objectFit: "cover",
                          borderRadius: "12px",
                        }}
                      />
                      <ImageListItemBar
                        title={image.name}
                        subtitle={`${image.size} MB`}
                        actionIcon={
                          <IconButton
                            sx={{ color: "white" }}
                            onClick={() => handleRemoveImage(index)}
                          >
                            <Delete />
                          </IconButton>
                        }
                        sx={{
                          background: "linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.3) 70%, rgba(0,0,0,0) 100%)",
                          borderRadius: "0 0 12px 12px",
                          '& .MuiImageListItemBar-title': { fontSize: { xs: '0.8rem', sm: '0.875rem' } },
                          '& .MuiImageListItemBar-subtitle': { fontSize: { xs: '0.7rem', sm: '0.75rem' } },
                        }}
                      />
                    </ImageListItem>
                  ))}
                </ImageList>
              )}

              {uploadedImages.length === 0 && (
                <Box
                  sx={{
                    border: "2px dashed #cbd5e1",
                    borderRadius: "16px",
                    p: { xs: 4, sm: 6 },
                    textAlign: "center",
                    bgcolor: "#f8fafc",
                  }}
                >
                  <ImageIcon sx={{ fontSize: { xs: 48, sm: 64 }, color: "#94a3b8", mb: { xs: 1, sm: 2 } }} />
                  <Typography variant="body1" sx={{ color: "#64748b", fontSize: { xs: '0.9rem', sm: '1rem' } }}>
                    No images uploaded yet
                  </Typography>
                  <Typography variant="caption" sx={{ color: "#94a3b8", fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
                    Click the button above to upload images
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        )}

        {/* Step 3: Review & Submit */}
        {activeStep === 3 && (
          <Card sx={{ borderRadius: "16px" }}>
            <CardContent sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
              <Typography variant="h6" sx={{ mb: { xs: 2, sm: 3 }, fontWeight: 700, fontSize: { xs: '1.1rem', sm: '1.25rem' } }}>
                Review Your Submission
              </Typography>

              {/* Punch Data Summary */}
              <Box sx={{ mb: { xs: 2, sm: 3 }, p: { xs: 2, sm: 3 }, bgcolor: "#f0fdf4", borderRadius: "12px", border: "1px solid #86efac" }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: { xs: 1.5, sm: 2 }, color: "#16a34a", fontSize: { xs: '0.95rem', sm: '1rem' } }}>
                  ✓ Location & Time Verification
                </Typography>
                <Grid container spacing={{ xs: 1.5, sm: 2 }}>
                  <Grid item xs={6}>
                    <Typography variant="caption" sx={{ color: "#64748b" }}>Visit Duration</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{punchData?.durationFormatted}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" sx={{ color: "#64748b" }}>Images Uploaded</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{uploadedImages.length} images</Typography>
                  </Grid>
                </Grid>
              </Box>

              {/* Visit Details Summary */}
              <Box sx={{ mb: { xs: 2, sm: 3 } }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: { xs: 1.5, sm: 2 }, fontSize: { xs: '0.95rem', sm: '1rem' } }}>
                  Visit Details
                </Typography>
                <Grid container spacing={{ xs: 1.5, sm: 2 }}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="caption" sx={{ color: "#64748b" }}>Clinic Code</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{formData.clinicCode}</Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="caption" sx={{ color: "#64748b" }}>Branch Name</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{formData.branchName}</Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="caption" sx={{ color: "#64748b" }}>Partner Name</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{formData.partnerName}</Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="caption" sx={{ color: "#64748b" }}>BM Name</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{formData.bmName}</Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="caption" sx={{ color: "#64748b" }}>State</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{formData.state}</Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="caption" sx={{ color: "#64748b" }}>Visit Type</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{formData.visitType}</Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="caption" sx={{ color: "#64748b" }}>Discussion Remarks</Typography>
                    <Typography variant="body2">{formData.discussionRemarks}</Typography>
                  </Grid>
                </Grid>
              </Box>

              {/* Images Preview */}
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: { xs: 1.5, sm: 2 }, fontSize: { xs: '0.95rem', sm: '1rem' } }}>
                  Uploaded Images ({imagePreviews.length})
                </Typography>
                <ImageList cols={{ xs: 1, sm: 2, md: 3 }} gap={{ xs: 8, sm: 12 }}>
                  {imagePreviews.map((image, index) => (
                    <ImageListItem key={index}>
                      <img
                        src={image.preview}
                        alt={`Upload ${index + 1}`}
                        loading="lazy"
                        style={{
                          height: "150px",
                          objectFit: "cover",
                          borderRadius: "8px",
                        }}
                      />
                    </ImageListItem>
                  ))}
                </ImageList>
              </Box>

              {loading && (
                <Box sx={{ mt: 3 }}>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    Uploading images... {Math.round(uploadProgress)}%
                  </Typography>
                  <LinearProgress variant="determinate" value={uploadProgress} />
                </Box>
              )}
            </CardContent>
          </Card>
        )}
      </Box>

      {/* Navigation Buttons */}
      <Box sx={{ display: "flex", gap: { xs: 1.5, sm: 2 }, mt: { xs: 2, sm: 3 }, flexWrap: 'wrap' }}>
        <Button
          disabled={activeStep === 0}
          onClick={handleBack}
          variant="outlined"
          size="large"
          sx={{ minWidth: { xs: 100, sm: 120 }, fontSize: { xs: '0.875rem', sm: '0.9375rem' } }}
        >
          Back
        </Button>
        <Box sx={{ flexGrow: 1 }} />
        {activeStep < steps.length - 1 ? (
          <Button
            onClick={handleNext}
            variant="contained"
            size="large"
            sx={{
              minWidth: { xs: 100, sm: 120 },
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              fontSize: { xs: '0.875rem', sm: '0.9375rem' },
            }}
          >
            Next
          </Button>
        ) : (
          <Button
            onClick={handleSubmit}
            variant="contained"
            size="large"
            startIcon={<Save />}
            disabled={loading}
            sx={{
              minWidth: { xs: 140, sm: 180 },
              background: "linear-gradient(135deg, #22c55e, #16a34a)",
              fontSize: { xs: '0.875rem', sm: '0.9375rem' },
            }}
          >
            {loading ? "Submitting..." : "Submit Visit"}
          </Button>
        )}
      </Box>
    </Box>
  );
}

export default OfflineVisitRecordNew;
