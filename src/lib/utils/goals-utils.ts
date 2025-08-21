interface Activity {
  date: string;
  wordsWritten: number;
  projects: string[];
  documents: string[];
}

export function getStartOfWeek(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Monday start
  return new Date(new Date(d.setDate(diff)).setHours(0, 0, 0, 0));
}

export function getStartOfMonth(date: Date): Date {
  const d = new Date(date);
  return new Date(new Date(d.getFullYear(), d.getMonth(), 1).setHours(0, 0, 0, 0));
}

export function groupActivitiesByPeriod(activities: Activity[], period: 'week' | 'month') {
  const groups = new Map<string, Activity[]>();

  activities.forEach(activity => {
    const date = new Date(activity.date);
    const startOfPeriod = period === 'week' ? getStartOfWeek(date) : getStartOfMonth(date);
    const key = startOfPeriod.toISOString().split('T')[0];

    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(activity);
  });

  return Array.from(groups.entries()).map(([startDate, periodActivities]) => {
    const totalWords = periodActivities.reduce((sum, a) => sum + a.wordsWritten, 0);
    const projectIds = [...new Set(periodActivities.flatMap(a => a.projects))];
    const documentIds = [...new Set(periodActivities.flatMap(a => a.documents))];
    return { startDate, totalWords, projectIds, documentIds };
  });
}
