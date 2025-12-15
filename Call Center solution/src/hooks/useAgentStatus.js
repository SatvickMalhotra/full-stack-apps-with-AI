import { useState, useEffect, useRef, useCallback } from 'react';
import { doc, updateDoc, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebaseConfig';

/**
 * Agent Status Types:
 * - "Available" - Agent is logged in and ready to take calls
 * - "On Call" - Agent is currently on a call
 * - "Unavailable" - Agent is logged out OR inactive for 1+ hour
 */
export const AGENT_STATUS = {
  AVAILABLE: "Available",
  ON_CALL: "On Call",
  UNAVAILABLE: "Unavailable",
};

// Inactivity timeout in milliseconds (1 hour)
const INACTIVITY_TIMEOUT = 60 * 60 * 1000; // 1 hour

/**
 * Custom hook for managing agent status with real-time updates
 * @param {string} agentId - The agent's Firebase document ID
 * @param {string} collectionName - The Firestore collection name
 * @param {boolean} isLoggedIn - Whether the agent is currently logged in
 * @returns {Object} - Status management utilities
 */
export const useAgentStatus = (agentId, collectionName, isLoggedIn = true) => {
  const [status, setStatus] = useState(AGENT_STATUS.UNAVAILABLE);
  const [lastActivity, setLastActivity] = useState(null);
  const inactivityTimerRef = useRef(null);
  const unsubscribeRef = useRef(null);

  // Update status in Firestore
  const updateStatusInFirestore = useCallback(async (newStatus) => {
    if (!agentId || !collectionName) return;

    try {
      const agentDocRef = doc(db, collectionName, agentId);
      await updateDoc(agentDocRef, {
        status: newStatus,
        lastStatusUpdate: serverTimestamp(),
        lastActivityTime: serverTimestamp(),
      });
      setStatus(newStatus);
    } catch (error) {
      console.error('[useAgentStatus] Error updating status:', error);
    }
  }, [agentId, collectionName]);

  // Record activity (resets inactivity timer)
  const recordActivity = useCallback(async () => {
    if (!agentId || !collectionName) return;

    const now = new Date();
    setLastActivity(now);

    try {
      const agentDocRef = doc(db, collectionName, agentId);
      await updateDoc(agentDocRef, {
        lastActivityTime: serverTimestamp(),
      });

      // If currently unavailable due to inactivity, set back to available
      if (status === AGENT_STATUS.UNAVAILABLE && isLoggedIn) {
        await updateStatusInFirestore(AGENT_STATUS.AVAILABLE);
      }
    } catch (error) {
      console.error('[useAgentStatus] Error recording activity:', error);
    }
  }, [agentId, collectionName, status, isLoggedIn, updateStatusInFirestore]);

  // Set status to Available (on login)
  const setAvailable = useCallback(async () => {
    await updateStatusInFirestore(AGENT_STATUS.AVAILABLE);
    await recordActivity();
  }, [updateStatusInFirestore, recordActivity]);

  // Set status to On Call
  const setOnCall = useCallback(async () => {
    await updateStatusInFirestore(AGENT_STATUS.ON_CALL);
    // Clear inactivity timer when on call
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
      inactivityTimerRef.current = null;
    }
  }, [updateStatusInFirestore]);

  // Set status to Available (after call ends)
  const setAvailableAfterCall = useCallback(async () => {
    await updateStatusInFirestore(AGENT_STATUS.AVAILABLE);
    await recordActivity();
  }, [updateStatusInFirestore, recordActivity]);

  // Set status to Unavailable (on logout or inactivity)
  const setUnavailable = useCallback(async () => {
    await updateStatusInFirestore(AGENT_STATUS.UNAVAILABLE);
  }, [updateStatusInFirestore]);

  // Check inactivity and set unavailable if needed
  const checkInactivity = useCallback(async () => {
    if (!lastActivity || status === AGENT_STATUS.ON_CALL || !isLoggedIn) return;

    const now = new Date();
    const timeSinceLastActivity = now - lastActivity;

    if (timeSinceLastActivity >= INACTIVITY_TIMEOUT && status === AGENT_STATUS.AVAILABLE) {
      console.log('[useAgentStatus] Agent inactive for 1+ hour, setting to Unavailable');
      await setUnavailable();
    }
  }, [lastActivity, status, isLoggedIn, setUnavailable]);

  // Setup inactivity timer
  useEffect(() => {
    if (!isLoggedIn || status === AGENT_STATUS.ON_CALL) {
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
        inactivityTimerRef.current = null;
      }
      return;
    }

    // Check inactivity every minute
    const intervalId = setInterval(checkInactivity, 60000);

    return () => {
      clearInterval(intervalId);
    };
  }, [isLoggedIn, status, checkInactivity]);

  // Setup real-time listener for status changes
  useEffect(() => {
    if (!agentId || !collectionName) return;

    const agentDocRef = doc(db, collectionName, agentId);

    unsubscribeRef.current = onSnapshot(agentDocRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.status) {
          setStatus(data.status);
        }
        if (data.lastActivityTime) {
          // Convert Firestore timestamp to Date
          const activityTime = data.lastActivityTime.toDate ?
            data.lastActivityTime.toDate() :
            new Date(data.lastActivityTime);
          setLastActivity(activityTime);
        }
      }
    }, (error) => {
      console.error('[useAgentStatus] Error listening to status:', error);
    });

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
    };
  }, [agentId, collectionName]);

  // Set initial status on login
  useEffect(() => {
    if (isLoggedIn && agentId && collectionName) {
      setAvailable();
    }
  }, [isLoggedIn, agentId, collectionName, setAvailable]);

  // Cleanup on unmount (set to unavailable)
  useEffect(() => {
    return () => {
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
      }
    };
  }, []);

  return {
    status,
    lastActivity,
    setAvailable,
    setOnCall,
    setAvailableAfterCall,
    setUnavailable,
    recordActivity,
    AGENT_STATUS,
  };
};

