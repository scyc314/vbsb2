import { Circle } from "lucide-react";

interface ConnectionStatusProps {
  status: "connected" | "disconnected" | "reconnecting";
}

export default function ConnectionStatus({ status }: ConnectionStatusProps) {
  const statusConfig = {
    connected: {
      color: "text-status-online",
      label: "Connected",
    },
    disconnected: {
      color: "text-status-busy",
      label: "Disconnected",
    },
    reconnecting: {
      color: "text-status-away",
      label: "Reconnecting...",
    },
  };

  const config = statusConfig[status];

  return (
    <div className="flex items-center gap-2" data-testid="connection-status">
      <Circle className={`h-3 w-3 fill-current ${config.color}`} />
      <span className="text-sm text-muted-foreground">{config.label}</span>
    </div>
  );
}
