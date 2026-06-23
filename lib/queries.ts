import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from './api'
import type { PortfolioStats, Asset, Me, Transaction, BudgetData } from './types'

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
