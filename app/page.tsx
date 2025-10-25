"use client"

import { Suspense } from "react"
import GameContainer from "@/components/game-container"

export default function Home() {
  return (
    <main className="w-full h-screen bg-background">
      <Suspense fallback={<div className="w-full h-screen flex items-center justify-center">Loading game...</div>}>
        <GameContainer />
      </Suspense>
    </main>
  )
}
