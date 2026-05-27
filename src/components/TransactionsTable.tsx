import { useEffect, useMemo, useState } from 'react'
import {
  downloadTransactionReport,
  getTransactionReport,
  type TransactionReportQuery
} from '../api/transactions.api'
import type {
  ITransaction,
  TransactionAuditReport,
  TransactionGroupBy,
  TransactionSide
} from '../interfaces/transaction.interface'
import { type DisplayPrecision, usePrecisionStore } from '../state/usePrecisionStore'
import { fixed8, money8, percent8 } from '../utils/numberFormat'

type SortField = 'PNL' | 'EXECUTED'
type SortDirection = 'ASC' | 'DESC'
type SideFilter = 'ALL' | TransactionSide
type PeriodMode = 'month' | 'year' | 'custom' | 'all'

const monthOptions = [
  ['1', 'Jan'],
  ['2', 'Feb'],
  ['3', 'Mar'],
  ['4', 'Apr'],
  ['5', 'May'],
  ['6', 'Jun'],
  ['7', 'Jul'],
  ['8', 'Aug'],
  ['9', 'Sep'],
  ['10', 'Oct'],
  ['11', 'Nov'],
  ['12', 'Dec']
]

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

function addDay(dateValue: string) {
  const date = new Date(`${dateValue}T00:00:00.000Z`)
  date.setUTCDate(date.getUTCDate() + 1)
  return date.toISOString()
}

function toStartOfDay(dateValue: string) {
  return new Date(`${dateValue}T00:00:00.000Z`).toISOString()
}

function currentDateParts() {
  const now = new Date()
  return {
    year: now.getFullYear(),
    month: now.getMonth() + 1,
    date: now.toISOString().slice(0, 10)
  }
}

function Stat({
  label,
  value,
  tone
}: {
  label: string
  value: string
  tone?: 'positive' | 'negative' | 'neutral'
}) {
  const color =
    tone === 'positive'
      ? 'text-green-400'
      : tone === 'negative'
        ? 'text-red-400'
        : 'text-slate-100'

  return (
    <div className="rounded-lg border border-gray-800 bg-black p-3">
      <div className="text-xs uppercase tracking-wider text-gray-500">{label}</div>
      <div className={`mt-1 text-lg font-semibold ${color}`}>{value}</div>
    </div>
  )
}

function sideButtonClass(active: boolean, side: SideFilter) {
  if (!active) return 'rounded bg-gray-900 px-3 py-1 text-gray-400 hover:bg-gray-800'
  if (side === 'BUY' || side === 'REWARD') return 'rounded bg-green-700 px-3 py-1 text-white'
  if (side === 'SELL') return 'rounded bg-red-700 px-3 py-1 text-white'
  return 'rounded bg-gray-700 px-3 py-1 text-white'
}

