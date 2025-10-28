import { useEffect } from "react";
import RemoteControl from "@/components/RemoteControl";
import { defaultMatchConfig, type MatchConfig } from "@shared/schema";
import { useWebSocket } from "@/lib/useWebSocket";

export default function RemotePage() {
  const params = new URLSearchParams(window.location.search);
  const matchId = params.get("matchid") || "default";

  const { connectionStatus, config, sendUpdate } = useWebSocket({
    matchId,
    onUpdate: (newConfig) => {
      console.log("Received match update:", newConfig);
    },
  });

  const handleConfigChange = (newConfig: MatchConfig) => {
    // Send only the changed fields to the server
    sendUpdate(newConfig);
  };

  return (
    <RemoteControl
      initialConfig={config || { ...defaultMatchConfig, matchId }}
      onConfigChange={handleConfigChange}
      connectionStatus={connectionStatus}
    />
  );
}
