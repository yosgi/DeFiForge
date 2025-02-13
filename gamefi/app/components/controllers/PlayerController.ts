import Phaser from 'phaser';
import { PlayerMovement } from './PlayerMovement';
import { PlayerJump } from './PlayerJump';
import { PlayerAttack } from './PlayerAttack';
import { PlayerStateManager } from "./PlayerStateManager";
import { PlayerAnimationManager } from "./PlayerAnimationManager";
import { CharState } from './CharState';


export interface PlayerConfig {
    runSpeed?: number;             // 普通移动速度（Run状态）
    dashSpeed?: number;            // 冲刺速度（Dash状态）
    slideSpeed?: number;           // 闪避时水平速度（Slide状态）
    jumpVelocity?: number;         // 起跳力度
    dashDuration?: number;         // Dash 持续时间（毫秒）
    doubleTapThreshold?: number;   // 双击检测阈值（毫秒）
    slideDuration?: number;        // Slide 持续时间（毫秒）
    slideCooldown?: number;        // Slide 冷却时间（毫秒）
    slideInvincibleDuration?: number; // Slide 无敌时长（毫秒）
    animPrefix?: string;           // 动画前缀，例如 'player'
    hp?: number;                   // 初始血量
    scaleFactor?: number;          // 精灵缩放因子
    coyoteTime?: number;  // 离地后仍能跳跃的缓冲时间（毫秒），例如 150
    jumpCutMultiplier?: number; // 释放跳跃键后，减少上升速度的比例（0~1），例如 0.9
    debug?: boolean;               // 是否输出调试信息
    // 新增 dashAttack 参数
    dashAttackInitialSpeed?: number;   // DashAttack 初始速度（px/s）
    dashAttackDeceleration?: number;   // DashAttack 衰减系数（例如 0.95）
}

export class PlayerController {
    public sprite: Phaser.Physics.Arcade.Sprite;
    public hp: number;
    public isDead: boolean = false;
    /** 在 Slide 等无敌期间为 true */
    public isInvincible: boolean = false;

    public state: CharState = CharState.Idle;
    public scene: Phaser.Scene;
    public animPrefix: string;
    public debug: boolean;

    // 速度与物理参数
    public runSpeed: number;
    public dashSpeed: number;
    public slideSpeed: number;
    public jumpVelocity: number;
    // Dash 与 Slide 的持续时间、冷却等
    public dashDuration: number;
    public doubleTapThreshold: number;
    public slideDuration: number;
    public slideCooldown: number;
    public slideInvincibleDuration: number;

    // 定时器变量（存储结束时间）
    public dashEndTime: number = 0;
    public slideEndTime: number = 0;
    public lastSlideTime: number = 0;

    // 跳跃相关：用于支持二段跳
    public doubleJumpUsed: boolean = false;
    public coyoteTime: number;
    public jumpCutMultiplier: number;
    public lastGroundedTime: number = 0;

    // 输入按键
    public cursors: Phaser.Types.Input.Keyboard.CursorKeys;
    public attackKey: Phaser.Input.Keyboard.Key;
    public blockKey: Phaser.Input.Keyboard.Key;
    public slideKey: Phaser.Input.Keyboard.Key;
    public lastDirection: 'left' | 'right' = 'right';

    // 用于左右双击检测（触发 Dash）
    public lastTap: { left: number; right: number } = { left: 0, right: 0 };

    // 攻击连击系统
    public nextAttackRequested: boolean = false;
    public attackComboStep: number = 0; // 0->attack1, 1->attack2, 2->attack3
    public normalAttackAnimations: string[];
    //  dashAttack 参数
    public dashAttackInitialSpeed: number;
    public dashAttackDeceleration: number;

    private dashAttackAnimation: string;

    // 子模块
    public movement: PlayerMovement;
    public jump: PlayerJump;
    public attack: PlayerAttack;

    // 新增：状态与动画管理模块
    public stateManager: PlayerStateManager;
    public animationManager: PlayerAnimationManager;

