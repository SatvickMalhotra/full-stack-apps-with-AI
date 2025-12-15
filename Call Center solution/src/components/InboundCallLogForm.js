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

const InboundCallLogForm = ({ onSubmit, initialClientNumber }) => {
  const [formData, setFormData] = useState({
    agentType: "", // Health, Insurance
    clientNumber: initialClientNumber || "",
    callConnected: true,
    callStatus: "",
    callType: "",
    callCategory: "",
    partner: "",
    escalation: "",
    department: "",
    notConnectedReason: "",
    callRating: "", // For Health agents (Excellent/Good/Average/Poor)
    callRatingNumeric: "", // For Health agents - numeric rating 1-5
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
    } else if (field === "agentType") {
      // Reset form when agent type changes
      setFormData({
        agentType: value,
        clientNumber: formData.clientNumber,
        callConnected: true,
        callStatus: "",
        callType: "",
        callCategory: "",
        partner: "",
        escalation: "",
        department: "",
        notConnectedReason: "",
        callRating: "",
        callRatingNumeric: "",
        remarks: "",
        duration: { hours: 0, minutes: 0, seconds: 0 },
      });
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

    if (!formData.agentType) {
      alert("Please select Agent Type first");
      return;
    }

    if (formData.clientNumber.length !== 10) {
      setClientNumberError("Client Number must be exactly 10 digits");
      return;
    }

    if (!formData.callType) {
      alert("Please select a Call Type");
      return;
    }

    if (!formData.escalation) {
      alert("Please select Escalation (Yes/No)");
      return;
    }

    // Department required only for Insurance
    if (formData.agentType === "Insurance" && !formData.department) {
      alert("Please select Department Name");
      return;
    }

    if (formData.callConnected) {
      if (!formData.callCategory) {
        alert("Please select a Call Category");
        return;
      }
      if (!formData.callStatus) {
        alert("Please select a Call Outcome");
        return;
      }
      if (!formData.partner) {
        alert("Please select a Partner");
        return;
      }
      // Call Rating required for Health agents with specific categories
      if (
        formData.agentType === "Health" &&
        ["BM Review Done", "Consultation Done", "Customer Awareness Done"].includes(formData.callCategory) &&
        !formData.callRating
      ) {
        alert("Please select a Call Rating");
        return;
      }
      // Numeric Call Rating required for Health agents with specific categories
      if (
        formData.agentType === "Health" &&
        ["BM Review Done", "Consultation Done", "Customer Awareness Done"].includes(formData.callCategory) &&
        !formData.callRatingNumeric
      ) {
        alert("Please select a Numeric Call Rating (1-5)");
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

    setFormData({
      agentType: formData.agentType, // Keep agent type selected
      clientNumber: initialClientNumber || "",
      callConnected: true,
      callStatus: "",
      callType: "",
      callCategory: "",
      partner: "",
      escalation: "",
      department: "",
      notConnectedReason: "",
      callRating: "",
      callRatingNumeric: "",
      remarks: "",
      duration: { hours: 0, minutes: 0, seconds: 0 },
    });
    setClientNumberError("");
  };

  // Dynamic options based on agent type
  const getCallTypes = () => {
    if (formData.agentType === "Health") {
      return ["Customer Awareness", "BM Review", "Consultation", "Feedback Call"];
    }
    return ["Client", "Branch Manager", "Nurse"];
  };

  const getCallCategories = () => {
    if (formData.agentType === "Health") {
      return ["BM Review Done", "Consultation Done", "Customer Awareness Done"];
    }
    return [
      "Query Update",
      "Claim Status",
      "Negotiation Call",
      "Intimation Call",
      "Product Information",
    ];
  };

  const getCallStatuses = () => {
    if (formData.agentType === "Health") {
      // Remove "Appointment Scheduled" and "Transferred to Specialist"
      return [
        "Completed Successfully",
        "Follow-up Required",
        "Information Provided",
        "Issue Resolved",
      ];
    }
    return [
      "Completed Successfully",
      "Follow-up Required",
      "Information Provided",
      "Appointment Scheduled",
      "Issue Resolved",
      "Transferred to Specialist",
    ];
  };

  const getPartners = () => {
    if (formData.agentType === "Health") {
      // Add "Multi Partner" for Health agents
      return [...partners, { id: "multi-partner", name: "Multi Partner" }];
    }
    return partners;
  };

  const callRatingOptions = ["Excellent", "Good", "Average", "Poor"];
  const numericRatingOptions = ["1", "2", "3", "4", "5"];

  const notConnectedReasons = [
    "No Answer",
    "Busy Signal",
    "Voicemail",
    "Wrong Number",
    "Number Disconnected",
    "Call Dropped",
  ];

  // Reusable select style - Light Theme
  const selectStyle = {
    borderRadius: "12px",
    backgroundColor: "#ffffff",
    color: "#1e293b",
    "& .MuiOutlinedInput-notchedOutline": {
      borderColor: "rgba(38, 166, 154, 0.3)",
    },
    "&:hover .MuiOutlinedInput-notchedOutline": {
      borderColor: "#26a69a",
    },
    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
      borderColor: "#26a69a",
    },
    "& .MuiSelect-icon": {
      color: "#546e7a",
    },
  };

  const requiredSelectStyle = (hasValue) => ({
    ...selectStyle,
    "& .MuiOutlinedInput-notchedOutline": {
      borderColor: hasValue ? "rgba(38, 166, 154, 0.3)" : "#ff9800",
    },
    "&:hover .MuiOutlinedInput-notchedOutline": {
      borderColor: hasValue ? "#26a69a" : "#ff9800",
    },
  });

  const menuProps = {
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
            color: "#9ca3af",
          },
        },
      },
    },
  };

  const labelStyle = (hasValue, isRequired) => ({
    fontSize: "0.85rem",
    fontWeight: 600,
    color: isRequired ? (hasValue ? "#546e7a" : "#ff9800") : "#546e7a",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    "&.Mui-focused": {
      color: isRequired ? (hasValue ? "#26a69a" : "#ff9800") : "#26a69a",
    },
  });

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ width: "100%" }}>
      <Typography
        variant="h6"
        sx={{ mb: 3, fontWeight: 700, color: "#26a69a", fontSize: "1.3rem" }}
      >
        Log Inbound Call Details
      </Typography>

      <Grid container spacing={3}>
        {/* Client Number - Always visible */}
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
                color: clientNumberError ? "#f44336" : "#546e7a",
                fontSize: "0.85rem",
                fontWeight: 600,
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
                  color: "#9ca3af",
                  opacity: 0.7,
                },
              },
              "& .MuiFormHelperText-root": {
                color: "#f44336",
              },
            }}
          />
        </Grid>

        {/* Agent Type - FIRST dropdown for logging */}
        <Grid item xs={12}>
          <FormControl fullWidth variant="outlined" required>
            <InputLabel
              id="agent-type-label"
              shrink={true}
              sx={labelStyle(formData.agentType, true)}
            >
              Agent Type *
            </InputLabel>
            <Select
              labelId="agent-type-label"
              value={formData.agentType}
              onChange={(e) => handleInputChange("agentType", e.target.value)}
              label="Agent Type *"
              required
              sx={requiredSelectStyle(formData.agentType)}
              MenuProps={menuProps}
              displayEmpty
            >
              <MenuItem value="" disabled>
                Select Agent Type
              </MenuItem>
              <MenuItem value="Health">Health</MenuItem>
              <MenuItem value="Insurance">Insurance</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        {/* Show rest of form only after agent type is selected */}
        {formData.agentType && (
          <>
            {/* Call Connected/Not Connected Status */}
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
                    control={<Radio color="error" />}
                    label="Not Connected"
                  />
                </RadioGroup>
              </FormControl>
            </Grid>

            {/* Call Type Dropdown */}
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth variant="outlined" required>
                <InputLabel
                  id="call-type-label"
                  shrink={true}
                  sx={labelStyle(formData.callType, true)}
                >
                  Call Type *
                </InputLabel>
                <Select
                  labelId="call-type-label"
                  value={formData.callType}
                  onChange={(e) => handleInputChange("callType", e.target.value)}
                  label="Call Type *"
                  required
                  sx={requiredSelectStyle(formData.callType)}
                  MenuProps={menuProps}
                  displayEmpty
                >
                  <MenuItem value="" disabled>
                    Select Call Type
                  </MenuItem>
                  {getCallTypes().map((type) => (
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
                  sx={labelStyle(formData.partner, true)}
                >
                  Partner *
                </InputLabel>
                <Select
                  labelId="partner-label"
                  value={formData.partner}
                  onChange={(e) => handleInputChange("partner", e.target.value)}
                  label="Partner *"
                  required
                  sx={requiredSelectStyle(formData.partner)}
                  MenuProps={menuProps}
                  displayEmpty
                >
                  <MenuItem value="" disabled>
                    Select Partner
                  </MenuItem>
                  {getPartners().map((partner) => (
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
                  sx={labelStyle(formData.escalation, true)}
                >
                  Escalation *
                </InputLabel>
                <Select
                  labelId="escalation-label"
                  value={formData.escalation}
                  onChange={(e) => handleInputChange("escalation", e.target.value)}
                  label="Escalation *"
                  required
                  sx={requiredSelectStyle(formData.escalation)}
                  MenuProps={menuProps}
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

            {/* Department Name - Only for Insurance */}
            {formData.agentType === "Insurance" && (
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth variant="outlined" required>
                  <InputLabel
                    id="department-label"
                    shrink={true}
                    sx={labelStyle(formData.department, true)}
                  >
                    Department Name *
                  </InputLabel>
                  <Select
                    labelId="department-label"
                    value={formData.department}
                    onChange={(e) => handleInputChange("department", e.target.value)}
                    label="Department Name *"
                    required
                    sx={requiredSelectStyle(formData.department)}
                    MenuProps={menuProps}
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

            {formData.callConnected ? (
              <>
                {/* Call Category Dropdown */}
                <Grid item xs={12}>
                  <FormControl fullWidth variant="outlined" required>
                    <InputLabel
                      id="call-category-label"
                      shrink={true}
                      sx={labelStyle(formData.callCategory, true)}
                    >
                      {formData.agentType === "Health"
                        ? "Connected Call Category *"
                        : "Call Category *"}
                    </InputLabel>
                    <Select
                      labelId="call-category-label"
                      value={formData.callCategory}
                      onChange={(e) =>
                        handleInputChange("callCategory", e.target.value)
                      }
                      label={
                        formData.agentType === "Health"
                          ? "Connected Call Category *"
                          : "Call Category *"
                      }
                      required
                      sx={requiredSelectStyle(formData.callCategory)}
                      MenuProps={menuProps}
                      displayEmpty
                    >
                      <MenuItem value="" disabled>
                        Select Category
                      </MenuItem>
                      {getCallCategories().map((category) => (
                        <MenuItem key={category} value={category}>
                          {category}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                {/* Call Rating - Only for Health with specific categories */}
                {formData.agentType === "Health" &&
                  ["BM Review Done", "Consultation Done", "Customer Awareness Done"].includes(
                    formData.callCategory
                  ) && (
                    <Grid item xs={12} sm={6}>
                      <FormControl fullWidth variant="outlined" required>
                        <InputLabel
                          id="call-rating-label"
                          shrink={true}
                          sx={labelStyle(formData.callRating, true)}
                        >
                          Call Rating *
                        </InputLabel>
                        <Select
                          labelId="call-rating-label"
                          value={formData.callRating}
                          onChange={(e) =>
                            handleInputChange("callRating", e.target.value)
                          }
                          label="Call Rating *"
                          required
                          sx={requiredSelectStyle(formData.callRating)}
                          MenuProps={menuProps}
                          displayEmpty
                        >
                          <MenuItem value="" disabled>
                            Select Rating
                          </MenuItem>
                          {callRatingOptions.map((rating) => (
                            <MenuItem key={rating} value={rating}>
                              {rating}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                  )}

                {/* Numeric Call Rating (1-5) - Only for Health with specific categories */}
                {formData.agentType === "Health" &&
                  ["BM Review Done", "Consultation Done", "Customer Awareness Done"].includes(
                    formData.callCategory
                  ) && (
                    <Grid item xs={12} sm={6}>
                      <FormControl fullWidth variant="outlined" required>
                        <InputLabel
                          id="call-rating-numeric-label"
                          shrink={true}
                          sx={labelStyle(formData.callRatingNumeric, true)}
                        >
                          Numeric Rating (1-5) *
                        </InputLabel>
                        <Select
                          labelId="call-rating-numeric-label"
                          value={formData.callRatingNumeric}
                          onChange={(e) =>
                            handleInputChange("callRatingNumeric", e.target.value)
                          }
                          label="Numeric Rating (1-5) *"
                          required
                          sx={requiredSelectStyle(formData.callRatingNumeric)}
                          MenuProps={menuProps}
                          displayEmpty
                        >
                          <MenuItem value="" disabled>
                            Select Rating (1-5)
                          </MenuItem>
                          {numericRatingOptions.map((rating) => (
                            <MenuItem key={rating} value={rating}>
                              {rating}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                  )}

                {/* Call Outcome */}
                <Grid item xs={12}>
                  <FormControl fullWidth variant="outlined" required>
                    <InputLabel
                      id="call-status-label"
                      shrink={true}
                      sx={labelStyle(formData.callStatus, true)}
                    >
                      Call Outcome *
                    </InputLabel>
                    <Select
                      labelId="call-status-label"
                      value={formData.callStatus}
                      onChange={(e) =>
                        handleInputChange("callStatus", e.target.value)
                      }
                      label="Call Outcome *"
                      required
                      sx={requiredSelectStyle(formData.callStatus)}
                      MenuProps={menuProps}
                      displayEmpty
                    >
                      <MenuItem value="" disabled>
                        Select Outcome
                      </MenuItem>
                      {getCallStatuses().map((status) => (
                        <MenuItem key={status} value={status}>
                          {status}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                {/* Call Duration */}
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
                              color: "#546e7a",
                              fontSize: "0.85rem",
                              fontWeight: 600,
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
              /* Not Connected Reason */
              <Grid item xs={12}>
                <FormControl fullWidth variant="outlined" required>
                  <InputLabel
                    id="not-connected-reason-label"
                    shrink={true}
                    sx={labelStyle(formData.notConnectedReason, true)}
                  >
                    Reason Not Connected *
                  </InputLabel>
                  <Select
                    labelId="not-connected-reason-label"
                    value={formData.notConnectedReason}
                    onChange={(e) =>
                      handleInputChange("notConnectedReason", e.target.value)
                    }
                    label="Reason Not Connected *"
                    required
                    sx={requiredSelectStyle(formData.notConnectedReason)}
                    MenuProps={menuProps}
                    displayEmpty
                  >
                    <MenuItem value="" disabled>
                      Select Reason
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

            {/* Remarks */}
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
                    color: "#546e7a",
                    fontSize: "0.85rem",
                    fontWeight: 600,
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
                      color: "#9ca3af",
                      opacity: 0.7,
                    },
                  },
                }}
              />
            </Grid>
          </>
        )}

        {/* Action Buttons */}
        <Grid item xs={12}>
          <Divider sx={{ my: 2, backgroundColor: "rgba(38, 166, 154, 0.2)" }} />
          <Box sx={{ display: "flex", gap: 2, justifyContent: "flex-end" }}>
            <Button
              type="button"
              variant="outlined"
              startIcon={<Cancel />}
              onClick={() => {
                setFormData({
                  agentType: "",
                  clientNumber: initialClientNumber || "",
                  callConnected: true,
                  callStatus: "",
                  callType: "",
                  callCategory: "",
                  partner: "",
                  escalation: "",
                  department: "",
                  notConnectedReason: "",
                  callRating: "",
                  callRatingNumeric: "",
                  remarks: "",
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
              disabled={!!clientNumberError || !formData.agentType}
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

export default InboundCallLogForm;
