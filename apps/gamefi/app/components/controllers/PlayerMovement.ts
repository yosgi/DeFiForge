// PlayerMovement.ts
import * as Phaser from 'phaser';
import { PlayerController } from './Player/PlayerController';
import { CharState } from './CharState';
import { BaseController } from './BaseController';

/**
 *  Handle player movement input.
 *  When no directional input is detected on the ground and current state is Run,
 *  transition into Dash state as a running-to-dash transition.
 */
export class PlayerMovement {
  private controller: PlayerController | BaseController;

  constructor(controller: PlayerController | BaseController) {
    this.controller = controller;
  }

  public handleMovementInput(time: number): void {
    let velocityX = 0;
    let moving = false;
    // 判断是否在空中
    const isAirborne = !this.controller.sprite.body!.blocked.down;
    const input = (this.controller as any).aiInput || this.controller.cursors;
    const leftPressed = typeof input.left === 'boolean' ? input.left : input.left?.isDown;
    const rightPressed = typeof input.right === 'boolean' ? input.right : input.right?.isDown;
    // 检测左右方向键
    if (leftPressed) {
      velocityX = -this.controller.runSpeed;
      moving = true;
      this.controller.sprite.setFlipX(true);
      // 仅在地面时切换到 Run 状态
      if (!isAirborne && this.controller.state !== CharState.Run) {
        this.controller.stateManager.changeState(CharState.Run);
      }
      this.controller.lastDirection = 'left';
    } else if (rightPressed) {
      velocityX = this.controller.runSpeed;
      moving = true;
      this.controller.sprite.setFlipX(false);
      if (!isAirborne && this.controller.state !== CharState.Run) {
        this.controller.stateManager.changeState(CharState.Run);
      }
      this.controller.lastDirection = 'right';
    }

    if (moving) {
      // 如果在地面且处于 Run 状态，记录跑动开始时间
      if (!isAirborne && this.controller.state === CharState.Run) {
        if (this.controller.runStartTime === 0) {
          console.log('runStartTime', this.controller.runStartTime);
          this.controller.runStartTime = time;
        } else {
          // 如果已经连续跑动超过 1000ms，则设置空中跑动资格
          if (time - this.controller.runStartTime >= 1800) {
            console.log('airRunEligible');
            this.controller.airRunEligible = true;
            this.controller.airRunEligibleTime = time;
          }
        }
      }
      this.controller.sprite.setVelocityX(velocityX);
    } else {
      // 当没有方向键输入时
      if (!isAirborne && this.controller.state === CharState.Run) {
        // 结束 Run，触发 Dash 过渡效果
        this.controller.runStartTime = 0; // 重置连续跑动时间
        this.controller.stateManager.changeState(CharState.Dash);
        this.controller.dashEndTime = time + this.controller.dashDuration;
        if (this.controller.lastDirection === 'left') {
          this.controller.sprite.setVelocityX(-this.controller.dashSpeed);
          this.controller.sprite.setFlipX(true);
        } else {
          this.controller.sprite.setVelocityX(this.controller.dashSpeed);
          this.controller.sprite.setFlipX(false);
        }
      } else {
        // 非 Run 状态时，无输入则清零速度
        this.controller.sprite.setVelocityX(0);
        this.controller.runStartTime = 0;
      }
      this.controller.airRunEligible = false;
    }
  }
}
