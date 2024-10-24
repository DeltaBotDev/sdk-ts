import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import { useEffect, useMemo } from 'react';
import { clusterApiUrl } from '@solana/web3.js';

declare global {
  interface Window {
    solanaWallet?: SolanaWallet;
  }
}

type SolanaWallet = ReturnType<typeof useConnection> &
  ReturnType<typeof useWallet> & {
    selectWallet: () => void;
    isSignedIn: boolean;
    accountId?: string;
  };

export function setupSolanaWallet() {
  const network = 'devnet';

  const endpoint = clusterApiUrl(network);

  return { network, endpoint };
}

export default function useSolanaWallet() {
  const { connection } = useConnection();
  const walletHooks = useWallet();

  const { setVisible } = useWalletModal();

  const _walletHook = useMemo<SolanaWallet>(
    () => ({
      connection,
      ...walletHooks,
      selectWallet: () => setVisible(true),
      isSignedIn: walletHooks?.connected,
      accountId: walletHooks?.publicKey?.toBase58(),
    }),
    [connection, walletHooks, setVisible],
  );

  useEffect(() => {
    window.solanaWallet = _walletHook;
  }, [_walletHook]);

  return { ..._walletHook };
}
