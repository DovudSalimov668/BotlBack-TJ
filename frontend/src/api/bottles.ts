import { useMutation, useQuery } from '@tanstack/react-query'
import api from '@/lib/axios'
import { queryClient } from '@/lib/queryClient'

export function useVerifyBottle(qrCode: string) {
  return useQuery({
    queryKey: ['bottle', qrCode],
    queryFn: () => api.get(`/bottles/verify/${qrCode}/`).then((r) => r.data),
    enabled: !!qrCode,
  })
}

export function useScanBottle() {
  return useMutation({
    mutationFn: (data: { qr_code: string; latitude?: number; longitude?: number }) =>
      api.post('/bottles/scan/', data).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['me'] })
      queryClient.invalidateQueries({ queryKey: ['stats'] })
    },
  })
}

export function useRecycleBottle() {
  return useMutation({
    mutationFn: (data: { bottle_qr: string; recycling_point_qr: string }) =>
      api.post('/bottles/recycle/', data).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['me'] })
      queryClient.invalidateQueries({ queryKey: ['stats'] })
    },
  })
}

export interface RecyclingPointInfo {
  qr_code: string
  name: string
  name_tg: string
  address: string
  region: string
  latitude: number
  longitude: number
}

export async function verifyRecyclingPoint(qrCode: string): Promise<RecyclingPointInfo> {
  return api.get(`/recycling/points/verify/${qrCode}/`).then((r) => r.data)
}
