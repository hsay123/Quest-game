# Quest Game Smart Contract Deployment Guide

## Overview
The QuestGame smart contract manages on-chain staking, challenge creation, and prize distribution for the Quest Game.

## Contract Features
- Create challenges with MONAD stakes
- Accept challenges with matching stakes
- Complete challenges and award winners
- Withdraw winnings
- View challenge details and player balances

## Deployment Steps

### 1. Prerequisites
- Hardhat or Foundry installed
- Monad testnet RPC access
- Test MONAD tokens from faucet

### 2. Deploy Contract

#### Using Hardhat:
\`\`\`bash
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox
npx hardhat init
\`\`\`

Create `hardhat.config.js`:
\`\`\`javascript
module.exports = {
  solidity: "0.8.19",
  networks: {
    monad: {
      url: "https://testnet-rpc.monad.xyz",
      accounts: [process.env.PRIVATE_KEY],
      chainId: 10000,
    },
  },
};
\`\`\`

Deploy script (`scripts/deploy.js`):
\`\`\`javascript
async function main() {
  const QuestGame = await ethers.getContractFactory("QuestGame");
  const questGame = await QuestGame.deploy();
  await questGame.deployed();
  console.log("QuestGame deployed to:", questGame.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
\`\`\`

Run deployment:
\`\`\`bash
npx hardhat run scripts/deploy.js --network monad
\`\`\`

### 3. Update Environment Variables
Add to your `.env.local`:
\`\`\`
NEXT_PUBLIC_QUEST_GAME_CONTRACT=0x... (deployed contract address)
\`\`\`

### 4. Verify Contract (Optional)
\`\`\`bash
npx hardhat verify --network monad 0x... 
\`\`\`

## Contract Interactions

### Create Challenge
\`\`\`typescript
import { createChallengeOnChain } from '@/lib/contract-interaction'

await createChallengeOnChain(
  'game-id-123',
  '0xOpponentAddress',
  '0.1' // MONAD stake
)
\`\`\`

### Accept Challenge
\`\`\`typescript
import { acceptChallengeOnChain } from '@/lib/contract-interaction'

await acceptChallengeOnChain('game-id-123', '0.1')
\`\`\`

### Complete Challenge
\`\`\`typescript
import { completeChallengeOnChain } from '@/lib/contract-interaction'

await completeChallengeOnChain('game-id-123', '0xWinnerAddress')
\`\`\`

### Withdraw Winnings
\`\`\`typescript
import { withdrawWinningsOnChain } from '@/lib/contract-interaction'

await withdrawWinningsOnChain()
\`\`\`

## Testing

### Local Testing with Hardhat
\`\`\`bash
npx hardhat test
\`\`\`

### Testnet Testing
1. Deploy to Monad testnet
2. Get test MONAD from faucet
3. Create challenges through the UI
4. Verify transactions on Monad explorer

## Security Considerations
- Contract uses OpenZeppelin patterns
- Stake escrow prevents double-spending
- Only owner can complete challenges (update to oracle in production)
- Emergency withdrawal for contract owner

## Next Steps
- Integrate with game results screen
- Add oracle for automated challenge completion
- Implement dispute resolution
- Add tournament mode
