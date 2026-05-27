import { get } from './http.api'
import type {
  ITransaction,
  TransactionAuditReport,
  TransactionGroupBy,
  TransactionSide
} from '../interfaces/transaction.interface'

type TransactionsResponse = {
  items: ITransaction[]
  nextCursor: string | null
}

export type TransactionQuery = {
  cursor?: string | null
  limit?: number
  symbol?: string
  side?: TransactionSide
  from?: string
  to?: string
  year?: number
  month?: number
}

export type TransactionReportQuery = TransactionQuery & {
  groupBy?: TransactionGroupBy
}

function transactionQueryString(params: TransactionReportQuery = {}) {
  const query = new URLSearchParams()

  if (params.cursor) query.set('cursor', params.cursor)
  if (params.limit) query.set('limit', String(params.limit))
  if (params.symbol) query.set('symbol', params.symbol)
  if (params.side) query.set('side', params.side)
  if (params.from) query.set('from', params.from)
  if (params.to) query.set('to', params.to)
  if (params.year) query.set('year', String(params.year))
  if (params.month) query.set('month', String(params.month))
  if (params.groupBy) query.set('groupBy', params.groupBy)

  const value = query.toString()
  return value ? `?${value}` : ''
}

export async function getTransactions(params: TransactionQuery = {}): Promise<TransactionsResponse> {
  return await get(`/transactions${transactionQueryString({ limit: 10, ...params })}`)
}

export async function getTransactionsBySymbol(
  symbol: string,
  cursor?: string
): Promise<TransactionsResponse> {
  return await getTransactions({ symbol, cursor, limit: 10 })
}

export async function getTransactionReport(params: TransactionReportQuery = {}): Promise<TransactionAuditReport> {
  return await get(`/transactions/report${transactionQueryString(params)}`)
}

export async function downloadTransactionReport(params: TransactionReportQuery = {}) {
  const baseUrl = import.meta.env.VITE_API_URL
  const res = await fetch(`${baseUrl}/transactions/export${transactionQueryString(params)}`, {
    credentials: 'include'
  })

  if (!res.ok) {
    const data = await res.json().catch(() => null)
    throw new Error(data?.error || 'Failed to download report')
  }

  const blob = await res.blob()
  const disposition = res.headers.get('Content-Disposition')
  const filename = disposition?.match(/filename="([^"]+)"/)?.[1] ?? 'cryptolab-audit.csv'
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')

  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}
