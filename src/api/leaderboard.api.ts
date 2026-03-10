import { http } from './http.api'
import type { LeaderboardResponse } from '../interfaces/leaderboard.interface'

export async function getLeaderboard(): Promise<LeaderboardResponse> {
  const { data } = await http.get<LeaderboardResponse>('/leaderboard')
  return data
}