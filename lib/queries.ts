import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from './api'
import type {
  PortfolioStats, Asset, Me, Transaction, BudgetData, Goal, Performance, Fiscal, SearchResult,
  Institution, BankConnection, BankTx,
  HoloStatus, HoloData, PriceAlert,
} from './types'

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
const invalidateTx = (qc: ReturnType<typeof useQueryClient>) => {
  qc.invalidateQueries({ queryKey: ['transactions'] })
  qc.invalidateQueries({ queryKey: ['stats'] })
  qc.invalidateQueries({ queryKey: ['assets'] })
}

export function useAddTransaction() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: Record<string, unknown>) => api.post('/api/transactions', body),
    onSuccess: () => invalidateTx(qc),
  })
}

export function useEditTransaction() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...body }: { id: string } & Record<string, unknown>) => api.patch(`/api/transactions/${id}`, body),
    onSuccess: () => invalidateTx(qc),
  })
}

export function useDeleteTransaction() {
  const qc = useQueryClient()
  return useMutation({ mutationFn: (id: string) => api.del(`/api/transactions/${id}`), onSuccess: () => invalidateTx(qc) })
}

const invalidateAssets = (qc: ReturnType<typeof useQueryClient>) => {
  qc.invalidateQueries({ queryKey: ['assets'] })
  qc.invalidateQueries({ queryKey: ['stats'] })
}

export function useAddAsset() {
  const qc = useQueryClient()
  return useMutation({ mutationFn: (body: Record<string, unknown>) => api.post('/api/assets', body), onSuccess: () => invalidateAssets(qc) })
}

export function useEditAsset() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...body }: { id: string } & Record<string, unknown>) => api.patch(`/api/assets/${id}`, body),
    onSuccess: () => invalidateAssets(qc),
  })
}

export function useDeleteAsset() {
  const qc = useQueryClient()
  return useMutation({ mutationFn: (id: string) => api.del(`/api/assets/${id}`), onSuccess: () => invalidateAssets(qc) })
}

export function useAddBudgetItem() {
  const qc = useQueryClient()
  return useMutation({ mutationFn: (body: Record<string, unknown>) => api.post('/api/budget/items', body), onSuccess: () => qc.invalidateQueries({ queryKey: ['budget'] }) })
}

export function useEditBudgetItem() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...body }: { id: string } & Record<string, unknown>) => api.patch(`/api/budget/items/${id}`, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['budget'] }),
  })
}

export function useDeleteBudgetItem() {
  const qc = useQueryClient()
  return useMutation({ mutationFn: (id: string) => api.del(`/api/budget/items/${id}`), onSuccess: () => qc.invalidateQueries({ queryKey: ['budget'] }) })
}

export function useAddGoal() {
  const qc = useQueryClient()
  return useMutation({ mutationFn: (body: Record<string, unknown>) => api.post('/api/goals', body), onSuccess: () => qc.invalidateQueries({ queryKey: ['goals'] }) })
}

export function useEditGoal() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...body }: { id: string } & Record<string, unknown>) => api.patch(`/api/goals/${id}`, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['goals'] }),
  })
}

export function useDeleteGoal() {
  const qc = useQueryClient()
  return useMutation({ mutationFn: (id: string) => api.del(`/api/goals/${id}`), onSuccess: () => qc.invalidateQueries({ queryKey: ['goals'] }) })
}

export function useUpdateProfile() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: { name?: string; email?: string }) => api.patch('/api/users/me', body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['me'] }),
  })
}

// ── Banque ──────────────────────────────────────────────────────────────────
export function useBankConnections() {
  return useQuery({ queryKey: ['bank-connections'], queryFn: () => api.get<BankConnection[]>('/api/bank/sync') })
}

export function useBankTransactions() {
  return useQuery({
    queryKey: ['bank-transactions'],
    queryFn: () => api.get<{ transactions: BankTx[]; total: number; totals: { in: number; out: number } }>('/api/bank/transactions?limit=100'),
  })
}

export function useInstitutions(q: string) {
  return useQuery({
    queryKey: ['institutions', q],
    queryFn: () => api.get<Institution[]>(`/api/bank/institutions?country=FR&q=${encodeURIComponent(q)}`),
  })
}

export function useConnectBank() {
  return useMutation({
    mutationFn: (body: { institutionId: string; bankName: string }) =>
      api.post<{ link: string; connectionId: string }>('/api/bank/connect', { ...body, country: 'FR' }),
  })
}

export function useSyncBank() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (connectionId: string) => api.post('/api/bank/sync', { connectionId }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['bank-connections'] })
      qc.invalidateQueries({ queryKey: ['bank-transactions'] })
      qc.invalidateQueries({ queryKey: ['stats'] })
      qc.invalidateQueries({ queryKey: ['assets'] })
    },
  })
}

// ── HoloFolio (Pokémon) ──────────────────────────────────────────────────────
export function useHoloStatus() {
  return useQuery({ queryKey: ['holo-status'], queryFn: () => api.get<HoloStatus>('/api/holofolio/status') })
}

export function useHoloData() {
  return useQuery({ queryKey: ['holo-data'], queryFn: () => api.get<HoloData>('/api/holofolio/data?period=90d') })
}

// ── Alertes de prix ───────────────────────────────────────────────────────────
export function useAlerts() {
  return useQuery({ queryKey: ['alerts'], queryFn: () => api.get<PriceAlert[]>('/api/alerts') })
}

export function useAddAlert() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: Record<string, unknown>) => api.post('/api/alerts', body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['alerts'] }),
  })
}

export function useDeleteAlert() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.del(`/api/alerts/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['alerts'] }),
  })
}
