"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useState, useEffect } from "react"
import { switchToMonad } from "@/lib/monad-config"
import { gameClient } from "@/lib/game-client"
import { generateGameId } from "@/lib/game-id-generator"
import { createChallengeOnChain, acceptChallengeOnChain } from "@/lib/contract-interaction"
import { getBalance } from "@/lib/web3-utils"

interface LobbyScreenProps {
  setGamePhase: (phase: string) => void
  gameId: string
  setGameId: (id: string) => void
  gameState: any
  setGameState: (state: any) => void
}

export default function LobbyScreen({ setGamePhase, gameId, setGameId, gameState, setGameState }: LobbyScreenProps) {
  const [stake, setStake] = useState("1")
  const [opponent, setOpponent] = useState("")
  const [walletConnected, setWalletConnected] = useState(false)
  const [userAddress, setUserAddress] = useState("")
  const [balance, setBalance] = useState("0")
  const [chainCorrect, setChainCorrect] = useState(false)
  const [joinGameId, setJoinGameId] = useState("")
  const [isJoining, setIsJoining] = useState(false)
  const [copied, setCopied] = useState(false)
  const [gameIdGenerated, setGameIdGenerated] = useState(false)
  const [isGeneratingGameId, setIsGeneratingGameId] = useState(false)
  const [isStartingGame, setIsStartingGame] = useState(false)
  const [transactionStatus, setTransactionStatus] = useState("")

  useEffect(() => {
    const checkWallet = async () => {
      if (typeof window !== "undefined" && (window as any).ethereum) {
        try {
          const accounts = await (window as any).ethereum.request({ method: "eth_accounts" })
          if (accounts.length > 0) {
            setUserAddress(accounts[0])
            setWalletConnected(true)

            try {
              const actualBalance = await getBalance(accounts[0])
              setBalance(actualBalance)
            } catch (error) {
              console.error("[v0] Error fetching balance:", error)
              setBalance("0")
            }

            const chainId = await (window as any).ethereum.request({ method: "eth_chainId" })
            setChainCorrect(chainId === "0x27AF")
          }
        } catch (error) {
          console.error("[v0] Error checking wallet:", error)
        }
      }
    }
    checkWallet()
  }, [])

  const handleConnectWallet = async () => {
    if (typeof window !== "undefined" && (window as any).ethereum) {
      try {
        const accounts = await (window as any).ethereum.request({ method: "eth_requestAccounts" })
        if (!accounts || accounts.length === 0) {
          alert("No accounts found. Please check your wallet.")
          return
        }

        setUserAddress(accounts[0])
        setWalletConnected(true)

        try {
          const actualBalance = await getBalance(accounts[0])
          setBalance(actualBalance)
        } catch (error) {
          console.error("[v0] Error fetching balance:", error)
          setBalance("0")
        }

        try {
          await switchToMonad()
          setChainCorrect(true)
        } catch (networkError: any) {
          console.warn("[v0] Network switch skipped:", networkError.message)
          setChainCorrect(false)
        }
      } catch (error: any) {
        if (error.code === 4001) {
          console.warn("[v0] User rejected wallet connection")
          alert("Wallet connection is required to play. Please approve the connection.")
        } else {
          console.error("[v0] Error connecting wallet:", error)
          alert("Failed to connect wallet. Please try again.")
        }
      }
    } else {
      alert("MetaMask is required to play. Please install MetaMask.")
    }
  }

  const handleDisconnectWallet = () => {
    setWalletConnected(false)
    setUserAddress("")
    setBalance("0")
    setChainCorrect(false)
  }

  const handleGenerateGameId = async () => {
    if (!walletConnected) {
      alert("Please connect your wallet to play")
      return
    }

    if (!chainCorrect) {
      alert("Please switch to Monad Testnet")
      return
    }

    if (!opponent.trim()) {
      alert("Please enter opponent's wallet address")
      return
    }

    try {
      setIsGeneratingGameId(true)
      setTransactionStatus("Generating game ID and creating challenge on-chain...")

      const newGameId = generateGameId()
      const playerAddress = userAddress

      await gameClient.createGame(playerAddress, newGameId)
      gameClient.setPlayerAddress(playerAddress)

      setTransactionStatus("Requesting MetaMask transaction approval...")
      const txHash = await createChallengeOnChain(newGameId, opponent, stake)

      if (!txHash) {
        throw new Error("Transaction failed - no hash returned")
      }

      setTransactionStatus("Waiting for on-chain confirmation...")
      await new Promise((resolve) => setTimeout(resolve, 3000))

      setTransactionStatus(`Transaction confirmed: ${txHash.slice(0, 10)}...`)
      console.log("[v0] Game created on-chain with tx:", txHash)

      setGameId(newGameId)
      setGameIdGenerated(true)
      setGameState((prev: any) => ({
        ...prev,
        userAddress: playerAddress,
        opponentAddress: opponent,
        stakeAmount: stake,
      }))

      setTimeout(() => setTransactionStatus(""), 3000)
    } catch (error: any) {
      console.error("[v0] Error generating game ID:", error)
      if (error.code === 4001) {
        alert("Transaction rejected by user")
      } else if (error.message?.includes("insufficient funds")) {
        alert("Insufficient MON balance for stake amount")
      } else if (error.message?.includes("Cannot challenge yourself")) {
        alert("You cannot challenge yourself. Please enter a different wallet address.")
      } else if (error.message?.includes("Invalid opponent address")) {
        alert("Invalid opponent wallet address. Please check and try again.")
      } else {
        alert("Failed to generate game ID: " + error.message)
      }
      setTransactionStatus("")
    } finally {
      setIsGeneratingGameId(false)
    }
  }

  const handleJoinGame = async () => {
    if (!walletConnected) {
      alert("Please connect your wallet to play")
      return
    }

    if (!chainCorrect) {
      alert("Please switch to Monad Testnet")
      return
    }

    const trimmedGameId = joinGameId.trim()
    if (!trimmedGameId) {
      alert("Please enter a game ID")
      return
    }

    try {
      setIsJoining(true)
      setTransactionStatus("Joining game and accepting challenge on-chain...")

      const playerAddress = userAddress

      setTransactionStatus("Requesting MetaMask transaction approval...")
      const txHash = await acceptChallengeOnChain(trimmedGameId, stake)

      if (!txHash) {
        throw new Error("Transaction failed - no hash returned")
      }

      setTransactionStatus(`Challenge accepted! Transaction: ${txHash.slice(0, 10)}...`)
      console.log("[v0] Challenge accepted on-chain with tx:", txHash)

      await gameClient.joinGame(trimmedGameId, playerAddress)
      gameClient.setPlayerAddress(playerAddress)
      setGameId(trimmedGameId)
      setGameState((prev: any) => ({
        ...prev,
        userAddress: playerAddress,
      }))

      setTimeout(() => {
        setTransactionStatus("")
        setGamePhase("building")
      }, 2000)
    } catch (error: any) {
      console.error("[v0] Error joining game:", error)
      if (error.code === 4001) {
        alert("Transaction rejected by user")
      } else if (error.message?.includes("insufficient funds")) {
        alert("Insufficient MON balance for stake amount")
      } else if (error.message?.includes("does not exist on-chain")) {
        alert(
          "Game not found on-chain. The creator may need to wait for their transaction to confirm. Please try again in a moment.",
        )
      } else if (error.message?.includes("Only opponent can accept")) {
        alert("You are not the opponent for this challenge. Check the game ID.")
      } else if (error.message?.includes("Game not found")) {
        alert("Game not found. Please check the game ID and try again.")
      } else {
        alert("Failed to join game: " + error.message)
      }
      setTransactionStatus("")
    } finally {
      setIsJoining(false)
    }
  }

  const handleStartGame = async () => {
    if (!gameIdGenerated) {
      alert("Please generate a game ID first")
      return
    }

    try {
      setIsStartingGame(true)
      setTransactionStatus("Checking opponent connection...")

      // Verify opponent has joined by checking game state
      const gameState = await gameClient.getGameState()

      if (!gameState.opponentConnected) {
        alert("Opponent has not joined yet. Please wait for them to accept the challenge.")
        setIsStartingGame(false)
        return
      }

      setTransactionStatus("Starting game...")

      setTimeout(() => {
        setTransactionStatus("")
        setGamePhase("building")
      }, 1000)
    } catch (error: any) {
      console.error("[v0] Error starting game:", error)
      alert("Failed to start game: " + error.message)
      setTransactionStatus("")
    } finally {
      setIsStartingGame(false)
    }
  }

  const handleCopyGameId = () => {
    navigator.clipboard.writeText(gameId)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="w-full h-screen flex items-center justify-center bg-gradient-to-b from-[#1a1a1a] to-[#0d0d0d]">
      <div className="w-full max-w-2xl px-4 space-y-4">
        <Card className="minecraft-card w-full space-y-6">
          <div className="text-center">
            <h1 className="minecraft-title mb-2">QUEST GAME</h1>
            <p className="text-accent text-sm font-bold">Build • Hide • Hunt • Win</p>
          </div>

          <div className="minecraft-card bg-muted space-y-3">
            {walletConnected ? (
              <>
                <p className="text-sm font-bold text-green-400">✓ WALLET CONNECTED</p>
                <p className="text-xs text-muted-foreground font-mono break-all">{userAddress}</p>
                <p className="text-sm font-bold">Balance: {Number.parseFloat(balance).toFixed(4)} MON</p>
                {chainCorrect ? (
                  <p className="text-xs text-green-400 font-bold">✓ MONAD TESTNET</p>
                ) : (
                  <p className="text-xs text-yellow-400 font-bold">⚠ DIFFERENT NETWORK</p>
                )}
                <Button
                  onClick={handleDisconnectWallet}
                  className="minecraft-button w-full bg-destructive hover:bg-red-600 text-sm"
                >
                  DISCONNECT WALLET
                </Button>
              </>
            ) : (
              <Button onClick={handleConnectWallet} className="minecraft-button w-full text-sm">
                CONNECT WALLET (REQUIRED)
              </Button>
            )}
          </div>

          {transactionStatus && (
            <div className="minecraft-card bg-blue-900 border-2 border-blue-400 p-3">
              <p className="text-xs font-bold text-blue-200 animate-pulse">{transactionStatus}</p>
            </div>
          )}

          {walletConnected && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4 minecraft-card bg-muted p-4">
                <h3 className="font-bold text-accent text-center">CREATE CHALLENGE</h3>

                {!gameIdGenerated ? (
                  <>
                    <div>
                      <label className="text-sm font-bold mb-2 block text-accent">OPPONENT WALLET ADDRESS</label>
                      <Input
                        type="text"
                        placeholder="0x..."
                        value={opponent}
                        onChange={(e) => setOpponent(e.target.value)}
                        className="w-full bg-input border-2 border-border font-mono text-xs"
                        disabled={isGeneratingGameId}
                      />
                      <p className="text-xs text-muted-foreground mt-1">Enter opponent's Ethereum wallet address</p>
                    </div>

                    <div>
                      <label className="text-sm font-bold mb-2 block text-accent">STAKE AMOUNT (MON)</label>
                      <Input
                        type="number"
                        placeholder="1.0"
                        value={stake}
                        onChange={(e) => setStake(e.target.value)}
                        className="w-full bg-input border-2 border-border font-bold"
                        disabled={isGeneratingGameId}
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Min: 0.1 MON | Your balance: {Number.parseFloat(balance).toFixed(4)} MON
                      </p>
                    </div>

                    <Button
                      onClick={handleGenerateGameId}
                      className="minecraft-button w-full text-sm bg-green-600 hover:bg-green-700 font-bold disabled:opacity-50"
                      disabled={isGeneratingGameId || !chainCorrect || !opponent.trim()}
                    >
                      {isGeneratingGameId ? "GENERATING..." : "GENERATE GAME ID"}
                    </Button>
                    <p className="text-xs text-muted-foreground font-bold text-center">
                      Click to create a game ID and send stake to contract
                    </p>
                  </>
                ) : (
                  <>
                    <div className="minecraft-card bg-background p-3 border-2 border-accent space-y-2">
                      <p className="text-xs font-bold text-accent">GAME ID CREATED:</p>
                      <p className="text-sm font-mono font-bold break-all text-green-400 bg-black p-2 border border-green-400 uppercase">
                        {gameId}
                      </p>
                      <Button
                        onClick={handleCopyGameId}
                        className="minecraft-button w-full text-xs bg-green-600 hover:bg-green-700"
                      >
                        {copied ? "COPIED!" : "COPY GAME ID"}
                      </Button>
                      <p className="text-xs text-muted-foreground font-bold">Send this ID to opponent</p>
                    </div>

                    <div className="minecraft-card bg-yellow-900 border-2 border-yellow-400 p-3">
                      <p className="text-xs font-bold text-yellow-200">⏳ WAITING FOR OPPONENT TO ACCEPT...</p>
                      <p className="text-xs text-yellow-100 mt-2">
                        Opponent must accept the challenge to start the game.
                      </p>
                    </div>

                    <Button
                      onClick={handleStartGame}
                      className="minecraft-button w-full text-sm disabled:opacity-50"
                      disabled={isStartingGame || !chainCorrect}
                    >
                      {isStartingGame ? "STARTING..." : "START GAME"}
                    </Button>
                    <p className="text-xs text-muted-foreground font-bold text-center">
                      Click when opponent has accepted
                    </p>
                  </>
                )}
              </div>

              <div className="space-y-4 minecraft-card bg-muted p-4">
                <h3 className="font-bold text-accent text-center">JOIN CHALLENGE</h3>

                <div>
                  <label className="text-sm font-bold mb-2 block text-accent">GAME ID</label>
                  <Input
                    type="text"
                    placeholder="Enter game ID"
                    value={joinGameId}
                    onChange={(e) => setJoinGameId(e.target.value)}
                    className="w-full bg-input border-2 border-border font-mono text-xs"
                    disabled={isJoining}
                  />
                </div>

                <Button
                  onClick={handleJoinGame}
                  className="minecraft-button w-full text-sm"
                  disabled={!joinGameId || isJoining || !chainCorrect}
                >
                  {isJoining ? "JOINING..." : "JOIN"}
                </Button>

                <div className="text-xs font-bold text-muted-foreground space-y-2 border-t-2 border-border pt-2 bg-black p-2">
                  <p className="text-accent">OPPONENT MUST:</p>
                  <p>1. Connect wallet</p>
                  <p>2. Paste GAME ID here</p>
                  <p>3. Click JOIN</p>
                </div>
              </div>
            </div>
          )}

          <div className="pt-4 border-t-2 border-border space-y-2">
            <h3 className="font-bold text-accent">HOW TO PLAY:</h3>
            <ul className="text-xs text-muted-foreground space-y-1 font-bold">
              <li>1. Connect your wallet (required)</li>
              <li>2. Create challenge or join opponent's game</li>
              <li>3. Build structures and hide treasures (5 min)</li>
              <li>4. Hunt opponent's treasures in real-time (5 min)</li>
              <li>5. Winner takes the pot</li>
            </ul>
          </div>
        </Card>
      </div>
    </div>
  )
}
