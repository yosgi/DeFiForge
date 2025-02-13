// PlayerMovement.ts
import Phaser from 'phaser';
import { PlayerController } from './PlayerController';
import { CharState } from './CharState';

/**
 *  handle player movement input
 */
export class PlayerMovement {
  private controller: PlayerController;

  constructor(controller: PlayerController) {
    this.controller = controller;
  }

  public handleMovementInput(time: number): void {
    let velocityX = 0;
    let moving = false;
    // is in the air
    const isAirborne = !this.controller.sprite.body!.blocked.down;
    // detect left or right key
    if (this.controller.cursors.left?.isDown) {
      velocityX = -this.controller.runSpeed;
      moving = true;
      this.controller.sprite.setFlipX(true);
      // only run when on the ground
      if (!isAirborne && this.controller.state !== CharState.Run) {
        this.controller.stateManager.changeState(CharState.Run);
      }
      this.controller.lastDirection = 'left';
    } else if (this.controller.cursors.right?.isDown) {
      velocityX = this.controller.runSpeed;
      moving = true;
      this.controller.sprite.setFlipX(false);
      if (!isAirborne && this.controller.state !== CharState.Run) {
        this.controller.stateManager.changeState(CharState.Run);
      }
      this.controller.lastDirection = 'right';
    }

    if (moving) {
      this.controller.sprite.setVelocityX(velocityX);
    } else {
        // when no direction key is pressed
      if (!isAirborne && this.controller.state === CharState.Run) {
        this.controller.stateManager.changeState(CharState.Dash);
        this.controller.dashEndTime = time + this.controller.dashDuration;
        if (this.controller.lastDirection === 'left') {
          this.controller.sprite.setVelocityX(-this.controller.dashSpeed);
          this.controller.sprite.setFlipX(true);
        } else {
          this.controller.sprite.setVelocityX(this.controller.dashSpeed);
          this.controller.sprite.setFlipX(false);
        }
      }
    }
  }
}
