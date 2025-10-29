import { type MatchConfig } from "@shared/schema";
import volleyballIcon from "@assets/stock_images/volleyball_390db037.jpg";

interface ScoreboardDisplayProps {
  config: MatchConfig;
}

// Fixed dimensions for the high-resolution output (e.g., 1920x1080)
// The browser will render this huge element and then downscale it to fit the window.
const BOARD_WIDTH = 1920; 
const BOARD_HEIGHT = 1080;

export default function ScoreboardDisplay({ config }: ScoreboardDisplayProps) {
  const { layout, fontFamily, fontSize, team1, team2 } = config;

  // --- REUSABLE TEAM SECTION (Used for sideBySide logic) ---
  const TeamSection = ({
    team,
    position,
  }: {
    team: typeof team1;
    position: "left" | "right" | "top" | "bottom";
  }) => (
    <div
      className="flex-1 p-6 rounded-lg flex flex-col justify-center items-center relative"
      // Use the default Inter font for all Tailwind-based layouts for consistency
      style={{
        backgroundColor: team.bgColor,
        color: team.textColor,
        fontFamily: 'Inter, Arial, sans-serif', // Explicit font stack
      }}
      data-testid={`team-${position}-section`}
    >
      <div className="flex items-center gap-3 text-2xl font-bold mb-4">
        {team.serving && (
          <img
            src={volleyballIcon}
            alt="Serving"
            className="h-8 w-8 rounded-full object-cover"
            data-testid={`serving-indicator-${position}`}
          />
        )}
        <span data-testid={`team-name-${position}`}>{team.name}</span>
      </div>
      <div className="flex items-center gap-8">
        <div className="text-center">
          <div className="text-xs uppercase tracking-wide opacity-75 mb-1">Set</div>
          <div
            className="font-black"
            style={{ fontSize: `${fontSize}px` }}
            data-testid={`set-score-${position}`}
          >
            {team.setScore}
          </div>
        </div>
        <div className="text-center">
          <div className="text-xs uppercase tracking-wide opacity-75 mb-1">Match</div>
          <div
            className="font-black"
            style={{ fontSize: `${fontSize * 0.75}px` }}
            data-testid={`match-score-${position}`}
          >
            {team.matchScore}
          </div>
        </div>
      </div>
    </div>
  );
  
  // --- LAYOUT: SIDE BY SIDE (FIXED RESOLUTION) ---
  if (layout === "sideBySide") {
    // Apply FIXED resolution to the outer container
    return (
      <div 
        style={{ width: BOARD_WIDTH, height: BOARD_HEIGHT }} 
        className="fixed-resolution-wrapper" 
        data-testid="scoreboard-display-wrapper"
      >
        <div className="h-full w-full bg-transparent p-4" data-testid="scoreboard-display">
          <div className="flex gap-4 h-full">
            <TeamSection team={team1} position="left" />
            <TeamSection team={team2} position="right" />
          </div>
        </div>
      </div>
    );
  }

  // --- LAYOUT: LEGACY STACKED (FIXED RESOLUTION) ---
  if (layout === "stacked") {
    const { team1, team2 } = config;
    
    // Legacy styling relies on fixed pixel sizes
    document.documentElement.style.setProperty('--legacy-team1-bg-color', team1.bgColor);
    document.documentElement.style.setProperty('--legacy-team1-text-color', team1.textColor);
    document.documentElement.style.setProperty('--legacy-team2-bg-color', team2.bgColor);
    document.documentElement.style.setProperty('--legacy-team2-text-color', team2.textColor);
    
    // NOTE: This layout uses a fixed font (Arial/sans-serif) defined in CSS
    const LegacyTeamRow = ({ team, position }: { team: typeof team1, position: 'top' | 'bottom' }) => (
      <div 
        className={`legacy-team-row legacy-team-${position} ${team.serving ? 'serving' : ''}`}
        data-testid={`team-${position}-section`}
        style={{ color: team.textColor }} // Font will be set by CSS to Arial
      >
          <span 
            className="legacy-field-setswon flex-shrink-0 text-[18px] text-center bg-gray-700/80 leading-[35px] align-middle"
            data-testid={`match-score-${position}`}
          >
            {team.matchScore}
          </span>
          
          <span 
            className="legacy-field-name flex-shrink-0 pl-[5px]"
            data-testid={`team-name-${position}`}
          >
            {team.name}
          </span>
          
          <span className="legacy-field-serving flex-shrink-0 flex justify-center items-center">
            {team.serving ? 
              <img src={volleyballIcon} alt="Serving" className="h-full w-auto max-h-full max-w-full" /> 
              : 
              <span className="w-full">&nbsp;</span>
            }
          </span>
          
          <span 
            className="legacy-field-setscore flex-shrink-0 text-center"
            data-testid={`set-score-${position}`}
          >
            {team.setScore}
          </span>
      </div>
    );

    return (
      <div 
        style={{ width: BOARD_WIDTH, height: BOARD_HEIGHT }} 
        className="fixed-resolution-wrapper" 
        data-testid="scoreboard-display-wrapper"
      >
        <div className="legacy-stack-layout mt-[15px] ml-[15px] text-[0] w-fit">
          <LegacyTeamRow team={team1} position="top" />
          <LegacyTeamRow team={team2} position="bottom" />
        </div>
      </div>
    );
  }

  // --- LAYOUT: SCOREBOARD (FIXED RESOLUTION) ---
  return (
    <div 
      style={{ width: BOARD_WIDTH, height: BOARD_HEIGHT }} 
      className="fixed-resolution-wrapper" 
      data-testid="scoreboard-display-wrapper"
    >
      <div className="h-full w-full bg-black flex" data-testid="scoreboard-display">
        <div
          className="flex-1 flex flex-col items-center justify-center relative"
          style={{ backgroundColor: team1.bgColor, color: team1.textColor, fontFamily: 'Inter, Arial, sans-serif' }}
        >
          {team1.serving && (
            <img
              src={volleyballIcon}
              alt="Serving"
              className="h-12 w-12 rounded-full object-cover absolute top-8 right-8"
              data-testid="serving-indicator-left"
            />
          )}
          <div className="text-4xl font-bold mb-4" data-testid="team-name-left">
            {team1.name}
          </div>
          <div
            className="font-black"
            style={{ fontSize: `${fontSize * 2}px` }}
            data-testid="set-score-left"
          >
            {team1.setScore}
          </div>
          <div className="text-2xl mt-4 opacity-75">
            Sets: <span data-testid="match-score-left">{team1.matchScore}</span>
          </div>
        </div>
        <div
          className="flex-1 flex flex-col items-center justify-center relative"
          style={{ backgroundColor: team2.bgColor, color: team2.textColor, fontFamily: 'Inter, Arial, sans-serif' }}
        >
          {team2.serving && (
            <img
              src={volleyballIcon}
              alt="Serving"
              className="h-12 w-12 rounded-full object-cover absolute top-8 right-8"
              data-testid="serving-indicator-right"
            />
          )}
          <div className="text-4xl font-bold mb-4" data-testid="team-name-right">
            {team2.name}
          </div>
          <div
            className="font-black"
            style={{ fontSize: `${fontSize * 2}px` }}
            data-testid="set-score-right"
          >
            {team2.setScore}
          </div>
          <div className="text-2xl mt-4 opacity-75">
            Sets: <span data-testid="match-score-right">{team2.matchScore}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
