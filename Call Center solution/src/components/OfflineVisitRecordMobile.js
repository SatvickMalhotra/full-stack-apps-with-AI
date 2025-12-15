import React, { useState, useCallback } from "react";
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
  LinearProgress,
  Paper,
  Chip,
  Collapse,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  MobileStepper,
} from "@mui/material";
import {
  Save,
  CloudUpload,
  Delete,
  CheckCircle,
  Info,
  Image as ImageIcon,
  ArrowForward,
  ArrowBack,
  LocationOn,
  Schedule,
  PhotoCamera,
  Description,
  ExpandMore,
  ExpandLess,
} from "@mui/icons-material";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebaseConfig";
import PunchInOutOptimized from "./PunchInOutOptimized";
import ImageUploadOptimized from "./ImageUploadOptimized";
import { useMobileOptimizations } from "../hooks/useMobileOptimizations";
import { compressImage } from "../utils/offlineUtils";

/**
 * Mobile-Optimized Offline Visit Record Form
 * Features:
 * - Vertical mobile stepper
 * - Larger touch targets
 * - Better keyboard handling
 * - Image compression for slow networks
 * - Collapsible sections
 */
function OfflineVisitRecordMobile({ agentId, agentCollection, agentName }) {
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
  const [punchData, setPunchData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [contactNoError, setContactNoError] = useState("");
  const [expandedSection, setExpandedSection] = useState("details");

  const { isMobile, isSlowConnection, lightTap, success: hapticSuccess } = useMobileOptimizations();

  const visitTypes = [
    "BM Review",
    "AM/RM Review",
    "Clinic Visit",
    "Follow-up Visit",
    "New Partner Visit",
  ];

  const steps = [
    { label: "Location", icon: <LocationOn /> },
    { label: "Details", icon: <Description /> },
    { label: "Photos", icon: <PhotoCamera /> },
    { label: "Submit", icon: <CheckCircle /> },
  ];

  const handleInputChange = useCallback((field, value) => {
    if (field === "branchContactNo") {
      const numericValue = value.replace(/[^0-9]/g, "").slice(0, 10);
      setFormData((prev) => ({ ...prev, [field]: numericValue }));
      setContactNoError(
        numericValue.length !== 10 && numericValue.length > 0
          ? "Must be 10 digits"
          : ""
      );
    } else {
      setFormData((prev) => ({ ...prev, [field]: value }));
    }
  }, []);

  const handlePunchData = useCallback((data) => {
    setPunchData(data);
  }, []);

  const handleImagesChange = useCallback((images) => {
    setUploadedImages(images);
  }, []);

  const validateStep = (step) => {
    switch (step) {
      case 0:
        if (!punchData) {
          alert("Please complete Punch In and Punch Out");
          return false;
        }
        return true;
      case 1:
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
      case 2:
        if (uploadedImages.length === 0) {
          alert("Please upload at least 1 image");
          return false;
        }
        return true;
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (validateStep(activeStep)) {
      lightTap();
      setActiveStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    lightTap();
    setActiveStep((prev) => prev - 1);
  };

  const handleSubmit = async () => {
    if (!validateStep(2)) return;

    try {
      setLoading(true);

      // Get image URLs from uploadedImages
      const imageUrls = uploadedImages
        .filter((img) => img.status === "uploaded" && img.url)
        .map((img) => ({
          url: img.url,
          fileName: img.name,
          size: img.size,
          uploadedAt: new Date().toISOString(),
        }));

      if (imageUrls.length === 0) {
        alert("Please wait for images to finish uploading");
        setLoading(false);
        return;
      }

      const visitRecord = {
        ...formData,
        agentId,
        agentName,
        date: new Date().toLocaleDateString("en-CA"),
        time: new Date().toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        images: imageUrls,
        punchInData: punchData,
        timestamp: serverTimestamp(),
        createdAt: serverTimestamp(),
      };

      await addDoc(
        collection(db, agentCollection, agentId, "offlineVisits"),
        visitRecord
      );

      hapticSuccess();
      alert(
        `Visit submitted successfully!\n\n` +
        `Duration: ${punchData.durationFormatted}\n` +
        `Images: ${imageUrls.length}\n` +
        `Location: Verified`
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
      setPunchData(null);
      setActiveStep(0);
    } catch (error) {
      console.error("Error submitting visit:", error);
      alert("Failed to submit. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Mobile Input Styles
  const mobileInputSx = {
    "& .MuiOutlinedInput-root": {
      borderRadius: "12px",
      minHeight: 52,
    },
    "& .MuiInputLabel-root": {
      fontSize: "0.9375rem",
    },
  };

  return (
    <Box>
      {/* Mobile Stepper Header */}
      <Box sx={{ mb: 3 }}>
        <MobileStepper
          variant="dots"
          steps={4}
          position="static"
          activeStep={activeStep}
          sx={{
            bgcolor: "transparent",
            justifyContent: "center",
            "& .MuiMobileStepper-dot": {
              width: 10,
              height: 10,
              mx: 0.5,
            },
            "& .MuiMobileStepper-dotActive": {
              bgcolor: "#667eea",
            },
          }}
          backButton={null}
          nextButton={null}
        />
        <Typography
          variant="h6"
          sx={{
            textAlign: "center",
            fontWeight: 700,
            mt: 1.5,
            color: "#1e293b",
          }}
        >
          {steps[activeStep].label}
        </Typography>
        <Typography
          variant="caption"
          sx={{
            textAlign: "center",
            display: "block",
            color: "#64748b",
          }}
        >
          Step {activeStep + 1} of 4
        </Typography>
      </Box>

      {/* Step 0: Punch In/Out */}
      {activeStep === 0 && (
        <Box>
          <PunchInOutOptimized
            onPunchData={handlePunchData}
            initialPunchData={punchData}
            agentId={agentId}
            agentCollection={agentCollection}
          />

          {punchData && punchData.punchOutTime && (
            <Alert
              severity="success"
              sx={{
                mt: 2,
                borderRadius: "12px",
                "& .MuiAlert-message": { fontWeight: 600 },
              }}
            >
              Location verified! Duration: {punchData.durationFormatted}
            </Alert>
          )}
        </Box>
      )}

      {/* Step 1: Visit Details */}
      {activeStep === 1 && (
        <Card sx={{ borderRadius: "16px", boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }}>
          <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  label="Clinic Code *"
                  fullWidth
                  value={formData.clinicCode}
                  onChange={(e) => handleInputChange("clinicCode", e.target.value)}
                  sx={mobileInputSx}
                  inputProps={{ autoComplete: "off" }}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  label="Branch Name *"
                  fullWidth
                  value={formData.branchName}
                  onChange={(e) => handleInputChange("branchName", e.target.value)}
                  sx={mobileInputSx}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  label="Partner Name *"
                  fullWidth
                  value={formData.partnerName}
                  onChange={(e) => handleInputChange("partnerName", e.target.value)}
                  sx={mobileInputSx}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  label="BM Name *"
                  fullWidth
                  value={formData.bmName}
                  onChange={(e) => handleInputChange("bmName", e.target.value)}
                  sx={mobileInputSx}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  label="Branch Contact No."
                  fullWidth
                  value={formData.branchContactNo}
                  onChange={(e) => handleInputChange("branchContactNo", e.target.value)}
                  sx={mobileInputSx}
                  error={!!contactNoError}
                  helperText={contactNoError}
                  inputProps={{ maxLength: 10, inputMode: "tel" }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  label="State *"
                  fullWidth
                  value={formData.state}
                  onChange={(e) => handleInputChange("state", e.target.value)}
                  sx={mobileInputSx}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  label="OPS Manager Name"
                  fullWidth
                  value={formData.opsManagerName}
                  onChange={(e) => handleInputChange("opsManagerName", e.target.value)}
                  sx={mobileInputSx}
                />
              </Grid>

              <Grid item xs={12}>
                <FormControl fullWidth sx={mobileInputSx}>
                  <InputLabel>Visit Type *</InputLabel>
                  <Select
                    value={formData.visitType}
                    onChange={(e) => handleInputChange("visitType", e.target.value)}
                    label="Visit Type *"
                    MenuProps={{
                      PaperProps: {
                        sx: {
                          maxHeight: 280,
                          "& .MuiMenuItem-root": {
                            minHeight: 48,
                            fontSize: "1rem",
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
                  sx={mobileInputSx}
                  placeholder="Key discussion points, outcomes, follow-up actions..."
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Image Upload */}
      {activeStep === 2 && (
        <Card sx={{ borderRadius: "16px", boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }}>
          <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
            <Alert
              severity="info"
              sx={{ mb: 2, borderRadius: "12px" }}
            >
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                Upload 1-3 images to verify your visit
              </Typography>
              <Typography variant="caption">
                {isSlowConnection
                  ? "Slow network detected - images will be compressed"
                  : "Max 20MB per image • JPG, PNG"}
              </Typography>
            </Alert>

            <ImageUploadOptimized
              agentId={agentId}
              storagePath={`offline_visits/${agentId}`}
              maxImages={3}
              minImages={1}
              compressImages={isSlowConnection}
              onImagesChange={handleImagesChange}
              images={uploadedImages}
            />
          </CardContent>
        </Card>
      )}

      {/* Step 3: Review & Submit */}
      {activeStep === 3 && (
        <Card sx={{ borderRadius: "16px", boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }}>
          <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
              Review Your Submission
            </Typography>

            {/* Location Summary */}
            <Paper
              sx={{
                p: 2,
                mb: 2,
                bgcolor: "#f0fdf4",
                borderRadius: "12px",
                border: "1px solid #86efac",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                <CheckCircle sx={{ color: "#22c55e", fontSize: 20 }} />
                <Typography variant="subtitle2" sx={{ fontWeight: 600, color: "#16a34a" }}>
                  Location Verified
                </Typography>
              </Box>
              <Typography variant="body2">
                Duration: <strong>{punchData?.durationFormatted}</strong>
              </Typography>
            </Paper>

            {/* Visit Details Summary */}
            <Paper sx={{ p: 2, mb: 2, bgcolor: "#f8fafc", borderRadius: "12px" }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1.5 }}>
                Visit Details
              </Typography>
              <Grid container spacing={1}>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">
                    Clinic Code
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {formData.clinicCode}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">
                    Branch
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {formData.branchName}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">
                    Partner
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {formData.partnerName}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary">
                    Visit Type
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {formData.visitType}
                  </Typography>
                </Grid>
              </Grid>
            </Paper>

            {/* Images Summary */}
            <Paper sx={{ p: 2, bgcolor: "#f8fafc", borderRadius: "12px" }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                Images ({uploadedImages.filter((i) => i.status === "uploaded").length})
              </Typography>
              <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                {uploadedImages
                  .filter((img) => img.preview)
                  .map((img, index) => (
                    <Box
                      key={index}
                      sx={{
                        width: 60,
                        height: 60,
                        borderRadius: "8px",
                        overflow: "hidden",
                      }}
                    >
                      <img
                        src={img.preview}
                        alt={`Upload ${index + 1}`}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                    </Box>
                  ))}
              </Box>
            </Paper>

            {loading && (
              <Box sx={{ mt: 2 }}>
                <LinearProgress variant="indeterminate" />
                <Typography variant="caption" sx={{ mt: 1, display: "block", textAlign: "center" }}>
                  Submitting your visit...
                </Typography>
              </Box>
            )}
          </CardContent>
        </Card>
      )}

      {/* Navigation Buttons */}
      <Box
        sx={{
          display: "flex",
          gap: 2,
          mt: 3,
          position: { xs: "sticky", sm: "relative" },
          bottom: { xs: 80, sm: "auto" },
          bgcolor: { xs: "white", sm: "transparent" },
          p: { xs: 2, sm: 0 },
          mx: { xs: -2, sm: 0 },
          borderTop: { xs: "1px solid #e2e8f0", sm: "none" },
          zIndex: 100,
        }}
      >
        <Button
          variant="outlined"
          onClick={handleBack}
          disabled={activeStep === 0}
          startIcon={<ArrowBack />}
          sx={{
            flex: 1,
            minHeight: 48,
            borderRadius: "12px",
            fontWeight: 600,
            textTransform: "none",
          }}
        >
          Back
        </Button>

        {activeStep < 3 ? (
          <Button
            variant="contained"
            onClick={handleNext}
            endIcon={<ArrowForward />}
            sx={{
              flex: 1,
              minHeight: 48,
              borderRadius: "12px",
              fontWeight: 600,
              textTransform: "none",
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            }}
          >
            Next
          </Button>
        ) : (
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={loading}
            startIcon={<Save />}
            sx={{
              flex: 1,
              minHeight: 48,
              borderRadius: "12px",
              fontWeight: 600,
              textTransform: "none",
              background: "linear-gradient(135deg, #22c55e, #16a34a)",
            }}
          >
            {loading ? "Submitting..." : "Submit"}
          </Button>
        )}
      </Box>
    </Box>
  );
}

export default OfflineVisitRecordMobile;
