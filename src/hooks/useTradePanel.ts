import { useState, useEffect } from 'react'
import { executeTrade } from '../api/trade.api'
import type { TradePayload } from '../interfaces/tradePayload.interface'
import { loadPositionsIntoStore } from '../state/storeLoaders'
import { usePositionStore } from '../state/usePositionStore'

type Mode = 'QTY' | 'USD'

export function useTradePanel(
  symbol: string | undefined,
  currentPrice: number | undefined,
  availableCash: number | undefined,
  onSuccess?: () => void
) {
  const [side, setSide] = useState<'BUY' | 'SELL'>('BUY')
  const [mode, setMode] = useState<Mode>('QTY')
  const [value, setValue] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [positionsLoaded, setPositionsLoaded] = useState(false)
  const positions = usePositionStore((state) => state.positions)

  async function loadPositions() {
    try {
      setPositionsLoaded(false)
      await loadPositionsIntoStore()
    } catch {
      usePositionStore.getState().clearPositions()
    } finally {
      setPositionsLoaded(true)
    }
  }

  useEffect(() => {
    loadPositions()
  }, [symbol])

  useEffect(() => {
    if (!error) return
    const timer = setTimeout(() => setError(null), 3000)
    return () => clearTimeout(timer)
  }, [error])

  const pos = positions.find((position) => position.symbol === symbol)
  const qtyOwned = positionsLoaded
    ? (pos ? Number(pos.qty) : 0)
    : (pos ? Number(pos.qty) : 0)

  useEffect(() => {
    if (side === 'SELL' && qtyOwned <= 0) {
      setSide('BUY')
      setValue('')
      setError(null)
    }
  }, [qtyOwned, side])

  async function handleSubmit() {
    if (!symbol) {
      setError('Select a symbol first')
      return
    }

    try {
      setLoading(true)
      setError(null)
      setSuccess(null)

      let payload: TradePayload

      if (side === 'BUY' && value === 'MAX') {
        if (typeof availableCash === 'number' && typeof currentPrice === 'number') {
          const bufferedCash = availableCash * 0.999
          const qty = bufferedCash / currentPrice
          payload = { symbol, side: 'BUY', qty }
        } else {
          payload = { symbol, side: 'BUY', useAllCash: true }
        }
      } else if (side === 'SELL' && value === 'ALL') {
        payload = { symbol, side: 'SELL', sellAll: true }
      } else {
        if (!value) throw new Error('Enter a value')

        const numeric = Number(value)
        if (!Number.isFinite(numeric) || numeric <= 0) {
          throw new Error('Invalid amount')
        }

        if (mode === 'QTY') {
          payload = { symbol, side, qty: numeric }
        } else {
          payload = { symbol, side, amountUSD: numeric }
        }
      }

      await executeTrade(payload)
      await loadPositions()

      setSuccess(`${side} order executed successfully`)
      setValue('')
      onSuccess?.()

      setTimeout(() => setSuccess(null), 3000)
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('Trade failed')
      }
    } finally {
      setLoading(false)
    }
  }

  // ===== Experimental: estimation logic =====

  let estimatedText: string | null = null
  let insufficientCash = false
  let insufficientPosition = false

  const cash = Number(availableCash ?? 0)
  const numeric = Number(value)
  const noSymbol = !symbol

  const hasPrice = typeof currentPrice === 'number'

  if (hasPrice && symbol && value === 'MAX' && side === 'BUY') {
    const bufferedCash = cash * 0.999
    const qty = currentPrice > 0 ? bufferedCash / currentPrice : 0
    estimatedText = `Using ~99.9% balance ($${bufferedCash.toFixed(2)}) → ${qty.toFixed(6)} ${symbol}`
    if (bufferedCash <= 0) insufficientCash = true
  }

  if (hasPrice && symbol && value === 'ALL' && side === 'SELL') {
    const total = qtyOwned * currentPrice
    estimatedText = `Selling ${qtyOwned.toFixed(6)} ${symbol} → $${total.toFixed(2)}`
    if (qtyOwned <= 0) insufficientPosition = true
  }

  if (hasPrice && value && value !== 'MAX' && value !== 'ALL' && Number.isFinite(numeric) && numeric > 0) {
    if (side === 'BUY') {
      if (mode === 'QTY') {
        const total = numeric * currentPrice
        estimatedText = `Estimated total: $${total.toFixed(2)}`
        if (total > cash) insufficientCash = true
      } else {
        const qty = numeric / currentPrice
        estimatedText = `Estimated quantity: ${qty.toFixed(6)} ${symbol ?? ''}`
        if (numeric > cash) insufficientCash = true
      }
    } else {
      if (mode === 'QTY') {
        const total = numeric * currentPrice
        estimatedText = `Estimated total: $${total.toFixed(2)}`
        if (numeric > qtyOwned) insufficientPosition = true
      } else {
        const qty = numeric / currentPrice
        estimatedText = `Estimated quantity: ${qty.toFixed(6)} ${symbol ?? ''}`
        if (qty > qtyOwned) insufficientPosition = true
      }
    }
  }

  return {
    side, setSide,
    mode, setMode,
    value, setValue,
    loading,
    error, setError,
    success,
    handleSubmit,
    estimatedText,
    insufficientCash,
    insufficientPosition,
    qtyOwned,
    noSymbol
  }
}
