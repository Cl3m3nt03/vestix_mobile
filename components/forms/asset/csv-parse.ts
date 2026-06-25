/** Parser CSV léger (réutilisé du web) — détecte ; ou , et les colonnes FR/EN
 * usuelles : libellé, ISIN, quantité, PRU. */

export interface CsvRow { name: string; quantity: number; avgBuyPrice: number; isin?: string }

function normStr(s: string): string {
  return s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
}
function parseNum(s: string): number {
  return parseFloat(s.replace(/\s/g, '').replace(',', '.')) || 0
}

export function quickParseCsv(csv: string): CsvRow[] {
  const text = csv.replace(/^﻿/, '')
  const lines = text.trim().split(/\r?\n/).filter((l) => l.trim())
  if (lines.length < 2) return []
  const sep = lines[0].split(';').length > lines[0].split(',').length ? ';' : ','
  const headers = lines[0].split(sep).map((h) => normStr(h.replace(/^["'\s]+|["'\s]+$/g, '')))
  function findCol(...cands: string[]): number {
    for (const c of cands) {
      const idx = headers.findIndex((h) => h.includes(normStr(c)))
      if (idx >= 0) return idx
    }
    return -1
  }
  const colName = findCol('libelle', 'designation', 'instrument', 'nom du titre', 'titre', 'name')
  const colIsin = findCol('isin')
  const colQty  = findCol('quantite', 'qte', 'nb titres', 'quantity', 'shares', 'nombre de titres')
  const colPru  = findCol('buyingprice', 'buying price', 'pru', 'prix de revient', 'cout moyen', 'average cost', 'avg price', 'pa')
  const rows: CsvRow[] = []
  for (let i = 1; i < lines.length; i++) {
    const parts = lines[i].split(sep).map((p) => p.replace(/^["'\s]+|["'\s]+$/g, '').trim())
    if (parts.length < 2) continue
    const name = colName >= 0 ? parts[colName] : parts[0]
    const qty  = colQty  >= 0 ? parseNum(parts[colQty])  : 0
    const pru  = colPru  >= 0 ? parseNum(parts[colPru])  : 0
    const isin = colIsin >= 0 ? parts[colIsin]?.toUpperCase().replace(/\s/g, '') : undefined
    if (!name || normStr(name).includes('total') || qty === 0) continue
    rows.push({ name, quantity: qty, avgBuyPrice: pru, isin })
  }
  return rows
}
