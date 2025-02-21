// PlayerAttack.ts
import * as Phaser from 'phaser';
import { PlayerController } from './Player/PlayerController';
import { CharState } from './CharState';
import { BaseController } from './BaseController';

/**
 *  handle player attack input
 *  - in the state of Run or Dash, dash attack will be triggered
 *  - or attack combo will be triggered
 *  - during the attack animation,(progress >= 0.7) if the attack key is pressed again, the next attack will be triggered
 */

export class PlayerAttack {
  private controller: PlayerController | BaseController;
  private attackBufferThreshold: number = 0.5; 

  constructor(controller: BaseController) {
    this.controller = controller;
  }
  private getAttackInput(): boolean {
    if ((this.controller as any).aiInput !== undefined) {
      return (this.controller as any).aiInput.attack;
    }
    // 现在 BaseController 定义了 attackKey（可选），我们使用断言来确保它存在
    return Phaser.Input.Keyboard.JustDown(this.controller.attackKey!);
  }
  
  public handleAttackInput(): void {
    if (this.getAttackInput()) {
 
        // if in the state of Run or Dash, dash attack will be triggered
      if (
        this.controller.state === CharState.Run ||
        this.controller.state === CharState.Dash ||
        this.controller.state === CharState.Slide ||
        this.controller.state === CharState.AirRun 
      ) {
        this.controller.stateManager.changeState(CharState.DashAttack);
        this.controller.airRunEligible = false;
        this.controller.runStartTime = 0
        return;
      }
      if (this.controller.isJumping()) {
        this.controller.stateManager.changeState(CharState.Attack3);
        return;
      }
      // if not attacking, attack combo will be triggered
      if (!this.controller.isAttacking()) {
        this.controller.attackComboStep = 0;
        this.controller.nextAttackRequested = false;
        this.controller.stateManager.changeState(CharState.Attack1);
      } else {
        // during the attack animation, if the attack key is pressed again, the next attack will be triggered
        const progress = this.controller.sprite.anims.getProgress();
        if (progress >= this.attackBufferThreshold) {
          this.controller.nextAttackRequested = true;
          if (this.controller.debug) {
            console.debug('Attack combo input registered.');
          }
        }
      }
    }
  }
}
