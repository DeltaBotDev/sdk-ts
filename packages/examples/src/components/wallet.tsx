'use client';
import { Button, Tab, Tabs } from '@nextui-org/react';
import { useWalletContext } from '@/providers/WalletProvider';

export default function WalletInfo() {
  const { wallet, currentChain, setCurrentChain } = useWalletContext();

  return (
    <div className="flex items-center justify-between gap-5 border-b border-divider p-3">
      <div className="flex items-center gap-5">
        <Tabs
          selectedKey={currentChain}
          onSelectionChange={(v) => setCurrentChain(v as 'near' | 'solana')}
        >
          <Tab key="near" title="Near" />
          <Tab key="solana" title="Solana" />
        </Tabs>
      </div>
      <div className="flex items-center gap-5">
        {wallet.isSignedIn ? (
          <>
            <p>{wallet.accountId}</p>
            <Button onClick={wallet.disconnect}>Disconnect</Button>
          </>
        ) : (
          <Button onClick={wallet.selectWallet}>Connect {currentChain}</Button>
        )}
      </div>
    </div>
  );
}
