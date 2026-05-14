import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/axios'

export function useScanHistory(limit = 20) {
  return useQuery({
    queryKey: ['scan-history', limit],
    queryFn: () => api.get(`/users/me/scans/?limit=${limit}`).then((r) => r.data),
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
    staleTime: 120_000,
  })
}

export function useUserStats() {
  return useQuery({
    queryKey: ['stats'],
    queryFn: () => api.get('/users/me/stats/').then((r) => r.data),
    staleTime: 60_000,
  })
}

export function useMyReferral() {
  return useQuery({
    queryKey: ['referral'],
    queryFn: () => api.get('/users/me/referral/').then((r) => r.data),
    staleTime: 300_000,
  })
}

export function useWeeklyChallenges() {
  return useQuery({
    queryKey: ['challenges'],
    queryFn: () => api.get('/users/me/challenges/').then((r) => r.data),
    staleTime: 60_000,
  })
}
