import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Card,
  Button,
  Grid,
  TextField,
  InputAdornment,
  Chip,
} from "@mui/material";
import { Search as SearchIcon, LocalHospital } from "@mui/icons-material";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../firebaseConfig";

/**
 * DCClinicsView Component
 * Displays assigned clinics for DC agents with search functionality
 */
const DCClinicsView = ({ assignedClinics = [], onRecordVisit }) => {
  const [clinicDetails, setClinicDetails] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  // Fetch clinic details from clinicData collection
  useEffect(() => {
    const fetchClinicDetails = async () => {
      if (!assignedClinics || assignedClinics.length === 0) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        // Fetch clinic details for assigned clinics
        const clinicsRef = collection(db, "clinicData");
        const clinicPromises = assignedClinics.map(async (clinicCode) => {
          const q = query(clinicsRef, where("clinicCode", "==", clinicCode));
          const snapshot = await getDocs(q);

          if (!snapshot.empty) {
            return {
              id: snapshot.docs[0].id,
              ...snapshot.docs[0].data(),
            };
          }
          return null;
        });

        const results = await Promise.all(clinicPromises);
        const validClinics = results.filter((clinic) => clinic !== null);

        // Sort by clinic code
        validClinics.sort((a, b) => a.clinicCode.localeCompare(b.clinicCode));

        setClinicDetails(validClinics);
      } catch (error) {
        console.error("Error fetching clinic details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchClinicDetails();
  }, [assignedClinics]);

  // Filter clinics based on search query
  const filteredClinics = clinicDetails.filter((clinic) => {
    const query = searchQuery.toLowerCase();
    return (
      clinic.clinicCode?.toLowerCase().includes(query) ||
      clinic.branchName?.toLowerCase().includes(query) ||
      clinic.state?.toLowerCase().includes(query) ||
      clinic.partnerName?.toLowerCase().includes(query)
    );
  });

  if (loading) {
    return (
      <Box sx={{ textAlign: "center", py: 8 }}>
        <Typography variant="body1" sx={{ color: "#64748b" }}>
          Loading clinics...
        </Typography>
      </Box>
    );
  }

  if (assignedClinics.length === 0) {
    return (
      <Box sx={{ textAlign: "center", py: 8 }}>
        <LocalHospital sx={{ fontSize: 64, color: "#cbd5e1", mb: 2 }} />
        <Typography variant="h6" sx={{ color: "#64748b", mb: 1 }}>
          No clinics assigned
        </Typography>
        <Typography variant="body2" sx={{ color: "#94a3b8" }}>
          Contact your manager to get clinic assignments
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
          flexWrap: "wrap",
          gap: 2,
        }}
      >
        <Typography variant="h5" sx={{ fontWeight: 600, color: "#1e293b" }}>
          My Assigned Clinics ({clinicDetails.length})
        </Typography>

        <TextField
          placeholder="Search clinics..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          size="small"
          sx={{
            minWidth: { xs: "100%", sm: "300px" },
            "& .MuiOutlinedInput-root": {
              borderRadius: "12px",
            },
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: "#94a3b8" }} />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      {/* Clinics Grid */}
      {filteredClinics.length === 0 ? (
        <Box sx={{ textAlign: "center", py: 8 }}>
          <Typography variant="body1" sx={{ color: "#64748b" }}>
            No clinics found matching "{searchQuery}"
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={2}>
          {filteredClinics.map((clinic) => (
            <Grid item xs={12} sm={6} md={4} key={clinic.id}>
              <Card
                sx={{
                  p: 3,
                  borderRadius: "16px",
                  border: "1px solid #e2e8f0",
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  transition: "all 0.2s",
                  "&:hover": {
                    boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
                    transform: "translateY(-4px)",
                    borderColor: "#667eea",
                  },
                }}
              >
                {/* Clinic Code */}
                <Box sx={{ mb: 2 }}>
                  <Chip
                    label={clinic.clinicCode}
                    sx={{
                      bgcolor: "#667eea",
                      color: "white",
                      fontWeight: 600,
                      fontSize: "0.875rem",
                    }}
                  />
                </Box>

                {/* Branch Name */}
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 600,
                    color: "#1e293b",
                    mb: 1,
                    fontSize: "1rem",
                  }}
                >
                  {clinic.branchName}
                </Typography>

                {/* Location */}
                <Typography
                  variant="body2"
                  sx={{
                    color: "#64748b",
                    mb: 2,
                    display: "flex",
                    alignItems: "center",
                    gap: 0.5,
                  }}
                >
                  📍 {clinic.state} • {clinic.region}
                </Typography>

                {/* Partner */}
                <Box sx={{ mb: 2 }}>
                  <Typography variant="caption" sx={{ color: "#94a3b8" }}>
                    Partner
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500, color: "#475569" }}>
                    {clinic.partnerName}
                  </Typography>
                </Box>

                {/* Ops Manager */}
                <Box sx={{ mb: 3, flexGrow: 1 }}>
                  <Typography variant="caption" sx={{ color: "#94a3b8" }}>
                    Ops Manager
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500, color: "#475569" }}>
                    {clinic.assignedOpsManager}
                  </Typography>
                </Box>

                {/* Record Visit Button */}
                <Button
                  variant="contained"
                  fullWidth
                  onClick={onRecordVisit}
                  sx={{
                    bgcolor: "#667eea",
                    borderRadius: "8px",
                    textTransform: "none",
                    fontWeight: 600,
                    py: 1,
                    "&:hover": {
                      bgcolor: "#5a67d8",
                    },
                  }}
                >
                  Record Visit
                </Button>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default DCClinicsView;
