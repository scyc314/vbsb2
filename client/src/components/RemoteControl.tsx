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

const TeamControlsInternal = ({
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
    
    const handleNameBlur = () => {
        commitLocalUpdate({ name: localName });
    };

    const handleColorCommit = (key: 'bgColor' | 'textColor', value: string) => {
        commitLocalUpdate({ [key]: value });
    };

    return (
        <div className="flex-1">
            <div
                className="text-white font-bold text-center py-2 rounded-t-md"
                style={{ backgroundColor: localBg }}
            >
                <Input
                    value={localName}
                    onChange={(e) => setLocalName(e.target.value)}
                    onBlur={handleNameBlur}
                    className="bg-transparent border-none text-white text-center font-bold h-auto p-0 focus-visible:ring-0"
                    data-testid={`input-team${teamNumber}-name`}
                />
            </div>

            <div className="bg-card p-2 space-y-1 rounded-b-md border border-card-border">
                {/* Score display: Apply team colors to the score numbers and background */}
                <div 
                    className="flex justify-center gap-2 text-lg font-bold mb-2 p-2 rounded"
                    style={{ backgroundColor: localBg, color: localText }}
                >
                    <span data-testid={`team${teamNumber}-set-display`}>{team.setScore}</span>
                    <span data-testid={`team${teamNumber}-match-display`}>{team.matchScore}</span>
                    <div className="flex gap-1 items-center text-xs">
                        {/* The color inputs remain with default text, but the value is updated */}
                        <span className="text-white">B:</span>
                        <Input
                            type="color"
                            value={localBg}
                            onChange={(e) => {
                                setLocalBg(e.target.value);
                                handleColorCommit('bgColor', e.target.value);
                            }}
                            className="h-5 w-5 p-0 border-none"
                            data-testid={`input-team${teamNumber}-bg`}
                        />
                        <span className="text-white">T:</span>
                        <Input
                            type="color"
                            value={localText}
                            onChange={(e) => {
                                setLocalText(e.target.value);
                                handleColorCommit('textColor', e.target.value);
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

                {/* Match score buttons - MEDIUM (The +/-Sets buttons are secondary variant by default) */}
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
                    {/* RS/RM BUTTON FIX: Change variant from 'outline' to 'secondary' */}
                    <Button
                        variant="secondary"
                        size="sm"
                        onClick={handleResetSets}
                        data-testid="button-reset-sets"
                    >
                        RS
                    </Button>
                    <Button
                        variant="secondary"
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

// --- REMOTE CONTROL MAIN COMPONENT (Correctly exported) ---
export default function RemoteControl({
  initialConfig,
  onConfigChange,
  connectionStatus = "connected",
}: RemoteControlProps) {
    const [config, setConfig] = useState<MatchConfig>(initialConfig);
    
    useEffect(() => {
        setConfig(initialConfig);
    }, [initialConfig]);

    const handleUpdateFromControls = (newConfig: MatchConfig) => {
        setConfig(newConfig);
        onConfigChange?.(newConfig);
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
