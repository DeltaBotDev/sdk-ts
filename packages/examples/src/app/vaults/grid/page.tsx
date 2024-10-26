'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import DeltaTradeSDK, { CreateGridVaultParams, MyGridVault } from '@delta-trade/core';
import { useRequest } from '@/hooks/useHooks';
import { Button, Select, SelectItem, Input, Code } from '@nextui-org/react';
import { useMessageBoxContext } from '@/providers/MessageBoxProvider';
import LoadMore from '@/components/LoadMore';
import {
  getKeyValue,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from '@nextui-org/react';
import { useWalletContext } from '@/providers/WalletProvider';
import { sendTransaction } from '@/utils/sol';
import dayjs from 'dayjs';
import Big from 'big.js';

// Initialize the SDK
const sdk = DeltaTradeSDK.initEnv({
  chain: 'near',
  network: 'testnet',
});

export default function Page() {
  const { wallet, currentChain } = useWalletContext();

  useEffect(() => {
    console.log('changeEnv', currentChain, wallet.accountId);
    sdk.changeEnv({ chain: currentChain, accountId: wallet.accountId });
  }, [wallet.accountId, currentChain]);

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <div className="p-5 flex flex-col gap-4">
        <MyGridVaults />
        <CreateGridVault key={currentChain} />
      </div>
    </Suspense>
  );
}

