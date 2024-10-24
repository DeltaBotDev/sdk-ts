'use client';
import useNearWallet from '@/hooks/useNearWallet';
import React, { useMemo, createContext, useContext, useEffect, useState } from 'react';
import {
  ConnectionProvider,
  WalletProvider as _SolanaWalletProvider,
} from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import useSolanaWallet, { setupSolanaWallet } from '@/hooks/useSolanaWallet';
import '@near-wallet-selector/modal-ui/styles.css';
import '@solana/wallet-adapter-react-ui/styles.css';

type WalletContextExposes = {
  near: ReturnType<typeof useNearWallet>;
  solana: ReturnType<typeof useSolanaWallet>;
};

const WalletContext = createContext<WalletContextExposes>({} as WalletContextExposes);

export default function WalletProvider({ children }: { children: React.ReactNode }) {
  const nearWalletHook = useNearWallet();

  const exposes = {
    near: nearWalletHook,
  } as WalletContextExposes;

  return (
    <WalletContext.Provider value={exposes}>
      <SolanaWalletProvider>{children}</SolanaWalletProvider>
    </WalletContext.Provider>
  );
}

export function SolanaWalletProvider({ children }: { children: React.ReactNode }) {
  const { endpoint } = setupSolanaWallet();

  return (
    <ConnectionProvider endpoint={endpoint}>
      <_SolanaWalletProvider
        wallets={[]}
        autoConnect
        onError={(e) => console.log('_SolanaWalletProvider', e)}
      >
        <WalletModalProvider>{children}</WalletModalProvider>
      </_SolanaWalletProvider>
    </ConnectionProvider>
  );
}

export function useWalletContext() {
  const [currentChain, setCurrentChain] = useState<'near' | 'solana'>('near');
  const walletHooks = useContext(WalletContext);
  const solanaWalletHooks = useSolanaWallet();

  useEffect(() => {
    walletHooks.solana = solanaWalletHooks;
  }, [solanaWalletHooks, walletHooks]);

  const wallet = useMemo(() => {
    switch (currentChain) {
      case 'near':
        return walletHooks.near;
      case 'solana':
        return solanaWalletHooks;
    }
  }, [currentChain, solanaWalletHooks, walletHooks.near]);

  return {
    ...walletHooks,
    solana: solanaWalletHooks,
    currentChain,
    setCurrentChain,
    wallet,
  };
}
