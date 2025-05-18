'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import DeltaTradeSDK, {
  CreateSwingVaultParams,
  MySwingVault,
  SwingVaultType,
} from '@delta-trade/core';
import { useRequest } from '@/hooks/useHooks';
import { Button, Select, SelectItem, Input, Code, Tab, Tabs } from '@nextui-org/react';
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
  chain: 'solana',
  network: 'mainnet',
});

export default function Page() {
  const { wallet, currentChain } = useWalletContext();

  useEffect(() => {
    sdk.changeEnv({ chain: currentChain, accountId: wallet.accountId });
  }, [wallet.accountId, currentChain]);

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <div className="p-5 flex flex-col gap-4">
        <MySwingVaults />
        <CreateSwingVault key={currentChain} />
      </div>
    </Suspense>
  );
}

function MySwingVaults() {
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
  const [list, setList] = useState<MySwingVault[]>([]);
  const [hasMore, setHasMore] = useState(false);

  const { loading } = useRequest(
    () => sdk.getMySwingVaults({ orderBy: 'profit_24_usd', dir: 'desc', page, pageSize }),
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
    const trans = await sdk.claimSwingVault(id);
    if (currentChain === 'near') {
      await window.nearWallet?.signAndSendTransactions({ transactions: trans as any });
    } else {
      await sendTransaction(trans as any);
    }
  }

  async function handleClose(id: number) {
    const trans = await sdk.closeSwingVault(id);
    if (currentChain === 'near') {
      await window.nearWallet?.signAndSendTransactions({ transactions: trans as any });
    } else {
      await sendTransaction(trans as any);
    }
  }

  return (
    <div>
      <div className="text-2xl font-bold mb-4">My Swing Vaults</div>
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

function CreateSwingVault() {
  const [swingType, setSwingType] = useState<SwingVaultType>('classic');

  const classicParams: CreateSwingVaultParams<'classic'> = {
    pairId:
      'So11111111111111111111111111111111111111112:EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
    tradeType: 'sell',
    buyPrice: '130',
    sellPrice: '180',
    everyPhasedAmount: '0.2',
    name: 'SOL/USDC Swing',
    validityPeriod: dayjs().add(180, 'day').valueOf(),
    slippage: 1,
  };

  const phasedParams: CreateSwingVaultParams<'phased'> = {
    pairId: '',
    tradeType: 'buy',
    gridAmount: 2,
    intervalPrice: '0.1',
    everyPhasedAmount: '10',
    highestBuyPrice: '4',
    lowestSellPrice: '5',
    name: 'test-swing-vault',
    validityPeriod: dayjs().add(180, 'day').valueOf(),
    slippage: 1,
  };

  const [classicFormData, setClassicFormData] = useState(classicParams);
  const [phasedFormData, setPhasedFormData] = useState(phasedParams);

  const { data: pairs } = useRequest(() => sdk.getPairs({ type: 'swing' }), {
    onSuccess(res) {
      if (!classicFormData.pairId) {
        setClassicFormData({ ...classicFormData, pairId: res?.[0]?.pair_id });
      }
      if (!phasedFormData.pairId) {
        setPhasedFormData({ ...phasedFormData, pairId: res?.[0]?.pair_id });
      }
    },
  });

  const { data: pairPrices } = useRequest(() => sdk.getPairPrices([classicFormData.pairId]), {
    refreshDeps: [classicFormData.pairId],
    before: () => !!classicFormData.pairId,
  });

  const currentPair = useMemo(
    () => pairs?.find((p) => p.pair_id === classicFormData.pairId),
    [pairs, classicFormData.pairId],
  );

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
    type: SwingVaultType,
  ) => {
    const { name, value } = e.target;
    if (type === 'classic') {
      setClassicFormData({ ...classicFormData, [name]: value });
    } else {
      setPhasedFormData({ ...phasedFormData, [name]: value });
    }
  };

  const { currentChain } = useWalletContext();
  const { alert, confirm } = useMessageBoxContext();
  const [loading, setLoading] = useState(false);

  async function handleCreate() {
    setLoading(true);
    try {
      const formData = swingType === 'classic' ? classicFormData : phasedFormData;
      const errors = await sdk.validateSwingVaultParams(swingType, formData);
      if (errors) {
        alert(JSON.stringify(errors), 'Invalid Parameters');
        throw new Error('Invalid Parameters');
      }
      const trans =
        swingType === 'classic'
          ? await sdk.createClassicSwingVault(
              swingType,
              formData as CreateSwingVaultParams<'classic'>,
            )
          : await sdk.createPhasedSwingVault(
              swingType,
              formData as CreateSwingVaultParams<'phased'>,
            );
      await confirm(
        <Code className="text-xs whitespace-pre-wrap break-words" size="sm">
          {JSON.stringify(trans)}
        </Code>,
        'Create Swing Vault',
      );
      if (currentChain === 'near') {
        await window.nearWallet?.signAndSendTransactions({ transactions: trans as any });
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
      <div className="text-2xl font-bold">Create Swing Vault</div>
      <div className="p-4 max-w-sm mx-auto">
        <Tabs
          className="mb-4"
          fullWidth
          selectedKey={swingType}
          onSelectionChange={(key) => setSwingType(key as SwingVaultType)}
        >
          <Tab key="classic" title="Classic Swing" />
          <Tab key="phased" title="Phased Swing" />
        </Tabs>
        <form className="flex flex-col gap-4 mb-4">
          <div>
            <Select
              label="Pair"
              name="pairId"
              placeholder="Select Pair"
              labelPlacement="outside"
              selectedKeys={
                swingType === 'classic' ? [classicFormData.pairId] : [phasedFormData.pairId]
              }
              onChange={(e) => handleChange(e, swingType)}
            >
              {pairs?.map((pair) => (
                <SelectItem key={pair.pair_id} value={pair.pair_id}>
                  {pair.name}
                </SelectItem>
              )) || []}
            </Select>
            <div className="flex items-center gap-2 mt-3">
              <span className="text-default-500 text-xs">Current Price</span>
              <span className="text-success-500">
                {pairPrices?.[classicFormData.pairId]?.pairPrice}
              </span>
            </div>
          </div>
          <Select
            label="Trade Type"
            name="tradeType"
            placeholder="Select Trade Type"
            labelPlacement="outside"
            selectedKeys={
              swingType === 'classic' ? [classicFormData.tradeType] : [phasedFormData.tradeType]
            }
            onChange={(e) => handleChange(e, swingType)}
          >
            <SelectItem key="buy">Buy</SelectItem>
            <SelectItem key="sell">Sell</SelectItem>
          </Select>
          {swingType === 'classic' ? (
            <>
              {classicFormData.tradeType === 'buy' ? (
                <>
                  <Input
                    type="number"
                    name="buyPrice"
                    label="Buy Price"
                    labelPlacement="outside"
                    placeholder="Buy Price"
                    endContent={
                      <span className="text-default-500">{currentPair?.quote_token.symbol}</span>
                    }
                    value={classicFormData.buyPrice}
                    onChange={(e) => handleChange(e, 'classic')}
                  />
                  <Input
                    type="number"
                    name="sellPrice"
                    label="Sell Price"
                    labelPlacement="outside"
                    placeholder="Sell Price"
                    endContent={
                      <span className="text-default-500">{currentPair?.quote_token.symbol}</span>
                    }
                    value={classicFormData.sellPrice}
                    onChange={(e) => handleChange(e, 'classic')}
                  />
                </>
              ) : (
                <>
                  <Input
                    type="number"
                    name="sellPrice"
                    label="Sell Price"
                    labelPlacement="outside"
                    placeholder="Sell Price"
                    endContent={
                      <span className="text-default-500">{currentPair?.quote_token.symbol}</span>
                    }
                    value={classicFormData.sellPrice}
                    onChange={(e) => handleChange(e, 'classic')}
                  />
                  <Input
                    type="number"
                    name="buyPrice"
                    label="Buy Price"
                    labelPlacement="outside"
                    placeholder="Buy Price"
                    endContent={
                      <span className="text-default-500">{currentPair?.quote_token.symbol}</span>
                    }
                    value={classicFormData.buyPrice}
                    onChange={(e) => handleChange(e, 'classic')}
                  />
                </>
              )}
              <Input
                type="number"
                name="everyPhasedAmount"
                label="Amount"
                labelPlacement="outside"
                placeholder="Amount"
                value={classicFormData.everyPhasedAmount}
                onChange={(e) => handleChange(e, 'classic')}
              />
            </>
          ) : (
            <>
              {phasedFormData.tradeType === 'buy' ? (
                <Input
                  type="number"
                  name="highestBuyPrice"
                  label="Highest Buy Price"
                  labelPlacement="outside"
                  placeholder="Highest Buy Price"
                  endContent={
                    <span className="text-default-500">{currentPair?.quote_token.symbol}</span>
                  }
                  value={phasedFormData.highestBuyPrice || ''}
                  onChange={(e) => handleChange(e, 'phased')}
                />
              ) : (
                <Input
                  type="number"
                  name="lowestSellPrice"
                  label="Lowest Sell Price"
                  labelPlacement="outside"
                  placeholder="Lowest Sell Price"
                  endContent={
                    <span className="text-default-500">{currentPair?.quote_token.symbol}</span>
                  }
                  value={phasedFormData.lowestSellPrice || ''}
                  onChange={(e) => handleChange(e, 'phased')}
                />
              )}
              <Input
                type="number"
                name="gridAmount"
                label="Set Grid"
                labelPlacement="outside"
                placeholder="Set Grid"
                endContent={<span className="text-default-500 text-nowrap">2-8</span>}
                value={phasedFormData.gridAmount?.toString() || ''}
                onChange={(e) => handleChange(e, 'phased')}
              />
              <Input
                type="number"
                name="intervalPrice"
                label="Interval Price"
                labelPlacement="outside"
                placeholder="Interval Price"
                endContent={
                  <span className="text-default-500">{currentPair?.quote_token.symbol}</span>
                }
                value={phasedFormData.intervalPrice || ''}
                onChange={(e) => handleChange(e, 'phased')}
              />
              <Input
                type="number"
                name="everyPhasedAmount"
                label="Every Phased Amount"
                labelPlacement="outside"
                placeholder="Every Phased Amount"
                endContent={
                  <span className="text-default-500">{currentPair?.base_token.symbol}</span>
                }
                value={phasedFormData.everyPhasedAmount}
                onChange={(e) => handleChange(e, 'phased')}
              />
            </>
          )}
          <Input
            name="name"
            label="Vault Name"
            labelPlacement="outside"
            placeholder="Vault Name"
            value={swingType === 'classic' ? classicFormData.name : phasedFormData.name}
            onChange={(e) => handleChange(e, swingType)}
          />
          <Input
            type="number"
            name="slippage"
            label="Slippage"
            labelPlacement="outside"
            placeholder="Slippage"
            value={
              swingType === 'classic'
                ? classicFormData.slippage?.toString()
                : phasedFormData.slippage?.toString()
            }
            endContent={<span className="text-default-500 text-nowrap">%</span>}
            onChange={(e) => handleChange(e, swingType)}
          />
          <Input
            type="number"
            name="validityPeriod"
            label="Validity Period"
            labelPlacement="outside"
            placeholder="Validity Period"
            value={
              swingType === 'classic'
                ? classicFormData.validityPeriod?.toString()
                : phasedFormData.validityPeriod?.toString()
            }
            onChange={(e) => handleChange(e, swingType)}
          />
        </form>
        <Button fullWidth onClick={handleCreate} isLoading={loading}>
          Create Swing Vault
        </Button>
      </div>
    </div>
  );
}
