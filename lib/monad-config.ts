let isNetworkRequestPending = false

export const MONAD_CONFIG = {
  chainId: "0x27AF", // 10143 in hex
  chainName: "Monad Testnet",
  rpcUrls: ["https://testnet-rpc.monad.xyz"],
  nativeCurrency: {
    name: "Monad",
    symbol: "MON",
    decimals: 18,
  },
  blockExplorerUrls: ["https://testnet.monadexplorer.com"],
}

export const addMonadNetwork = async () => {
  if (isNetworkRequestPending) {
    console.log("[v0] Network request already pending, skipping duplicate request")
    return false
  }

  if (typeof window !== "undefined" && (window as any).ethereum) {
    try {
      isNetworkRequestPending = true
      console.log("[v0] Adding Monad network with config:", MONAD_CONFIG)
      await (window as any).ethereum.request({
        method: "wallet_addEthereumChain",
        params: [MONAD_CONFIG],
      })
      console.log("[v0] Monad network added successfully")
      return true
    } catch (error: any) {
      if (error.code === 4001) {
        console.warn("[v0] User rejected adding Monad network")
        throw new Error("Network addition rejected. Please approve the request to add Monad Testnet to your wallet.")
      } else if (error.code === -32602) {
        // Invalid params
        console.error("[v0] Invalid network parameters:", error)
        throw new Error("Invalid network configuration. Please contact support.")
      } else {
        console.error("[v0] Error adding Monad network:", error)
        throw new Error("Failed to add Monad network. Please try again.")
      }
    } finally {
      isNetworkRequestPending = false
    }
  }
  return false
}

export const switchToMonad = async () => {
  if (isNetworkRequestPending) {
    console.log("[v0] Network request already pending, skipping duplicate request")
    return false
  }

  if (typeof window !== "undefined" && (window as any).ethereum) {
    try {
      isNetworkRequestPending = true
      console.log("[v0] Switching to Monad network (Chain ID: 0x27AF)")
      await (window as any).ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: MONAD_CONFIG.chainId }],
      })
      console.log("[v0] Successfully switched to Monad network")
      return true
    } catch (error: any) {
      if (error.code === 4001) {
        console.warn("[v0] User rejected switching to Monad network")
        throw new Error("Network switch rejected. Please approve the request to switch to Monad Testnet.")
      } else if (error.code === 4902) {
        // Network not added, try to add it
        console.log("[v0] Monad network not found, adding it...")
        return await addMonadNetwork()
      } else {
        console.error("[v0] Error switching to Monad network:", error)
        throw new Error("Failed to switch to Monad network. Please try again.")
      }
    } finally {
      isNetworkRequestPending = false
    }
  }
  return false
}
