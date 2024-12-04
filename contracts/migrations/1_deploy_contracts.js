const Staking = artifacts.require("Staking");
const Token = artifacts.require("ERC20DecimalsMock");

module.exports = async function (deployer, network, accounts) {
  // Deploy a mock ERC20 token for staking and rewards
  await deployer.deploy(Token, "MockToken", "MTK", 18);
  const mockToken = await Token.deployed();

  // // Deploy the Staking contract
  // await deployer.deploy(Staking, mockToken.address, accounts[1]); // accounts[1] as feeAddress
  // const staking = await Staking.deployed();

  // console.log("MockToken deployed at:", mockToken.address);
  // console.log("Staking deployed at:", staking.address);
};
