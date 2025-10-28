import { useEffect, useRef, useState } from "react";
import { type MatchConfig } from "@shared/schema";

interface UseWebSocketOptions {
  matchId: string;
  onUpdate?: (config: MatchConfig) => void;
}

export function useWebSocket({ matchId, onUpdate }: UseWebSocketOptions) {
  const [connectionStatus, setConnectionStatus] = useState<
    "connected" | "disconnected" | "reconnecting"
  >("disconnected");
  const [config, setConfig] = useState<MatchConfig | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const onUpdateRef = useRef(onUpdate);

  // Keep onUpdate ref current
  useEffect(() => {
    onUpdateRef.current = onUpdate;
  }, [onUpdate]);

  useEffect(() => {
    let isActive = true;

    function connect() {
      if (wsRef.current?.readyState === WebSocket.OPEN || !isActive) {
        return;
      }

      try {
        const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
        const wsUrl = `${protocol}//${window.location.host}/ws`;
        const socket = new WebSocket(wsUrl);

        socket.onopen = () => {
          console.log("WebSocket connected for match:", matchId);
          setConnectionStatus("connected");
          reconnectAttemptsRef.current = 0;

          // Subscribe to match updates
          socket.send(JSON.stringify({ type: "subscribe", matchId }));
        };

        socket.onmessage = (event) => {
          try {
            const message = JSON.parse(event.data);
            if (message.type === "match-update") {
              setConfig(message.data);
              onUpdateRef.current?.(message.data);
            }
          } catch (error) {
            console.error("Failed to parse WebSocket message:", error);
          }
        };

        socket.onclose = () => {
          console.log("WebSocket disconnected");
          setConnectionStatus("disconnected");
          wsRef.current = null;

          if (!isActive) return;

          // Attempt to reconnect with exponential backoff
          const delay = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current), 10000);
          reconnectAttemptsRef.current++;
          setConnectionStatus("reconnecting");

          reconnectTimeoutRef.current = setTimeout(() => {
            if (isActive) {
              connect();
            }
          }, delay);
        };

        socket.onerror = (error) => {
          console.error("WebSocket error:", error);
        };

        wsRef.current = socket;
      } catch (error) {
        console.error("Failed to create WebSocket connection:", error);
        setConnectionStatus("disconnected");
      }
    }

    connect();

    return () => {
      isActive = false;
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [matchId]); // Only reconnect when matchId changes

  const sendUpdate = (updates: Partial<MatchConfig>) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          type: "update-match",
          matchId,
          updates,
        })
      );
    } else {
      console.warn("WebSocket not connected, cannot send update");
    }
  };

  return {
    connectionStatus,
    config,
    sendUpdate,
  };
}
