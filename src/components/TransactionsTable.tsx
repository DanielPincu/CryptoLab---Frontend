import { useEffect, useState } from 'react'
import { getTransactions } from '../api/transactions.api'
import type { ITransaction } from '../interfaces/transaction.interface'
import { usePrecisionStore } from '../state/usePrecisionStore'
import { fixed8, money8, percent8 } from '../utils/numberFormat'

type SortField = 'PNL' | 'EXECUTED'
type SortDirection = 'ASC' | 'DESC'

function SortHeader({
  label,
  field,
  activeField,
  direction,
  onToggle,
  onSort
}: {
  label: string
  field: SortField
  activeField: SortField
  direction: SortDirection
  onToggle: (field: SortField) => void
  onSort: (field: SortField, direction: SortDirection) => void
}) {
  const isActive = activeField === field

  return (
    <div className="flex items-center gap-1">
      <button
        type="button"
        onClick={() => onToggle(field)}
        className="cursor-pointer select-none uppercase tracking-wider hover:text-white"
      >
        {label}
      </button>

      <div className="flex items-center gap-0.5">
        <button
          type="button"
          onClick={() => onSort(field, 'ASC')}
          className={
            'rounded px-1 text-[11px] leading-none transition hover:bg-gray-800 hover:text-white ' +
            (isActive && direction === 'ASC' ? 'bg-gray-700 text-white' : 'text-gray-500')
          }
          aria-label={`Sort ${label} ascending`}
        >
          ↑
        </button>
        <button
          type="button"
          onClick={() => onSort(field, 'DESC')}
          className={
            'rounded px-1 text-[11px] leading-none transition hover:bg-gray-800 hover:text-white ' +
            (isActive && direction === 'DESC' ? 'bg-gray-700 text-white' : 'text-gray-500')
          }
          aria-label={`Sort ${label} descending`}
        >
          ↓
        </button>
      </div>
    </div>
  )
}

