// src/hooks/useDashboard.ts
import { useState, useEffect } from 'react';
import api from '../services/api';

interface DashboardStats {
  clients: number;
  invoices: number;
  opportunities: number;
  products: number;
  vouchers: number;
}

interface Activity {
  id: number;
  user: string;
  action: string;
  timestamp: string;
}

interface UseDashboardResult {
  stats: DashboardStats | null;
  activities: Activity[];
  isLoading: boolean;
  error: string | null;
}

export default function useDashboard(): UseDashboardResult {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Fetch statistics
        const statsResponse = await api.get('/dashboard/stats');
        setStats(statsResponse.data);

        // Fetch recent activities
        const activitiesResponse = await api.get('/dashboard/activities');
        setActivities(activitiesResponse.data);

      } catch (err: any) {
        console.error('Failed to fetch dashboard data:', err);
        setError('Failed to load dashboard data. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return { stats, activities, isLoading, error };
}