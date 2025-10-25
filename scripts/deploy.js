const hre = require("hardhat")
const fs = require("fs")

async function main() {
  console.log("🚀 Deploying QuestGame contract to Monad Testnet...")
  console.log("Chain ID: 10143")
  console.log("RPC: https://testnet-rpc.monad.xyz\n")

  // Get deployer account
  const [deployer] = await hre.ethers.getSigners()
  console.log("📝 Deploying from account:", deployer.address)

  // Get account balance
  const balance = await hre.ethers.provider.getBalance(deployer.address)
  console.log("💰 Account balance:", hre.ethers.formatEther(balance), "MON\n")

  // Deploy contract
  const QuestGame = await hre.ethers.getContractFactory("QuestGame")
  const questGame = await QuestGame.deploy()

  await questGame.waitForDeployment()
  const address = await questGame.getAddress()

  console.log("✅ QuestGame deployed successfully!")
  console.log("📍 Contract address:", address)
  console.log("🔗 Block Explorer: https://testnet.monadexplorer.com/address/" + address)

  // Save deployment info
  const deploymentInfo = {
    contract: "QuestGame",
    address: address,
    network: "monad-testnet",
    chainId: 10143,
    rpc: "https://testnet-rpc.monad.xyz",
    blockExplorer: "https://testnet.monadexplorer.com",
    deployedAt: new Date().toISOString(),
    deployer: deployer.address,
  }

  fs.writeFileSync("deployment.json", JSON.stringify(deploymentInfo, null, 2))
  console.log("\n💾 Deployment info saved to deployment.json")

  console.log("\n📋 Next steps:")
  console.log("1. Copy the contract address above")
  console.log("2. Add to your .env.local:")
  console.log(`   NEXT_PUBLIC_QUEST_GAME_CONTRACT=${address}`)
  console.log("3. Restart your development server")
  console.log("4. Test the contract integration in the app")
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error)
    process.exit(1)
  })
