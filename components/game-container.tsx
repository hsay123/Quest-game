"use client"

import { useState, useEffect, useRef } from "react"
import VoxelEngine from "./voxel-engine"
import GameUI from "./game-ui"
import { gameClient } from "@/lib/game-client"

export type GamePhase = "lobby" | "building" | "hunting" | "results"

interface GameState {
  userAddress: string
  opponentAddress: string
  stakeAmount: string
  userScore: number
  opponentScore: number
}

export default function GameContainer() {
  const [gamePhase, setGamePhase] = useState<GamePhase>("lobby")
  const [selectedBlockType, setSelectedBlockType] = useState<string>("stone")
  const [voxelGrid, setVoxelGrid] = useState<Map<string, string>>(new Map())
  const [treasureLocations, setTreasureLocations] = useState<Set<string>>(new Set())
  const [opponentGrid, setOpponentGrid] = useState<Map<string, string>>(new Map())
  const [opponentTreasures, setOpponentTreasures] = useState<Set<string>>(new Set())
  const [foundTreasures, setFoundTreasures] = useState<Set<string>>(new Set())
  const [placingTreasure, setPlacingTreasure] = useState(false)
  const [gameState, setGameState] = useState<GameState>({
    userAddress: "",
    opponentAddress: "",
    stakeAmount: "0",
    userScore: 0,
    opponentScore: 0,
  })
  const [opponentConnected, setOpponentConnected] = useState(false)
  const [gameId, setGameId] = useState<string>("")
  const syncIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const uploadIntervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (gamePhase === "building") {
      uploadIntervalRef.current = setInterval(async () => {
        try {
          const blocks = Array.from(voxelGrid.entries()).map(([key, type]) => ({
            key,
            type,
          }))
          if (blocks.length > 0) {
            await gameClient.updateGrid(blocks)
            console.log("[v0] Grid synced:", blocks.length, "blocks")
          }
        } catch (error) {
          console.error("[v0] Auto-upload grid error:", error)
        }
      }, 2000) // Upload every 2 seconds
    }

    return () => {
      if (uploadIntervalRef.current) {
        clearInterval(uploadIntervalRef.current)
      }
    }
  }, [gamePhase, voxelGrid])

  useEffect(() => {
    if (gamePhase === "building" || gamePhase === "hunting") {
      syncIntervalRef.current = setInterval(async () => {
        try {
          if (gameId) {
            gameClient.setGameId(gameId)
          }

          const state = await gameClient.getGameState()

          if (state.error) {
            console.warn("[v0] Game state error:", state.error)
            return
          }

          setOpponentConnected(state.opponentConnected || false)

          // Update opponent grid
          if (state.opponentGrid) {
            const newGrid = new Map<string, string>()
            state.opponentGrid.forEach((block: any) => {
              newGrid.set(block.key, block.type)
            })
            setOpponentGrid(newGrid)
          }

          // Update opponent treasures during hunt phase
          if (gamePhase === "hunting" && state.opponentTreasures) {
            setOpponentTreasures(new Set(state.opponentTreasures))
          }

          console.log("[v0] Opponent connected:", state.opponentConnected, "Game phase:", state.phase)

          // Check phase transitions
          if (state.phase !== gamePhase && state.phase === "hunting" && gamePhase === "building") {
            startHunting()
          }
        } catch (error) {
          console.error("[v0] Sync error:", error)
        }
      }, 1000) // Sync every second
    }

    return () => {
      if (syncIntervalRef.current) {
        clearInterval(syncIntervalRef.current)
      }
    }
  }, [gamePhase, gameId])

  const uploadGridChanges = async () => {
    if (!gameId) return
    try {
      const blocks = Array.from(voxelGrid.entries()).map(([key, type]) => ({
        key,
        type,
      }))
      await gameClient.updateGrid(blocks)
    } catch (error) {
      console.error("[v0] Upload grid error:", error)
    }
  }

  const startHunting = async () => {
    // Upload treasures before starting hunt
    if (!gameId) return
    try {
      await gameClient.setTreasures(Array.from(treasureLocations))
      await gameClient.endPhase()
      setFoundTreasures(new Set())
      setGamePhase("hunting")
    } catch (error) {
      console.error("[v0] Start hunting error:", error)
    }
  }

  const endHunt = async () => {
    try {
      const result = await gameClient.endPhase()
      setGameState((prev) => ({
        ...prev,
        userScore: foundTreasures.size,
        opponentScore: result.player2Score || 0,
      }))
      setGamePhase("results")
    } catch (error) {
      console.error("[v0] End hunt error:", error)
    }
  }

  const handleTreasureClick = async (location: string) => {
    try {
      const result = await gameClient.findTreasure(location)
      if (result.found) {
        setFoundTreasures((prev) => new Set([...prev, location]))
        setGameState((prev) => ({
          ...prev,
          userScore: result.score,
        }))
      }
    } catch (error) {
      console.error("[v0] Treasure find error:", error)
    }
  }

  return (
    <div className="w-full h-screen flex flex-col">
      <VoxelEngine
        gamePhase={gamePhase}
        voxelGrid={gamePhase === "hunting" ? opponentGrid : voxelGrid}
        setVoxelGrid={gamePhase === "hunting" ? setOpponentGrid : setVoxelGrid}
        selectedBlockType={selectedBlockType}
        treasureLocations={gamePhase === "hunting" ? opponentTreasures : treasureLocations}
        foundTreasures={gamePhase === "hunting" ? foundTreasures : new Set()}
        placingTreasure={placingTreasure}
        setTreasureLocations={setTreasureLocations}
        onTreasureClick={gamePhase === "hunting" ? handleTreasureClick : undefined}
      />
      <GameUI
        gamePhase={gamePhase}
        setGamePhase={setGamePhase}
        voxelGrid={voxelGrid}
        setVoxelGrid={setVoxelGrid}
        selectedBlockType={selectedBlockType}
        setSelectedBlockType={setSelectedBlockType}
        treasureLocations={treasureLocations}
        setTreasureLocations={setTreasureLocations}
        opponentTreasures={opponentTreasures}
        foundTreasures={foundTreasures}
        setFoundTreasures={setFoundTreasures}
        startHunting={startHunting}
        gameState={gameState}
        setGameState={setGameState}
        endHunt={endHunt}
        opponentConnected={opponentConnected}
        gameId={gameId}
        setGameId={setGameId}
        uploadGridChanges={uploadGridChanges}
        handleTreasureFound={handleTreasureClick}
        placingTreasure={placingTreasure}
        setPlacingTreasure={setPlacingTreasure}
      />
    </div>
  )
}
