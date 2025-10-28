import ConnectionStatus from '../ConnectionStatus';

export default function ConnectionStatusExample() {
  return (
    <div className="p-8 space-y-4">
      <ConnectionStatus status="connected" />
      <ConnectionStatus status="reconnecting" />
      <ConnectionStatus status="disconnected" />
    </div>
  );
}
