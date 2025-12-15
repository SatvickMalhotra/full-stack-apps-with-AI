import React, { useState, useEffect } from "react";
import {
  Autocomplete,
  TextField,
  CircularProgress,
  Box,
  Typography,
} from "@mui/material";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../firebaseConfig";

/**
 * ClinicCodeAutocomplete Component
 *
 * Provides a searchable dropdown for clinic codes with auto-fill functionality
 * When a clinic code is selected, it automatically fills related fields
 *
 * Props:
 * - agentId: The DC agent's user ID
 * - onClinicSelect: Callback function (clinicData) => void
 * - disabled: Boolean to disable the component
 */
const ClinicCodeAutocomplete = ({ agentId, onClinicSelect, disabled = false }) => {
  const [clinics, setClinics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedClinic, setSelectedClinic] = useState(null);

  // Fetch clinics assigned to this DC agent
  useEffect(() => {
    const fetchClinics = async () => {
      if (!agentId) return;

      try {
        setLoading(true);

        // Query clinicData collection for clinics assigned to this DC
        const clinicsRef = collection(db, "clinicData");
        const q = query(clinicsRef, where("assignedDC", "==", agentId));
        const snapshot = await getDocs(q);

        const clinicList = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        // Sort clinics by clinic code
        clinicList.sort((a, b) => a.clinicCode.localeCompare(b.clinicCode));

        setClinics(clinicList);
      } catch (error) {
        console.error("Error fetching clinics:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchClinics();
  }, [agentId]);

  // Handle clinic selection
  const handleClinicChange = (event, value) => {
    setSelectedClinic(value);
    if (onClinicSelect) {
      onClinicSelect(value);
    }
  };

  return (
    <Box>
      <Autocomplete
        value={selectedClinic}
        onChange={handleClinicChange}
        options={clinics}
        getOptionLabel={(option) =>
          option ? `${option.clinicCode} - ${option.branchName}` : ""
        }
        loading={loading}
        disabled={disabled || loading}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Clinic Code *"
            placeholder="Search clinic code or branch name..."
            InputProps={{
              ...params.InputProps,
              endAdornment: (
                <>
                  {loading ? <CircularProgress color="inherit" size={20} /> : null}
                  {params.InputProps.endAdornment}
                </>
              ),
            }}
          />
        )}
        renderOption={(props, option) => (
          <Box component="li" {...props}>
            <Box sx={{ width: "100%" }}>
              <Typography variant="body1" sx={{ fontWeight: 600 }}>
                {option.clinicCode}
              </Typography>
              <Typography variant="body2" sx={{ color: "#64748b", fontSize: "0.875rem" }}>
                {option.branchName}, {option.state}
              </Typography>
              <Typography variant="caption" sx={{ color: "#94a3b8" }}>
                {option.partnerName}
              </Typography>
            </Box>
          </Box>
        )}
        noOptionsText={
          loading
            ? "Loading clinics..."
            : clinics.length === 0
            ? "No clinics assigned to you"
            : "No matching clinics found"
        }
        sx={{
          "& .MuiAutocomplete-listbox": {
            maxHeight: "300px",
          },
        }}
      />

      {selectedClinic && (
        <Box
          sx={{
            mt: 2,
            p: 2,
            bgcolor: "#f8fafc",
            borderRadius: 1,
            border: "1px solid #e2e8f0",
          }}
        >
          <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 600 }}>
            Selected Clinic Details:
          </Typography>
          <Box sx={{ mt: 1, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1 }}>
            <Typography variant="body2">
              <strong>Clinic Code:</strong> {selectedClinic.clinicCode}
            </Typography>
            <Typography variant="body2">
              <strong>Partner:</strong> {selectedClinic.partnerName}
            </Typography>
            <Typography variant="body2">
              <strong>Branch:</strong> {selectedClinic.branchName}
            </Typography>
            <Typography variant="body2">
              <strong>State:</strong> {selectedClinic.state}
            </Typography>
            <Typography variant="body2">
              <strong>Region:</strong> {selectedClinic.region}
            </Typography>
            <Typography variant="body2">
              <strong>Ops Manager:</strong> {selectedClinic.assignedOpsManager}
            </Typography>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default ClinicCodeAutocomplete;
