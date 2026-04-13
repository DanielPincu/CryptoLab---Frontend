import { http } from './http.api'

type StartGameResponse = {
  sessionId: string
  question: {
    prompt: string
    options: number[]
  }
  score: number
  target: number
}

type AnswerResponse = {
  gameOver: boolean
  score?: number
  lives?: number
  question?: {
    prompt: string
    options: number[]
  }
  reward?: number
  reason?: string
  wrong?: boolean
}

export async function startGame(): Promise<StartGameResponse> {
  const res = await http.post('/game/start')
  return res.data
}

export async function answerGame(payload: {
  sessionId: string
  answer: number
}): Promise<AnswerResponse> {
  const res = await http.post('/game/answer', payload)
  return res.data
}