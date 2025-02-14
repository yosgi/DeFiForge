"use client";

import React, { useState, useEffect } from "react";
import { Connection, PublicKey, Keypair, clusterApiUrl } from "@solana/web3.js";
import { getOrCreateAssociatedTokenAccount, mintTo, transfer, getAccount } from "@solana/spl-token";

const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

// 🟢 你的 FORGE 代币 Mint 地址
const FORGE_MINT_ADDRESS = new PublicKey("GvUJZDTR5aQw62jUuqShXrEnBwKaZFjiniS6zXtzWD4f");

// 🟢 你的空投管理钱包（应是持有 FORGE 的地址）
const FORGE_AIRDROP_AUTHORITY = Keypair.fromSecretKey(Uint8Array.from([99,193,94,159,14,175,111,4,150,201,246,140,143,30,21,167,176,214,141,250,78,56,154,95,139,103,100,166,221,123,50,128,45,200,98,108,164,4,51,145,237,3,85,208,80,173,50,135,156,162,143,205,58,113,229,45,241,191,143,101,193,144,30,202])); // 你的钱包私钥（仅用于本地测试，不要暴露）

const Page = () => {
  const [wallet, setWallet] = useState<PublicKey | null>(null);
  const [canClaimForge, setCanClaimForge] = useState(true);
  const [timeRemaining, setTimeRemaining] = useState(0);

  // 连接钱包
  const connectWallet = async () => {
    if (window.solana) {
      try {
        const response = await window.solana.connect();
        console.log("Wallet connected:", response.publicKey.toString());
        setWallet(response.publicKey);
      } catch (error) {
        console.error("Wallet connection failed", error);
      }
    } else {
      alert("Please install Phantom Wallet!");
    }
  };

  // 领取 FORGE 代币（Airdrop）
  const handleClaimForge = async () => {
    if (!wallet || !canClaimForge) return;

    try {
      // 获取用户的 SPL 代币账户（如果不存在则创建）
      const userTokenAccount = await getOrCreateAssociatedTokenAccount(
        connection,
        FORGE_AIRDROP_AUTHORITY,
        FORGE_MINT_ADDRESS,
        wallet
      );

      console.log("User Token Account:", userTokenAccount.address.toBase58());

      // 发送空投（Airdrop 100 FORGE 代币）
      const tx = await transfer(
        connection,
        FORGE_AIRDROP_AUTHORITY,
        userTokenAccount.address,
        userTokenAccount.address,
        FORGE_AIRDROP_AUTHORITY,
        100 * 10 ** 6 // FORGE 代币有 6 位小数，100 FORGE = 100_000_000
      );

      console.log("Airdrop successful:", tx);

      // 记录领取时间
      localStorage.setItem("lastClaimTime", Date.now().toString());
      setCanClaimForge(false);
      setTimeRemaining(6 * 60 * 60 * 1000); // 6小时冷却

    } catch (error) {
      console.error("Airdrop failed:", error);
    }
  };

  // 检查冷却时间
  useEffect(() => {
    const lastClaimTime = localStorage.getItem("lastClaimTime");
    if (lastClaimTime) {
      const elapsedTime = Date.now() - parseInt(lastClaimTime, 10);
      const cooldown = 6 * 60 * 60 * 1000;
      if (elapsedTime < cooldown) {
        setCanClaimForge(false);
        setTimeRemaining(cooldown - elapsedTime);
      }
    }
  }, []);

  // 倒计时逻辑
  useEffect(() => {
    if (!canClaimForge && timeRemaining > 0) {
      const interval = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1000) {
            clearInterval(interval);
            setCanClaimForge(true);
            return 0;
          }
          return prev - 1000;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [canClaimForge, timeRemaining]);

  // 格式化倒计时
  const formatTime = (ms: number) => {
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((ms % (1000 * 60)) / 1000);
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  return (
    <div className="space-y-8 p-4 max-w-3xl mx-auto">
      {/* Section 1: Wallet Connection */}
      <section className="bg-gray-100 p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-4">Connect Your Wallet</h2>
        <button
          onClick={connectWallet}
          className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          {wallet ? `Wallet: ${wallet.toBase58().slice(0, 6)}...` : "Connect Wallet"}
        </button>
      </section>

      {/* Section 2: FORGE Airdrop */}
      <section className="bg-gray-100 p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-4">Claim Your FORGE Tokens</h2>
        <p className="text-gray-700 mb-4">
          FORGE is our platform's utility token, designed to empower users and
          facilitate interactions within the ecosystem. Claim your FORGE tokens and start exploring the benefits today!
        </p>
        <button
          onClick={handleClaimForge}
          disabled={!canClaimForge}
          className={`px-6 py-2 rounded ${
            canClaimForge
              ? "bg-green-500 text-white hover:bg-green-600"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
        >
          {canClaimForge ? "Claim FORGE Tokens" : `Wait ${formatTime(timeRemaining)}`}
        </button>
        {!canClaimForge && (
          <p className="mt-2 text-gray-600">
            You can claim your next FORGE tokens in{" "}
            <span className="font-bold">{formatTime(timeRemaining)}</span>.
          </p>
        )}
      </section>
    </div>
  );
};

export default Page;
