import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import api from '@/lib/axios'
import { useAuthStore } from '@/store/authStore'
import { queryClient } from '@/lib/queryClient'

export interface UserData {
  id: number
  phone: string
  name: string
  language: string
  region: string
  is_staff: boolean
  total_points: number
  bottles_recycled: number
  co2_saved_kg: number
  streak_days: number
  last_scan_date: string | null
  created_at: string
}

export function useMe() {
  const { isAuthenticated, setUser } = useAuthStore()
  const qc = useQueryClient()
  const query = useQuery<UserData>({
    queryKey: ['me'],
    queryFn: () => api.get('/auth/me/').then((r) => r.data),
    enabled: isAuthenticated,
    staleTime: 30_000,
  })

  // Sync to auth store after fetch — not during render
  useEffect(() => {
    if (query.data) {
      setUser(query.data)
    }
  }, [query.data])

  return query
}

export function useRegister() {
  const { setTokens, setUser } = useAuthStore()
  return useMutation({
    mutationFn: (data: { phone: string; name: string }) =>
      api.post('/auth/register/', data).then((r) => r.data),
    onSuccess: (data) => {
      setTokens(data.access, data.refresh)
      setUser(data.user)
    },
  })
}

export function useLogin() {
  const { setTokens, setUser } = useAuthStore()
  return useMutation({
    mutationFn: (data: { phone: string; otp: string }) =>
      api.post('/auth/login/', data).then((r) => r.data),
    onSuccess: (data) => {
      setTokens(data.access, data.refresh)
      setUser(data.user)
      queryClient.invalidateQueries({ queryKey: ['me'] })
    },
  })
}
