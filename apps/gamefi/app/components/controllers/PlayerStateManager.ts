// PlayerStateManager.ts
import { PlayerController } from "./Player/PlayerController";
import { PlayerAnimationManager } from "./PlayerAnimationManager";
import { CharState } from "./CharState";
import {BaseController } from "./BaseController";

export class PlayerStateManager {
  private controller: PlayerController | BaseController;
  private animationManager: PlayerAnimationManager;

  constructor(controller: PlayerController | BaseController, animationManager: PlayerAnimationManager) {
    this.controller = controller;
    this.animationManager = animationManager;
  }

  public changeState(newState: CharState): void {
    if (this.controller.state === newState) return;
    if (this.controller.debug) {
      console.debug(`State change: ${this.controller.state} -> ${newState}`);
    }
    this.controller.state = newState;
    this.animationManager.playAnimationForState(newState);
  }
}
