"use client"

import { useRef, useEffect } from "react"
import { useThree } from "@react-three/fiber"
import * as THREE from "three"
import VoxelBlock from "./voxel-block"
import VoxelCoin from "./voxel-coin"

interface VoxelGridProps {
  voxelGrid: Map<string, string>
  setVoxelGrid: (grid: Map<string, string>) => void
  gamePhase: string
  selectedBlockType: string
  treasureLocations: Set<string>
  foundTreasures: Set<string>
  placingTreasure?: boolean
  setTreasureLocations?: (locations: Set<string>) => void
  onTreasureClick?: (location: string) => void
}

const BLOCK_COLORS: Record<string, string> = {
  stone: "#808080",
  dirt: "#8B7355",
  wood: "#654321",
  sand: "#F4A460",
  grass: "#228B22",
  cobblestone: "#696969",
  treasure: "#FFD700",
  found: "#00FF00",
}

export default function VoxelGrid({
  voxelGrid,
  setVoxelGrid,
  gamePhase,
  selectedBlockType,
  treasureLocations,
  foundTreasures,
  placingTreasure = false,
  setTreasureLocations,
  onTreasureClick,
}: VoxelGridProps) {
  const { camera, raycaster, mouse, scene } = useThree()
  const gridRef = useRef<THREE.Group>(null)
  const blocksRef = useRef<THREE.Mesh[]>([])

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (gamePhase !== "building" && gamePhase !== "hunting") return

      // Calculate normalized mouse coordinates
      const rect = (event.target as HTMLElement).getBoundingClientRect()
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1

      raycaster.setFromCamera(mouse, camera)

      // Create a ground plane at y = -0.5 (below the grid)
      const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0.5)
      const intersection = new THREE.Vector3()
      raycaster.ray.intersectPlane(plane, intersection)

      const x = Math.round(intersection.x)
      const z = Math.round(intersection.z)

      // Find the highest block at this x,z position
      let maxY = -1
      voxelGrid.forEach((_, key) => {
        const [bx, by, bz] = key.split(",").map(Number)
        if (bx === x && bz === z && by > maxY) {
          maxY = by
        }
      })

      // Place new block on top of existing blocks, or at y=0 if no blocks exist
      const y = maxY + 1
      const key = `${x},${y},${z}`
      const blockAtMaxY = `${x},${maxY},${z}`

      if (gamePhase === "hunting" && event.button === 0) {
        // Check if clicking on a treasure location
        if (treasureLocations.has(blockAtMaxY) && !foundTreasures.has(blockAtMaxY)) {
          onTreasureClick?.(blockAtMaxY)
          console.log("[v0] Treasure clicked at:", blockAtMaxY)
        }
        return
      }

      if (placingTreasure && event.button === 0) {
        const treasureKey = voxelGrid.has(blockAtMaxY) ? blockAtMaxY : key
        if (voxelGrid.has(treasureKey)) {
          const newTreasures = new Set(treasureLocations)
          if (!newTreasures.has(treasureKey)) {
            newTreasures.add(treasureKey)
            setTreasureLocations?.(newTreasures)
            console.log("[v0] Treasure placed at:", treasureKey)
          }
        }
        return
      }

      if (gamePhase === "building") {
        if (event.button === 0) {
          // Left click: add block
          const newGrid = new Map(voxelGrid)
          newGrid.set(key, selectedBlockType)
          setVoxelGrid(newGrid)
        } else if (event.button === 2) {
          // Right click: remove topmost block
          const newGrid = new Map(voxelGrid)
          let maxYToDelete = -1
          let keyToDelete = ""

          voxelGrid.forEach((_, gridKey) => {
            const [bx, by, bz] = gridKey.split(",").map(Number)
            if (bx === x && bz === z && by > maxYToDelete) {
              maxYToDelete = by
              keyToDelete = gridKey
            }
          })

          if (keyToDelete) {
            newGrid.delete(keyToDelete)
          }
          setVoxelGrid(newGrid)
        }
      }
    }

    const canvas = document.querySelector("canvas")
    if (canvas) {
      canvas.addEventListener("click", handleClick)
      canvas.addEventListener("contextmenu", (e) => {
        e.preventDefault()
        handleClick(e as any)
      })

      return () => {
        canvas.removeEventListener("click", handleClick)
        canvas.removeEventListener("contextmenu", handleClick as any)
      }
    }
  }, [
    voxelGrid,
    setVoxelGrid,
    gamePhase,
    selectedBlockType,
    camera,
    raycaster,
    mouse,
    placingTreasure,
    treasureLocations,
    foundTreasures,
    setTreasureLocations,
    onTreasureClick,
  ])

  return (
    <group ref={gridRef}>
      {Array.from(voxelGrid.entries()).map(([key, blockType]) => {
        const [x, y, z] = key.split(",").map(Number)
        const isTreasure = treasureLocations.has(key)
        const isFound = foundTreasures.has(key)

        let displayType = blockType
        let displayColor = BLOCK_COLORS[blockType] || "#808080"

        if (isFound) {
          displayType = "found"
          displayColor = BLOCK_COLORS.found
        } else if (isTreasure && gamePhase === "building") {
          displayType = "treasure"
          displayColor = BLOCK_COLORS.treasure
        } else if (isTreasure && gamePhase === "hunting") {
          displayType = "treasure"
          displayColor = BLOCK_COLORS.treasure
        }

        if (isTreasure) {
          return <VoxelCoin key={key} position={[x, y + 0.5, z]} isFound={isFound} />
        }

        return <VoxelBlock key={key} position={[x, y, z]} blockType={displayType} color={displayColor} />
      })}
    </group>
  )
}
