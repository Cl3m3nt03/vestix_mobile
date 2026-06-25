import { color } from '@/theme/tokens'
import type { AssetType } from './types'

export const eur = (n: number, max = 0) =>
  new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: max }).format(n)

export const dateFr = (iso: string) =>
  new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })

export const CAT: Record<AssetType, { label: string; color: string }> = {
  STOCK:        { label: 'Actions',    color: color.acc },
  PEA:          { label: 'PEA',        color: color.acc2 },
  CTO:          { label: 'CTO',        color: color.accBr },
  CRYPTO:       { label: 'Crypto',     color: color.pop },
  SAVINGS:      { label: 'Épargne',    color: color.d2 },
  BANK_ACCOUNT: { label: 'Banque',     color: color.info },
  REAL_ESTATE:  { label: 'Immo',       color: color.violet },
  LIABILITY:    { label: 'Dette',      color: color.down },
  COLLECTION:   { label: 'Collection', color: color.d4 },
  OTHER:        { label: 'Autre',      color: color.inkFaint },
}

/** Emoji icône par type d'actif — réutilisé du web. */
export const TYPE_EMOJI: Record<AssetType, string> = {
  BANK_ACCOUNT: '🏦',
  SAVINGS:      '🐖',
  REAL_ESTATE:  '🏠',
  STOCK:        '📈',
  CRYPTO:       '₿',
  PEA:          '🇫🇷',
  CTO:          '📊',
  LIABILITY:    '💳',
  COLLECTION:   '🎴',
  OTHER:        '📦',
}
