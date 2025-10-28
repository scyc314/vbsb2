import { useState, useEffect, useCallback, useRef } from "react";
import { type MatchConfig } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ConnectionStatus from "./ConnectionStatus";

interface RemoteControlProps {
  initialConfig: MatchConfig;
  onConfigChange?: (config: MatchConfig) => void;
  connectionStatus?: "connected" | "disconnected" | "reconnecting";
}

// --- DEBOUNCE UTILITY (Helper for smooth color changes) ---
const useDebounce = (callback: (...args: any[]) => void, delay: number) => {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback; // Update callback reference on re-render
  }, [callback]);

  return useCallback((...args: any[]) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      callbackRef.current(...args);
    }, delay);
  }, [delay]);
};
// -----------------------------------------------------------


export default function RemoteControl({
  initialConfig,
  onConfigChange,
  connectionStatus = "connected",
}: RemoteControlProps) {
  const [config, setConfig] = useState<MatchConfig>(initialConfig);
  
  // Name Fix: Separate local state for names to prevent focus loss
  const [team1Name, setTeam1Name] = useState(initialConfig.team1.name);
  const [team2Name, setTeam2Name] = useState(initialConfig.team2.name);

  // Color Fix: Separate local state for colors to prevent focus loss
  const [team1Bg, setTeam1Bg] = useState(initialConfig.team1.bgColor);
  const [team2Bg, setTeam2Bg] = useState(initialConfig.team2.bgColor);
  const [team1Text, setTeam1Text] = useState(initialConfig.team1.textColor);
  const [team2Text, setTeam2Text] = useState(initialConfig.team2.textColor);

  // Update ALL local states when initialConfig changes (from WebSocket/server)
  useEffect(() => {
    setConfig(initialConfig);
    setTeam1Name(initialConfig.team1.name);
    setTeam2Name(initialConfig.team2.name);
    setTeam1Bg(initialConfig.team1.bgColor);
    setTeam2Bg(initialConfig.team2.bgColor);
    setTeam1Text(initialConfig.team1.textColor);
    setTeam2Text(initialConfig.team2.textColor);
  }, [initialConfig]);

  const updateConfig = (updates: Partial<MatchConfig>) => {
    const newConfig = { ...config, ...updates };
    setConfig(newConfig);
    // DO NOT CALL onConfigChange here to prevent sending partial updates for non-score fields
  };
  
  // --- NEW: Debounced function to send the full state update ---
  // Only call this function when the user is done interacting (name/color)
  const debouncedSendUpdate = useDebounce((newConfig: MatchConfig) => {
    onConfigChange?.(newConfig);
  }, 300); // Send update after 300ms of no activity

  // Function to commit the local state to the main config and trigger a debounced send
  const commitUpdateAndDebounceSend = (updates: Partial<MatchConfig>) => {
      const newConfig = { ...config, ...updates };
      setConfig(newConfig);
      debouncedSendUpdate(newConfig);
  };

  const updateTeam1 = (updates: Partial<typeof config.team1>) => {
    commitUpdateAndDebounceSend({ team1: { ...config.team1, ...updates } });
  };

  const updateTeam2 = (updates: Partial<typeof config.team2>) => {
    commitUpdateAndDebounceSend({ team2: { ...config.team2, ...updates } });
  };
  
  // Handler for Name Update (onBlur)
  const handleNameUpdate = (teamNumber: 1 | 2, newName: string) => {
    if (teamNumber === 1) {
      updateTeam1({ name: newName });
    } else {
      updateTeam2({ name: newName });
    }
  };
  
  // Handler for Color Update (Debounced on change)
  const handleColorUpdate = (teamNumber: 1 | 2, key: 'bgColor' | 'textColor', newValue: string) => {
    if (teamNumber === 1) {
        if (key === 'bgColor') {
            setTeam1Bg(newValue); // Update fast local state
            updateTeam1({ bgColor: newValue }); // Commit to main config (debounced send)
        } else {
            setTeam1Text(newValue); // Update fast local state
            updateTeam1({ textColor: newValue }); // Commit to main config (debounced send)
        }
    } else {
        if (key === 'bgColor') {
            setTeam2Bg(newValue);
            updateTeam2({ bgColor: newValue });
        } else {
            setTeam2Text(newValue);
            updateTeam2({ textColor: newValue });
        }
    }
  };

  const resetSets = () => {
    commitUpdateAndDebounceSend({
      team1: { ...config.team1, setScore: 0 },
      team2: { ...config.team2, setScore: 0 },
    });
  };

  const resetMatch = () => {
    commitUpdateAndDebounceSend({
      team1: { ...config.team1, matchScore: 0 },
      team2: { ...config.team2, matchScore: 0 },
    });
  };
  
  // Score updates (setScore, matchScore) are instant and DO NOT use the debounce
  const updateScore = (teamNumber: 1 | 2, updates: Partial<typeof config.team1>) => {
    const currentConfig = { ...config };
    const newTeamConfig = { ...(teamNumber === 1 ? currentConfig.team1 : currentConfig.team2), ...updates };

    const newConfig = {
      ...currentConfig,
      [teamNumber === 1 ? 'team1' : 'team2']: newTeamConfig
    };

    setConfig(newConfig);
    onConfigChange?.(newConfig); // Score changes must be instant, so send immediately
  };
  
  // --- TeamControls Component (modified to use new score function and separate color state) ---
  const TeamControls = ({
    team,
    teamNumber,
    localName,
    setLocalName,
    localBg,
    localText,
  }: {
    team: typeof config.team1;
    teamNumber: 1 | 2;
    localName: string;
    setLocalName: React.Dispatch<React.SetStateAction<string>>;
    localBg: string; // New Prop
    localText: string; // New Prop
  }) => (
    <div className="flex-1">
      <div
        className="text-white font-bold text-center py-2 rounded-t-md"
        style={{ backgroundColor: localBg }} // Use fast local state for color preview
      >
        {/* Name Fix: Use local state and update onBlur */}
        <Input
          value={localName}
          onChange={(e) => setLocalName(e.target.value)}
          onBlur={() => handleNameUpdate(teamNumber, localName)}
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
            {/* Color Fix: Use local state for value and debounced handler for change */}
            <Input
              type="color"
              value={localBg}
              onChange={(e) => handleColorUpdate(teamNumber, 'bgColor', e.target.value)}
              className="h-5 w-5 p-0 border-none"
              data-testid={`input-team${teamNumber}-bg`}
            />
            <span>T:</span>
            <Input
              type="color"
              value={localText}
              onChange={(e) => handleColorUpdate(teamNumber, 'textColor', e.target.value)}
              className="h-5 w-5 p-0 border-none"
              data-testid={`input-team${teamNumber}-text`}
            />
          </div>
        </div>

        {/* Set score buttons - LARGE (Instant Update) */}
        <div className="grid grid-cols-2 gap-1">
          <Button
            size="lg"
            onClick={() => updateScore(teamNumber, { setScore: team.setScore + 1 })}
            data-testid={`button-team${teamNumber}-set-increment`}
            className="h-16 text-base"
          >
            + Score
          </Button>
          <Button
            size="lg"
            onClick={() => updateScore(teamNumber, { setScore: Math.max(0, team.setScore - 1) })}
            data-testid={`button-team${teamNumber}-set-decrement`}
            className="h-16 text-base"
          >
            - Score
          </Button>
        </div>

        {/* Match score buttons - MEDIUM (Instant Update) */}
        <div className="grid grid-cols-2 gap-1">
          <Button
            variant="secondary"
            onClick={() => updateScore(teamNumber, { matchScore: team.matchScore + 1 })}
            data-testid={`button-team${teamNumber}-match-increment`}
            className="h-12"
          >
            + Sets
          </Button>
          <Button
            variant="secondary"
            onClick={() => updateScore(teamNumber, { matchScore: Math.max(0, team.matchScore - 1) })}
            data-testid={`button-team${teamNumber}-match-decrement`}
            className="h-12"
          >
            - Sets
          </Button>
        </div>

        {/* Sv, RS, RM buttons - SMALL (Debounced Update for Sv/Reset, Instant for Serving swap) */}
        <div className="grid grid-cols-3 gap-1">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              // Serving swap needs to be INSTANT
              const newServingUpdates = { serving: true };
              const otherUpdates = { serving: false };

              // Apply the new updates instantly and send the final config
              const newConfig = { ...config };
              if (teamNumber === 1) {
                  newConfig.team1 = { ...config.team1, ...newServingUpdates };
                  newConfig.team2 = { ...config.team2, ...otherUpdates };
              } else {
                  newConfig.team2 = { ...config.team2, ...newServingUpdates };
                  newConfig.team1 = { ...config.team1, ...otherUpdates };
              }
              setConfig(newConfig);
              onConfigChange?.(newConfig); // Send immediately
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
          <TeamControls 
            team={config.team1} 
            teamNumber={1} 
            localName={team1Name}
            setLocalName={setTeam1Name}
            localBg={team1Bg}
            localText={team1Text}
          />
          <TeamControls 
            team={config.team2} 
            teamNumber={2} 
            localName={team2Name}
            setLocalName={setTeam2Name}
            localBg={team2Bg}
            localText={team2Text}
          />
        </div>
      </div>
    </div>
  );
}
