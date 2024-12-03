"use client";
import { useState } from "react";

const StakingPage = () => {
  const [tab, setTab] = useState("FORGE");

  const stakingData = {
    FORGE: {
      totalStaked: "200.00M",
      usdValue: "$180.00M",
      stakingAPR: "8.50%",
      rewardToken: "IGNIS",
      walletBalance: "1,000", // Example wallet balance
    },
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header */}
      <div className="text-center mb-8">
        <p className="text-sm text-primary-dark font-medium">
          Available on Ethereum Mainnet
        </p>
        <h1 className="text-2xl sm:text-3xl font-bold text-primary">
          Stake FORGE to Earn IGNIS
        </h1>
        <p className="text-sm sm:text-base text-gray-500 mt-3">
          FORGE holders (Ethereum network only) can stake their tokens to earn **IGNIS**
          rewards while contributing to the security and growth of the platform. In rare
          cases of instability, your stake may be partially slashed to mitigate risks,
          adding an additional layer of protection to the protocol.
        </p>
        <a
          href="#"
          className="text-primary text-sm sm:text-base font-medium underline mt-2"
        >
          Learn more about risks involved
        </a>
      </div>

      {/* Stats */}
      <div className="flex flex-col sm:flex-row justify-between items-center bg-gray-100 p-4 rounded-md">
        <div className="mb-4 sm:mb-0">
          <p className="text-gray-500 text-sm">Total FORGE Staked</p>
          <p className="font-semibold text-xl text-gray-800 sm:text-2xl">{stakingData.FORGE.totalStaked}</p>
        </div>
        <div>
          <p className="text-gray-500 text-sm">Staking APR</p>
          <p className="font-semibold text-gray-800 text-xl sm:text-2xl">{stakingData.FORGE.stakingAPR}</p>
        </div>
      </div>

      {/* Tabs */}
      {/* <div className="mt-8 border-b border-gray-200">
        <button
          onClick={() => setTab("FORGE")}
          className={`pb-2 ${
            tab === "FORGE"
              ? "border-b-2 border-primary text-primary font-semibold"
              : "text-gray-500"
          }`}
        >
          Stake FORGE
        </button>
      </div> */}

      {/* Staking Details */}
      <div className="mt-8 bg-white p-6 rounded-md shadow-md">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
          <div>
            <h2 className="text-lg sm:text-xl font-semibold text-primary">
              Stake FORGE
            </h2>
            <p className="text-sm text-primary-light mt-1">
              Total staked: {stakingData.FORGE.totalStaked} ({stakingData.FORGE.usdValue})
            </p>
          </div>
        </div>
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex justify-between">
            <p className="text-gray-500 text-sm">Staking APR</p>
            <p className="font-semibold text-gray-800">{stakingData.FORGE.stakingAPR}</p>
          </div>
          <div className="flex justify-between">
            <p className="text-gray-500 text-sm">Rewards Token</p>
            <p className="font-semibold text-gray-800">{stakingData.FORGE.rewardToken}</p>
          </div>
        </div>

        {/* Wallet Balance */}
        <div className="mt-6">
          <p className="text-sm text-gray-500">Wallet Balance</p>
          <p className="font-semibold text-gray-800">
            {stakingData.FORGE.walletBalance} FORGE
          </p>
          <button className="mt-4 w-full bg-primary text-white py-2 rounded-md text-sm sm:text-base font-medium">
            Stake FORGE
          </button>
        </div>

        {/* Stake Info */}
        <div className="mt-8 border-t border-gray-200 pt-4">
          <h3 className="text-gray-800 font-semibold text-sm sm:text-base">
            Staked FORGE
          </h3>
          <div className="mt-2 text-gray-500 text-sm">0 FORGE</div>
        </div>
      </div>
    </div>
  );
};

export default StakingPage;
