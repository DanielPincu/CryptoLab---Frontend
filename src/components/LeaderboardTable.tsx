import { useEffect, useState } from 'react'
import { getLeaderboard } from '../api/leaderboard.api'
import type {
  LeaderboardEntry,
  LeaderboardPosition,
  LeaderboardResponse,
  LeaderboardTrade,
} from '../interfaces/leaderboard.interface'

function money(value: number) {
  return `$${value.toFixed(2)}`
}

function quantity(value: number) {
  return value.toLocaleString(undefined, {
    maximumFractionDigits: 8,
  })
}

function dateTime(value: string) {
  return new Date(value).toLocaleString()
}

function TradeSummary({
  label,
  trade,
  fallback,
  positive,
}: {
  label: string
  trade?: LeaderboardTrade
  fallback: number
  positive: boolean
}) {
  const pnl = trade?.realizedPnl ?? fallback

  return (
    <div className="rounded-md border border-gray-700 bg-gray-950 px-3 py-2">
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs uppercase tracking-wider text-gray-500">{label}</span>
        <span className={positive ? 'text-sm font-semibold text-green-400' : 'text-sm font-semibold text-red-400'}>
          {money(pnl)}
        </span>
      </div>

      {trade && (
        <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs text-gray-400">
          <span className="font-semibold text-gray-300">{trade.symbol}</span>
          <span>{quantity(trade.qty)} @ {money(trade.price)}</span>
          <span>{dateTime(trade.executedAt)}</span>
        </div>
      )}
    </div>
  )
}

function PositionsList({ positions }: { positions: LeaderboardPosition[] }) {
  if (positions.length === 0) {
    return <div className="text-xs text-gray-500">No open positions</div>
  }

  return (
    <div className="space-y-2">
      {positions.map(position => (
        <div
          key={position.symbol}
          className="grid grid-cols-[1fr_auto] gap-3 rounded-md bg-gray-950 px-3 py-2 text-xs"
        >
          <div>
            <div className="font-semibold text-gray-200">{position.symbol}</div>
            <div className="text-gray-500">Qty {quantity(position.qty)}</div>
          </div>
          <div className="text-right text-gray-400">
            <div>Avg {money(position.avgEntryPrice)}</div>
            <div className="text-gray-600">{dateTime(position.updatedAt)}</div>
          </div>
        </div>
      ))}
    </div>
  )
}

function SuccessfulTradesList({ trades }: { trades: LeaderboardTrade[] }) {
  if (trades.length === 0) {
    return <div className="text-xs text-gray-500">No profitable closed trades yet</div>
  }

  return (
    <div className="space-y-2">
      {trades.map((trade, index) => (
        <div
          key={`${trade.symbol}-${trade.executedAt}-${index}`}
          className="grid grid-cols-[1fr_auto] gap-3 rounded-md bg-gray-950 px-3 py-2 text-xs"
        >
          <div>
            <div className="font-semibold text-gray-200">{trade.symbol}</div>
            <div className="text-gray-500">{quantity(trade.qty)} @ {money(trade.price)}</div>
          </div>
          <div className="text-right">
            <div className="font-semibold text-green-400">{money(trade.realizedPnl)}</div>
            <div className="text-gray-600">{dateTime(trade.executedAt)}</div>
          </div>
        </div>
      ))}
    </div>
  )
}

function LeaderboardCard({
  entry,
  rank,
  totalClassName,
}: {
  entry: LeaderboardEntry
  rank: string
  totalClassName: string
}) {
  return (
    <div className="rounded-lg border border-gray-800 bg-gray-800/80 p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-base font-semibold text-gray-100">
            {rank} {entry.username}
          </div>
          <div className="mt-1 text-xs text-gray-500">
            {entry.openPositions.length} open positions
          </div>
        </div>

        <div className="text-right">
          <div className={`text-lg font-bold ${totalClassName}`}>
            {money(entry.totalPnl)}
          </div>
          <div className="text-xs uppercase tracking-wider text-gray-500">Total PnL</div>
        </div>
      </div>

      <div className="mt-4 grid gap-2">
        <TradeSummary
          label="Best trade"
          trade={entry.bestTradeDetails}
          fallback={entry.bestTrade}
          positive
        />
        <TradeSummary
          label="Worst trade"
          trade={entry.worstTradeDetails}
          fallback={entry.worstTrade}
          positive={false}
        />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <div>
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
            Open positions
          </h3>
          <PositionsList positions={entry.openPositions} />
        </div>

        <div>
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
            Top winning trades
          </h3>
          <SuccessfulTradesList trades={entry.mostSuccessfulTransactions} />
        </div>
      </div>
    </div>
  )
}

function LeaderboardSection({
  title,
  entries,
  titleClassName,
  totalClassName,
}: {
  title: string
  entries: LeaderboardEntry[]
  titleClassName: string
  totalClassName: string
}) {
  const medals = ['🥇', '🥈', '🥉']

  return (
    <section className="rounded-xl border border-gray-800 bg-gray-900 p-4">
      <h2 className={`mb-4 text-lg font-semibold ${titleClassName}`}>
        {title}
      </h2>

      <div className="flex flex-col gap-3">
        {entries.length === 0 ? (
          <div className="rounded-lg border border-gray-800 bg-gray-950 px-3 py-4 text-sm text-gray-500">
            No traders here yet
          </div>
        ) : (
          entries.map((entry, index) => (
            <LeaderboardCard
              key={entry.username}
              entry={entry}
              rank={medals[index] ?? `#${index + 1}`}
              totalClassName={totalClassName}
            />
          ))
        )}
      </div>
    </section>
  )
}

export default function Leaderboard() {
  const [data, setData] = useState<LeaderboardResponse | null>(null)

  useEffect(() => {
    async function load() {
      const res = await getLeaderboard()
      setData(res)
    }

    load()
  }, [])

  if (!data) return <div className="text-gray-400">Loading leaderboard...</div>

  return (
    <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-2">
      <LeaderboardSection
        title="🏆 Hall of Fame"
        entries={data.hallOfFame}
        titleClassName="text-green-400"
        totalClassName="text-green-400"
      />

      <LeaderboardSection
        title="💀 Wall of Shame"
        entries={data.wallOfShame}
        titleClassName="text-red-400"
        totalClassName="text-red-400"
      />
    </div>
  )
}
