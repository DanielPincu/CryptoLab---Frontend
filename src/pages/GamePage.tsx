import { useEffect, useState, useRef } from 'react'
import { startGame, answerGame } from '../api/game.api'

type Question = {
  prompt: string
  options: number[]
}

export default function GamePage() {
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [question, setQuestion] = useState<Question | null>(null)
  const [score, setScore] = useState(0)
  const [gameOver, setGameOver] = useState(false)
  const [reward, setReward] = useState<number | null>(null)
  const [timeLeft, setTimeLeft] = useState(7000)
  const [maxTime, setMaxTime] = useState(7000)

  const timerRef = useRef<number | null>(null)

  // start game
  async function initGame() {
    const res = await startGame()
    setSessionId(res.sessionId)
    setQuestion(res.question)
    setScore(0)
    setGameOver(false)
    setReward(null)
    resetTimer(7000)
  }

  // timer logic
  function resetTimer(ms: number) {
    if (timerRef.current) clearInterval(timerRef.current)

    setMaxTime(ms)
    setTimeLeft(ms)

    const start = Date.now()

    timerRef.current = window.setInterval(() => {
      const elapsed = Date.now() - start
      const remaining = ms - elapsed

      if (remaining <= 0) {
        clearInterval(timerRef.current!)
        setGameOver(true)
      } else {
        setTimeLeft(remaining)
      }
    }, 50)
  }

  useEffect(() => {
    const start = async () => {
      const res = await startGame()
      setSessionId(res.sessionId)
      setQuestion(res.question)
      setScore(0)
      setGameOver(false)
      setReward(null)
      resetTimer(7000)
    }

    start()

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [])

  // answer handler
  async function handleAnswer(value: number) {
    if (!sessionId || gameOver) return

    const res = await answerGame({
      sessionId,
      answer: value
    })

    if (res.gameOver) {
      
      if (res.reward) {
        setScore((prev) => prev + 1)
        setReward(res.reward)
      }

      setGameOver(true)
      return
    }

    // update state
    setScore(res.score ?? 0)
    setQuestion(res.question ?? null)

    // reset timer (fixed duration)
    resetTimer(7000)
  }

  if (!question) {
    return <div className="p-6 text-slate-400">Loading game...</div>
  }

  return (
    <div className="max-w-md mx-auto mt-10 p-6 rounded-xl border border-slate-800 bg-slate-900/60">
      <h1 className="text-xl font-semibold mb-4">🧠 Math Game</h1>
      <div className="text-xs text-slate-400 mb-3 text-center">
        Answer correctly 10 times without mistakes to win <span className="text-emerald-400 font-semibold">$50</span>
      </div>

      {/* Score */}
      <div className="flex justify-between mb-4 text-sm text-slate-400">
        <span>Score: {score} / 10</span>
      </div>

      {/* Timer bar */}
      {!gameOver && (
        <div className="w-full h-2 bg-slate-800 rounded mb-4 overflow-hidden">
          <div
            className="h-full bg-emerald-400 transition-all"
            style={{
              width: `${(timeLeft / maxTime) * 100}%`
            }}
          />
        </div>
      )}

      {/* Question */}
      <div className="text-lg font-semibold mb-4 text-center">
        {question.prompt}
      </div>

      {/* Options */}
      {!gameOver && (
        <div className="grid grid-cols-2 gap-3">
          {question.options.map((opt, idx) => (
            <button
              key={`${opt}-${idx}`}
              onClick={() => handleAnswer(opt)}
              className="rounded-lg border border-slate-700 bg-slate-800 py-3 text-lg hover:bg-slate-700"
            >
              {opt}
            </button>
          ))}
        </div>
      )}

      {/* Game Over */}
      {gameOver && (
        <div className="mt-6 text-center">
          <div className="text-lg font-semibold mb-2">
            {reward ? '🎉 You won!' : '💀 Game Over'}
          </div>

          {reward && (
            <div className="text-emerald-400 mb-2">
              +${reward} reward
            </div>
          )}

          <button
            onClick={initGame}
            className="mt-2 px-4 py-2 rounded-lg bg-emerald-500/20 border border-emerald-500/30"
          >
            Play Again
          </button>
        </div>
      )}
    </div>
  )
}