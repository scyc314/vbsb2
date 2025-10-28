import ScoreboardDisplay from '../ScoreboardDisplay';
import { defaultMatchConfig } from '@shared/schema';

export default function ScoreboardDisplayExample() {
  const sampleConfig = {
    ...defaultMatchConfig,
    team1: {
      ...defaultMatchConfig.team1,
      name: "Lakers",
      setScore: 21,
      matchScore: 2,
      serving: true,
    },
    team2: {
      ...defaultMatchConfig.team2,
      name: "Warriors",
      setScore: 18,
      matchScore: 1,
      serving: false,
    },
  };

  return <ScoreboardDisplay config={sampleConfig} />;
}
