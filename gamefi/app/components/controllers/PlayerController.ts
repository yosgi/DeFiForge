import Phaser from 'phaser';

export enum CharState {
    Idle = 'Idle',
    Run = 'Run',
    Dash = 'Dash',
    Jump = 'Jump',
    UpToFall = 'UpToFall',
    Fall = 'Fall',
    Attack1 = 'Attack1',
    Attack2 = 'Attack2',
    Attack3 = 'Attack3',
    DashAttack = 'DashAttack',
    Blocking = 'Blocking',
    Slide = 'Slide',
    Stunned = 'Stunned'
}

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
    debug?: boolean;               // 是否输出调试信息
}

export class PlayerController {
    public sprite: Phaser.Physics.Arcade.Sprite;
    public hp: number;
    public isDead: boolean = false;
    /** 在 Slide 等无敌期间为 true */
    public isInvincible: boolean = false;

    private state: CharState = CharState.Idle;
    private scene: Phaser.Scene;
    private animPrefix: string;
    private debug: boolean;

    // 速度与物理参数
    private runSpeed: number;
    private dashSpeed: number;
    private slideSpeed: number;
    private jumpVelocity: number;
    // Dash 与 Slide 的持续时间、冷却等
    private dashDuration: number;
    private doubleTapThreshold: number;
    private slideDuration: number;
    private slideCooldown: number;
    private slideInvincibleDuration: number;

    // 定时器变量（存储结束时间）
    private dashEndTime: number = 0;
    private slideEndTime: number = 0;
    private lastSlideTime: number = 0;

    // 跳跃相关：用于支持二段跳
    private doubleJumpUsed: boolean = false;

    // 输入按键
    private cursors: Phaser.Types.Input.Keyboard.CursorKeys;
    private attackKey: Phaser.Input.Keyboard.Key;
    private blockKey: Phaser.Input.Keyboard.Key;
    private slideKey: Phaser.Input.Keyboard.Key;
    private lastDirection: 'left' | 'right' = 'right';

    // 用于左右双击检测（触发 Dash）
    private lastTap: { left: number; right: number } = { left: 0, right: 0 };

