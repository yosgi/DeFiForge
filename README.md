# Next.js DeFi Platform Starter

A starter kit for building DeFi (Decentralized Finance) applications with Next.js. This starter kit includes features such as staking, lending/borrowing, and an admin dashboard to manage the platform.

---

## **Features**

### **1. Staking**
- Users can stake tokens and choose from different staking options with varying APYs and durations.
- Rewards are distributed based on the staking duration and the Annual Percentage Yield (APY) selected by the user.

### **2. Lending and Borrowing**
- Users can execute common supply/borrow/repay operations:
  - **Supply ERC20 tokens** as collateral.
  - **Borrow ERC20 tokens** against supplied collateral.
  - **Repay borrowed tokens** with interest paid to lenders.
- The platform supports **NFTs (ERC721 tokens)** as collateral using the `depositNFT` feature, similar to the AAVE protocol.
- Interest rates are dynamically calculated based on supply and demand.

### **3. Admin Dashboard**
- Admins can manage the platform with dedicated tools:
  - **Track user activity**: View staking, borrowing, and lending statistics.
  - **Manage rewards and parameters**: Update APYs, token settings, and other key configurations.
  - **Review collateral**: Monitor and manage user-deposited NFTs or tokens.

---

## **Getting Started**

### **1. Prerequisites**
Make sure you have the following tools installed:
- [Node.js](https://nodejs.org/) (v16+)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)

### **2. Clone the Repository**
```bash
git clone git@github.com:yosgi/DeFiForge.git

