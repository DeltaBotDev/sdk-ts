import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import { useEffect, useMemo } from 'react';

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
  const network = 'mainnet-beta';

  const endpoint = process.env.NEXT_PUBLIC_SOL_RPC;

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
