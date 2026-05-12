import { useTradePanel } from '../hooks/useTradePanel'
import type { TradePanelProps } from '../interfaces/tradePanelProps.interface'
import { useAccountStore } from '../state/useAccountStore'
import { usePrecisionStore } from '../state/usePrecisionStore'
import { money8 } from '../utils/numberFormat'

export default function TradePanel({
  symbol,
  currentPrice,
  onSuccess
}: TradePanelProps) {
  const availableCash = useAccountStore((state) => state.account?.cashBalance ?? 0)
  const precision = usePrecisionStore((state) => state.precision)

  const {
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
  } = useTradePanel(symbol, currentPrice, availableCash, onSuccess)

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
          {money8(Number(availableCash ?? 0), precision)}
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
          data-testid="toggle-buy"
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
          data-testid="toggle-sell"
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
          data-testid="mode-qty"
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
          data-testid="mode-usd"
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
        data-testid="trade-input"
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
        {success && <div data-testid="trade-success" className="text-green-400 text-sm">{success}</div>}
      </div>

      <button
        onClick={handleSubmit}
        data-testid="trade-submit"
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
