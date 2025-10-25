// Game client for API communication
export class GameClient {
  private gameId = ""
  private playerAddress = ""

  async createGame(playerAddress: string, gameId?: string) {
    const response = await fetch("/api/game", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "create-game",
        playerAddress,
        gameId,
      }),
    })
    const data = await response.json()
    this.gameId = data.gameId
    this.playerAddress = playerAddress
    return data.gameId
  }

  async joinGame(gameId: string, playerAddress: string) {
    this.gameId = gameId
    this.playerAddress = playerAddress
    const response = await fetch("/api/game", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "join-game",
        gameId,
        playerAddress,
      }),
    })
    return response.json()
  }

  async updateGrid(blocks: Array<{ key: string; type: string }>) {
    const response = await fetch("/api/game", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "update-grid",
        gameId: this.gameId,
        playerAddress: this.playerAddress,
        data: { blocks },
      }),
    })
    return response.json()
  }

  async setTreasures(treasures: string[]) {
    const response = await fetch("/api/game", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "set-treasures",
        gameId: this.gameId,
        playerAddress: this.playerAddress,
        data: { treasures },
      }),
    })
    return response.json()
  }

  async getGameState() {
    const response = await fetch("/api/game", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "get-game-state",
        gameId: this.gameId,
        playerAddress: this.playerAddress,
      }),
    })
    return response.json()
  }

  async findTreasure(location: string) {
    const response = await fetch("/api/game", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "find-treasure",
        gameId: this.gameId,
        playerAddress: this.playerAddress,
        data: { location },
      }),
    })
    return response.json()
  }

  async endPhase() {
    const response = await fetch("/api/game", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "end-phase",
        gameId: this.gameId,
        playerAddress: this.playerAddress,
      }),
    })
    return response.json()
  }

  setGameId(gameId: string) {
    this.gameId = gameId
  }

  setPlayerAddress(address: string) {
    this.playerAddress = address
  }

  getGameId() {
    return this.gameId
  }
}

export const gameClient = new GameClient()
