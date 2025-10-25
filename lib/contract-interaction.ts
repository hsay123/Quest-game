import { ethers } from "ethers"

// Contract ABI - Update this with your deployed contract ABI
const QUEST_GAME_ABI = [
  {
    inputs: [
      { internalType: "string", name: "gameId", type: "string" },
      { internalType: "address", name: "opponent", type: "address" },
    ],
    name: "createChallenge",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [{ internalType: "string", name: "gameId", type: "string" }],
    name: "acceptChallenge",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "string", name: "gameId", type: "string" },
      { internalType: "address", name: "winner", type: "address" },
    ],
    name: "completeChallenge",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "withdrawWinnings",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "string", name: "gameId", type: "string" }],
    name: "getChallenge",
    outputs: [
      {
        components: [
          { internalType: "address", name: "creator", type: "address" },
          { internalType: "address", name: "opponent", type: "address" },
          { internalType: "uint256", name: "stake", type: "uint256" },
          { internalType: "uint256", name: "createdAt", type: "uint256" },
          { internalType: "bool", name: "completed", type: "bool" },
          { internalType: "address", name: "winner", type: "address" },
          { internalType: "string", name: "gameId", type: "string" },
        ],
        internalType: "struct QuestGame.Challenge",
        name: "",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "player", type: "address" }],
    name: "getPlayerBalance",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
]

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_QUEST_GAME_CONTRACT || ""

export async function createChallengeOnChain(gameId: string, opponentAddress: string, stakeAmount: string) {
  try {
    if (!window.ethereum) {
      throw new Error("MetaMask not found")
    }

    if (!ethers.isAddress(opponentAddress)) {
      throw new Error("Invalid opponent address format")
    }

    const provider = new ethers.BrowserProvider(window.ethereum)
    const signer = await provider.getSigner()
    const callerAddress = await signer.getAddress()

    if (opponentAddress.toLowerCase() === callerAddress.toLowerCase()) {
      throw new Error("Cannot challenge yourself")
    }

    const contract = new ethers.Contract(CONTRACT_ADDRESS, QUEST_GAME_ABI, signer)

    console.log(
      "[v0] Creating challenge on-chain with gameId:",
      gameId,
      "opponent:",
      opponentAddress,
      "stake:",
      stakeAmount,
    )

    const tx = await contract.createChallenge(gameId, opponentAddress, {
      value: ethers.parseEther(stakeAmount),
    })

    console.log("[v0] Transaction sent:", tx.hash)
    const receipt = await tx.wait()
    console.log("[v0] Challenge created on-chain:", receipt?.hash)

    if (receipt) {
      console.log("[v0] Verifying game creation on-chain...")
      await new Promise((resolve) => setTimeout(resolve, 2000)) // Wait for blockchain to settle

      try {
        const challenge = await getChallengeDetails(gameId)
        console.log("[v0] Game verified on-chain:", challenge)
      } catch (verifyError) {
        console.warn("[v0] Could not verify game immediately, but transaction was confirmed:", receipt.hash)
      }
    }

    return receipt?.hash
  } catch (error) {
    console.error("[v0] Error creating challenge on-chain:", error)
    throw error
  }
}

export async function acceptChallengeOnChain(gameId: string, stakeAmount: string) {
  try {
    if (!window.ethereum) {
      throw new Error("MetaMask not found")
    }

    const provider = new ethers.BrowserProvider(window.ethereum)
    const signer = await provider.getSigner()
    const contract = new ethers.Contract(CONTRACT_ADDRESS, QUEST_GAME_ABI, signer)

    console.log("[v0] Accepting challenge on-chain with gameId:", gameId, "stake:", stakeAmount)

    try {
      const challenge = await getChallengeDetails(gameId)
      console.log("[v0] Game found on-chain:", challenge)
    } catch (error) {
      console.error("[v0] Game not found on-chain before accepting:", gameId)
      throw new Error(`Game "${gameId}" does not exist on-chain. Make sure the creator has confirmed the transaction.`)
    }

    const tx = await contract.acceptChallenge(gameId, {
      value: ethers.parseEther(stakeAmount),
    })

    console.log("[v0] Transaction sent:", tx.hash)
    const receipt = await tx.wait()
    console.log("[v0] Challenge accepted on-chain:", receipt?.hash)
    return receipt?.hash
  } catch (error) {
    console.error("[v0] Error accepting challenge on-chain:", error)
    throw error
  }
}

export async function completeChallengeOnChain(gameId: string, winnerAddress: string) {
  try {
    if (!window.ethereum) {
      throw new Error("MetaMask not found")
    }

    const provider = new ethers.BrowserProvider(window.ethereum)
    const signer = await provider.getSigner()
    const contract = new ethers.Contract(CONTRACT_ADDRESS, QUEST_GAME_ABI, signer)

    const tx = await contract.completeChallenge(gameId, winnerAddress)
    const receipt = await tx.wait()
    console.log("[v0] Challenge completed on-chain:", receipt?.hash)
    return receipt?.hash
  } catch (error) {
    console.error("[v0] Error completing challenge on-chain:", error)
    throw error
  }
}

export async function withdrawWinningsOnChain() {
  try {
    if (!window.ethereum) {
      throw new Error("MetaMask not found")
    }

    const provider = new ethers.BrowserProvider(window.ethereum)
    const signer = await provider.getSigner()
    const contract = new ethers.Contract(CONTRACT_ADDRESS, QUEST_GAME_ABI, signer)

    const tx = await contract.withdrawWinnings()
    const receipt = await tx.wait()
    console.log("[v0] Winnings withdrawn on-chain:", receipt?.hash)
    return receipt?.hash
  } catch (error) {
    console.error("[v0] Error withdrawing winnings on-chain:", error)
    throw error
  }
}

export async function getChallengeDetails(gameId: string) {
  try {
    if (!window.ethereum) {
      throw new Error("MetaMask not found")
    }

    const provider = new ethers.BrowserProvider(window.ethereum)
    const contract = new ethers.Contract(CONTRACT_ADDRESS, QUEST_GAME_ABI, provider)

    const challenge = await contract.getChallenge(gameId)
    return challenge
  } catch (error) {
    console.error("[v0] Error fetching challenge details:", error)
    throw error
  }
}

export async function getPlayerBalance(playerAddress: string) {
  try {
    if (!window.ethereum) {
      throw new Error("MetaMask not found")
    }

    const provider = new ethers.BrowserProvider(window.ethereum)
    const contract = new ethers.Contract(CONTRACT_ADDRESS, QUEST_GAME_ABI, provider)

    const balance = await contract.getPlayerBalance(playerAddress)
    return ethers.formatEther(balance)
  } catch (error) {
    console.error("[v0] Error fetching player balance:", error)
    throw error
  }
}
