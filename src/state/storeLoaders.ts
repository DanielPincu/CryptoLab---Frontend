import { get } from '../api/http.api'
import { apiAccountMe } from '../api/account.api'
import { getPositions } from '../api/positions.api'
import { getPortfolioSummary } from '../api/portfolioSummary.api'
import type { IMarketTick } from '../interfaces/marketTick.interface'
import { useAccountStore } from './useAccountStore'
import { usePositionStore } from './usePositionStore'
import { usePortfolioStore } from './usePortfolioStore'
import { usePriceStore } from './usePriceStore'

export async function loadAccountIntoStore() {
  const account = await apiAccountMe()
  useAccountStore.getState().setAccount(account)
  return account
}

export async function loadPositionsIntoStore() {
  const positions = await getPositions()
  usePositionStore.getState().setPositions(positions)
  return positions
}

export async function loadPortfolioSummaryIntoStore() {
  const summary = await getPortfolioSummary()
  usePortfolioStore.getState().setSummary(summary)
  return summary
}

export async function loadLatestPricesIntoStore() {
  const ticks = ((await get('/market/latest')) ?? []) as IMarketTick[]
  const map = ticks.reduce<Record<string, IMarketTick>>((acc, tick) => {
    acc[tick.symbol] = tick
    return acc
  }, {})

  usePriceStore.getState().setBulkPrices(map)
  return ticks
}
