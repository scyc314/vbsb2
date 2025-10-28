import { type MatchConfig } from "@shared/schema";
import volleyballIcon from "@assets/stock_images/volleyball_390db037.jpg";

interface ScoreboardDisplayProps {
  config: MatchConfig;
}

export default function ScoreboardDisplay({ config }: ScoreboardDisplayProps) {
  const { layout, fontFamily, fontSize, team1, team2 } = config;

  const TeamSection = ({
    team,
    position,
  }: {
    team: typeof team1;
    position: "left" | "right" | "top" | "bottom";
  }) => (
    <div
      className="flex-1 p-6 rounded-lg flex flex-col justify-center items-center relative"
      style={{
        backgroundColor: team.bgColor,
        color: team.textColor,
        fontFamily: fontFamily,
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

  if (layout === "sideBySide") {
    return (
      <div className="h-screen w-screen bg-transparent p-4" data-testid="scoreboard-display">
        <div className="flex gap-4 h-full">
          <TeamSection team={team1} position="left" />
          <TeamSection team={team2} position="right" />
        </div>
      </div>
    );
  }

  if (layout === "stacked") {
    return (
      <div className="h-screen w-screen bg-transparent p-4" data-testid="scoreboard-display">
        <div className="flex flex-col gap-4 h-full">
          <TeamSection team={team1} position="top" />
          <TeamSection team={team2} position="bottom" />
        </div>
      </div>
    );
  }

  // Scoreboard layout - large numbers on colored backgrounds
  return (
    <div className="h-screen w-screen bg-black flex" data-testid="scoreboard-display">
      <div
        className="flex-1 flex flex-col items-center justify-center relative"
        style={{ backgroundColor: team1.bgColor, color: team1.textColor }}
      >
        {team1.serving && (
          <img
            src={volleyballIcon}
            alt="Serving"
            className="absolute top-8 right-8 h-12 w-12 rounded-full object-cover"
            data-testid="serving-indicator-left"
          />
        )}
        <div className="text-4xl font-bold mb-4" data-testid="team-name-left">
          {team1.name}
        </div>
        <div
          className="font-black"
          style={{ fontSize: `${fontSize * 2}px`, fontFamily }}
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
        style={{ backgroundColor: team2.bgColor, color: team2.textColor }}
      >
        {team2.serving && (
          <img
            src={volleyballIcon}
            alt="Serving"
            className="absolute top-8 right-8 h-12 w-12 rounded-full object-cover"
            data-testid="serving-indicator-right"
          />
        )}
        <div className="text-4xl font-bold mb-4" data-testid="team-name-right">
          {team2.name}
        </div>
        <div
          className="font-black"
          style={{ fontSize: `${fontSize * 2}px`, fontFamily }}
          data-testid="set-score-right"
        >
          {team2.setScore}
        </div>
        <div className="text-2xl mt-4 opacity-75">
          Sets: <span data-testid="match-score-right">{team2.matchScore}</span>
        </div>
      </div>
    </div>
  );
}
