import { get } from './http.api'
import type { LeaderboardResponse } from '../interfaces/leaderboard.interface'

export async function getLeaderboard(): Promise<LeaderboardResponse> {
  return await get('/leaderboard')
}