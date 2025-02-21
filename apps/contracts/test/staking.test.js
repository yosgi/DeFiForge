const Staking = artifacts.require("Staking");
const Token = artifacts.require("ERC20DecimalsMock");

const { expect } = require("chai");
const { time } = require("@openzeppelin/test-helpers");

contract("Staking", (accounts) => {
  const [owner, feeAddress, user] = accounts;

  let staking;
  let rewardToken;

  beforeEach(async () => {
    // Deploy reward token
    rewardToken = await Token.new("RewardToken", "RTK", 18);

    // Deploy staking contract with Sepolia ETH (address 0) and reward token
    staking = await Staking.new(rewardToken.address, feeAddress, { from: owner });

    // Mint reward tokens to the staking contract for distribution
    await rewardToken.mint(staking.address, web3.utils.toWei("100000", "ether"));
    await staking.startReward({ from: owner });
  });

  it("should allow user to stake ETH and record deposit", async () => {
    const depositAmount = web3.utils.toWei("1", "ether"); // 1 ETH

    // Stake ETH
    await staking.deposit(1, { from: user, value: depositAmount });

    const userStaked = await staking.getStakedTokens(user);
    expect(userStaked.toString()).to.equal(depositAmount);
  });

  it("should calculate rewards correctly based on APY and duration", async () => {
    const depositAmount = web3.utils.toWei("1", "ether");

    // Stake ETH with APY option 1 (30 days, 10% APY)
    await staking.deposit(1, { from: user, value: depositAmount });

    // Fast-forward time by 15 days
    await time.increase(time.duration.days(15));

    // Calculate rewards
    const reward = await staking.getStakedItemReward(user, 0);
    expect(reward.toString()).to.not.equal("0");
  });

  it("should handle early withdrawal with penalties", async () => {
    const depositAmount = web3.utils.toWei("1", "ether");

    // Stake ETH
    await staking.deposit(1, { from: user, value: depositAmount });

    // Withdraw before duration
    const userInitialBalance = await web3.eth.getBalance(user);
    const tx = await staking.withdraw(0, { from: user});

    const userFinalBalance = await web3.eth.getBalance(user);
    expect(new web3.utils.BN(userFinalBalance)).to.be.bignumber.greaterThan(new web3.utils.BN(userInitialBalance));
  });

  it("should distribute withdrawal fees to feeAddress", async () => {
    const depositAmount = web3.utils.toWei("1", "ether");

    // Stake ETH and withdraw
    await staking.deposit(1, { from: user, value: depositAmount });
    await staking.withdraw(0, { from: user });

    const feeBalance = await web3.eth.getBalance(feeAddress);
    expect(new web3.utils.BN(feeBalance)).to.be.bignumber.greaterThan(new web3.utils.BN("0"));
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
