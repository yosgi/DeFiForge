// PlayerJump.ts
import Phaser from 'phaser';
import { PlayerController } from './PlayerController';
import { CharState } from './PlayerController';

/**
 *  handle player jump input(such as jump, double jump)
 */
export class PlayerJump {
  private controller: PlayerController;

  constructor(controller: PlayerController) {
    this.controller = controller;
  }

  public handleJumpInput(time: number): void {
    // detect jump key
    if (Phaser.Input.Keyboard.JustDown(this.controller.cursors.up!)) {
        // if on the ground or in the air but within coyote time
      if (
        this.controller.sprite.body!.blocked.down ||
        (time - this.controller.lastGroundedTime) <= this.controller.coyoteTime
      ) {
        this.controller.setState(CharState.Jump);
        this.controller.sprite.setVelocityY(this.controller.jumpVelocity);
        // if jump from the ground, reset double jump
        this.controller.doubleJumpUsed = false;
      } else if (!this.controller.doubleJumpUsed) {
        // if double jump is available
        this.controller.doubleJumpUsed = true;
        this.controller.setState(CharState.Jump);
        this.controller.sprite.setVelocityY(this.controller.jumpVelocity);
      }
    }

    // flexible jump height: (velocityY < 0 ) and (not holding jump key)
    // cut the velocityY , let the jump height depend on how long the jump key is held
    if (
      this.controller.sprite.body!.velocity.y < 0 &&
      !this.controller.cursors.up!.isDown
    ) {
      this.controller.sprite.setVelocityY(
        // by multiplying the jumpCutMultiplier, the jump height can be cut
        this.controller.sprite.body!.velocity.y * this.controller.jumpCutMultiplier
      );
    }
  }
}
