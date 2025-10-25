# Quest Game Smart Contract Deployment Guide

## Quick Start

### Step 1: Install Dependencies
\`\`\`bash
npm install
\`\`\`

The project already has Hardhat and ethers.js installed.

### Step 2: Set Up Environment Variables

Create a `.env.local` file in your project root:

\`\`\`env
# Monad Testnet RPC
MONAD_RPC_URL=https://testnet-rpc.monad.xyz

# Your wallet private key (from MetaMask or other wallet)
# ⚠️ NEVER commit this to git!
PRIVATE_KEY=your_private_key_here

# Optional: For contract verification
MONAD_API_KEY=verifyContract
\`\`\`

**How to get your PRIVATE_KEY:**
1. Open MetaMask
2. Click the three dots menu → Account details
3. Click "Export Private Key"
4. Copy and paste into `.env.local`

### Step 3: Get Test MONAD Tokens

1. Go to [Monad Testnet Faucet](https://testnet-faucet.monad.xyz)
2. Connect your wallet
3. Request test MONAD tokens

### Step 4: Deploy the Contract

\`\`\`bash
npx hardhat run scripts/deploy.js --network monad
\`\`\`

You'll see output like:
\`\`\`
✅ QuestGame deployed to: 0x1234567890123456789012345678901234567890

📝 Add this to your .env.local:
NEXT_PUBLIC_QUEST_GAME_CONTRACT=0x1234567890123456789012345678901234567890

💾 Deployment info saved to deployment.json
\`\`\`

### Step 5: Update Environment Variables

Copy the contract address from the deployment output and add it to your `.env.local`:

\`\`\`env
NEXT_PUBLIC_QUEST_GAME_CONTRACT=0x1234567890123456789012345678901234567890
\`\`\`

### Step 6: Verify Contract (Optional)

\`\`\`bash
npx hardhat run scripts/verify.js --network monad
\`\`\`

### Step 7: Test the Integration

1. Start your dev server: `npm run dev`
2. Open http://localhost:3000
3. Connect your wallet
4. Create a challenge with MONAD stake
5. Check the transaction on [Monad Explorer](https://testnet-explorer.monad.xyz)

## Troubleshooting

### "User rejected the request"
- Make sure you approve the transaction in MetaMask
- Check that you have enough test MONAD tokens

### "Contract not found at address"
- Verify the contract address is correct in `.env.local`
- Make sure you're on the Monad testnet network in MetaMask

### "Insufficient funds"
- Get more test MONAD from the faucet
- Each transaction requires gas fees

### "Private key error"
- Make sure your private key is correct and starts with `0x`
- Don't include quotes around the private key in `.env.local`

## Contract Functions

### Create Challenge
\`\`\`typescript
const tx = await questGame.createChallenge(
  gameId,           // string: unique game ID
  opponentAddress,  // address: opponent's wallet
  { value: stakeAmount } // MONAD stake
);
\`\`\`

### Accept Challenge
\`\`\`typescript
const tx = await questGame.acceptChallenge(
  gameId,
  { value: stakeAmount } // must match creator's stake
);
\`\`\`

### Complete Challenge
\`\`\`typescript
const tx = await questGame.completeChallenge(
  gameId,
  winnerAddress // address of the winner
);
\`\`\`

### Withdraw Winnings
\`\`\`typescript
const tx = await questGame.withdraw();
\`\`\`

## Next Steps

1. **Integrate with Game Results**: Update `components/results-screen.tsx` to call contract functions
2. **Add Oracle**: Use Chainlink or similar for automated challenge completion
3. **Implement Disputes**: Add dispute resolution mechanism
4. **Go Mainnet**: Deploy to Monad mainnet when ready

## Security Notes

- Never commit `.env.local` to git
- Use a separate wallet for testing
- Start with small stakes for testing
- Audit the contract before mainnet deployment

## Support

- [Monad Docs](https://docs.monad.xyz)
- [Hardhat Docs](https://hardhat.org/docs)
- [ethers.js Docs](https://docs.ethers.org)
