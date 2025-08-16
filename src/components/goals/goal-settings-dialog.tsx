import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useGoalsContext } from '@/contexts/goals-context';
import { formatGoalPeriod } from '@/lib/types/goals';
import type { GoalPeriod } from '@/lib/types/goals';
import { Settings, Target, Clock, Archive } from 'lucide-react';

interface GoalSettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function GoalSettingsDialog({ open, onOpenChange }: GoalSettingsDialogProps) {
  const { settings, updateSettings, getGoalByType, updateGoal, createGoal } = useGoalsContext();
  const [activeTab, setActiveTab] = useState('goals');

  const periods: GoalPeriod[] = ['daily', 'weekly', 'monthly', 'yearly'];

  const handleGoalToggle = (period: GoalPeriod, enabled: boolean) => {
    const existingGoal = getGoalByType(period);
    
    if (existingGoal) {
      updateGoal({ id: existingGoal.id, isActive: enabled });
    } else if (enabled) {
      // Create a new goal with default values
      const defaultTargets = {
        daily: 500,
        weekly: 3500,
        monthly: 15000,
        yearly: 180000,
      };
      
      createGoal({
        type: period,
        targetWords: defaultTargets[period],
        isActive: true,
      });
    }
  };

  const handleTargetChange = (period: GoalPeriod, target: number) => {
    const existingGoal = getGoalByType(period);
    
    if (existingGoal) {
      updateGoal({ id: existingGoal.id, targetWords: target });
    } else {
      createGoal({
        type: period,
        targetWords: target,
        isActive: true,
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Goal Settings
          </DialogTitle>
          <DialogDescription>
            Configure your writing goals and tracking preferences
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="goals">Goals</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="advanced">Advanced</TabsTrigger>
          </TabsList>

          <TabsContent value="goals" className="space-y-6 mt-6">
            <div className="space-y-4">
              {periods.map(period => {
                const goal = getGoalByType(period);
                const isActive = goal?.isActive || false;
                const targetWords = goal?.targetWords || 0;

                return (
                  <Card key={period}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Target className="h-4 w-4 text-muted-foreground" />
                          <CardTitle className="text-base">
                            {formatGoalPeriod(period)} Goal
                          </CardTitle>
                        </div>
                        <Switch
                          checked={isActive}
                          onCheckedChange={(checked) => handleGoalToggle(period, checked)}
                        />
                      </div>
                    </CardHeader>
                    {isActive && (
                      <CardContent className="space-y-3">
                        <div className="space-y-2">
                          <Label htmlFor={`${period}-target`}>
                            Target Words
                          </Label>
                          <Input
                            id={`${period}-target`}
                            type="number"
                            value={targetWords}
                            onChange={(e) => handleTargetChange(period, parseInt(e.target.value) || 0)}
                            min="0"
                            step="100"
                          />
                          <p className="text-xs text-muted-foreground">
                            {period === 'daily' && 'Set your daily word count goal'}
                            {period === 'weekly' && 'Total words to write this week'}
                            {period === 'monthly' && 'Total words to write this month'}
                            {period === 'yearly' && 'Total words to write this year'}
                          </p>
                        </div>
                        
                        {settings.includeCharacterCount && (
                          <div className="space-y-2">
                            <Label htmlFor={`${period}-chars`}>
                              Target Characters (Optional)
                            </Label>
                            <Input
                              id={`${period}-chars`}
                              type="number"
                              placeholder="Leave empty to ignore"
                              min="0"
                              step="500"
                            />
                          </div>
                        )}
                      </CardContent>
                    )}
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Reminder Notifications</CardTitle>
                <CardDescription>
                  Get reminded to write and celebrate achievements
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="enable-notifications">Enable Notifications</Label>
                    <p className="text-xs text-muted-foreground">
                      Receive daily writing reminders
                    </p>
                  </div>
                  <Switch
                    id="enable-notifications"
                    checked={settings.enableNotifications}
                    onCheckedChange={(checked) => 
                      updateSettings({ enableNotifications: checked })
                    }
                  />
                </div>

                {settings.enableNotifications && (
                  <div className="space-y-2">
                    <Label htmlFor="notification-time">
                      Reminder Time
                    </Label>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <Input
                        id="notification-time"
                        type="time"
                        value={settings.notificationTime}
                        onChange={(e) => 
                          updateSettings({ notificationTime: e.target.value })
                        }
                        className="w-32"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Daily reminder to check your writing goals
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="advanced" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Week Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="week-start">Week Starts On</Label>
                  <select
                    id="week-start"
                    className="w-full px-3 py-2 text-sm border rounded-md"
                    value={settings.weekStartsOn}
                    onChange={(e) => 
                      updateSettings({ weekStartsOn: parseInt(e.target.value) as 0 | 1 | 2 | 3 | 4 | 5 | 6 })
                    }
                  >
                    <option value="0">Sunday</option>
                    <option value="1">Monday</option>
                    <option value="2">Tuesday</option>
                    <option value="3">Wednesday</option>
                    <option value="4">Thursday</option>
                    <option value="5">Friday</option>
                    <option value="6">Saturday</option>
                  </select>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Character Counting</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="include-chars">Track Character Count</Label>
                    <p className="text-xs text-muted-foreground">
                      Also track character count in addition to words
                    </p>
                  </div>
                  <Switch
                    id="include-chars"
                    checked={settings.includeCharacterCount}
                    onCheckedChange={(checked) => 
                      updateSettings({ includeCharacterCount: checked })
                    }
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Archive className="h-4 w-4" />
                  Auto-Archive
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="auto-archive">Auto-archive Old Goals</Label>
                    <p className="text-xs text-muted-foreground">
                      Automatically archive completed goals
                    </p>
                  </div>
                  <Switch
                    id="auto-archive"
                    checked={settings.autoArchiveOldGoals}
                    onCheckedChange={(checked) => 
                      updateSettings({ autoArchiveOldGoals: checked })
                    }
                  />
                </div>

                {settings.autoArchiveOldGoals && (
                  <div className="space-y-2">
                    <Label htmlFor="archive-days">Archive After Days</Label>
                    <Input
                      id="archive-days"
                      type="number"
                      value={settings.archiveAfterDays}
                      onChange={(e) => 
                        updateSettings({ archiveAfterDays: parseInt(e.target.value) || 90 })
                      }
                      min="1"
                      max="365"
                    />
                    <p className="text-xs text-muted-foreground">
                      Archive goals older than this many days
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={() => onOpenChange(false)}>
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}