import { useState, useEffect } from 'react';
import { seedDemoData, isDemoDataSeeded } from '@/infra/seeder';

export function useSeeder(enabled: boolean = false) {
  const [isSeeding, setIsSeeding] = useState(false);
  const [seedCompleted, setSeedCompleted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Only run if enabled AND we haven't already seeded
    if (enabled && !isDemoDataSeeded()) {
      runSeeder();
    }
  }, [enabled]);

  const runSeeder = async () => {
    setIsSeeding(true);
    setError(null);
    setSeedCompleted(false);

    try {
      await seedDemoData();
      // Reload page after seeding completes - will stop loop because isDemoDataSeeded() will be true
      // window.location.reload();
      setIsSeeding(false);
      setSeedCompleted(true);
    } catch (err) {
      console.error('Seeding error:', err);
      setError(err instanceof Error ? err.message : 'Failed to seed demo data');
      setIsSeeding(false);
    }
  };

  return { isSeeding, seedCompleted, error };
}
