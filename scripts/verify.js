const hre = require("hardhat")
const fs = require("fs")

async function main() {
  if (!fs.existsSync("deployment.json")) {
    console.error("❌ deployment.json not found. Deploy contract first.")
    process.exit(1)
  }

  const deployment = JSON.parse(fs.readFileSync("deployment.json", "utf8"))
  const contractAddress = deployment.address

  console.log(`Verifying contract at ${contractAddress}...`)

  try {
    await hre.run("verify:verify", {
      address: contractAddress,
      constructorArguments: [],
    })
    console.log("✅ Contract verified successfully!")
  } catch (error) {
    if (error.message.includes("Already Verified")) {
      console.log("✅ Contract already verified!")
    } else {
      console.error("❌ Verification failed:", error.message)
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
