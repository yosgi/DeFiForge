// PlayerJump.ts
import Phaser from 'phaser';
import { PlayerController } from './PlayerController';
import { CharState } from './CharState';

/**
 *  Handle player jump input (including jump and double jump),
 *  and if the player has been running for more than 2 seconds on the ground,
 *  then jumping will trigger an AirRun state.
 */
export class PlayerJump {
  private controller: PlayerController;

  constructor(controller: PlayerController) {
    this.controller = controller;
  }

  public handleJumpInput(time: number): void {
    // Detect jump key press
    if (Phaser.Input.Keyboard.JustDown(this.controller.cursors.up!)) {
      // If on the ground or within coyote time (jump buffer)
      if (
        this.controller.sprite.body!.blocked.down ||
        (time - this.controller.lastGroundedTime) <= this.controller.coyoteTime
      ) {
        // Check if the player has been running continuously for 2 seconds
        if (
          this.controller.airRunEligible
        ) {
          console.log('AirRun');
          // Enter AirRun state (i.e. airborne with maintained horizontal momentum)
          this.controller.stateManager.changeState(CharState.AirRun);
          this.controller.sprite.setVelocityY(this.controller.jumpVelocity);
          this.controller.isAirRun = true;
          this.controller.airRunEligible = false
          this.controller.doubleJumpUsed = false;
        } else {
          // Normal jump from the ground
          console.log('Normal jump');
          this.controller.stateManager.changeState(CharState.Jump);
          this.controller.sprite.setVelocityY(this.controller.jumpVelocity);
          this.controller.doubleJumpUsed = false;
          this.controller.isAirRun = false;
        }
      } else if (!this.controller.doubleJumpUsed) {
        // Double jump available in mid-air
        this.controller.doubleJumpUsed = true;
        console.log('Double jump used',this.controller.isAirRun);
        // If already in AirRun, continue AirRun; otherwise, use normal Jump state
        if (this.controller.isAirRun) {
          console.log('Double jump AirRun');
          this.controller.stateManager.changeState(CharState.AirRun);
        } else {
          console.log('Double jump Jump');
          this.controller.stateManager.changeState(CharState.Jump);
        }
        this.controller.sprite.setVelocityY(this.controller.jumpVelocity);
      }
    }

    // Flexible jump height: if upward velocity and jump key is released,
    // reduce upward velocity so that jump height depends on how long the key is held
    if (
      this.controller.sprite.body!.velocity.y < 0 &&
      !this.controller.cursors.up!.isDown
    ) {
      this.controller.sprite.setVelocityY(
        this.controller.sprite.body!.velocity.y * this.controller.jumpCutMultiplier
      );
    }
  }
}
