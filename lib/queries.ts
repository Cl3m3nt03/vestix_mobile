import { useQuery } from '@tanstack/react-query'
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
