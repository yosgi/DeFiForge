// components/PhaserGame.tsx
import React, { useEffect, useRef } from 'react'
import * as Phaser from 'phaser';

// Import the Phaser config you exported
import { config as phaserConfig } from './BattleScene'

const PhaserGame: React.FC = () => {
  const gameRef = useRef<Phaser.Game | null>(null)
  const containerRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    // Ensure we only create the game once
    if (!gameRef.current && containerRef.current) {
      // IMPORTANT: add the parent element to the config
      // so Phaser knows where to create the canvas
      const newConfig: Phaser.Types.Core.GameConfig = {
        ...phaserConfig,
        parent: containerRef.current // attach the Phaser canvas to this div
      }

      // Create the Phaser game
      gameRef.current = new Phaser.Game(newConfig)
    }

    // Cleanup if component unmounts
    return () => {
      if (gameRef.current) {
        gameRef.current.destroy(true)
        gameRef.current = null
      }
    }
  }, [])

  return <div ref={containerRef} style={{ width: 800, height: 400 }} />
}

export default PhaserGame
