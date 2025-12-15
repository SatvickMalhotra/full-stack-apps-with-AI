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

const ManualCallLogForm = ({ onSubmit, initialClientNumber, agentType }) => {
  const [formData, setFormData] = useState({
    clientNumber: initialClientNumber || "",
    callConnected: true,
    callStatus: "",
    callType: "", // Client, Branch Manager, Nurse OR Customer Awareness, BM Review, etc. (Health)
    callCategory: "", // Query Update, Claim Status, etc.
    partner: "", // Partner name
    escalation: "", // Yes / No
    department: "", // Insurance Claim / Insurance Policy (not for Health)
    notConnectedReason: "",
    remarks: "",
    callRating: "", // For Health agent type when certain categories selected (Excellent/Good/Average/Poor)
    callRatingNumeric: "", // For Health agent type - numeric rating 1-5
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
      const numericValue = value.replace(/[^0-9]/g, "").slice(0, 10);
      setFormData((prev) => ({
        ...prev,
        [field]: numericValue,
      }));
      setClientNumberError(
        numericValue.length !== 10 && numericValue.length > 0
          ? "Client Number must be exactly 10 digits"
          : ""
      );
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

    if (formData.clientNumber.length !== 10) {
      setClientNumberError("Client Number must be exactly 10 digits");
      return;
    }

    if (!formData.callType) {
      alert("Please select a Call Type");
      return;
    }

    // Escalation is always mandatory (especially for Health)
    if (!formData.escalation) {
      alert("Please select Escalation (Yes/No)");
      return;
    }

    // Department is not required for Health agent type
    if (agentType !== "Health" && !formData.department) {
      alert("Please select Department Name");
      return;
    }

    if (formData.callConnected) {
      // For Health: all fields mandatory except duration and remarks
      if (agentType === "Health") {
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
        // Check call rating if required
        if (showCallRating && !formData.callRating) {
          alert("Please select a Call Rating");
          return;
        }
        // Check numeric call rating if required
        if (showCallRating && !formData.callRatingNumeric) {
          alert("Please select a Numeric Call Rating (1-5)");
          return;
        }
      } else {
        // For other agent types
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

    setFormData({
      clientNumber: initialClientNumber || "",
      callConnected: true,
      callStatus: "",
      callType: "",
      callCategory: "",
      partner: "",
      escalation: "",
      department: "",
      notConnectedReason: "",
      remarks: "",
      callRating: "",
      callRatingNumeric: "",
      duration: { hours: 0, minutes: 0, seconds: 0 },
    });
    setClientNumberError("");
  };

  // Dynamic options based on agentType
  const callTypes = agentType === "Health"
    ? ["Customer Awareness", "BM Review", "Consultation", "Feedback Call"]
    : ["Client", "Branch Manager", "Nurse"];

  const callCategories = agentType === "Health"
    ? ["BM Review Done", "Consultation Done", "Customer Awareness Done"]
    : [
        "Query Update",
        "Claim Status",
        "Negotiation Call",
        "Intimation Call",
        "Product Information",
      ];

  const callStatuses = agentType === "Health"
    ? [
        "Completed Successfully",
        "Follow-up Required",
        "Information Provided",
        "Issue Resolved",
      ]
    : [
        "Completed Successfully",
        "Follow-up Required",
        "Information Provided",
        "Appointment Scheduled",
        "Issue Resolved",
        "Transferred to Specialist",
      ];

  const callRatings = ["Excellent", "Good", "Average", "Poor"];
  const numericRatings = ["1", "2", "3", "4", "5"];

  // Check if call rating should be shown (Health agent + specific categories)
  const showCallRating = agentType === "Health" &&
    formData.callConnected &&
    ["BM Review Done", "Consultation Done", "Customer Awareness Done"].includes(formData.callCategory);

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
        sx={{ mb: 3, fontWeight: 700, color: "#26a69a", fontSize: "1.3rem" }}
      >
        Log Call Details
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Client Number"
            type="text"
            value={formData.clientNumber}
            onChange={(e) => handleInputChange("clientNumber", e.target.value)}
            required
            variant="outlined"
            placeholder="Enter 10-digit client number"
            error={!!clientNumberError}
            helperText={clientNumberError}
            inputProps={{ maxLength: 10 }}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: "12px",
                backgroundColor: "#ffffff",
                "& fieldset": {
                  borderColor: clientNumberError
                    ? "#f44336"
                    : "rgba(38, 166, 154, 0.3)",
                },
                "&:hover fieldset": {
                  borderColor: clientNumberError
                    ? "#f44336"
                    : "#26a69a",
                },
                "&.Mui-focused fieldset": {
                  borderColor: clientNumberError ? "#f44336" : "#26a69a",
                },
              },
              "& .MuiInputLabel-root": {
                fontSize: "0.85rem",
                fontWeight: 600,
                color: clientNumberError ? "#f44336" : "#546e7a",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                "&.Mui-focused": {
                  color: clientNumberError ? "#f44336" : "#26a69a",
                },
              },
              "& .MuiOutlinedInput-input": {
                color: "#1e293b",
                fontWeight: "500",
                "&::placeholder": {
                  color: "#546e7a",
                  opacity: 0.7,
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
                fontSize: "0.85rem",
                fontWeight: 600,
                color: formData.callType ? "#546e7a" : "#ff9800",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                "&.Mui-focused": {
                  color: formData.callType ? "#26a69a" : "#ff9800",
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
                borderRadius: "12px",
                backgroundColor: "#ffffff",
                color: "#1e293b",
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: formData.callType
                    ? "rgba(38, 166, 154, 0.3)"
                    : "#ff9800",
                },
                "&:hover .MuiOutlinedInput-notchedOutline": {
                  borderColor: formData.callType
                    ? "#26a69a"
                    : "#ff9800",
                },
                "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                  borderColor: "#26a69a",
                },
                "& .MuiSelect-icon": {
                  color: "#546e7a",
                },
              }}
              MenuProps={{
                PaperProps: {
                  sx: {
                    backgroundColor: "#ffffff",
                    boxShadow: "0 8px 24px rgba(0, 0, 0, 0.12)",
                    borderRadius: "12px",
                    "& .MuiMenuItem-root": {
                      color: "#1e293b",
                      "&:hover": {
                        backgroundColor: "rgba(38, 166, 154, 0.1)",
                      },
                      "&.Mui-disabled": {
                        color: "#546e7a",
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
                fontSize: "0.85rem",
                fontWeight: 600,
                color: formData.partner ? "#546e7a" : "#ff9800",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                "&.Mui-focused": {
                  color: formData.partner ? "#26a69a" : "#ff9800",
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
                borderRadius: "12px",
                backgroundColor: "#ffffff",
                color: "#1e293b",
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: formData.partner
                    ? "rgba(38, 166, 154, 0.3)"
                    : "#ff9800",
                },
                "&:hover .MuiOutlinedInput-notchedOutline": {
                  borderColor: formData.partner
                    ? "#26a69a"
                    : "#ff9800",
                },
                "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                  borderColor: "#26a69a",
                },
                "& .MuiSelect-icon": {
                  color: "#546e7a",
                },
              }}
              MenuProps={{
                PaperProps: {
                  sx: {
                    backgroundColor: "#ffffff",
                    boxShadow: "0 8px 24px rgba(0, 0, 0, 0.12)",
                    borderRadius: "12px",
                    "& .MuiMenuItem-root": {
                      color: "#1e293b",
                      "&:hover": {
                        backgroundColor: "rgba(38, 166, 154, 0.1)",
                      },
                      "&.Mui-disabled": {
                        color: "#546e7a",
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
              {agentType === "Health" && (
                <MenuItem value="Multi Partner">Multi Partner</MenuItem>
              )}
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
                fontSize: "0.85rem",
                fontWeight: 600,
                color: formData.escalation ? "#546e7a" : "#ff9800",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                "&.Mui-focused": {
                  color: formData.escalation ? "#26a69a" : "#ff9800",
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
                borderRadius: "12px",
                backgroundColor: "#ffffff",
                color: "#1e293b",
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: formData.escalation
                    ? "rgba(38, 166, 154, 0.3)"
                    : "#ff9800",
                },
                "&:hover .MuiOutlinedInput-notchedOutline": {
                  borderColor: formData.escalation
                    ? "#26a69a"
                    : "#ff9800",
                },
                "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                  borderColor: "#26a69a",
                },
                "& .MuiSelect-icon": {
                  color: "#546e7a",
                },
              }}
              MenuProps={{
                PaperProps: {
                  sx: {
                    backgroundColor: "#ffffff",
                    boxShadow: "0 8px 24px rgba(0, 0, 0, 0.12)",
                    borderRadius: "12px",
                    "& .MuiMenuItem-root": {
                      color: "#1e293b",
                      "&:hover": {
                        backgroundColor: "rgba(38, 166, 154, 0.1)",
                      },
                      "&.Mui-disabled": {
                        color: "#546e7a",
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

        {/* Department Name Dropdown - Not shown for Health agent type */}
        {agentType !== "Health" && (
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth variant="outlined" required>
              <InputLabel
                id="department-label"
                shrink={true}
                sx={{
                  fontSize: "0.85rem",
                  fontWeight: 600,
                  color: formData.department ? "#546e7a" : "#ff9800",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  "&.Mui-focused": {
                    color: formData.department ? "#26a69a" : "#ff9800",
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
                  borderRadius: "12px",
                  backgroundColor: "#ffffff",
                  color: "#1e293b",
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: formData.department
                      ? "rgba(38, 166, 154, 0.3)"
                      : "#ff9800",
                  },
                  "&:hover .MuiOutlinedInput-notchedOutline": {
                    borderColor: formData.department
                      ? "#26a69a"
                      : "#ff9800",
                  },
                  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#26a69a",
                  },
                  "& .MuiSelect-icon": {
                    color: "#546e7a",
                  },
                }}
                MenuProps={{
                  PaperProps: {
                    sx: {
                      backgroundColor: "#ffffff",
                      boxShadow: "0 8px 24px rgba(0, 0, 0, 0.12)",
                      borderRadius: "12px",
                      "& .MuiMenuItem-root": {
                        color: "#1e293b",
                        "&:hover": {
                          backgroundColor: "rgba(38, 166, 154, 0.1)",
                        },
                        "&.Mui-disabled": {
                          color: "#546e7a",
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
        )}

        <Grid item xs={12}>
          <FormControl component="fieldset">
            <FormLabel
              component="legend"
              sx={{ fontWeight: 700, color: "#26a69a", mb: 1, fontSize: "1.1rem" }}
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
                  color: "#1e293b",
                  fontWeight: 500,
                },
              }}
            >
              <FormControlLabel
                value={true}
                control={<Radio sx={{ color: "#26a69a", "&.Mui-checked": { color: "#26a69a" } }} />}
                label="Connected"
              />
              <FormControlLabel
                value={false}
                control={<Radio sx={{ color: "#26a69a", "&.Mui-checked": { color: "#26a69a" } }} />}
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
                    fontSize: "0.85rem",
                    fontWeight: 600,
                    color: formData.callCategory ? "#546e7a" : "#ff9800",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    "&.Mui-focused": {
                      color: formData.callCategory ? "#26a69a" : "#ff9800",
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
                    borderRadius: "12px",
                    backgroundColor: "#ffffff",
                    color: "#1e293b",
                    "& .MuiOutlinedInput-notchedOutline": {
                      borderColor: formData.callCategory
                        ? "rgba(38, 166, 154, 0.3)"
                        : "#ff9800",
                    },
                    "&:hover .MuiOutlinedInput-notchedOutline": {
                      borderColor: formData.callCategory
                        ? "#26a69a"
                        : "#ff9800",
                    },
                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#26a69a",
                    },
                    "& .MuiSelect-icon": {
                      color: "#546e7a",
                    },
                  }}
                  MenuProps={{
                    PaperProps: {
                      sx: {
                        backgroundColor: "#ffffff",
                        boxShadow: "0 8px 24px rgba(0, 0, 0, 0.12)",
                        borderRadius: "12px",
                        "& .MuiMenuItem-root": {
                          color: "#1e293b",
                          "&:hover": {
                            backgroundColor: "rgba(38, 166, 154, 0.1)",
                          },
                          "&.Mui-disabled": {
                            color: "#546e7a",
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

            {/* Call Rating - Shown only for Health agent type with specific categories */}
            {showCallRating && (
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth variant="outlined" required>
                  <InputLabel
                    id="call-rating-label"
                    shrink={true}
                    sx={{
                      fontSize: "0.85rem",
                      fontWeight: 600,
                      color: formData.callRating ? "#546e7a" : "#ff9800",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                      "&.Mui-focused": {
                        color: formData.callRating ? "#26a69a" : "#ff9800",
                      },
                    }}
                  >
                    Call Rating *
                  </InputLabel>
                  <Select
                    labelId="call-rating-label"
                    value={formData.callRating}
                    onChange={(e) => handleInputChange("callRating", e.target.value)}
                    label="Call Rating *"
                    required
                    sx={{
                      borderRadius: "12px",
                      backgroundColor: "#ffffff",
                      color: "#1e293b",
                      "& .MuiOutlinedInput-notchedOutline": {
                        borderColor: formData.callRating
                          ? "rgba(38, 166, 154, 0.3)"
                          : "#ff9800",
                      },
                      "&:hover .MuiOutlinedInput-notchedOutline": {
                        borderColor: formData.callRating
                          ? "#26a69a"
                          : "#ff9800",
                      },
                      "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                        borderColor: "#26a69a",
                      },
                      "& .MuiSelect-icon": {
                        color: "#546e7a",
                      },
                    }}
                    MenuProps={{
                      PaperProps: {
                        sx: {
                          backgroundColor: "#ffffff",
                          boxShadow: "0 8px 24px rgba(0, 0, 0, 0.12)",
                          borderRadius: "12px",
                          "& .MuiMenuItem-root": {
                            color: "#1e293b",
                            "&:hover": {
                              backgroundColor: "rgba(38, 166, 154, 0.1)",
                            },
                            "&.Mui-disabled": {
                              color: "#546e7a",
                            },
                          },
                        },
                      },
                    }}
                    displayEmpty
                  >
                    <MenuItem value="" disabled>
                      Select Rating
                    </MenuItem>
                    {callRatings.map((rating) => (
                      <MenuItem key={rating} value={rating}>
                        {rating}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            )}

            {/* Numeric Call Rating (1-5) - Shown only for Health agent type with specific categories */}
            {showCallRating && (
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth variant="outlined" required>
                  <InputLabel
                    id="call-rating-numeric-label"
                    shrink={true}
                    sx={{
                      fontSize: "0.85rem",
                      fontWeight: 600,
                      color: formData.callRatingNumeric ? "#546e7a" : "#ff9800",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                      "&.Mui-focused": {
                        color: formData.callRatingNumeric ? "#26a69a" : "#ff9800",
                      },
                    }}
                  >
                    Numeric Rating (1-5) *
                  </InputLabel>
                  <Select
                    labelId="call-rating-numeric-label"
                    value={formData.callRatingNumeric}
                    onChange={(e) => handleInputChange("callRatingNumeric", e.target.value)}
                    label="Numeric Rating (1-5) *"
                    required
                    sx={{
                      borderRadius: "12px",
                      backgroundColor: "#ffffff",
                      color: "#1e293b",
                      "& .MuiOutlinedInput-notchedOutline": {
                        borderColor: formData.callRatingNumeric
                          ? "rgba(38, 166, 154, 0.3)"
                          : "#ff9800",
                      },
                      "&:hover .MuiOutlinedInput-notchedOutline": {
                        borderColor: formData.callRatingNumeric
                          ? "#26a69a"
                          : "#ff9800",
                      },
                      "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                        borderColor: "#26a69a",
                      },
                      "& .MuiSelect-icon": {
                        color: "#546e7a",
                      },
                    }}
                    MenuProps={{
                      PaperProps: {
                        sx: {
                          backgroundColor: "#ffffff",
                          boxShadow: "0 8px 24px rgba(0, 0, 0, 0.12)",
                          borderRadius: "12px",
                          "& .MuiMenuItem-root": {
                            color: "#1e293b",
                            "&:hover": {
                              backgroundColor: "rgba(38, 166, 154, 0.1)",
                            },
                            "&.Mui-disabled": {
                              color: "#546e7a",
                            },
                          },
                        },
                      },
                    }}
                    displayEmpty
                  >
                    <MenuItem value="" disabled>
                      Select Rating (1-5)
                    </MenuItem>
                    {numericRatings.map((rating) => (
                      <MenuItem key={rating} value={rating}>
                        {rating}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            )}

            <Grid item xs={12}>
              <FormControl fullWidth variant="outlined" required>
                <InputLabel
                  id="call-status-label"
                  shrink={true}
                  sx={{
                    fontSize: "0.85rem",
                    fontWeight: 600,
                    color: formData.callStatus ? "#546e7a" : "#ff9800",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    "&.Mui-focused": {
                      color: formData.callStatus ? "#26a69a" : "#ff9800",
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
                    borderRadius: "12px",
                    backgroundColor: "#ffffff",
                    color: "#1e293b",
                    minWidth: "30px",
                    "& .MuiOutlinedInput-notchedOutline": {
                      borderColor: formData.callStatus
                        ? "rgba(38, 166, 154, 0.3)"
                        : "#ff9800",
                    },
                    "&:hover .MuiOutlinedInput-notchedOutline": {
                      borderColor: formData.callStatus
                        ? "#26a69a"
                        : "#ff9800",
                    },
                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#26a69a",
                    },
                    "& .MuiSelect-icon": {
                      color: "#546e7a",
                    },
                  }}
                  MenuProps={{
                    PaperProps: {
                      sx: {
                        backgroundColor: "#ffffff",
                        boxShadow: "0 8px 24px rgba(0, 0, 0, 0.12)",
                        borderRadius: "12px",
                        "& .MuiMenuItem-root": {
                          color: "#1e293b",
                          "&:hover": {
                            backgroundColor: "rgba(38, 166, 154, 0.1)",
                          },
                          "&.Mui-disabled": {
                            color: "#546e7a",
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
                sx={{ mb: 2, fontWeight: 700, color: "#26a69a", fontSize: "1.1rem" }}
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
                          borderRadius: "12px",
                          backgroundColor: "#ffffff",
                          "& fieldset": {
                            borderColor: "rgba(38, 166, 154, 0.3)",
                          },
                          "&:hover fieldset": {
                            borderColor: "#26a69a",
                          },
                          "&.Mui-focused fieldset": {
                            borderColor: "#26a69a",
                          },
                        },
                        "& .MuiInputLabel-root": {
                          fontSize: "0.85rem",
                          fontWeight: 600,
                          color: "#546e7a",
                          textTransform: "uppercase",
                          letterSpacing: "0.05em",
                          "&.Mui-focused": {
                            color: "#26a69a",
                          },
                        },
                        "& .MuiOutlinedInput-input": {
                          color: "#1e293b",
                          fontWeight: "500",
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
                  fontSize: "0.85rem",
                  fontWeight: 600,
                  color: formData.notConnectedReason ? "#546e7a" : "#ff9800",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  "&.Mui-focused": {
                    color: formData.notConnectedReason ? "#26a69a" : "#ff9800",
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
                  borderRadius: "12px",
                  backgroundColor: "#ffffff",
                  color: "#1e293b",
                  minWidth: "30px",
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: formData.notConnectedReason
                      ? "rgba(38, 166, 154, 0.3)"
                      : "#ff9800",
                  },
                  "&:hover .MuiOutlinedInput-notchedOutline": {
                    borderColor: formData.notConnectedReason
                      ? "#26a69a"
                      : "#ff9800",
                  },
                  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#26a69a",
                  },
                  "& .MuiSelect-icon": {
                    color: "#546e7a",
                  },
                }}
                MenuProps={{
                  PaperProps: {
                    sx: {
                      backgroundColor: "#ffffff",
                      boxShadow: "0 8px 24px rgba(0, 0, 0, 0.12)",
                      borderRadius: "12px",
                      "& .MuiMenuItem-root": {
                        color: "#1e293b",
                        "&:hover": {
                          backgroundColor: "rgba(38, 166, 154, 0.1)",
                        },
                        "&.Mui-disabled": {
                          color: "#546e7a",
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
                borderRadius: "12px",
                backgroundColor: "#ffffff",
                "& fieldset": {
                  borderColor: "rgba(38, 166, 154, 0.3)",
                },
                "&:hover fieldset": {
                  borderColor: "#26a69a",
                },
                "&.Mui-focused fieldset": {
                  borderColor: "#26a69a",
                },
              },
              "& .MuiInputLabel-root": {
                fontSize: "0.85rem",
                fontWeight: 600,
                color: "#546e7a",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                "&.Mui-focused": {
                  color: "#26a69a",
                },
              },
              "& .MuiOutlinedInput-input": {
                color: "#1e293b",
                fontWeight: "500",
                "&::placeholder": {
                  color: "#546e7a",
                  opacity: 0.7,
                },
              },
            }}
          />
        </Grid>

        <Grid item xs={12}>
          <Divider sx={{ my: 2, backgroundColor: "rgba(38, 166, 154, 0.2)" }} />
          <Box sx={{ display: "flex", gap: 2, justifyContent: "flex-end" }}>
            <Button
              type="button"
              variant="outlined"
              startIcon={<Cancel />}
              onClick={() => {
                setFormData({
                  clientNumber: initialClientNumber || "",
                  callConnected: true,
                  callStatus: "",
                  callType: "",
                  callCategory: "",
                  partner: "",
                  escalation: "",
                  department: "",
                  notConnectedReason: "",
                  remarks: "",
                  callRating: "",
                  callRatingNumeric: "",
                  duration: { hours: 0, minutes: 0, seconds: 0 },
                });
                setClientNumberError("");
              }}
              sx={{
                borderRadius: "8px",
                textTransform: "none",
                fontWeight: 600,
                px: 3,
                py: 1.5,
                color: "#546e7a",
                borderColor: "rgba(38, 166, 154, 0.3)",
                "&:hover": {
                  borderColor: "#26a69a",
                  backgroundColor: "rgba(38, 166, 154, 0.05)",
                },
              }}
            >
              Clear
            </Button>
            <Button
              type="submit"
              variant="contained"
              startIcon={<Save />}
              disabled={!!clientNumberError}
              sx={{
                borderRadius: "8px",
                textTransform: "none",
                fontWeight: 600,
                px: 3,
                py: 1.5,
                background: "linear-gradient(135deg, #26a69a 0%, #1e8a7f 100%)",
                boxShadow: "0 4px 12px rgba(38, 166, 154, 0.3)",
                "&:hover": {
                  background: "linear-gradient(135deg, #1e8a7f 0%, #16665f 100%)",
                  transform: "translateY(-2px)",
                  boxShadow: "0 6px 16px rgba(38, 166, 154, 0.4)",
                },
                "&.Mui-disabled": {
                  background: "rgba(38, 166, 154, 0.5)",
                  color: "#ffffff",
                },
                transition: "all 0.2s ease",
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

export default ManualCallLogForm;