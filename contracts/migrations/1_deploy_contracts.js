const Staking = artifacts.require("Staking");
const Token = artifacts.require("ERC20DecimalsMock");
const TokenName = process.env.TOKEN_NAME;
const TokenSymbol = process.env.TOKEN_SYMBOL;
module.exports = async function (deployer, network, accounts) {
  // Deploy a ERC20 token for staking and rewards
  await deployer.deploy(Token, TokenName, TokenSymbol, 18);
  const mockToken = await Token.deployed();

  //  Deploy the Staking contract
  await deployer.deploy(Staking,mockToken.address, accounts[1]); // accounts[1] as feeAddress
  const staking = await Staking.deployed();
  console.log("Token deployed at:", mockToken.address);
  console.log("Staking deployed at:", staking.address);
};
