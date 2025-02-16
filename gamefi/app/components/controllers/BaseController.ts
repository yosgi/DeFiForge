// BaseController.ts
import Phaser from 'phaser';
import { CharState } from './CharState';
import { PlayerConfig } from './Player/PlayerController';
import { PlayerStateManager } from './PlayerStateManager';
import { PlayerAnimationManager } from './PlayerAnimationManager';
import { PlayerMovement } from './PlayerMovement';
import { PlayerJump } from './PlayerJump';
import { PlayerAttack } from './PlayerAttack';

export abstract class BaseController {
  public sprite: Phaser.Physics.Arcade.Sprite;
  public hp: number;
  public isDead: boolean = false;
  public isInvincible: boolean = false;

  public state: CharState = CharState.Idle;
  public scene: Phaser.Scene;
  public animPrefix: string;
  public debug: boolean;

  // 速度与物理参数
  public runSpeed: number;
  public dashSpeed: number;
  public slideSpeed: number;
  public jumpVelocity: number;
  public dashDuration: number;
  public doubleTapThreshold: number;
  public slideDuration: number;
  public slideCooldown: number;
  public slideInvincibleDuration: number;
  public dashAttackInitialSpeed: number;
  public dashAttackDeceleration: number;

  // 定时器变量
  public dashEndTime: number = 0;
  public slideEndTime: number = 0;
  public lastSlideTime: number = 0;

  // 跳跃相关
  public doubleJumpUsed: boolean = false;
  public coyoteTime: number;
  public jumpCutMultiplier: number;
  public lastGroundedTime: number = 0;
  public runStartTime: number = 0;
  public isAirRun: boolean = false;
  public airRunEligible: boolean = false;
  public airRunEligibleTime: number = 0;

  // 输入相关（将输入属性声明为可选）
  public cursors?: Phaser.Types.Input.Keyboard.CursorKeys;
  public attackKey?: Phaser.Input.Keyboard.Key;
  public blockKey?: Phaser.Input.Keyboard.Key;
  public slideKey?: Phaser.Input.Keyboard.Key;
  public lastDirection: 'left' | 'right' = 'right';
  public lastTap: { left: number; right: number } = { left: 0, right: 0 };

  // 攻击连击系统
  public nextAttackRequested: boolean = false;
  public attackComboStep: number = 0;
  public normalAttackAnimations: string[];
  public dashAttackAnimation: string;

  // 状态与动画管理模块
  public stateManager: PlayerStateManager;
  public animationManager: PlayerAnimationManager;

  // 公共子模块：移动、跳跃、攻击
  public movement!: PlayerMovement;
  public jump!: PlayerJump;
  public attack!: PlayerAttack;

  // 输入缓冲（用于存储命令，在当前动作结束后执行）
  public bufferedAction: (() => void) | null = null;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    texture: string,
    config?: PlayerConfig
  ) {
    this.scene = scene;
    this.animPrefix = config?.animPrefix ?? 'hero';
    this.hp = config?.hp ?? 100;
    this.debug = config?.debug ?? false;

    // 初始化物理参数
    this.runSpeed = config?.runSpeed ?? 150;
    this.dashSpeed = config?.dashSpeed ?? 120;
    this.slideSpeed = config?.slideSpeed ?? 300;
    this.jumpVelocity = config?.jumpVelocity ?? -500;
    this.dashDuration = config?.dashDuration ?? 250;
    this.doubleTapThreshold = config?.doubleTapThreshold ?? 300;
    this.slideDuration = config?.slideDuration ?? 500;
    this.slideCooldown = config?.slideCooldown ?? 2000;
    this.slideInvincibleDuration = config?.slideInvincibleDuration ?? 300;
    this.coyoteTime = config?.coyoteTime ?? 150;
    this.jumpCutMultiplier = config?.jumpCutMultiplier ?? 0.9;
    this.dashAttackInitialSpeed = config?.dashAttackInitialSpeed ?? 700;
    this.dashAttackDeceleration = config?.dashAttackDeceleration ?? 0.95;

    this.lastGroundedTime = 0;

    // 创建精灵并设置属性
    this.sprite = scene.physics.add.sprite(x, y, texture);
    this.sprite.setCollideWorldBounds(true);
    const scaleFactor = config?.scaleFactor ?? 2;
    this.sprite.setScale(scaleFactor);

    // 设置攻击动画键
    this.normalAttackAnimations = [
      `${this.animPrefix}-attack1`,
      `${this.animPrefix}-attack2`,
      `${this.animPrefix}-attack3`
    ];
    this.dashAttackAnimation = `${this.animPrefix}-dash_attack`;

    // 初始化状态与动画管理模块
    this.animationManager = new PlayerAnimationManager(this);
    this.stateManager = new PlayerStateManager(this, this.animationManager);
    this.movement = new PlayerMovement(this);
    this.jump = new PlayerJump(this);
    this.attack = new PlayerAttack(this);
  }

  public update(time: number, delta: number): void {
    if (this.bufferedAction) {
      const action = this.bufferedAction;
      this.bufferedAction = null;
      action();
    }
  }

  public playAnimationIfNotPlaying(animKey: string): void {
    if (this.sprite.anims.currentAnim && this.sprite.anims.currentAnim.key === animKey) return;
    this.sprite.play(animKey, true);
    if (this.debug) {
      console.debug(`Playing animation: ${animKey}`);
    }
  }



  public isJumping(): boolean {
    return (
      this.state === CharState.Jump ||
      this.state === CharState.UpToFall ||
      this.state === CharState.Fall ||
      this.state === CharState.AirRun
    );
  }
  public isAttacking(): boolean {
    return (
      this.state === CharState.Attack1 ||
      this.state === CharState.Attack2 ||
      this.state === CharState.Attack3 ||
      this.state === CharState.DashAttack
    );
  }

  /**
   * 当角色受到攻击时调用，执行受击反馈
   * @param damage 伤害值
   * @param hitDirection 击退方向（'left' 或 'right'）
   */
  public onHit(damage: number, hitDirection: 'left' | 'right'): void {
    // 如果已经在受击状态，则不重复扣血
    if (this.state === CharState.Hurt) return;
    
    this.hp -= damage;
    (this.sprite as any).hp = Math.floor(this.hp);
  
    if (this.hp <= 0) {
      this.die();
      return;
    }
    
    this.stateManager.changeState(CharState.Hurt);
    this.playAnimationIfNotPlaying(`${this.animPrefix}-hurt`);
  
    const knockbackSpeed = 200;
    if (hitDirection === 'left') {
      this.sprite.setVelocityX(-knockbackSpeed);
    } else {
      this.sprite.setVelocityX(knockbackSpeed);
    }
  
    this.sprite.setTint(0xff0000);
    this.scene.time.delayedCall(200, () => {
      this.sprite.clearTint();
    });
  }
  

  /**
   * 当血量耗尽时调用，处理角色死亡
   */
  public die(): void {
    this.stateManager.changeState(CharState.Death);
    this.playAnimationIfNotPlaying(`${this.animPrefix}-death`);
    // 禁用碰撞、输入、动作更新等
    this.isDead = true;
    this.sprite.setVelocity(0);
    // 这里可以进一步处理死亡后的逻辑（例如重启关卡）
  }
}
