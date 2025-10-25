"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useState, useEffect } from "react"

interface HuntingPhaseUIProps {
  setGamePhase: (phase: string) => void
  opponentTreasures: Set<string>
  foundTreasures: Set<string>
  setFoundTreasures: (treasures: Set<string>) => void
  handleTreasureFound: (location: string) => void
}

export default function HuntingPhaseUI({
  setGamePhase,
  opponentTreasures,
  foundTreasures,
  setFoundTreasures,
  handleTreasureFound,
}: HuntingPhaseUIProps) {
  const [timeLeft, setTimeLeft] = useState(300)

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((t) => (t > 0 ? t - 1 : 0))
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const successRate = opponentTreasures.size > 0 ? Math.round((foundTreasures.size / opponentTreasures.size) * 100) : 0

  return (
    <div className="absolute top-4 left-4 right-4 flex justify-between items-start pointer-events-none">
      <Card className="minecraft-card pointer-events-auto space-y-4">
        <h2 className="text-2xl font-bold text-accent">HUNTING PHASE</h2>
        <p className="text-sm font-bold text-accent">
          TIME: {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, "0")}
        </p>
        <p className="text-sm font-bold">
          FOUND: {foundTreasures.size}/{opponentTreasures.size}
        </p>
        <p className="text-sm font-bold text-green-400">SUCCESS: {successRate}%</p>

        <div className="text-xs font-bold text-muted-foreground mt-2 space-y-1 border-t-2 border-border pt-2">
          <p className="text-accent">HOW TO FIND TREASURES:</p>
          <p>🟨 GOLD COINS = HIDDEN TREASURES</p>
          <p>🟩 GREEN COINS = FOUND TREASURES</p>
          <p className="mt-2 text-yellow-300">CLICK ON GOLD COINS TO DIG!</p>
        </div>
      </Card>

      <Button onClick={() => setGamePhase("results")} className="minecraft-button pointer-events-auto text-lg">
        END HUNT
      </Button>
    </div>
  )
}
