import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  ComposedChart
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, BarChart3, Activity } from 'lucide-react';

interface ChartDataPoint {
  date: string;
  words: number;
  label: string;
}

interface WritingChartsProps {
  dailyData: ChartDataPoint[];
  weeklyData: ChartDataPoint[];
  monthlyData: ChartDataPoint[];
}

// Custom tooltip component
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border border-border/20 rounded-lg p-3 shadow-lg">
        <p className="text-sm font-medium">{label}</p>
        <p className="text-sm text-emerald-600">
          {`${payload[0].value.toLocaleString()} words`}
        </p>
      </div>
    );
  }
  return null;
};

// Helper to calculate a "nice" max value for the Y-axis
const getNiceMaxValue = (data: ChartDataPoint[]) => {
  const maxWords = Math.max(...data.map(d => d.words));
  if (maxWords < 1000) return Math.ceil(maxWords / 100) * 100; // Round up to next 100
  return Math.ceil(maxWords / 1000) * 1000; // Round up to next 1000
};

export function DailyTrendChart({ dailyData }: { dailyData: ChartDataPoint[] }) {
  const yMax = getNiceMaxValue(dailyData);
  return (
    <Card className="border-2 border-border/20 bg-gradient-to-br from-card to-card/50 relative overflow-hidden ring-1 ring-border/10">
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-emerald-500/5 to-transparent translate-x-[-100%] hover:translate-x-[100%] transition-transform duration-700"></div>

      <CardHeader className="relative z-10 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 flex items-center justify-center">
            <TrendingUp className="h-5 w-5 text-emerald-500" />
          </div>
          <div>
            <CardTitle className="text-lg font-bold">Daily Writing Trend</CardTitle>
            <p className="text-sm text-muted-foreground">Your recent writing activity</p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="relative z-10 pt-0">
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={dailyData} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="emeraldGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis
                dataKey="label"
                className="text-xs"
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                domain={[0, yMax]}
                className="text-xs"
                axisLine={false}
                tickLine={false}
                tickFormatter={(value) => `${value}`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="words"
                stroke="#10b981"
                strokeWidth={2}
                fill="url(#emeraldGradient)"
                fillOpacity={1}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

export function WeeklyProgressChart({ weeklyData }: { weeklyData: ChartDataPoint[] }) {
  const yMax = getNiceMaxValue(weeklyData);
  return (
    <Card className="border-2 border-border/20 bg-gradient-to-br from-card to-card/50 relative overflow-hidden ring-1 ring-border/10">
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-500/5 to-transparent translate-x-[-100%] hover:translate-x-[100%] transition-transform duration-700"></div>

      <CardHeader className="relative z-10 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500/20 to-blue-600/20 flex items-center justify-center">
            <BarChart3 className="h-5 w-5 text-blue-500" />
          </div>
          <div>
            <CardTitle className="text-lg font-bold">Weekly Progress</CardTitle>
            <p className="text-sm text-muted-foreground">Words written each week</p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="relative z-10 pt-0">
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weeklyData} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="blueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.3}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis
                dataKey="label"
                className="text-xs"
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                domain={[0, yMax]}
                className="text-xs"
                axisLine={false}
                tickLine={false}
                tickFormatter={(value) => `${value}`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar
                dataKey="words"
                fill="url(#blueGradient)"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

export function TodayBarChart({ todayData }: { todayData: ChartDataPoint[] }) {
  const yMax = getNiceMaxValue(todayData);
  return (
    <Card className="border-2 border-border/20 bg-gradient-to-br from-card to-card/50 relative overflow-hidden ring-1 ring-border/10">
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-emerald-500/5 to-transparent translate-x-[-100%] hover:translate-x-[100%] transition-transform duration-700"></div>

      <CardHeader className="relative z-10 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 flex items-center justify-center">
            <TrendingUp className="h-5 w-5 text-emerald-500" />
          </div>
          <div>
            <CardTitle className="text-lg font-bold">Today's Writing</CardTitle>
            <p className="text-sm text-muted-foreground">Words written today</p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="relative z-10 pt-0">
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={todayData} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="todayGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.3}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis
                dataKey="label"
                className="text-xs"
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                domain={[0, yMax]}
                className="text-xs"
                axisLine={false}
                tickLine={false}
                tickFormatter={(value) => `${value}`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar
                dataKey="words"
                fill="url(#todayGradient)"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

export function MonthlyOverviewChart({ monthlyData }: { monthlyData: ChartDataPoint[] }) {
  const yMax = getNiceMaxValue(monthlyData);
  return (
    <Card className="border-2 border-border/20 bg-gradient-to-br from-card to-card/50 relative overflow-hidden ring-1 ring-border/10">
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-500/5 to-transparent translate-x-[-100%] hover:translate-x-[100%] transition-transform duration-700"></div>

      <CardHeader className="relative z-10 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500/20 to-purple-600/20 flex items-center justify-center">
            <Activity className="h-5 w-5 text-purple-500" />
          </div>
          <div>
            <CardTitle className="text-lg font-bold">Monthly Overview</CardTitle>
            <p className="text-sm text-muted-foreground">Long-term writing patterns</p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="relative z-10 pt-0">
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={monthlyData} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="purpleGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.6}/>
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis
                dataKey="label"
                className="text-xs"
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                domain={[0, yMax]}
                className="text-xs"
                axisLine={false}
                tickLine={false}
                tickFormatter={(value) => `${value}`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="words"
                fill="url(#purpleGradient)"
                fillOpacity={1}
              />
              <Line
                type="monotone"
                dataKey="words"
                stroke="#8b5cf6"
                strokeWidth={3}
                dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: '#8b5cf6', strokeWidth: 2 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
