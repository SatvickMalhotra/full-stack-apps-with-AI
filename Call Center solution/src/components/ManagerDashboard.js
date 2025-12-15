import React, { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Box,
  Tabs,
  Tab,
  AppBar,
  Typography,
  Grid,
  Card,
  CardContent,
  IconButton,
  Tooltip,
  Avatar,
  Chip,
  LinearProgress,
  CircularProgress,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Badge,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import {
  Business,
  LocalHospital,
  Analytics,
  DirectionsWalk,
  Dashboard as DashboardIcon,
  Refresh,
  Menu as MenuIcon,
  Close,
  TrendingUp,
  People,
  Fullscreen,
  FullscreenExit,
  Notifications,
} from "@mui/icons-material";
import { collection, onSnapshot, doc, getDoc, query, orderBy, getDocs } from "firebase/firestore";
import { db } from "../firebaseConfig";
import InsuranceManagerDashboard from "./InsuranceManagerDashboard";
import HealthManagerDashboard from "./HealthManagerDashboard";
import CallAnalytics from "./CallAnalytics";
import OfflineVisitsManager from "./OfflineVisitsManager";

// Animated Counter Hook
const useAnimatedCounter = (end, duration = 1500) => {
  const [count, setCount] = useState(0);
  const countRef = useRef(null);

  useEffect(() => {
    if (end === 0) {
      setCount(0);
      return;
    }

    const startTime = Date.now();
    const startValue = 0;

    const animate = () => {
      const now = Date.now();
      const progress = Math.min((now - startTime) / duration, 1);
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const currentValue = Math.floor(startValue + (end - startValue) * easeOut);

      setCount(currentValue);

      if (progress < 1) {
        countRef.current = requestAnimationFrame(animate);
      }
    };

    countRef.current = requestAnimationFrame(animate);

    return () => {
      if (countRef.current) {
        cancelAnimationFrame(countRef.current);
      }
    };
  }, [end, duration]);

  return count;
};

// Quick Stats Card Component
const QuickStatCard = ({ title, value, icon, gradient, subtitle, trend }) => {
  const animatedValue = useAnimatedCounter(value);

  return (
    <Card
      elevation={0}
      sx={{
        background: gradient,
        color: "white",
        borderRadius: 3,
        overflow: "hidden",
        position: "relative",
        transition: "all 0.3s ease",
        cursor: "pointer",
        "&:hover": {
          transform: "translateY(-6px)",
          boxShadow: "0 16px 32px rgba(0,0,0,0.15)",
        },
      }}
    >
      <CardContent sx={{ p: 2.5, position: "relative", zIndex: 1 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <Box>
            <Typography variant="caption" sx={{ opacity: 0.9, fontWeight: 500, letterSpacing: 0.5 }}>
              {title}
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 700, my: 0.5 }}>
              {animatedValue}
            </Typography>
            {subtitle && (
              <Chip
                label={subtitle}
                size="small"
                sx={{
                  bgcolor: "rgba(255,255,255,0.2)",
                  color: "white",
                  fontWeight: 600,
                  fontSize: "0.65rem",
                  height: 22,
                }}
              />
            )}
          </Box>
          <Avatar
            sx={{
              bgcolor: "rgba(255,255,255,0.2)",
              width: 48,
              height: 48,
            }}
          >
            {icon}
          </Avatar>
        </Box>
        {trend && (
          <Box sx={{ display: "flex", alignItems: "center", mt: 1 }}>
            <TrendingUp sx={{ fontSize: 14, mr: 0.5 }} />
            <Typography variant="caption" sx={{ fontWeight: 600 }}>
              {trend}
            </Typography>
          </Box>
        )}
      </CardContent>
      {/* Decorative elements */}
      <Box
        sx={{
          position: "absolute",
          top: -20,
          right: -20,
          width: 100,
          height: 100,
          borderRadius: "50%",
          bgcolor: "rgba(255,255,255,0.1)",
        }}
      />
      <Box
        sx={{
          position: "absolute",
          bottom: -30,
          right: 30,
          width: 60,
          height: 60,
          borderRadius: "50%",
          bgcolor: "rgba(255,255,255,0.08)",
        }}
      />
    </Card>
  );
};

// Department Tab Panel
const TabPanel = ({ children, value, index, ...other }) => (
  <div
    role="tabpanel"
    hidden={value !== index}
    id={`department-tabpanel-${index}`}
    aria-labelledby={`department-tab-${index}`}
    {...other}
  >
    {value === index && <Box>{children}</Box>}
  </div>
);

// Department Gradients
const DEPARTMENT_GRADIENTS = {
  insurance: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  health: "linear-gradient(135deg, #11998e 0%, #38ef7d 100%)",
  analytics: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
  offline: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
};

const DEPARTMENT_COLORS = {
  insurance: "#667eea",
  health: "#11998e",
  analytics: "#f093fb",
  offline: "#4facfe",
};

/**
 * Super Manager Dashboard - Revamped
 * Modern UI with animations, charts, and enhanced visualizations
 */
function ManagerDashboard({ currentUser }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get("tab");
  const initialTab = tabParam ? parseInt(tabParam, 10) : 0;

  const [selectedTab, setSelectedTab] = useState(initialTab);
  const [allCallLogs, setAllCallLogs] = useState([]);
  const [allAgents, setAllAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [quickStats, setQuickStats] = useState({
    totalAgents: 0,
    totalCalls: 0,
    connectedCalls: 0,
    activeUsers: 0,
    healthAgents: 0,
    insuranceAgents: 0,
    dcAgents: 0,
    totalManagers: 0,
  });
  const [offlineVisitsData, setOfflineVisitsData] = useState({
    users: [],
    visitLogs: [],
    manualCallLogs: [],
    trips: [],
  });

  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
    setSearchParams({ tab: newValue.toString() });
    setMobileMenuOpen(false);
  };

  // Toggle fullscreen
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  // Fetch quick stats
  const fetchQuickStats = async () => {
    try {
      const [
        healthAgentsSnap,
        healthTLsSnap,
        insuranceAgentsSnap,
        insuranceTLsSnap,
        dcAgentsSnap,
        managersSnap,
      ] = await Promise.all([
        getDocs(collection(db, "healthAgents")),
        getDocs(collection(db, "healthTeamLeads")),
        getDocs(collection(db, "insuranceAgents")),
        getDocs(collection(db, "insuranceTeamLeads")),
        getDocs(collection(db, "offlineVisits")),
        getDocs(collection(db, "managers")),
      ]);

      const healthCount = healthAgentsSnap.size + healthTLsSnap.size;
      const insuranceCount = insuranceAgentsSnap.size + insuranceTLsSnap.size;
      const dcCount = dcAgentsSnap.size;
      const managersCount = managersSnap.size;

      // Count active users (Available, On Call, or legacy statuses)
      let activeCount = 0;
      [healthAgentsSnap, healthTLsSnap, insuranceAgentsSnap, insuranceTLsSnap, dcAgentsSnap].forEach(snap => {
        snap.docs.forEach(doc => {
          const data = doc.data();
          // New status values: Available, On Call
          // Legacy: Login, active, Idle, Busy
          if (data.status === "Available" || data.status === "On Call" ||
              data.status === "Login" || data.status === "active" ||
              data.status === "Idle" || data.status === "Busy") {
            activeCount++;
          }
        });
      });

      setQuickStats({
        totalAgents: healthCount + insuranceCount + dcCount,
        healthAgents: healthCount,
        insuranceAgents: insuranceCount,
        dcAgents: dcCount,
        totalManagers: managersCount,
        activeUsers: activeCount,
        totalCalls: allCallLogs.length,
        connectedCalls: allCallLogs.filter(log => log.callConnected || log.status === "completed").length,
      });
    } catch (error) {
      console.error("Error fetching quick stats:", error);
    }
  };

  // Sync tab state with URL parameter
  useEffect(() => {
    const tabParam = searchParams.get("tab");
    if (tabParam !== null) {
      const tabIndex = parseInt(tabParam, 10);
      if (!isNaN(tabIndex) && tabIndex !== selectedTab) {
        setSelectedTab(tabIndex);
      }
    }
  }, [searchParams, selectedTab]);

  // Fetch all call logs and agents for analytics
  useEffect(() => {
    let mounted = true;
    if (!currentUser || !currentUser.uid) {
      setLoading(false);
      return;
    }

    const fetchAllData = async () => {
      try {
        setLoading(true);
        const userDoc = await getDoc(doc(db, "admin", currentUser.uid));
        if (userDoc.exists() && userDoc.data().role === "manager") {
          const agentCollections = ["insuranceAgents", "healthAgents"];
          const tlCollections = ["insuranceTeamLeads", "healthTeamLeads"];

          const allUnsubscribes = [];
          const aggregatedCallLogs = [];
          const aggregatedAgents = [];

          // Fetch Offline Visits data
          const offlineVisitsRef = collection(db, "offlineVisits");
          const offlineVisitsUnsubscribe = onSnapshot(offlineVisitsRef, (snapshot) => {
            if (!mounted) return;
            const users = [];
            const visitLogs = [];
            const manualCallLogs = [];
            const trips = [];

            snapshot.docs.forEach((userDoc) => {
              const userData = userDoc.data();
              const userId = userDoc.id;

              users.push({
                id: userId,
                ...userData,
              });

              // Listen to offline visits subcollection
              const visitsRef = collection(db, "offlineVisits", userId, "offlineVisits");
              const visitsQuery = query(visitsRef, orderBy("timestamp", "desc"));
              const visitsUnsubscribe = onSnapshot(visitsQuery, (visitsSnapshot) => {
                if (!mounted) return;
                visitsSnapshot.docs.forEach((visitDoc) => {
                  visitLogs.push({
                    id: visitDoc.id,
                    userId,
                    userName: userData.name,
                    userEmpId: userData.empId,
                    ...visitDoc.data(),
                  });
                });
                setOfflineVisitsData((prev) => ({
                  ...prev,
                  visitLogs: [...visitLogs],
                }));
              });
              allUnsubscribes.push(visitsUnsubscribe);

              // Listen to visitLogs subcollection (for DC agents)
              const dcVisitLogsRef = collection(db, "offlineVisits", userId, "visitLogs");
              const dcVisitLogsQuery = query(dcVisitLogsRef, orderBy("createdAt", "desc"));
              const dcVisitLogsUnsubscribe = onSnapshot(dcVisitLogsQuery, (dcVisitsSnapshot) => {
                if (!mounted) return;
                dcVisitsSnapshot.docs.forEach((visitDoc) => {
                  visitLogs.push({
                    id: visitDoc.id,
                    userId,
                    userName: userData.name,
                    userEmpId: userData.empId,
                    ...visitDoc.data(),
                  });
                });
                setOfflineVisitsData((prev) => ({
                  ...prev,
                  visitLogs: [...visitLogs],
                }));
              });
              allUnsubscribes.push(dcVisitLogsUnsubscribe);

              // Listen to manual call logs subcollection
              const manualLogsRef = collection(db, "offlineVisits", userId, "manualCallLogs");
              const manualLogsQuery = query(manualLogsRef, orderBy("timestamp", "desc"));
              const manualLogsUnsubscribe = onSnapshot(manualLogsQuery, (logsSnapshot) => {
                if (!mounted) return;
                logsSnapshot.docs.forEach((logDoc) => {
                  manualCallLogs.push({
                    id: logDoc.id,
                    userId,
                    userName: userData.name,
                    userEmpId: userData.empId,
                    ...logDoc.data(),
                  });
                });
                setOfflineVisitsData((prev) => ({
                  ...prev,
                  manualCallLogs: [...manualCallLogs],
                }));
              });
              allUnsubscribes.push(manualLogsUnsubscribe);

              // Listen to trips subcollection
              const tripsRef = collection(db, "offlineVisits", userId, "trips");
              const tripsQuery = query(tripsRef, orderBy("startTime", "desc"));
              const tripsUnsubscribe = onSnapshot(tripsQuery, (tripsSnapshot) => {
                if (!mounted) return;
                tripsSnapshot.docs.forEach((tripDoc) => {
                  trips.push({
                    id: tripDoc.id,
                    userId,
                    userName: userData.name,
                    userEmpId: userData.empId,
                    ...tripDoc.data(),
                  });
                });
                setOfflineVisitsData((prev) => ({
                  ...prev,
                  trips: [...trips],
                }));
              });
              allUnsubscribes.push(tripsUnsubscribe);
            });

            setOfflineVisitsData((prev) => ({
              ...prev,
              users,
            }));
          });
          allUnsubscribes.push(offlineVisitsUnsubscribe);

          // Fetch TL data
          tlCollections.forEach((tlCollection) => {
            const tlRef = collection(db, tlCollection);
            const tlUnsubscribe = onSnapshot(tlRef, (snapshot) => {
              if (!mounted) return;
              snapshot.docs.forEach((tlDoc) => {
                const tlData = tlDoc.data();
                const tlId = tlDoc.id;

                aggregatedAgents.push({
                  id: tlId,
                  collection: tlCollection,
                  name: tlData.name || "Unknown TL",
                  department: tlData.department || "Team Lead",
                });

                const tlCallLogsRef = collection(db, tlCollection, tlId, "callLogs");
                const tlLogsUnsubscribe = onSnapshot(tlCallLogsRef, (logsSnapshot) => {
                  if (!mounted) return;
                  logsSnapshot.docs.forEach((log) => {
                    const data = log.data();
                    aggregatedCallLogs.push({
                      id: log.id,
                      ...data,
                      timestamp: data.timestamp?.toDate?.() || new Date(data.timestamp),
                      agentId: tlId,
                      agentName: tlData.name,
                      collectionName: tlCollection,
                    });
                  });
                  setAllCallLogs([...aggregatedCallLogs]);
                });
                allUnsubscribes.push(tlLogsUnsubscribe);
              });
              setAllAgents([...aggregatedAgents]);
            });
            allUnsubscribes.push(tlUnsubscribe);
          });

          // Fetch agent collections
          agentCollections.forEach((collectionName) => {
            const agentsRef = collection(db, collectionName);
            const unsubscribe = onSnapshot(agentsRef, (snapshot) => {
              if (!mounted) return;
              snapshot.docs.forEach((agentDoc) => {
                const agentData = agentDoc.data();
                const agentId = agentDoc.id;

                aggregatedAgents.push({
                  id: agentId,
                  collection: collectionName,
                  name: agentData.name || "Unknown Agent",
                  department: agentData.department || "Unknown",
                });

                const callLogsRef = collection(db, collectionName, agentId, "callLogs");
                const logsUnsubscribe = onSnapshot(callLogsRef, (logsSnapshot) => {
                  if (!mounted) return;
                  logsSnapshot.docs.forEach((log) => {
                    const data = log.data();
                    aggregatedCallLogs.push({
                      id: log.id,
                      ...data,
                      timestamp: data.timestamp?.toDate?.() || new Date(data.timestamp),
                      agentId,
                      agentName: agentData.name,
                      collectionName,
                    });
                  });
                  setAllCallLogs([...aggregatedCallLogs]);
                });
                allUnsubscribes.push(logsUnsubscribe);
              });
              setAllAgents([...aggregatedAgents]);
            });
            allUnsubscribes.push(unsubscribe);
          });

          // Fetch quick stats
          await fetchQuickStats();
          setLoading(false);

          return () => allUnsubscribes.forEach((unsub) => unsub());
        } else {
          setLoading(false);
        }
      } catch (error) {
        console.error("Error fetching analytics data:", error);
        setLoading(false);
      }
    };

    fetchAllData();

    return () => {
      mounted = false;
    };
  }, [currentUser]);

  // Update quick stats when call logs change
  useEffect(() => {
    if (allCallLogs.length > 0) {
      setQuickStats(prev => ({
        ...prev,
        totalCalls: allCallLogs.length,
        connectedCalls: allCallLogs.filter(log => log.callConnected || log.status === "completed").length,
      }));
    }
  }, [allCallLogs]);

  // Handle refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchQuickStats();
    setTimeout(() => setRefreshing(false), 1000);
  };

  // Department tabs configuration
  const departmentTabs = [
    {
      label: "Insurance",
      icon: <Business />,
      color: DEPARTMENT_COLORS.insurance,
      gradient: DEPARTMENT_GRADIENTS.insurance,
      bgHover: "#eff6ff",
    },
    {
      label: "Health",
      icon: <LocalHospital />,
      color: DEPARTMENT_COLORS.health,
      gradient: DEPARTMENT_GRADIENTS.health,
      bgHover: "#f0fdf4",
    },
    {
      label: "Call Analytics",
      icon: <Analytics />,
      color: DEPARTMENT_COLORS.analytics,
      gradient: DEPARTMENT_GRADIENTS.analytics,
      bgHover: "#fdf2f8",
    },
    {
      label: "Offline Visits",
      icon: <DirectionsWalk />,
      color: DEPARTMENT_COLORS.offline,
      gradient: DEPARTMENT_GRADIENTS.offline,
      bgHover: "#f0f9ff",
    },
  ];

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        }}
      >
        <CircularProgress size={60} sx={{ color: "white", mb: 3 }} />
        <Typography variant="h6" sx={{ color: "white", fontWeight: 500 }}>
          Loading Super Manager Dashboard...
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f8fafc" }}>
      {/* Modern App Bar */}
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          bgcolor: "white",
          borderBottom: "1px solid",
          borderColor: "divider",
        }}
      >
        {/* Top Header with Title and Actions */}
        <Box
          sx={{
            px: 3,
            py: 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderBottom: "1px solid",
            borderColor: "divider",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            {isMobile && (
              <IconButton onClick={() => setMobileMenuOpen(true)}>
                <MenuIcon />
              </IconButton>
            )}
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: 2,
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <DashboardIcon sx={{ color: "white", fontSize: 28 }} />
            </Box>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 700, color: "#0f172a" }}>
                Super Manager Dashboard
              </Typography>
              <Typography variant="caption" sx={{ color: "#64748b" }}>
                Real-time monitoring and analytics
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Tooltip title="Refresh Data">
              <IconButton
                onClick={handleRefresh}
                sx={{
                  bgcolor: refreshing ? "primary.light" : "transparent",
                  animation: refreshing ? "spin 1s linear infinite" : "none",
                  "@keyframes spin": {
                    "0%": { transform: "rotate(0deg)" },
                    "100%": { transform: "rotate(360deg)" },
                  },
                }}
              >
                <Refresh />
              </IconButton>
            </Tooltip>
            <Tooltip title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}>
              <IconButton onClick={toggleFullscreen}>
                {isFullscreen ? <FullscreenExit /> : <Fullscreen />}
              </IconButton>
            </Tooltip>
            <Tooltip title="Notifications">
              <IconButton>
                <Badge badgeContent={3} color="error">
                  <Notifications />
                </Badge>
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {/* Quick Stats Row */}
        <Box sx={{ px: 3, py: 2, bgcolor: "#f8fafc" }}>
          <Grid container spacing={2}>
            <Grid item xs={6} sm={3}>
              <QuickStatCard
                title="TOTAL AGENTS"
                value={quickStats.totalAgents}
                icon={<People sx={{ fontSize: 24, color: "white" }} />}
                gradient={DEPARTMENT_GRADIENTS.insurance}
                subtitle={`${quickStats.activeUsers} Active`}
              />
            </Grid>
            <Grid item xs={6} sm={3}>
              <QuickStatCard
                title="HEALTH DEPT"
                value={quickStats.healthAgents}
                icon={<LocalHospital sx={{ fontSize: 24, color: "white" }} />}
                gradient={DEPARTMENT_GRADIENTS.health}
              />
            </Grid>
            <Grid item xs={6} sm={3}>
              <QuickStatCard
                title="INSURANCE DEPT"
                value={quickStats.insuranceAgents}
                icon={<Business sx={{ fontSize: 24, color: "white" }} />}
                gradient="linear-gradient(135deg, #f093fb 0%, #f5576c 100%)"
              />
            </Grid>
            <Grid item xs={6} sm={3}>
              <QuickStatCard
                title="DC AGENTS"
                value={quickStats.dcAgents}
                icon={<DirectionsWalk sx={{ fontSize: 24, color: "white" }} />}
                gradient={DEPARTMENT_GRADIENTS.offline}
              />
            </Grid>
          </Grid>
        </Box>

        {/* Department Tabs */}
        {!isMobile && (
          <Box sx={{ px: 3, bgcolor: "white" }}>
            <Tabs
              value={selectedTab}
              onChange={handleTabChange}
              sx={{
                "& .MuiTab-root": {
                  textTransform: "none",
                  fontWeight: 600,
                  fontSize: "0.95rem",
                  minHeight: 56,
                  color: "#64748b",
                  px: 3,
                  transition: "all 0.3s ease",
                  borderRadius: "12px 12px 0 0",
                  mr: 1,
                  "&.Mui-selected": {
                    color: departmentTabs[selectedTab]?.color || "#667eea",
                    bgcolor: departmentTabs[selectedTab]?.bgHover || "#f8fafc",
                  },
                  "&:hover": {
                    bgcolor: "#f1f5f9",
                  },
                },
                "& .MuiTabs-indicator": {
                  backgroundColor: departmentTabs[selectedTab]?.color || "#667eea",
                  height: 3,
                  borderRadius: "3px 3px 0 0",
                },
              }}
            >
              {departmentTabs.map((tab, index) => (
                <Tab
                  key={index}
                  icon={tab.icon}
                  iconPosition="start"
                  label={tab.label}
                />
              ))}
            </Tabs>
          </Box>
        )}
      </AppBar>

      {/* Mobile Drawer */}
      <Drawer
        anchor="left"
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        PaperProps={{
          sx: { width: 280, borderRadius: "0 16px 16px 0" },
        }}
      >
        <Box sx={{ p: 2 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
            <Typography variant="h6" fontWeight="bold">
              Departments
            </Typography>
            <IconButton onClick={() => setMobileMenuOpen(false)}>
              <Close />
            </IconButton>
          </Box>
          <Divider sx={{ mb: 2 }} />
          <List>
            {departmentTabs.map((tab, index) => (
              <ListItem
                button
                key={index}
                selected={selectedTab === index}
                onClick={() => handleTabChange(null, index)}
                sx={{
                  borderRadius: 2,
                  mb: 1,
                  "&.Mui-selected": {
                    bgcolor: tab.bgHover,
                    "& .MuiListItemIcon-root": {
                      color: tab.color,
                    },
                    "& .MuiListItemText-primary": {
                      color: tab.color,
                      fontWeight: 600,
                    },
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: 40 }}>{tab.icon}</ListItemIcon>
                <ListItemText primary={tab.label} />
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>

      {/* Loading Progress */}
      {refreshing && <LinearProgress sx={{ position: "absolute", top: 0, left: 0, right: 0 }} />}

      {/* Tab Content */}
      <Box sx={{ p: { xs: 2, md: 3 } }}>
        <TabPanel value={selectedTab} index={0}>
          <InsuranceManagerDashboard currentUser={currentUser} />
        </TabPanel>
        <TabPanel value={selectedTab} index={1}>
          <HealthManagerDashboard currentUser={currentUser} />
        </TabPanel>
        <TabPanel value={selectedTab} index={2}>
          <CallAnalytics
            callLogs={allCallLogs}
            agents={allAgents}
            onBack={() => setSelectedTab(0)}
          />
        </TabPanel>
        <TabPanel value={selectedTab} index={3}>
          <OfflineVisitsManager offlineVisitsData={offlineVisitsData} />
        </TabPanel>
      </Box>
    </Box>
  );
}

export default ManagerDashboard;
