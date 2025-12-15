import React from "react";
import AgentView from "./AgentView";

/**
 * TLView component - Wraps AgentView for Team Leaders
 * Team Leaders can also log calls like agents
 * This component reuses the AgentView component
 */
function TLView({ currentUser, onStatusChange }) {
  return (
    <AgentView
      currentUser={currentUser}
      onStatusChange={onStatusChange}
    />
  );
}

export default TLView;
