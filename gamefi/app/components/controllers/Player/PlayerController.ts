// PlayerController.ts
import Phaser from 'phaser';
import { BaseController } from '../BaseController';
import { CharState } from '../CharState';
import { PlayerMovement } from '../PlayerMovement';
import { PlayerJump } from '../PlayerJump';
import { PlayerAttack } from '../PlayerAttack';

export class PlayerController extends BaseController {
  public cursors: Phaser.Types.Input.Keyboard.CursorKeys;
  public attackKey: Phaser.Input.Keyboard.Key;
  public blockKey: Phaser.Input.Keyboard.Key;
  public slideKey: Phaser.Input.Keyboard.Key;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    texture: string,
    config?: any
  ) {
    super(scene, x, y, texture, config);

    // 初始化玩家专用输入
    this.cursors = scene.input.keyboard!.createCursorKeys();
    this.attackKey = scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.F);
    this.blockKey = scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.D);
    this.slideKey = scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT);

    // 初始化玩家的子模块：移动、跳跃、攻击
    this.movement = new PlayerMovement(this);
    this.jump = new PlayerJump(this);
    this.attack = new PlayerAttack(this);
  }

  public update(time: number, delta: number): void {
    // 执行基础更新（例如缓冲动作处理）
    super.update(time, delta);

    // 调用各模块处理玩家输入
    this.movement.handleMovementInput(time);
    this.jump.handleJumpInput(time);
    this.attack.handleAttackInput();
  }





}
