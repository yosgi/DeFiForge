"use client";
import { useState } from "react";
import { useStaking } from "../hooks/useStaking";
import Modal from "../components/Modal";
import Message from "../components/Message";
import useMessage from "../hooks/useMessage";

const StakingPage = () => {
  // Modal states for staking and withdraw actions
  const [isStakeModalOpen, setIsStakeModalOpen] = useState(false);
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  // Input states
  const [stakeAmount, setStakeAmount] = useState<string>("");
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [emergencyWithdrawAmount, setEmergencyWithdrawAmount] = useState<string>("");

  // Retrieve staking data and methods from hook (real data)
  const { 
    userStakedAmount, 
    rewardsAvailable, 
    totalStaked, 
    withdrawFee, 
    loading, 
    stakeTokens, 
    withdrawTokens,
    emergencyWithdraw
  } = useStaking();

  const { messageState, showMessage, closeMessage } = useMessage();

  // Open/close functions for stake and withdraw modals
  const openStakeModal = () => setIsStakeModalOpen(true);
  const closeStakeModal = () => {
    setIsStakeModalOpen(false);
    setSelectedOption(null);
    setStakeAmount("");
  };

  const openWithdrawModal = () => setIsWithdrawModalOpen(true);
  const closeWithdrawModal = () => setIsWithdrawModalOpen(false);

  // Handle staking action
  const handleStake = async () => {
    if (!stakeAmount || !selectedOption) {
      showMessage("Please enter an amount and select a duration", "warning");
      return;
    }
    const success = await stakeTokens(stakeAmount, selectedOption);
    if (success) {
      showMessage("Tokens staked successfully!", "success");
    } else {
      showMessage("Failed to stake tokens. Please try again.", "error");
    }
    closeStakeModal();
  };

  // Handle user withdraw action (here, for demonstration, we withdraw using index 0)
  const handleWithdraw = async () => {
    const success = await withdrawTokens(0);
    if (success) {
      showMessage(`Tokens withdrawn successfully! Withdraw fee: ${withdrawFee}% applied.`, "success");
    } else {
      showMessage("Failed to withdraw tokens. Please try again.", "error");
    }
    closeWithdrawModal();
  };

  // Handle emergency withdraw (admin only)
  const handleEmergencyWithdraw = async () => {
    if (!emergencyWithdrawAmount) {
      showMessage("Please enter an amount for emergency withdrawal", "warning");
      return;
    }
    const success = await emergencyWithdraw(emergencyWithdrawAmount);
    if (success) {
      showMessage("Emergency withdrawal successful!", "success");
    } else {
      showMessage("Emergency withdrawal failed. Please try again.", "error");
    }
    setEmergencyWithdrawAmount("");
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header */}
      <div className="text-center mb-8">
        <p className="text-sm text-primary-dark font-medium">Available on Ethereum Mainnet</p>
        <h1 className="text-2xl sm:text-3xl font-bold text-primary">Stake Sepolia to Earn FORGE</h1>
        <p className="text-sm sm:text-base text-gray-500 mt-3">
          Sepolia holders (Ethereum network only) can stake their tokens to earn FORGE rewards while contributing to the security and growth of the platform. In rare cases of instability, your stake may be partially slashed to mitigate risks, adding an additional layer of protection.
        </p>
        <a href="#" className="text-primary text-sm sm:text-base font-medium underline mt-2">
          Learn more about risks involved
        </a>
      </div>

      

      {/* Global Stats */}
      <div className="flex flex-col sm:flex-row justify-between items-center bg-gray-100 p-4 rounded-md shadow-sm">
        <div className="mb-4 sm:mb-0">
          <p className="text-gray-500 text-sm">Total Sepolia Staked</p>
          <p className="font-semibold text-xl text-gray-800 sm:text-2xl">{totalStaked} ETH</p>
        </div>
        <div>
          <p className="text-gray-500 text-sm">Withdraw Fee</p>
          <p className="font-semibold text-xl text-gray-800 sm:text-2xl">{withdrawFee}%</p>
        </div>
      </div>

        {/* Staking Rules Section */}
        <div className="mt-8 bg-white p-6 rounded-md shadow-lg">
        <h2 className="text-lg sm:text-xl font-semibold text-primary">Staking Rules</h2>
        <ul className="mt-4 space-y-3 text-gray-700 text-sm">
          <li>
            <strong>Option 1:</strong> Stake for <strong>30 days</strong> at an APY of <strong>10%</strong>.
            Rewards are calculated as (Amount * 10% * (days staked / 365)) FORGE tokens.
          </li>
          <li>
            <strong>Option 2:</strong> Stake for <strong>60 days</strong> at an APY of <strong>15%</strong>.
            Rewards are calculated as (Amount * 15% * (days staked / 365)) FORGE tokens.
          </li>
          <li>
            <strong>Option 3:</strong> Stake for <strong>120 days</strong> at an APY of <strong>27%</strong>.
            Rewards are calculated as (Amount * 27% * (days staked / 365)) FORGE tokens.
          </li>
        </ul>
      </div>

      {/* Staking Details */}
      <div className="mt-8 bg-white p-6 rounded-md shadow-lg">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
          <div>
            <h2 className="text-lg sm:text-xl font-semibold text-primary">Stake Sepolia</h2>
            <p className="text-sm text-primary-light mt-1">
              Your current staked amount: {userStakedAmount} ETH
            </p>
          </div>
        </div>
        <div className="mt-6">
          <button onClick={openStakeModal} className="mt-4 w-full bg-primary text-white py-2 rounded-md text-sm sm:text-base font-medium">
            Stake ETH
          </button>
        </div>
        {/* Withdraw Section */}
        <div className="mt-8 border-t border-gray-200 pt-4">
          <h3 className="text-gray-800 font-semibold text-sm sm:text-base">Your Staked ETH</h3>
          <div className="mt-2 text-gray-500 text-sm">{userStakedAmount} ETH</div>
          <button onClick={openWithdrawModal} className="mt-4 w-full bg-blue-600 text-white py-2 rounded-md text-sm sm:text-base font-medium">
            Withdraw ETH
          </button>
        </div>
      </div>

    

      {/* Emergency Withdraw Section (Admin Only) */}
      <div className="mt-8 bg-white p-6 rounded-md shadow-lg">
        <h2 className="text-lg sm:text-xl font-semibold text-red-600">Emergency Withdraw (Admin Only)</h2>
        <p className="text-sm text-gray-600 mt-2">Enter the amount to emergency withdraw (in ETH):</p>
        <input 
          type="number"
          placeholder="Amount"
          value={emergencyWithdrawAmount}
          onChange={(e) => setEmergencyWithdrawAmount(e.target.value)}
          className="mt-4 w-full bg-gray-100 text-gray-800 py-2 px-4 rounded-md"
        />
        <button
          onClick={handleEmergencyWithdraw}
          className="mt-4 w-full bg-red-600 text-white py-2 rounded-md text-sm sm:text-base font-medium"
        >
          Emergency Withdraw
        </button>
      </div>

      {/* Stake Modal */}
      <Modal isOpen={isStakeModalOpen} onClose={closeStakeModal} onConfirm={handleStake} title="Stake ETH" isLoading={loading}>
        <p className="text-gray-700 mb-4">
          Enter the amount of ETH you want to stake:
          <input 
            className="mt-4 w-full bg-gray-100 text-gray-800 py-2 px-4 rounded-md" 
            type="number" 
            placeholder="Amount" 
            value={stakeAmount} 
            onChange={(e) => setStakeAmount(e.target.value)} 
          />
        </p>
        {/* Staking Options */}
        <p className="text-gray-700 mb-4">Choose staking duration:</p>
        <div className="flex justify-between space-x-3 mb-6">
          {[1, 2, 3].map((option) => (
            <button
              key={option}
              onClick={() => setSelectedOption(option)}
              className={`py-2 px-4 rounded-md text-sm font-medium ${
                selectedOption === option
                  ? "bg-primary text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {option} {option === 1 ? "Day" : "Days"}
            </button>
          ))}
        </div>
      </Modal>

      {/* Withdraw Modal */}
      <Modal isOpen={isWithdrawModalOpen} onClose={closeWithdrawModal} onConfirm={handleWithdraw} title="Withdraw ETH" isLoading={loading}>
        <p className="text-gray-700 mb-4">
          Confirm withdrawal of your staked ETH.
          <br />
          Note: A withdraw fee of {withdrawFee}% will be applied.
        </p>
      </Modal>

      {messageState.isOpen && (
        <Message message={messageState.message} type={messageState.type} onClose={closeMessage} />
      )}
    </div>
  );
};

export default StakingPage;
