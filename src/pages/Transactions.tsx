import TransactionsTable from '../components/TransactionsTable'

export default function Transactions() {
  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">Trade History</h2>
      <TransactionsTable />
    </div>
  )
}