    constructor(
        scene: Phaser.Scene,
        x: number,
        y: number,
        texture: string,
        config?: PlayerConfig
    ) {
        this.scene = scene;
        this.animPrefix = config?.animPrefix ?? 'hero';
        this.hp = config?.hp ?? 100;
        this.debug = config?.debug ?? false;

        // 配置参数（默认值）
        this.runSpeed = config?.runSpeed ?? 150;
        this.dashSpeed = config?.dashSpeed ?? 120;
        this.slideSpeed = config?.slideSpeed ?? 400;
        this.jumpVelocity = config?.jumpVelocity ?? -500;
        this.dashDuration = config?.dashDuration ?? 250;
        this.doubleTapThreshold = config?.doubleTapThreshold ?? 300;
        this.slideDuration = config?.slideDuration ?? 500;
        this.slideCooldown = config?.slideCooldown ?? 2000;
        this.slideInvincibleDuration = config?.slideInvincibleDuration ?? 300;
        // 离地缓冲和跳跃剪切
        const coyoteTimeDefault = 150;
        const jumpCutMultiplierDefault = 0.9;

        this.coyoteTime = config?.coyoteTime ?? coyoteTimeDefault;
        this.jumpCutMultiplier = config?.jumpCutMultiplier ?? jumpCutMultiplierDefault;

        // 新增属性，用于记录最近一次着地时间
        this.lastGroundedTime = 0;

        // 新增 dashAttack 参数
        this.dashAttackInitialSpeed = config?.dashAttackInitialSpeed ?? 200;
        this.dashAttackDeceleration = config?.dashAttackDeceleration ?? 0.95;


        // 创建精灵，并设置边界碰撞和缩放
        this.sprite = scene.physics.add.sprite(x, y, texture);
        this.sprite.setCollideWorldBounds(true);
        const scaleFactor = config?.scaleFactor ?? 2;
        this.sprite.setScale(scaleFactor);

        // 注册输入
        this.cursors = scene.input.keyboard!.createCursorKeys();
        this.attackKey = scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.F);
        this.blockKey = scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.D);
        this.slideKey = scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT);

        // 设置攻击动画（连击）和 dash 攻击动画
        this.normalAttackAnimations = [
            `${this.animPrefix}-attack1`,
            `${this.animPrefix}-attack2`,
            `${this.animPrefix}-attack3`
        ];
        this.dashAttackAnimation = `${this.animPrefix}-dash_attack`;
        // 监听动画完成事件，用于处理攻击连击、dash_attack、slide 等状态结束
        // 初始化子模块
        this.movement = new PlayerMovement(this);
        this.jump = new PlayerJump(this);
        this.attack = new PlayerAttack(this);

        // 初始化状态与动画管理模块
        this.animationManager = new PlayerAnimationManager(this);
        this.stateManager = new PlayerStateManager(this, this.animationManager);

        this.setupAnimationEvents();
    }

    /**
     * 监听动画完成事件，根据动画完成时机处理攻击连击等状态切换
     */
    private setupAnimationEvents(): void {
        this.sprite.on(
            Phaser.Animations.Events.ANIMATION_COMPLETE,
            (anim: Phaser.Animations.Animation) => {
                // 处理普通攻击连击
                if (
                    ((anim.key === this.normalAttackAnimations[0] && this.state === CharState.Attack1) ||
                        (anim.key === this.normalAttackAnimations[1] && this.state === CharState.Attack2) ||
                        (anim.key === this.normalAttackAnimations[2] && this.state === CharState.Attack3))
                ) {
                    if (this.nextAttackRequested && this.attackComboStep < 2) {
                        this.attackComboStep++;
                        if (this.attackComboStep === 1) {
                            this.stateManager.changeState(CharState.Attack2);
                        } else if (this.attackComboStep === 2) {
                            this.stateManager.changeState(CharState.Attack3);
                        }
                        this.nextAttackRequested = false;
                    } else {
                        // 连击结束后，根据是否有移动输入返回 Run 或 Idle 状态
                        if (this.cursors.left?.isDown || this.cursors.right?.isDown) {
                            this.stateManager.changeState(CharState.Run);
                        } else {
                            this.stateManager.changeState(CharState.Idle);
                        }
                        this.attackComboStep = 0;
                        this.nextAttackRequested = false;
                    }
                }
                // Dash 攻击结束后
                else if (anim.key === this.dashAttackAnimation && this.state === CharState.DashAttack) {
                    if (this.cursors.left?.isDown || this.cursors.right?.isDown) {
                        this.stateManager.changeState(CharState.Run);
                    } else {
                        this.stateManager.changeState(CharState.Idle);
                    }
                }
                // Slide 动作完成后
                else if (anim.key === `${this.animPrefix}-slide` && this.state === CharState.Slide) {
                    this.stateManager.changeState(CharState.Idle);
                }
                // 对于 up_to_fall，交由 update() 检测动画进度转换到 Fall 状态
            }
        );
    }

    /**
     * 辅助方法：如果当前精灵动画与目标动画不一致，则播放目标动画
     */
    public playAnimationIfNotPlaying(animKey: string): void {
        if (this.sprite.anims.currentAnim && this.sprite.anims.currentAnim.key === animKey) return;
        this.sprite.play(animKey, true);
        if (this.debug) {
            console.debug(`Playing animation: ${animKey}`);
        }
    }
    /**
     * 每帧调用，更新状态、检测输入、处理各状态之间的转换
     */
    public update(time: number, delta: number): void {
        if (this.isDead) return;
        // 着地检测：当角色触地时，重置二段跳标记，并记录最后着地时间
        if (this.sprite.body!.blocked.down) {
            this.lastGroundedTime = time;  // 记录当前时间作为最近一次着地时间
            if (
                this.state === CharState.Jump ||
                this.state === CharState.UpToFall ||
                this.state === CharState.Fall
            ) {
                this.doubleJumpUsed = false;
                if (this.cursors.left?.isDown || this.cursors.right?.isDown) {
                    this.stateManager.changeState(CharState.Run);
                } else {
                    this.stateManager.changeState(CharState.Idle);
                }
            }
        }

        // Dash 状态：Dash 持续时间结束后恢复 Idle 状态（或根据需求调整为 Idle/Run）
        if (this.state === CharState.Dash && time > this.dashEndTime) {
            this.stateManager.changeState(CharState.Idle);
            this.sprite.setVelocityX(0);
        }
        // Slide 状态：Slide 结束后恢复 Idle
        if (this.state === CharState.Slide && time > this.slideEndTime) {
            this.stateManager.changeState(CharState.Idle);
        }

        // 跳跃阶段转换：
        // 当处于 Jump（起跳）状态且垂直速度 >= 0 时转换到 UpToFall
        if (this.state === CharState.Jump && this.sprite.body!.velocity.y >= 0) {
            this.stateManager.changeState(CharState.UpToFall);
        }
        // 当处于 UpToFall 且动画播放完毕时转换到 Fall（下落）
        else if (this.state === CharState.UpToFall) {
            if (this.sprite.anims.currentAnim && this.sprite.anims.getProgress() >= 1) {
                this.stateManager.changeState(CharState.Fall);
            }
        }

        // DashAttack 状态：更新惯性推进（如果处于 dash_attack 状态）
        if (this.state === CharState.DashAttack) {
            // 逐帧衰减水平速度
            const newVelocityX = this.sprite.body!.velocity.x * this.dashAttackDeceleration;
            this.sprite.setVelocityX(newVelocityX);
        }
        // 非攻击、非 Slide、非 DashAttack状态下，处理移动输入
        else if (!this.isAttacking() && this.state !== CharState.Slide) {
            this.movement.handleMovementInput(time);
        } else {
            // 攻击、闪避期间禁止水平移动（DashAttack 状态单独处理）
            this.sprite.setVelocityX(0);
        }

        // 着地检测：当角色触地时，若处于跳跃状态则重置二段跳标记，并根据是否有水平输入切换到 Run 或 Idle
        if (this.sprite.body!.blocked.down) {
            if (
                this.state === CharState.Jump ||
                this.state === CharState.UpToFall ||
                this.state === CharState.Fall
            ) {
                this.doubleJumpUsed = false;
                if (this.cursors.left?.isDown || this.cursors.right?.isDown) {
                    this.stateManager.changeState(CharState.Run);
                } else {
                    this.stateManager.changeState(CharState.Idle);
                }
            }
        }

        // 如果不处于攻击、Slide、DashAttack状态，则允许处理移动输入
        if (!this.isAttacking() && this.state !== CharState.Slide && this.state !== CharState.DashAttack) {
            this.movement.handleMovementInput(time);
        } else {
            // 攻击、闪避期间禁止水平移动
            this.sprite.setVelocityX(0);
        }

        // 分别处理跳跃、攻击和闪避输入
        this.jump.handleJumpInput(time);
        this.attack.handleAttackInput();
        this.handleSlideInput(time);
    }

    /**
     * 处理闪避（Slide）输入：按下 Slide 键且冷却已结束时触发闪避，
     * 在闪避期间赋予短暂无敌效果。
     */
    private handleSlideInput(time: number): void {
        if (Phaser.Input.Keyboard.JustDown(this.slideKey)) {
            if (time >= this.lastSlideTime + this.slideCooldown) {
                this.lastSlideTime = time;
                this.stateManager.changeState(CharState.Slide);
                // 根据角色朝向设置闪避水平速度
                this.sprite.setVelocityX(this.sprite.flipX ? -this.slideSpeed : this.slideSpeed);
                this.slideEndTime = time + this.slideDuration;
                // 设置无敌状态，并在 slideInvincibleDuration 后取消
                this.isInvincible = true;
                this.scene.time.addEvent({
                    delay: this.slideInvincibleDuration,
                    callback: () => {
                        this.isInvincible = false;
                    }
                });
            }
        }
    }

    /**
     * 辅助方法：判断当前是否处于攻击状态
     */
    public isAttacking(): boolean {
        return (
            this.state === CharState.Attack1 ||
            this.state === CharState.Attack2 ||
            this.state === CharState.Attack3 ||
            this.state === CharState.DashAttack
        );
    }
}
