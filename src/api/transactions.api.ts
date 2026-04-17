import { get } from './http.api'
import type { ITransaction } from '../interfaces/transaction.interface'

type TransactionsResponse = {
  items: ITransaction[]
  nextCursor: string | null
}

export async function getTransactions(cursor?: string): Promise<TransactionsResponse> {
  const query = cursor
    ? `?cursor=${encodeURIComponent(cursor)}&limit=10`
    : `?limit=10`

  return await get(`/transactions${query}`)
}

export async function getTransactionsBySymbol(
  symbol: string,
  cursor?: string
): Promise<TransactionsResponse> {
  const query = `?symbol=${encodeURIComponent(symbol)}${
    cursor ? `&cursor=${encodeURIComponent(cursor)}` : ''
  }&limit=10`

  return await get(`/transactions${query}`)
}