import { useGoalsContext } from '@/contexts/goals-context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Target, Flame, TrendingUp, CheckCircle2 } from 'lucide-react';
import { formatGoalPeriod } from '@/lib/types/goals';
import type { GoalPeriod } from '@/lib/types/goals';

interface GoalProgressWidgetProps {
  period?: GoalPeriod;
  showStreak?: boolean;
  compact?: boolean;
  className?: string;
}

export function GoalProgressWidget({ 
  period = 'daily', 
  showStreak = true,
  compact = false,
  className = ''
}: GoalProgressWidgetProps) {
  const { stats } = useGoalsContext();
  const periodStats = stats[period];

  if (!periodStats.isActive) {
    return null;
  }

  const isGoalMet = periodStats.achieved >= periodStats.target;

  if (compact) {
    return (
      <div className={`space-y-2 ${className}`}>
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium">{formatGoalPeriod(period)} Goal</span>
          <span className="text-muted-foreground">
            {periodStats.achieved}/{periodStats.target} words
          </span>
        </div>
        <Progress value={periodStats.percentage} className="h-2" />
        {showStreak && periodStats.streak > 0 && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Flame className="h-3 w-3 text-orange-500" />
            <span>{periodStats.streak} day streak</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          {formatGoalPeriod(period)} Goal
        </CardTitle>
        {isGoalMet ? (
          <CheckCircle2 className="h-4 w-4 text-green-500" />
        ) : (
          <Target className="h-4 w-4 text-muted-foreground" />
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div>
            <div className="text-2xl font-bold">
              {periodStats.achieved.toLocaleString()} words
            </div>
            <p className="text-xs text-muted-foreground">
              of {periodStats.target.toLocaleString()} target ({periodStats.percentage}%)
            </p>
          </div>
          
          <Progress 
            value={periodStats.percentage} 
            className="h-2"
          />
          
          {showStreak && (
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1">
                <Flame className="h-3 w-3 text-orange-500" />
                <span>{periodStats.streak} day streak</span>
              </div>
              <div className="flex items-center gap-1">
                <TrendingUp className="h-3 w-3 text-green-500" />
                <span>{periodStats.averageWords} avg/day</span>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

interface MiniGoalWidgetProps {
  className?: string;
}

export function MiniGoalWidget({ className = '' }: MiniGoalWidgetProps) {
  const { stats, getTodayProgress } = useGoalsContext();
  const todayProgress = getTodayProgress();
  const todayWords = todayProgress.reduce((sum, p) => sum + p.wordsWritten, 0);
  
  if (!stats.daily.isActive) {
    return null;
  }

  const percentage = Math.min(Math.round((todayWords / stats.daily.target) * 100), 100);
  const isGoalMet = todayWords >= stats.daily.target;

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="flex-1 space-y-1">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Today's Goal</span>
          <span className="font-medium">
            {todayWords}/{stats.daily.target}
          </span>
        </div>
        <Progress value={percentage} className="h-1.5" />
      </div>
      {isGoalMet && <CheckCircle2 className="h-4 w-4 text-green-500" />}
      {stats.daily.streak > 0 && (
        <div className="flex items-center gap-0.5 text-xs">
          <Flame className="h-3 w-3 text-orange-500" />
          <span>{stats.daily.streak}</span>
        </div>
      )}
    </div>
  );
}