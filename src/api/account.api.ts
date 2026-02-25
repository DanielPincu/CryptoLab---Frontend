import { http } from './http.api'
import type { IAccount } from '../interfaces/account.interface'

export async function apiAccountMe(): Promise<IAccount> {
  const res = await http.get('/account/me')
  return res.data
}

export async function apiAccountUpdate(
  payload: Partial<IAccount>
): Promise<IAccount> {
  const res = await http.patch('/account/me', payload)
  return res.data
}

// Add symbol to favorites
export async function apiAccountAddFavorite(symbol: string): Promise<{ favorites: string[] }> {
  const res = await http.patch('/account/favorites', { add: symbol })
  return res.data
}

// Remove symbol from favorites
export async function apiAccountRemoveFavorite(symbol: string): Promise<{ favorites: string[] }> {
  const res = await http.patch('/account/favorites', { remove: symbol })
  return res.data
}

// Reset favorites to default list
export async function apiAccountResetFavorites(): Promise<{ favorites: string[] }> {
  const defaultFavorites = [
    'BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'SOLUSDT', 'ADAUSDT', 'XRPUSDT', 'DOGEUSDT',
  'AVAXUSDT','DOTUSDT', 'LINKUSDT','TRXUSDT','ATOMUSDT','LTCUSDT'
  ]

  const res = await http.patch('/account/favorites', {
    favorites: defaultFavorites
  })

  return res.data
}
