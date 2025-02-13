// PlayerStateManager.ts
import { PlayerController } from "./PlayerController";
import { PlayerAnimationManager } from "./PlayerAnimationManager";
import { CharState } from "./CharState";

export class PlayerStateManager {
  private controller: PlayerController;
  private animationManager: PlayerAnimationManager;

  constructor(controller: PlayerController, animationManager: PlayerAnimationManager) {
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
