// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./libraries/VaultAccounting.sol";

contract VaultModule {
    using VaultAccounting for PoolStructs.Vault;

    mapping(address => PoolStructs.TokenVault) private vaults;

    event Deposit(address indexed user, address indexed token, uint256 amount, uint256 shares);
    event Borrow(address indexed user, address indexed token, uint256 amount, uint256 shares);
    event Repay(address indexed user, address indexed token, uint256 amount, uint256 shares);
    event Withdraw(address indexed user, address indexed token, uint256 amount, uint256 shares);

    function deposit(address token, uint256 amount, address user) external returns (uint256 shares) {
        require(amount > 0, "Invalid amount");
        shares = vaults[token].totalAsset.toShares(amount, false);
        vaults[token].totalAsset.amount += uint128(amount);
        vaults[token].totalAsset.shares += uint128(shares);

        IERC20(token).transferFrom(user, address(this), amount);
        emit Deposit(user, token, amount, shares);
    }

    function borrow(address token, uint256 amount, address user) external returns (uint256 shares) {
        shares = vaults[token].totalBorrow.toShares(amount, false);
        vaults[token].totalBorrow.amount += uint128(amount);
        vaults[token].totalBorrow.shares += uint128(shares);

        IERC20(token).transfer(user, amount);
        emit Borrow(user, token, amount, shares);
    }

    function repay(address token, uint256 amount, address user) external returns (uint256 shares) {
        shares = vaults[token].totalBorrow.toShares(amount, true);
        vaults[token].totalBorrow.amount -= uint128(amount);
        vaults[token].totalBorrow.shares -= uint128(shares);

        IERC20(token).transferFrom(user, address(this), amount);
        emit Repay(user, token, amount, shares);
    }

    function withdraw(address token, uint256 shares, address user) external returns (uint256 amount) {
        amount = vaults[token].totalAsset.toAmount(shares, true);
        vaults[token].totalAsset.amount -= uint128(amount);
        vaults[token].totalAsset.shares -= uint128(shares);

        IERC20(token).transfer(user, amount);
        emit Withdraw(user, token, amount, shares);
    }
}
