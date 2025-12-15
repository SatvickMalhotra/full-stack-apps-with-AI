import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Container,
  Alert,
  InputAdornment,
  IconButton,
  CircularProgress,
} from "@mui/material";
import { Visibility, VisibilityOff, AdminPanelSettings } from "@mui/icons-material";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../firebaseConfig";
import { doc, getDoc } from "firebase/firestore";

function AdminLogin({ onAdminLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Sign in with Firebase
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Check if user is an admin
      const adminDoc = await getDoc(doc(db, "admin", user.uid));

      if (adminDoc.exists()) {
        // User is an admin
        sessionStorage.setItem("adminAuthenticated", "true");
        sessionStorage.setItem("adminUid", user.uid);
        sessionStorage.setItem("adminEmail", email);
        sessionStorage.setItem("adminLoginId", email);

        if (onAdminLogin) {
          onAdminLogin({ email, uid: user.uid, role: "admin" });
        }

        navigate("/admin/dashboard");
      } else {
        // Not an admin
        await auth.signOut();
        setError("Access denied. Admin privileges required.");
      }
    } catch (err) {
      console.error("Admin login error:", err);
      if (err.code === "auth/invalid-credential" || err.code === "auth/wrong-password") {
        setError("Invalid email or password.");
      } else if (err.code === "auth/user-not-found") {
        setError("No admin account found with this email.");
      } else if (err.code === "auth/invalid-email") {
        setError("Invalid email format.");
      } else {
        setError("Login failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={10}
          sx={{
            p: 4,
            borderRadius: 3,
            background: "rgba(255, 255, 255, 0.95)",
          }}
        >
          <Box sx={{ textAlign: "center", mb: 3 }}>
            <AdminPanelSettings
              sx={{ fontSize: 60, color: "#667eea", mb: 1 }}
            />
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              Admin Portal
            </Typography>
            <Typography variant="body1" color="text.secondary">
              System Management Console
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleLogin}>
            <TextField
              fullWidth
              label="Admin Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              margin="normal"
              required
              autoComplete="username"
              disabled={loading}
              sx={{ mb: 2 }}
            />

            <TextField
              fullWidth
              label="Password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              margin="normal"
              required
              autoComplete="current-password"
              disabled={loading}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                      disabled={loading}
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 3 }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={loading}
              sx={{
                py: 1.5,
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                "&:hover": {
                  background: "linear-gradient(135deg, #5568d3 0%, #6a3f8f 100%)",
                },
                "&:disabled": {
                  background: "rgba(102, 126, 234, 0.5)",
                },
              }}
            >
              {loading ? (
                <CircularProgress size={24} sx={{ color: "white" }} />
              ) : (
                "Login to Admin Portal"
              )}
            </Button>
          </form>

          <Box sx={{ mt: 3, textAlign: "center" }}>
            <Typography variant="caption" color="text.secondary">
              Authorized Personnel Only
            </Typography>
            <Alert severity="info" sx={{ mt: 2, textAlign: "left" }}>
              <Typography variant="caption">
                <strong>Note:</strong> Admin access requires a Firebase account in the 'admin' collection.
                Contact system administrator to set up admin credentials.
              </Typography>
            </Alert>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}

export default AdminLogin;
