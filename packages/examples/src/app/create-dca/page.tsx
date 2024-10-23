'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import DeltaTradeSDK, { CreateDCAVaultParams } from '@delta-trade/core';
import { useRequest } from '@/hooks/useHooks';
import { Button, Select, SelectItem, Input, Code } from '@nextui-org/react';
import dayjs from 'dayjs';
import { useMessageBoxContext } from '@/providers/MessageBoxProvider';

const sdk = DeltaTradeSDK.initEnv({
  chain: 'near',
  network: 'testnet',
});

export default function Page() {
  // change accountId
  useEffect(() => {
    sdk.changeEnv({ accountId: window.nearWallet?.accountId });
  }, []);

  return (
    <Suspense>
      <CreateDCAVault />
    </Suspense>
  );
}

function CreateDCAVault() {
  const createParams: CreateDCAVaultParams = {
    pairId: '',
    tradeType: 'buy',
    startTime: Date.now() + 1000 * 60 * 5,
    intervalTime: 0,
    singleAmountIn: 10,
    count: 10,
    name: 'test-dca-vault',
    recommender: '',
    lowestPrice: 0,
    highestPrice: 0,
  };

  const [formData, setFormData] = useState(createParams);

  const sdk = DeltaTradeSDK.initEnv({
    chain: 'near',
    network: 'testnet',
    accountId: window.nearWallet?.accountId,
  });

  const { data: pairs } = useRequest(() => sdk.getPairs({ type: 'dca' }), {
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
    const newValue = name === 'startTime' ? new Date(value).getTime() + 1000 * 60 * 5 : value;

    setFormData({ ...formData, [name]: newValue });
  };

  const { alert, confirm } = useMessageBoxContext();
  const [loading, setLoading] = useState(false);
  async function handleCreate() {
    setLoading(true);
    try {
      const errors = await sdk.validateDCAVaultParams(formData);
      if (errors) {
        alert(JSON.stringify(errors), 'Invalid Parameters');
        throw new Error('Invalid Parameters');
      }
      const trans = await sdk.createDCAVault(formData);
      await confirm(
        <Code className="text-xs whitespace-pre-wrap break-words" size="sm">
          {JSON.stringify(trans)}
        </Code>,
        'Create DCA Vault',
      );

      const res = await window.nearWallet?.signAndSendTransactions({ transactions: trans });
      console.log(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  return (
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
        <Select
          label="Trade Type"
          name="tradeType"
          placeholder="Select Trade Type"
          labelPlacement="outside"
          selectedKeys={formData.tradeType ? [formData.tradeType] : undefined}
          onChange={handleChange}
        >
          <SelectItem key="buy">Buy</SelectItem>
          <SelectItem key="sell">Sell</SelectItem>
        </Select>
        <Input
          type="datetime-local"
          name="startTime"
          label="Start Time"
          labelPlacement="outside"
          placeholder="Start Time"
          value={dayjs(formData.startTime).format('YYYY-MM-DDTHH:mm')}
          onChange={handleChange}
        />
        <IntervalInput name="intervalTime" onChange={handleChange} />
        <Input
          type="number"
          name="singleAmountIn"
          label="Single Amount In"
          labelPlacement="outside"
          placeholder="Single Amount In"
          endContent={
            <span className="text-default-500">
              {formData.tradeType === 'buy'
                ? currentPair?.quote_token.symbol
                : currentPair?.base_token.symbol}
            </span>
          }
          value={formData.singleAmountIn}
          onChange={handleChange}
        />
        <Input
          type="number"
          name="count"
          label="Count"
          labelPlacement="outside"
          placeholder="Count"
          value={formData.count}
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
          name="recommender"
          label="Recommender"
          labelPlacement="outside"
          placeholder="Recommender"
          value={formData.recommender}
          onChange={handleChange}
        />
        <Input
          type="number"
          name="lowestPrice"
          label="Lowest Price"
          labelPlacement="outside"
          placeholder="Lowest Price"
          endContent={<span className="text-default-500">{currentPair?.quote_token.symbol}</span>}
          value={formData.lowestPrice}
          onChange={handleChange}
        />
        <Input
          type="number"
          name="highestPrice"
          label="Highest Price"
          labelPlacement="outside"
          placeholder="Highest Price"
          endContent={<span className="text-default-500">{currentPair?.quote_token.symbol}</span>}
          value={formData.highestPrice}
          onChange={handleChange}
        />
      </form>
      <Button fullWidth onClick={handleCreate} isLoading={loading}>
        Create DCA Vault
      </Button>
    </div>
  );
}

function IntervalInput({
  name,
  onChange,
}: {
  name: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
}) {
  const [intervalValue, setIntervalValue] = useState();
  const [intervalUnit, setIntervalUnit] = useState('minutes');

  function handleChange(field: string, value: string) {
    if (field === 'intervalValue') {
      setIntervalValue(parseInt(value) || 0);
    } else {
      setIntervalUnit(value);
    }
    const newValue = field === 'intervalValue' ? parseInt(value) || 0 : value;
    const intervalTime =
      intervalUnit === 'minutes'
        ? newValue * 60 * 1000
        : intervalUnit === 'hours'
          ? newValue * 3600 * 1000
          : newValue * 86400 * 1000;
    onChange({ target: { name, value: intervalTime } });
  }

  return (
    <div className="flex items-center gap-4">
      <Input
        type="number"
        name="intervalValue"
        value={intervalValue}
        placeholder="Interval Value"
        onValueChange={(value) => handleChange('intervalValue', value)}
      />
      <Select
        name="intervalUnit"
        selectedKeys={[intervalUnit]}
        onSelectionChange={(value) => handleChange('intervalUnit', value)}
      >
        <SelectItem key="minutes">Minutes</SelectItem>
        <SelectItem key="hours">Hours</SelectItem>
        <SelectItem key="days">Days</SelectItem>
      </Select>
    </div>
  );
}