export default function TransactionsTable() {
  const [transactions, setTransactions] = useState<ITransaction[]>([])
  const [cursor, setCursor] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [sideFilter, setSideFilter] = useState<'ALL' | 'BUY' | 'SELL' | 'REWARD'>('ALL')
  const [sortField, setSortField] = useState<SortField>('EXECUTED')
  const [sortDirection, setSortDirection] = useState<SortDirection>('DESC')
  const precision = usePrecisionStore((state) => state.precision)

  function toggleSort(field: SortField) {
    if (sortField === field) {
      setSortDirection(prev => (prev === 'DESC' ? 'ASC' : 'DESC'))
      return
    }

    setSortField(field)
    setSortDirection('DESC')
  }

  function sortBy(field: SortField, direction: SortDirection) {
    setSortField(field)
    setSortDirection(direction)
  }

  async function loadMore() {
    if (!cursor) return

    setLoading(true)
    const res = await getTransactions(cursor)
    setTransactions(prev => [...prev, ...res.items])
    setCursor(res.nextCursor)
    setLoading(false)
  }

  useEffect(() => {
    let mounted = true

    async function init() {
      setLoading(true)
      const res = await getTransactions()

      if (!mounted) return

      setTransactions(res.items)
      setCursor(res.nextCursor)
      setLoading(false)
    }

    init()

    return () => {
      mounted = false
    }
  }, [])

  return (
    <div className="p-4 text-gray-200">
      <h2 className="mb-4 text-lg font-semibold">Trade History</h2>

      <div className="hidden md:grid md:grid-cols-6 grid-cols-1 border-b border-gray-700 pb-2 text-xs uppercase tracking-wider text-gray-400">
        <div>Symbol</div>
        <div>Side</div>
        <div>Qty</div>
        <div>Price</div>
        <SortHeader
          label="PnL"
          field="PNL"
          activeField={sortField}
          direction={sortDirection}
          onToggle={toggleSort}
          onSort={sortBy}
        />
        <SortHeader
          label="Executed"
          field="EXECUTED"
          activeField={sortField}
          direction={sortDirection}
          onToggle={toggleSort}
          onSort={sortBy}
        />
      </div>

      <div className="mt-3 mb-2 flex gap-2 text-sm">
        <button
          onClick={() => setSideFilter('ALL')}
          className={sideFilter === 'ALL'
            ? 'px-3 py-1 rounded bg-gray-700 text-white'
            : 'px-3 py-1 rounded bg-gray-900 text-gray-400 hover:bg-gray-800'}
        >
          All
        </button>

        <button
          onClick={() => setSideFilter('BUY')}
          className={sideFilter === 'BUY'
            ? 'px-3 py-1 rounded bg-green-700 text-white'
            : 'px-3 py-1 rounded bg-gray-900 text-gray-400 hover:bg-gray-800'}
        >
          Buy
        </button>

        <button
          onClick={() => setSideFilter('SELL')}
          className={sideFilter === 'SELL'
            ? 'px-3 py-1 rounded bg-red-700 text-white'
            : 'px-3 py-1 rounded bg-gray-900 text-gray-400 hover:bg-gray-800'}
        >
          Sell
        </button>

        <button
          onClick={() => setSideFilter('REWARD')}
          className={sideFilter === 'REWARD'
            ? 'px-3 py-1 rounded bg-green-700 text-white'
            : 'px-3 py-1 rounded bg-gray-900 text-gray-400 hover:bg-gray-800'}
        >
          Rewards
        </button>
      </div>

      <div className="mt-2 flex flex-col gap-2">
        {transactions
          .filter(t => sideFilter === 'ALL' || t.side === sideFilter)
          .sort((a, b) => {
            if (sortField === 'EXECUTED') {
              const aExecuted = new Date(a.executedAt).getTime()
              const bExecuted = new Date(b.executedAt).getTime()

              return sortDirection === 'ASC'
                ? aExecuted - bExecuted
                : bExecuted - aExecuted
            }

            const aPnl = (a as { realizedPnl?: number }).realizedPnl ?? 0
            const bPnl = (b as { realizedPnl?: number }).realizedPnl ?? 0

            return sortDirection === 'ASC' ? aPnl - bPnl : bPnl - aPnl
          })
          .map(t => {
            const pnl = (t as { realizedPnl?: number }).realizedPnl
            const pnlPercent = (t as { realizedPnlPercent?: number }).realizedPnlPercent
            return (
            <div
              key={t._id}
              className={`grid md:grid-cols-6 grid-cols-1 items-center rounded-lg border px-3 py-2 text-sm hover:bg-gray-800
${
  t.side === 'REWARD'
    ? 'border-green-800 bg-black'
    : typeof pnl === 'number'
    ? pnl >= 0
      ? 'border-green-800 bg-black'
      : 'border-red-800 bg-black'
    : 'border-gray-800 bg-black'
}`}
            >
              <div className="font-semibold">{t.symbol}</div>

              <div
                className={
                  t.side === 'BUY'
                    ? 'font-semibold text-green-400'
                    : t.side === 'SELL'
                    ? 'font-semibold text-red-400'
                    : 'font-semibold text-green-400'
                }
              >
                {t.side}
              </div>

              <div>{fixed8(t.qty, precision)}</div>
              <div>{money8(t.price, precision)}</div>

              {typeof pnl === 'number' ? (
                <div className={pnl >= 0 ? 'text-green-400 font-semibold' : 'text-red-400 font-semibold'}>
                  {money8(pnl, precision)}
                  {typeof pnlPercent === 'number' && (
                    <span className="ml-2 text-xs text-gray-400">
                      ({percent8(pnlPercent, precision)})
                    </span>
                  )}
                </div>
              ) : (
                <div className="text-gray-500">-</div>
              )}

              <div className="text-gray-400">
                {new Date(t.executedAt).toLocaleString()}
              </div>
            </div>
          )
        })}
      </div>

      {cursor && (
        <div className="mt-4 flex justify-center">
          <button
            onClick={loadMore}
            disabled={loading}
            className="rounded-md bg-gray-800 px-4 py-2 text-sm text-gray-200 hover:bg-gray-700 disabled:opacity-50"
          >
            {loading ? 'Loading...' : 'Load more'}
          </button>
        </div>
      )}
    </div>
  )
}
