"use client"

import { useRef } from "react"
import type * as THREE from "three"

interface VoxelCoinProps {
  position: [number, number, number]
  isFound: boolean
}

export default function VoxelCoin({ position, isFound }: VoxelCoinProps) {
  const meshRef = useRef<THREE.Mesh>(null)

  return (
    <mesh ref={meshRef} position={position} rotation={[Math.PI / 2.5, 0, 0]}>
      <cylinderGeometry args={[0.4, 0.4, 0.1, 32]} />
      <meshStandardMaterial
        color={isFound ? "#00FF00" : "#FFD700"}
        metalness={0.9}
        roughness={0.1}
        emissive={isFound ? "#00AA00" : "#FFAA00"}
        emissiveIntensity={0.3}
      />
    </mesh>
  )
}
