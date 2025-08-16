import { useState } from 'react';
import { AppLayout } from '@/components/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Target, 
  TrendingUp, 
  Calendar, 
  Settings, 
  Trophy,
  Flame,
  BarChart3,
  Clock,
  CheckCircle2
} from 'lucide-react';
import { useGoalsContext } from '@/contexts/goals-context';
import { formatGoalPeriod } from '@/lib/types/goals';
import type { GoalPeriod } from '@/lib/types/goals';
import { GoalSettingsDialog } from '@/components/goals/goal-settings-dialog';
import { WritingCalendar } from '@/components/goals/writing-calendar';

export default function GoalsPage() {
  const { stats, getTodayProgress } = useGoalsContext();
  const [selectedPeriod, setSelectedPeriod] = useState<GoalPeriod>('daily');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const todayProgress = getTodayProgress();

  const periods: GoalPeriod[] = ['daily', 'weekly', 'monthly', 'yearly'];

  return (
    <AppLayout title="Writing Goals" maxWidth="7xl">
      <div className="space-y-8">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">Writing Goals</h1>
            <p className="text-muted-foreground mt-2">
              Track your daily, weekly, and monthly writing progress
            </p>
          </div>
          <Button variant="outline" className="gap-2" onClick={() => setSettingsOpen(true)}>
            <Settings className="h-4 w-4" />
            Goal Settings
          </Button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today's Progress</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {todayProgress.reduce((sum, p) => sum + p.wordsWritten, 0)} words
              </div>
              <p className="text-xs text-muted-foreground">
                {stats.daily.percentage}% of daily goal
              </p>
              <Progress value={stats.daily.percentage} className="mt-2 h-1" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Current Streak</CardTitle>
              <Flame className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.daily.streak} days</div>
              <p className="text-xs text-muted-foreground">
                Best: {stats.daily.bestStreak} days
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Weekly Average</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.weekly.averageWords} words/day
              </div>
              <p className="text-xs text-muted-foreground">
                Last 7 days
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Total</CardTitle>
              <BarChart3 className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.monthly.achieved.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                {stats.monthly.percentage}% of monthly goal
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Goal Progress Tabs */}
        <Card>
          <CardHeader>
            <CardTitle>Goal Progress</CardTitle>
            <CardDescription>Track your progress across different time periods</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={selectedPeriod} onValueChange={(v) => setSelectedPeriod(v as GoalPeriod)}>
              <TabsList className="grid w-full grid-cols-4">
                {periods.map(period => (
                  <TabsTrigger key={period} value={period}>
                    {formatGoalPeriod(period)}
                  </TabsTrigger>
                ))}
              </TabsList>

              {periods.map(period => {
                const periodStat = stats[period];
                const isGoalMet = periodStat.achieved >= periodStat.target;

                return (
                  <TabsContent key={period} value={period} className="space-y-6 mt-6">
                    {/* Goal Status */}
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <h3 className="text-lg font-semibold">
                          {formatGoalPeriod(period)} Goal
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Target: {periodStat.target.toLocaleString()} words
                        </p>
                      </div>
                      <Badge variant={periodStat.isActive ? 'default' : 'secondary'}>
                        {periodStat.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium">
                          {periodStat.achieved.toLocaleString()} words written
                        </span>
                        <span className="text-muted-foreground">
                          {periodStat.percentage}%
                        </span>
                      </div>
                      <Progress 
                        value={periodStat.percentage} 
                        className="h-3"
                      />
                      <div className="flex items-center gap-2 text-sm">
                        {isGoalMet ? (
                          <>
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                            <span className="text-green-600">Goal achieved!</span>
                          </>
                        ) : (
                          <>
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span className="text-muted-foreground">
                              {periodStat.target - periodStat.achieved} words remaining
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Statistics Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Success Rate</p>
                        <p className="text-xl font-semibold">
                          {periodStat.totalDays > 0 
                            ? Math.round((periodStat.successfulDays / periodStat.totalDays) * 100)
                            : 0}%
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Successful Days</p>
                        <p className="text-xl font-semibold">
                          {periodStat.successfulDays}/{periodStat.totalDays}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Current Streak</p>
                        <p className="text-xl font-semibold">
                          {periodStat.streak} days
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Average/Day</p>
                        <p className="text-xl font-semibold">
                          {periodStat.averageWords}
                        </p>
                      </div>
                    </div>
                  </TabsContent>
                );
              })}
            </Tabs>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5" />
              Recent Achievements
            </CardTitle>
            <CardDescription>Your latest writing milestones</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Daily goal achieved</p>
                  <p className="text-xs text-muted-foreground">500 words written today</p>
                </div>
                <span className="text-xs text-muted-foreground">2 hours ago</span>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-orange-100 flex items-center justify-center">
                  <Flame className="h-4 w-4 text-orange-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">3-day streak!</p>
                  <p className="text-xs text-muted-foreground">Keep it going!</p>
                </div>
                <span className="text-xs text-muted-foreground">Yesterday</span>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <Trophy className="h-4 w-4 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Weekly goal completed</p>
                  <p className="text-xs text-muted-foreground">3,500 words this week</p>
                </div>
                <span className="text-xs text-muted-foreground">3 days ago</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Writing Calendar */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Writing Calendar
            </CardTitle>
            <CardDescription>Your writing activity over time</CardDescription>
          </CardHeader>
          <CardContent>
            <WritingCalendar />
          </CardContent>
        </Card>
      </div>

      <GoalSettingsDialog 
        open={settingsOpen} 
        onOpenChange={setSettingsOpen} 
      />
    </AppLayout>
  );
}