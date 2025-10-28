import { useState, useEffect } from "react";
import { type MatchConfig } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ConnectionStatus from "./ConnectionStatus";

interface RemoteControlProps {
  initialConfig: MatchConfig;
  onConfigChange?: (config: MatchConfig) => void;
  connectionStatus?: "connected" | "disconnected" | "reconnecting";
}

export default function RemoteControl({
  initialConfig,
  onConfigChange,
  connectionStatus = "connected",
}: RemoteControlProps) {
  const [config, setConfig] = useState<MatchConfig>(initialConfig);

  // Update local state when initialConfig changes (from WebSocket)
  useEffect(() => {
    setConfig(initialConfig);
  }, [initialConfig]);

  const updateConfig = (updates: Partial<MatchConfig>) => {
    const newConfig = { ...config, ...updates };
    setConfig(newConfig);
    onConfigChange?.(newConfig);
  };

  const updateTeam1 = (updates: Partial<typeof config.team1>) => {
    updateConfig({ team1: { ...config.team1, ...updates } });
  };

  const updateTeam2 = (updates: Partial<typeof config.team2>) => {
    updateConfig({ team2: { ...config.team2, ...updates } });
  };

  const resetSets = () => {
    updateConfig({
      team1: { ...config.team1, setScore: 0 },
      team2: { ...config.team2, setScore: 0 },
    });
  };

  const resetMatch = () => {
    updateConfig({
      team1: { ...config.team1, matchScore: 0 },
      team2: { ...config.team2, matchScore: 0 },
    });
  };

  const TeamControls = ({
    team,
    onUpdate,
    teamNumber,
  }: {
    team: typeof config.team1;
    onUpdate: (updates: Partial<typeof config.team1>) => void;
    teamNumber: 1 | 2;
  }) => (
    <div className="flex-1">
      <div
        className="text-white font-bold text-center py-2 rounded-t-md"
        style={{ backgroundColor: team.bgColor }}
      >
        <Input
          value={team.name}
          onChange={(e) => onUpdate({ name: e.target.value })}
          className="bg-transparent border-none text-white text-center font-bold h-auto p-0 focus-visible:ring-0"
          data-testid={`input-team${teamNumber}-name`}
        />
      </div>

      <div className="bg-card p-2 space-y-1 rounded-b-md border border-card-border">
        {/* Score display */}
        <div className="flex justify-center gap-2 text-lg font-bold mb-2">
          <span data-testid={`team${teamNumber}-set-display`}>{team.setScore}</span>
          <span data-testid={`team${teamNumber}-match-display`}>{team.matchScore}</span>
          <div className="flex gap-1 items-center text-xs">
            <span>B:</span>
            <Input
              type="color"
              value={team.bgColor}
              onChange={(e) => onUpdate({ bgColor: e.target.value })}
              className="h-5 w-5 p-0 border-none"
              data-testid={`input-team${teamNumber}-bg`}
            />
            <span>T:</span>
            <Input
              type="color"
              value={team.textColor}
              onChange={(e) => onUpdate({ textColor: e.target.value })}
              className="h-5 w-5 p-0 border-none"
              data-testid={`input-team${teamNumber}-text`}
            />
          </div>
        </div>

        {/* Set score buttons - LARGE */}
        <div className="grid grid-cols-2 gap-1">
          <Button
            size="lg"
            onClick={() => onUpdate({ setScore: team.setScore + 1 })}
            data-testid={`button-team${teamNumber}-set-increment`}
            className="h-16 text-base"
          >
            + Score
          </Button>
          <Button
            size="lg"
            onClick={() => onUpdate({ setScore: Math.max(0, team.setScore - 1) })}
            data-testid={`button-team${teamNumber}-set-decrement`}
            className="h-16 text-base"
          >
            - Score
          </Button>
        </div>

        {/* Match score buttons - MEDIUM */}
        <div className="grid grid-cols-2 gap-1">
          <Button
            variant="secondary"
            onClick={() => onUpdate({ matchScore: team.matchScore + 1 })}
            data-testid={`button-team${teamNumber}-match-increment`}
            className="h-12"
          >
            + Sets
          </Button>
          <Button
            variant="secondary"
            onClick={() => onUpdate({ matchScore: Math.max(0, team.matchScore - 1) })}
            data-testid={`button-team${teamNumber}-match-decrement`}
            className="h-12"
          >
            - Sets
          </Button>
        </div>

        {/* Sv, RS, RM buttons - SMALL */}
        <div className="grid grid-cols-3 gap-1">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              onUpdate({ serving: true });
              if (teamNumber === 1) {
                updateTeam2({ serving: false });
              } else {
                updateTeam1({ serving: false });
              }
            }}
            data-testid={`button-team${teamNumber}-serve`}
            className={team.serving ? "bg-primary text-primary-foreground" : ""}
          >
            Sv
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={resetSets}
            data-testid="button-reset-sets"
          >
            RS
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={resetMatch}
            data-testid="button-reset-match"
          >
            RM
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background p-3">
      <div className="max-w-md mx-auto space-y-3">
        {/* Compact Header */}
        <div className="flex items-center justify-between text-sm">
          <div>
            <span className="font-bold">Game: </span>
            <span className="font-mono" data-testid="match-id">{config.matchId}</span>
          </div>
          <ConnectionStatus status={connectionStatus} />
        </div>

        {/* Team Controls Side by Side */}
        <div className="flex gap-2">
          <TeamControls team={config.team1} onUpdate={updateTeam1} teamNumber={1} />
          <TeamControls team={config.team2} onUpdate={updateTeam2} teamNumber={2} />
        </div>
      </div>
    </div>
  );
}
