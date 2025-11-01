// src/hooks/useDashboard.ts
import { useState, useEffect } from "react";
import api from "../services/api";

interface DashboardStats {
  incompleteClients: number;
  completeClients: number;
  totalInvoices: number;
  totalInvoiceValue: number;
  drawnVouchers: number;
}

interface UseDashboardResult {
  stats: DashboardStats | null;
  isLoading: boolean;
  error: string | null;
}

export default function useDashboard(): UseDashboardResult {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Fetch statistics
        const statsResponse = await api.get("/dashboard/stats");
        setStats(statsResponse.data);

      } catch (err: any) {
        console.error("Failed to fetch dashboard data:", err);
        setError("Failed to load dashboard data. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return { stats, isLoading, error };
}
