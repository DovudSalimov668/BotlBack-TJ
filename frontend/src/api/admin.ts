import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import api from '@/lib/axios'

// ── Types ─────────────────────────────────────────────────────────────────────

export interface AdminPrize {
  id: number
  name: string
  name_tg: string
  points_cost: number
  image_url: string
  stock_quantity: number
  is_active: boolean
}

export interface AdminRedemption {
  id: number
  user_id: number
  user_name: string
  user_phone: string
  prize_id: number
  prize_name: string
  points_spent: number
  status: 'pending' | 'fulfilled' | 'cancelled'
  redeemed_at: string
}

export interface AdminOutlet {
  id: number
  name: string
  name_tg: string
  address: string
  latitude: number
  longitude: number
  region: string
  qr_code: string
  is_active: boolean
  created_at: string
}

export interface AdminUser {
  id: number
  phone: string
  name: string
  region: string
  is_staff: boolean
  total_points: number
  bottles_recycled: number
  streak_days: number
  created_at: string
}

// ── Prizes ────────────────────────────────────────────────────────────────────

export function useAdminPrizes() {
  return useQuery<AdminPrize[]>({
    queryKey: ['admin', 'prizes'],
    queryFn: () => api.get('/rewards/admin/prizes/').then(r => r.data),
  })
}

export function useCreatePrize() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Partial<AdminPrize>) => api.post('/rewards/admin/prizes/', data).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'prizes'] }),
  })
}

export function useUpdatePrize() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...data }: Partial<AdminPrize> & { id: number }) =>
      api.patch(`/rewards/admin/prizes/${id}/`, data).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'prizes'] }),
  })
}

export function useDeletePrize() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => api.delete(`/rewards/admin/prizes/${id}/`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'prizes'] }),
  })
}

// ── Redemptions ───────────────────────────────────────────────────────────────

export function useAdminRedemptions(statusFilter?: string) {
  return useQuery<AdminRedemption[]>({
    queryKey: ['admin', 'redemptions', statusFilter],
    queryFn: () => {
      const params = statusFilter ? `?status=${statusFilter}` : ''
      return api.get(`/rewards/admin/redemptions/${params}`).then(r => r.data)
    },
  })
}

export function useUpdateRedemption() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) =>
      api.patch(`/rewards/admin/redemptions/${id}/`, { status }).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'redemptions'] }),
  })
}

// ── Outlets ───────────────────────────────────────────────────────────────────

export function useAdminOutlets() {
  return useQuery<AdminOutlet[]>({
    queryKey: ['admin', 'outlets'],
    queryFn: () => api.get('/recycling/admin/outlets/').then(r => r.data),
  })
}

export function useCreateOutlet() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Partial<AdminOutlet>) => api.post('/recycling/admin/outlets/', data).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'outlets'] }),
  })
}

export function useUpdateOutlet() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...data }: Partial<AdminOutlet> & { id: number }) =>
      api.patch(`/recycling/admin/outlets/${id}/`, data).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'outlets'] }),
  })
}

export function useDeleteOutlet() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => api.delete(`/recycling/admin/outlets/${id}/`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'outlets'] }),
  })
}

// ── Users ─────────────────────────────────────────────────────────────────────

export function useAdminUsers(search?: string, region?: string) {
  return useQuery<AdminUser[]>({
    queryKey: ['admin', 'users', search, region],
    queryFn: () => {
      const params = new URLSearchParams()
      if (search) params.set('q', search)
      if (region) params.set('region', region)
      const qs = params.toString()
      return api.get(`/users/admin/users/${qs ? `?${qs}` : ''}`).then(r => r.data)
    },
  })
}

export function useUpdateAdminUser() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...data }: { id: number; [key: string]: unknown }) =>
      api.patch(`/users/admin/users/${id}/`, data).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'users'] }),
  })
}

export function useDeleteAdminUser() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => api.delete(`/users/admin/users/${id}/`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'users'] }),
  })
}
