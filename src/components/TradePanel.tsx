import { useState, useEffect } from 'react'
import { executeTrade } from '../api/trade.api'
import { getPositions } from '../api/positions.api'
import type { AxiosError } from 'axios'
import type { TradePayload } from '../interfaces/tradePayload.interface'
import type { TradePanelProps } from '../interfaces/tradePanelProps.interface'
import type { Position } from '../interfaces/position.interface'

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

  const [positions, setPositions] = useState<Position[]>([])

  async function loadPositions() {
    try {
      const data = await getPositions()
      setPositions(data)
    } catch {
      setPositions([])
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

      // refresh positions so SELL toggle updates immediately
      await loadPositions()

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
  const pos = positions.find(p => p.symbol === symbol)
  const qtyOwned = pos ? Number(pos.qty) : Number(positionQty ?? 0)
  const numeric = Number(value)
  const noSymbol = !symbol

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
      <h1 className="text-xl font-semibold mb-4">Trade</h1>

      <div className="mb-4 p-2 rounded bg-gray-800 border border-gray-700 text-sm">
        {symbol ? (
          <span>
            Selected: <span className="font-mono text-emerald-400">{symbol}</span>
          </span>
        ) : (
          <span className="text-gray-400">No symbol selected</span>
        )}
      </div>

      <div className="mb-4 p-2 rounded bg-gray-800 border border-gray-700 text-sm flex justify-between">
        <span className="text-gray-400">Buying Power</span>
        <span className="font-mono text-emerald-400">
          ${Number(availableCash ?? 0).toFixed(2)}
        </span>
      </div>

      <div className="relative flex mb-4 bg-gray-850/80 rounded-lg p-0.5 border border-gray-700 shadow-inner overflow-hidden select-none">
        <div
          className={`absolute top-0.5 bottom-0.5 left-0.5 w-1/2 rounded-md shadow
    transform transition-transform duration-300 ease-out
    ${side === 'BUY' ? 'translate-x-0 bg-green-600' : 'translate-x-full bg-red-600'}
    ${noSymbol ? 'opacity-50' : ''}`}
        />
        <button
          disabled={noSymbol}
          className={`relative flex-1 py-1 text-xs tracking-wide rounded-md transition-all duration-200 font-semibold z-10 flex items-center justify-center
  ${side === 'BUY' ? 'text-white scale-150' : 'text-gray-400'}
  ${noSymbol ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          onClick={() => {
            if (noSymbol) return
            setSide('BUY')
            setError(null)
          }}
        >
          BUY
        </button>

        <button
          disabled={noSymbol || qtyOwned <= 0}
          className={`relative flex-1 py-1 text-xs tracking-wide rounded-md transition-all duration-200 font-semibold z-10 flex items-center justify-center
  ${side === 'SELL' ? 'text-white scale-150' : 'text-gray-400'}
  ${(qtyOwned <= 0 || noSymbol) ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          onClick={() => {
            if (noSymbol || qtyOwned <= 0) return
            setSide('SELL')
            setError(null)
          }}
        >
          SELL
        </button>
      </div>

      <div className="flex gap-4 mb-4">
        <button
          disabled={noSymbol}
          className={`flex-1 p-2 rounded ${mode === 'QTY' ? 'bg-blue-600' : 'bg-gray-700'} ${noSymbol ? 'opacity-50 cursor-not-allowed' : ''}`}
          onClick={() => {
            if (noSymbol) return
            setMode('QTY')
            setValue('')
          }}
        >
          Qty
        </button>
        <button
          disabled={noSymbol}
          className={`flex-1 p-2 rounded ${mode === 'USD' ? 'bg-blue-600' : 'bg-gray-700'} ${noSymbol ? 'opacity-50 cursor-not-allowed' : ''}`}
          onClick={() => {
            if (noSymbol) return
            setMode('USD')
            setValue('')
          }}
        >
          USD
        </button>
      </div>

      <input
        type="text"
        inputMode="decimal"
        value={value}
        onChange={(e) => {
          const raw = e.target.value
          // allow digits and one decimal point only
          if (/^\d*\.?\d*$/.test(raw)) {
            setValue(raw)
          }
        }}
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
            onClick={() => {
              if (noSymbol) return
              setValue('MAX')
            }}
            className={`text-yellow-400 hover:text-yellow-300 ${noSymbol ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          >
            Use max buying power
          </span>
        )}
        {side === 'SELL' && (
          <span
            onClick={() => {
              if (noSymbol || qtyOwned <= 0) return
              setValue('ALL')
            }}
            className={`text-yellow-400 hover:text-yellow-300 ${(noSymbol || qtyOwned <= 0) ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
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
        disabled={
          noSymbol ||
          loading ||
          insufficientCash ||
          insufficientPosition ||
          (side === 'SELL' && qtyOwned <= 0)
        }
        className={`w-full p-2 rounded ${
          side === 'BUY' ? 'bg-green-700' : 'bg-red-700'
        } ${(side === 'SELL' && qtyOwned <= 0) || noSymbol
            ? 'opacity-50 cursor-not-allowed'
            : ''}`}
      >
        {loading ? 'Processing...' : side}
      </button>
    </div>
  )
}