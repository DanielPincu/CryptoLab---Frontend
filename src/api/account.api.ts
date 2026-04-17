import { get, patch } from './http.api'
import type { IAccount } from '../interfaces/account.interface'

export async function apiAccountMe(): Promise<IAccount> {
  return await get('/account/me')
}

export async function apiAccountUpdate(
  payload: Partial<IAccount>
): Promise<IAccount> {
  return await patch('/account/me', payload)
}

// Add symbol to favorites
export async function apiAccountAddFavorite(symbol: string): Promise<{ favorites: string[] }> {
  return await patch('/account/favorites', { add: symbol })
}

// Remove symbol from favorites
export async function apiAccountRemoveFavorite(symbol: string): Promise<{ favorites: string[] }> {
  return await patch('/account/favorites', { remove: symbol })
}

// Reset favorites to default list
export async function apiAccountResetFavorites(): Promise<{ favorites: string[] }> {
  const defaultFavorites = [
    'BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'SOLUSDT', 'ADAUSDT', 'XRPUSDT', 'DOGEUSDT',
  'AVAXUSDT','DOTUSDT', 'LINKUSDT','TRXUSDT','ATOMUSDT','LTCUSDT'
  ]

  return await patch('/account/favorites', {
    favorites: defaultFavorites
  })
}
