# Smart Contract Deployment Guide

## Prerequisites

1. **Node.js** installed (v16 or higher)
2. **MetaMask** wallet with test MON tokens
3. **Private Key** from your MetaMask wallet
4. **Test MON tokens** from the faucet

## Step 1: Get Test MON Tokens

1. Go to https://testnet.monad.xyz/faucet
2. Connect your MetaMask wallet
3. Request test MON tokens
4. Wait for confirmation (usually 1-2 minutes)

## Step 2: Set Up Environment Variables

1. Create a `.env.local` file in the project root
2. Add your private key:
   \`\`\`
   PRIVATE_KEY=your_private_key_here
   MONAD_RPC_URL=https://testnet-rpc.monad.xyz
   MONAD_API_KEY=verifyContract
   \`\`\`

**⚠️ IMPORTANT:** Never commit `.env.local` to version control!

## Step 3: Install Dependencies

\`\`\`bash
npm install
\`\`\`

## Step 4: Deploy the Contract

\`\`\`bash
npx hardhat run scripts/deploy.js --network monad
\`\`\`

You should see output like:
\`\`\`
🚀 Deploying QuestGame contract to Monad Testnet...
Chain ID: 10143
RPC: https://testnet-rpc.monad.xyz

📝 Deploying from account: 0x...
💰 Account balance: X.XX MON

✅ QuestGame deployed successfully!
📍 Contract address: 0x...
🔗 Block Explorer: https://testnet.monadexplorer.com/address/0x...
\`\`\`

## Step 5: Add Contract Address to App

1. Copy the contract address from the deployment output
2. Add it to your `.env.local`:
   \`\`\`
   NEXT_PUBLIC_QUEST_GAME_CONTRACT=0x...
   \`\`\`
3. Restart your development server:
   \`\`\`bash
   npm run dev
   \`\`\`

## Step 6: Test the Contract Integration

1. Open the app in your browser
2. Connect your wallet
3. Create a game with staking
4. The contract should handle the stake on-chain

## Verify Contract on Block Explorer

To verify your contract on the Monad block explorer:

\`\`\`bash
npx hardhat verify --network monad <CONTRACT_ADDRESS>
\`\`\`

## Troubleshooting

### "Insufficient balance" error
- You need test MON tokens to deploy
- Get them from the faucet: https://testnet.monad.xyz/faucet

### "Invalid private key" error
- Make sure your private key is correct (without 0x prefix)
- Check that it's in your `.env.local` file

### "Network error" error
- Verify the RPC URL is correct: https://testnet-rpc.monad.xyz
- Check your internet connection

### Contract not found after deployment
- Wait a few seconds for the transaction to be confirmed
- Check the block explorer to verify deployment

## Contract Functions

### createChallenge(gameId, opponent)
- Creates a new challenge with stake
- Requires: gameId (string), opponent address, stake amount (in MON)

### acceptChallenge(gameId)
- Accepts a challenge
- Requires: gameId (string), matching stake amount

### completeChallenge(gameId, winner)
- Marks game as complete and awards winner
- Requires: gameId (string), winner address
- Only callable by contract owner

### withdrawWinnings()
- Withdraws player's winnings
- No parameters required

### getChallenge(gameId)
- View challenge details
- Returns: Challenge struct with all details

### getPlayerBalance(address)
- Check player's balance
- Returns: Balance in wei

## Network Details

- **Network Name:** Monad Testnet
- **Chain ID:** 10143
- **RPC URL:** https://testnet-rpc.monad.xyz
- **Currency:** MON
- **Block Explorer:** https://testnet.monadexplorer.com
- **Faucet:** https://testnet.monad.xyz/faucet

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Verify all environment variables are set correctly
3. Check the block explorer for transaction details
4. Review the contract code in `contracts/QuestGame.sol`
