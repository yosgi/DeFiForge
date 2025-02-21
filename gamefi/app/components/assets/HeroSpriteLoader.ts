// PlayerSpriteLoader.ts

import Phaser from 'phaser';

/**
 * 从指定文件夹加载玩家所有动作的 spritesheet
 * @param scene - 传入当前场景 (this)
 * @param folder - 资源所在文件夹路径 (例如 'assets/player')
 * @param prefix - 给 spritesheet 命名时的前缀 (如 'player' 或 'hero')
 */
export function loadPlayerSpriteSheets(scene: Phaser.Scene,
    folder: string,
    prefix = 'player', {
        width = 69,
        height = 44
    }) {
    const actions = [
        'attack1','attack2','attack3', 'crouch', 'dash', 'dash_attack',
        'death', 'fall', 'hurt',
        'idle', 'jump',  'run', 'slide', 'up_to_fall', 'block'
    ];
    
    actions.forEach(action => {
        scene.load.spritesheet(`${prefix}_${action}`, `${folder}/${action}/${action}.png`, {
            frameWidth: action === "dash_attack" || action=="attack3" ?width + 5 : width,
            frameHeight: height,
        });
    });
}



/**
 * Creates player animations for a Phaser scene.
 * 
 * @param scene - The Phaser scene to create the animations in.
 * @param prefix - The prefix to use for the animation keys (default: 'player').
 */
export function createPlayerAnimations(scene: Phaser.Scene, prefix = 'player') {
    const animations = {
        'idle': { frames: 6, frameRate: 6, repeat: -1 },
        'run': { frames: 8, frameRate: 10, repeat: -1},
        'attack3': { frames: 13, frameRate: 10, repeat: 0 },
        'attack2': { frames: 12, frameRate: 11, repeat: 0 },
        'attack1': { frames: 6, frameRate: 10, repeat: 0 },
        'crouch': { frames: 6, frameRate: 8, repeat: -1 },
        'dash': { frames: 4, frameRate: 10, repeat: 0 },
        'dash_attack': { frames: 10, frameRate: 10, repeat: 0 },
        'death': { frames: 11, frameRate: 6, repeat: 0 },
        'fall': { frames: 3, frameRate: 8, repeat: -1 },
        'hurt': { frames: 4, frameRate: 8, repeat: 0 },
        'jump': { frames: 3, frameRate: 8, repeat: 0 },
        'up_to_fall': { frames: 2, frameRate: 8, repeat: 0 },
        'slide': { frames: 5, frameRate: 10, repeat: 0 },
        'block': { frames: 4, frameRate: 8, repeat: 0 },
    };

    Object.entries(animations).forEach(([key, { frames, frameRate, repeat }]) => {
        scene.anims.create({
            key: `${prefix}-${key}`,
            frames: scene.anims.generateFrameNumbers(`${prefix}_${key}`, { start: 0, end: frames - 1 }),
            frameRate: frameRate,
            repeat: repeat,
        });
    });
}
