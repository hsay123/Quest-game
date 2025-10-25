"use client"

import { useRef } from "react"
import type * as THREE from "three"

interface VoxelBlockProps {
  position: [number, number, number]
  blockType: string
  color: string
}

export default function VoxelBlock({ position, blockType, color }: VoxelBlockProps) {
  const meshRef = useRef<THREE.Mesh>(null)

  return (
    <mesh ref={meshRef} position={position}>
      <boxGeometry args={[0.95, 0.95, 0.95]} />
      <meshStandardMaterial
        color={color}
        metalness={blockType === "treasure" ? 0.8 : 0.2}
        roughness={blockType === "treasure" ? 0.2 : 0.8}
      />
    </mesh>
  )
}
