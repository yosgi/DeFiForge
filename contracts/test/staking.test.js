const Staking = artifacts.require("Staking");
const Token = artifacts.require("@openzeppelin/contracts/token/ERC20/ERC20.sol");

const { expect } = require("chai");
const { time } = require("@openzeppelin/test-helpers");

contract("Staking", (accounts) => {
  const [owner, feeAddress, user] = accounts;

  let staking;
  let mockToken;

  beforeEach(async () => {
    // Deploy mock token
    mockToken = await Token.new("MockToken", "MTK", 18, web3.utils.toWei("1000000", "ether"));
    
    // Deploy staking contract
    staking = await Staking.new(mockToken.address, feeAddress);

    // Allocate tokens to user
    await mockToken.transfer(user, web3.utils.toWei("1000", "ether"), { from: owner });

    // Approve staking contract to spend user's tokens
    await mockToken.approve(staking.address, web3.utils.toWei("1000", "ether"), { from: user });
  });

  it("should allow user to deposit tokens and start earning rewards", async () => {
    // Deposit tokens
    await staking.deposit(web3.utils.toWei("100", "ether"), 1, { from: user });

    const userInfo = await staking.getStakedTokens(user);
    expect(userInfo.toString()).to.equal(web3.utils.toWei("100", "ether"));
  });

  it("should calculate rewards correctly based on APY and duration", async () => {
    // Start rewards
    await staking.startReward({ from: owner });

    // Deposit tokens with APY option 1 (30 days, 10% APY)
    await staking.deposit(web3.utils.toWei("100", "ether"), 1, { from: user });

    // Fast-forward time by 15 days
    await time.increase(time.duration.days(15));

    // Calculate rewards
    const reward = await staking.getStakedItemReward(user, 0);
    expect(reward.toString()).to.not.equal("0");
  });

  it("should handle early withdrawal with penalties", async () => {
    // Deposit tokens with APY option 1
    await staking.deposit(web3.utils.toWei("100", "ether"), 1, { from: user });

    // Withdraw before duration
    await staking.withdraw(0, { from: user });

    const userBalance = await mockToken.balanceOf(user);
    expect(userBalance.toString()).to.be.lessThan(web3.utils.toWei("1000", "ether"));
  });

  it("should distribute withdrawal fees to feeAddress", async () => {
    // Deposit and withdraw tokens
    await staking.deposit(web3.utils.toWei("100", "ether"), 1, { from: user });
    await staking.withdraw(0, { from: user });

    const feeBalance = await mockToken.balanceOf(feeAddress);
    expect(feeBalance.toString()).to.not.equal("0");
  });

  it("should allow the owner to update APYs", async () => {
    // Update APYs
    await staking.updateApy(20, 25, 30, { from: owner });

    // Check new APYs
    const newApy1 = await staking.apy1();
    const newApy2 = await staking.apy2();
    const newApy3 = await staking.apy3();

    expect(newApy1.toString()).to.equal("20");
    expect(newApy2.toString()).to.equal("25");
    expect(newApy3.toString()).to.equal("30");
  });
});
