// BehaviorManager.ts
import { PlayerBehaviorProfile } from '../Player/PlayerBehaviorProfile';

export class BehaviorManager {
  private static instance: BehaviorManager;
  public profile: PlayerBehaviorProfile;

  private constructor() {
    // 初始化玩家行为数据
    this.profile = {
      normalAttackCount: 0,
      dashAttackCount: 0,
      jumpCount: 0,
      slideCount: 0
    };
  }

  public static getInstance(): BehaviorManager {
    if (!BehaviorManager.instance) {
      BehaviorManager.instance = new BehaviorManager();
    }
    return BehaviorManager.instance;
  }

  // 示例接口：记录一次普通攻击
  public recordNormalAttack(): void {
    this.profile.normalAttackCount++;
  }

  public recordDashAttack(): void {
    this.profile.dashAttackCount++;
  }

  public recordJump(): void {
    this.profile.jumpCount++;
  }

  public recordSlide(): void {
    this.profile.slideCount++;
  }
}
