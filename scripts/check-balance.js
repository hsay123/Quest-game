const hre = require("hardhat")

async function main() {
  const [signer] = await hre.ethers.getSigners()
  const balance = await hre.ethers.provider.getBalance(signer.address)

  console.log(`\n📊 Wallet Balance Check`)
  console.log(`Address: ${signer.address}`)
  console.log(`Balance: ${hre.ethers.formatEther(balance)} MONAD\n`)

  if (balance === 0n) {
    console.log("⚠️  Your wallet has no MONAD tokens!")
    console.log("Get test tokens from: https://testnet-faucet.monad.xyz\n")
  } else {
    console.log("✅ You have enough MONAD for deployment!\n")
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
