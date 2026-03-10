import { http } from './http.api'
import type { ITransaction } from '../interfaces/transaction.interface'

type TransactionsResponse = {
  items: ITransaction[]
  nextCursor: string | null
}

export async function getTransactions(cursor?: string) {
  const { data } = await http.get<TransactionsResponse>('/transactions', {
    params: { cursor, limit: 10 }
  })

  return data
}

export async function getTransactionsBySymbol(symbol: string, cursor?: string) {
  const { data } = await http.get<TransactionsResponse>('/transactions', {
    params: { symbol, cursor, limit: 10 }
  })

  return data
}