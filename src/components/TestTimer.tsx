
import { useState, useEffect } from "react";
import { AlertCircle, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { formatTimeRemaining } from "@/utils/supabaseHelper";
import { cn } from "@/lib/utils";

interface TestTimerProps {
  durationMinutes: number;
  onTimeEnd: () => void;
}

const TestTimer: React.FC<TestTimerProps> = ({ durationMinutes, onTimeEnd }) => {
  const [timeRemaining, setTimeRemaining] = useState<number>(durationMinutes * 60);
  const [isWarning, setIsWarning] = useState<boolean>(false);
  const totalSeconds = durationMinutes * 60;
  const percentRemaining = (timeRemaining / totalSeconds) * 100;
  
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(timer);
          onTimeEnd();
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [onTimeEnd]);
  
  useEffect(() => {
    // Show warning when less than 10% time remains or less than 5 minutes
    setIsWarning(
      percentRemaining < 10 || 
      (timeRemaining < 300 && durationMinutes > 30)
    );
  }, [timeRemaining, percentRemaining, durationMinutes]);

  return (
    <Card className={cn(
      "timer-container", 
      isWarning && "timer-warning"
    )}>
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center">
            <Clock className="h-5 w-5 mr-2" />
            <h3 className="font-medium">Time Remaining</h3>
          </div>
          {isWarning && (
            <div className="flex items-center text-red-600">
              <AlertCircle className="h-4 w-4 mr-1 animate-pulse" />
              <span className="text-sm font-medium">Time running out!</span>
            </div>
          )}
        </div>
        
        <div className="text-center">
          <span className={cn(
            "text-3xl font-bold",
            isWarning && "text-red-600"
          )}>
            {formatTimeRemaining(timeRemaining)}
          </span>
        </div>
        
        <Progress 
          value={percentRemaining} 
          className={cn(
            "h-2 transition-colors duration-300",
            percentRemaining < 30 ? "bg-red-100" : "bg-blue-100"
          )}
        />
        
        <Button 
          variant="destructive" 
          className="w-full btn-hover mt-2"
          onClick={onTimeEnd}
        >
          End Test
        </Button>
      </CardContent>
    </Card>
  );
};

export default TestTimer;
