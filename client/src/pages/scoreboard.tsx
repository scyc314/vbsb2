import { useState, useEffect } from "react";
import ScoreboardDisplay from "@/components/ScoreboardDisplay";
import { defaultMatchConfig, type MatchConfig } from "@shared/schema";
import { useWebSocket } from "@/lib/useWebSocket";

export default function ScoreboardPage() {
  const [localConfig, setLocalConfig] = useState<MatchConfig>(defaultMatchConfig);
  
  const params = new URLSearchParams(window.location.search);
  const matchId = params.get("matchid") || "default";
  const layoutParam = params.get("layout") || "sideBySide";
  
  let layout: "sideBySide" | "stacked" | "scoreboard" = "sideBySide";
  if (layoutParam === "stacked" || layoutParam === "scoreboard") {
    layout = layoutParam;
  }

  const { config } = useWebSocket({
    matchId,
    onUpdate: (newConfig) => {
      // Override layout from URL parameter
      setLocalConfig({ ...newConfig, layout });
    },
  });

  useEffect(() => {
    if (config) {
      setLocalConfig({ ...config, layout });
    }
  }, [config, layout]);

  return <ScoreboardDisplay config={localConfig} />;
}
