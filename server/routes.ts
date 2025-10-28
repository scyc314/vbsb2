import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { matchConfigSchema, defaultMatchConfig } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // REST API routes
  
  // Get match configuration
  app.get("/api/matches/:matchId", async (req, res) => {
    try {
      const { matchId } = req.params;
      let match = await storage.getMatch(matchId);
      
      // Create default match if it doesn't exist
      if (!match) {
        match = { ...defaultMatchConfig, matchId };
        await storage.createMatch(match);
      }
      
      res.json(match);
    } catch (error) {
      res.status(500).json({ error: "Failed to get match" });
    }
  });

  // Update match configuration
  app.post("/api/matches/:matchId", async (req, res) => {
    try {
      const { matchId } = req.params;
      const updates = matchConfigSchema.partial().parse(req.body);
      
      let match = await storage.getMatch(matchId);
      if (!match) {
        // Create new match if it doesn't exist
        match = { ...defaultMatchConfig, matchId, ...updates };
        await storage.createMatch(match);
      } else {
        match = await storage.updateMatch(matchId, updates);
      }
      
      // Broadcast update to all connected clients for this match
      broadcastToMatch(matchId, { type: "match-update", data: match });
      
      res.json(match);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid match data", details: error.errors });
      } else {
        res.status(500).json({ error: "Failed to update match" });
      }
    }
  });

  const httpServer = createServer(app);

  // WebSocket server setup
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

  // Store client connections by matchId
  const matchClients = new Map<string, Set<WebSocket>>();

  function broadcastToMatch(matchId: string, message: any) {
    const clients = matchClients.get(matchId);
    if (clients) {
      const messageStr = JSON.stringify(message);
      clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(messageStr);
        }
      });
    }
  }

  wss.on('connection', (ws: WebSocket) => {
    let currentMatchId: string | null = null;

    ws.on('message', async (message: string) => {
      try {
        const data = JSON.parse(message.toString());

        if (data.type === 'subscribe') {
          // Subscribe to a match
          const { matchId } = data;
          currentMatchId = matchId;

          if (!matchClients.has(matchId)) {
            matchClients.set(matchId, new Set());
          }
          matchClients.get(matchId)!.add(ws);

          // Send current match state
          let match = await storage.getMatch(matchId);
          if (!match) {
            match = { ...defaultMatchConfig, matchId };
            await storage.createMatch(match);
          }
          
          ws.send(JSON.stringify({ type: 'match-update', data: match }));
        } else if (data.type === 'update-match') {
          // Update match configuration
          const { matchId, updates } = data;
          const validUpdates = matchConfigSchema.partial().parse(updates);
          
          let match = await storage.getMatch(matchId);
          if (!match) {
            match = { ...defaultMatchConfig, matchId, ...validUpdates };
            await storage.createMatch(match);
          } else {
            match = await storage.updateMatch(matchId, validUpdates);
          }

          // Broadcast to all clients subscribed to this match
          broadcastToMatch(matchId, { type: 'match-update', data: match });
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
        ws.send(JSON.stringify({ type: 'error', message: 'Invalid message format' }));
      }
    });

    ws.on('close', () => {
      // Remove client from match subscription
      if (currentMatchId && matchClients.has(currentMatchId)) {
        matchClients.get(currentMatchId)!.delete(ws);
        if (matchClients.get(currentMatchId)!.size === 0) {
          matchClients.delete(currentMatchId);
        }
      }
    });

    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
    });
  });

  return httpServer;
}
