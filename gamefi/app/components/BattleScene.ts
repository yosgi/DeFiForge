import Phaser from 'phaser';
import { PlayerController } from './controllers/Player/PlayerController';
import { loadPlayerSpriteSheets, createPlayerAnimations } from './assets/HeroSpriteLoader';
import { loadVagabondMaterials , createVagabondAnimations } from './assets/VagabondSpriteLoader';
import { AIController } from './controllers/AI/AIController';
import { CharState } from './controllers/CharState';

// 如果你仍有需要 hp 字段，可定义
interface SpriteWithHP extends Phaser.Physics.Arcade.Sprite {
  hp: number;
}

export class BattleScene extends Phaser.Scene {
  private playerCtrl!: PlayerController;
  private monsterCtrl!: AIController;

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
    loadVagabondMaterials(this, 'assets/vagabond', 'AI', { width: 64, height: 64 });
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
    createVagabondAnimations(this, 'AI');

    // ============ 创建玩家 ============
    // 1) 用 PlayerController, 传入初始纹理 
    this.playerCtrl = new PlayerController(this, 100, 300, 'hero_idle');
    this.playerSprite = this.playerCtrl.sprite as SpriteWithHP;
    this.playerSprite.setScale(1);
    this.playerSprite.hp = 100;
    this.playerSprite.setCollideWorldBounds(true);
    this.physics.add.collider(this.playerSprite, ground);
    (window as any).playerSprite = this.playerSprite;
    // HP 文本
    this.playerHpText = this.add.text(20, 20, `PLAYER HP: ${this.playerSprite.hp}`, {
      fontSize: '16px',
      color: '#ffffff'
    });

    // ============ 创建怪物 ============
     // ============ 创建对手（怪物/AI） ============
     this.monsterCtrl = new AIController(this, 600, 300, 'AI_idle', {
      hp: 100,
      scaleFactor: 1.5,
      debug: true,
      // 可传入 AI 专用参数，如 dashAttackInitialSpeed、dashAttackDeceleration 等
      dashAttackInitialSpeed: 700,
      dashAttackDeceleration: 0.95,
      animPrefix: 'AI',
    });
    this.monsterSprite = this.monsterCtrl.sprite as SpriteWithHP;
    this.monsterSprite.hp = 100;
    this.monsterSprite.setScale(1.5);
    this.monsterSprite.setCollideWorldBounds(true);
    this.physics.add.collider(this.monsterSprite, ground);

    this.monsterHpText = this.add.text(600, 20, `MONSTER HP: ${this.monsterSprite.hp}`, {
      fontSize: '16px',
      color: '#ffffff'
    });

    // 播放 Idle 动画
    this.playerSprite.play('hero-idle');
    this.monsterSprite.play('AI-idle');
  }

  public update(time: number, delta: number): void {
    // 更新玩家
    this.playerCtrl.update(time, delta);
    // 更新怪物
    this.monsterCtrl.update(time, delta);

    // 刷新 HP 文本
    this.playerHpText.setText(`PLAYER HP: ${this.playerSprite.hp}`);
    this.monsterHpText.setText(`MONSTER HP: ${this.monsterSprite.hp}`);

    // 如果你需要碰撞检测(攻击命中等)，可以在这里
    this.checkAttackCollision();
  }



  private checkAttackCollision(): void {
    // 如果玩家正在攻击
    const attackStates = [
      CharState.Attack1,
      CharState.Attack2,
      CharState.Attack3,
      CharState.DashAttack
    ];
    if (attackStates.includes(this.playerCtrl.state)) {
      // 使用 Phaser.Physics.Arcade.overlap 检测玩家与怪物是否重叠
      if (this.physics.overlap(this.playerSprite, this.monsterSprite)) {
        // 根据双方位置确定击退方向
        const hitDirection = this.playerSprite.x < this.monsterSprite.x ? 'right' : 'left';
        // 调用 AI 角色的 onHit 方法，减少一定伤害（例如10）
        this.monsterCtrl.onHit(10 / 100, hitDirection);
      }
    }
    // 
    
  }

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
      debug: false
    }
  },
  scene: [BattleScene]
};
