"use client";
import React, { ReactNode } from "react";
import { WalletProvider } from "./contexts/WalletContext";
import { StakingProvider } from "./contexts/StakingContext";
import { ContractsProvider} from "./contexts/ContractContext";
interface ClientWrapperProps {
    children: ReactNode;
}

const ClientWrapper: React.FC<ClientWrapperProps> = ({ children }) => {
    return (
       
        <WalletProvider>
            <ContractsProvider>
                {children}
            </ContractsProvider>
        </WalletProvider>
        
    );
};
export default ClientWrapper;