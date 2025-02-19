const Token = artifacts.require("ERC20DecimalsMock");
const Airdrop = artifacts.require("Airdrop");

const TokenName = process.env.TOKEN_NAME || "MyToken";
const TokenSymbol = process.env.TOKEN_SYMBOL || "MTK";

module.exports = async function (deployer, network, accounts) {
  const deployerAccount = accounts[0]; // Deploy using accounts[0]
  console.log("🚀 Deploying from:", deployerAccount);

  // Deploy the token contract with an initial supply
  const initialSupply = web3.utils.toWei("1000000", "ether"); // 1,000,000 MTK
  await deployer.deploy(Token, TokenName, TokenSymbol, 18, { from: deployerAccount });
  const mockToken = await Token.deployed();
  console.log("✅ Token deployed at:", mockToken.address);

  // Mint tokens to the deployer account
  await mockToken.mint(deployerAccount, initialSupply, { from: deployerAccount });
  let deployerBalance = await mockToken.balanceOf(deployerAccount);
  console.log("💰 Deployer Balance:", web3.utils.fromWei(deployerBalance.toString(), "ether"), "MTK");

  // Deploy the Airdrop contract
  // Set the airdrop amount per claim (e.g., 100 tokens per user)
  const airdropAmount = web3.utils.toWei("100", "ether");
  await deployer.deploy(Airdrop, mockToken.address, airdropAmount, { from: deployerAccount });
  const airdrop = await Airdrop.deployed();
  console.log("✅ Airdrop contract deployed at:", airdrop.address);

  // Fund the Airdrop contract with tokens (e.g., 100,000 tokens)
  const airdropFund = web3.utils.toWei("100000", "ether");
  await mockToken.transfer(airdrop.address, airdropFund, { from: deployerAccount });
  let airdropBalance = await mockToken.balanceOf(airdrop.address);
  console.log("💰 Airdrop Contract Balance:", web3.utils.fromWei(airdropBalance.toString(), "ether"), "MTK");

  console.log("🚀 Deployment complete!");
};
