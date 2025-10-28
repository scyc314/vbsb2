import { z } from "zod";

// Match configuration schema
export const matchConfigSchema = z.object({
  matchId: z.string(),
  layout: z.enum(["sideBySide", "stacked", "scoreboard"]),
  fontFamily: z.string(),
  fontSize: z.number().min(12).max(120),
  team1: z.object({
    name: z.string(),
    bgColor: z.string(),
    textColor: z.string(),
    setScore: z.number().min(0),
    matchScore: z.number().min(0),
    serving: z.boolean(),
  }),
  team2: z.object({
    name: z.string(),
    bgColor: z.string(),
    textColor: z.string(),
    setScore: z.number().min(0),
    matchScore: z.number().min(0),
    serving: z.boolean(),
  }),
});

export type MatchConfig = z.infer<typeof matchConfigSchema>;

// Default match configuration
export const defaultMatchConfig: MatchConfig = {
  matchId: "default",
  layout: "sideBySide",
  fontFamily: "Inter",
  fontSize: 48,
  team1: {
    name: "Team 1",
    bgColor: "#1e40af",
    textColor: "#ffffff",
    setScore: 0,
    matchScore: 0,
    serving: true,
  },
  team2: {
    name: "Team 2",
    bgColor: "#dc2626",
    textColor: "#ffffff",
    setScore: 0,
    matchScore: 0,
    serving: false,
  },
};