/**
 * Hook for managers/TLs to listen to multiple agents' statuses in real-time
 * @param {Array} agentIds - Array of {id, collection} objects
 * @returns {Object} - Map of agentId -> status
 */
export const useAgentStatusesRealtime = (agents = []) => {
  const [statuses, setStatuses] = useState({});
  const unsubscribersRef = useRef([]);

  useEffect(() => {
    // Cleanup previous listeners
    unsubscribersRef.current.forEach(unsub => unsub());
    unsubscribersRef.current = [];

    if (!agents || agents.length === 0) {
      setStatuses({});
      return;
    }

    agents.forEach(agent => {
      if (!agent.id || !agent.collection) return;

      const agentDocRef = doc(db, agent.collection, agent.id);

      const unsubscribe = onSnapshot(agentDocRef, (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          setStatuses(prev => ({
            ...prev,
            [agent.id]: {
              status: data.status || AGENT_STATUS.UNAVAILABLE,
              lastActivityTime: data.lastActivityTime,
              name: data.name || agent.name,
            }
          }));
        }
      }, (error) => {
        console.error(`[useAgentStatusesRealtime] Error for agent ${agent.id}:`, error);
      });

      unsubscribersRef.current.push(unsubscribe);
    });

    return () => {
      unsubscribersRef.current.forEach(unsub => unsub());
      unsubscribersRef.current = [];
    };
  }, [agents]);

  // Calculate summary stats
  const summary = {
    total: Object.keys(statuses).length,
    available: Object.values(statuses).filter(s => s.status === AGENT_STATUS.AVAILABLE).length,
    onCall: Object.values(statuses).filter(s => s.status === AGENT_STATUS.ON_CALL).length,
    unavailable: Object.values(statuses).filter(s => s.status === AGENT_STATUS.UNAVAILABLE).length,
  };

  return { statuses, summary };
};

export default useAgentStatus;
