import { post } from './http.api'

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
  return await post('/game/start', {})
}

export async function answerGame(payload: {
  sessionId: string
  answer: number
}): Promise<AnswerResponse> {
  return await post('/game/answer', payload)
}