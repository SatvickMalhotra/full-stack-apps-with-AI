import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  Input,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import { ArrowBack } from "@mui/icons-material";
import {
  collection,
  writeBatch,
  doc,
  serverTimestamp,
  onSnapshot,
} from "firebase/firestore";
import { db } from "../firebaseConfig";

function AssignCalls() {
  const { collectionName, agentId } = useParams();
  const [selectedFile, setSelectedFile] = useState(null);
  const [message, setMessage] = useState("");
  const [assignedNumbers, setAssignedNumbers] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch assigned calls in real-time
    const assignedCallsRef = collection(
      db,
      collectionName,
      agentId,
      "assignedCalls"
    );
    const unsubscribe = onSnapshot(
      assignedCallsRef,
      (snapshot) => {
        const numbers = snapshot.docs.map((doc) => ({
          id: doc.id,
          clientNumber: doc.data().clientNumber,
          assignedAt: doc.data().assignedAt
            ? doc.data().assignedAt.toDate()
            : null,
        }));
        setAssignedNumbers(numbers);
      },
      (error) => {
        console.error("Error fetching assigned calls:", error);
        setMessage("Error loading assigned numbers.");
      }
    );

    return () => unsubscribe(); // Cleanup subscription
  }, [collectionName, agentId]);

  const handleBack = () => {
    navigate(-1);
  };

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
    setMessage("");
  };

  const handleAssign = async () => {
    if (!selectedFile) {
      setMessage("Please select a CSV file.");
      return;
    }

    const reader = new FileReader();
    reader.onload = async (event) => {
      const text = event.target.result;
      const lines = text
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter((line) => line);
      if (lines[0].toUpperCase() !== "NUMBERS") {
        setMessage("Invalid CSV format. First row should be 'NUMBERS'.");
        return;
      }
      const numbers = lines.slice(1);

      if (numbers.length === 0) {
        setMessage("No numbers found in the CSV.");
        return;
      }

      try {
        const batch = writeBatch(db);
        numbers.forEach((num) => {
          const newDocRef = doc(
            collection(db, collectionName, agentId, "assignedCalls")
          );
          batch.set(newDocRef, {
            clientNumber: num,
            assignedAt: serverTimestamp(),
          });
        });
        await batch.commit();
        setMessage(`Successfully assigned ${numbers.length} numbers.`);
        setSelectedFile(null);
      } catch (error) {
        console.error("Error assigning calls:", error);
        setMessage("Error assigning calls. Please try again.");
      }
    };
    reader.readAsText(selectedFile);
  };

  const downloadTemplate = () => {
    const csvContent = "NUMBERS\n9385739187\n7292749222\n9837773561\n";
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "csv_template.csv");
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Box sx={{ padding: 3, backgroundColor: "#f5f5f5", minHeight: "100vh" }}>
      <Button
        onClick={handleBack}
        startIcon={<ArrowBack />}
        sx={{ marginBottom: 2 }}
      >
        Back to Agent Details
      </Button>
      <Typography variant="h4" gutterBottom>
        Assign Calls to Agent {agentId}
      </Typography>
      <Button
        onClick={downloadTemplate}
        variant="outlined"
        sx={{ marginBottom: 2 }}
      >
        Download CSV Template
      </Button>
      <Input
        type="file"
        accept=".csv"
        onChange={handleFileChange}
        sx={{ marginBottom: 2, display: "block" }}
      />
      <Button
        onClick={handleAssign}
        variant="contained"
        disabled={!selectedFile}
        sx={{ marginBottom: 2 }}
      >
        Assign Numbers
      </Button>
      {message && (
        <Typography
          color={message.startsWith("Error") ? "error" : "success"}
          sx={{ marginBottom: 2 }}
        >
          {message}
        </Typography>
      )}
      <Typography variant="h6" gutterBottom>
        Assigned Numbers
      </Typography>
      <List>
        {assignedNumbers.length === 0 ? (
          <ListItem>
            <ListItemText primary="No numbers assigned yet." />
          </ListItem>
        ) : (
          assignedNumbers.map((number) => (
            <ListItem key={number.id}>
              <ListItemText
                primary={number.clientNumber}
                secondary={
                  number.assignedAt
                    ? `Assigned at: ${number.assignedAt.toLocaleString(
                        "en-IN",
                        { timeZone: "Asia/Kolkata" }
                      )}`
                    : "Assign time unavailable"
                }
              />
            </ListItem>
          ))
        )}
      </List>
    </Box>
  );
}

export default AssignCalls;