    // 攻击连击系统
    private nextAttackRequested: boolean = false;
    private attackComboStep: number = 0; // 0->attack1, 1->attack2, 2->attack3
    private normalAttackAnimations: string[];
    private dashAttackAnimation: string;

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
                            this.setState(CharState.Attack2);
                        } else if (this.attackComboStep === 2) {
                            this.setState(CharState.Attack3);
                        }
                        this.nextAttackRequested = false;
                    } else {
                        // 连击结束后，根据是否有移动输入返回 Run 或 Idle 状态
                        if (this.cursors.left?.isDown || this.cursors.right?.isDown) {
                            this.setState(CharState.Run);
                        } else {
                            this.setState(CharState.Idle);
                        }
                        this.attackComboStep = 0;
                        this.nextAttackRequested = false;
                    }
                }
                // Dash 攻击结束后
                else if (anim.key === this.dashAttackAnimation && this.state === CharState.DashAttack) {
                    if (this.cursors.left?.isDown || this.cursors.right?.isDown) {
                        this.setState(CharState.Run);
                    } else {
                        this.setState(CharState.Idle);
                    }
                }
                // Slide 动作完成后
                else if (anim.key === `${this.animPrefix}-slide` && this.state === CharState.Slide) {
                    this.setState(CharState.Idle);
                }
                // 对于 up_to_fall，交由 update() 检测动画进度转换到 Fall 状态
            }
        );
    }

    /**
     * 辅助方法：如果当前精灵动画与目标动画不一致，则播放目标动画
     */
    private playAnimationIfNotPlaying(animKey: string): void {
        if (this.sprite.anims.currentAnim && this.sprite.anims.currentAnim.key === animKey) return;
        this.sprite.play(animKey, true);
        if (this.debug) {
            console.debug(`Playing animation: ${animKey}`);
        }
    }


    /**
     * 状态切换，切换时设置对应动画和初始状态
     */
    private setState(newState: CharState): void {
        if (this.state === newState) return;
        if (this.debug) {
            console.debug(`State change: ${this.state} -> ${newState}`);
        }
        this.state = newState;
        switch (newState) {
            case CharState.Idle:
                this.playAnimationIfNotPlaying(`${this.animPrefix}-idle`);
                break;
            case CharState.Run:
                this.playAnimationIfNotPlaying(`${this.animPrefix}-run`);
                break;
            case CharState.Dash:
                this.playAnimationIfNotPlaying(`${this.animPrefix}-dash`);
                break;
            case CharState.Jump:
                this.playAnimationIfNotPlaying(`${this.animPrefix}-jump`);
                break;
            case CharState.UpToFall:
                this.playAnimationIfNotPlaying(`${this.animPrefix}-up_to_fall`);
                break;
            case CharState.Fall:
                this.playAnimationIfNotPlaying(`${this.animPrefix}-fall`);
                break;
            case CharState.Attack1:
                this.playAnimationIfNotPlaying(this.normalAttackAnimations[0]);
                break;
            case CharState.Attack2:
                this.playAnimationIfNotPlaying(this.normalAttackAnimations[1]);
                break;
            case CharState.Attack3:
                this.playAnimationIfNotPlaying(this.normalAttackAnimations[2]);
                break;
            case CharState.DashAttack:
                this.playAnimationIfNotPlaying(this.dashAttackAnimation);
                break;
            case CharState.Slide:
                this.playAnimationIfNotPlaying(`${this.animPrefix}-slide`);
                break;
            case CharState.Blocking:
                this.playAnimationIfNotPlaying(`${this.animPrefix}-crouch`);
                break;
            case CharState.Stunned:
                this.playAnimationIfNotPlaying(`${this.animPrefix}-hurt`);
                break;
            default:
                break;
        }
    }

    /**
     * 每帧调用，更新状态、检测输入、处理各状态之间的转换
     */
    public update(time: number, delta: number): void {
        if (this.isDead) return;
       
        // Dash 状态：Dash 持续时间结束后恢复 Idle 状态（或根据需求调整为 Idle/Run）
        if (this.state === CharState.Dash && time > this.dashEndTime) {
            this.setState(CharState.Idle);
            this.sprite.setVelocityX(0);
        }
        // Slide 状态：Slide 结束后恢复 Idle
        if (this.state === CharState.Slide && time > this.slideEndTime) {
            this.setState(CharState.Idle);
        }

        // 跳跃阶段转换：
        // 当处于 Jump（起跳）状态且垂直速度 >= 0 时转换到 UpToFall
        if (this.state === CharState.Jump && this.sprite.body!.velocity.y >= 0) {
            this.setState(CharState.UpToFall);
        }
        // 当处于 UpToFall 且动画播放完毕时转换到 Fall（下落）
        else if (this.state === CharState.UpToFall) {
            if (this.sprite.anims.currentAnim && this.sprite.anims.getProgress() >= 1) {
                this.setState(CharState.Fall);
            }
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
                    this.setState(CharState.Run);
                } else {
                    this.setState(CharState.Idle);
                }
            }
        }

        // 如果不处于攻击、Slide、DashAttack状态，则允许处理移动输入
        if (!this.isAttacking() && this.state !== CharState.Slide && this.state !== CharState.DashAttack) {
            this.handleMovementInput(time);
        } else {
            // 攻击、闪避期间禁止水平移动
            this.sprite.setVelocityX(0);
        }

        // 分别处理跳跃、攻击和闪避输入
        this.handleJumpInput();
        this.handleAttackInput();
        this.handleSlideInput(time);
    }

    /**
     * 处理左右移动输入（Run/Dash）
     */
    private handleMovementInput(time: number): void {
        let velocityX = 0;
        let moving = false;

        // 检测左右按键
        if (this.cursors.left?.isDown) {
            velocityX = -this.runSpeed;
            moving = true;
            this.sprite.setFlipX(true);
            // 如果当前不是 Run 状态，则切换到 Run
            if (this.state !== CharState.Run) {
                this.setState(CharState.Run);
            }
            this.lastDirection = 'left';
        } else if (this.cursors.right?.isDown) {
            velocityX = this.runSpeed;
            moving = true;
            this.sprite.setFlipX(false);
            if (this.state !== CharState.Run) {
                this.setState(CharState.Run);
            }
            this.lastDirection = 'right';
        }

        if (moving) {
            // 按键持续按下时使用 Run 速度
            this.sprite.setVelocityX(velocityX);
        } else {
            // 无方向键输入时，如果之前处于 Run 状态，则切换到 Dash 状态
            if (this.state === CharState.Run) {
                this.setState(CharState.Dash);
                this.dashEndTime = time + this.dashDuration;
                // 根据最后方向设置 dash 速度
                if (this.lastDirection === 'left') {
                    this.sprite.setVelocityX(-this.dashSpeed);
                    this.sprite.setFlipX(true);
                } else {
                    this.sprite.setVelocityX(this.dashSpeed);
                    this.sprite.setFlipX(false);
                }
            }
            // 如果当前已经处于 Dash 状态，则不做其他处理（速度保持不变）
        }
    }

    /**
     * 处理跳跃输入（支持二段跳）
     */
    private handleJumpInput(): void {
        // 使用上键进行跳跃
        if (Phaser.Input.Keyboard.JustDown(this.cursors.up!)) {
            if (this.sprite.body!.blocked.down) {
                // 地面上起跳
                this.setState(CharState.Jump);
                this.sprite.setVelocityY(this.jumpVelocity);
                this.doubleJumpUsed = false;
            } else if (!this.doubleJumpUsed) {
                // 空中未使用过二段跳则允许二段跳
                this.doubleJumpUsed = true;
                this.setState(CharState.Jump);
                this.sprite.setVelocityY(this.jumpVelocity);
            }
        }
    }

    /**
    * 处理攻击输入：
    * - 若处于 Run 或 Dash 状态，则按下攻击键触发 DashAttack；
    * - 否则在非攻击状态下按下攻击键启动普通攻击连击，
    *   在攻击动画播放期间，在连击窗口（进度 >= 0.7）内再次按下攻击键请求下一段攻击。
    */
    private handleAttackInput(): void {
        if (Phaser.Input.Keyboard.JustDown(this.attackKey)) {
            // 如果当前处于 Run 或 Dash 状态，则触发 DashAttack（并且当前状态不是 DashAttack）
            if ((this.state === CharState.Run || this.state === CharState.Dash)) {
  
                this.setState(CharState.DashAttack);
                
                return;
            }
            // 如果不在攻击状态，则启动普通攻击连击
            if (!this.isAttacking()) {
                this.attackComboStep = 0;
                this.nextAttackRequested = false;
                this.setState(CharState.Attack3);
            } else {
                // 已处于攻击状态，在连击窗口内注册下一段攻击请求
                const progress = this.sprite.anims.getProgress();
                if (progress >= 0.7) {
                    this.nextAttackRequested = true;
                    if (this.debug) {
                        console.debug('Attack combo input registered.');
                    }
                }
            }
        }
    }


    /**
     * 处理闪避（Slide）输入：按下 Slide 键且冷却已结束时触发闪避，
     * 在闪避期间赋予短暂无敌效果。
     */
    private handleSlideInput(time: number): void {
        if (Phaser.Input.Keyboard.JustDown(this.slideKey)) {
            if (time >= this.lastSlideTime + this.slideCooldown) {
                this.lastSlideTime = time;
                this.setState(CharState.Slide);
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
    private isAttacking(): boolean {
        return (
            this.state === CharState.Attack1 ||
            this.state === CharState.Attack2 ||
            this.state === CharState.Attack3 ||
            this.state === CharState.DashAttack
        );
    }
}
