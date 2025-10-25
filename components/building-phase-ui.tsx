"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useState, useEffect } from "react"

interface BuildingPhaseUIProps {
  setGamePhase: (phase: string) => void
  voxelGrid: Map<string, string>
  selectedBlockType: string
  setSelectedBlockType: (type: string) => void
  treasureLocations: Set<string>
  setTreasureLocations: (locations: Set<string>) => void
  opponentConnected: boolean
  uploadGridChanges: () => void
  placingTreasure: boolean
  setPlacingTreasure: (placing: boolean) => void
}

const BLOCK_TYPES = [
  { name: "stone", color: "#808080", label: "STONE" },
  { name: "dirt", color: "#8B7355", label: "DIRT" },
  { name: "wood", color: "#654321", label: "WOOD" },
  { name: "sand", color: "#F4A460", label: "SAND" },
  { name: "grass", color: "#228B22", label: "GRASS" },
  { name: "cobblestone", color: "#696969", label: "COBBLE" },
]

export default function BuildingPhaseUI({
  setGamePhase,
  voxelGrid,
  selectedBlockType,
  setSelectedBlockType,
  treasureLocations,
  setTreasureLocations,
  opponentConnected,
  uploadGridChanges,
  placingTreasure,
  setPlacingTreasure,
}: BuildingPhaseUIProps) {
  const [timeLeft, setTimeLeft] = useState(300)

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((t) => (t > 0 ? t - 1 : 0))
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const handleFinishBuilding = async () => {
    await uploadGridChanges()
    setGamePhase("hunting")
  }

  return (
    <div className="absolute top-4 left-4 right-4 flex justify-between items-start pointer-events-none">
      <Card className="minecraft-card pointer-events-auto space-y-4">
        <h2 className="text-2xl font-bold text-accent">BUILDING PHASE</h2>
        <p className="text-sm font-bold text-accent">
          TIME: {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, "0")}
        </p>
        <p className="text-sm font-bold">BLOCKS: {voxelGrid.size}</p>
        <p className="text-sm font-bold">TREASURES: {treasureLocations.size}</p>

        <div
          className={`text-xs font-bold p-2 border-2 ${opponentConnected ? "border-green-400 text-green-400" : "border-red-400 text-red-400"}`}
        >
          {opponentConnected ? "✓ OPPONENT CONNECTED" : "✗ WAITING FOR OPPONENT..."}
        </div>

        <div className="space-y-2">
          <p className="text-xs font-bold text-accent">SELECT BLOCK:</p>
          <div className="grid grid-cols-3 gap-2">
            {BLOCK_TYPES.map((block) => (
              <button
                key={block.name}
                onClick={() => setSelectedBlockType(block.name)}
                className={`w-12 h-12 border-2 font-bold text-xs transition-all ${
                  selectedBlockType === block.name ? "border-accent scale-110" : "border-border hover:border-accent"
                }`}
                style={{ backgroundColor: block.color }}
                title={block.name}
              >
                {block.label.charAt(0)}
              </button>
            ))}
          </div>
        </div>

        {placingTreasure ? (
          <Button
            onClick={() => setPlacingTreasure(false)}
            className="minecraft-button w-full text-sm bg-red-600 hover:bg-red-700"
          >
            CANCEL TREASURE
          </Button>
        ) : (
          <Button onClick={() => setPlacingTreasure(true)} className="minecraft-button w-full text-sm">
            HIDE TREASURE (CLICK ON BLOCK)
          </Button>
        )}

        <div className="text-xs font-bold text-muted-foreground mt-2 space-y-1 border-t-2 border-border pt-2">
          <p>LEFT CLICK: Place Block</p>
          <p>RIGHT CLICK: Remove Block</p>
          {placingTreasure && <p className="text-yellow-400">CLICK ON A BLOCK TO HIDE TREASURE</p>}
          <p className="text-accent mt-2">TREASURES VISIBLE TO OPPONENT!</p>
        </div>
      </Card>

      <Button onClick={handleFinishBuilding} className="minecraft-button pointer-events-auto text-lg">
        FINISH BUILDING
      </Button>
    </div>
  )
}
