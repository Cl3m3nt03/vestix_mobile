import { useState, useEffect, useMemo } from 'react'
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native'
import { Feather } from '@expo/vector-icons'
import { Sheet } from '@/components/ui/Sheet'
import { FxButton } from '@/components/ui/FxButton'
import { useAddAsset, useEditAsset, useDeleteAsset, useAssets, usePrices } from '@/lib/queries'
import { api, ApiError } from '@/lib/api'
import { eur, CAT, TYPE_EMOJI } from '@/lib/format'
import { color, font, radius } from '@/theme/tokens'
import type { Asset, AssetType, AssetSearchResult } from '@/lib/types'

import { TypeGrid } from './asset/TypeGrid'
import { SearchPicker } from './asset/SearchPicker'
import { LotEditor, LotDraft } from './asset/LotEditor'
import { CsvImport } from './asset/CsvImport'
import { CsvRow } from './asset/csv-parse'
import { SavingsPresets, BankPresets, RealEstatePresets } from './asset/PresetChips'

type Phase = 'type' | 'method' | 'form'

const FINANCIAL: AssetType[] = ['STOCK', 'CRYPTO', 'PEA', 'CTO']
const CURRENCIES = ['EUR', 'USD', 'GBP', 'CHF']

interface FormState {
  name: string
  type: AssetType
  institution: string
  value: string
  currency: string
  notes: string
  interestRate: string
  monthlyPayment: string
  linkedAssetId: string
}

const initial = (a?: Asset | null): FormState => ({
  name:           a?.name        ?? '',
  type:           a?.type        ?? 'BANK_ACCOUNT',
  institution:    a?.institution ?? '',
  value:          a?.value != null ? String(a.value) : '',
  currency:       a?.currency    ?? 'EUR',
  notes:          a?.notes       ?? '',
  interestRate:   a?.interestRate   != null ? String(a.interestRate)   : '',
  monthlyPayment: a?.monthlyPayment != null ? String(a.monthlyPayment) : '',
  linkedAssetId:  a?.linkedAssetId  ?? '',
})

/**
 * Wizard mobile « Nouvel actif » — parité 1:1 avec le formulaire web Finexa.
 * 3 phases : sélection type → (PEA/CTO) choix import/manuel → formulaire
 * adapté. Recherche temps réel (titre/crypto/ETF), prix live, presets,
 * multi-lots, LIABILITY, import CSV.
 */
