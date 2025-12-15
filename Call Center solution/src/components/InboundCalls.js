import React, { useState } from "react";
import "./ManualLeads.css"; // Reuse same styling
import InboundCallLogForm from "./InboundCallLogForm";
import { db } from "../firebaseConfig";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

function InboundCalls({ agentId, agentCollection, agentName }) {
  const [showCallForm, setShowCallForm] = useState(false);
  const [callStartTime, setCallStartTime] = useState(null);
  const [currentClientNumber, setCurrentClientNumber] = useState("");
  const [error, setError] = useState(null);
  const [agentType, setAgentType] = useState("");

  const handleStartLogging = () => {
    if (!currentClientNumber.trim()) {
      setError("Please enter the client number who called you.");
      return;
    }
    if (!/^\d{10}$/.test(currentClientNumber)) {
      setError("Client number must be exactly 10 digits.");
      return;
    }

    setCallStartTime(new Date());
    setShowCallForm(true);
    setError(null);
  };

  const handleFormSubmit = async (logEntry) => {
    try {
      // Save to callLogs subcollection (same as other call types)
      const callLogsRef = collection(db, agentCollection, agentId, "callLogs");
      await addDoc(callLogsRef, {
        ...logEntry,
        agentId,
        agentName: agentName || "Agent",
        agentType: agentType || "N/A",
        callType: "Inbound",
        callDirection: "Inbound",
        timestamp: serverTimestamp(),
        startTime: callStartTime ? callStartTime.toISOString() : null,
        endTime: new Date().toISOString(),
      });

      setShowCallForm(false);
      setCurrentClientNumber("");
      setCallStartTime(null);
      setAgentType("");
      setError(null);

      alert("✅ Inbound call log saved successfully!");
    } catch (error) {
      console.error("Error saving inbound call log:", error);

      // Show detailed error message
      let errorMessage = "Failed to save inbound call log. ";
      if (error.code === "permission-denied") {
        errorMessage += "Permission denied. Please make sure Firestore security rules are applied.";
      } else {
        errorMessage += error.message || "Unknown error occurred.";
      }

      setError(errorMessage);
      alert("❌ " + errorMessage);
    }
  };

  const handleCancel = () => {
    setShowCallForm(false);
    setCurrentClientNumber("");
    setCallStartTime(null);
    setError(null);
  };

  return (
    <div className="exo-container">
      {!showCallForm ? (
        <div className="manual-leads-section">
          <h2 className="title">Inbound Call Logging</h2>
          <p style={{ color: '#546e7a', marginBottom: '20px', fontSize: '0.95rem' }}>
            When a client calls you directly on your number, use this section to log the call details.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="input-box">
              <label style={{
                fontSize: '0.85rem',
                fontWeight: '600',
                color: '#546e7a',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                marginBottom: '6px',
                display: 'block'
              }}>
                Client Number
              </label>
              <input
                type="tel"
                pattern="\d{10}"
                maxLength="10"
                placeholder="Enter client's 10-digit number"
                value={currentClientNumber}
                onChange={(e) => setCurrentClientNumber(e.target.value.replace(/\D/g, ''))}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '1px solid rgba(38, 166, 154, 0.3)',
                  borderRadius: '12px',
                  background: '#ffffff',
                  color: '#1e293b',
                  fontWeight: '500',
                  fontSize: '1rem',
                  transition: 'border 0.2s ease, box-shadow 0.2s ease'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#26a69a';
                  e.target.style.boxShadow = '0 0 8px rgba(38, 166, 154, 0.2)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'rgba(38, 166, 154, 0.3)';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>

            <div className="select-box">
              <label
                htmlFor="agentType"
                style={{
                  fontSize: '0.85rem',
                  fontWeight: '600',
                  color: '#546e7a',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  marginBottom: '6px',
                  display: 'block'
                }}
              >
                Agent Type (Optional)
              </label>
              <select
                id="agentType"
                value={agentType}
                onChange={(e) => setAgentType(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid rgba(38, 166, 154, 0.3)',
                  borderRadius: '12px',
                  background: '#ffffff',
                  color: '#1e293b',
                  fontWeight: '500',
                  fontSize: '1rem',
                  transition: 'border 0.2s ease, box-shadow 0.2s ease'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#26a69a';
                  e.target.style.boxShadow = '0 0 8px rgba(38, 166, 154, 0.2)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'rgba(38, 166, 154, 0.3)';
                  e.target.style.boxShadow = 'none';
                }}
              >
                <option value="">-- Select Type --</option>
                <option value="Insurance">Insurance</option>
                <option value="Health">Health</option>
              </select>
            </div>

            <button
              onClick={handleStartLogging}
              style={{
                background: 'linear-gradient(135deg, #26a69a 0%, #1e8a7f 100%)',
                color: '#fff',
                padding: '12px 24px',
                border: 'none',
                borderRadius: '12px',
                fontWeight: 600,
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(38, 166, 154, 0.3)',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                fontSize: '1rem'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 6px 16px rgba(38, 166, 154, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 4px 12px rgba(38, 166, 154, 0.3)';
              }}
            >
              Start Logging
            </button>
          </div>

          {error && (
            <div style={{
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#dc2626',
              padding: '12px 16px',
              borderRadius: '12px',
              marginTop: '16px',
              fontSize: '0.9rem',
              fontWeight: '500'
            }}>
              {error}
            </div>
          )}

          <div style={{
            marginTop: '32px',
            padding: '20px',
            backgroundColor: 'rgba(38, 166, 154, 0.08)',
            border: '1px solid rgba(38, 166, 154, 0.2)',
            borderRadius: '12px'
          }}>
            <h3 style={{ color: '#26a69a', marginBottom: '12px', fontSize: '1.1rem', fontWeight: 600 }}>
              ℹ️ How to use this section:
            </h3>
            <ol style={{ color: '#546e7a', paddingLeft: '20px', lineHeight: '1.8', fontSize: '0.95rem', margin: 0 }}>
              <li>Enter the 10-digit number of the client who called you</li>
              <li>Click "Start Logging" to open the call log form</li>
              <li>Fill in all the call details (status, category, remarks, etc.)</li>
              <li>Click "Save Call Log" to record the inbound call</li>
            </ol>
          </div>
        </div>
      ) : (
        <div>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '20px',
            padding: '20px',
            backgroundColor: 'rgba(38, 166, 154, 0.1)',
            borderRadius: '12px',
            border: '1px solid rgba(38, 166, 154, 0.3)'
          }}>
            <div>
              <h3 style={{ color: '#26a69a', marginBottom: '6px', fontSize: '1.2rem', fontWeight: 700 }}>
                Logging Inbound Call
              </h3>
              <p style={{ color: '#546e7a', fontSize: '0.95rem', margin: 0 }}>
                Client Number: <strong style={{ color: '#1e293b' }}>{currentClientNumber}</strong>
              </p>
            </div>
            <button
              onClick={handleCancel}
              style={{
                padding: '10px 20px',
                backgroundColor: '#fff',
                color: '#dc2626',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '0.9rem',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
                e.target.style.borderColor = '#dc2626';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = '#fff';
                e.target.style.borderColor = 'rgba(239, 68, 68, 0.3)';
              }}
            >
              Cancel
            </button>
          </div>

          <InboundCallLogForm
            onSubmit={handleFormSubmit}
            initialClientNumber={currentClientNumber}
          />
        </div>
      )}
    </div>
  );
}

export default InboundCalls;
