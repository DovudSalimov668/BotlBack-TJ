import { useQuery } from '@tanstack/react-query'
import api from '@/lib/axios'

export function useRecyclingPoints() {
  return useQuery({
    queryKey: ['recycling-points'],
    queryFn: () => api.get('/recycling/points/').then((r) => r.data.results ?? r.data),
    staleTime: 5 * 60_000,
  })
}
