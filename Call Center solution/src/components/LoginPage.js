import React, { useState } from "react";
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  IconButton,
  InputAdornment,
  Divider,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import GoogleIcon from "@mui/icons-material/Google";
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";
import { auth, db } from "../firebaseConfig";
import { useNavigate } from "react-router-dom";
import styles from "./LoginPage.module.css";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      let userDoc = null;
      let foundCollection = null;

      // First, check the central userCollections mapping (fastest method for new users)
      const userCollectionDoc = await getDoc(doc(db, "userCollections", user.uid));
      if (userCollectionDoc.exists()) {
        const mappingData = userCollectionDoc.data();
        foundCollection = mappingData.collection;

        // Use documentId if available (for collections that use empId as doc ID),
        // otherwise fall back to user.uid
        const docId = mappingData.documentId || user.uid;
        userDoc = await getDoc(doc(db, foundCollection, docId));
      }

      // Fallback: Check managers collection (for department managers)
      // Managers can be stored with either UID or empId as document ID, so we query by uid field
      if (!userDoc || !userDoc.exists()) {
        const managersQuery = query(
          collection(db, "managers"),
          where("uid", "==", user.uid)
        );
        const managersSnapshot = await getDocs(managersQuery);

        if (!managersSnapshot.empty) {
          userDoc = managersSnapshot.docs[0];
          foundCollection = "managers";
        }
      }

      // Fallback: Check admin collection (for TLs)
      if (!userDoc || !userDoc.exists()) {
        userDoc = await getDoc(doc(db, "admin", user.uid));
        if (userDoc.exists()) {
          foundCollection = "admin";
        }
      }

      // Fallback: Check teamleads collection (for Health and Insurance TLs)
      if (!userDoc || !userDoc.exists()) {
        userDoc = await getDoc(doc(db, "teamleads", user.uid));
        if (userDoc.exists()) {
          foundCollection = "teamleads";
        }
      }

      // Fallback: Check healthAgents collection (for Health agents)
      if (!userDoc || !userDoc.exists()) {
        userDoc = await getDoc(doc(db, "healthAgents", user.uid));
        if (userDoc.exists()) {
          foundCollection = "healthAgents";
        }
      }

      // Fallback: Check insuranceAgents collection (for Insurance agents)
      if (!userDoc || !userDoc.exists()) {
        userDoc = await getDoc(doc(db, "insuranceAgents", user.uid));
        if (userDoc.exists()) {
          foundCollection = "insuranceAgents";
        }
      }

      // Fallback: Check Team Lead collections
      // Insurance TLs use UID as document ID
      if (!userDoc || !userDoc.exists()) {
        userDoc = await getDoc(doc(db, "insuranceTeamLeads", user.uid));
        if (userDoc.exists()) {
          foundCollection = "insuranceTeamLeads";
        }
      }

      // Health TLs use empId as document ID, so query by uid field
      if (!userDoc || !userDoc.exists()) {
        const healthTLQuery = query(
          collection(db, "healthTeamLeads"),
          where("uid", "==", user.uid)
        );
        const healthTLSnapshot = await getDocs(healthTLQuery);

        if (!healthTLSnapshot.empty) {
          userDoc = healthTLSnapshot.docs[0];
          foundCollection = "healthTeamLeads";
        }
      }

      // Check offlineVisits collection
      if (!userDoc || !userDoc.exists()) {
        userDoc = await getDoc(doc(db, "offlineVisits", user.uid));
        if (userDoc.exists()) {
          foundCollection = "offlineVisits";
        }
      }

      // Check offlineVisitsManagers collection
      if (!userDoc || !userDoc.exists()) {
        userDoc = await getDoc(doc(db, "offlineVisitsManagers", user.uid));
        if (userDoc.exists()) {
          foundCollection = "offlineVisitsManagers";
        }
      }

      // Fallback: Check agent collections (agent1-agent50) - for legacy agents
      if (!userDoc || !userDoc.exists()) {
        for (let i = 1; i <= 50; i++) {
          const agentCollection = `agent${i}`;
          userDoc = await getDoc(doc(db, agentCollection, user.uid));
          if (userDoc.exists()) {
            foundCollection = agentCollection;
            break;
          }
        }
      }

      // Final fallback: Check email-based collection (for very old legacy users)
      if (!userDoc || !userDoc.exists()) {
        const collectionName = user.email.split("@")[0];
        userDoc = await getDoc(doc(db, collectionName, user.uid));
        if (userDoc.exists()) {
          foundCollection = collectionName;
        }
      }

      if (userDoc.exists()) {
        const userData = userDoc.data();
        const role = userData.role;

        console.log("Login successful:", { role, collection: foundCollection });
        console.log("Full userData:", userData);

        // Map display roles to routes
        const roleRouteMapping = {
          // System roles (old format)
          "agent": "/agent-view",
          "teamlead": "/tl-dashboard",
          "manager": "/manager-dashboard",
          "offlineVisits": "/offline-visits",
          "dc_agent": "/dc-dashboard",
          "offlineVisitsManager": "/offline-visits-manager",

          // Display roles (new format)
          "Health Agent": "/agent-view",
          "Insurance Agent": "/agent-view",
          "Health TL": "/tl-dashboard",
          "Insurance TL": "/tl-dashboard",
          "DC Agent": "/dc-dashboard",
          "Offline Visits": "/offline-visits",
          "Offline Visits Manager": "/offline-visits-manager",
        };

        // Special handling for Managers (they need state passed)
        if (role === "Manager" || role === "Health Manager" || role === "Insurance Manager" || role === "Department Manager") {
          const managerId = userDoc.id;
          navigate("/department-manager-dashboard", {
            state: { managerId, managerCollection: foundCollection },
          });
        } else if (roleRouteMapping[role]) {
          navigate(roleRouteMapping[role]);
        } else {
          setError("Invalid user role");
        }
      } else {
        setError("User role not found");
        console.warn("User document not found for UID:", user.uid);
      }
    } catch (error) {
      setError("Incorrect email or password");
      console.error("Login error:", error);
    }
  };

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleMouseDownPassword = (e) => {
    e.preventDefault();
  };

  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({
      prompt: 'select_account'
    });

    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Check if user exists in database
      let userDoc = null;
      let foundCollection = null;

      // Check the central userCollections mapping
      const userCollectionDoc = await getDoc(doc(db, "userCollections", user.uid));
      if (userCollectionDoc.exists()) {
        foundCollection = userCollectionDoc.data().collection;
        userDoc = await getDoc(doc(db, foundCollection, user.uid));
      }

      // Check managers collection
      if (!userDoc || !userDoc.exists()) {
        const managerDoc = await getDoc(doc(db, "mswasth", user.uid));
        if (managerDoc.exists() && managerDoc.data().role === "departmentManager") {
          foundCollection = "managers";
          const managerId = managerDoc.data().managerId;
          userDoc = await getDoc(doc(db, "managers", managerId));
        }
      }

      // Check admin collection
      if (!userDoc || !userDoc.exists()) {
        userDoc = await getDoc(doc(db, "admin", user.uid));
        if (userDoc.exists()) {
          foundCollection = "admin";
        }
      }

      // Check mswasth collection
      if (!userDoc || !userDoc.exists()) {
        userDoc = await getDoc(doc(db, "mswasth", user.uid));
        if (userDoc.exists()) {
          foundCollection = "mswasth";
        }
      }

      // Check agent collections
      if (!userDoc || !userDoc.exists()) {
        for (let i = 1; i <= 50; i++) {
          const agentCollection = `agent${i}`;
          userDoc = await getDoc(doc(db, agentCollection, user.uid));
          if (userDoc.exists()) {
            foundCollection = agentCollection;
            break;
          }
        }
      }

      if (userDoc && userDoc.exists()) {
        const userData = userDoc.data();
        const role = userData.role;

        console.log("Google Sign-In successful:", { role, collection: foundCollection });

        if (role === "Manager") {
          // Managers are stored with empId as document ID, so use the document ID from the query result
          const managerId = userDoc.id; // Use the actual document ID (empId)
          navigate("/department-manager-dashboard", {
            state: { managerId, managerCollection: foundCollection },
          });
        } else if (role === "manager") {
          navigate("/manager-dashboard");
        } else if (role === "agent") {
          navigate("/agent-view");
        } else if (role === "teamlead") {
          navigate("/tl-dashboard");
        } else if (role === "offlineVisits") {
          navigate("/offline-visits");
        } else {
          setError("Invalid user role");
        }
      } else {
        setError("Your account is not registered in the system. Please contact your administrator.");
        await auth.signOut(); // Sign out if not authorized
      }
    } catch (error) {
      console.error("Google Sign-In error:", error);
      if (error.code === 'auth/popup-closed-by-user') {
        setError("Sign-in cancelled");
      } else if (error.code === 'auth/popup-blocked') {
        setError("Pop-up blocked. Please allow pop-ups for this site.");
      } else {
        setError("Google Sign-In failed. Please try again.");
      }
    }
  };

  return (
    <div className={styles.background}>
      <Container
        maxWidth="sm"
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          padding: { xs: 2, sm: 3 },
        }}
      >
        <Paper elevation={0} className={styles.loginPaper}>
          {/* Header Section */}
          <Box sx={{ textAlign: "center", mb: 4 }}>
            <Box
              sx={{
                width: 120,
                height: 120,
                borderRadius: "50%",
                background: "linear-gradient(135deg, #26a69a 0%, #1e8a7f 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 20px",
                boxShadow: "0 8px 24px rgba(38, 166, 154, 0.3)",
                padding: "8px",
              }}
            >
              <Box
                sx={{
                  width: "100%",
                  height: "100%",
                  borderRadius: "50%",
                  overflow: "hidden",
                  backgroundColor: "#ffffff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <img
                  src="/mswasthlogo.svg"
                  alt="M-Swasth Logo"
                  style={{
                    width: "75%",
                    height: "75%",
                    objectFit: "contain",
                  }}
                />
              </Box>
            </Box>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 700,
                color: "#26a69a",
                marginBottom: "8px",
                fontSize: { xs: "1.75rem", sm: "2rem" },
              }}
            >
              M-Swasth
            </Typography>
            <Typography
              variant="subtitle1"
              sx={{
                color: "#546e7a",
                fontSize: "0.95rem",
                fontWeight: 500,
              }}
            >
              Agent Call Logger
            </Typography>
          </Box>

          <Box
            component="form"
            onSubmit={handleLogin}
            noValidate
            className={styles.form}
          >
            <TextField
              fullWidth
              required
              id="email"
              label="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              variant="outlined"
              autoFocus
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
                  fontSize: "0.95rem",
                  fontWeight: 500,
                  color: "#546e7a",
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
            <TextField
              fullWidth
              required
              id="password"
              label="Password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              variant="outlined"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={handleClickShowPassword}
                      onMouseDown={handleMouseDownPassword}
                      edge="end"
                      sx={{ color: "#546e7a" }}
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
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
                  fontSize: "0.95rem",
                  fontWeight: 500,
                  color: "#546e7a",
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

            {error && (
              <Typography
                sx={{
                  color: "#dc2626",
                  fontSize: "0.875rem",
                  textAlign: "center",
                  backgroundColor: "rgba(239, 68, 68, 0.1)",
                  padding: "12px 16px",
                  borderRadius: "8px",
                  border: "1px solid rgba(239, 68, 68, 0.3)",
                  fontWeight: 500,
                }}
              >
                {error}
              </Typography>
            )}

            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{
                borderRadius: "12px",
                textTransform: "none",
                fontSize: "1rem",
                fontWeight: 600,
                padding: "14px",
                background: "linear-gradient(135deg, #26a69a 0%, #1e8a7f 100%)",
                boxShadow: "0 4px 12px rgba(38, 166, 154, 0.3)",
                transition: "all 0.2s ease",
                "&:hover": {
                  background: "linear-gradient(135deg, #1e8a7f 0%, #16665f 100%)",
                  transform: "translateY(-2px)",
                  boxShadow: "0 6px 16px rgba(38, 166, 154, 0.4)",
                },
              }}
            >
              Sign In
            </Button>

            <Divider sx={{ my: 3 }}>
              <Typography
                variant="body2"
                sx={{
                  color: "#546e7a",
                  px: 2,
                  fontSize: "0.875rem",
                  fontWeight: 500,
                }}
              >
                OR
              </Typography>
            </Divider>

            <Button
              fullWidth
              variant="outlined"
              onClick={handleGoogleSignIn}
              startIcon={<GoogleIcon />}
              sx={{
                borderRadius: "12px",
                borderColor: "rgba(38, 166, 154, 0.3)",
                color: "#1e293b",
                padding: "14px",
                textTransform: "none",
                fontSize: "1rem",
                fontWeight: 600,
                transition: "all 0.2s ease",
                "&:hover": {
                  borderColor: "#26a69a",
                  backgroundColor: "rgba(38, 166, 154, 0.05)",
                  transform: "translateY(-1px)",
                },
              }}
            >
              Sign in with Google
            </Button>
          </Box>

          <Typography
            sx={{
              textAlign: "center",
              color: "#546e7a",
              fontSize: "0.875rem",
              marginTop: "24px",
            }}
          >
            © 2025 M-Swasth. All rights reserved.
          </Typography>
        </Paper>
      </Container>
    </div>
  );
};

export default LoginPage;
