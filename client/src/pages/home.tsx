import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Monitor, Radio } from "lucide-react";

export default function HomePage() {
  const [matchId, setMatchId] = useState("demo-match");

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <Card className="max-w-2xl w-full">
        <CardHeader>
          <CardTitle className="text-3xl">Scoreboard Application</CardTitle>
          <CardDescription>
            Create and control live scoreboards for your video streams
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="matchid">Match ID</Label>
            <Input
              id="matchid"
              placeholder="Enter a unique match identifier"
              value={matchId}
              onChange={(e) => setMatchId(e.target.value)}
              data-testid="input-match-id"
            />
            <p className="text-sm text-muted-foreground">
              Use the same Match ID for both the remote control and scoreboard display
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="gap-2">
                <Radio className="h-8 w-8 text-primary" />
                <CardTitle className="text-lg">Remote Control</CardTitle>
                <CardDescription>
                  Update scores, team names, and display settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <Link href={`/remote?matchid=${matchId}`}>
                  <Button className="w-full" data-testid="button-open-remote">
                    Open Remote Control
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="gap-2">
                <Monitor className="h-8 w-8 text-primary" />
                <CardTitle className="text-lg">Scoreboard Display</CardTitle>
                <CardDescription>
                  Choose a layout for your video stream overlay
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <Link href={`/scoreboard?matchid=${matchId}&layout=sideBySide`}>
                  <Button variant="outline" className="w-full" data-testid="button-open-side">
                    Side by Side
                  </Button>
                </Link>
                <Link href={`/scoreboard?matchid=${matchId}&layout=stacked`}>
                  <Button variant="outline" className="w-full" data-testid="button-open-stacked">
                    Stacked
                  </Button>
                </Link>
                <Link href={`/scoreboard?matchid=${matchId}&layout=scoreboard`}>
                  <Button variant="outline" className="w-full" data-testid="button-open-scoreboard">
                    Scoreboard
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>

          <div className="bg-muted p-4 rounded-lg space-y-2">
            <h3 className="font-semibold text-sm">How it works:</h3>
            <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
              <li>Enter a unique Match ID above</li>
              <li>Open the Remote Control to configure and update scores</li>
              <li>Open the Scoreboard Display in your streaming software as a browser source</li>
              <li>Updates from the remote will instantly appear on the scoreboard</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
