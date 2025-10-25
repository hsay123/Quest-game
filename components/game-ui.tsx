"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import LobbyScreen from "./lobby-screen"
import BuildingPhaseUI from "./building-phase-ui"
import HuntingPhaseUI from "./hunting-phase-ui"
import ResultsScreen from "./results-screen"

interface GameState {
  userAddress: string
  opponentAddress: string
  stakeAmount: string
  userScore: number
  opponentScore: number
}

interface GameUIProps {
  gamePhase: string
  setGamePhase: (phase: any) => void
  voxelGrid: Map<string, string>
  setVoxelGrid: (grid: Map<string, string>) => void
  selectedBlockType: string
  setSelectedBlockType: (type: string) => void
  treasureLocations: Set<string>
  setTreasureLocations: (locations: Set<string>) => void
  opponentTreasures: Set<string>
  foundTreasures: Set<string>
  setFoundTreasures: (treasures: Set<string>) => void
  startHunting: () => void
  gameState: GameState
  setGameState: (state: GameState) => void
  endHunt: () => void
  opponentConnected: boolean
  gameId: string
  setGameId: (id: string) => void
  uploadGridChanges: () => void
  handleTreasureFound: (location: string) => void
  placingTreasure: boolean
  setPlacingTreasure: (placing: boolean) => void
}

export default function GameUI({
  gamePhase,
  setGamePhase,
  voxelGrid,
  setVoxelGrid,
  selectedBlockType,
  setSelectedBlockType,
  treasureLocations,
  setTreasureLocations,
  opponentTreasures,
  foundTreasures,
  setFoundTreasures,
  startHunting,
  gameState,
  setGameState,
  endHunt,
  opponentConnected,
  gameId,
  setGameId,
  uploadGridChanges,
  handleTreasureFound,
  placingTreasure,
  setPlacingTreasure,
}: GameUIProps) {
  if (gamePhase === "lobby") {
    return (
      <LobbyScreen
        setGamePhase={setGamePhase}
        gameId={gameId}
        setGameId={setGameId}
        gameState={gameState}
        setGameState={setGameState}
      />
    )
  }

  if (gamePhase === "building") {
    return (
      <BuildingPhaseUI
        setGamePhase={startHunting}
        voxelGrid={voxelGrid}
        selectedBlockType={selectedBlockType}
        setSelectedBlockType={setSelectedBlockType}
        treasureLocations={treasureLocations}
        setTreasureLocations={setTreasureLocations}
        opponentConnected={opponentConnected}
        uploadGridChanges={uploadGridChanges}
        placingTreasure={placingTreasure}
        setPlacingTreasure={setPlacingTreasure}
      />
    )
  }

  if (gamePhase === "hunting") {
    return (
      <HuntingPhaseUI
        setGamePhase={endHunt}
        opponentTreasures={opponentTreasures}
        foundTreasures={foundTreasures}
        setFoundTreasures={setFoundTreasures}
        handleTreasureFound={handleTreasureFound}
      />
    )
  }

  if (gamePhase === "results") {
    return <ResultsScreen gameState={gameState} setGamePhase={setGamePhase} />
  }

  return (
    <div className="absolute top-4 left-4 right-4 flex justify-between items-start pointer-events-none">
      <Card className="p-4 pointer-events-auto">
        <h1 className="text-2xl font-bold mb-2">Quest Game</h1>
        <p className="text-sm text-muted-foreground">Phase: {gamePhase}</p>
      </Card>
      <Button onClick={() => setGamePhase("lobby")} className="pointer-events-auto">
        Back to Lobby
      </Button>
    </div>
  )
}
