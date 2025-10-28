import RemoteControl from '../RemoteControl';
import { defaultMatchConfig } from '@shared/schema';

export default function RemoteControlExample() {
  const sampleConfig = {
    ...defaultMatchConfig,
    matchId: "111",
    team1: {
      ...defaultMatchConfig.team1,
      name: "Team1",
      bgColor: "#d2691e",
      setScore: 0,
      matchScore: 0,
    },
    team2: {
      ...defaultMatchConfig.team2,
      name: "Team2",
      bgColor: "#0000ff",
      setScore: 0,
      matchScore: 0,
    },
  };

  return (
    <RemoteControl
      initialConfig={sampleConfig}
      onConfigChange={(config) => console.log("Config changed:", config)}
      connectionStatus="connected"
    />
  );
}
