import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from './api'
import type { PortfolioStats, Asset, Me, Transaction, BudgetData, Goal, Performance, Fiscal, SearchResult } from './types'

export function useMe() {
  return useQuery({ queryKey: ['me'], queryFn: () => api.get<Me>('/api/users/me') })
}

export function useStats() {
  return useQuery({ queryKey: ['stats'], queryFn: () => api.get<PortfolioStats>('/api/portfolio/stats') })
}

export function useAssets() {
  return useQuery({ queryKey: ['assets'], queryFn: () => api.get<Asset[]>('/api/assets') })
}

export function useTransactions() {
  return useQuery({ queryKey: ['transactions'], queryFn: () => api.get<Transaction[]>('/api/transactions?limit=100') })
}

export function useBudget() {
  return useQuery({ queryKey: ['budget'], queryFn: () => api.get<BudgetData>('/api/budget/items') })
}

export function useGoals() {
  return useQuery({ queryKey: ['goals'], queryFn: () => api.get<Goal[]>('/api/goals') })
}

export function usePerformance(months = 24) {
  return useQuery({ queryKey: ['performance', months], queryFn: () => api.get<Performance>(`/api/performance?months=${months}`) })
}

export function useFiscal(year?: number) {
  const y = year ?? new Date().getFullYear()
  return useQuery({ queryKey: ['fiscal', y], queryFn: () => api.get<Fiscal>(`/api/fiscal?year=${y}`) })
}

export function useSearch(q: string) {
  return useQuery({
    queryKey: ['search', q],
    queryFn: () => api.get<SearchResult>(`/api/global-search?q=${encodeURIComponent(q)}`),
    enabled: q.trim().length >= 2,
  })
}

export function useSparkline(symbol: string | null, name = '', range = '1mo') {
  return useQuery({
    queryKey: ['sparkline', symbol, range],
    queryFn: () => api.get<{ prices: number[] }>(`/api/sparkline?symbol=${encodeURIComponent(symbol!)}&name=${encodeURIComponent(name)}&range=${range}`),
    enabled: !!symbol,
  })
}

// ── Mutations ───────────────────────────────────────────────────────────────
export function useAddTransaction() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: Record<string, unknown>) => api.post('/api/transactions', body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['transactions'] })
      qc.invalidateQueries({ queryKey: ['stats'] })
      qc.invalidateQueries({ queryKey: ['assets'] })
    },
  })
}

export function useAddAsset() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: Record<string, unknown>) => api.post('/api/assets', body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['assets'] })
      qc.invalidateQueries({ queryKey: ['stats'] })
    },
  })
}

export function useAddBudgetItem() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: Record<string, unknown>) => api.post('/api/budget/items', body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['budget'] }),
  })
}

export function useAddGoal() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: Record<string, unknown>) => api.post('/api/goals', body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['goals'] }),
  })
}

export function useUpdateProfile() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: { name?: string; email?: string }) => api.patch('/api/users/me', body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['me'] }),
  })
}
