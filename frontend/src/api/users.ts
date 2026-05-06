import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/axios'

export function useScanHistory() {
  return useQuery({
    queryKey: ['scan-history'],
    queryFn: () => api.get('/users/me/scans/').then((r) => r.data),
    staleTime: 30_000,
  })
}

export function useAchievements() {
  return useQuery({
    queryKey: ['achievements'],
    queryFn: () => api.get('/achievements/me/').then((r) => r.data),
    staleTime: 30_000,
  })
}

export function useUpdateProfile() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: { name?: string; language?: string; region?: string }) =>
      api.patch('/auth/me/', data).then((r) => r.data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['me'] }) },
  })
}

export function useLeaderboard(region?: string, period?: string) {
  return useQuery({
    queryKey: ['leaderboard', region, period],
    queryFn: () => {
      const params = new URLSearchParams()
      if (region) params.set('region', region)
      if (period) params.set('period', period)
      return api.get(`/users/leaderboard/?${params}`).then((r) => r.data)
    },
  })
}

export function useUserStats() {
  return useQuery({
    queryKey: ['stats'],
    queryFn: () => api.get('/users/me/stats/').then((r) => r.data),
  })
}
