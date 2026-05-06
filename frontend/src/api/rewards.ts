import { useQuery, useMutation } from '@tanstack/react-query'
import api from '@/lib/axios'
import { queryClient } from '@/lib/queryClient'

export function usePrizes() {
  return useQuery({
    queryKey: ['prizes'],
    queryFn: () => api.get('/rewards/prizes/').then((r) => r.data.results ?? r.data),
  })
}

export function useRedeem() {
  return useMutation({
    mutationFn: (prize_id: number) =>
      api.post('/rewards/redeem/', { prize_id }).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['me'] })
      queryClient.invalidateQueries({ queryKey: ['redemptions'] })
    },
  })
}

export function useRedemptionHistory() {
  return useQuery({
    queryKey: ['redemptions'],
    queryFn: () => api.get('/rewards/history/').then((r) => r.data),
  })
}
