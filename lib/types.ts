// Shapes renvoyés par l'API Finexa (mêmes que le web).

export type AssetType =
  | 'BANK_ACCOUNT' | 'SAVINGS' | 'REAL_ESTATE'
  | 'STOCK' | 'CRYPTO' | 'PEA' | 'CTO' | 'OTHER' | 'COLLECTION'

export type AssetBreakdown = Record<AssetType, number>

export interface PortfolioStats {
  totalValue: number
  totalInvested: number
  totalPnl: number
  totalPnlPercent: number
  grossValue: number
  liabilities: number
  breakdown: AssetBreakdown
  history: { date: string; value: number }[]
}

export interface Holding {
  id: string
  symbol: string
  name: string
  quantity: number
  avgBuyPrice: number
  currency: string
  currentPrice?: number
  pnlPercentEur?: number
}

export interface Asset {
  id: string
  name: string
  type: AssetType
  institution: string | null
  value: number          // EUR
  currency: string
  holdings: Holding[]
  readOnly?: boolean
}

export type TxType = 'BUY' | 'SELL' | 'DEPOSIT' | 'WITHDRAWAL' | 'DIVIDEND'

export interface Transaction {
  id: string
  type: TxType
  symbol: string | null
  quantity: number | null
  price: number
  fees: number
  currency: string
  date: string
  notes: string | null
  holding?: { symbol: string; name: string; assetId: string } | null
}

export type BudgetCategory = 'needs' | 'wants' | 'savings' | 'investment'

export interface BudgetItem {
  id: string
  label: string
  amount: number
  category: BudgetCategory
  dayOfMonth: number | null
  recurring: boolean
}

export interface BudgetData {
  items: BudgetItem[]
  income: number | null
}

export interface Goal {
  id: string
  name: string
  targetValue: number
  currency: string
  targetDate: string | null
  notes: string | null
  assetId: string | null
  assetName: string | null
  expectedRate: number
}

export interface PerfPoint { date: string; value: number }
export interface Performance {
  portfolio: PerfPoint[]
  cac40: PerfPoint[]
  sp500: PerfPoint[]
  msciWorld: PerfPoint[]
}

export interface Fiscal {
  year: number
  plusValues: { total: number; cto: number; pea: number; exoneres: number
    lines: { date: string; symbol: string; quantity: number; plusValue: number; accountType: string; exonere: boolean }[] }
  dividends: { total: number; lines: { date: string; symbol: string | null; amount: number; currency: string }[] }
  tax: { taxableBase: number; pfuAmount: number; pfuRate: number; peaExonereAmount: number; irAmount: number; socialAmount: number }
}

export interface SearchResult {
  assets: { id: string; name: string; type: AssetType; value: number; currency: string }[]
  transactions: { id: string; type: TxType; symbol: string | null; price: number; currency: string; date: string; notes: string | null }[]
  goals: { id: string; name: string; targetValue: number; currency: string }[]
}

export interface Me {
  id: string
  email: string
  name: string | null
  twoFactorEnabled: boolean
  assistantConsent: boolean
}
