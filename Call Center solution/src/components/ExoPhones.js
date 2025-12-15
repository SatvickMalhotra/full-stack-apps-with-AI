import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  collection,
  query,
  getDocs,
  addDoc,
  onSnapshot,
  doc,
  getDoc,
} from "firebase/firestore";
import { db } from "../firebaseConfig";
import API_BASE_URL from "../config/api";
import "./ExoPhones.css";

const ACCOUNT_SID = process.env.REACT_APP_ACCOUNT_SID;

function ExoPhones({ agentId, agentCollection }) {
  const [exotelPhones, setExotelPhones] = useState([]);
  const [assignedCalls, setAssignedCalls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [manualNumberInput, setManualNumberInput] = useState("");
  const [selectedExotelPhoneInput, setSelectedExotelPhoneInput] = useState("");
  const [globalManualNumber, setGlobalManualNumber] = useState("");
  const [globalSelectedExotelPhone, setGlobalSelectedExotelPhone] =
    useState("");
  const [callHistory, setCallHistory] = useState([]);
  const [agentName, setAgentName] = useState("Agent");
  const [agentTypes, setAgentTypes] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isDropdownOpen && !event.target.closest('.select-box')) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isDropdownOpen]);

  useEffect(() => {
    console.log("agentId:", agentId, "agentCollection:", agentCollection);
    if (!agentId || !agentCollection) {
      setError("Agent ID or collection not provided.");
      setLoading(false);
      return;
    }

    // Fetch agent name
    const fetchAgentName = async () => {
      try {
        const agentDocRef = doc(db, agentCollection, agentId);
        const agentDoc = await getDoc(agentDocRef);
        if (agentDoc.exists()) {
          const agentData = agentDoc.data();
          setAgentName(agentData.name || "Agent");
        }
      } catch (err) {
        console.error("Error fetching agent name:", err);
      }
    };

    const fetchAssignedCalls = async () => {
      try {
        setLoading(true);
        const assignedCallsRef = collection(
          db,
          agentCollection,
          agentId,
          "assignedCalls"
        );
        const q = query(assignedCallsRef);
        const querySnapshot = await getDocs(q);
        const calls = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        console.log("Fetched assigned calls:", calls);
        setAssignedCalls(calls);
      } catch (err) {
        setError("Error fetching assigned calls: " + err.message);
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    const fetchCallHistory = () => {
      const exoCallDetailsRef = collection(
        db,
        agentCollection,
        agentId,
        "exoCallDetails"
      );
      const q = query(exoCallDetailsRef);

      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const history = snapshot.docs.map((doc) => ({
            id: doc.id,
            sid: doc.data().sid,
            agent: doc.data().agent,
            lead: doc.data().lead,
            exophone: doc.data().exophone,
            time: doc.data().time,
          }));
          setCallHistory(history);
        },
        (err) => {
          setError("Error fetching call history: " + err.message);
          console.error("Fetch history error:", err);
        }
      );

      return () => unsubscribe();
    };

    fetchAgentName();
    fetchAssignedCalls();
    fetchCallHistory();
  }, [agentId, agentCollection]);

  useEffect(() => {
    const fetchExotelPhones = async () => {
      try {
        // Fetch all exophones from Firestore
        const exophonesRef = collection(db, "exophones");
        const exophonesSnap = await getDocs(exophonesRef);

        // Fetch partner linkages
        const linkagesRef = collection(db, "partnerNumbers");
        const linkagesSnap = await getDocs(linkagesRef);

        // Create a map of exophoneId -> partner info
        const linkagesMap = {};
        linkagesSnap.forEach((doc) => {
          const linkData = doc.data();
          linkagesMap[linkData.exophoneId] = {
            partnerName: linkData.partnerName,
            partnerId: linkData.partnerId,
          };
        });

        // Build phone list with partner names
        const phones = [];
        exophonesSnap.forEach((doc) => {
          const phoneData = doc.data();
          const linkage = linkagesMap[doc.id];

          phones.push({
            phone_number: phoneData.formattedNumber || `0${phoneData.number}`,
            friendly_name: linkage ? linkage.partnerName : "Available Number",
            sid: doc.id,
            status: phoneData.status,
            isAssigned: phoneData.status === "assigned",
            partnerName: linkage ? linkage.partnerName : null,
          });
        });

        // Sort: assigned first (alphabetically by partner name), then unassigned
        phones.sort((a, b) => {
          if (a.isAssigned && !b.isAssigned) return -1;
          if (!a.isAssigned && b.isAssigned) return 1;
          if (a.isAssigned && b.isAssigned) {
            return a.partnerName.localeCompare(b.partnerName);
          }
          return 0;
        });

        setExotelPhones(phones);
      } catch (err) {
        console.error("Error fetching Exotel phones:", err);
        setError("Error fetching phone numbers: " + err.message);
      }
    };
    fetchExotelPhones();
  }, []);

  const handleAddSettings = () => {
    if (!manualNumberInput || !selectedExotelPhoneInput) {
      setError("Please enter your number and select a Caller ID Exophone.");
      return;
    }
    setGlobalManualNumber(manualNumberInput);
    setGlobalSelectedExotelPhone(selectedExotelPhoneInput);
    setError(null);
  };

  const handleMakeCall = async (callId) => {
    setError(null);
    const item = assignedCalls.find((c) => c.id === callId);
    if (!item) return;

    const toNumber = item.clientNumber;
    const fromNumber = globalManualNumber;
    const callerId = globalSelectedExotelPhone;
    const agentType = agentTypes[callId];

    if (!toNumber || !fromNumber || !callerId) {
      setError("Settings not configured. Please add your number and ExoPhone.");
      return;
    }
    if (!agentType) {
      setError("Please select an Agent Type before making the call.");
      return;
    }

    try {
      const response = await axios.post(
        `${API_BASE_URL}/v1/Accounts/${ACCOUNT_SID}/Calls/connect`,
        {
          From: fromNumber,
          To: toNumber,
          CallerId: callerId,
        },
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        }
      );
      console.log("Full API response:", response.data);

      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(response.data, "application/xml");
      const callSid =
        xmlDoc.getElementsByTagName("Sid")[0]?.textContent || "SID_NOT_FOUND";

      // Use the agent name from state
      const newCallRecord = {
        sid: callSid,
        agentName,
        leadToCallNumber: toNumber,
        callerId,
        agentType,
        timestamp: new Date().toISOString(),
      };
      setCallHistory((prevHistory) => [...prevHistory, newCallRecord]);

      const exoCallDetailsRef = collection(
        db,
        agentCollection,
        agentId,
        "exoCallDetails"
      );
      await addDoc(exoCallDetailsRef, {
        sid: callSid,
        agentId: agentId,
        agent: agentName,
        lead: toNumber,
        exophone: callerId,
        agentType,
        callType: "Assigned Call",
        time: new Date().toISOString(),
        assignedCallId: callId,
        createdAt: new Date().toISOString(),
      });

      alert("Call initiated successfully!");
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message;
      setError(
        `Error initiating call: ${errorMessage}. Status: ${err.response?.status}`
      );
      console.error("Call error:", err.response ? err.response.data : err);
    }
  };

  const handleManualNumberChange = (value) => {
    setManualNumberInput(value);
  };

  const handleAgentTypeChange = (callId, value) => {
    setAgentTypes((prev) => ({ ...prev, [callId]: value }));
  };

  const handleExotelPhoneChange = (value) => {
    setSelectedExotelPhoneInput(value);
  };

  if (loading)
    return (
      <div className="container mt-5">
        <p>Loading assigned calls...</p>
      </div>
    );
  if (error && assignedCalls.length === 0)
    return (
      <div className="container mt-5">
        <div className="alert alert-danger">{error}</div>
      </div>
    );

  return (
    <div className="exo-container">
      <h2 className="title">Assigned Calls for {agentCollection}</h2>
      <div className="global-settings">
        <div className="input-box">
          <label htmlFor="global-yournumber" className="text-sm text-gray-600">
            Your Number
          </label>
          <input
            type="number"
            id="global-yournumber"
            placeholder="e.g., 8700612665"
            value={manualNumberInput}
            onChange={(e) => handleManualNumberChange(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="select-box" style={{ position: "relative" }}>
          <label
            htmlFor="global-exotelSelect"
            className="text-sm text-gray-600"
          >
            Caller ID (ExoPhone)
          </label>
          <input
            type="text"
            placeholder="Search by partner name or number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onFocus={() => setIsDropdownOpen(true)}
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {selectedExotelPhoneInput && (
            <div style={{
              padding: "0.5rem",
              backgroundColor: "#e0f2fe",
              borderRadius: "6px",
              marginBottom: "0.5rem",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center"
            }}>
              <span style={{ fontWeight: "600", color: "#0f172a" }}>
                Selected: {selectedExotelPhoneInput}
              </span>
              <button
                onClick={() => {
                  setSelectedExotelPhoneInput("");
                  setSearchTerm("");
                }}
                style={{
                  background: "#ef4444",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  padding: "0.25rem 0.75rem",
                  cursor: "pointer"
                }}
              >
                Clear
              </button>
            </div>
          )}
          {isDropdownOpen && (
            <div style={{
              position: "absolute",
              top: "100%",
              left: 0,
              right: 0,
              maxHeight: "300px",
              overflowY: "auto",
              backgroundColor: "white",
              border: "1px solid #d1d5db",
              borderRadius: "6px",
              boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
              zIndex: 1000
            }}>
              {/* Assigned Numbers */}
              <div style={{ padding: "0.5rem", backgroundColor: "#f3f4f6", fontWeight: "600", fontSize: "0.875rem" }}>
                📋 Assigned Partner Numbers
              </div>
              {exotelPhones
                .filter((phone) => phone.isAssigned)
                .filter((phone) =>
                  phone.phone_number.includes(searchTerm) ||
                  phone.partnerName.toLowerCase().includes(searchTerm.toLowerCase())
                )
                .map((phone, index) => (
                  <div
                    key={index}
                    onClick={() => {
                      handleExotelPhoneChange(phone.phone_number);
                      setIsDropdownOpen(false);
                      setSearchTerm("");
                    }}
                    style={{
                      padding: "0.75rem",
                      cursor: "pointer",
                      borderBottom: "1px solid #e5e7eb",
                      backgroundColor: selectedExotelPhoneInput === phone.phone_number ? "#dbeafe" : "white"
                    }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = "#f3f4f6"}
                    onMouseLeave={(e) => e.target.style.backgroundColor = selectedExotelPhoneInput === phone.phone_number ? "#dbeafe" : "white"}
                  >
                    <div style={{ fontWeight: "600", color: "#0f172a" }}>{phone.phone_number}</div>
                    <div style={{ fontSize: "0.875rem", color: "#64748b" }}>{phone.partnerName}</div>
                  </div>
                ))}

              {/* Available Numbers */}
              <div style={{ padding: "0.5rem", backgroundColor: "#f3f4f6", fontWeight: "600", fontSize: "0.875rem", marginTop: "0.5rem" }}>
                📞 Available Numbers (Others/Extras)
              </div>
              {exotelPhones
                .filter((phone) => !phone.isAssigned)
                .filter((phone) => phone.phone_number.includes(searchTerm))
                .map((phone, index) => (
                  <div
                    key={index}
                    onClick={() => {
                      handleExotelPhoneChange(phone.phone_number);
                      setIsDropdownOpen(false);
                      setSearchTerm("");
                    }}
                    style={{
                      padding: "0.75rem",
                      cursor: "pointer",
                      borderBottom: "1px solid #e5e7eb",
                      backgroundColor: selectedExotelPhoneInput === phone.phone_number ? "#dbeafe" : "white"
                    }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = "#f3f4f6"}
                    onMouseLeave={(e) => e.target.style.backgroundColor = selectedExotelPhoneInput === phone.phone_number ? "#dbeafe" : "white"}
                  >
                    <div style={{ fontWeight: "600", color: "#0f172a" }}>{phone.phone_number}</div>
                  </div>
                ))}

              {/* No results */}
              {exotelPhones.filter((phone) =>
                phone.phone_number.includes(searchTerm) ||
                (phone.partnerName && phone.partnerName.toLowerCase().includes(searchTerm.toLowerCase()))
              ).length === 0 && (
                <div style={{ padding: "1rem", textAlign: "center", color: "#64748b" }}>
                  No numbers found
                </div>
              )}
            </div>
          )}
        </div>
        <button
          onClick={handleAddSettings}
          className="ml-2 p-2 bg-blue-500 text-white rounded-md"
          disabled={!manualNumberInput || !selectedExotelPhoneInput}
        >
          Add
        </button>
      </div>
      {error && <div className="alert alert-danger mt-3">{error}</div>}
      <div className="call-list">
        {assignedCalls.map((item) => (
          <div key={item.id} className="lead-call-card">
            <div className="lead-info">
              <small className="text-gray-500 uppercase text-xs font-medium">
                LEAD TO CALL
              </small>
              <a
                href={`tel:${item.clientNumber}`}
                className="text-blue-600 font-medium text-lg hover:underline"
              >
                {item.clientNumber}
              </a>
            </div>
            <div className="select-box" style={{ marginBottom: "1rem" }}>
              <label
                htmlFor={`agentType-${item.id}`}
                className="text-sm text-gray-600"
              >
                Agent Type (Optional)
              </label>
              <select
                id={`agentType-${item.id}`}
                value={agentTypes[item.id] || ""}
                onChange={(e) =>
                  handleAgentTypeChange(item.id, e.target.value)
                }
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                style={{
                  color: "#0f172a",
                  fontWeight: "500",
                  fontSize: "0.95rem"
                }}
              >
                <option value="">-- Select Type --</option>
                <option value="Insurance">Insurance</option>
                <option value="Health">Health</option>
              </select>
            </div>
            <div className="call-settings">
              <p>
                Your Number: {globalManualNumber || "Not set"} | ExoPhone:{" "}
                {globalSelectedExotelPhone || "Not set"}
              </p>
            </div>
            <button
              className="call-btn"
              onClick={() => handleMakeCall(item.id)}
              disabled={!globalManualNumber || !globalSelectedExotelPhone}
            >
              📞
            </button>
          </div>
        ))}
      </div>
      {exotelPhones.length === 0 && (
        <p className="mt-3 text-red-500">No Exotel phones available.</p>
      )}
      {assignedCalls.length === 0 && (
        <p className="mt-3 text-red-500">No assigned calls found.</p>
      )}

      {callHistory.length > 0 && (
        <div className="call-history mt-5">
          <h3 className="title">Call History</h3>
          <ul>
            {callHistory.map((call, index) => (
              <li key={index}>
                SID: {call.sid}, Agent: {call.agent}, Lead: {call.lead},
                ExoPhone: {call.exophone}, Time: {call.time}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default ExoPhones;