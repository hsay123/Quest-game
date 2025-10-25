import { ethers } from "ethers"

export async function getWeb3Provider() {
  if (!window.ethereum) {
    throw new Error("MetaMask not installed")
  }
  return new ethers.BrowserProvider(window.ethereum)
}

export async function getSigner() {
  const provider = await getWeb3Provider()
  return await provider.getSigner()
}

export async function getCurrentAccount(): Promise<string> {
  const provider = await getWeb3Provider()
  const signer = await provider.getSigner()
  return await signer.getAddress()
}

export async function sendTransaction(to: string, value: string, data?: string) {
  const signer = await getSigner()
  const tx = await signer.sendTransaction({
    to,
    value: ethers.parseEther(value),
    data: data || "0x",
  })
  const receipt = await tx.wait()
  return receipt?.hash
}

export async function getBalance(address: string): Promise<string> {
  const provider = await getWeb3Provider()
  const balance = await provider.getBalance(address)
  return ethers.formatEther(balance)
}
