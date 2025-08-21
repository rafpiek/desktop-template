import { useMemo } from 'react';
import { useProject } from '@/contexts/project-context';

interface ChartDataPoint {
  date: string;
  words: number;
  label: string;
}

export function useChartData(filter: 'all' | 'today' | 'week' | 'month' | 'year' = 'all') {
  const { documents } = useProject();

  return useMemo(() => {
    if (!documents || documents.length === 0) {
      return {
        dailyData: [],
        weeklyData: [],
        monthlyData: [],
      };
    }

    console.log('[useChartData] Input documents:', documents);

    // Group documents by date
    const documentsByDate = new Map<string, number>();

    documents.forEach(doc => {
      const dateKey = new Date(doc.updatedAt).toISOString().split('T')[0];
      const currentCount = documentsByDate.get(dateKey) || 0;
      documentsByDate.set(dateKey, currentCount + doc.wordCount);
    });

    // Generate daily data based on filter
    const dailyData: ChartDataPoint[] = [];
    const today = new Date();

    let daysToShow = 14; // default for 'all'
    if (filter === 'today') daysToShow = 1;
    else if (filter === 'week') daysToShow = 7;
    else if (filter === 'month') daysToShow = 30;
    else if (filter === 'year') daysToShow = 365;

    for (let i = daysToShow - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const dateKey = date.toISOString().split('T')[0];
      const words = documentsByDate.get(dateKey) || 0;

      let label: string;
      if (filter === 'today') {
        label = 'Today';
      } else if (filter === 'week') {
        label = i === 0 ? 'Today' : i === 1 ? 'Yesterday' : date.toLocaleDateString('en-US', { weekday: 'short' });
      } else if (filter === 'month') {
        label = i === 0 ? 'Today' : date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      } else if (filter === 'year') {
        label = date.toLocaleDateString('en-US', { month: 'short' });
      } else {
        label = i === 0 ? 'Today' : i === 1 ? 'Yesterday' : date.toLocaleDateString('en-US', { weekday: 'short' });
      }

      dailyData.push({
        date: dateKey,
        words,
        label
      });
    }

    // Generate weekly data based on filter
    const weeklyData: ChartDataPoint[] = [];
    const weeklyTotals = new Map<string, number>();

    // Only generate weekly data for certain filters
    if (filter === 'month' || filter === 'year' || filter === 'all') {
      // Group by week
      documents.forEach(doc => {
        const date = new Date(doc.updatedAt);
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay()); // Start of week (Sunday)
        const weekKey = weekStart.toISOString().split('T')[0];

        const currentCount = weeklyTotals.get(weekKey) || 0;
        weeklyTotals.set(weekKey, currentCount + doc.wordCount);
      });

      let weeksToShow = 8; // default for 'all'
      if (filter === 'month') weeksToShow = 4;
      else if (filter === 'year') weeksToShow = 52;

      for (let i = weeksToShow - 1; i >= 0; i--) {
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - today.getDay() - (i * 7));
        const weekKey = weekStart.toISOString().split('T')[0];
        const words = weeklyTotals.get(weekKey) || 0;

        weeklyData.push({
          date: weekKey,
          words,
          label: i === 0 ? 'This week' : `${weekStart.getMonth() + 1}/${weekStart.getDate()}`
        });
      }
    }

    // Generate monthly data based on filter
    const monthlyData: ChartDataPoint[] = [];
    const monthlyTotals = new Map<string, number>();

    // Only generate monthly data for certain filters
    if (filter === 'year' || filter === 'all') {
      // Group by month
      documents.forEach(doc => {
        const date = new Date(doc.updatedAt);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

        const currentCount = monthlyTotals.get(monthKey) || 0;
        monthlyTotals.set(monthKey, currentCount + doc.wordCount);
      });

      let monthsToShow = 6; // default for 'all'
      if (filter === 'year') monthsToShow = 12;

      for (let i = monthsToShow - 1; i >= 0; i--) {
        const date = new Date(today);
        date.setMonth(today.getMonth() - i);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        const words = monthlyTotals.get(monthKey) || 0;

        monthlyData.push({
          date: monthKey,
          words,
          label: i === 0 ? 'This month' : date.toLocaleDateString('en-US', { month: 'short' })
        });
      }
    }

    return {
      dailyData,
      weeklyData,
      monthlyData,
    };
  }, [documents, filter]);
}
