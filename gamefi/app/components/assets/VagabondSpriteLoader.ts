// AILoader.ts
import Phaser from 'phaser';

export function loadVagabondMaterials(scene: Phaser.Scene, folder: string, prefix: string, {
  width = 64,
  height = 64,
}) {
  const actions = [
    'attack1', 'attack2', 'block', 'dash', 'death', 'hurt',
    'idle', 'jump', 'jump-attack', 'jump-flip', 'run'
  ];
  
  actions.forEach(action => {
    scene.load.spritesheet(`${prefix}_${action}`, `${folder}/${action}/${action}.png`, {
      frameWidth: width,
      frameHeight: height,
    });
  });
}


export function createVagabondAnimations(scene: Phaser.Scene, prefix: string) {
  const anims = {
    'idle': { frames: 6, frameRate: 6, repeat: -1 },
    'run': { frames: 8, frameRate: 10, repeat: -1 },
    'attack1': { frames: 6, frameRate: 12, repeat: 0 },
    'attack2': { frames: 6, frameRate: 12, repeat: 0 },
    'block': { frames: 4, frameRate: 8, repeat: 0 },
    'dash': { frames: 5, frameRate: 10, repeat: 0 },
    'death': { frames: 7, frameRate: 8, repeat: 0 },
    'hurt': { frames: 4, frameRate: 8, repeat: 0 },
    'jump': { frames: 3, frameRate: 8, repeat: 0 },
    'jump-attack': { frames: 6, frameRate: 12, repeat: 0 },
    'jump-flip': { frames: 6, frameRate: 12, repeat: 0 }
  };

  Object.entries(anims).forEach(([key, { frames, frameRate, repeat }]) => {
    scene.anims.create({
      key: `${prefix}-${key}`,
      frames: scene.anims.generateFrameNumbers(`${prefix}_${key}`, { start: 0, end: frames - 1 }),
      frameRate,
      repeat
    });
  });
}
