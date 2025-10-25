"use client"

import { Canvas } from "@react-three/fiber"
import { PerspectiveCamera, OrbitControls, Grid } from "@react-three/drei"
import VoxelGrid from "./voxel-grid"

interface VoxelEngineProps {
  gamePhase: string
  voxelGrid: Map<string, string>
  setVoxelGrid: (grid: Map<string, string>) => void
  selectedBlockType: string
  treasureLocations: Set<string>
  foundTreasures: Set<string>
  placingTreasure?: boolean
  setTreasureLocations?: (locations: Set<string>) => void
  onTreasureClick?: (location: string) => void
}

export default function VoxelEngine({
  gamePhase,
  voxelGrid,
  setVoxelGrid,
  selectedBlockType,
  treasureLocations,
  foundTreasures,
  placingTreasure = false,
  setTreasureLocations,
  onTreasureClick,
}: VoxelEngineProps) {
  return (
    <div className="flex-1 relative">
      <Canvas camera={{ position: [15, 15, 15], fov: 50 }} onContextMenu={(e) => e.preventDefault()}>
        <PerspectiveCamera makeDefault position={[15, 15, 15]} fov={50} />
        <OrbitControls enableDamping dampingFactor={0.05} autoRotate={gamePhase === "lobby"} autoRotateSpeed={2} />

        <ambientLight intensity={0.6} />
        <directionalLight position={[10, 20, 10]} intensity={0.8} />

        <Grid args={[30, 30]} cellSize={1} cellColor="#6f7280" sectionSize={5} sectionColor="#1f2937" />

        <VoxelGrid
          voxelGrid={voxelGrid}
          setVoxelGrid={setVoxelGrid}
          gamePhase={gamePhase}
          selectedBlockType={selectedBlockType}
          treasureLocations={treasureLocations}
          foundTreasures={foundTreasures}
          placingTreasure={placingTreasure}
          setTreasureLocations={setTreasureLocations}
          onTreasureClick={onTreasureClick}
        />
      </Canvas>
    </div>
  )
}