export function AddAsset({
  visible, onClose, editing,
}: {
  visible: boolean
  onClose: () => void
  editing?: Asset | null
}) {
  const add = useAddAsset()
  const edit = useEditAsset()
  const del = useDeleteAsset()
  const { data: allAssets } = useAssets()

  const [phase, setPhase] = useState<Phase>(editing ? 'form' : 'type')
  const [form, setForm] = useState<FormState>(initial(editing))
  const [selected, setSelected] = useState<AssetSearchResult | null>(null)
  const [unitPrice, setUnitPrice] = useState('')
  const [quantity, setQuantity] = useState('')
  const [buyDate, setBuyDate] = useState('')
  const [lots, setLots] = useState<LotDraft[]>([])
  const [csvMode, setCsvMode] = useState(false)
  const [csvRows, setCsvRows] = useState<CsvRow[]>([])
  const [csvText, setCsvText] = useState('')
  const [csvFileName, setCsvFileName] = useState('')
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  const isFinancial = FINANCIAL.includes(form.type)
  const isPeaCto = form.type === 'PEA' || form.type === 'CTO'
  const editLive = (editing?.holdings ?? []) as { id: string; symbol: string; name: string; quantity: number; avgBuyPrice: number; buyDate?: string | null }[]
  const editMultiSymbol = editLive.length > 1 && !editLive.every((h) => h.symbol === editLive[0].symbol)
  const useLotsEditor = !!editing && isFinancial && !editMultiSymbol

  const linkableAssets = (allAssets ?? []).filter((a) => a.type !== 'LIABILITY' && a.id !== editing?.id)

  const totalValue = useMemo(() => {
    if (csvMode) return csvRows.reduce((s, r) => s + r.quantity * r.avgBuyPrice, 0)
    if (isFinancial && useLotsEditor) return lots.reduce((s, l) => s + (parseFloat(l.quantity) || 0) * (parseFloat(l.avgBuyPrice) || 0), 0)
    if (isFinancial) return (parseFloat(quantity) || 0) * (parseFloat(unitPrice) || 0)
    return parseFloat(form.value) || 0
  }, [csvMode, csvRows, isFinancial, useLotsEditor, lots, quantity, unitPrice, form.value])

  // Prix live pour le titre sélectionné (cours actuel affiché sous le picker)
  const livePrices = usePrices(selected ? [selected.symbol] : [])
  const livePrice = livePrices.data?.[0]

  // Préfill prix unitaire à la sélection (uniquement en création / pas en édition)
  useEffect(() => {
    if (!selected || editing) return
    if (livePrice?.price) {
      setUnitPrice(String(livePrice.price))
      if (selected.coinId) setForm((f) => ({ ...f, currency: 'EUR' }))
      else setForm((f) => ({ ...f, currency: 'USD' }))
    }
  }, [selected, livePrice?.price, editing])

  // Réinitialise quand on ouvre/ferme la sheet ou qu'on change l'éditing
  useEffect(() => {
    if (!visible) return
    setPhase(editing ? 'form' : 'type')
    setForm(initial(editing))
    setErr(null)
    setCsvMode(false); setCsvRows([]); setCsvText(''); setCsvFileName('')
    setSelected(null); setUnitPrice(''); setQuantity(''); setBuyDate('')
    setLots([])

    // Pré-remplissage édition d'un actif financier mono-titre
    if (editing && FINANCIAL.includes(editing.type) && editLive.length > 0) {
      const sameSymbol = editLive.every((h) => h.symbol === editLive[0].symbol)
      if (sameSymbol) {
        setSelected({ symbol: editLive[0].symbol, name: editLive[0].name })
        setLots(
          editLive
            .slice()
            .sort((a, b) => {
              const ta = a.buyDate ? new Date(a.buyDate).getTime() : 0
              const tb = b.buyDate ? new Date(b.buyDate).getTime() : 0
              return ta - tb
            })
            .map((h) => ({
              id: h.id,
              quantity: String(h.quantity),
              avgBuyPrice: String(h.avgBuyPrice),
              buyDate: h.buyDate ? h.buyDate.slice(0, 10) : '',
            })),
        )
      }
    } else if (editing && FINANCIAL.includes(editing.type) && editLive.length === 0) {
      setLots([{ quantity: '', avgBuyPrice: '', buyDate: '' }])
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, editing])

  function handleTypeChoice(t: AssetType) {
    setForm((f) => ({ ...f, type: t, name: '', institution: '', notes: '' }))
    setSelected(null); setUnitPrice(''); setQuantity(''); setBuyDate('')
    setCsvMode(false); setCsvRows([]); setCsvText(''); setCsvFileName('')
    if ((t === 'PEA' || t === 'CTO') && !editing) setPhase('method')
    else setPhase('form')
  }

  function handleBack() {
    if (phase === 'form' && !editing) {
      if (isPeaCto) setPhase('method')
      else setPhase('type')
      return
    }
    if (phase === 'method') setPhase('type')
  }

  async function submit() {
    if (submitDisabled) return
    setErr(null)
    if (!form.name.trim() && !(isFinancial && selected)) {
      setErr('Le nom est requis'); return
    }
    setBusy(true)
    try {
      // Cas import CSV (PEA/CTO en création)
      if (csvMode && isPeaCto && !editing) {
        const created = await add.mutateAsync({
          name: form.name || `${TYPE_EMOJI[form.type]} ${form.type}`,
          type: form.type,
          institution: form.institution || null,
          value: 0,
          currency: form.currency,
          notes: form.notes || null,
        }) as { id: string }
        await api.post(`/api/assets/${created.id}/import-holdings`, {
          csv: csvText, mode: 'replace',
        })
        onClose(); return
      }

      // Cas standard (création ou édition)
      const finalName = isFinancial && selected ? (selected.name || form.name) : form.name.trim()
      const body: Record<string, unknown> = {
        name:        finalName,
        type:        form.type,
        institution: form.institution.trim() || null,
        value:       isFinancial ? totalValue : (Number(form.value.replace(',', '.')) || 0),
        currency:    form.currency,
        notes:       form.notes.trim() || null,
      }
      if (isFinancial && selected) {
        body.symbol = selected.symbol
        if (useLotsEditor) {
          body.lots = lots.map((l) => ({
            id: l.id,
            quantity:    parseFloat(l.quantity) || 0,
            avgBuyPrice: parseFloat(l.avgBuyPrice) || 0,
            buyDate:     l.buyDate || null,
          }))
          body.value = lots.reduce((s, l) => s + (parseFloat(l.quantity) || 0) * (parseFloat(l.avgBuyPrice) || 0), 0)
        } else {
          body.quantity    = parseFloat(quantity)  || 0
          body.avgBuyPrice = parseFloat(unitPrice) || 0
          body.buyDate     = buyDate || null
        }
      }
      if (form.type === 'LIABILITY') {
        body.interestRate   = form.interestRate   || null
        body.monthlyPayment = form.monthlyPayment || null
        body.linkedAssetId  = form.linkedAssetId  || null
      }

      if (editing) await edit.mutateAsync({ id: editing.id, ...body })
      else await add.mutateAsync(body)
      onClose()
    } catch (e) {
      setErr(e instanceof ApiError ? e.message : 'Échec de l’enregistrement')
    } finally {
      setBusy(false)
    }
  }

  function confirmDelete() {
    if (!editing) return
    Alert.alert('Supprimer', `Supprimer « ${editing.name} » ?`, [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Supprimer', style: 'destructive', onPress: async () => { await del.mutateAsync(editing.id); onClose() } },
    ])
  }

  const submitDisabled =
    busy ||
    (csvMode && isPeaCto && !editing && (csvRows.length === 0 || !form.name)) ||
    (isFinancial && !csvMode && !selected && !editing)

  const title =
    editing                                       ? "Modifier l'actif"
    : phase === 'type'                            ? 'Ajouter un actif'
    : phase === 'method'                          ? `Nouveau ${CAT[form.type].label}`
    : csvMode                                     ? `Importer le ${CAT[form.type].label}`
    :                                               `Nouveau ${CAT[form.type].label}`

  const leading = (phase !== 'type' && !editing) ? (
    <Pressable onPress={handleBack} hitSlop={6} style={styles.backBtn}>
      <Feather name="arrow-left" size={16} color={color.ink} />
    </Pressable>
  ) : null

  return (
    <Sheet visible={visible} onClose={onClose} title={title} fullScreen leading={leading}>
      {phase === 'type' && (
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Quel type d'actif ?</Text>
          <TypeGrid value={null} onChange={handleTypeChoice} />
        </View>
      )}

      {phase === 'method' && (
        <View style={styles.methodWrap}>
          <Text style={styles.methodIntro}>Avez-vous un fichier d'export de vos positions ?</Text>
          <Pressable
            onPress={() => { setCsvMode(true); setPhase('form') }}
            style={({ pressed }) => [styles.methodCard, pressed && styles.methodPressed]}
          >
            <View style={styles.methodIco}><Feather name="upload" size={18} color={color.acc} /></View>
            <View style={{ flex: 1 }}>
              <Text style={styles.methodTitle}>Importer un CSV</Text>
              <Text style={styles.methodSub}>
                L'export CSV de Boursorama, Fortuneo, Bourse Direct ou tout autre courtier — toutes vos positions en un clic.
              </Text>
            </View>
          </Pressable>
          <Pressable
            onPress={() => { setCsvMode(false); setPhase('form') }}
            style={({ pressed }) => [styles.methodCard, pressed && styles.methodPressed]}
          >
            <View style={[styles.methodIco, { backgroundColor: color.glass2 }]}>
              <Feather name="search" size={18} color={color.inkSoft} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.methodTitle}>Saisie manuelle</Text>
              <Text style={styles.methodSub}>
                Recherchez chaque titre par nom, symbole ou ISIN et saisissez votre quantité et prix d'achat.
              </Text>
            </View>
          </Pressable>
        </View>
      )}

      {phase === 'form' && (
        <View style={styles.formWrap}>
          {/* Sélecteur de type (en édition ou non PEA/CTO) */}
          {(editing || !isPeaCto) && (
            <View>
              <Text style={styles.label}>Type d'actif</Text>
              <TypeGrid value={form.type} onChange={(t) => setForm((f) => ({ ...f, type: t }))} />
            </View>
          )}

          {/* CSV import (PEA/CTO en création) */}
          {csvMode && isPeaCto && !editing && (
            <CsvImport
              rows={csvRows}
              csvText={csvText}
              fileName={csvFileName}
              onParsed={(rows, text, name) => { setCsvRows(rows); setCsvText(text); setCsvFileName(name) }}
            />
          )}

          {/* Édition multi-titres : message info */}
          {isFinancial && editMultiSymbol && (
            <View style={styles.info}>
              <Feather name="info" size={14} color={color.inkSoft} />
              <Text style={styles.infoTxt}>
                Ce compte contient plusieurs titres. Les positions se gèrent via l'import CSV depuis le web.
              </Text>
            </View>
          )}

          {/* Recherche titre + saisie quantité (financier, mode manuel) */}
          {isFinancial && !csvMode && !editMultiSymbol && (
            <>
              <SearchPicker
                type={form.type}
                selected={selected}
                onSelect={(r) => {
                  setSelected(r)
                  setForm((f) => ({ ...f, name: r.name, institution: r.exchange ?? f.institution }))
                }}
                onClear={() => setSelected(null)}
              />

              {livePrices.isFetching && selected ? (
                <View style={styles.priceFetch}>
                  <ActivityIndicator size="small" color={color.acc} />
                  <Text style={styles.priceFetchTxt}>Récupération du cours…</Text>
                </View>
              ) : null}

              {selected && livePrice && (
                <View style={styles.priceCard}>
                  <View>
                    <Text style={styles.priceMuted}>Cours actuel</Text>
                    <Text style={styles.priceBig}>{eur(livePrice.price, 2)}</Text>
                  </View>
                  {(livePrice.changePercent24h ?? livePrice.changePct24h) != null && (
                    <View style={[
                      styles.priceChip,
                      (livePrice.changePercent24h ?? livePrice.changePct24h ?? 0) >= 0 ? styles.priceChipUp : styles.priceChipDown,
                    ]}>
                      <Feather
                        name={(livePrice.changePercent24h ?? livePrice.changePct24h ?? 0) >= 0 ? 'trending-up' : 'trending-down'}
                        size={12}
                        color={(livePrice.changePercent24h ?? livePrice.changePct24h ?? 0) >= 0 ? color.up : color.down}
                      />
                      <Text style={[
                        styles.priceChipTxt,
                        { color: (livePrice.changePercent24h ?? livePrice.changePct24h ?? 0) >= 0 ? color.up : color.down },
                      ]}>
                        {(livePrice.changePercent24h ?? livePrice.changePct24h ?? 0) >= 0 ? '+' : ''}
                        {(livePrice.changePercent24h ?? livePrice.changePct24h ?? 0).toFixed(2)}%
                      </Text>
                    </View>
                  )}
                </View>
              )}

              {/* Mono-position (création ou édition mono-lot via fallback) */}
              {selected && !useLotsEditor && (
                <>
                  <View style={styles.rowFields}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.label}>Quantité</Text>
                      <TextInput
                        value={quantity}
                        onChangeText={setQuantity}
                        placeholder="0.00"
                        placeholderTextColor={color.inkFaint}
                        keyboardType="decimal-pad"
                        style={styles.input}
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.label}>Prix unitaire</Text>
                      <TextInput
                        value={unitPrice}
                        onChangeText={setUnitPrice}
                        placeholder="0.00"
                        placeholderTextColor={color.inkFaint}
                        keyboardType="decimal-pad"
                        style={styles.input}
                      />
                    </View>
                  </View>
                  <View>
                    <Text style={styles.label}>Date d'achat <Text style={styles.optional}>(optionnel)</Text></Text>
                    <TextInput
                      value={buyDate}
                      onChangeText={setBuyDate}
                      placeholder="AAAA-MM-JJ"
                      placeholderTextColor={color.inkFaint}
                      style={styles.input}
                    />
                  </View>
                  {quantity && unitPrice ? (
                    <View style={styles.totalCard}>
                      <Text style={styles.totalLabel}>Valeur totale</Text>
                      <Text style={styles.totalValue}>{eur(totalValue, 2)}</Text>
                    </View>
                  ) : null}
                </>
              )}

              {/* Édition multi-lots */}
              {useLotsEditor && !selected && (
                <View style={styles.info}>
                  <Feather name="search" size={13} color={color.inkSoft} />
                  <Text style={styles.infoTxt}>Recherche le titre ci-dessus pour ajouter la première position.</Text>
                </View>
              )}
              {useLotsEditor && (
                <LotEditor lots={lots} currency={form.currency} onChange={setLots} />
              )}
            </>
          )}

          {/* Presets SAVINGS */}
          {form.type === 'SAVINGS' && (
            <View>
              <Text style={styles.label}>Choisir un produit d'épargne</Text>
              <SavingsPresets
                selectedName={form.name}
                onPick={(p) => setForm((f) => ({ ...f, name: p.name, institution: p.institution, notes: p.notes }))}
              />
            </View>
          )}

          {/* Presets BANK */}
          {form.type === 'BANK_ACCOUNT' && (
            <View>
              <Text style={styles.label}>Banque</Text>
              <BankPresets
                selected={form.institution}
                onPick={(b) => setForm((f) => ({ ...f, institution: b }))}
              />
            </View>
          )}

          {/* Presets REAL_ESTATE */}
          {form.type === 'REAL_ESTATE' && (
            <View>
              <Text style={styles.label}>Type de bien</Text>
              <RealEstatePresets
                selectedName={form.name}
                onPick={(p) => setForm((f) => ({ ...f, name: p.name, notes: p.notes }))}
              />
            </View>
          )}

          {/* Nom */}
          <View>
            <Text style={styles.label}>
              {form.type === 'REAL_ESTATE' ? 'Adresse / Nom du bien' : 'Nom du compte'}
            </Text>
            <TextInput
              value={form.name}
              onChangeText={(v) => setForm((f) => ({ ...f, name: v }))}
              placeholder={
                form.type === 'REAL_ESTATE' ? '12 rue de la Paix, Paris…' :
                form.type === 'SAVINGS'      ? 'Livret A, PEL…' :
                form.type === 'PEA'          ? 'Mon PEA Boursorama' :
                form.type === 'CTO'          ? 'Mon CTO Fortuneo' :
                (isFinancial && !csvMode)    ? 'Rempli automatiquement…' :
                'Nom du compte'
              }
              placeholderTextColor={color.inkFaint}
              style={styles.input}
            />
          </View>

          {/* Institution (non-financier ou CSV) */}
          {(!isFinancial || csvMode) && (
            <View>
              <Text style={styles.label}>
                {form.type === 'REAL_ESTATE' ? 'Notaire / Agence' : 'Institution'} <Text style={styles.optional}>(optionnel)</Text>
              </Text>
              <TextInput
                value={form.institution}
                onChangeText={(v) => setForm((f) => ({ ...f, institution: v }))}
                placeholder={
                  form.type === 'BANK_ACCOUNT' ? 'Sélectionne ci-dessus ou saisis…' :
                  form.type === 'REAL_ESTATE'  ? 'Cabinet Immobilier…' :
                  form.type === 'PEA'          ? 'Boursorama, Fortuneo…' :
                  form.type === 'CTO'          ? 'Degiro, Interactive Brokers…' :
                  'Institution financière…'
                }
                placeholderTextColor={color.inkFaint}
                style={styles.input}
              />
            </View>
          )}

          {/* Valeur + devise (non-financier) */}
          {!isFinancial && (
            <View style={styles.rowFields}>
              <View style={{ flex: 2 }}>
                <Text style={styles.label}>
                  {form.type === 'REAL_ESTATE' ? 'Valeur estimée'
                    : form.type === 'LIABILITY' ? 'Capital restant dû'
                    : 'Solde / Valeur actuelle'}
                </Text>
                <TextInput
                  value={form.value}
                  onChangeText={(v) => setForm((f) => ({ ...f, value: v }))}
                  placeholder="0.00"
                  placeholderTextColor={color.inkFaint}
                  keyboardType="decimal-pad"
                  style={styles.input}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>Devise</Text>
                <CurrencySelect value={form.currency} onChange={(c) => setForm((f) => ({ ...f, currency: c }))} />
              </View>
            </View>
          )}

          {/* Champs LIABILITY */}
          {form.type === 'LIABILITY' && (
            <>
              <View style={styles.rowFields}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.label}>Taux annuel <Text style={styles.optional}>(%)</Text></Text>
                  <TextInput
                    value={form.interestRate}
                    onChangeText={(v) => setForm((f) => ({ ...f, interestRate: v }))}
                    placeholder="3.50"
                    placeholderTextColor={color.inkFaint}
                    keyboardType="decimal-pad"
                    style={styles.input}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.label}>Mensualité</Text>
                  <TextInput
                    value={form.monthlyPayment}
                    onChangeText={(v) => setForm((f) => ({ ...f, monthlyPayment: v }))}
                    placeholder="0.00"
                    placeholderTextColor={color.inkFaint}
                    keyboardType="decimal-pad"
                    style={styles.input}
                  />
                </View>
              </View>
              <View>
                <Text style={styles.label}>Adossé à un actif <Text style={styles.optional}>(optionnel)</Text></Text>
                <LinkedAssetPicker
                  value={form.linkedAssetId}
                  onChange={(id) => setForm((f) => ({ ...f, linkedAssetId: id }))}
                  options={linkableAssets}
                />
                <Text style={styles.hint}>
                  Ex. relier un crédit immobilier à son bien pour afficher l'équité nette.
                </Text>
              </View>
            </>
          )}

          {/* Devise (financier après sélection) */}
          {isFinancial && !csvMode && selected && (
            <View style={styles.rowFields}>
              <View style={{ flex: 2 }} />
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>Devise</Text>
                <CurrencySelect value={form.currency} onChange={(c) => setForm((f) => ({ ...f, currency: c }))} />
              </View>
            </View>
          )}

          {/* Notes */}
          <View>
            <Text style={styles.label}>Notes <Text style={styles.optional}>(optionnel)</Text></Text>
            <TextInput
              value={form.notes}
              onChangeText={(v) => setForm((f) => ({ ...f, notes: v }))}
              placeholder="Informations complémentaires…"
              placeholderTextColor={color.inkFaint}
              multiline
              style={[styles.input, styles.textarea]}
            />
          </View>

          {err ? <Text style={styles.err}>{err}</Text> : null}

          <FxButton
            label={
              busy
                ? (csvMode ? 'Import en cours…' : 'Enregistrement…')
                : editing
                ? 'Mettre à jour'
                : csvMode
                ? `Créer et importer (${csvRows.length})`
                : 'Ajouter'
            }
            onPress={submit}
            style={{ marginTop: 6, opacity: submitDisabled ? 0.5 : 1 }}
          />
          {editing ? (
            <FxButton label="Supprimer" variant="danger" onPress={confirmDelete} style={{ marginTop: 10 }} />
          ) : null}
        </View>
      )}
    </Sheet>
  )
}

