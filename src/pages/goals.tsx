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
    <AppLayout title="Writing Goals" maxWidth="6xl">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
          <div className="space-y-3">
            <h1 className="text-4xl font-bold tracking-tight">Writing Goals</h1>
            <p className="text-lg text-muted-foreground">
              Track your daily, weekly, and monthly writing progress
            </p>
          </div>
          <Button variant="outline" size="lg" className="gap-2 px-6" onClick={() => setSettingsOpen(true)}>
            <Settings className="h-4 w-4" />
            Goal Settings
          </Button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-0 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Today's Progress</CardTitle>
              <Target className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-3">
                <div className="text-3xl font-bold tracking-tight">
                  {todayProgress.reduce((sum, p) => sum + p.wordsWritten, 0).toLocaleString()} words
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <p className="text-sm text-muted-foreground">
                      {stats.daily.percentage}% of daily goal
                    </p>
                    <p className="text-sm font-medium">
                      {stats.daily.target.toLocaleString()}
                    </p>
                  </div>
                  <Progress value={stats.daily.percentage} className="h-2" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Current Streak</CardTitle>
              <Flame className="h-5 w-5 text-orange-500" />
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-2">
                <div className="text-3xl font-bold tracking-tight">{stats.daily.streak} days</div>
                <p className="text-sm text-muted-foreground">
                  Best streak: {stats.daily.bestStreak} days
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Weekly Average</CardTitle>
              <TrendingUp className="h-5 w-5 text-green-500" />
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-2">
                <div className="text-3xl font-bold tracking-tight">
                  {stats.weekly.averageWords} words/day
                </div>
                <p className="text-sm text-muted-foreground">
                  Last 7 days
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Monthly Total</CardTitle>
              <BarChart3 className="h-5 w-5 text-blue-500" />
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-2">
                <div className="text-3xl font-bold tracking-tight">
                  {stats.monthly.achieved.toLocaleString()}
                </div>
                <p className="text-sm text-muted-foreground">
                  {stats.monthly.percentage}% of monthly goal
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Goal Progress Tabs */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-6">
            <CardTitle className="text-2xl font-bold">Goal Progress</CardTitle>
            <CardDescription className="text-base">Track your progress across different time periods</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={selectedPeriod} onValueChange={(v) => setSelectedPeriod(v as GoalPeriod)}>
              <TabsList className="grid w-full grid-cols-4 mb-8">
                {periods.map(period => (
                  <TabsTrigger key={period} value={period} className="text-sm font-medium">
                    {formatGoalPeriod(period)}
                  </TabsTrigger>
                ))}
              </TabsList>

              {periods.map(period => {
                const periodStat = stats[period];
                const isGoalMet = periodStat.achieved >= periodStat.target;

                return (
                  <TabsContent key={period} value={period} className="space-y-8 mt-0">
                    {/* Goal Status */}
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <h3 className="text-2xl font-bold tracking-tight">
                          {formatGoalPeriod(period)} Goal
                        </h3>
                        <p className="text-base text-muted-foreground">
                          Target: {periodStat.target.toLocaleString()} words
                        </p>
                      </div>
                      <Badge 
                        variant={periodStat.isActive ? 'default' : 'secondary'}
                        className="px-3 py-1 text-sm font-medium"
                      >
                        {periodStat.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-semibold">
                          {periodStat.achieved.toLocaleString()} words written
                        </span>
                        <span className="text-lg font-bold text-primary">
                          {periodStat.percentage}%
                        </span>
                      </div>
                      <Progress 
                        value={periodStat.percentage} 
                        className="h-4 bg-muted"
                      />
                      <div className="flex items-center gap-3">
                        {isGoalMet ? (
                          <>
                            <CheckCircle2 className="h-5 w-5 text-green-500" />
                            <span className="text-green-600 font-medium">Goal achieved!</span>
                          </>
                        ) : (
                          <>
                            <Clock className="h-5 w-5 text-muted-foreground" />
                            <span className="text-muted-foreground">
                              {(periodStat.target - periodStat.achieved).toLocaleString()} words remaining
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Statistics Grid */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                      <div className="space-y-2 text-center lg:text-left">
                        <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Success Rate</p>
                        <p className="text-3xl font-bold tracking-tight">
                          {periodStat.totalDays > 0 
                            ? Math.round((periodStat.successfulDays / periodStat.totalDays) * 100)
                            : 0}%
                        </p>
                      </div>
                      <div className="space-y-2 text-center lg:text-left">
                        <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Successful Days</p>
                        <p className="text-3xl font-bold tracking-tight">
                          {periodStat.successfulDays}/{periodStat.totalDays}
                        </p>
                      </div>
                      <div className="space-y-2 text-center lg:text-left">
                        <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Current Streak</p>
                        <p className="text-3xl font-bold tracking-tight">
                          {periodStat.streak} days
                        </p>
                      </div>
                      <div className="space-y-2 text-center lg:text-left">
                        <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Average/Day</p>
                        <p className="text-3xl font-bold tracking-tight">
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
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-6">
            <CardTitle className="flex items-center gap-3 text-2xl font-bold">
              <Trophy className="h-6 w-6 text-yellow-500" />
              Recent Achievements
            </CardTitle>
            <CardDescription className="text-base">Your latest writing milestones</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="flex items-center gap-4 p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                  <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <div className="flex-1 space-y-1">
                  <p className="font-semibold text-green-900 dark:text-green-100">Daily goal achieved</p>
                  <p className="text-sm text-green-700 dark:text-green-300">500 words written today</p>
                </div>
                <span className="text-sm text-green-600 dark:text-green-400 font-medium">2 hours ago</span>
              </div>
              
              <div className="flex items-center gap-4 p-4 rounded-lg bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800">
                <div className="h-12 w-12 rounded-full bg-orange-100 dark:bg-orange-900 flex items-center justify-center">
                  <Flame className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                </div>
                <div className="flex-1 space-y-1">
                  <p className="font-semibold text-orange-900 dark:text-orange-100">3-day streak!</p>
                  <p className="text-sm text-orange-700 dark:text-orange-300">Keep it going!</p>
                </div>
                <span className="text-sm text-orange-600 dark:text-orange-400 font-medium">Yesterday</span>
              </div>
              
              <div className="flex items-center gap-4 p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                  <Trophy className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="flex-1 space-y-1">
                  <p className="font-semibold text-blue-900 dark:text-blue-100">Weekly goal completed</p>
                  <p className="text-sm text-blue-700 dark:text-blue-300">3,500 words this week</p>
                </div>
                <span className="text-sm text-blue-600 dark:text-blue-400 font-medium">3 days ago</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Writing Calendar */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-6">
            <CardTitle className="flex items-center gap-3 text-2xl font-bold">
              <Calendar className="h-6 w-6 text-blue-500" />
              Writing Calendar
            </CardTitle>
            <CardDescription className="text-base">Your writing activity over time</CardDescription>
          </CardHeader>
          <CardContent className="pb-8">
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