import { type MatchConfig } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getMatch(matchId: string): Promise<MatchConfig | undefined>;
  createMatch(match: MatchConfig): Promise<MatchConfig>;
  updateMatch(matchId: string, updates: Partial<MatchConfig>): Promise<MatchConfig | undefined>;
  deleteMatch(matchId: string): Promise<boolean>;
  getAllMatches(): Promise<MatchConfig[]>;
}

export class MemStorage implements IStorage {
  private matches: Map<string, MatchConfig>;

  constructor() {
    this.matches = new Map();
  }

  async getMatch(matchId: string): Promise<MatchConfig | undefined> {
    return this.matches.get(matchId);
  }

  async createMatch(match: MatchConfig): Promise<MatchConfig> {
    this.matches.set(match.matchId, match);
    return match;
  }

  async updateMatch(matchId: string, updates: Partial<MatchConfig>): Promise<MatchConfig | undefined> {
    const existing = this.matches.get(matchId);
    if (!existing) return undefined;
    
    const updated = { ...existing, ...updates };
    this.matches.set(matchId, updated);
    return updated;
  }

  async deleteMatch(matchId: string): Promise<boolean> {
    return this.matches.delete(matchId);
  }

  async getAllMatches(): Promise<MatchConfig[]> {
    return Array.from(this.matches.values());
  }
}

export const storage = new MemStorage();
