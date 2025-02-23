const Token = artifacts.require("ERC20DecimalsMock");
const Staking = artifacts.require("Staking");
const Airdrop = artifacts.require("Airdrop");
const VaultModule = artifacts.require("VaultModule");
const NFTModule = artifacts.require("NFTModule");
const FlashloanModule = artifacts.require("FlashloanModule");
const LendingPool = artifacts.require("LendingPool");
const TokenName = process.env.TOKEN_NAME || "MyToken";
const TokenSymbol = process.env.TOKEN_SYMBOL || "MTK";

const fs = require("fs");
const path = require("path");

module.exports = async function (deployer, network, accounts) {
  const deployerAccount = accounts[0]; // Use accounts[0] as the deployer
  console.log("🚀 Deploying from:", deployerAccount);

  // 1. Deploy VaultModule
  await deployer.deploy(VaultModule, { from: deployerAccount });
  const vaultModule = await VaultModule.deployed();
  console.log("✅ VaultModule deployed at:", vaultModule.address);

  // 2. Deploy NFTModule
  await deployer.deploy(NFTModule, { from: deployerAccount });
  const nftModule = await NFTModule.deployed();
  console.log("✅ NFTModule deployed at:", nftModule.address);

  // 3. Deploy FlashloanModule
  await deployer.deploy(FlashloanModule, { from: deployerAccount });
  const flashloanModule = await FlashloanModule.deployed();
  console.log("✅ FlashloanModule deployed at:", flashloanModule.address);

  // 4. Deploy LendingPool with the addresses of the above modules.
  await deployer.deploy(LendingPool, vaultModule.address, nftModule.address, flashloanModule.address, { from: deployerAccount });
  const lendingPool = await LendingPool.deployed();
  console.log("✅ LendingPool deployed at:", lendingPool.address);

  // 1. Deploy the Token contract and mint tokens to the deployer account.
  const initialSupply = web3.utils.toWei("1000000", "ether"); // 1,000,000 MTK
  await deployer.deploy(Token, TokenName, TokenSymbol, 18, { from: deployerAccount });
  const mockToken = await Token.deployed();
  console.log("✅ Token deployed at:", mockToken.address);

  // Mint tokens to the deployer account.
  await mockToken.mint(deployerAccount, initialSupply, { from: deployerAccount });
  let deployerBalance = await mockToken.balanceOf(deployerAccount);
  console.log("💰 Deployer Balance:", web3.utils.fromWei(deployerBalance.toString(), "ether"), "MTK");

  // 2. Deploy the Staking contract.
  // Parameters: _rewardToken (token contract address) and _feeAddress (fee address, using accounts[1])
  await deployer.deploy(Staking, mockToken.address, accounts[0], { from: deployerAccount });
  const staking = await Staking.deployed();
  staking.startReward({ from: deployerAccount });
  console.log("✅ Staking contract deployed at:", staking.address);
  const rewardFund = web3.utils.toWei("50000", "ether"); 
  await mockToken.transfer(staking.address, rewardFund, { from: deployerAccount });
  let stakingRewardBalance = await mockToken.balanceOf(staking.address);
  console.log("✅ Staking Contract Reward Balance:", web3.utils.fromWei(stakingRewardBalance.toString(), "ether"), "MTK");

  // 3. Deploy the Airdrop contract.
  // Parameters: Token contract address and airdrop amount per claim (e.g., 100 MTK)
  const airdropAmount = web3.utils.toWei("100", "ether");
  await deployer.deploy(Airdrop, mockToken.address, airdropAmount, { from: deployerAccount });
  const airdrop = await Airdrop.deployed();
  console.log("✅ Airdrop contract deployed at:", airdrop.address);

  // 4. Fund the Airdrop contract with tokens (e.g., 100,000 MTK).
  const airdropFund = web3.utils.toWei("100000", "ether");
  await mockToken.transfer(airdrop.address, airdropFund, { from: deployerAccount });
  let airdropBalance = await mockToken.balanceOf(airdrop.address);
  console.log("💰 Airdrop Contract Balance:", web3.utils.fromWei(airdropBalance.toString(), "ether"), "MTK");

  console.log("🚀 Deployment complete!");


  // Prepare contract addresses
  const contractAddresses = {
    TOKEN_CONTRACT_ADDRESS: mockToken.address,
    STAKING_CONTRACT_ADDRESS: staking.address,
    AIRDROP_CONTRACT_ADDRESS: airdrop.address,
    VAULT_MODULE_ADDRESS: vaultModule.address,
    NFT_MODULE_ADDRESS: nftModule.address,
    FLASHLOAN_MODULE_ADDRESS: flashloanModule.address,
    LENDING_POOL_ADDRESS: lendingPool.address,
  };

  
  let contractsFilePath;
  console.log("📝 Writing contract addresses to JSON file...",network);
  if (network === "opsepolia") {
    contractsFilePath = path.join(__dirname, "../../front-end/public/contracts/opsepolia-contracts.json");
  } else if (network === "ganache") {
    contractsFilePath = path.join(__dirname, "../../front-end/public/contracts/ganache-contracts.json");
  } else {
    contractsFilePath = path.join(__dirname, "../../front-end/public/contracts/contracts.json");
  }

  // Ensure the target directory exists; if not, create it recursively.
  const targetDir = path.dirname(contractsFilePath);
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  // Write the content as JSON
  fs.writeFileSync(contractsFilePath, JSON.stringify(contractAddresses, null, 2), { encoding: "utf8" });
  console.log(`✅ Contract addresses written to ${contractsFilePath}`);
};
