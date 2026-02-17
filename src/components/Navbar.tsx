import { Link } from 'react-router-dom'

export default function Navbar() {
  return (
    <nav className="flex gap-4 p-4 border-b">
      <Link to="/" className="font-semibold hover:underline">Home</Link>
      <Link to="/dashboard" className="hover:underline">Dashboard</Link>
      <Link to="/login" className="hover:underline">Login</Link>
    </nav>
  )
}