// PlayerAnimationManager.ts
import { PlayerController } from "./Player/PlayerController";
import { CharState } from "./CharState";
import { BaseController } from "./BaseController";
export class PlayerAnimationManager {
    private controller: PlayerController | BaseController;

    constructor(controller: PlayerController | BaseController) {
        this.controller = controller;
    }
    /**
      * set the animation for the current state
     */
    public playAnimationForState(state: CharState): void {
        switch (state) {
            case CharState.Idle:
                this.controller.playAnimationIfNotPlaying(`${this.controller.animPrefix}-idle`);
                break;
            case CharState.Run:
                this.controller.playAnimationIfNotPlaying(`${this.controller.animPrefix}-run`);
                break;
            case CharState.Dash:
                this.controller.playAnimationIfNotPlaying(`${this.controller.animPrefix}-dash`);
                break;
            case CharState.Jump:
                this.controller.playAnimationIfNotPlaying(`${this.controller.animPrefix}-jump`);
                break;
            case CharState.UpToFall:
                this.controller.playAnimationIfNotPlaying(`${this.controller.animPrefix}-up_to_fall`);
                break;
            case CharState.Fall:
                this.controller.playAnimationIfNotPlaying(`${this.controller.animPrefix}-fall`);
                break;
            case CharState.Attack1:
                this.controller.playAnimationIfNotPlaying(`${this.controller.animPrefix}-attack1`);
                break;
            case CharState.Attack2:
                this.controller.playAnimationIfNotPlaying(`${this.controller.animPrefix}-attack2`);
                break;
            case CharState.Attack3:
                this.controller.playAnimationIfNotPlaying(`${this.controller.animPrefix}-attack3`);
                break;
            case CharState.DashAttack:
                this.controller.playAnimationIfNotPlaying(`${this.controller.animPrefix}-dash_attack`);
                // initial speed of the dash attack according to the direction
                if (this.controller.lastDirection === 'left') {
                    this.controller.sprite.setVelocityX(-this.controller.dashAttackInitialSpeed);
                    this.controller.sprite.setFlipX(true);
                } else {
                    this.controller.sprite.setVelocityX(this.controller.dashAttackInitialSpeed);
                    this.controller.sprite.setFlipX(false);
                }
                break;
            case CharState.Slide:
                this.controller.playAnimationIfNotPlaying(`${this.controller.animPrefix}-slide`);
                break;
            case CharState.Blocking:
                this.controller.playAnimationIfNotPlaying(`${this.controller.animPrefix}-block`);
                break;
            case CharState.Stunned:
                this.controller.playAnimationIfNotPlaying(`${this.controller.animPrefix}-hurt`);
                break;
            default:
                break;
        }
    }
}
