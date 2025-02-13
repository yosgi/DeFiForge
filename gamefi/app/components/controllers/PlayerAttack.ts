// PlayerAttack.ts
import Phaser from 'phaser';
import { PlayerController } from './PlayerController';
import { CharState } from './CharState';

/**
 *  handle player attack input
 *  - in the state of Run or Dash, dash attack will be triggered
 *  - or attack combo will be triggered
 *  - during the attack animation,(progress >= 0.7) if the attack key is pressed again, the next attack will be triggered
 */

export class PlayerAttack {
  private controller: PlayerController;

  constructor(controller: PlayerController) {
    this.controller = controller;
  }

  public handleAttackInput(): void {
    if (Phaser.Input.Keyboard.JustDown(this.controller.attackKey)) {
        // if in the state of Run or Dash, dash attack will be triggered
      if (
        this.controller.state === CharState.Run ||
        this.controller.state === CharState.Dash
      ) {
        this.controller.stateManager.changeState(CharState.DashAttack);
        return;
      }
      // if not attacking, attack combo will be triggered
      if (!this.controller.isAttacking()) {
        this.controller.attackComboStep = 0;
        this.controller.nextAttackRequested = false;
        this.controller.stateManager.changeState(CharState.Attack3);
      } else {
        // during the attack animation, if the attack key is pressed again, the next attack will be triggered
        const progress = this.controller.sprite.anims.getProgress();
        if (progress >= 0.7) {
          this.controller.nextAttackRequested = true;
          if (this.controller.debug) {
            console.debug('Attack combo input registered.');
          }
        }
      }
    }
  }
}