export default function TransactionsTable() {
  const now = currentDateParts()
  const [report, setReport] = useState<TransactionAuditReport | null>(null)
  const [loading, setLoading] = useState(false)
  const [downloading, setDownloading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sideFilter, setSideFilter] = useState<SideFilter>('ALL')
  const [symbolFilter, setSymbolFilter] = useState('')
  const [periodMode, setPeriodMode] = useState<PeriodMode>('month')
  const [year, setYear] = useState(now.year)
  const [month, setMonth] = useState(now.month)
  const [customFrom, setCustomFrom] = useState(`${now.year}-01-01`)
  const [customTo, setCustomTo] = useState(now.date)
  const [groupBy, setGroupBy] = useState<TransactionGroupBy>('month')
  const [sortField, setSortField] = useState<SortField>('EXECUTED')
  const [sortDirection, setSortDirection] = useState<SortDirection>('DESC')
  const precision = usePrecisionStore((state) => state.precision)

  const query = useMemo<TransactionReportQuery>(() => {
    const next: TransactionReportQuery = { groupBy }
    const symbol = symbolFilter.trim().toUpperCase()

    if (symbol) next.symbol = symbol
    if (sideFilter !== 'ALL') next.side = sideFilter

    if (periodMode === 'month') {
      next.year = year
      next.month = month
    } else if (periodMode === 'year') {
      next.year = year
    } else if (periodMode === 'custom') {
      if (customFrom) next.from = toStartOfDay(customFrom)
      if (customTo) next.to = addDay(customTo)
    }

    return next
  }, [customFrom, customTo, groupBy, month, periodMode, sideFilter, symbolFilter, year])

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

  async function downloadCsv() {
    try {
      setDownloading(true)
      setError(null)
      await downloadTransactionReport(query)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to download report')
    } finally {
      setDownloading(false)
    }
  }

  useEffect(() => {
    let mounted = true

    async function loadReport() {
      try {
        setLoading(true)
        setError(null)
        const res = await getTransactionReport(query)
        if (mounted) setReport(res)
      } catch (err) {
        if (mounted) setError(err instanceof Error ? err.message : 'Failed to load report')
      } finally {
        if (mounted) setLoading(false)
      }
    }

    loadReport()

    return () => {
      mounted = false
    }
  }, [query])

  const rows = useMemo(() => {
    return [...(report?.items ?? [])].sort((a, b) => {
      if (sortField === 'EXECUTED') {
        const aExecuted = new Date(a.executedAt).getTime()
        const bExecuted = new Date(b.executedAt).getTime()

        return sortDirection === 'ASC'
          ? aExecuted - bExecuted
          : bExecuted - aExecuted
      }

      const aPnl = a.realizedPnl ?? 0
      const bPnl = b.realizedPnl ?? 0

      return sortDirection === 'ASC' ? aPnl - bPnl : bPnl - aPnl
    })
  }, [report?.items, sortDirection, sortField])

  const totals = report?.totals
  const pnlTone = totals && totals.realizedPnl >= 0 ? 'positive' : 'negative'
  const cashFlowTone = totals && totals.netCashFlow >= 0 ? 'positive' : 'negative'

  return (
    <div className="p-4 text-gray-200">
      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-100">Transaction Audit</h2>
          {report && (
            <div className="mt-1 text-xs text-gray-500">
              Generated {new Date(report.generatedAt).toLocaleString()}
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={downloadCsv}
          disabled={downloading || loading}
          className="rounded-md bg-slate-100 px-4 py-2 text-sm font-semibold text-black hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          {downloading ? 'Downloading...' : 'Download CSV'}
        </button>
      </div>

      <div className="mb-4 grid gap-3 rounded-lg border border-gray-800 bg-black p-3 md:grid-cols-6">
        <label className="text-sm text-gray-400">
          <span className="mb-1 block text-xs uppercase tracking-wider text-gray-500">Period</span>
          <select
            value={periodMode}
            onChange={event => setPeriodMode(event.target.value as PeriodMode)}
            className="w-full rounded border border-gray-700 bg-gray-950 px-3 py-2 text-slate-100 outline-none focus:border-slate-400"
          >
            <option value="month">Month</option>
            <option value="year">Year</option>
            <option value="custom">Custom</option>
            <option value="all">All time</option>
          </select>
        </label>

        {(periodMode === 'month' || periodMode === 'year') && (
          <label className="text-sm text-gray-400">
            <span className="mb-1 block text-xs uppercase tracking-wider text-gray-500">Year</span>
            <input
              type="number"
              value={year}
              min="1970"
              max="9999"
              onChange={event => setYear(Number(event.target.value))}
              className="w-full rounded border border-gray-700 bg-gray-950 px-3 py-2 text-slate-100 outline-none focus:border-slate-400"
            />
          </label>
        )}

        {periodMode === 'month' && (
          <label className="text-sm text-gray-400">
            <span className="mb-1 block text-xs uppercase tracking-wider text-gray-500">Month</span>
            <select
              value={month}
              onChange={event => setMonth(Number(event.target.value))}
              className="w-full rounded border border-gray-700 bg-gray-950 px-3 py-2 text-slate-100 outline-none focus:border-slate-400"
            >
              {monthOptions.map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </label>
        )}

        {periodMode === 'custom' && (
          <>
            <label className="text-sm text-gray-400">
              <span className="mb-1 block text-xs uppercase tracking-wider text-gray-500">From</span>
              <input
                type="date"
                value={customFrom}
                onChange={event => setCustomFrom(event.target.value)}
                className="w-full rounded border border-gray-700 bg-gray-950 px-3 py-2 text-slate-100 outline-none focus:border-slate-400"
              />
            </label>
            <label className="text-sm text-gray-400">
              <span className="mb-1 block text-xs uppercase tracking-wider text-gray-500">To</span>
              <input
                type="date"
                value={customTo}
                onChange={event => setCustomTo(event.target.value)}
                className="w-full rounded border border-gray-700 bg-gray-950 px-3 py-2 text-slate-100 outline-none focus:border-slate-400"
              />
            </label>
          </>
        )}

        <label className="text-sm text-gray-400">
          <span className="mb-1 block text-xs uppercase tracking-wider text-gray-500">Group</span>
          <select
            value={groupBy}
            onChange={event => setGroupBy(event.target.value as TransactionGroupBy)}
            className="w-full rounded border border-gray-700 bg-gray-950 px-3 py-2 text-slate-100 outline-none focus:border-slate-400"
          >
            <option value="month">Monthly</option>
            <option value="year">Yearly</option>
          </select>
        </label>

        <label className="text-sm text-gray-400">
          <span className="mb-1 block text-xs uppercase tracking-wider text-gray-500">Symbol</span>
          <input
            value={symbolFilter}
            onChange={event => setSymbolFilter(event.target.value)}
            placeholder="BTCUSDT"
            className="w-full rounded border border-gray-700 bg-gray-950 px-3 py-2 uppercase text-slate-100 outline-none placeholder:text-gray-600 focus:border-slate-400"
          />
        </label>
      </div>

      <div className="mb-4 flex flex-wrap gap-2 text-sm">
        {(['ALL', 'BUY', 'SELL', 'REWARD'] as SideFilter[]).map(side => (
          <button
            key={side}
            type="button"
            onClick={() => setSideFilter(side)}
            className={sideButtonClass(sideFilter === side, side)}
          >
            {side === 'ALL' ? 'All' : side === 'REWARD' ? 'Rewards' : side}
          </button>
        ))}
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-900 bg-red-950/50 px-3 py-2 text-sm text-red-200">
          {error}
        </div>
      )}

      <div className="mb-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Realized PnL" value={money8(totals?.realizedPnl ?? 0, precision)} tone={pnlTone} />
        <Stat label="Net Cash Flow" value={money8(totals?.netCashFlow ?? 0, precision)} tone={cashFlowTone} />
        <Stat label="Trade Count" value={String(totals?.transactionCount ?? 0)} />
        <Stat label="Win Rate" value={totals?.winRate == null ? '-' : percent8(totals.winRate, precision)} />
        <Stat label="Buy Volume" value={money8(totals?.buyVolume ?? 0, precision)} />
        <Stat label="Sell Volume" value={money8(totals?.sellVolume ?? 0, precision)} />
        <Stat label="Rewards" value={money8(totals?.rewardAmount ?? 0, precision)} tone="positive" />
        <Stat label="Closed Trades" value={String((totals?.winningTrades ?? 0) + (totals?.losingTrades ?? 0) + (totals?.flatTrades ?? 0))} />
      </div>

      <div className="mb-5 grid gap-4 lg:grid-cols-2">
        <div className="rounded-lg border border-gray-800 bg-black p-3">
          <div className="mb-3 text-sm font-semibold text-slate-100">Periods</div>
          <div className="space-y-2">
            {(report?.periods ?? []).slice(0, 12).map(period => (
              <div key={period.period} className="grid grid-cols-4 gap-2 border-b border-gray-900 pb-2 text-sm last:border-0 last:pb-0">
                <div className="font-semibold text-slate-200">{period.period}</div>
                <div className="text-gray-400">{period.transactionCount} tx</div>
                <div className={period.realizedPnl >= 0 ? 'font-semibold text-green-400' : 'font-semibold text-red-400'}>
                  {money8(period.realizedPnl, precision)}
                </div>
                <div className="text-right text-gray-400">{period.winRate == null ? '-' : percent8(period.winRate, precision)}</div>
              </div>
            ))}
            {!loading && report?.periods.length === 0 && <div className="text-sm text-gray-500">No periods</div>}
          </div>
        </div>

        <div className="rounded-lg border border-gray-800 bg-black p-3">
          <div className="mb-3 text-sm font-semibold text-slate-100">Symbols</div>
          <div className="space-y-2">
            {(report?.symbols ?? []).slice(0, 12).map(symbol => (
              <div key={symbol.symbol} className="grid grid-cols-4 gap-2 border-b border-gray-900 pb-2 text-sm last:border-0 last:pb-0">
                <div className="font-semibold text-slate-200">{symbol.symbol}</div>
                <div className="text-gray-400">{symbol.transactionCount} tx</div>
                <div className={symbol.realizedPnl >= 0 ? 'font-semibold text-green-400' : 'font-semibold text-red-400'}>
                  {money8(symbol.realizedPnl, precision)}
                </div>
                <div className="text-right text-gray-400">{money8(symbol.netCashFlow, precision)}</div>
              </div>
            ))}
            {!loading && report?.symbols.length === 0 && <div className="text-sm text-gray-500">No symbols</div>}
          </div>
        </div>
      </div>

      <div className="hidden grid-cols-7 border-b border-gray-700 pb-2 text-xs uppercase tracking-wider text-gray-400 md:grid">
        <div>Symbol</div>
        <div>Side</div>
        <div>Qty</div>
        <div>Price</div>
        <div>Amount</div>
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

      <div className="mt-2 flex flex-col gap-2">
        {rows.map(t => (
          <TransactionRow key={t._id} transaction={t} precision={precision} />
        ))}
      </div>

      {loading && (
        <div className="mt-4 rounded-lg border border-gray-800 bg-black px-3 py-4 text-center text-sm text-gray-400">
          Loading report...
        </div>
      )}

      {!loading && rows.length === 0 && (
        <div className="mt-4 rounded-lg border border-gray-800 bg-black px-3 py-4 text-center text-sm text-gray-500">
          No transactions found
        </div>
      )}
    </div>
  )
}

function TransactionRow({
  transaction: t,
  precision
}: {
  transaction: ITransaction
  precision: DisplayPrecision
}) {
  const pnl = t.realizedPnl
  const pnlPercent = t.realizedPnlPercent
  const amount = t.amountUSD ?? t.price * t.qty

  return (
    <div
      className={`grid grid-cols-1 items-center rounded-lg border px-3 py-2 text-sm hover:bg-gray-800 md:grid-cols-7 ${
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
      <div>{money8(amount, precision)}</div>

      {typeof pnl === 'number' ? (
        <div className={pnl >= 0 ? 'font-semibold text-green-400' : 'font-semibold text-red-400'}>
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
}
