import { useState, useEffect } from "react";

interface Contracts {
  TOKEN_CONTRACT_ADDRESS: string;
  STAKING_CONTRACT_ADDRESS: string;
  AIRDROP_CONTRACT_ADDRESS: string;
}

export const useContracts = () => {
  const [contracts, setContracts] = useState<Contracts | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchContracts() {
      try {
        const res = await fetch("/contracts/contracts.json");
        if (!res.ok) {
          throw new Error("Failed to fetch contract addresses");
        }
        const data = await res.json();
        setContracts(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchContracts();
  }, []);

  return { contracts, loading, error };
};
