import React, { useState, useEffect, useRef, useCallback } from "react";
import ExoPhones from "./ExoPhones";
import ManualLeads from "./ManualLeads";
import InboundCalls from "./InboundCalls";
import CallHistory from "./CallHistory";
import DailyTaskForm from "./DailyTaskForm";
import {
  Box,
  Typography,
  Avatar,
  Tabs,
  Tab,
  Paper,
  Chip,
} from "@mui/material";
import {
  Person,
  Circle,
} from "@mui/icons-material";
import {
  doc,
  getDoc,
  collection,
  onSnapshot,
  updateDoc,
  setDoc,
} from "firebase/firestore";
import { db } from "../firebaseConfig";
import { THEME } from "../theme/theme";
import { useAgentStatus, AGENT_STATUS } from "../hooks/useAgentStatus";

// Status color mapping
const getStatusColor = (status) => {
  switch (status) {
    case AGENT_STATUS.AVAILABLE:
      return "#22c55e"; // Green
    case AGENT_STATUS.ON_CALL:
      return "#f59e0b"; // Orange/Amber
    case AGENT_STATUS.UNAVAILABLE:
    default:
      return "#ef4444"; // Red
  }
};

const AgentView = ({ currentUser, onStatusChange }) => {
  const [agent, setAgent] = useState(null);
  const [callLog, setCallLog] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  const unsubscribeRef = useRef(() => {});
  const isMountedRef = useRef(false);
  const timeoutRef = useRef(null);
  const isRevertingToIdle = useRef(false);

  // Helper function to get the correct collection name
  const getCollectionName = useCallback(() => {
    if (currentUser?.collection) {
      return currentUser.collection;
    }
    if (currentUser?.role === "teamlead") {
      return "mswasth";
    }
    if (currentUser?.role === "health_tl") {
      return "healthTeamLeads";
    }
    if (currentUser?.role === "healthAgent") {
      return "healthAgents";
    }
    return currentUser?.email?.split("@")[0] || "";
  }, [currentUser]);

  // Use the new status management hook
  const {
    status: agentStatus,
    setOnCall,
    setAvailableAfterCall,
    setUnavailable,
    recordActivity,
  } = useAgentStatus(
    currentUser?.uid,
    getCollectionName(),
    true // isLoggedIn - hook auto-sets to Available on mount
  );

  useEffect(() => {
    let mounted = true;

    const fetchAgentData = async () => {
      if (!currentUser || !currentUser.email || !currentUser.uid) {
        if (mounted) {
          setAgent(null);
          setLoading(false);
        }
        return;
      }

      const collectionName = getCollectionName();

      try {
        const userDocRef = doc(db, collectionName, currentUser.uid);
        const userDoc = await getDoc(userDocRef);
        if (mounted) {
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setAgent({
              ...userData,
              id: currentUser.uid,  // Keep Firebase UID as id (overwrites userData.id)
              customId: userData.id,  // Store custom ID separately
              status: "Idle",
            });

            await updateDoc(userDocRef, { status: "Idle" });
            onStatusChange(currentUser.uid, "Idle");
          } else {
            await setDoc(userDocRef, {
              name: currentUser.displayName || "Agent",
              email: currentUser.email,
              status: "Logged Out",
            });

            await updateDoc(userDocRef, { status: "Idle" });
            setAgent({
              id: currentUser.uid,
              name: currentUser.displayName || "Agent",
              email: currentUser.email,
              status: "Idle",
            });
            onStatusChange(currentUser.uid, "Idle");
          }
        }
      } catch (error) {
        if (mounted) setAgent(null);
      }
      if (mounted) setLoading(false);
    };

    fetchAgentData();

    isMountedRef.current = true;
    if (
      isMountedRef.current &&
      currentUser &&
      currentUser.email &&
      currentUser.uid
    ) {
      const collectionName = getCollectionName();

      const callLogsRef = collection(
        db,
        collectionName,
        currentUser.uid,
        "callLogs"
      );
      const agentDocRef = doc(db, collectionName, currentUser.uid);

      unsubscribeRef.current();

      const unsubscribeCallLogs = onSnapshot(
        callLogsRef,
        (snapshot) => {
          if (isMountedRef.current) {
            console.log(`[AgentView] Call logs snapshot received for ${collectionName}/${currentUser.uid}`);
            console.log(`[AgentView] Number of call logs:`, snapshot.docs.length);
            const logs = snapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            }));
            console.log(`[AgentView] Mapped call logs:`, logs);
            setCallLog(logs);
          }
        },
        (error) => {
          console.error(`[AgentView] Error fetching call logs:`, error);
        }
      );

      const unsubscribeAgentStatus = onSnapshot(
        agentDocRef,
        (docSnap) => {
          if (
            isMountedRef.current &&
            docSnap.exists() &&
            !isRevertingToIdle.current
          ) {
            const newStatus = docSnap.data().status || "Idle";
            setAgent((prev) => {
              if (prev && prev.status !== newStatus) {
                return { ...prev, status: newStatus };
              }
              return prev;
            });
          }
        },
        (error) => {}
      );

      unsubscribeRef.current = () => {
        unsubscribeCallLogs();
        unsubscribeAgentStatus();
      };
    }

    return () => {
      isMountedRef.current = false;
      unsubscribeRef.current();
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser, onStatusChange]);


  const startCall = useCallback(
    () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }

      // Use new status hook to set "On Call"
      setOnCall();
      onStatusChange(agent.id, AGENT_STATUS.ON_CALL);
    },
    [agent, onStatusChange, setOnCall]
  );

  const endCall = useCallback(() => {
    // Use new status hook to set back to "Available"
    setAvailableAfterCall();
    onStatusChange(agent?.id, AGENT_STATUS.AVAILABLE);
  }, [agent, onStatusChange, setAvailableAfterCall]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    // Record activity when agent interacts with tabs
    recordActivity();
  };

  // Set status to unavailable when component unmounts (logout)
  useEffect(() => {
    return () => {
      // This will run when the agent logs out / component unmounts
      setUnavailable();
    };
  }, [setUnavailable]);

  if (loading) {
    return <Typography>Loading agent data...</Typography>;
  }

  if (!agent) {
    return <Typography>No agent data available</Typography>;
  }

  return (
    <Box
      sx={{
        background: THEME.background,
        minHeight: "100vh",
        padding: "24px",
      }}
    >
      {/* Modern Header Section */}
      <Paper
        elevation={0}
        sx={{
          background: `linear-gradient(135deg, ${THEME.primary} 0%, #1e8a7f 100%)`,
          color: "#fff",
          padding: "32px",
          borderRadius: "16px",
          marginBottom: "24px",
          border: "none",
          boxShadow: `0 4px 20px ${THEME.primary}33`,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "20px",
          flexWrap: "wrap",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: "20px" }}>
          <Avatar
            sx={{
              width: 64,
              height: 64,
              background: "rgba(255, 255, 255, 0.2)",
              backdropFilter: "blur(10px)",
              border: "2px solid rgba(255, 255, 255, 0.3)",
            }}
          >
            <Person sx={{ fontSize: "32px", color: "#fff" }} />
          </Avatar>
          <Box>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 700,
                color: "#fff",
                margin: 0,
                fontSize: { xs: "1.5rem", md: "2rem" },
              }}
            >
              Welcome back, {agent.name}
            </Typography>
            <Typography
              variant="subtitle1"
              sx={{
                color: "rgba(255, 255, 255, 0.9)",
                margin: "4px 0 0 0",
                fontWeight: 500,
              }}
            >
              Ready to make some calls today?
            </Typography>
          </Box>
        </Box>

        {/* Real-time Status Indicator */}
        <Chip
          icon={<Circle sx={{ fontSize: "12px !important", color: getStatusColor(agentStatus) }} />}
          label={agentStatus}
          sx={{
            bgcolor: "rgba(255, 255, 255, 0.15)",
            backdropFilter: "blur(10px)",
            color: "#fff",
            fontWeight: 600,
            fontSize: "14px",
            padding: "8px 4px",
            height: "auto",
            border: `2px solid ${getStatusColor(agentStatus)}`,
            "& .MuiChip-icon": {
              color: getStatusColor(agentStatus),
              animation: agentStatus === AGENT_STATUS.ON_CALL ? "pulse 1.5s infinite" : "none",
            },
            "@keyframes pulse": {
              "0%": { opacity: 1 },
              "50%": { opacity: 0.4 },
              "100%": { opacity: 1 },
            },
          }}
        />
      </Paper>

      {/* Modern Tabs */}
      <Paper
        elevation={0}
        sx={{
          backgroundColor: THEME.cardBg,
          borderRadius: "16px",
          marginBottom: "24px",
          border: `1px solid ${THEME.primary}20`,
          overflow: "hidden",
        }}
      >
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            "& .MuiTab-root": {
              color: THEME.textSecondary,
              fontWeight: 600,
              fontSize: "14px",
              textTransform: "none",
              minHeight: "64px",
              transition: "all 0.3s ease",
              "&:hover": {
                color: THEME.primary,
                backgroundColor: `${THEME.primary}10`,
              },
              "&.Mui-selected": {
                color: THEME.primary,
                fontWeight: 700,
              },
            },
            "& .MuiTabs-indicator": {
              backgroundColor: THEME.primary,
              height: "3px",
              borderRadius: "3px 3px 0 0",
            },
          }}
        >
          <Tab label="Call History" />
          <Tab label="ExoPhones" />
          <Tab label="Manual Leads" />
          <Tab label="Inbound Calls" />
          {/* Daily Task tab - Only for Health Agents */}
          {(currentUser?.role === "Health Agent" ||
            currentUser?.role === "healthAgent" ||
            currentUser?.collection === "healthAgents") && (
            <Tab label="Daily Task" />
          )}
        </Tabs>
      </Paper>

      {/* Tab Content */}
      <Box sx={{ marginTop: "24px" }}>
        {tabValue === 0 && (
          <CallHistory callLogs={callLog} agentName={agent.name} />
        )}

        {tabValue === 1 && agent && currentUser && (
          <ExoPhones
            agentId={agent.id}
            agentCollection={getCollectionName()}
            onStartCall={startCall}
            onEndCall={endCall}
          />
        )}

        {tabValue === 2 && agent && currentUser && (
          <ManualLeads
            agentId={agent.id}
            agentCollection={getCollectionName()}
            onStartCall={startCall}
            onEndCall={endCall}
          />
        )}

        {tabValue === 3 && agent && currentUser && (
          <InboundCalls
            agentId={agent.id}
            agentCollection={getCollectionName()}
            agentName={agent.name}
          />
        )}

        {/* Daily Task tab content - Only for Health Agents */}
        {tabValue === 4 &&
          agent &&
          currentUser &&
          (currentUser?.role === "Health Agent" ||
            currentUser?.role === "healthAgent" ||
            currentUser?.collection === "healthAgents") && (
            <DailyTaskForm
              agentId={agent.id}
              agentName={agent.name}
              agentCollection={getCollectionName()}
              currentUser={currentUser}
            />
          )}
      </Box>
    </Box>
  );
};

export default AgentView;
