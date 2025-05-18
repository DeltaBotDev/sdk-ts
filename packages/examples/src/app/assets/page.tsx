'use client';

import {
  Button,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from '@nextui-org/react';
import DeltaTradeSDK from '@delta-trade/core';
import { useRequest } from '@/hooks/useHooks';
import { useWalletContext } from '@/providers/WalletProvider';
import { useEffect } from 'react';
import Big from 'big.js';

const sdk = DeltaTradeSDK.initEnv({
  chain: 'near',
  network: 'testnet',
});

export default function UserAssetsPage() {
  const { wallet, currentChain } = useWalletContext();

  useEffect(() => {
    sdk.changeEnv({ chain: currentChain, accountId: wallet.accountId });
  }, [wallet.accountId, currentChain]);

  const { data: assets, loading } = useRequest(sdk.getAccountAssets, {
    before: () => wallet.isSignedIn,
    refreshDeps: [wallet.accountId],
  });

  async function handleWithdraw(tokenAddress: string) {
    const trans = await sdk.withdrawAccountAsset(tokenAddress);
    await window.nearWallet?.signAndSendTransactions({ transactions: trans });
  }

  return (
    <div className="p-5">
      <h1 className="text-2xl font-bold mb-4">User Assets</h1>
      {loading ? (
        <div>Loading...</div>
      ) : (
        <Table>
          <TableHeader>
            <TableColumn>Token Code</TableColumn>
            <TableColumn>Balance</TableColumn>
            <TableColumn>Price</TableColumn>
            <TableColumn>Internal Balance</TableColumn>
          </TableHeader>
          <TableBody>
            {assets?.map((item) => (
              <TableRow key={item.token.code}>
                <TableCell>{item.token.symbol}</TableCell>
                <TableCell>{item.balance}</TableCell>
                <TableCell>{item.price}</TableCell>
                <TableCell>
                  {item.internalBalance}{' '}
                  {new Big(item.internalBalance).gt(0) ? (
                    <Button
                      variant="light"
                      color="primary"
                      onClick={() => handleWithdraw(item.token.code)}
                    >
                      Withdraw
                    </Button>
                  ) : null}
                </TableCell>
              </TableRow>
            )) || []}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
