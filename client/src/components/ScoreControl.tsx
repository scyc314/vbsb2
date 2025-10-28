import { Button } from "@/components/ui/button";
import { Minus, Plus } from "lucide-react";

interface ScoreControlProps {
  label: string;
  value: number;
  onIncrement: () => void;
  onDecrement: () => void;
  testId?: string;
}

export default function ScoreControl({
  label,
  value,
  onIncrement,
  onDecrement,
  testId,
}: ScoreControlProps) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">{label}</label>
      <div className="flex items-center gap-4">
        <Button
          size="icon"
          variant="outline"
          onClick={onDecrement}
          data-testid={`${testId}-decrement`}
          className="h-12 w-12"
        >
          <Minus className="h-5 w-5" />
        </Button>
        <div
          className="flex-1 text-center text-3xl font-bold"
          data-testid={`${testId}-value`}
        >
          {value}
        </div>
        <Button
          size="icon"
          variant="outline"
          onClick={onIncrement}
          data-testid={`${testId}-increment`}
          className="h-12 w-12"
        >
          <Plus className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}
