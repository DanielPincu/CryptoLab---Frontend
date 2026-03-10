import { useEffect, useState } from 'react'
import { getTransactions } from '../api/transactions.api'
import type { ITransaction } from '../interfaces/transaction.interface'

export default function TransactionsTable() {
  const [transactions, setTransactions] = useState<ITransaction[]>([])
  const [cursor, setCursor] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [sideFilter, setSideFilter] = useState<'ALL' | 'BUY' | 'SELL'>('ALL')
  const [pnlSort, setPnlSort] = useState<'ASC' | 'DESC'>('DESC')


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
        <div
          onClick={() =>
            setPnlSort(prev => (prev === 'DESC' ? 'ASC' : 'DESC'))
          }
          className="cursor-pointer select-none hover:text-white"
        >
          PnL {pnlSort === 'ASC' ? '↑' : pnlSort === 'DESC' ? '↓' : ''}
        </div>
        <div>Executed</div>
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
      </div>

      <div className="mt-2 flex flex-col gap-2">
        {transactions
          .filter(t => sideFilter === 'ALL' || t.side === sideFilter)
          .sort((a, b) => {
            const aPnl = (a as { realizedPnl?: number }).realizedPnl ?? 0
            const bPnl = (b as { realizedPnl?: number }).realizedPnl ?? 0

            return pnlSort === 'ASC' ? aPnl - bPnl : bPnl - aPnl
          })
          .map(t => {
            const pnl = (t as { realizedPnl?: number }).realizedPnl
            const pnlPercent = (t as { realizedPnlPercent?: number }).realizedPnlPercent
            return (
            <div
              key={t._id}
              className={`grid md:grid-cols-6 grid-cols-1 items-center rounded-lg border px-3 py-2 text-sm hover:bg-gray-800
${
  typeof pnl === 'number'
    ? pnl >= 0
      ? 'border-green-800 bg-gray-900'
      : 'border-red-800 bg-gray-900'
    : 'border-gray-800 bg-gray-900'
}`}
            >
              <div className="font-semibold">{t.symbol}</div>

              <div
                className={
                  t.side === 'BUY'
                    ? 'font-semibold text-green-400'
                    : 'font-semibold text-red-400'
                }
              >
                {t.side}
              </div>

              <div>{t.qty.toFixed(4)}</div>
              <div>${t.price.toFixed(2)}</div>

              {typeof pnl === 'number' ? (
                <div className={pnl >= 0 ? 'text-green-400 font-semibold' : 'text-red-400 font-semibold'}>
                  ${pnl.toFixed(2)}
                  {typeof pnlPercent === 'number' && (
                    <span className="ml-2 text-xs text-gray-400">
                      ({pnlPercent.toFixed(2)}%)
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