/* ── Sous-helpers UI ───────────────────────────────────────────── */

function CurrencySelect({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <View style={styles.currencyRow}>
      {CURRENCIES.map((c) => (
        <Pressable
          key={c}
          onPress={() => onChange(c)}
          style={({ pressed }) => [styles.currencyChip, value === c && styles.currencyChipActive, pressed && { opacity: 0.85 }]}
        >
          <Text style={[styles.currencyTxt, value === c && styles.currencyTxtActive]}>{c}</Text>
        </Pressable>
      ))}
    </View>
  )
}

function LinkedAssetPicker({
  value, onChange, options,
}: {
  value: string
  onChange: (id: string) => void
  options: { id: string; name: string }[]
}) {
  return (
    <View style={styles.linkedRow}>
      <Pressable
        onPress={() => onChange('')}
        style={({ pressed }) => [styles.linkedChip, value === '' && styles.linkedChipActive, pressed && { opacity: 0.85 }]}
      >
        <Text style={[styles.linkedTxt, value === '' && styles.linkedTxtActive]}>Aucun</Text>
      </Pressable>
      {options.map((o) => (
        <Pressable
          key={o.id}
          onPress={() => onChange(o.id)}
          style={({ pressed }) => [styles.linkedChip, value === o.id && styles.linkedChipActive, pressed && { opacity: 0.85 }]}
        >
          <Text style={[styles.linkedTxt, value === o.id && styles.linkedTxtActive]} numberOfLines={1}>{o.name}</Text>
        </Pressable>
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  section: { gap: 10, paddingBottom: 16 },
  sectionLabel: { fontFamily: font.bodyMed, fontSize: 13, color: color.inkSoft, marginBottom: 4 },
  backBtn: {
    width: 32, height: 32, borderRadius: 16,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: color.glass2, borderWidth: 1, borderColor: color.glassHi,
  },

  methodWrap: { gap: 12, paddingBottom: 16 },
  methodIntro: { fontFamily: font.body, fontSize: 13, color: color.inkSoft },
  methodCard: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 12,
    padding: 14, borderRadius: radius.sm,
    borderWidth: 1, borderColor: color.glassHi, backgroundColor: color.glass2,
  },
  methodPressed: { borderColor: color.acc, backgroundColor: color.accTint },
  methodIco: {
    width: 40, height: 40, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: color.accTint,
  },
  methodTitle: { fontFamily: font.bodySemi, fontSize: 14, color: color.ink },
  methodSub: { fontFamily: font.body, fontSize: 11.5, color: color.inkFaint, marginTop: 2 },

  formWrap: { gap: 14, paddingBottom: 24 },
  label: { fontFamily: font.mono, fontSize: 10, letterSpacing: 0.8, textTransform: 'uppercase', color: color.inkFaint, marginBottom: 5 },
  optional: { fontFamily: font.body, textTransform: 'none' },
  input: {
    height: 48, paddingHorizontal: 14,
    borderRadius: radius.sm, borderWidth: 1, borderColor: color.glassHi,
    backgroundColor: color.white, fontFamily: font.body, fontSize: 14.5, color: color.ink,
  },
  textarea: { height: 76, paddingTop: 12, textAlignVertical: 'top' },
  rowFields: { flexDirection: 'row', gap: 10 },

  priceFetch: {
    flexDirection: 'row', gap: 8, alignItems: 'center',
    backgroundColor: color.glass2, borderRadius: radius.sm,
    paddingHorizontal: 12, paddingVertical: 10,
  },
  priceFetchTxt: { fontFamily: font.bodyMed, fontSize: 13, color: color.inkSoft },
  priceCard: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: color.glass2, borderWidth: 1, borderColor: color.glassHi,
    paddingHorizontal: 14, paddingVertical: 11, borderRadius: radius.sm,
  },
  priceMuted: { fontFamily: font.body, fontSize: 11, color: color.inkFaint },
  priceBig: { fontFamily: font.monoSemi, fontSize: 17, color: color.ink, marginTop: 2 },
  priceChip: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 9, paddingVertical: 6, borderRadius: 10 },
  priceChipUp: { backgroundColor: 'rgba(0,137,84,0.10)' },
  priceChipDown: { backgroundColor: 'rgba(206,81,77,0.10)' },
  priceChipTxt: { fontFamily: font.bodySemi, fontSize: 12.5 },

  totalCard: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: color.accTint, borderWidth: 1, borderColor: color.acc,
    paddingHorizontal: 14, paddingVertical: 11, borderRadius: radius.sm,
  },
  totalLabel: { fontFamily: font.bodyMed, fontSize: 12.5, color: color.acc3 },
  totalValue: { fontFamily: font.monoSemi, fontSize: 16, color: color.acc },

  info: {
    flexDirection: 'row', gap: 8, alignItems: 'flex-start',
    backgroundColor: color.glass2, borderWidth: 1, borderColor: color.glassHi,
    paddingHorizontal: 12, paddingVertical: 9, borderRadius: radius.sm,
  },
  infoTxt: { fontFamily: font.body, fontSize: 12, color: color.inkSoft, flex: 1 },

  hint: { fontFamily: font.body, fontSize: 11, color: color.inkFaint, marginTop: 5 },
  err: { fontFamily: font.bodyMed, fontSize: 13, color: color.down, marginTop: 4 },

  currencyRow: { flexDirection: 'row', gap: 6, height: 48, alignItems: 'center' },
  currencyChip: {
    flex: 1, paddingVertical: 9,
    borderRadius: radius.sm, borderWidth: 1, borderColor: color.glassHi,
    backgroundColor: color.white, alignItems: 'center',
  },
  currencyChipActive: { borderColor: color.acc, backgroundColor: color.accTint },
  currencyTxt: { fontFamily: font.bodySemi, fontSize: 11.5, color: color.inkSoft },
  currencyTxtActive: { color: color.acc },

  linkedRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  linkedChip: {
    paddingHorizontal: 11, paddingVertical: 7,
    borderRadius: 999, borderWidth: 1, borderColor: color.glassHi,
    backgroundColor: color.glass2, maxWidth: 200,
  },
  linkedChipActive: { borderColor: color.acc, backgroundColor: color.accTint },
  linkedTxt: { fontFamily: font.bodyMed, fontSize: 11.5, color: color.inkSoft },
  linkedTxtActive: { color: color.acc },
})
