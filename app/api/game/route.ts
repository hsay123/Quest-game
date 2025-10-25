import { type NextRequest, NextResponse } from "next/server"
import { generateGameId } from "@/lib/game-id-generator"

// In-memory game sessions storage
const gameSessions = new Map<string, GameSession>()

interface GameSession {
  gameId: string
  player1: {
    address: string
    grid: Map<string, string>
    treasures: Set<string>
    score: number
  }
  player2: {
    address: string
    grid: Map<string, string>
    treasures: Set<string>
    score: number
  }
  phase: "building" | "hunting" | "results"
  startTime: number
  phaseEndTime: number
}

function normalizeGameId(gameId: string): string {
  return gameId.trim().toLowerCase()
}

export async function POST(request: NextRequest) {
  const { action, gameId, playerAddress, data } = await request.json()

  try {
    switch (action) {
      case "create-game": {
        const newGameId = gameId || generateGameId()
        const normalizedGameId = normalizeGameId(newGameId)
        const session: GameSession = {
          gameId: normalizedGameId,
          player1: {
            address: playerAddress,
            grid: new Map(),
            treasures: new Set(),
            score: 0,
          },
          player2: {
            address: "",
            grid: new Map(),
            treasures: new Set(),
            score: 0,
          },
          phase: "building",
          startTime: Date.now(),
          phaseEndTime: Date.now() + 5 * 60 * 1000, // 5 minutes
        }
        gameSessions.set(normalizedGameId, session)
        console.log("[v0] Game created:", normalizedGameId, "Total games:", gameSessions.size)
        return NextResponse.json({ gameId: normalizedGameId, success: true })
      }

      case "join-game": {
        const normalizedGameId = normalizeGameId(gameId)
        const session = gameSessions.get(normalizedGameId)

        if (!session) {
          console.log("[v0] Game not found:", normalizedGameId, "Available games:", Array.from(gameSessions.keys()))
          return NextResponse.json(
            { error: "Game not found. Please check the game ID and try again." },
            { status: 404 },
          )
        }

        session.player2.address = playerAddress
        console.log("[v0] Player 2 joined game:", normalizedGameId)
        return NextResponse.json({ success: true, gameId: normalizedGameId })
      }

      case "update-grid": {
        const normalizedGameId = normalizeGameId(gameId)
        const session = gameSessions.get(normalizedGameId)
        if (!session) {
          return NextResponse.json({ error: "Game not found" }, { status: 404 })
        }

        const isPlayer1 = session.player1.address === playerAddress
        const player = isPlayer1 ? session.player1 : session.player2

        // Update grid with new block data
        if (data.blocks) {
          data.blocks.forEach((block: any) => {
            player.grid.set(block.key, block.type)
          })
        }

        return NextResponse.json({
          success: true,
          opponentGrid: isPlayer1
            ? Array.from(session.player2.grid.entries()).map(([key, type]) => ({
                key,
                type,
              }))
            : Array.from(session.player1.grid.entries()).map(([key, type]) => ({
                key,
                type,
              })),
        })
      }

      case "set-treasures": {
        const normalizedGameId = normalizeGameId(gameId)
        const session = gameSessions.get(normalizedGameId)
        if (!session) {
          return NextResponse.json({ error: "Game not found" }, { status: 404 })
        }

        const isPlayer1 = session.player1.address === playerAddress
        const player = isPlayer1 ? session.player1 : session.player2
        player.treasures = new Set(data.treasures)

        return NextResponse.json({ success: true })
      }

      case "get-game-state": {
        const normalizedGameId = normalizeGameId(gameId)
        const session = gameSessions.get(normalizedGameId)
        if (!session) {
          return NextResponse.json({ error: "Game not found" }, { status: 404 })
        }

        const isPlayer1 = session.player1.address === playerAddress
        const opponent = isPlayer1 ? session.player2 : session.player1

        return NextResponse.json({
          phase: session.phase,
          timeRemaining: Math.max(0, session.phaseEndTime - Date.now()),
          opponentConnected: opponent.address !== "",
          opponentGrid: Array.from(opponent.grid.entries()).map(([key, type]) => ({
            key,
            type,
          })),
          opponentTreasures: session.phase === "hunting" ? Array.from(opponent.treasures) : [],
        })
      }

      case "find-treasure": {
        const normalizedGameId = normalizeGameId(gameId)
        const session = gameSessions.get(normalizedGameId)
        if (!session) {
          return NextResponse.json({ error: "Game not found" }, { status: 404 })
        }

        const isPlayer1 = session.player1.address === playerAddress
        const player = isPlayer1 ? session.player1 : session.player2
        const opponent = isPlayer1 ? session.player2 : session.player1

        // Check if treasure exists at location
        const treasureFound = opponent.treasures.has(data.location)
        if (treasureFound) {
          player.score += 1
        }

        return NextResponse.json({
          found: treasureFound,
          score: player.score,
        })
      }

      case "end-phase": {
        const normalizedGameId = normalizeGameId(gameId)
        const session = gameSessions.get(normalizedGameId)
        if (!session) {
          return NextResponse.json({ error: "Game not found" }, { status: 404 })
        }

        if (session.phase === "building") {
          session.phase = "hunting"
          session.phaseEndTime = Date.now() + 5 * 60 * 1000
        } else if (session.phase === "hunting") {
          session.phase = "results"
        }

        return NextResponse.json({
          phase: session.phase,
          player1Score: session.player1.score,
          player2Score: session.player2.score,
        })
      }

      default:
        return NextResponse.json({ error: "Unknown action" }, { status: 400 })
    }
  } catch (error) {
    console.error("Game API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
