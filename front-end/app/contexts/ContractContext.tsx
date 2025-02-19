import React, { createContext, useState, useEffect, ReactNode } from "react";

interface Contracts {
  TOKEN_CONTRACT_ADDRESS: string;
  STAKING_CONTRACT_ADDRESS: string;
  AIRDROP_CONTRACT_ADDRESS: string;
}

interface ContractsContextType {
  contracts: Contracts | null;
  loading: boolean;
  error: string | null;
}

export const ContractsContext = createContext<ContractsContextType>({
  contracts: null,
  loading: true,
  error: null,
});

export const ContractsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [contracts, setContracts] = useState<Contracts | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  console.log("ContractsProvider",contracts);
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

  return (
    <ContractsContext.Provider value={{ contracts, loading, error }}>

      {contracts  && children}
    </ContractsContext.Provider>
  );
};
