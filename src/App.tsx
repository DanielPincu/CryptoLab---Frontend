import { Routes, Route, Navigate } from 'react-router-dom'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Research from './pages/Research'
import Dashboard from './pages/Dashboard'
import Profile from './pages/Profile'
import Navbar from './components/Navbar'
import Portfolio from './pages/Positions'
import Transactions from './pages/Transactions'
import Leaderboard from './components/LeaderboardTable' 
import GamePage from './pages/Game'

import { RequireAuth } from './auth/RequireAuth'


function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/login" element={<Login />} />
        <Route
          path="/research"
          element={
            <RequireAuth>
              <Research />
            </RequireAuth>
          }
        />
        <Route
          path="/profile"
          element={
            <RequireAuth>
              <Profile />
            </RequireAuth>
          }
        />

        <Route
          path="/portfolio"
          element={
            <RequireAuth>
              <Portfolio />
            </RequireAuth>
          }
        />

        <Route
          path="/transactions"
          element={
            <RequireAuth>
              <Transactions />
            </RequireAuth>
          }
        />

        <Route
          path="/leaderboard"
          element={
            <RequireAuth>
              <Leaderboard />
            </RequireAuth>
          }
        />

        <Route
          path="/game"
          element={
            <RequireAuth>
              <GamePage />
            </RequireAuth>
          }
        />

        <Route path="/register" element={<Register />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  )
}

export default App