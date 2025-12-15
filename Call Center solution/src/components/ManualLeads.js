import React, { useState, useEffect } from "react";
import axios from "axios";
import "./ManualLeads.css";
import ManualCallLogForm from "./ManualCallLogForm";
import { db } from "../firebaseConfig";
import { collection, addDoc, serverTimestamp, getDoc, doc, getDocs, query, where } from "firebase/firestore";
import API_BASE_URL from "../config/api";

const ACCOUNT_SID = process.env.REACT_APP_ACCOUNT_SID;

function ManualLeads({ agentId, userId, agentCollection, onStartCall, onEndCall }) {
  // Support both agentId and userId props for backward compatibility
  const actualAgentId = agentId || userId;
  const [exotelPhones, setExotelPhones] = useState([]);
  const [manualLeads, setManualLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedExotelPhones, setSelectedExotelPhones] = useState({});
  const [manualNumbers, setManualNumbers] = useState({});
  const [callHistory, setCallHistory] = useState([]);
  const [newLeadNumber, setNewLeadNumber] = useState("");
  const [isCallActive, setIsCallActive] = useState(false);
  const [showCallForm, setShowCallForm] = useState(false);
  const [currentLeadNumber, setCurrentLeadNumber] = useState("");
  const [callStartTime, setCallStartTime] = useState(null);
  const [agentName, setAgentName] = useState("Agent");
  const [currentCallSid, setCurrentCallSid] = useState("");
  const [currentCallerId, setCurrentCallerId] = useState("");
  const [agentPhoneNumber, setAgentPhoneNumber] = useState("");
  const [agentTypes, setAgentTypes] = useState({});
  const [currentAgentType, setCurrentAgentType] = useState("");
  const [searchTerms, setSearchTerms] = useState({});
  const [dropdownOpen, setDropdownOpen] = useState({});

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      const openDropdowns = Object.keys(dropdownOpen).filter(key => dropdownOpen[key]);
      if (openDropdowns.length > 0 && !event.target.closest('.exophone-select-wrapper')) {
        setDropdownOpen({});
      }
    };
    // Use a slight delay to avoid immediate closure
    const timer = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
    }, 100);
    return () => {
      clearTimeout(timer);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownOpen]);

  // Fetch agent name and phone number from Firestore
  const fetchAgentData = async () => {
    try {
      console.log(`[ManualLeads] Fetching agent data from collection: ${agentCollection}, ID: ${actualAgentId}`);

      // First try to fetch using actualAgentId (UID) as document ID
      let agentDocRef = doc(db, agentCollection, actualAgentId);
      let agentDoc = await getDoc(agentDocRef);

      console.log(`[ManualLeads] Direct lookup - Document exists: ${agentDoc.exists()}`);
      if (agentDoc.exists()) {
        console.log(`[ManualLeads] Direct lookup - Document data:`, agentDoc.data());
      }

      // If not found OR if healthTeamLeads collection, try querying by uid field
      // (healthTeamLeads uses empId as document ID, not Firebase UID)
      if (agentCollection === "healthTeamLeads" && (!agentDoc.exists() || !agentDoc.data()?.mobile)) {
        console.log(`[ManualLeads] Querying healthTeamLeads by uid field...`);
        const tlQuery = query(
          collection(db, "healthTeamLeads"),
          where("uid", "==", actualAgentId)
        );
        const tlSnapshot = await getDocs(tlQuery);

        console.log(`[ManualLeads] Query returned ${tlSnapshot.size} documents`);

        if (!tlSnapshot.empty) {
          const tlDoc = tlSnapshot.docs[0];
          console.log(`[ManualLeads] Found TL document with empId: ${tlDoc.id}`);
          console.log(`[ManualLeads] TL document data:`, tlDoc.data());
          agentDoc = tlDoc;
        } else {
          console.log(`[ManualLeads] No TL document found with uid: ${actualAgentId}`);
        }
      }

      // Similarly for healthAgents
      if (agentCollection === "healthAgents" && (!agentDoc.exists() || !agentDoc.data()?.mobile)) {
        console.log(`[ManualLeads] Querying healthAgents by uid field...`);
        const agentQuery = query(
          collection(db, "healthAgents"),
          where("uid", "==", actualAgentId)
        );
        const agentSnapshot = await getDocs(agentQuery);

        console.log(`[ManualLeads] Query returned ${agentSnapshot.size} documents`);

        if (!agentSnapshot.empty) {
          const foundDoc = agentSnapshot.docs[0];
          console.log(`[ManualLeads] Found agent document ID: ${foundDoc.id}`);
          console.log(`[ManualLeads] Agent document data:`, foundDoc.data());
          agentDoc = foundDoc;
        }
      }

      if (agentDoc && agentDoc.exists()) {
        const agentData = agentDoc.data();
        console.log(`[ManualLeads] Final Agent Data:`, agentData);
        console.log(`[ManualLeads] Mobile:`, agentData.mobile);
        console.log(`[ManualLeads] PhoneNumber:`, agentData.phoneNumber);
        setAgentName(agentData.name || "Agent");
        setAgentPhoneNumber(agentData.mobile || agentData.phoneNumber || "");
        console.log(`[ManualLeads] Set agentPhoneNumber to:`, agentData.mobile || agentData.phoneNumber || "");
      } else {
        console.log(`[ManualLeads] No agent document found in ${agentCollection}`);
      }
    } catch (err) {
      console.error("[ManualLeads] Error fetching agent data:", err);
    }
  };

  useEffect(() => {
    fetchAgentData();
    setLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [actualAgentId, agentCollection]);

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

  const handleAddLead = () => {
    if (!newLeadNumber.trim()) {
      setError("Please enter a valid 10-digit lead number.");
      return;
    }
    if (!/^\d{10}$/.test(newLeadNumber)) {
      setError("Lead number must be exactly 10 digits.");
      return;
    }
    const newId = Date.now().toString();
    const newLead = { id: newId, clientNumber: newLeadNumber };
    setManualLeads((prev) => [...prev, newLead]);
    // Auto-populate with agent's phone number
    setManualNumbers((prev) => ({ ...prev, [newId]: agentPhoneNumber }));
    setSelectedExotelPhones((prev) => ({ ...prev, [newId]: "" }));
    setAgentTypes((prev) => ({ ...prev, [newId]: "" }));
    setNewLeadNumber("");
    setError(null);
  };

  const handleManualNumberChange = (leadId, value) => {
    setManualNumbers((prev) => ({ ...prev, [leadId]: value }));
  };

  const handleExotelPhoneChange = (leadId, value) => {
    setSelectedExotelPhones((prev) => ({ ...prev, [leadId]: value }));
  };

  const handleAgentTypeChange = (leadId, value) => {
    setAgentTypes((prev) => ({ ...prev, [leadId]: value }));
  };

  const handleMakeCall = async (leadId) => {
    setError(null);
    const item = manualLeads.find((c) => c.id === leadId);
    if (!item) return;

    const toNumber = item.clientNumber;
    const fromNumber = manualNumbers[leadId];
    const callerId =
      selectedExotelPhones[leadId] ||
      (exotelPhones.length > 0 ? exotelPhones[0].phone_number : "");
    const agentType = agentTypes[leadId];

    if (!toNumber || !fromNumber || !callerId) {
      setError("Please enter your number and select a Caller ID Exophone.");
      return;
    }
    if (!/^\d{10}$/.test(fromNumber)) {
      setError("Your number must be exactly 10 digits.");
      return;
    }
    if (!agentType) {
      setError("Please select an Agent Type before making the call.");
      return;
    }

    try {
      const response = await axios.post(
        `${API_BASE_URL}/v1/Accounts/${ACCOUNT_SID}/Calls/connect`,
        { From: fromNumber, To: toNumber, CallerId: callerId },
        {
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
        }
      );
      console.log("Full API response:", response.data);

      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(response.data, "application/xml");
      const callSid =
        xmlDoc.getElementsByTagName("Sid")[0]?.textContent || "SID_NOT_FOUND";

      // Store SID, callerId, and agentType for later use in form submission
      setCurrentCallSid(callSid);
      setCurrentCallerId(callerId);
      setCurrentAgentType(agentType || "N/A");
      setCurrentLeadNumber(toNumber);
      setCallStartTime(new Date());
      if (onStartCall) onStartCall(toNumber);
      setIsCallActive(true);

      // Use the agent name from state
      const newCallRecord = {
        sid: callSid,
        agentName,
        leadToCallNumber: toNumber,
        callerId,
        agentType: agentType || "N/A",
        timestamp: new Date().toISOString(),
      };
      setCallHistory((prevHistory) => [...prevHistory, newCallRecord]);
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message;
      setError(
        `Error initiating call: ${errorMessage}. Status: ${err.response?.status}`
      );
      console.error("Call error:", err.response ? err.response.data : err);
    }
  };

  const handleEndCall = () => {
    setIsCallActive(false);
    setShowCallForm(true);
  };

  const handleFormSubmit = async (logEntry) => {
    try {
      const callLogsRef = collection(db, agentCollection, actualAgentId, "callLogs");
      await addDoc(callLogsRef, {
        ...logEntry,
        agentId: actualAgentId,
        agentName,
        sid: currentCallSid,
        callerId: currentCallerId,
        agentType: currentAgentType,
        callType: "Manual Lead",
        timestamp: serverTimestamp(),
        startTime: callStartTime ? callStartTime.toISOString() : null,
        endTime: new Date().toISOString(),
      });
      setShowCallForm(false);
      setCurrentLeadNumber("");
      setCallStartTime(null);
      setCurrentCallSid("");
      setCurrentCallerId("");
      setCurrentAgentType("");
      if (onEndCall) onEndCall(); // Notify AgentView to reset state
    } catch (error) {
      console.error("Error saving call log:", error);
      setError("Failed to save call log.");
    }
  };

  if (loading)
    return (
      <div className="container mt-5">
        <p>Loading...</p>
      </div>
    );
  if (error && manualLeads.length === 0)
    return (
      <div className="container mt-5">
        <div className="alert alert-danger">{error}</div>
      </div>
    );

  return (
    <div className="exo-container">
      {/* Phone Number Display */}
      <div className="welcome-card" style={{ marginTop: "0", padding: "1.5rem", backgroundColor: "#f8fafc" }}>
        <h3 style={{ marginBottom: "0.75rem", color: "#0f172a", fontSize: "1.1rem", fontWeight: "600" }}>
          📱 Your Contact Number
        </h3>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
          <span style={{
            fontSize: "1.3rem",
            fontWeight: "600",
            color: "#0f172a",
            backgroundColor: "#e0f2fe",
            padding: "0.5rem 1rem",
            borderRadius: "8px",
            border: "2px solid #0ea5e9"
          }}>
            {agentPhoneNumber || "Not set"}
          </span>
        </div>
        <p style={{ marginTop: "0.75rem", fontSize: "0.85rem", color: "#64748b", lineHeight: "1.4" }}>
          This number will be auto-filled when making calls. Contact your Team Leader if you need to change it.
        </p>
      </div>

      <h2 className="title">Manual Leads</h2>
      <div className="add-lead-form">
        <input
          type="tel"
          pattern="\d{10}"
          maxLength="10"
          placeholder="Enter 10-digit lead number (e.g., 1234567890)"
          value={newLeadNumber}
          onChange={(e) => setNewLeadNumber(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={handleAddLead}
          className="ml-2 p-2 bg-blue-500 text-white rounded-md"
        >
          Add Lead
        </button>
      </div>
      {error && <div className="alert alert-danger mt-3">{error}</div>}
      <div className="call-list">
        {manualLeads.map((item) => (
          <div key={item.id} className="lead-call-card" style={{
            display: "grid",
            gridTemplateColumns: "2fr 2fr 60px",
            gap: "14px",
            alignItems: "start",
            overflow: "visible"
          }}>
            <div className="lead-info" style={{ gridColumn: "1 / -1" }}>
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
            <div className="input-box">
              <label
                htmlFor={`yournumber-${item.id}`}
                className="text-sm text-gray-600"
              >
                Your Number (10 digits)
                {manualNumbers[item.id] === agentPhoneNumber && agentPhoneNumber && (
                  <span style={{ marginLeft: "0.5rem", color: "#22c55e", fontSize: "0.75rem" }}>
                    ✓ Auto-filled
                  </span>
                )}
              </label>
              <input
                type="tel"
                pattern="\d{10}"
                maxLength="10"
                id={`yournumber-${item.id}`}
                placeholder="e.g., 8700612665"
                value={manualNumbers[item.id] || ""}
                onChange={(e) =>
                  handleManualNumberChange(item.id, e.target.value)
                }
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                style={{
                  backgroundColor: manualNumbers[item.id] === agentPhoneNumber && agentPhoneNumber ? "#f0fdf4" : "white",
                  color: "#0f172a",
                  fontWeight: "500",
                  fontSize: "1rem"
                }}
              />
            </div>
            <div className="select-box exophone-select-wrapper" style={{ position: "relative", zIndex: 10 }}>
              <label
                htmlFor={`exotelSelect-${item.id}`}
                className="text-sm text-gray-600"
              >
                Caller ID (ExoPhone)
              </label>

              {/* Selected Display Badge */}
              {selectedExotelPhones[item.id] && (
                <div style={{
                  padding: "10px 12px",
                  backgroundColor: "rgba(38, 166, 154, 0.1)",
                  borderRadius: "12px",
                  marginBottom: "8px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  border: "1px solid rgba(38, 166, 154, 0.3)"
                }}>
                  <span style={{ fontWeight: "600", color: "#26a69a", fontSize: "0.95rem" }}>
                    ✓ {selectedExotelPhones[item.id]}
                  </span>
                  <button
                    onClick={() => {
                      handleExotelPhoneChange(item.id, "");
                      setSearchTerms({ ...searchTerms, [item.id]: "" });
                    }}
                    style={{
                      background: "#ff7043",
                      color: "white",
                      border: "none",
                      borderRadius: "8px",
                      padding: "4px 12px",
                      cursor: "pointer",
                      fontSize: "0.75rem",
                      fontWeight: "600",
                      transition: "all 0.2s ease"
                    }}
                    onMouseEnter={(e) => e.target.style.background = "#f4511e"}
                    onMouseLeave={(e) => e.target.style.background = "#ff7043"}
                  >
                    Clear
                  </button>
                </div>
              )}

              {/* Search Input */}
              <input
                type="text"
                placeholder="🔍 Search by partner name or number..."
                value={searchTerms[item.id] || ""}
                onChange={(e) => setSearchTerms({ ...searchTerms, [item.id]: e.target.value })}
                onFocus={() => setDropdownOpen({ ...dropdownOpen, [item.id]: true })}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  border: "1px solid rgba(38, 166, 154, 0.3)",
                  borderRadius: "12px",
                  background: "#ffffff",
                  color: "#1e293b",
                  fontWeight: "500",
                  fontSize: "0.95rem",
                  transition: "border 0.2s ease, box-shadow 0.2s ease",
                  outline: "none"
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "#26a69a";
                  e.target.style.boxShadow = "0 0 8px rgba(38, 166, 154, 0.2)";
                  setDropdownOpen({ ...dropdownOpen, [item.id]: true });
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "rgba(38, 166, 154, 0.3)";
                  e.target.style.boxShadow = "none";
                }}
              />

              {/* Dropdown */}
              {dropdownOpen[item.id] && (
                <div
                  onClick={(e) => e.stopPropagation()}
                  style={{
                    position: "absolute",
                    top: "100%",
                    left: 0,
                    right: 0,
                    marginTop: "4px",
                    maxHeight: "320px",
                    overflowY: "auto",
                    backgroundColor: "#ffffff",
                    border: "1px solid rgba(38, 166, 154, 0.3)",
                    borderRadius: "12px",
                    boxShadow: "0 8px 24px rgba(0, 0, 0, 0.12)",
                    zIndex: 9999
                  }}
                >
                  {/* Assigned Numbers Section */}
                  <div style={{
                    padding: "10px 12px",
                    backgroundColor: "rgba(38, 166, 154, 0.1)",
                    fontWeight: "700",
                    fontSize: "0.85rem",
                    color: "#26a69a",
                    borderBottom: "1px solid rgba(38, 166, 154, 0.2)",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px"
                  }}>
                    📋 Assigned Partner Numbers
                  </div>
                  {exotelPhones
                    .filter((phone) => phone.isAssigned)
                    .filter((phone) =>
                      phone.phone_number.includes(searchTerms[item.id] || "") ||
                      phone.partnerName.toLowerCase().includes((searchTerms[item.id] || "").toLowerCase())
                    )
                    .map((phone, index) => (
                      <div
                        key={index}
                        onClick={() => {
                          handleExotelPhoneChange(item.id, phone.phone_number);
                          setDropdownOpen({ ...dropdownOpen, [item.id]: false });
                          setSearchTerms({ ...searchTerms, [item.id]: "" });
                        }}
                        style={{
                          padding: "12px",
                          cursor: "pointer",
                          borderBottom: "1px solid rgba(38, 166, 154, 0.1)",
                          backgroundColor: selectedExotelPhones[item.id] === phone.phone_number ? "rgba(38, 166, 154, 0.15)" : "white",
                          transition: "all 0.2s ease"
                        }}
                        onMouseEnter={(e) => {
                          if (selectedExotelPhones[item.id] !== phone.phone_number) {
                            e.currentTarget.style.backgroundColor = "rgba(38, 166, 154, 0.08)";
                          }
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = selectedExotelPhones[item.id] === phone.phone_number ? "rgba(38, 166, 154, 0.15)" : "white";
                        }}
                      >
                        <div style={{ fontWeight: "700", color: "#26a69a", fontSize: "0.95rem" }}>
                          {phone.phone_number}
                        </div>
                        <div style={{ fontSize: "0.85rem", color: "#546e7a", marginTop: "2px" }}>
                          {phone.partnerName}
                        </div>
                      </div>
                    ))}

                  {/* Available Numbers Section */}
                  <div style={{
                    padding: "10px 12px",
                    backgroundColor: "rgba(102, 187, 106, 0.1)",
                    fontWeight: "700",
                    fontSize: "0.85rem",
                    color: "#66bb6a",
                    borderBottom: "1px solid rgba(102, 187, 106, 0.2)",
                    marginTop: "4px",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px"
                  }}>
                    📞 Available Numbers
                  </div>
                  {exotelPhones
                    .filter((phone) => !phone.isAssigned)
                    .filter((phone) => phone.phone_number.includes(searchTerms[item.id] || ""))
                    .map((phone, index) => (
                      <div
                        key={index}
                        onClick={() => {
                          handleExotelPhoneChange(item.id, phone.phone_number);
                          setDropdownOpen({ ...dropdownOpen, [item.id]: false });
                          setSearchTerms({ ...searchTerms, [item.id]: "" });
                        }}
                        style={{
                          padding: "12px",
                          cursor: "pointer",
                          borderBottom: "1px solid rgba(38, 166, 154, 0.1)",
                          backgroundColor: selectedExotelPhones[item.id] === phone.phone_number ? "rgba(38, 166, 154, 0.15)" : "white",
                          transition: "all 0.2s ease"
                        }}
                        onMouseEnter={(e) => {
                          if (selectedExotelPhones[item.id] !== phone.phone_number) {
                            e.currentTarget.style.backgroundColor = "rgba(38, 166, 154, 0.08)";
                          }
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = selectedExotelPhones[item.id] === phone.phone_number ? "rgba(38, 166, 154, 0.15)" : "white";
                        }}
                      >
                        <div style={{ fontWeight: "700", color: "#26a69a", fontSize: "0.95rem" }}>
                          {phone.phone_number}
                        </div>
                      </div>
                    ))}

                  {/* No Results */}
                  {exotelPhones.filter((phone) =>
                    phone.phone_number.includes(searchTerms[item.id] || "") ||
                    (phone.partnerName && phone.partnerName.toLowerCase().includes((searchTerms[item.id] || "").toLowerCase()))
                  ).length === 0 && (
                    <div style={{
                      padding: "20px",
                      textAlign: "center",
                      color: "#546e7a",
                      fontSize: "0.9rem"
                    }}>
                      No numbers found
                    </div>
                  )}
                </div>
              )}
            </div>
            <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "center", paddingTop: "20px" }}>
              <button
                className="call-btn"
                onClick={() => handleMakeCall(item.id)}
                disabled={!manualNumbers[item.id] || isCallActive}
                style={{
                  width: "48px",
                  height: "48px",
                  flexShrink: 0
                }}
              >
                📞
              </button>
            </div>
            {/* Agent Type moved to second row */}
            <div className="select-box" style={{ gridColumn: "1 / -1" }}>
              <label
                htmlFor={`agentType-${item.id}`}
                className="text-sm text-gray-600"
              >
                Agent Type
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
          </div>
        ))}
      </div>
      {exotelPhones.length === 0 && (
        <p className="mt-3 text-red-500">No Exotel phones available.</p>
      )}
      {manualLeads.length === 0 && (
        <p className="mt-3 text-red-500">No manual leads added yet.</p>
      )}

      {callHistory.length > 0 && (
        <div className="call-history mt-5">
          <h3 className="title">Call History</h3>
          <ul>
            {callHistory.map((call, index) => (
              <li key={index}>
                SID: {call.sid}, Agent: {call.agentName}, Lead:{" "}
                {call.leadToCallNumber}, ExoPhone: {call.callerId}, Time:{" "}
                {call.timestamp}
              </li>
            ))}
          </ul>
        </div>
      )}

      {isCallActive && (
        <div className="end-call-interface">
          <h3>Call in Progress</h3>
          <p>Stay focused and professional</p>
          <button onClick={handleEndCall} className="end-call-btn">
            End Call
          </button>
        </div>
      )}

      {showCallForm && (
        <ManualCallLogForm
          onSubmit={handleFormSubmit}
          initialClientNumber={currentLeadNumber}
          agentType={currentAgentType}
        />
      )}
    </div>
  );
}

export default ManualLeads;