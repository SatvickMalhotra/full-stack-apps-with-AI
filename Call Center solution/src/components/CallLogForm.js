import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Select,
  MenuItem,
  InputLabel,
  Grid,
  Divider,
} from "@mui/material";
import { Save, Cancel } from "@mui/icons-material";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebaseConfig";

const CallLogForm = ({ onSubmit }) => {
  const [formData, setFormData] = useState({
    clientNumber: "",
    callConnected: true,
    callStatus: "",
    callType: "",
    callCategory: "",
    partner: "",
    escalation: "",
    department: "",
    notConnectedReason: "",
    remarks: "",
    duration: {
      hours: 0,
      minutes: 0,
      seconds: 0,
    },
  });
  const [clientNumberError, setClientNumberError] = useState("");
  const [partners, setPartners] = useState([]);

  // Fetch partners from Firestore
  useEffect(() => {
    const fetchPartners = async () => {
      try {
        const partnersRef = collection(db, "partners");
        const querySnapshot = await getDocs(partnersRef);
        const partnersList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setPartners(partnersList);
      } catch (error) {
        console.error("Error fetching partners:", error);
      }
    };

    fetchPartners();
  }, []);

  const handleInputChange = (field, value) => {
    if (field === "clientNumber") {
      // Allow only digits and limit to 10 characters
      const numericValue = value.replace(/[^0-9]/g, "").slice(0, 10);
      setFormData((prev) => ({
        ...prev,
        [field]: numericValue,
      }));
      // Validate client number
      if (numericValue.length !== 10) {
        setClientNumberError("Client Number must be exactly 10 digits");
      } else {
        setClientNumberError("");
      }
    } else {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  const handleDurationChange = (unit, value) => {
    setFormData((prev) => ({
      ...prev,
      duration: {
        ...prev.duration,
        [unit]: Number.parseInt(value) || 0,
      },
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Prevent submission if client number is invalid
    if (formData.clientNumber.length !== 10) {
      setClientNumberError("Client Number must be exactly 10 digits");
      return;
    }

    if (!formData.callType) {
      alert("Please select a Call Type (Client/Branch Manager/Nurse)");
      return;
    }

    if (!formData.escalation) {
      alert("Please select Escalation (Yes/No)");
      return;
    }

    if (!formData.department) {
      alert("Please select Department Name");
      return;
    }

    if (formData.callConnected) {
      if (!formData.callCategory) {
        alert("Please select a Call Category");
        return;
      }
      if (!formData.callStatus) {
        alert("Please select a Call Status");
        return;
      }
      if (!formData.partner) {
        alert("Please select a Partner");
        return;
      }
    } else {
      if (!formData.notConnectedReason) {
        alert("Please select a Not Connected Reason");
        return;
      }
    }

    const logEntry = {
      ...formData,
      time: new Date().toLocaleTimeString(),
      date: new Date().toLocaleDateString(),
    };

    onSubmit(logEntry);

    // Reset form
    setFormData({
      clientNumber: "",
      callConnected: true,
      callStatus: "",
      callType: "",
      callCategory: "",
      partner: "",
      escalation: "",
      department: "",
      notConnectedReason: "",
      remarks: "",
      duration: { hours: 0, minutes: 0, seconds: 0 },
    });
    setClientNumberError("");
  };

  const callTypes = ["Client", "Branch Manager", "Nurse"];

  const callCategories = [
    "Query Update",
    "Claim Status",
    "Negotiation Call",
    "Intimation Call",
    "Product Information",
  ];

  const callStatuses = [
    "Completed Successfully",
    "Follow-up Required",
    "Information Provided",
    "Appointment Scheduled",
    "Issue Resolved",
    "Transferred to Specialist",
  ];

  const notConnectedReasons = [
    "No Answer",
    "Busy Signal",
    "Voicemail",
    "Wrong Number",
    "Number Disconnected",
    "Call Dropped",
  ];

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ width: "100%" }}>
      <Typography
        variant="h6"
        sx={{ mb: 3, fontWeight: 600, color: "#f8fafc" }}
      >
        Log Call Details
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Client Number"
            type="text" // Use text to allow custom input handling
            value={formData.clientNumber}
            onChange={(e) => handleInputChange("clientNumber", e.target.value)}
            required
            variant="outlined"
            placeholder="Enter 10-digit client number"
            error={!!clientNumberError}
            helperText={clientNumberError}
            inputProps={{ maxLength: 10 }} // Limit input to 10 characters
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: "6px",
                backgroundColor: "rgba(17, 24, 39, 0.5)",
                "& fieldset": {
                  borderColor: clientNumberError
                    ? "#f44336"
                    : "rgba(75, 85, 99, 0.6)",
                },
                "&:hover fieldset": {
                  borderColor: clientNumberError
                    ? "#f44336"
                    : "rgba(156, 163, 175, 0.8)",
                },
                "&.Mui-focused fieldset": {
                  borderColor: clientNumberError ? "#f44336" : "#3b82f6",
                },
              },
              "& .MuiInputLabel-root": {
                color: clientNumberError ? "#f44336" : "#d1d5db",
                "&.Mui-focused": {
                  color: clientNumberError ? "#f44336" : "#3b82f6",
                },
              },
              "& .MuiOutlinedInput-input": {
                color: "#f8fafc",
                "&::placeholder": {
                  color: "#9ca3af",
                  opacity: 1,
                },
              },
              "& .MuiFormHelperText-root": {
                color: "#f44336",
              },
            }}
          />
        </Grid>

        {/* Call Type Dropdown */}
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth variant="outlined" required>
            <InputLabel
              id="call-type-label"
              shrink={true}
              sx={{
                fontSize: "1rem",
                fontWeight: 600,
                color: formData.callType ? "#d1d5db" : "#ff9800",
                "&.Mui-focused": {
                  color: formData.callType ? "#3b82f6" : "#ff9800",
                },
              }}
            >
              Call Type *
            </InputLabel>
            <Select
              labelId="call-type-label"
              value={formData.callType}
              onChange={(e) => handleInputChange("callType", e.target.value)}
              label="Call Type *"
              required
              sx={{
                borderRadius: "6px",
                backgroundColor: "rgba(17, 24, 39, 0.5)",
                color: "#f8fafc",
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: formData.callType
                    ? "rgba(75, 85, 99, 0.6)"
                    : "#ff9800",
                },
                "&:hover .MuiOutlinedInput-notchedOutline": {
                  borderColor: formData.callType
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
                      "&.Mui-disabled": {
                        color: "#9ca3af",
                      },
                    },
                  },
                },
              }}
              displayEmpty
            >
              <MenuItem value="" disabled>
                Select Call Type
              </MenuItem>
              {callTypes.map((type) => (
                <MenuItem key={type} value={type}>
                  {type}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        {/* Partner Dropdown */}
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth variant="outlined" required>
            <InputLabel
              id="partner-label"
              shrink={true}
              sx={{
                fontSize: "1rem",
                fontWeight: 600,
                color: formData.partner ? "#d1d5db" : "#ff9800",
                "&.Mui-focused": {
                  color: formData.partner ? "#3b82f6" : "#ff9800",
                },
              }}
            >
              Partner *
            </InputLabel>
            <Select
              labelId="partner-label"
              value={formData.partner}
              onChange={(e) => handleInputChange("partner", e.target.value)}
              label="Partner *"
              required
              sx={{
                borderRadius: "6px",
                backgroundColor: "rgba(17, 24, 39, 0.5)",
                color: "#f8fafc",
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: formData.partner
                    ? "rgba(75, 85, 99, 0.6)"
                    : "#ff9800",
                },
                "&:hover .MuiOutlinedInput-notchedOutline": {
                  borderColor: formData.partner
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
                      "&.Mui-disabled": {
                        color: "#9ca3af",
                      },
                    },
                  },
                },
              }}
              displayEmpty
            >
              <MenuItem value="" disabled>
                Select Partner
              </MenuItem>
              {partners.map((partner) => (
                <MenuItem key={partner.id} value={partner.name}>
                  {partner.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        {/* Escalation Dropdown */}
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth variant="outlined" required>
            <InputLabel
              id="escalation-label"
              shrink={true}
              sx={{
                fontSize: "1rem",
                fontWeight: 600,
                color: formData.escalation ? "#d1d5db" : "#ff9800",
                "&.Mui-focused": {
                  color: formData.escalation ? "#3b82f6" : "#ff9800",
                },
              }}
            >
              Escalation *
            </InputLabel>
            <Select
              labelId="escalation-label"
              value={formData.escalation}
              onChange={(e) => handleInputChange("escalation", e.target.value)}
              label="Escalation *"
              required
              sx={{
                borderRadius: "6px",
                backgroundColor: "rgba(17, 24, 39, 0.5)",
                color: "#f8fafc",
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: formData.escalation
                    ? "rgba(75, 85, 99, 0.6)"
                    : "#ff9800",
                },
                "&:hover .MuiOutlinedInput-notchedOutline": {
                  borderColor: formData.escalation
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
                      "&.Mui-disabled": {
                        color: "#9ca3af",
                      },
                    },
                  },
                },
              }}
              displayEmpty
            >
              <MenuItem value="" disabled>
                Select Escalation
              </MenuItem>
              <MenuItem value="Yes">Yes</MenuItem>
              <MenuItem value="No">No</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        {/* Department Name Dropdown */}
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth variant="outlined" required>
            <InputLabel
              id="department-label"
              shrink={true}
              sx={{
                fontSize: "1rem",
                fontWeight: 600,
                color: formData.department ? "#d1d5db" : "#ff9800",
                "&.Mui-focused": {
                  color: formData.department ? "#3b82f6" : "#ff9800",
                },
              }}
            >
              Department Name *
            </InputLabel>
            <Select
              labelId="department-label"
              value={formData.department}
              onChange={(e) => handleInputChange("department", e.target.value)}
              label="Department Name *"
              required
              sx={{
                borderRadius: "6px",
                backgroundColor: "rgba(17, 24, 39, 0.5)",
                color: "#f8fafc",
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: formData.department
                    ? "rgba(75, 85, 99, 0.6)"
                    : "#ff9800",
                },
                "&:hover .MuiOutlinedInput-notchedOutline": {
                  borderColor: formData.department
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
                      "&.Mui-disabled": {
                        color: "#9ca3af",
                      },
                    },
                  },
                },
              }}
              displayEmpty
            >
              <MenuItem value="" disabled>
                Select Department
              </MenuItem>
              <MenuItem value="Insurance Claim">Insurance Claim</MenuItem>
              <MenuItem value="Insurance Policy">Insurance Policy</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12}>
          <FormControl component="fieldset">
            <FormLabel
              component="legend"
              sx={{ fontWeight: 600, color: "#f8fafc", mb: 1 }}
            >
              Call Status
            </FormLabel>
            <RadioGroup
              value={formData.callConnected}
              onChange={(e) =>
                handleInputChange("callConnected", e.target.value === "true")
              }
              row
              sx={{
                "& .MuiFormControlLabel-label": {
                  color: "#d1d5db",
                },
              }}
            >
              <FormControlLabel
                value={true}
                control={<Radio color="success" />}
                label="Connected"
              />
              <FormControlLabel
                value={false}
                control={<Radio color="error" />}
                label="Not Connected"
              />
            </RadioGroup>
          </FormControl>
        </Grid>

        {formData.callConnected ? (
          <>
            {/* Call Category Dropdown */}
            <Grid item xs={12}>
              <FormControl fullWidth variant="outlined" required>
                <InputLabel
                  id="call-category-label"
                  shrink={true}
                  sx={{
                    fontSize: "1rem",
                    fontWeight: 600,
                    color: formData.callCategory ? "#d1d5db" : "#ff9800",
                    "&.Mui-focused": {
                      color: formData.callCategory ? "#3b82f6" : "#ff9800",
                    },
                  }}
                >
                  Call Category *
                </InputLabel>
                <Select
                  labelId="call-category-label"
                  value={formData.callCategory}
                  onChange={(e) =>
                    handleInputChange("callCategory", e.target.value)
                  }
                  label="Call Category *"
                  required
                  sx={{
                    borderRadius: "6px",
                    backgroundColor: "rgba(17, 24, 39, 0.5)",
                    color: "#f8fafc",
                    "& .MuiOutlinedInput-notchedOutline": {
                      borderColor: formData.callCategory
                        ? "rgba(75, 85, 99, 0.6)"
                        : "#ff9800",
                    },
                    "&:hover .MuiOutlinedInput-notchedOutline": {
                      borderColor: formData.callCategory
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
                          "&.Mui-disabled": {
                            color: "#9ca3af",
                          },
                        },
                      },
                    },
                  }}
                  displayEmpty
                >
                  <MenuItem value="" disabled>
                    Select Category
                  </MenuItem>
                  {callCategories.map((category) => (
                    <MenuItem key={category} value={category}>
                      {category}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <FormControl fullWidth variant="outlined" required>
                <InputLabel
                  id="call-status-label"
                  shrink={true}
                  sx={{
                    fontSize: "1rem",
                    fontWeight: 600,
                    color: formData.callStatus ? "#d1d5db" : "#ff9800",
                    "&.Mui-focused": {
                      color: formData.callStatus ? "#3b82f6" : "#ff9800",
                    },
                  }}
                >
                  Call Outcome
                </InputLabel>
                <Select
                  labelId="call-status-label"
                  value={formData.callStatus}
                  onChange={(e) =>
                    handleInputChange("callStatus", e.target.value)
                  }
                  label="Call Outcome"
                  required
                  sx={{
                    borderRadius: "6px",
                    backgroundColor: "rgba(17, 24, 39, 0.5)",
                    color: "#f8fafc",
                    minWidth: "30px",
                    "& .MuiOutlinedInput-notchedOutline": {
                      borderColor: formData.callStatus
                        ? "rgba(75, 85, 99, 0.6)"
                        : "#ff9800",
                    },
                    "&:hover .MuiOutlinedInput-notchedOutline": {
                      borderColor: formData.callStatus
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
                          "&.Mui-disabled": {
                            color: "#9ca3af",
                          },
                        },
                      },
                    },
                  }}
                  displayEmpty
                >
                  <MenuItem value="" disabled>
                    Select one
                  </MenuItem>
                  {callStatuses.map((status) => (
                    <MenuItem key={status} value={status}>
                      {status}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <Typography
                variant="subtitle2"
                sx={{ mb: 2, fontWeight: 600, color: "#f8fafc" }}
              >
                Call Duration
              </Typography>
              <Grid container spacing={2}>
                {["hours", "minutes", "seconds"].map((unit) => (
                  <Grid item xs={4} key={unit}>
                    <TextField
                      fullWidth
                      label={unit.charAt(0).toUpperCase() + unit.slice(1)}
                      type="number"
                      value={formData.duration[unit]}
                      onChange={(e) =>
                        handleDurationChange(unit, e.target.value)
                      }
                      inputProps={{ min: 0, max: unit === "hours" ? 23 : 59 }}
                      variant="outlined"
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          borderRadius: "6px",
                          backgroundColor: "rgba(17, 24, 39, 0.5)",
                          "& fieldset": {
                            borderColor: "rgba(75, 85, 99, 0.6)",
                          },
                          "&:hover fieldset": {
                            borderColor: "rgba(156, 163, 175, 0.8)",
                          },
                          "&.Mui-focused fieldset": {
                            borderColor: "#3b82f6",
                          },
                        },
                        "& .MuiInputLabel-root": {
                          color: "#d1d5db",
                          "&.Mui-focused": {
                            color: "#3b82f6",
                          },
                        },
                        "& .MuiOutlinedInput-input": {
                          color: "#f8fafc",
                        },
                      }}
                    />
                  </Grid>
                ))}
              </Grid>
            </Grid>
          </>
        ) : (
          <Grid item xs={12}>
            <FormControl fullWidth variant="outlined" required>
              <InputLabel
                id="not-connected-reason-label"
                shrink={true}
                sx={{
                  fontSize: "1rem",
                  fontWeight: 600,
                  color: formData.notConnectedReason ? "#d1d5db" : "#ff9800",
                  "&.Mui-focused": {
                    color: formData.notConnectedReason ? "#3b82f6" : "#ff9800",
                  },
                }}
              >
                Reason Not Connected
              </InputLabel>
              <Select
                labelId="not-connected-reason-label"
                value={formData.notConnectedReason}
                onChange={(e) =>
                  handleInputChange("notConnectedReason", e.target.value)
                }
                label="Reason Not Connected"
                required
                sx={{
                  borderRadius: "6px",
                  backgroundColor: "rgba(17, 24, 39, 0.5)",
                  color: "#f8fafc",
                  minWidth: "30px",
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: formData.notConnectedReason
                      ? "rgba(75, 85, 99, 0.6)"
                      : "#ff9800",
                  },
                  "&:hover .MuiOutlinedInput-notchedOutline": {
                    borderColor: formData.notConnectedReason
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
                        "&.Mui-disabled": {
                          color: "#9ca3af",
                        },
                      },
                    },
                  },
                }}
                displayEmpty
              >
                <MenuItem value="" disabled>
                  Select one
                </MenuItem>
                {notConnectedReasons.map((reason) => (
                  <MenuItem key={reason} value={reason}>
                    {reason}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        )}

        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Remarks"
            value={formData.remarks}
            onChange={(e) => handleInputChange("remarks", e.target.value)}
            multiline
            rows={3}
            variant="outlined"
            placeholder="Add any additional notes or comments..."
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: "6px",
                backgroundColor: "rgba(17, 24, 39, 0.5)",
                "& fieldset": {
                  borderColor: "rgba(75, 85, 99, 0.6)",
                },
                "&:hover fieldset": {
                  borderColor: "rgba(156, 163, 175, 0.8)",
                },
                "&.Mui-focused fieldset": {
                  borderColor: "#3b82f6",
                },
              },
              "& .MuiInputLabel-root": {
                color: "#d1d5db",
                "&.Mui-focused": {
                  color: "#3b82f6",
                },
              },
              "& .MuiOutlinedInput-input": {
                color: "#f8fafc",
                "&::placeholder": {
                  color: "#9ca3af",
                  opacity: 1,
                },
              },
            }}
          />
        </Grid>

        <Grid item xs={12}>
          <Divider sx={{ my: 2, backgroundColor: "rgba(75, 85, 99, 0.6)" }} />
          <Box sx={{ display: "flex", gap: 2, justifyContent: "flex-end" }}>
            <Button
              type="button"
              variant="outlined"
              startIcon={<Cancel />}
              onClick={() => {
                setFormData({
                  clientNumber: "",
                  callConnected: true,
                  callStatus: "",
                  callType: "",
                  callCategory: "",
                  partner: "",
                  escalation: "",
                  department: "",
                  notConnectedReason: "",
                  remarks: "",
                  duration: { hours: 0, minutes: 0, seconds: 0 },
                });
                setClientNumberError("");
              }}
              sx={{
                borderRadius: "6px",
                textTransform: "none",
                fontWeight: 600,
                px: 3,
                py: 1.5,
                color: "#d1d5db",
                borderColor: "rgba(75, 85, 99, 0.6)",
                "&:hover": {
                  borderColor: "rgba(156, 163, 175, 0.8)",
                  backgroundColor: "rgba(55, 65, 81, 0.1)",
                },
              }}
            >
              Clear
            </Button>
            <Button
              type="submit"
              variant="contained"
              startIcon={<Save />}
              disabled={!!clientNumberError} // Disable if client number is invalid
              sx={{
                borderRadius: "6px",
                textTransform: "none",
                fontWeight: 600,
                px: 3,
                py: 1.5,
                background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                boxShadow: "0 4px 20px rgba(16, 185, 129, 0.3)",
                "&:hover": {
                  background:
                    "linear-gradient(135deg, #059669 0%, #047857 100%)",
                  transform: "translateY(-2px)",
                  boxShadow: "0 8px 30px rgba(16, 185, 129, 0.4)",
                },
                "&.Mui-disabled": {
                  background: "rgba(16, 185, 129, 0.5)",
                  color: "#d1d5db",
                },
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
              }}
            >
              Save Call Log
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default CallLogForm;
