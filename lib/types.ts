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

export interface Me {
  id: string
  email: string
  name: string | null
  twoFactorEnabled: boolean
  assistantConsent: boolean
}
