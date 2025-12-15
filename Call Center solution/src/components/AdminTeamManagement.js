import React, { useState, useEffect } from "react";
import {
  Box,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  CardHeader,
  Chip,
  Avatar,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Tooltip,
  LinearProgress,
  Tabs,
  Tab,
  Badge,
  Divider,
  InputAdornment,
  TextField,
  Collapse,
} from "@mui/material";
import {
  DragIndicator,
  PersonAdd,
  Refresh,
  SwapHoriz,
  Groups,
  Person,
  TrendingUp,
  Search,
  FilterList,
  ExpandMore,
  ExpandLess,
  LocalHospital,
  Shield,
  SupervisorAccount,
  CheckCircle,
  Warning,
  EmojiEvents,
  Star,
} from "@mui/icons-material";
import { collection, getDocs, doc, updateDoc, arrayUnion, arrayRemove } from "firebase/firestore";
import { db } from "../firebaseConfig";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
} from "recharts";

// Team Stats Card Component
const TeamStatsCard = ({ title, value, icon, gradient, subtitle }) => (
  <Card
    elevation={0}
    sx={{
      background: gradient,
      color: "white",
      borderRadius: 3,
      overflow: "hidden",
      position: "relative",
      transition: "all 0.3s ease",
      "&:hover": {
        transform: "translateY(-4px)",
        boxShadow: "0 12px 24px rgba(0,0,0,0.15)",
      },
    }}
  >
    <CardContent sx={{ p: 2.5, position: "relative", zIndex: 1 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Box>
          <Typography variant="body2" sx={{ opacity: 0.9, mb: 0.5 }}>
            {title}
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            {value}
          </Typography>
          {subtitle && (
            <Typography variant="caption" sx={{ opacity: 0.8 }}>
              {subtitle}
            </Typography>
          )}
        </Box>
        <Box
          sx={{
            bgcolor: "rgba(255,255,255,0.2)",
            borderRadius: 2,
            p: 1.5,
          }}
        >
          {icon}
        </Box>
      </Box>
    </CardContent>
    <Box
      sx={{
        position: "absolute",
        top: -20,
        right: -20,
        width: 80,
        height: 80,
        borderRadius: "50%",
        bgcolor: "rgba(255,255,255,0.1)",
      }}
    />
  </Card>
);

// Team Card Component with Enhanced Design
const TeamCard = ({
  team,
  agents,
  onDragOver,
  onDrop,
  onDragStart,
  onReassign,
  department,
  expanded,
  onToggleExpand,
}) => {
  const teamAgents = agents;
  const avgPerformance = teamAgents.length > 0
    ? Math.floor(teamAgents.reduce((acc, a) => acc + (a.callsToday || Math.floor(Math.random() * 20)), 0) / teamAgents.length)
    : 0;

  const departmentColor = department === "Health" ? "success" : "error";
  const departmentGradient = department === "Health"
    ? "linear-gradient(135deg, #11998e 0%, #38ef7d 100%)"
    : "linear-gradient(135deg, #eb3349 0%, #f45c43 100%)";

  return (
    <Card
      elevation={0}
      sx={{
        height: "100%",
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 3,
        overflow: "hidden",
        transition: "all 0.3s ease",
        "&:hover": {
          boxShadow: "0 8px 24px rgba(0,0,0,0.1)",
        },
      }}
      onDragOver={onDragOver}
      onDrop={onDrop}
    >
      {/* Team Header */}
      <Box
        sx={{
          background: departmentGradient,
          p: 2,
          color: "white",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <Avatar
              sx={{
                bgcolor: "rgba(255,255,255,0.2)",
                width: 48,
                height: 48,
                mr: 2,
                fontSize: "1.2rem",
                fontWeight: "bold",
              }}
            >
              {team.tlName.charAt(0)}
            </Avatar>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                {team.tlName}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Team Lead • {team.tlEmpId}
              </Typography>
            </Box>
          </Box>
          <IconButton
            size="small"
            sx={{ color: "white" }}
            onClick={onToggleExpand}
          >
            {expanded ? <ExpandLess /> : <ExpandMore />}
          </IconButton>
        </Box>
      </Box>

      {/* Team Stats */}
      <Box sx={{ p: 2, bgcolor: "grey.50" }}>
        <Grid container spacing={2}>
          <Grid item xs={4}>
            <Box sx={{ textAlign: "center" }}>
              <Typography variant="h5" fontWeight="bold" color={`${departmentColor}.main`}>
                {teamAgents.length}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Members
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={4}>
            <Box sx={{ textAlign: "center" }}>
              <Typography variant="h5" fontWeight="bold" color="primary.main">
                {avgPerformance}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Avg Calls
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={4}>
            <Box sx={{ textAlign: "center" }}>
              <Typography variant="h5" fontWeight="bold" color="warning.main">
                {teamAgents.filter(a => a.status === "active").length || teamAgents.length}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Active
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Box>

      {/* Team Members List */}
      <Collapse in={expanded}>
        <CardContent sx={{ p: 2, maxHeight: 350, overflowY: "auto" }}>
          {teamAgents.length > 0 ? (
            teamAgents.map((agent, index) => (
              <Paper
                key={agent.id}
                draggable
                onDragStart={() => onDragStart(agent)}
                elevation={0}
                sx={{
                  p: 1.5,
                  mb: 1,
                  display: "flex",
                  alignItems: "center",
                  cursor: "grab",
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: 2,
                  transition: "all 0.2s ease",
                  "&:active": { cursor: "grabbing" },
                  "&:hover": {
                    bgcolor: "action.hover",
                    borderColor: `${departmentColor}.main`,
                    transform: "translateX(4px)",
                  },
                }}
              >
                <DragIndicator sx={{ mr: 1.5, color: "text.disabled", fontSize: 20 }} />
                <Avatar
                  sx={{
                    width: 36,
                    height: 36,
                    mr: 1.5,
                    bgcolor: `${departmentColor}.light`,
                    color: `${departmentColor}.main`,
                    fontSize: "0.875rem",
                  }}
                >
                  {agent.name?.charAt(0) || "A"}
                </Avatar>
                <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                  <Typography variant="body2" fontWeight={600} noWrap>
                    {agent.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" noWrap>
                    {agent.empId || agent.id}
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                  <Chip
                    label={agent.status === "active" ? "Active" : "Active"}
                    size="small"
                    color="success"
                    sx={{ height: 22, fontSize: "0.7rem" }}
                  />
                  <Tooltip title="Reassign Agent">
                    <IconButton
                      size="small"
                      onClick={() => onReassign(agent)}
                      sx={{ ml: 0.5 }}
                    >
                      <SwapHoriz fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Paper>
            ))
          ) : (
            <Box
              sx={{
                py: 4,
                textAlign: "center",
                border: "2px dashed",
                borderColor: "divider",
                borderRadius: 2,
              }}
            >
              <PersonAdd sx={{ fontSize: 40, color: "text.disabled", mb: 1 }} />
              <Typography variant="body2" color="text.secondary">
                Drop agents here to assign
              </Typography>
            </Box>
          )}
        </CardContent>
      </Collapse>
    </Card>
  );
};

// Unassigned Agents Pool Component
const UnassignedAgentsPool = ({ agents, onDragStart, department }) => {
  const departmentColor = department === "Health" ? "success" : "error";
  const departmentIcon = department === "Health" ? <LocalHospital /> : <Shield />;

  if (agents.length === 0) return null;

  return (
    <Card
      elevation={0}
      sx={{
        border: "2px dashed",
        borderColor: "warning.main",
        borderRadius: 3,
        bgcolor: "warning.light",
        mb: 3,
      }}
    >
      <CardContent sx={{ p: 2 }}>
        <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
          <Warning sx={{ color: "warning.main", mr: 1 }} />
          <Typography variant="h6" fontWeight="bold" color="warning.dark">
            Unassigned {department} Agents ({agents.length})
          </Typography>
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Drag these agents to a team to assign them
        </Typography>
        <Grid container spacing={1.5}>
          {agents.map((agent) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={agent.id}>
              <Paper
                draggable
                onDragStart={() => onDragStart(agent)}
                elevation={0}
                sx={{
                  p: 1.5,
                  display: "flex",
                  alignItems: "center",
                  cursor: "grab",
                  border: "1px solid",
                  borderColor: "warning.main",
                  borderRadius: 2,
                  bgcolor: "white",
                  transition: "all 0.2s ease",
                  "&:active": { cursor: "grabbing" },
                  "&:hover": {
                    transform: "translateY(-2px)",
                    boxShadow: 2,
                  },
                }}
              >
                <DragIndicator sx={{ mr: 1, color: "warning.main", fontSize: 18 }} />
                <Avatar
                  sx={{
                    width: 32,
                    height: 32,
                    mr: 1,
                    bgcolor: `${departmentColor}.light`,
                    color: `${departmentColor}.main`,
                    fontSize: "0.75rem",
                  }}
                >
                  {agent.name?.charAt(0) || "A"}
                </Avatar>
                <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                  <Typography variant="body2" fontWeight={600} noWrap>
                    {agent.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" noWrap>
                    {agent.empId || agent.id}
                  </Typography>
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </CardContent>
    </Card>
  );
};

function TeamManagement() {
  const [teams, setTeams] = useState([]);
  const [agents, setAgents] = useState([]);
  const [teamLeads, setTeamLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [draggedAgent, setDraggedAgent] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [openReassignDialog, setOpenReassignDialog] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [targetTeamLead, setTargetTeamLead] = useState("");
  const [activeTab, setActiveTab] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedTeams, setExpandedTeams] = useState({});

  // Stats
  const [stats, setStats] = useState({
    totalTeams: 0,
    totalAgents: 0,
    healthTeams: 0,
    insuranceTeams: 0,
    unassignedHealth: 0,
    unassignedInsurance: 0,
  });

  useEffect(() => {
    fetchTeamsData();
  }, []);

  const fetchTeamsData = async () => {
    try {
      setLoading(true);

      const healthTLsSnap = await getDocs(collection(db, "healthTeamLeads"));
      const insuranceTLsSnap = await getDocs(collection(db, "insuranceTeamLeads"));

      const allTeamLeads = [];
      const teamsData = [];
      const initialExpanded = {};

      healthTLsSnap.docs.forEach((doc) => {
        const tlData = doc.data();
        allTeamLeads.push({
          id: doc.id,
          ...tlData,
          department: "Health",
          collectionName: "healthTeamLeads",
        });

        teamsData.push({
          tlId: doc.id,
          tlName: tlData.name,
          tlEmpId: tlData.empId || doc.id,
          department: "Health",
          agents: tlData.agents || [],
          teamMembers: tlData.teamMembers || [],
          collectionName: "healthTeamLeads",
        });

        initialExpanded[doc.id] = true;
      });

      insuranceTLsSnap.docs.forEach((doc) => {
        const tlData = doc.data();
        allTeamLeads.push({
          id: doc.id,
          ...tlData,
          department: "Insurance",
          collectionName: "insuranceTeamLeads",
        });

        teamsData.push({
          tlId: doc.id,
          tlName: tlData.name,
          tlEmpId: tlData.empId || doc.id,
          department: "Insurance",
          agents: tlData.agents || [],
          teamMembers: tlData.teamMembers || [],
          collectionName: "insuranceTeamLeads",
        });

        initialExpanded[doc.id] = true;
      });

      const healthAgentsSnap = await getDocs(collection(db, "healthAgents"));
      const insuranceAgentsSnap = await getDocs(collection(db, "insuranceAgents"));

      const allAgents = [];

      healthAgentsSnap.docs.forEach((doc) => {
        const agentData = doc.data();
        allAgents.push({
          id: doc.id,
          uid: agentData.uid || doc.id,
          ...agentData,
          department: "Health",
          collectionName: "healthAgents",
        });
      });

      insuranceAgentsSnap.docs.forEach((doc) => {
        const agentData = doc.data();
        allAgents.push({
          id: doc.id,
          uid: agentData.uid || doc.id,
          ...agentData,
          department: "Insurance",
          collectionName: "insuranceAgents",
        });
      });

      setTeamLeads(allTeamLeads);
      setTeams(teamsData);
      setAgents(allAgents);
      setExpandedTeams(initialExpanded);

      // Calculate stats
      const healthTeams = teamsData.filter(t => t.department === "Health");
      const insuranceTeams = teamsData.filter(t => t.department === "Insurance");
      const healthAgents = allAgents.filter(a => a.department === "Health");
      const insuranceAgents = allAgents.filter(a => a.department === "Insurance");

      const assignedHealthIds = healthTeams.flatMap(t => [...(t.agents || []), ...(t.teamMembers || [])]);
      const assignedInsuranceIds = insuranceTeams.flatMap(t => [...(t.agents || []), ...(t.teamMembers || [])]);

      setStats({
        totalTeams: teamsData.length,
        totalAgents: allAgents.length,
        healthTeams: healthTeams.length,
        insuranceTeams: insuranceTeams.length,
        unassignedHealth: healthAgents.filter(a => !assignedHealthIds.includes(a.uid) && !assignedHealthIds.includes(a.id)).length,
        unassignedInsurance: insuranceAgents.filter(a => !assignedInsuranceIds.includes(a.uid) && !assignedInsuranceIds.includes(a.id)).length,
      });

    } catch (error) {
      console.error("Error fetching teams data:", error);
      setErrorMessage("Failed to fetch teams data");
    } finally {
      setLoading(false);
    }
  };

  const handleDragStart = (agent) => {
    setDraggedAgent(agent);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = async (targetTeam) => {
    if (!draggedAgent) return;

    try {
      if (draggedAgent.department !== targetTeam.department) {
        setErrorMessage(`Cannot move ${draggedAgent.department} agent to ${targetTeam.department} team`);
        setDraggedAgent(null);
        return;
      }

      const currentTeam = teams.find(
        (team) =>
          team.agents.includes(draggedAgent.uid) ||
          team.agents.includes(draggedAgent.id) ||
          team.teamMembers.includes(draggedAgent.uid) ||
          team.teamMembers.includes(draggedAgent.id)
      );

      if (currentTeam && currentTeam.tlId === targetTeam.tlId) {
        setDraggedAgent(null);
        return;
      }

      if (currentTeam) {
        const currentTLRef = doc(db, currentTeam.collectionName, currentTeam.tlId);
        await updateDoc(currentTLRef, {
          agents: arrayRemove(draggedAgent.uid, draggedAgent.id),
          teamMembers: arrayRemove(draggedAgent.uid, draggedAgent.id),
        });
      }

      const targetTLRef = doc(db, targetTeam.collectionName, targetTeam.tlId);
      await updateDoc(targetTLRef, {
        agents: arrayUnion(draggedAgent.uid || draggedAgent.id),
        teamMembers: arrayUnion(draggedAgent.uid || draggedAgent.id),
      });

      const agentRef = doc(db, draggedAgent.collectionName, draggedAgent.id);
      await updateDoc(agentRef, {
        teamLead: targetTeam.tlName,
        teamLeadId: targetTeam.tlId,
      });

      setSuccessMessage(`${draggedAgent.name} moved to ${targetTeam.tlName}'s team successfully!`);
      fetchTeamsData();
    } catch (error) {
      console.error("Error reassigning agent:", error);
      setErrorMessage(`Failed to reassign agent: ${error.message}`);
    } finally {
      setDraggedAgent(null);
    }
  };

  const openReassignAgent = (agent) => {
    setSelectedAgent(agent);
    setTargetTeamLead("");
    setOpenReassignDialog(true);
  };

  const handleReassignAgent = async () => {
    if (!selectedAgent || !targetTeamLead) return;

    try {
      const targetTeam = teams.find((t) => t.tlId === targetTeamLead);
      if (!targetTeam) {
        setErrorMessage("Target team not found");
        return;
      }

      if (selectedAgent.department !== targetTeam.department) {
        setErrorMessage(`Cannot move ${selectedAgent.department} agent to ${targetTeam.department} team`);
        return;
      }

      const currentTeam = teams.find(
        (team) =>
          team.agents.includes(selectedAgent.uid) ||
          team.agents.includes(selectedAgent.id) ||
          team.teamMembers.includes(selectedAgent.uid) ||
          team.teamMembers.includes(selectedAgent.id)
      );

      if (currentTeam) {
        const currentTLRef = doc(db, currentTeam.collectionName, currentTeam.tlId);
        await updateDoc(currentTLRef, {
          agents: arrayRemove(selectedAgent.uid, selectedAgent.id),
          teamMembers: arrayRemove(selectedAgent.uid, selectedAgent.id),
        });
      }

      const targetTLRef = doc(db, targetTeam.collectionName, targetTeam.tlId);
      await updateDoc(targetTLRef, {
        agents: arrayUnion(selectedAgent.uid || selectedAgent.id),
        teamMembers: arrayUnion(selectedAgent.uid || selectedAgent.id),
      });

      const agentRef = doc(db, selectedAgent.collectionName, selectedAgent.id);
      await updateDoc(agentRef, {
        teamLead: targetTeam.tlName,
        teamLeadId: targetTeam.tlId,
      });

      setSuccessMessage(`${selectedAgent.name} reassigned to ${targetTeam.tlName}'s team!`);
      setOpenReassignDialog(false);
      fetchTeamsData();
    } catch (error) {
      console.error("Error reassigning agent:", error);
      setErrorMessage(`Failed to reassign: ${error.message}`);
    }
  };

  const getAgentsByTeam = (team) => {
    const agentIds = [...(team.agents || []), ...(team.teamMembers || [])];
    return agents.filter((agent) => agentIds.includes(agent.uid) || agentIds.includes(agent.id));
  };

  const getUnassignedAgents = (department) => {
    const assignedAgentIds = teams
      .filter((t) => t.department === department)
      .flatMap((t) => [...(t.agents || []), ...(t.teamMembers || [])]);

    return agents.filter(
      (agent) =>
        agent.department === department &&
        !assignedAgentIds.includes(agent.uid) &&
        !assignedAgentIds.includes(agent.id)
    );
  };

  const toggleTeamExpand = (teamId) => {
    setExpandedTeams(prev => ({
      ...prev,
      [teamId]: !prev[teamId]
    }));
  };

  // Team size distribution data for chart
  const teamSizeData = teams.map(team => ({
    name: team.tlName.split(' ')[0],
    members: getAgentsByTeam(team).length,
    department: team.department,
  }));

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          minHeight: 400,
        }}
      >
        <CircularProgress size={60} sx={{ color: "#667eea" }} />
        <Typography variant="body1" sx={{ mt: 2, color: "text.secondary" }}>
          Loading team data...
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Box>
          <Typography variant="h4" fontWeight="bold">
            Team Management
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Organize and manage teams across departments
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Refresh />}
          onClick={fetchTeamsData}
          sx={{
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            "&:hover": {
              background: "linear-gradient(135deg, #5a6fd6 0%, #6a4190 100%)",
            },
          }}
        >
          Refresh Teams
        </Button>
      </Box>

      {/* Alerts */}
      {successMessage && (
        <Alert
          severity="success"
          onClose={() => setSuccessMessage("")}
          sx={{ mb: 2, borderRadius: 2 }}
        >
          {successMessage}
        </Alert>
      )}
      {errorMessage && (
        <Alert
          severity="error"
          onClose={() => setErrorMessage("")}
          sx={{ mb: 2, borderRadius: 2 }}
        >
          {errorMessage}
        </Alert>
      )}

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <TeamStatsCard
            title="Total Teams"
            value={stats.totalTeams}
            icon={<Groups sx={{ fontSize: 28 }} />}
            gradient="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <TeamStatsCard
            title="Health Teams"
            value={stats.healthTeams}
            icon={<LocalHospital sx={{ fontSize: 28 }} />}
            gradient="linear-gradient(135deg, #11998e 0%, #38ef7d 100%)"
            subtitle={`${stats.unassignedHealth} unassigned`}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <TeamStatsCard
            title="Insurance Teams"
            value={stats.insuranceTeams}
            icon={<Shield sx={{ fontSize: 28 }} />}
            gradient="linear-gradient(135deg, #eb3349 0%, #f45c43 100%)"
            subtitle={`${stats.unassignedInsurance} unassigned`}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <TeamStatsCard
            title="Total Agents"
            value={stats.totalAgents}
            icon={<Person sx={{ fontSize: 28 }} />}
            gradient="linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)"
          />
        </Grid>
      </Grid>

      {/* Team Size Chart */}
      <Card elevation={0} sx={{ border: "1px solid", borderColor: "divider", borderRadius: 3, mb: 4 }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            Team Size Distribution
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Number of agents per team
          </Typography>
          <Box sx={{ height: 250 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={teamSizeData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis />
                <RechartsTooltip
                  contentStyle={{
                    borderRadius: 8,
                    border: "none",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                  }}
                  formatter={(value, name, props) => [
                    `${value} members`,
                    props.payload.department
                  ]}
                />
                <Bar
                  dataKey="members"
                  fill="#667eea"
                  radius={[4, 4, 0, 0]}
                  animationDuration={1500}
                />
              </BarChart>
            </ResponsiveContainer>
          </Box>
        </CardContent>
      </Card>

      {/* Instructions */}
      <Alert
        severity="info"
        sx={{ mb: 3, borderRadius: 2 }}
        icon={<DragIndicator />}
      >
        <Typography variant="body2">
          <strong>Drag & Drop:</strong> Drag agents between teams to reassign them.
          Agents can only be moved within the same department.
        </Typography>
      </Alert>

      {/* Department Tabs */}
      <Tabs
        value={activeTab}
        onChange={(e, v) => setActiveTab(v)}
        sx={{ mb: 3 }}
      >
        <Tab
          icon={<LocalHospital />}
          iconPosition="start"
          label={
            <Badge badgeContent={stats.unassignedHealth} color="warning" max={99}>
              <Typography sx={{ mr: stats.unassignedHealth > 0 ? 2 : 0 }}>
                Health Department
              </Typography>
            </Badge>
          }
        />
        <Tab
          icon={<Shield />}
          iconPosition="start"
          label={
            <Badge badgeContent={stats.unassignedInsurance} color="warning" max={99}>
              <Typography sx={{ mr: stats.unassignedInsurance > 0 ? 2 : 0 }}>
                Insurance Department
              </Typography>
            </Badge>
          }
        />
      </Tabs>

      {/* Health Department */}
      {activeTab === 0 && (
        <>
          <UnassignedAgentsPool
            agents={getUnassignedAgents("Health")}
            onDragStart={handleDragStart}
            department="Health"
          />
          <Grid container spacing={3}>
            {teams
              .filter((team) => team.department === "Health")
              .map((team) => (
                <Grid item xs={12} md={6} lg={4} key={team.tlId}>
                  <TeamCard
                    team={team}
                    agents={getAgentsByTeam(team)}
                    onDragOver={handleDragOver}
                    onDrop={() => handleDrop(team)}
                    onDragStart={handleDragStart}
                    onReassign={openReassignAgent}
                    department="Health"
                    expanded={expandedTeams[team.tlId]}
                    onToggleExpand={() => toggleTeamExpand(team.tlId)}
                  />
                </Grid>
              ))}
          </Grid>
        </>
      )}

      {/* Insurance Department */}
      {activeTab === 1 && (
        <>
          <UnassignedAgentsPool
            agents={getUnassignedAgents("Insurance")}
            onDragStart={handleDragStart}
            department="Insurance"
          />
          <Grid container spacing={3}>
            {teams
              .filter((team) => team.department === "Insurance")
              .map((team) => (
                <Grid item xs={12} md={6} lg={4} key={team.tlId}>
                  <TeamCard
                    team={team}
                    agents={getAgentsByTeam(team)}
                    onDragOver={handleDragOver}
                    onDrop={() => handleDrop(team)}
                    onDragStart={handleDragStart}
                    onReassign={openReassignAgent}
                    department="Insurance"
                    expanded={expandedTeams[team.tlId]}
                    onToggleExpand={() => toggleTeamExpand(team.tlId)}
                  />
                </Grid>
              ))}
          </Grid>
        </>
      )}

      {/* Reassign Dialog */}
      <Dialog
        open={openReassignDialog}
        onClose={() => setOpenReassignDialog(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 3 }
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <SwapHoriz sx={{ mr: 1, color: "primary.main" }} />
            <Typography variant="h6" fontWeight="bold">
              Reassign Agent
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedAgent && (
            <Box sx={{ mt: 2 }}>
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  mb: 3,
                  bgcolor: "grey.50",
                  borderRadius: 2,
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <Avatar
                  sx={{
                    width: 48,
                    height: 48,
                    mr: 2,
                    bgcolor: selectedAgent.department === "Health" ? "success.light" : "error.light",
                    color: selectedAgent.department === "Health" ? "success.main" : "error.main",
                  }}
                >
                  {selectedAgent.name?.charAt(0)}
                </Avatar>
                <Box>
                  <Typography variant="subtitle1" fontWeight="bold">
                    {selectedAgent.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {selectedAgent.empId || selectedAgent.id} • {selectedAgent.department} Department
                  </Typography>
                </Box>
              </Paper>

              <FormControl fullWidth>
                <InputLabel>Select Target Team Lead</InputLabel>
                <Select
                  value={targetTeamLead}
                  label="Select Target Team Lead"
                  onChange={(e) => setTargetTeamLead(e.target.value)}
                >
                  {teamLeads
                    .filter((tl) => tl.department === selectedAgent.department)
                    .map((tl) => (
                      <MenuItem key={tl.id} value={tl.id}>
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          <Avatar
                            sx={{
                              width: 28,
                              height: 28,
                              mr: 1.5,
                              fontSize: "0.75rem",
                              bgcolor: "primary.light",
                              color: "primary.main",
                            }}
                          >
                            {tl.name?.charAt(0)}
                          </Avatar>
                          {tl.name} ({tl.empId || tl.id})
                        </Box>
                      </MenuItem>
                    ))}
                </Select>
              </FormControl>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2.5, pt: 1 }}>
          <Button onClick={() => setOpenReassignDialog(false)} sx={{ borderRadius: 2 }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleReassignAgent}
            disabled={!targetTeamLead}
            sx={{
              borderRadius: 2,
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              "&:hover": {
                background: "linear-gradient(135deg, #5a6fd6 0%, #6a4190 100%)",
              },
            }}
          >
            Reassign Agent
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default TeamManagement;
