const hre = require("hardhat")

async function main() {
  console.log("Testing QuestGame contract...\n")

  // Get contract address from deployment.json
  const fs = require("fs")
  if (!fs.existsSync("deployment.json")) {
    console.error("❌ deployment.json not found. Deploy contract first.")
    process.exit(1)
  }

  const deployment = JSON.parse(fs.readFileSync("deployment.json", "utf8"))
  const contractAddress = deployment.address

  console.log(`📋 Testing contract at: ${contractAddress}\n`)

  // Get contract instance
  const QuestGame = await hre.ethers.getContractFactory("QuestGame")
  const questGame = QuestGame.attach(contractAddress)

  // Get signer
  const [signer] = await hre.ethers.getSigners()
  console.log(`👤 Signer address: ${signer.address}\n`)

  try {
    // Test 1: Create a challenge
    console.log("Test 1: Creating a challenge...")
    const gameId = "test-game-" + Date.now()
    const stakeAmount = hre.ethers.parseEther("0.01") // 0.01 MONAD

    const createTx = await questGame.createChallenge(gameId, signer.address, { value: stakeAmount })
    await createTx.wait()
    console.log("✅ Challenge created successfully\n")

    // Test 2: Get challenge details
    console.log("Test 2: Retrieving challenge details...")
    const challenge = await questGame.challenges(gameId)
    console.log("Challenge details:")
    console.log(`  - Creator: ${challenge.creator}`)
    console.log(`  - Opponent: ${challenge.opponent}`)
    console.log(`  - Stake: ${hre.ethers.formatEther(challenge.stake)} MONAD`)
    console.log(`  - Status: ${challenge.status}\n`)

    // Test 3: Get player balance
    console.log("Test 3: Checking player balance...")
    const balance = await questGame.playerBalances(signer.address)
    console.log(`✅ Player balance: ${hre.ethers.formatEther(balance)} MONAD\n`)

    console.log("✅ All tests passed!")
  } catch (error) {
    console.error("❌ Test failed:", error.message)
    process.exit(1)
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
