'use client';
import useNearWallet from '@/hooks/useNearWallet';
import React, { useMemo, createContext, useContext, useEffect } from 'react';
import {
  ConnectionProvider,
  WalletProvider as _SolanaWalletProvider,
} from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import useSolanaWallet, { setupSolanaWallet } from '@/hooks/useSolanaWallet';
import '@near-wallet-selector/modal-ui/styles.css';
import '@solana/wallet-adapter-react-ui/styles.css';
import { useStorageState } from '@/hooks/useHooks';

type WalletContextExposes = {
  currentChain: 'near' | 'solana';
  setCurrentChain: (chain: 'near' | 'solana') => void;
  near: ReturnType<typeof useNearWallet>;
  solana: ReturnType<typeof useSolanaWallet>;
};

const WalletContext = createContext<WalletContextExposes>({} as WalletContextExposes);

export default function WalletProvider({ children }: { children: React.ReactNode }) {
  const [currentChain, setCurrentChain] = useStorageState<'near' | 'solana'>(
    'currentChain',
    'near',
  );
  const nearWalletHook = useNearWallet();

  const exposes = {
    currentChain,
    setCurrentChain,
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
    <ConnectionProvider endpoint={endpoint!}>
      <_SolanaWalletProvider
        wallets={[]}
        autoConnect
        onError={(e) => console.log('solana wallet adapter error', e)}
      >
        <WalletModalProvider>{children}</WalletModalProvider>
      </_SolanaWalletProvider>
    </ConnectionProvider>
  );
}

export function useWalletContext() {
  const { currentChain, ...walletHooks } = useContext(WalletContext);
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
    wallet,
  };
}
