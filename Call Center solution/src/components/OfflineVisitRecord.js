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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import { Save, History } from "@mui/icons-material";
import { collection, addDoc, serverTimestamp, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "../firebaseConfig";

function OfflineVisitRecord({ agentId, agentCollection, agentName }) {
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

  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [contactNoError, setContactNoError] = useState("");

  const visitTypes = ["BM Review", "AM/RM Review", "Clinic Visit"];

  // Fetch existing records
  useEffect(() => {
    const fetchRecords = async () => {
      try {
        const recordsRef = collection(db, agentCollection, agentId, "offlineVisits");
        const q = query(recordsRef, orderBy("timestamp", "desc"));
        const querySnapshot = await getDocs(q);

        const fetchedRecords = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setRecords(fetchedRecords);
      } catch (error) {
        console.error("Error fetching offline visit records:", error);
      }
    };

    if (agentId && agentCollection) {
      fetchRecords();
    }
  }, [agentId, agentCollection]);

  const handleInputChange = (field, value) => {
    if (field === "branchContactNo") {
      // Only allow numeric values and limit to 10 digits
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

  const validateForm = () => {
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
    if (formData.branchContactNo.length !== 10) {
      alert("Branch Contact No. must be exactly 10 digits");
      return false;
    }
    if (!formData.state.trim()) {
      alert("Please enter State");
      return false;
    }
    if (!formData.opsManagerName.trim()) {
      alert("Please enter OPS Manager Name");
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
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const recordsRef = collection(db, agentCollection, agentId, "offlineVisits");

      const recordData = {
        ...formData,
        agentId,
        agentName,
        agentCollection,
        timestamp: serverTimestamp(),
        date: new Date().toLocaleDateString(),
        time: new Date().toLocaleTimeString(),
      };

      await addDoc(recordsRef, recordData);

      // Add to local state
      setRecords([
        {
          ...recordData,
          timestamp: new Date(),
        },
        ...records,
      ]);

      alert("Offline visit record saved successfully!");

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
      setContactNoError("");
    } catch (error) {
      console.error("Error saving offline visit record:", error);
      alert("Error saving record. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Card
        elevation={0}
        sx={{
          background: "linear-gradient(135deg, #1e293b 0%, #334155 100%)",
          borderRadius: "16px",
          mb: 4,
        }}
      >
        <CardContent sx={{ p: 4 }}>
          <Typography
            variant="h5"
            sx={{
              mb: 3,
              fontWeight: 600,
              color: "#f8fafc",
              display: "flex",
              alignItems: "center",
              gap: 1,
            }}
          >
            <History sx={{ fontSize: 28 }} />
            Offline Visit Record
          </Typography>

          <Box component="form" onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              {/* Clinic Code */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Clinic Code *"
                  value={formData.clinicCode}
                  onChange={(e) => handleInputChange("clinicCode", e.target.value)}
                  required
                  InputLabelProps={{
                    shrink: true,
                    sx: {
                      fontSize: "1rem",
                      fontWeight: 600,
                      color: formData.clinicCode ? "#d1d5db" : "#ff9800",
                      "&.Mui-focused": {
                        color: formData.clinicCode ? "#3b82f6" : "#ff9800",
                      },
                    },
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "6px",
                      backgroundColor: "rgba(17, 24, 39, 0.5)",
                      color: "#f8fafc",
                      "& fieldset": {
                        borderColor: formData.clinicCode
                          ? "rgba(75, 85, 99, 0.6)"
                          : "#ff9800",
                      },
                      "&:hover fieldset": {
                        borderColor: formData.clinicCode
                          ? "rgba(156, 163, 175, 0.8)"
                          : "#ff9800",
                      },
                      "&.Mui-focused fieldset": {
                        borderColor: "#3b82f6",
                      },
                    },
                  }}
                />
              </Grid>

              {/* Branch Name */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Branch Name *"
                  value={formData.branchName}
                  onChange={(e) => handleInputChange("branchName", e.target.value)}
                  required
                  InputLabelProps={{
                    shrink: true,
                    sx: {
                      fontSize: "1rem",
                      fontWeight: 600,
                      color: formData.branchName ? "#d1d5db" : "#ff9800",
                      "&.Mui-focused": {
                        color: formData.branchName ? "#3b82f6" : "#ff9800",
                      },
                    },
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "6px",
                      backgroundColor: "rgba(17, 24, 39, 0.5)",
                      color: "#f8fafc",
                      "& fieldset": {
                        borderColor: formData.branchName
                          ? "rgba(75, 85, 99, 0.6)"
                          : "#ff9800",
                      },
                      "&:hover fieldset": {
                        borderColor: formData.branchName
                          ? "rgba(156, 163, 175, 0.8)"
                          : "#ff9800",
                      },
                      "&.Mui-focused fieldset": {
                        borderColor: "#3b82f6",
                      },
                    },
                  }}
                />
              </Grid>

              {/* Partner Name */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Partner Name *"
                  value={formData.partnerName}
                  onChange={(e) => handleInputChange("partnerName", e.target.value)}
                  required
                  InputLabelProps={{
                    shrink: true,
                    sx: {
                      fontSize: "1rem",
                      fontWeight: 600,
                      color: formData.partnerName ? "#d1d5db" : "#ff9800",
                      "&.Mui-focused": {
                        color: formData.partnerName ? "#3b82f6" : "#ff9800",
                      },
                    },
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "6px",
                      backgroundColor: "rgba(17, 24, 39, 0.5)",
                      color: "#f8fafc",
                      "& fieldset": {
                        borderColor: formData.partnerName
                          ? "rgba(75, 85, 99, 0.6)"
                          : "#ff9800",
                      },
                      "&:hover fieldset": {
                        borderColor: formData.partnerName
                          ? "rgba(156, 163, 175, 0.8)"
                          : "#ff9800",
                      },
                      "&.Mui-focused fieldset": {
                        borderColor: "#3b82f6",
                      },
                    },
                  }}
                />
              </Grid>

              {/* BM Name */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="BM Name *"
                  value={formData.bmName}
                  onChange={(e) => handleInputChange("bmName", e.target.value)}
                  required
                  InputLabelProps={{
                    shrink: true,
                    sx: {
                      fontSize: "1rem",
                      fontWeight: 600,
                      color: formData.bmName ? "#d1d5db" : "#ff9800",
                      "&.Mui-focused": {
                        color: formData.bmName ? "#3b82f6" : "#ff9800",
                      },
                    },
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "6px",
                      backgroundColor: "rgba(17, 24, 39, 0.5)",
                      color: "#f8fafc",
                      "& fieldset": {
                        borderColor: formData.bmName
                          ? "rgba(75, 85, 99, 0.6)"
                          : "#ff9800",
                      },
                      "&:hover fieldset": {
                        borderColor: formData.bmName
                          ? "rgba(156, 163, 175, 0.8)"
                          : "#ff9800",
                      },
                      "&.Mui-focused fieldset": {
                        borderColor: "#3b82f6",
                      },
                    },
                  }}
                />
              </Grid>

              {/* Branch Contact No */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Branch Contact No. *"
                  value={formData.branchContactNo}
                  onChange={(e) => handleInputChange("branchContactNo", e.target.value)}
                  required
                  error={!!contactNoError}
                  helperText={contactNoError}
                  InputLabelProps={{
                    shrink: true,
                    sx: {
                      fontSize: "1rem",
                      fontWeight: 600,
                      color: formData.branchContactNo && !contactNoError ? "#d1d5db" : "#ff9800",
                      "&.Mui-focused": {
                        color: formData.branchContactNo && !contactNoError ? "#3b82f6" : "#ff9800",
                      },
                    },
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "6px",
                      backgroundColor: "rgba(17, 24, 39, 0.5)",
                      color: "#f8fafc",
                      "& fieldset": {
                        borderColor: formData.branchContactNo && !contactNoError
                          ? "rgba(75, 85, 99, 0.6)"
                          : "#ff9800",
                      },
                      "&:hover fieldset": {
                        borderColor: formData.branchContactNo && !contactNoError
                          ? "rgba(156, 163, 175, 0.8)"
                          : "#ff9800",
                      },
                      "&.Mui-focused fieldset": {
                        borderColor: "#3b82f6",
                      },
                    },
                  }}
                />
              </Grid>

              {/* State */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="State *"
                  value={formData.state}
                  onChange={(e) => handleInputChange("state", e.target.value)}
                  required
                  InputLabelProps={{
                    shrink: true,
                    sx: {
                      fontSize: "1rem",
                      fontWeight: 600,
                      color: formData.state ? "#d1d5db" : "#ff9800",
                      "&.Mui-focused": {
                        color: formData.state ? "#3b82f6" : "#ff9800",
                      },
                    },
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "6px",
                      backgroundColor: "rgba(17, 24, 39, 0.5)",
                      color: "#f8fafc",
                      "& fieldset": {
                        borderColor: formData.state
                          ? "rgba(75, 85, 99, 0.6)"
                          : "#ff9800",
                      },
                      "&:hover fieldset": {
                        borderColor: formData.state
                          ? "rgba(156, 163, 175, 0.8)"
                          : "#ff9800",
                      },
                      "&.Mui-focused fieldset": {
                        borderColor: "#3b82f6",
                      },
                    },
                  }}
                />
              </Grid>

              {/* OPS Manager Name */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="OPS Manager Name *"
                  value={formData.opsManagerName}
                  onChange={(e) => handleInputChange("opsManagerName", e.target.value)}
                  required
                  InputLabelProps={{
                    shrink: true,
                    sx: {
                      fontSize: "1rem",
                      fontWeight: 600,
                      color: formData.opsManagerName ? "#d1d5db" : "#ff9800",
                      "&.Mui-focused": {
                        color: formData.opsManagerName ? "#3b82f6" : "#ff9800",
                      },
                    },
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "6px",
                      backgroundColor: "rgba(17, 24, 39, 0.5)",
                      color: "#f8fafc",
                      "& fieldset": {
                        borderColor: formData.opsManagerName
                          ? "rgba(75, 85, 99, 0.6)"
                          : "#ff9800",
                      },
                      "&:hover fieldset": {
                        borderColor: formData.opsManagerName
                          ? "rgba(156, 163, 175, 0.8)"
                          : "#ff9800",
                      },
                      "&.Mui-focused fieldset": {
                        borderColor: "#3b82f6",
                      },
                    },
                  }}
                />
              </Grid>

              {/* Visit Type */}
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth variant="outlined" required>
                  <InputLabel
                    id="visit-type-label"
                    shrink={true}
                    sx={{
                      fontSize: "1rem",
                      fontWeight: 600,
                      color: formData.visitType ? "#d1d5db" : "#ff9800",
                      "&.Mui-focused": {
                        color: formData.visitType ? "#3b82f6" : "#ff9800",
                      },
                    }}
                  >
                    Visit Type *
                  </InputLabel>
                  <Select
                    labelId="visit-type-label"
                    value={formData.visitType}
                    onChange={(e) => handleInputChange("visitType", e.target.value)}
                    label="Visit Type *"
                    required
                    sx={{
                      borderRadius: "6px",
                      backgroundColor: "rgba(17, 24, 39, 0.5)",
                      color: "#f8fafc",
                      "& .MuiOutlinedInput-notchedOutline": {
                        borderColor: formData.visitType
                          ? "rgba(75, 85, 99, 0.6)"
                          : "#ff9800",
                      },
                      "&:hover .MuiOutlinedInput-notchedOutline": {
                        borderColor: formData.visitType
                          ? "rgba(156, 163, 175, 0.8)"
                          : "#ff9800",
                      },
                      "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                        borderColor: "#3b82f6",
                      },
                      "& .MuiSelect-icon": {
                        color: "#d1d5db",
                      },
                    }}
                    MenuProps={{
                      PaperProps: {
                        sx: {
                          backgroundColor: "#374151",
                          "& .MuiMenuItem-root": {
                            color: "#f8fafc",
                            "&:hover": {
                              backgroundColor: "rgba(59, 130, 246, 0.1)",
                            },
                          },
                        },
                      },
                    }}
                    displayEmpty
                  >
                    <MenuItem value="" disabled>
                      Select Visit Type
                    </MenuItem>
                    {visitTypes.map((type) => (
                      <MenuItem key={type} value={type}>
                        {type}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Discussion Remarks */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Discussion Remarks *"
                  value={formData.discussionRemarks}
                  onChange={(e) => handleInputChange("discussionRemarks", e.target.value)}
                  required
                  multiline
                  rows={4}
                  InputLabelProps={{
                    shrink: true,
                    sx: {
                      fontSize: "1rem",
                      fontWeight: 600,
                      color: formData.discussionRemarks ? "#d1d5db" : "#ff9800",
                      "&.Mui-focused": {
                        color: formData.discussionRemarks ? "#3b82f6" : "#ff9800",
                      },
                    },
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "6px",
                      backgroundColor: "rgba(17, 24, 39, 0.5)",
                      color: "#f8fafc",
                      "& fieldset": {
                        borderColor: formData.discussionRemarks
                          ? "rgba(75, 85, 99, 0.6)"
                          : "#ff9800",
                      },
                      "&:hover fieldset": {
                        borderColor: formData.discussionRemarks
                          ? "rgba(156, 163, 175, 0.8)"
                          : "#ff9800",
                      },
                      "&.Mui-focused fieldset": {
                        borderColor: "#3b82f6",
                      },
                    },
                  }}
                />
              </Grid>

              {/* Submit Button */}
              <Grid item xs={12}>
                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  disabled={loading}
                  startIcon={<Save />}
                  sx={{
                    background: "linear-gradient(135deg, #3b82f6, #60a5fa)",
                    color: "#fff",
                    py: 1.5,
                    fontSize: "1rem",
                    fontWeight: 600,
                    borderRadius: "8px",
                    textTransform: "none",
                    "&:hover": {
                      background: "linear-gradient(135deg, #2563eb, #3b82f6)",
                    },
                    "&:disabled": {
                      background: "#374151",
                      color: "#9ca3af",
                    },
                  }}
                >
                  {loading ? "Saving..." : "Save Offline Visit Record"}
                </Button>
              </Grid>
            </Grid>
          </Box>
        </CardContent>
      </Card>

      {/* Records History */}
      {records.length > 0 && (
        <Card
          elevation={0}
          sx={{
            background: "linear-gradient(135deg, #1e293b 0%, #334155 100%)",
            borderRadius: "16px",
          }}
        >
          <CardContent sx={{ p: 4 }}>
            <Typography
              variant="h6"
              sx={{
                mb: 3,
                fontWeight: 600,
                color: "#f8fafc",
              }}
            >
              Visit History ({records.length})
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ color: "#d1d5db", fontWeight: 600 }}>Date</TableCell>
                    <TableCell sx={{ color: "#d1d5db", fontWeight: 600 }}>Clinic Code</TableCell>
                    <TableCell sx={{ color: "#d1d5db", fontWeight: 600 }}>Branch Name</TableCell>
                    <TableCell sx={{ color: "#d1d5db", fontWeight: 600 }}>Partner</TableCell>
                    <TableCell sx={{ color: "#d1d5db", fontWeight: 600 }}>Visit Type</TableCell>
                    <TableCell sx={{ color: "#d1d5db", fontWeight: 600 }}>Contact No.</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {records.map((record) => (
                    <TableRow key={record.id} sx={{ "&:hover": { backgroundColor: "rgba(59, 130, 246, 0.05)" } }}>
                      <TableCell sx={{ color: "#f8fafc" }}>{record.date}</TableCell>
                      <TableCell sx={{ color: "#f8fafc" }}>{record.clinicCode}</TableCell>
                      <TableCell sx={{ color: "#f8fafc" }}>{record.branchName}</TableCell>
                      <TableCell sx={{ color: "#f8fafc" }}>{record.partnerName}</TableCell>
                      <TableCell sx={{ color: "#f8fafc" }}>{record.visitType}</TableCell>
                      <TableCell sx={{ color: "#f8fafc" }}>{record.branchContactNo}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}
    </Box>
  );
}

export default OfflineVisitRecord;
