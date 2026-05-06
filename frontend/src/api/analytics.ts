import { useQuery } from '@tanstack/react-query'
import api from '@/lib/axios'

export function useOverview() {
  return useQuery({
    queryKey: ['analytics', 'overview'],
    queryFn: () => api.get('/analytics/overview/').then((r) => r.data),
    refetchInterval: 30_000,
  })
}

export function useTimeSeries(metric: string, period: string) {
  return useQuery({
    queryKey: ['analytics', 'timeseries', metric, period],
    queryFn: () =>
      api.get(`/analytics/timeseries/?metric=${metric}&period=${period}`).then((r) => r.data),
    staleTime: 60_000,
  })
}

export function useMapData() {
  return useQuery({
    queryKey: ['analytics', 'map'],
    queryFn: () => api.get('/analytics/map/').then((r) => r.data),
    staleTime: 2 * 60_000,
  })
}

export function useRegions() {
  return useQuery({
    queryKey: ['analytics', 'regions'],
    queryFn: () => api.get('/analytics/regions/').then((r) => r.data),
    staleTime: 60_000,
  })
}

export function useSKUs() {
  return useQuery({
    queryKey: ['analytics', 'skus'],
    queryFn: () => api.get('/analytics/skus/').then((r) => r.data),
  })
}

export function useCampaigns() {
  return useQuery({
    queryKey: ['analytics', 'campaigns'],
    queryFn: () => api.get('/analytics/campaigns/').then((r) => r.data),
  })
}
