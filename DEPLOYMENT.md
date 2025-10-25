# Quest Game - Deployment Guide

## Prerequisites
- Node.js 18+
- Vercel account
- Monad testnet wallet with test tokens

## Local Development

\`\`\`bash
npm install
npm run dev
\`\`\`

Visit `http://localhost:3000` and connect your wallet to Monad testnet.

## Deployment to Vercel

### 1. Push to GitHub
\`\`\`bash
git add .
git commit -m "Initial quest game commit"
git push origin main
\`\`\`

### 2. Deploy to Vercel
\`\`\`bash
vercel
\`\`\`

Or connect your GitHub repo directly at https://vercel.com/new

### 3. Environment Variables
No environment variables required for the frontend. The game uses:
- MetaMask/Web3 wallet for authentication
- Monad testnet RPC endpoint (hardcoded)

## Testing on Monad Testnet

1. Install MetaMask or similar Web3 wallet
2. Add Monad testnet network:
   - Chain ID: 10000
   - RPC URL: https://testnet-rpc.monad.xyz
   - Currency: MONAD
3. Get test tokens from Monad faucet
4. Connect wallet and create challenges

## Smart Contract Integration (Next Steps)

To add on-chain staking and payouts:

1. Deploy challenge contract to Monad testnet
2. Add contract address to environment variables
3. Implement stake escrow in `lib/contract-interaction.ts`
4. Update game results to trigger payout transactions

## Architecture

- **Frontend**: Next.js 16 + React Three Fiber
- **3D Engine**: Three.js voxel rendering
- **Wallet**: MetaMask/Web3 integration
- **Blockchain**: Monad testnet (EVM-compatible)

## Performance Notes

- Voxel grid limited to 30x30 for performance
- Raycasting optimized for real-time interaction
- Canvas rendering at 60 FPS
