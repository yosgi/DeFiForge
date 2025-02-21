const { expect } = require("chai");
const { time } = require("@openzeppelin/test-helpers");

// Import contracts
const ERC20DecimalsMock = artifacts.require("ERC20DecimalsMock");
const VaultModule = artifacts.require("VaultModule");
const NFTModule = artifacts.require("NFTModule");
const FlashloanModule = artifacts.require("FlashloanModule");
const LendingPool = artifacts.require("LendingPool");
const ERC721Mock = artifacts.require("ERC721Mock");
const FlashLoanReceiverMock = artifacts.require("FlashLoanReceiverMock");

contract("LendingPool", (accounts) => {
  const [owner, feeAddress, user, flashLoanReceiverAddr] = accounts;

  let token, vaultModule, nftModule, flashloanModule, lendingPool, nft, flashLoanReceiver;

  beforeEach(async () => {
    // Deploy ERC20 mock token and mint tokens
    token = await ERC20DecimalsMock.new("MockToken", "MTK", 18, { from: owner });
    await token.mint(owner, web3.utils.toWei("1000000", "ether"), { from: owner });
    // Transfer tokens to user
    await token.transfer(user, web3.utils.toWei("1000", "ether"), { from: owner });
    // Approve VaultModule to spend user's tokens if needed later
    await token.approve(owner, web3.utils.toWei("1000", "ether"), { from: user });

    // Deploy VaultModule and NFTModule, FlashloanModule
    vaultModule = await VaultModule.new({ from: owner });
    nftModule = await NFTModule.new({ from: owner });
    flashloanModule = await FlashloanModule.new({ from: owner });

    // Deploy LendingPool with addresses of the above modules
    lendingPool = await LendingPool.new(vaultModule.address, nftModule.address, flashloanModule.address, { from: owner });

    // // Deploy ERC721 mock contract and mint an NFT to user
    // nft = await ERC721Mock.new("MockNFT", "MNFT", { from: owner });
    // await nft.mint(user, 1, { from: owner });
    // await nft.approve(nftModule.address, 1, { from: user });

    // // Deploy FlashLoanReceiverMock for flashloan testing
    // flashLoanReceiver = await FlashLoanReceiverMock.new({ from: flashLoanReceiverAddr });
  });

  it("should allow user to deposit ERC20 tokens via LendingPool", async () => {
    const depositAmount = web3.utils.toWei("100", "ether");
    // Approve VaultModule to spend user's tokens
    await token.approve(vaultModule.address, depositAmount, { from: user });
    // User calls deposit on LendingPool, which delegates to VaultModule
    await lendingPool.deposit(token.address, depositAmount, { from: user });
    // Verify deposit by checking user balance in vault
    const userVaultBalance = await vaultModule.getBalance(token.address, user);
    console.log("userVaultBalance", userVaultBalance.toString());
    expect(userVaultBalance.toString()).to.equal(depositAmount);
  });

  it("should allow user to borrow tokens via LendingPool", async () => {
    const collateralAmount = web3.utils.toWei("200", "ether");
    const borrowAmount = web3.utils.toWei("50", "ether");
    await token.approve(vaultModule.address, collateralAmount, { from: user });
    // First, user deposits collateral to enable borrowing.
    await lendingPool.deposit(token.address, collateralAmount, { from: user });
    
    // Record user's token balance after collateral deposit.
    // Note: deposit transfers collateral from user to the pool, so user's balance will decrease.
    const preBorrowBalance = await token.balanceOf(user);
    
    // User borrows tokens via LendingPool (which delegates to VaultModule).
    await lendingPool.borrow(token.address, borrowAmount, { from: user });
    
    // After borrowing, user's token balance should increase by exactly borrowAmount.
    const postBorrowBalance = await token.balanceOf(user);
    expect(new web3.utils.BN(postBorrowBalance)).to.be.bignumber.equal(
      new web3.utils.BN(preBorrowBalance).add(new web3.utils.BN(borrowAmount))
    );
  });

//   it("should allow user to deposit an NFT via LendingPool", async () => {
//     // User deposits NFT through LendingPool, which delegates to NFTModule
//     await lendingPool.depositNFT(nft.address, 1, { from: user });
//     // Verify NFT deposit by checking NFTModule storage
//     // 假设 NFTModule 提供了 getDepositedNFTs(user, nftAddress) 方法
//     const depositedNFTs = await nftModule.getDepositedNFTs(user, nft.address);
//     expect(depositedNFTs.length).to.equal(1);
//     expect(depositedNFTs[0].toString()).to.equal("1");
//   });

//   it("should execute flashloan successfully", async () => {
//     // Prepare flashloan parameters
//     const tokens = [token.address];
//     const amounts = [web3.utils.toWei("100", "ether")];
//     const data = "0x"; // arbitrary data
//     // Call flashloan via LendingPool, delegating to FlashloanModule
//     await lendingPool.flashloan(flashLoanReceiver.address, tokens, amounts, data, { from: user });
//     // Verify flashloan execution by checking the receiver's state (assuming flashLoanReceiver sets a flag)
//     const flashloanExecuted = await flashLoanReceiver.flashloanExecuted();
//     expect(flashloanExecuted).to.equal(true);
//   });
});
