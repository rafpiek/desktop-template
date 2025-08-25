import { useState } from 'react';
import { AppLayout } from '@/components/app-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  TrendingUp,
  TrendingDown,
  Users,
  Activity,
  BarChart3,
  PieChart,
  DollarSign,
  Eye
} from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

// Mock data for demonstration
const dailyActiveUsers = [
  { date: 'Jan 01', users: 1200, sessions: 2400 },
  { date: 'Jan 02', users: 1350, sessions: 2550 },
  { date: 'Jan 03', users: 1100, sessions: 2200 },
  { date: 'Jan 04', users: 1420, sessions: 2840 },
  { date: 'Jan 05', users: 1580, sessions: 3160 },
  { date: 'Jan 06', users: 1680, sessions: 3360 },
  { date: 'Jan 07', users: 1750, sessions: 3500 },
  { date: 'Jan 08', users: 1890, sessions: 3780 },
  { date: 'Jan 09', users: 2100, sessions: 4200 },
  { date: 'Jan 10', users: 2050, sessions: 4100 },
  { date: 'Jan 11', users: 2200, sessions: 4400 },
  { date: 'Jan 12', users: 2350, sessions: 4700 },
  { date: 'Jan 13', users: 2480, sessions: 4960 },
  { date: 'Jan 14', users: 2650, sessions: 5300 }
];

const revenue = [
  { month: 'Jan', revenue: 4200, profit: 1200 },
  { month: 'Feb', revenue: 3800, profit: 1100 },
  { month: 'Mar', revenue: 5200, profit: 1800 },
  { month: 'Apr', revenue: 4800, profit: 1650 },
  { month: 'May', revenue: 6100, profit: 2200 },
  { month: 'Jun', revenue: 5900, profit: 2100 },
  { month: 'Jul', revenue: 7200, profit: 2800 },
  { month: 'Aug', revenue: 6800, profit: 2600 },
  { month: 'Sep', revenue: 8100, profit: 3200 },
  { month: 'Oct', revenue: 7900, profit: 3100 },
  { month: 'Nov', revenue: 9200, profit: 3800 },
  { month: 'Dec', revenue: 8800, profit: 3600 }
];

const deviceTypes = [
  { name: 'Desktop', value: 45, color: '#0088FE' },
  { name: 'Mobile', value: 35, color: '#00C49F' },
  { name: 'Tablet', value: 20, color: '#FFBB28' }
];

const pageViews = [
  { page: 'Home', views: 12453, bounce: 34.2 },
  { page: 'About', views: 8934, bounce: 28.7 },
  { page: 'Products', views: 15672, bounce: 22.1 },
  { page: 'Contact', views: 6789, bounce: 45.3 },
  { page: 'Blog', views: 9876, bounce: 31.8 }
];

type TimeFilter = 'today' | 'week' | 'month' | 'year';

export default function StatsPage() {
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('month');
  const [activeTab, setActiveTab] = useState<string>('overview');

  // Calculate summary stats
  const totalUsers = dailyActiveUsers[dailyActiveUsers.length - 1]?.users || 0;
  const totalSessions = dailyActiveUsers[dailyActiveUsers.length - 1]?.sessions || 0;
  const userGrowth = ((totalUsers - dailyActiveUsers[0].users) / dailyActiveUsers[0].users * 100).toFixed(1);
  const totalRevenue = revenue.reduce((sum, item) => sum + item.revenue, 0);
  const totalPageViews = pageViews.reduce((sum, item) => sum + item.views, 0);

  return (
    <AppLayout showNavigation={true}>
      <div className="container max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h1>
            <p className="text-muted-foreground">
              Overview of your application metrics and performance data
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Select value={timeFilter} onValueChange={(value) => setTimeFilter(value as TimeFilter)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select time period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
                <SelectItem value="year">This Year</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalUsers.toLocaleString()}</div>
              <div className="flex items-center text-xs text-muted-foreground">
                <TrendingUp className="mr-1 h-3 w-3 text-green-500" />
                +{userGrowth}% from last period
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalSessions.toLocaleString()}</div>
              <div className="flex items-center text-xs text-muted-foreground">
                <TrendingUp className="mr-1 h-3 w-3 text-green-500" />
                +12.3% from last period
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totalRevenue.toLocaleString()}</div>
              <div className="flex items-center text-xs text-muted-foreground">
                <TrendingUp className="mr-1 h-3 w-3 text-green-500" />
                +8.7% from last period
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Page Views</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalPageViews.toLocaleString()}</div>
              <div className="flex items-center text-xs text-muted-foreground">
                <TrendingDown className="mr-1 h-3 w-3 text-red-500" />
                -2.1% from last period
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="revenue">Revenue</TabsTrigger>
            <TabsTrigger value="traffic">Traffic</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
              <Card className="col-span-4">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    User Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={dailyActiveUsers}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Area type="monotone" dataKey="users" stackId="1" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                      <Area type="monotone" dataKey="sessions" stackId="1" stroke="#82ca9d" fill="#82ca9d" fillOpacity={0.6} />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
              
              <Card className="col-span-3">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="h-5 w-5" />
                    Device Types
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <RechartsPieChart>
                      <Pie
                        dataKey="value"
                        data={deviceTypes}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        label={({ name, value }) => `${name}: ${value}%`}
                      >
                        {deviceTypes.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="users" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Daily Active Users</CardTitle>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">14 days</Badge>
                  <span className="text-sm text-muted-foreground">
                    Showing user activity for the last two weeks
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={dailyActiveUsers}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="users" stroke="#8884d8" strokeWidth={2} />
                    <Line type="monotone" dataKey="sessions" stroke="#82ca9d" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="revenue" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Revenue & Profit</CardTitle>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">12 months</Badge>
                  <span className="text-sm text-muted-foreground">
                    Monthly revenue and profit data
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={revenue}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="revenue" fill="#8884d8" />
                    <Bar dataKey="profit" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="traffic" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Page Performance</CardTitle>
                <div className="text-sm text-muted-foreground">
                  Views and bounce rates by page
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {pageViews.map((page, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex flex-col">
                        <span className="font-medium">{page.page}</span>
                        <span className="text-sm text-muted-foreground">
                          {page.views.toLocaleString()} views
                        </span>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="text-sm font-medium">{page.bounce}%</div>
                          <div className="text-xs text-muted-foreground">bounce rate</div>
                        </div>
                        <div className="w-16">
                          <div className="h-2 bg-muted rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-primary rounded-full transition-all"
                              style={{ width: `${100 - page.bounce}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}