function MyGridVaults() {
  const { wallet } = useWalletContext();

  const columns = [
    { prop: 'index', label: '#' },
    { prop: 'name', label: 'Vault' },
    { prop: 'pair', label: 'Pair' },
    { prop: 'totalInvestmentUsd', label: 'Investment' },
    { prop: 'priceRange', label: 'Price Range' },
    { prop: 'arbitrage_profit_usd', label: 'Arbitrage Profit' },
    { prop: 'arbitrage_apy', label: 'Arbitrage APY' },
    { prop: 'profit_24_usd', label: '24H Arbitrage Profit' },
    { prop: 'apy_24', label: '24H Arbitrage APY' },
    { prop: 'status', label: 'Status' },
    { prop: 'bot_create_time', label: 'Created Time' },
    { prop: 'action', label: 'Action' },
  ];

  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [list, setList] = useState<MyGridVault[]>([]);
  const [hasMore, setHasMore] = useState(false);

  useEffect(() => {
    console.log('wallet', wallet);
  }, [wallet]);

  const { loading } = useRequest(
    () => sdk.getMyGridVaults({ orderBy: 'profit_24_usd', dir: 'desc', page, pageSize }),
    {
      refreshDeps: [page, wallet.accountId],
      onSuccess(res) {
        const list = res?.list || [];
        if (page === 1) setList(list);
        else setList((prev = []) => [...prev, ...list]);
        setHasMore(!!res?.has_next_page);
      },
    },
  );

  const { currentChain } = useWalletContext();

  async function handleClaim(id: number) {
    const trans = await sdk.claimGridVault(id);
    console.log('trans', trans);
    if (currentChain === 'near') {
      await window.nearWallet?.signAndSendTransactions({ transactions: trans });
    } else {
      await sendTransaction(trans as any);
    }
  }

  async function handleClose(id: number) {
    const trans = await sdk.closeGridVault(id);
    if (currentChain === 'near') {
      await window.nearWallet?.signAndSendTransactions({ transactions: trans });
    } else {
      await sendTransaction(trans as any);
    }
  }

  return (
    <div>
      <div className="text-2xl font-bold mb-4">My Grid Vaults</div>
      <Table
        bottomContent={
          hasMore && (
            <LoadMore
              className="pb-2"
              loading={loading}
              hasMore={hasMore}
              onClick={() => setPage(page + 1)}
            />
          )
        }
      >
        <TableHeader columns={columns}>
          {(col) => <TableColumn key={col.prop}>{col.label}</TableColumn>}
        </TableHeader>
        <TableBody items={list}>
          {(item) => (
            <TableRow key={item.bot_id}>
              {(rowKey) => (
                <TableCell>
                  {rowKey === 'action'
                    ? item.status !== 'closed' && (
                        <>
                          <Button size="sm" onClick={() => handleClaim(item.bot_id)}>
                            Claim
                          </Button>
                          <Button
                            variant="light"
                            color="danger"
                            size="sm"
                            onClick={() => handleClose(item.bot_id)}
                          >
                            Close
                          </Button>
                        </>
                      )
                    : rowKey === 'pair'
                      ? `${item.investment_base.symbol}/${item.investment_quote.symbol}`
                      : rowKey === 'priceRange'
                        ? item.min_price && item.max_price
                          ? item.min_price > item.max_price
                            ? `${new Big(item.max_price).round(8).toString()}-${new Big(item.min_price).round(8).toString()}`
                            : `${new Big(item.min_price).round(8).toString()}-${new Big(item.max_price).round(8).toString()}`
                          : '-'
                        : getKeyValue(item, rowKey)}
                </TableCell>
              )}
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}

function CreateGridVault() {
  const createParams: CreateGridVaultParams = {
    pairId: '',
    minPrice: '4',
    maxPrice: '5',
    gridAmount: 2,
    quantityPreGrid: '10',
    name: 'test-grid-vault',
    slippage: 1,
    validityPeriod: dayjs().add(180, 'day').valueOf(),
  };

  const [formData, setFormData] = useState(createParams);

  const { data: pairs } = useRequest(() => sdk.getPairs({ type: 'grid' }), {
    onSuccess(res) {
      if (!formData.pairId) {
        setFormData({ ...formData, pairId: res[0].pair_id });
      }
    },
  });

  const { data: pairPrices } = useRequest(() => sdk.getPairPrices([formData.pairId]), {
    refreshDeps: [formData.pairId],
    before: () => !!formData.pairId,
  });

  const currentPair = useMemo(
    () => pairs?.find((p) => p.pair_id === formData.pairId),
    [pairs, formData.pairId],
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const { currentChain } = useWalletContext();
  const { alert, confirm } = useMessageBoxContext();
  const [loading, setLoading] = useState(false);
  async function handleCreate() {
    setLoading(true);
    try {
      const errors = await sdk.validateGridVaultParams(formData);
      if (errors) {
        alert(JSON.stringify(errors), 'Invalid Parameters');
        throw new Error('Invalid Parameters');
      }
      const trans = await sdk.createGridVault(formData);
      await confirm(
        <Code className="text-xs whitespace-pre-wrap break-words" size="sm">
          {JSON.stringify(trans)}
        </Code>,
        'Create Grid Vault',
      );
      if (currentChain === 'near') {
        await window.nearWallet?.signAndSendTransactions({ transactions: trans });
      } else {
        await sendTransaction(trans as any);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <div className="text-2xl font-bold">Create Grid Vault</div>
      <div className="p-4 max-w-sm mx-auto">
        <form className="flex flex-col gap-4 mb-4">
          <div>
            <Select
              label="Pair"
              name="pairId"
              placeholder="Select Pair"
              labelPlacement="outside"
              selectedKeys={formData.pairId ? [formData.pairId] : undefined}
              onChange={handleChange}
            >
              {pairs?.map((pair) => (
                <SelectItem key={pair.pair_id} value={pair.pair_id}>
                  {pair.name}
                </SelectItem>
              )) || []}
            </Select>
            <div className="flex items-center gap-2 mt-3">
              <span className="text-default-500 text-xs">Current Price</span>
              <span className="text-success-500">{pairPrices?.[formData.pairId]?.pairPrice}</span>
            </div>
          </div>
          <div className="flex items-center gap-5">
            <Input
              type="number"
              name="minPrice"
              label="Min Price"
              labelPlacement="outside"
              placeholder="Min Price"
              value={formData.minPrice}
              onChange={handleChange}
            />
            <Input
              type="number"
              name="maxPrice"
              label="Max Price"
              labelPlacement="outside"
              placeholder="Max Price"
              value={formData.maxPrice}
              onChange={handleChange}
            />
          </div>

          <Input
            type="number"
            name="gridAmount"
            label="Number of Grids"
            labelPlacement="outside"
            placeholder="Number of Grids"
            endContent={<span className="text-default-500 text-nowrap">2-300</span>}
            value={formData.gridAmount.toString()}
            onChange={handleChange}
          />
          <Input
            type="number"
            name="quantityPreGrid"
            label="Investment Per Grid"
            labelPlacement="outside"
            placeholder="Investment Per Grid"
            endContent={
              <span className="text-default-500 text-nowrap">{currentPair?.base_token.symbol}</span>
            }
            value={formData.quantityPreGrid}
            onChange={handleChange}
          />
          <Input
            name="name"
            label="Vault Name"
            labelPlacement="outside"
            placeholder="Vault Name"
            value={formData.name}
            onChange={handleChange}
          />
          <Input
            type="number"
            name="slippage"
            label="Slippage"
            labelPlacement="outside"
            placeholder="Slippage"
            value={formData.slippage?.toString() || ''}
            endContent={<span className="text-default-500 text-nowrap">%</span>}
            onChange={handleChange}
          />
          <Input
            type="number"
            name="validityPeriod"
            label="Validity Period"
            labelPlacement="outside"
            placeholder="Validity Period"
            value={formData.validityPeriod?.toString() || ''}
            onChange={handleChange}
          />
        </form>
        <Button fullWidth onClick={handleCreate} isLoading={loading}>
          Create Grid Vault
        </Button>
      </div>
    </div>
  );
}
