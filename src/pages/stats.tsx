import { useState, useEffect } from 'react';
import { AppLayout } from '@/components/app-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Target, 
  TrendingUp, 
  Settings, 
  Trophy,
  Flame,
  Zap,
  Award,
  CheckCircle2,
  BarChart3,
  Activity
} from 'lucide-react';
import { useGoalsContext } from '@/contexts/goals-context';
import { GoalSettingsDialog } from '@/components/goals/goal-settings-dialog';
import { DailyTrendChart, WeeklyProgressChart, MonthlyOverviewChart, TodayBarChart } from '@/components/goals/writing-charts';
import { useChartData } from '@/hooks/use-chart-data';
import { useWritingStats } from '@/hooks/use-writing-stats';
import { cn } from '@/lib/utils';

type TimeFilter = 'all' | 'today' | 'week' | 'month' | 'year';

export default function StatsPage() {
  const { stats, getTodayProgress, syncProgressFromDocuments, initializeDefaultGoals } = useGoalsContext();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('all');
  const [activeTab, setActiveTab] = useState<string>('analytics');
  const todayProgress = getTodayProgress();
  const chartData = useChartData(timeFilter);
  const writingStats = useWritingStats();
  
  // Initialize goals and sync on mount
  useEffect(() => {
    initializeDefaultGoals();
    syncProgressFromDocuments();
  }, [initializeDefaultGoals, syncProgressFromDocuments]);
  
  // Sync progress and initialize goals when goals tab is accessed
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    if (value === 'goals') {
      initializeDefaultGoals();
      syncProgressFromDocuments();
    }
  };
  
  const todayWords = todayProgress.reduce((sum, p) => sum + p.wordsWritten, 0);
  const isGoalMet = todayWords >= stats.daily.target;
  const weeklyProgress = Math.round((stats.weekly.achieved / stats.weekly.target) * 100);
  const monthlyProgress = Math.round((stats.monthly.achieved / stats.monthly.target) * 100);

  const filterButtons = [
    { value: 'all' as TimeFilter, label: 'All time' },
    { value: 'today' as TimeFilter, label: 'Today' },
    { value: 'week' as TimeFilter, label: 'This week' },
    { value: 'month' as TimeFilter, label: 'This month' },
    { value: 'year' as TimeFilter, label: 'This year' },
  ];

  return (
    <AppLayout showNavigation={true}>
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Writing Statistics</h1>
            <p className="text-muted-foreground mt-1">Track your progress and analyze your writing patterns</p>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setSettingsOpen(true)}
            className="gap-2 hover:bg-primary/10"
          >
            <Settings className="h-4 w-4" />
            Settings
          </Button>
        </div>

        {/* Tabbed Content */}
        <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 bg-gradient-to-r from-card to-card/50 border border-border/20">
            <TabsTrigger 
              value="analytics"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500/90 data-[state=active]:to-blue-600/90 data-[state=active]:text-white data-[state=active]:border data-[state=active]:border-blue-500/50 data-[state=active]:shadow-lg data-[state=active]:shadow-blue-500/25 data-[state=active]:font-semibold"
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              Writing Analytics
            </TabsTrigger>
            <TabsTrigger 
              value="goals"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500/90 data-[state=active]:to-emerald-600/90 data-[state=active]:text-white data-[state=active]:border data-[state=active]:border-emerald-500/50 data-[state=active]:shadow-lg data-[state=active]:shadow-emerald-500/25 data-[state=active]:font-semibold"
            >
              <Target className="h-4 w-4 mr-2" />
              Writing Goals
            </TabsTrigger>
          </TabsList>

          {/* Writing Goals Tab */}
          <TabsContent value="goals" className="space-y-8">
            {/* Hero Daily Goal Section */}
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Main Today's Goal */}
              <div className="lg:col-span-2">
                <Card className={cn(
                  "border-2 relative overflow-hidden h-full transition-all duration-500",
                  isGoalMet 
                    ? "border-emerald-400/60 bg-gradient-to-br from-emerald-500/20 via-green-500/15 to-emerald-600/20 shadow-2xl shadow-emerald-500/25 ring-2 ring-emerald-400/30 animate-in fade-in duration-1000"
                    : "border-border/20 bg-gradient-to-br from-card to-card/50 ring-1 ring-border/10"
                )}>
                  <div className={cn(
                    "absolute inset-0 transition-transform duration-1000",
                    isGoalMet
                      ? "bg-gradient-to-r from-transparent via-emerald-400/20 to-transparent animate-in slide-in-from-left duration-1500"
                      : "bg-gradient-to-r from-transparent via-primary/5 to-transparent translate-x-[-100%] hover:translate-x-[100%]"
                  )}></div>
                  
                  {/* Celebration sparkles when goal achieved */}
                  {isGoalMet && (
                    <>
                      <div className="absolute top-4 right-4 animate-in bounce-in duration-700 delay-100">✨</div>
                      <div className="absolute top-8 right-12 animate-in bounce-in duration-800 delay-200">🎉</div>
                      <div className="absolute top-6 right-20 animate-in bounce-in duration-700 delay-300">⭐</div>
                      <div className="absolute bottom-8 left-8 animate-in bounce-in duration-800 delay-150">🚀</div>
                      <div className="absolute bottom-12 left-16 animate-in bounce-in duration-700 delay-250">💪</div>
                    </>
                  )}
                  
                  <CardHeader className="relative z-10 pb-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-500",
                          isGoalMet 
                            ? "bg-gradient-to-br from-emerald-400/30 to-green-500/30 animate-in zoom-in duration-700 shadow-lg shadow-emerald-400/25"
                            : "bg-gradient-to-br from-emerald-500/20 to-emerald-600/20"
                        )}>
                          <Target className={cn(
                            "h-6 w-6 transition-all duration-500",
                            isGoalMet ? "text-emerald-400 animate-in spin-in-180 duration-800" : "text-emerald-500"
                          )} />
                        </div>
                        <div>
                          <CardTitle className={cn(
                            "text-2xl font-bold transition-all duration-500",
                            isGoalMet ? "text-emerald-300 animate-in slide-in-from-left duration-600" : ""
                          )}>Today's Progress</CardTitle>
                          <p className={cn(
                            "text-sm mt-1 font-semibold transition-all duration-500",
                            isGoalMet ? "text-emerald-200 text-lg animate-in slide-in-from-left duration-700" : "text-muted-foreground"
                          )}>
                            {isGoalMet ? '🎉 GOAL ACHIEVED! 🎉' : `${(stats.daily.target - todayWords).toLocaleString()} words to go`}
                          </p>
                        </div>
                      </div>
                      {isGoalMet && (
                        <div className="flex items-center gap-2">
                          <Trophy className="h-10 w-10 text-yellow-400 animate-in bounce-in duration-1000 shadow-lg shadow-yellow-400/25" />
                          <div className="text-4xl animate-in bounce-in duration-1200 delay-200">🏆</div>
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  
                  <CardContent className="relative z-10 space-y-6">
                    <div className="text-center space-y-2">
                      <div className={cn(
                        "text-6xl font-bold transition-all duration-500",
                        isGoalMet 
                          ? "bg-gradient-to-r from-emerald-300 via-green-300 to-emerald-400 bg-clip-text text-transparent animate-in zoom-in duration-800 drop-shadow-lg"
                          : "bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent"
                      )}>
                        {todayWords.toLocaleString()}
                      </div>
                      <div className={cn(
                        "text-lg transition-all duration-500",
                        isGoalMet ? "text-emerald-200 font-semibold" : "text-muted-foreground"
                      )}>
                        {isGoalMet ? `🎯 Target CRUSHED! (${stats.daily.target.toLocaleString()} words)` : `of ${stats.daily.target.toLocaleString()} words`}
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className={cn(
                          "font-medium transition-all duration-500",
                          isGoalMet ? "text-emerald-200 text-base animate-in slide-in-from-left duration-900" : ""
                        )}>{stats.daily.percentage}% Complete</span>
                        <span className={cn(
                          "font-bold transition-all duration-500",
                          isGoalMet ? "text-emerald-300 text-xl animate-in slide-in-from-right duration-900" : "text-muted-foreground"
                        )}>
                          {isGoalMet ? `${stats.daily.percentage}% 🔥` : `${stats.daily.percentage}%`}
                        </span>
                      </div>
                      <div className="relative">
                        <Progress 
                          value={stats.daily.percentage} 
                          className={cn(
                            "h-3 transition-all duration-500",
                            isGoalMet ? "h-4 bg-emerald-900/30" : "bg-muted"
                          )}
                        />
                        <div className={cn(
                          "absolute inset-0 rounded-full transition-transform duration-1000",
                          isGoalMet 
                            ? "bg-gradient-to-r from-emerald-400/30 via-emerald-300/40 to-emerald-400/30 animate-in slide-in-from-left duration-1000"
                            : "bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%]"
                        )}></div>
                        
                        {/* Celebration glow effect */}
                        {isGoalMet && (
                          <div className="absolute inset-0 bg-gradient-to-r from-emerald-400/20 to-green-400/20 rounded-full animate-in zoom-in duration-800"></div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              {/* Quick Stats */}
              <div className="space-y-4">
                {/* Streak Card */}
                <Card className="border-2 border-border/20 bg-gradient-to-br from-card to-card/50 relative overflow-hidden ring-1 ring-border/10">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-orange-500/5 to-transparent translate-x-[-100%] hover:translate-x-[100%] transition-transform duration-700"></div>
                  <CardContent className="relative z-10 p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500/20 to-orange-600/20 flex items-center justify-center">
                        <Flame className="h-5 w-5 text-orange-500" />
                      </div>
                      <div>
                        <div className="text-2xl font-bold">{stats.daily.streak}</div>
                        <div className="text-sm text-muted-foreground">day streak</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                {/* Weekly Progress */}
                <Card className="border-2 border-border/20 bg-gradient-to-br from-card to-card/50 relative overflow-hidden ring-1 ring-border/10">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-500/5 to-transparent translate-x-[-100%] hover:translate-x-[100%] transition-transform duration-700"></div>
                  <CardContent className="relative z-10 p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-blue-500" />
                        <span className="text-sm font-medium">Weekly</span>
                      </div>
                      <span className="text-sm font-bold">{weeklyProgress}%</span>
                    </div>
                    <Progress value={weeklyProgress} className="h-2 bg-muted" />
                    <div className="text-xs text-muted-foreground mt-1">
                      {stats.weekly.achieved.toLocaleString()} / {stats.weekly.target.toLocaleString()}
                    </div>
                  </CardContent>
                </Card>
                
                {/* Monthly Progress */}
                <Card className="border-2 border-border/20 bg-gradient-to-br from-card to-card/50 relative overflow-hidden ring-1 ring-border/10">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-500/5 to-transparent translate-x-[-100%] hover:translate-x-[100%] transition-transform duration-700"></div>
                  <CardContent className="relative z-10 p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Award className="h-4 w-4 text-purple-500" />
                        <span className="text-sm font-medium">Monthly</span>
                      </div>
                      <span className="text-sm font-bold">{monthlyProgress}%</span>
                    </div>
                    <Progress value={monthlyProgress} className="h-2 bg-muted" />
                    <div className="text-xs text-muted-foreground mt-1">
                      {stats.monthly.achieved.toLocaleString()} / {stats.monthly.target.toLocaleString()}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Compact Analytics Row */}
            <div className="grid md:grid-cols-4 gap-6">
              <Card className="border-2 border-border/20 bg-gradient-to-br from-card to-card/50 text-center relative overflow-hidden ring-1 ring-border/10">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-emerald-500/5 to-transparent translate-x-[-100%] hover:translate-x-[100%] transition-transform duration-700"></div>
                <CardContent className="relative z-10 p-4">
                  <div className="text-2xl font-bold">
                    {stats.daily.totalDays > 0 
                      ? Math.round((stats.daily.successfulDays / stats.daily.totalDays) * 100)
                      : 0}%
                  </div>
                  <div className="text-xs text-muted-foreground">Success rate</div>
                </CardContent>
              </Card>
              
              <Card className="border-2 border-border/20 bg-gradient-to-br from-card to-card/50 text-center relative overflow-hidden ring-1 ring-border/10">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-500/5 to-transparent translate-x-[-100%] hover:translate-x-[100%] transition-transform duration-700"></div>
                <CardContent className="relative z-10 p-4">
                  <div className="text-2xl font-bold">{stats.weekly.averageWords}</div>
                  <div className="text-xs text-muted-foreground">Daily average</div>
                </CardContent>
              </Card>
              
              <Card className="border-2 border-border/20 bg-gradient-to-br from-card to-card/50 text-center relative overflow-hidden ring-1 ring-border/10">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-orange-500/5 to-transparent translate-x-[-100%] hover:translate-x-[100%] transition-transform duration-700"></div>
                <CardContent className="relative z-10 p-4">
                  <div className="text-2xl font-bold">{stats.daily.bestStreak}</div>
                  <div className="text-xs text-muted-foreground">Best streak</div>
                </CardContent>
              </Card>
              
              <Card className="border-2 border-border/20 bg-gradient-to-br from-card to-card/50 text-center relative overflow-hidden ring-1 ring-border/10">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-500/5 to-transparent translate-x-[-100%] hover:translate-x-[100%] transition-transform duration-700"></div>
                <CardContent className="relative z-10 p-4">
                  <div className="text-2xl font-bold">{stats.daily.successfulDays}</div>
                  <div className="text-xs text-muted-foreground">Days completed</div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Achievements */}
            <Card className="border-2 border-border/20 bg-gradient-to-br from-card to-card/50 relative overflow-hidden ring-1 ring-border/10">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent translate-x-[-100%] hover:translate-x-[100%] transition-transform duration-1000"></div>
              <CardHeader className="relative z-10 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 flex items-center justify-center">
                    <Trophy className="h-5 w-5 text-yellow-500" />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-bold">Recent Wins</CardTitle>
                    <p className="text-sm text-muted-foreground">Your latest achievements</p>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="relative z-10 space-y-3">
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                    <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                    <div>
                      <div className="text-sm font-medium">Daily goal</div>
                      <div className="text-xs text-muted-foreground">2h ago</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-orange-500/10 border border-orange-500/20">
                    <Flame className="h-5 w-5 text-orange-500" />
                    <div>
                      <div className="text-sm font-medium">{stats.daily.streak}-day streak</div>
                      <div className="text-xs text-muted-foreground">Active</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                    <Zap className="h-5 w-5 text-blue-500" />
                    <div>
                      <div className="text-sm font-medium">On fire!</div>
                      <div className="text-xs text-muted-foreground">Keep going</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Writing Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Writing Analytics</h2>
                <p className="text-muted-foreground">Visualize your writing patterns and progress</p>
              </div>
              <div className="text-sm text-muted-foreground">
                Total: {writingStats.totalWords.toLocaleString()} words
              </div>
            </div>

            {/* Time Filter Buttons */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-medium text-muted-foreground mr-2">Filter:</span>
              {filterButtons.map((filter) => (
                <Button
                  key={filter.value}
                  variant={timeFilter === filter.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => setTimeFilter(filter.value)}
                  className={cn(
                    "transition-all duration-300",
                    timeFilter === filter.value 
                      ? "bg-gradient-to-r from-blue-500/90 to-blue-600/90 hover:from-blue-500 hover:to-blue-600 text-white shadow-lg shadow-blue-500/25" 
                      : "border-border/40 hover:border-blue-500/30 hover:bg-blue-500/5"
                  )}
                >
                  {filter.label}
                </Button>
              ))}
            </div>

            {/* Charts based on selected filter */}
            {timeFilter === 'today' && (
              <TodayBarChart todayData={chartData.dailyData} />
            )}

            {timeFilter === 'week' && (
              <DailyTrendChart dailyData={chartData.dailyData} />
            )}

            {timeFilter === 'month' && (
              <div className="space-y-6">
                <DailyTrendChart dailyData={chartData.dailyData} />
                {chartData.weeklyData.length > 0 && (
                  <WeeklyProgressChart weeklyData={chartData.weeklyData} />
                )}
              </div>
            )}

            {timeFilter === 'year' && (
              <div className="space-y-6">
                <DailyTrendChart dailyData={chartData.dailyData} />
                <div className="grid lg:grid-cols-2 gap-6">
                  {chartData.weeklyData.length > 0 && (
                    <WeeklyProgressChart weeklyData={chartData.weeklyData} />
                  )}
                  {chartData.monthlyData.length > 0 && (
                    <MonthlyOverviewChart monthlyData={chartData.monthlyData} />
                  )}
                </div>
              </div>
            )}

            {timeFilter === 'all' && (
              <div className="space-y-6">
                <DailyTrendChart dailyData={chartData.dailyData} />
                <div className="grid lg:grid-cols-2 gap-6">
                  <WeeklyProgressChart weeklyData={chartData.weeklyData} />
                  <MonthlyOverviewChart monthlyData={chartData.monthlyData} />
                </div>
              </div>
            )}

            {/* Writing Insights Cards */}
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="border-2 border-border/20 bg-gradient-to-br from-card to-card/50 text-center relative overflow-hidden ring-1 ring-border/10">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-emerald-500/5 to-transparent translate-x-[-100%] hover:translate-x-[100%] transition-transform duration-700"></div>
                <CardContent className="relative z-10 p-6">
                  <div className="text-3xl font-bold text-emerald-600">{writingStats.streak.bestStreak}</div>
                  <div className="text-sm text-muted-foreground">Best streak (days)</div>
                </CardContent>
              </Card>
              
              <Card className="border-2 border-border/20 bg-gradient-to-br from-card to-card/50 text-center relative overflow-hidden ring-1 ring-border/10">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-500/5 to-transparent translate-x-[-100%] hover:translate-x-[100%] transition-transform duration-700"></div>
                <CardContent className="relative z-10 p-6">
                  <div className="text-3xl font-bold text-blue-600">{writingStats.averageWordsPerDay}</div>
                  <div className="text-sm text-muted-foreground">Daily average</div>
                </CardContent>
              </Card>
              
              <Card className="border-2 border-border/20 bg-gradient-to-br from-card to-card/50 text-center relative overflow-hidden ring-1 ring-border/10">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-500/5 to-transparent translate-x-[-100%] hover:translate-x-[100%] transition-transform duration-700"></div>
                <CardContent className="relative z-10 p-6">
                  <div className="text-3xl font-bold text-purple-600">{writingStats.consistencyScore}%</div>
                  <div className="text-sm text-muted-foreground">Consistency score</div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <GoalSettingsDialog 
        open={settingsOpen} 
        onOpenChange={setSettingsOpen} 
      />
    </AppLayout>
  );
}