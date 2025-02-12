import Phaser from 'phaser';
import { PlayerController } from './controllers/PlayerController';
import { loadPlayerSpriteSheets, createPlayerAnimations } from './assets/PlayerSpriteLoader';

// 如果你仍有需要 hp 字段，可定义
interface SpriteWithHP extends Phaser.Physics.Arcade.Sprite {
  hp: number;
}

export class BattleScene extends Phaser.Scene {
  private playerCtrl!: PlayerController;
  private monsterCtrl!: PlayerController;

  private playerSprite!: SpriteWithHP;
  private monsterSprite!: SpriteWithHP;

  private playerHpText!: Phaser.GameObjects.Text;
  private monsterHpText!: Phaser.GameObjects.Text;

  constructor() {
    super({ key: 'BattleScene' });
  }

  public preload(): void {
    // 背景 & 地面
    this.load.image('background', 'assets/background.png');
    this.load.image('ground', 'assets/ground.png');

    // 分别加载“player”资源 & “monster”资源
    loadPlayerSpriteSheets(this, 'assets/hero', 'hero', { width: 64, height: 44 });
    // loadPlayerSpriteSheets(this, 'assets/monster', 'monster', { width: 128, height: 128 });
  }

  public create(): void {
    // 背景
    const bg = this.add.image(0, 0, 'background').setOrigin(0, 0);
    bg.setScale(800 / bg.width, 400 / bg.height);
    // 地面
    const ground = this.physics.add.staticGroup();
    ground.create(400, 390, 'ground').setScale(2).refreshBody();
  
    // 创建动画 (player / monster)
    createPlayerAnimations(this, 'hero');
    // createPlayerAnimations(this, 'monster');

    // ============ 创建玩家 ============
    // 1) 用 PlayerController, 传入初始纹理 (如 'player_idle')
    this.playerCtrl = new PlayerController(this, 100, 300, 'hero_idle');
    this.playerSprite = this.playerCtrl.sprite as SpriteWithHP;
    this.playerSprite.setScale(1.5);
    this.playerSprite.hp = 100;
    this.playerSprite.setCollideWorldBounds(true);
    this.physics.add.collider(this.playerSprite, ground);
    // HP 文本
    this.playerHpText = this.add.text(20, 20, `PLAYER HP: ${this.playerSprite.hp}`, {
      fontSize: '16px',
      color: '#ffffff'
    });

    // ============ 创建怪物 ============
    // 2) 再来一个 PlayerController / 或 AIController
    //    并给它用“monster_idle”作为纹理
    // this.monsterCtrl = new PlayerController(this, 600, 300, 'monster_idle');
    // this.monsterSprite = this.monsterCtrl.sprite as SpriteWithHP;
    // this.monsterSprite.hp = 100;
    // this.monsterSprite.setCollideWorldBounds(true);
    // this.physics.add.collider(this.monsterSprite, ground);

    // // HP 文本
    // this.monsterHpText = this.add.text(600, 20, `MONSTER HP: ${this.monsterSprite.hp}`, {
    //   fontSize: '16px',
    //   color: '#ffffff'
    // });

    // 播放 Idle 动画
    this.playerSprite.play('hero-idle');
    // this.monsterSprite.play('monster-idle');
  }

  public update(time: number, delta: number): void {
    // 更新玩家
    this.playerCtrl.update(time, delta);
    // 更新怪物
    // this.monsterCtrl.update(time, delta);

    // 刷新 HP 文本
    this.playerHpText.setText(`PLAYER HP: ${this.playerSprite.hp}`);
    // this.monsterHpText.setText(`MONSTER HP: ${this.monsterSprite.hp}`);

    // 如果你需要碰撞检测(攻击命中等)，可以在这里
    // this.checkAttackCollision(time);
  }

  // 示例：如果要做攻击命中检测，就这么写
  /*
  private checkAttackCollision(time: number) {
    // e.g. use distance or overlap to see if monster is hit
    // If (playerCtrl is attacking && distance < 50) => monsterSprite.hp -= 10
    // ...
  }
  */
}

// Phaser 游戏配置
export const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 800,
  height: 400,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: 1400 },
      debug: true
    }
  },
  scene: [BattleScene]
};
