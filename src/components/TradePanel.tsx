import { useState, useEffect } from 'react'
import { executeTrade } from '../api/trade.api'
import type { AxiosError } from 'axios'
import type { TradePayload } from '../interfaces/tradePayload.interface'
import type { TradePanelProps } from '../interfaces/tradePanelProps.interface'

type Mode = 'QTY' | 'USD'

export default function TradePanel({
  symbol,
  currentPrice,
  availableCash,
  positionQty,
  onSuccess
}: TradePanelProps) {
  const [side, setSide] = useState<'BUY' | 'SELL'>('BUY')
  const [mode, setMode] = useState<Mode>('QTY')
  const [value, setValue] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    if (!error) return
    const timer = setTimeout(() => setError(null), 3000)
    return () => clearTimeout(timer)
  }, [error])

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

      setSuccess(`${side} order executed successfully`)
      setValue('')
      onSuccess?.()

      setTimeout(() => setSuccess(null), 3000)
    } catch (err: unknown) {
      const axiosErr = err as AxiosError<{ error?: string }>

      if (axiosErr.response?.data?.error) {
        setError(axiosErr.response.data.error)
      } else if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('Trade failed')
      }
    } finally {
      setLoading(false)
    }
  }

  let estimatedText: string | null = null
  let insufficientCash = false
  let insufficientPosition = false

  const cash = Number(availableCash ?? 0)
  const qtyOwned = Number(positionQty ?? 0)
  const numeric = Number(value)

  const hasPrice = typeof currentPrice === 'number'

  // Special quick actions (non-numeric input)
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

  // Regular numeric entry
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
      // SELL
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

  return (
    <div className="p-4 bg-gray-900 rounded-lg text-white">
      <h2 className="text-lg font-semibold mb-4">Trade</h2>

      <div className="mb-4 p-2 rounded bg-gray-800 border border-gray-700 text-sm">
        {symbol ? (
          <span>
            Selected: <span className="font-mono text-emerald-400">{symbol}</span>
          </span>
        ) : (
          <span className="text-gray-400">No symbol selected</span>
        )}
      </div>

      <div className="flex gap-4 mb-4">
        <button
          className={`flex-1 p-2 rounded ${side === 'BUY' ? 'bg-green-600' : 'bg-gray-700'}`}
          onClick={() => {
            setSide('BUY')
            setError(null)
          }}
        >
          Buy
        </button>
        <button
          className={`flex-1 p-2 rounded ${side === 'SELL' ? 'bg-red-600' : 'bg-gray-700'}`}
          onClick={() => {
            setSide('SELL')
            setError(null)
          }}
        >
          Sell
        </button>
      </div>

      <div className="flex gap-4 mb-4">
        <button
          className={`flex-1 p-2 rounded ${mode === 'QTY' ? 'bg-blue-600' : 'bg-gray-700'}`}
          onClick={() => {
            setMode('QTY')
            setValue('')
          }}
        >
          Qty
        </button>
        <button
          className={`flex-1 p-2 rounded ${mode === 'USD' ? 'bg-blue-600' : 'bg-gray-700'}`}
          onClick={() => {
            setMode('USD')
            setValue('')
          }}
        >
          USD
        </button>
      </div>

      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={mode === 'QTY' ? 'Enter quantity' : 'Enter USD amount'}
        className="w-full mb-2 p-2 rounded bg-gray-800"
      />

      <div className="min-h-[44px] mb-1">
        {estimatedText && (
          <div className="text-sm text-gray-400">{estimatedText}</div>
        )}
      </div>

      <div className="min-h-[40px] mb-3">
        {insufficientCash && (
          <div className="text-sm text-red-400">
            You do not have enough available cash for this order
          </div>
        )}
        {insufficientPosition && (
          <div className="text-sm text-red-400">
            You do not have enough position to execute this sell order
          </div>
        )}
      </div>

      <div className="flex justify-end mb-2 text-sm">
        {side === 'BUY' && (
          <span
            onClick={() => setValue('MAX')}
            className="text-yellow-400 hover:text-yellow-300 cursor-pointer"
          >
            Use max buying power
          </span>
        )}
        {side === 'SELL' && (
          <span
            onClick={() => setValue('ALL')}
            className="text-yellow-400 hover:text-yellow-300 cursor-pointer"
          >
            Sell entire position
          </span>
        )}
      </div>

      <div className="min-h-[48px] mb-2">
        {error && <div className="text-red-400 text-sm">{error}</div>}
        {success && <div className="text-green-400 text-sm">{success}</div>}
      </div>

      <button
        onClick={handleSubmit}
        disabled={loading || insufficientCash || insufficientPosition}
        className={`w-full p-2 rounded ${
          side === 'BUY' ? 'bg-green-700' : 'bg-red-700'
        }`}
      >
        {loading ? 'Processing...' : side}
      </button>
    </div>
  )
}