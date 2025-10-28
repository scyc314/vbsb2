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

// --- EXTRACTED/REWRITTEN TEAM CONTROLS COMPONENT (Handles its own local state) ---

interface TeamControlsProps {
    config: MatchConfig;
    teamNumber: 1 | 2;
    onUpdate: (updates: Partial<MatchConfig>) => void; // Function to send full config back to parent
}

// NOTE: This component is defined *outside* the main component to isolate its render cycle
const TeamControlsInternal = ({ // Internal name changed to avoid conflict with the file export
    config,
    teamNumber,
    onUpdate,
}: TeamControlsProps) => {
    
    const team = teamNumber === 1 ? config.team1 : config.team2;
    const otherTeam = teamNumber === 1 ? config.team2 : config.team1;

    // 1. Local State for Editable Fields (to prevent focus loss during typing/dragging)
    const [localName, setLocalName] = useState(team.name);
    const [localBg, setLocalBg] = useState(team.bgColor);
    const [localText, setLocalText] = useState(team.textColor);

    // 2. Sync local state when the config (from WebSocket) changes
    useEffect(() => {
        // Only update local state if the incoming server value is different from the current local value
        if (team.name !== localName) setLocalName(team.name);
        if (team.bgColor !== localBg) setLocalBg(team.bgColor);
        if (team.textColor !== localText) setLocalText(team.textColor);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [team.name, team.bgColor, team.textColor]);


    // 3. Helper to commit the local change to the parent config state
    const commitLocalUpdate = (updates: Partial<typeof team>) => {
        const teamKey = teamNumber === 1 ? 'team1' : 'team2';
        
        // This calculates the full new config and sends it back to the parent
        const newConfig = { 
            ...config, 
            [teamKey]: { ...team, ...updates }
        } as MatchConfig;
        
        onUpdate(newConfig);
    };

    // 4. Handlers for buttons (score changes are instant)
    const handleScoreUpdate = (updates: Partial<typeof team>) => {
        commitLocalUpdate(updates);
    };

    const handleServingChange = () => {
        // Serving change needs to update BOTH teams in one go
        const newConfig = {
            ...config,
            [teamNumber === 1 ? 'team1' : 'team2']: { ...team, serving: true },
            [teamNumber === 1 ? 'team2' : 'team1']: { ...otherTeam, serving: false },
        } as MatchConfig;

        onUpdate(newConfig);
    };
    
    const handleResetSets = () => {
        const newConfig = {
            ...config,
            team1: { ...config.team1, setScore: 0 },
            team2: { ...config.team2, setScore: 0 },
        } as MatchConfig;
        onUpdate(newConfig);
    }
    
    const handleResetMatch = () => {
        const newConfig = {
            ...config,
            team1: { ...config.team1, matchScore: 0 },
            team2: { ...config.team2, matchScore: 0 },
        } as MatchConfig;
        onUpdate(newConfig);
    }
    
    // Handlers for Editable Fields (Name/Colors)
    const handleNameBlur = () => {
        // Commit name change when input loses focus
        commitLocalUpdate({ name: localName });
    };

    const handleColorCommit = (key: 'bgColor' | 'textColor', value: string) => {
        // Commit color change on input loses focus/mouseup/change end
        commitLocalUpdate({ [key]: value });
    };

    return (
        <div className="flex-1">
            <div
                className="text-white font-bold text-center py-2 rounded-t-md"
                style={{ backgroundColor: localBg }} // Use local state for color preview
            >
                {/* NAME INPUT (Fix: Updates localName on change, commits onBlur) */}
                <Input
                    value={localName}
                    onChange={(e) => setLocalName(e.target.value)} // Fast local update
                    onBlur={handleNameBlur} // Slow server update
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
                        {/* BG COLOR (Fix: Updates localBg on change, commits on change end) */}
                        <Input
                            type="color"
                            value={localBg}
                            onChange={(e) => {
                                setLocalBg(e.target.value); // Fast local update
                                handleColorCommit('bgColor', e.target.value); // Commit immediately (only triggers on change end)
                            }}
                            className="h-5 w-5 p-0 border-none"
                            data-testid={`input-team${teamNumber}-bg`}
                        />
                        <span>T:</span>
                        {/* TEXT COLOR (Fix: Updates localText on change, commits on change end) */}
                        <Input
                            type="color"
                            value={localText}
                            onChange={(e) => {
                                setLocalText(e.target.value); // Fast local update
                                handleColorCommit('textColor', e.target.value); // Commit immediately
                            }}
                            className="h-5 w-5 p-0 border-none"
                            data-testid={`input-team${teamNumber}-text`}
                        />
                    </div>
                </div>

                {/* Set score buttons - LARGE */}
                <div className="grid grid-cols-2 gap-1">
                    <Button
                        size="lg"
                        onClick={() => handleScoreUpdate({ setScore: team.setScore + 1 })}
                        data-testid={`button-team${teamNumber}-set-increment`}
                        className="h-16 text-base"
                    >
                        + Score
                    </Button>
                    <Button
                        size="lg"
                        onClick={() => handleScoreUpdate({ setScore: Math.max(0, team.setScore - 1) })}
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
                        onClick={() => handleScoreUpdate({ matchScore: team.matchScore + 1 })}
                        data-testid={`button-team${teamNumber}-match-increment`}
                        className="h-12"
                    >
                        + Sets
                    </Button>
                    <Button
                        variant="secondary"
                        onClick={() => handleScoreUpdate({ matchScore: Math.max(0, team.matchScore - 1) })}
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
                        onClick={handleServingChange}
                        data-testid={`button-team${teamNumber}-serve`}
                        className={team.serving ? "bg-primary text-primary-foreground" : ""}
                    >
                        Sv
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleResetSets}
                        data-testid="button-reset-sets"
                    >
                        RS
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleResetMatch}
                        data-testid="button-reset-match"
                    >
                        RM
                    </Button>
                </div>
            </div>
        </div>
    );
}
// --- END EXTRACTED/REWRITTEN TEAM CONTROLS COMPONENT ---


// --- REMOTE CONTROL MAIN COMPONENT (Correctly exported) ---
export default function RemoteControl({
  initialConfig,
  onConfigChange,
  connectionStatus = "connected",
}: RemoteControlProps) {
    // Only manage the main config state here
    const [config, setConfig] = useState<MatchConfig>(initialConfig);
    
    // Sync the main config when the WebSocket sends a new initialConfig
    useEffect(() => {
        setConfig(initialConfig);
    }, [initialConfig]);

    // Pass the full config state to the TeamControls and define the update handler
    const handleUpdateFromControls = (newConfig: MatchConfig) => {
        setConfig(newConfig);
        onConfigChange?.(newConfig); // Send update via WebSocket
    }
    
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
                    <TeamControlsInternal 
                        config={config} 
                        teamNumber={1} 
                        onUpdate={handleUpdateFromControls}
                    />
                    <TeamControlsInternal 
                        config={config} 
                        teamNumber={2} 
                        onUpdate={handleUpdateFromControls}
                    />
                </div>
            </div>
        </div>
    );
}
