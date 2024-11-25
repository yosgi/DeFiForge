"use client";
import React, { ReactNode } from "react";
import { WalletProvider } from "./contexts/WalletContext";
interface ClientWrapperProps {
    children: ReactNode;
}

const ClientWrapper: React.FC<ClientWrapperProps> = ({ children }) => {
    return (
        <WalletProvider>
            {children}
        </WalletProvider>
    );
};
export default ClientWrapper;