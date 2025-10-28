import { useState } from 'react';
import ScoreControl from '../ScoreControl';

export default function ScoreControlExample() {
  const [score, setScore] = useState(0);

  return (
    <div className="p-8 max-w-md">
      <ScoreControl
        label="Set Score"
        value={score}
        onIncrement={() => setScore(score + 1)}
        onDecrement={() => setScore(Math.max(0, score - 1))}
        testId="example-score"
      />
    </div>
  );
}
