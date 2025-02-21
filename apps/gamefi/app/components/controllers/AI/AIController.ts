// AIController.ts
import Phaser from 'phaser';
import { BaseController } from '../BaseController';
import { AIInput } from './AIInput';
import { CharState } from '../CharState';
import { BehaviorManager } from './BehaviorManager';

export class AIController extends BaseController {
  // AI 专用：虚拟输入
  public aiInput: AIInput = { left: false, right: false, up: false, attack: false, slide: false };
  // AI 难度级别（1: 低，2: 中，3: 高）
  public difficultyLevel: number = 1;

  // 跳跃冷却（避免连续跳跃）
  public lastJumpTime: number = 0;
  public jumpCooldown: number = 2500; // 毫秒

  // 决策更新间隔与反应延迟
  private lastDecisionTime: number = 0;
  private decisionInterval: number = 500; // 每 150ms 更新一次决策
  private reactionDelay: number = 0; // 随机反应延迟（毫秒）
  private lastReactionTime: number = 0;

  // 动作锁定，确保一旦决策执行后在一段时间内不更改
  private actionLockUntil: number = 0;
  private defaultActionLock: number = 300; // 300ms 内不再更新动作

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    texture: string,
    config?: any
  ) {
    super(scene, x, y, texture, config);
    this.difficultyLevel = this.calculateDifficulty();
  }

  private calculateDifficulty(): number {
    const winCount = window['playerWinCount'] || 0;
    if (winCount < 3) return 1;
    if (winCount < 6) return 2;
    return 3;
  }

  /**
   * 更新 AI 决策，生成虚拟输入（AIInput）
   * 采用 Utility 模型，根据双方距离、玩家行为数据、AI 难度及历史决策惯性，
   * 在每个决策周期内更新一次输入，并锁定该决策一段时间，防止频繁切换。
   */
  public updateAIDecision(time: number): void {
    // 如果当前处于动作锁定期，则不更新决策
    if (time < this.actionLockUntil) {
      return;
    }
    // 只在决策间隔到期后更新
    if (time - this.lastDecisionTime < this.decisionInterval) {
      return;
    }
    this.lastDecisionTime = time;

    // 模拟反应延迟
    if (time - this.lastReactionTime < this.reactionDelay) {
      return;
    }
    // 每次更新决策时，设置一个随机反应延迟（50-150ms）
    this.reactionDelay = 50 + Math.random() * 100;
    this.lastReactionTime = time;

    // 获取玩家精灵（全局存储，或从 GameManager 中获取）
    const playerSprite: Phaser.Physics.Arcade.Sprite = window['playerSprite'];
    let distance = 300;
    if (playerSprite) {
      distance = Math.abs(this.sprite.x - playerSprite.x);
    }

    // 获取玩家行为统计数据
    const profile = BehaviorManager.getInstance().profile;

    // 计算各动作基础效用（示例逻辑）
    let attackUtility = 0;
    let defendUtility = 0;
    let jumpUtility = 0;
    let dashUtility = 0;
    let chaseUtility = 0;

    if (distance < 100) {
      attackUtility = 1.0;
      defendUtility = 0.5;
      jumpUtility = 0.2;
      dashUtility = 0.3;
      chaseUtility = 0.1;
    } else if (distance < 300) {
      attackUtility = 0.7;
      defendUtility = 0.4;
      jumpUtility = 0.3;
      dashUtility = 0.4;
      chaseUtility = 0.6;
    } else {
      attackUtility = 0.3;
      defendUtility = 0.2;
      jumpUtility = 0.4;
      dashUtility = 0.5;
      chaseUtility = 1.0;
    }

    // 根据玩家行为微调：如果玩家频繁使用 dashAttack，则提高防御效用
    if (profile.dashAttackCount / (profile.normalAttackCount + 1) > 0.5) {
      defendUtility += 0.3;
    }

    // 难度放大：难度越高攻击和追击效用越高
    attackUtility *= this.difficultyLevel;
    chaseUtility *= this.difficultyLevel;

    // 加入一定惯性：如果上次决策保持同一移动方向，则增加追击效用
    if (this.aiInput.left || this.aiInput.right) {
      chaseUtility += 0.2;
    }

    // 加权随机选择动作
    const totalUtility = attackUtility + defendUtility + jumpUtility + dashUtility + chaseUtility;
    const rand = Math.random() * totalUtility;
    let selectedAction: 'attack' | 'defend' | 'jump' | 'dash' | 'chase' = 'attack';
    if (rand < attackUtility) {
      selectedAction = 'attack';
    } else if (rand < attackUtility + defendUtility) {
      selectedAction = 'defend';
    } else if (rand < attackUtility + defendUtility + jumpUtility) {
      selectedAction = 'jump';
    } else if (rand < attackUtility + defendUtility + jumpUtility + dashUtility) {
      selectedAction = 'dash';
    } else {
      selectedAction = 'chase';
    }

    // 清空虚拟输入
    this.aiInput = { left: false, right: false, up: false, attack: false, slide: false };

    // 根据选定的动作设置虚拟输入
    switch (selectedAction) {
      case 'attack':
        this.aiInput.attack = true;
        break;
      case 'defend':
        // 用 slide 表示防御或闪避
        this.aiInput.slide = true;
        break;
      case 'jump':
        if (time - this.lastJumpTime >= this.jumpCooldown) {
          this.aiInput.up = true;
          this.lastJumpTime = time;
        }
        break;
      case 'dash':
        if (playerSprite) {
          this.aiInput.left = this.sprite.x > playerSprite.x;
          this.aiInput.right = this.sprite.x < playerSprite.x;
        } else {
          this.aiInput.left = Math.random() < 0.5;
          this.aiInput.right = !this.aiInput.left;
        }
        break;
      case 'chase':
        if (playerSprite) {
          this.aiInput.left = this.sprite.x > playerSprite.x;
          this.aiInput.right = this.sprite.x < playerSprite.x;
        }
        break;
    }

    // 锁定当前动作一段时间，确保动作连贯
    this.actionLockUntil = time + this.defaultActionLock;

    if (this.debug) {
      console.debug('AI selected action:', selectedAction, 'with utilities:', {
        attackUtility,
        defendUtility,
        jumpUtility,
        dashUtility,
        chaseUtility,
      });
      console.debug('AI Input:', this.aiInput);
    }
  }

  public update(time: number, delta: number): void {
    this.updateAIDecision(time);
    super.update(time, delta);
    this.movement.handleMovementInput(time);
    this.jump.handleJumpInput(time);
    this.attack.handleAttackInput();
  }
}
