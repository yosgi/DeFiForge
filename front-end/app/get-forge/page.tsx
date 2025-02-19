"use client";
import React, { useContext, useEffect } from "react";
import Button from "../components/Button";
import { useAirdrop } from "../hooks/useAirdrop"; 
import { WalletContext } from "../contexts/WalletContext"; // Import WalletContext
import useMessage  from "../hooks/useMessage";
import Message from "../components/Message";

const Page = () => {
  const { connectWallet, currentAccount } = useContext(WalletContext); // Get wallet context
  const { claimAirdrop, isClaiming,isClaimed } = useAirdrop(currentAccount); // Use the airdrop hook
  const { messageState, showMessage, closeMessage } = useMessage();
  // Handle claiming FORGE tokens
  const handleClaimForge = async () => {
    if (!currentAccount) {
      console.error("❌ Wallet not connected!");
      return;
    }

    try {
      await claimAirdrop(); // Call airdrop claim function
      showMessage("🎉 FORGE tokens successfully claimed!", "success");
    } catch (error) {
      console.error("❌ Claiming failed:", error);
    }
  };

  return (
    <div className="mt-16 space-y-8 p-4 max-w-3xl mx-auto">
      {/* Section 1: Sepolia Introduction */}
      <section className="bg-gray-100 p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-4">What is Sepolia?</h2>
        <p className="text-gray-700 mb-4">
          Sepolia is an Ethereum testnet designed for developers to experiment
          with dApps and smart contracts in a safe and controlled environment.
        </p>
        <p className="text-gray-700 mb-4">
          To get started, you'll need some Sepolia tokens. These tokens are
          free and can be used to deploy and test your projects.
        </p>
        <Button
          size="large"
          onClick={() => window.open("https://sepoliafaucet.com/", "_blank")}
        >
          Get Sepolia Tokens
        </Button>
      </section>

      {/* Section 2: FORGE Token Introduction */}
      <section className="bg-gray-100 p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-4">FORGE Token AirDrop</h2>
        <p className="text-gray-700 mb-4">
          FORGE is our platform's utility token, designed to empower users and
          facilitate interactions within the ecosystem. Claim your FORGE tokens
          and start play!
        </p>

        {/* If wallet is not connected, show "Connect Wallet" button */}
        {!currentAccount ? (
          <Button size="large" onClick={connectWallet} className="text-white">
            Connect Wallet
          </Button>
        ) : (
          <Button
            size="large"
            onClick={handleClaimForge}
            disabled={isClaiming || isClaimed}
            className={`px-6 py-2 rounded ${
              isClaiming
                ? " text-gray-500 cursor-not-allowed"
                : "text-white "
            }`}
          >
            {isClaiming ? "Claiming..." : isClaimed? "Already Claimed":"Claim FORGE Tokens"}
          </Button>
        )}
      </section>
      {messageState.isOpen && (
        <Message
          message={messageState.message}
          type={messageState.type}
          onClose={closeMessage}
        />
      )}
    </div>
  );
};

export default Page;
