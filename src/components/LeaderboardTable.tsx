import { useEffect, useState } from 'react'
import { getLeaderboard } from '../api/leaderboard.api'
import type { LeaderboardEntry } from '../interfaces/leaderboard.interface'

type LeaderboardData = {
  hallOfFame: LeaderboardEntry[]
  wallOfShame: LeaderboardEntry[]
}

export default function Leaderboard() {
  const [data, setData] = useState<LeaderboardData | null>(null)

  useEffect(() => {
    async function load() {
      const res = await getLeaderboard()
      setData(res)
    }

    load()
  }, [])

  if (!data) return <div className="text-gray-400">Loading leaderboard...</div>

  const medals = ['🥇', '🥈', '🥉']

  return (
    <div className="grid md:grid-cols-2 grid-cols-1 gap-6 mt-6">

      {/* Hall of Fame */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
        <h2 className="text-lg font-semibold text-green-400 mb-4">
          🏆 Hall of Fame
        </h2>

        <div className="flex flex-col gap-2">
          {data.hallOfFame.map((u, i) => (
            <div
              key={u.username}
              className="flex justify-between items-center bg-gray-800 rounded-md px-3 py-2"
            >
              <div>
                {medals[i]} {u.username}
              </div>

              <div className="text-right text-sm">
                <div className="text-green-400 font-semibold">
                  Total: ${u.totalPnl.toFixed(2)}
                </div>
                <div className="text-gray-400">
                  Best trade: ${u.bestTrade.toFixed(2)}
                </div>
                <div className="text-gray-500">
                  Worst trade: ${u.worstTrade.toFixed(2)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Wall of Shame */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
        <h2 className="text-lg font-semibold text-red-400 mb-4">
          💀 Wall of Shame
        </h2>

        <div className="flex flex-col gap-2">
          {data.wallOfShame.map((u, i) => (
            <div
              key={u.username}
              className="flex justify-between items-center bg-gray-800 rounded-md px-3 py-2"
            >
              <div>
                {medals[i]} {u.username}
              </div>

              <div className="text-right text-sm">
                <div className="text-red-400 font-semibold">
                  Total: ${u.totalPnl.toFixed(2)}
                </div>
                <div className="text-gray-400">
                  Best trade: ${u.bestTrade.toFixed(2)}
                </div>
                <div className="text-gray-500">
                  Worst trade: ${u.worstTrade.toFixed(2)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}