"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

interface GameState {
  userAddress: string
  opponentAddress: string
  stakeAmount: string
  userScore: number
  opponentScore: number
}

interface ResultsScreenProps {
  gameState: GameState
  setGamePhase: (phase: string) => void
}

export default function ResultsScreen({ gameState, setGamePhase }: ResultsScreenProps) {
  const userWon = gameState.userScore > gameState.opponentScore
  const totalPot = Number.parseFloat(gameState.stakeAmount) * 2

  return (
    <div className="w-full h-screen flex items-center justify-center bg-gradient-to-b from-[#1a1a1a] to-[#0d0d0d]">
      <Card className="minecraft-card w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className={`text-4xl font-bold mb-2 ${userWon ? "text-green-400" : "text-red-400"}`}>
            {userWon ? "VICTORY!" : "DEFEAT"}
          </h1>
          <p className="text-accent font-bold">GAME RESULTS</p>
        </div>

        <div className="minecraft-card bg-muted space-y-4">
          <div className="flex justify-between border-b-2 border-border pb-2">
            <span className="text-sm font-bold">YOUR TREASURES:</span>
            <span className="text-sm font-bold text-accent">{gameState.userScore}</span>
          </div>
          <div className="flex justify-between border-b-2 border-border pb-2">
            <span className="text-sm font-bold">OPPONENT TREASURES:</span>
            <span className="text-sm font-bold text-accent">{gameState.opponentScore}</span>
          </div>
          <div className="flex justify-between border-b-2 border-border pb-2">
            <span className="text-sm font-bold">TOTAL POT:</span>
            <span className="text-sm font-bold text-accent">{totalPot} MONAD</span>
          </div>
          {userWon && (
            <div className="flex justify-between text-green-400">
              <span className="text-sm font-bold">YOUR WINNINGS:</span>
              <span className="text-sm font-bold">{totalPot} MONAD</span>
            </div>
          )}
        </div>

        <Button onClick={() => setGamePhase("lobby")} className="minecraft-button w-full text-lg">
          PLAY AGAIN
        </Button>
      </Card>
    </div>
  )
}
