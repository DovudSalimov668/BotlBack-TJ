import { useQuery } from '@tanstack/react-query'
import api from '@/lib/axios'

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
