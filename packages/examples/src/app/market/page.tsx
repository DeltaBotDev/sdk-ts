'use client';

import LoadMore from '@/components/LoadMore';
import { useRequest } from '@/hooks/useHooks';
import DeltaTradeSDK, { MarketDCAVault } from '@delta-trade/core';
import {
  getKeyValue,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from '@nextui-org/react';
import { useState } from 'react';

const sdk = DeltaTradeSDK.initEnv({
  chain: 'near',
  network: 'testnet',
});

export default function Page() {
  return (
    <div className="p-5 flex flex-col gap-5">
      <MarketInfo />
      <DCAVaults />
    </div>
  );
}

function MarketInfo() {
  const { data } = useRequest(sdk.getMarketInfo);
  return (
    <div>
      <div className="text-2xl font-bold">Market Info</div>
      <div className="grid grid-cols-3 gap-2">
        <div>Total Profit: {data?.arbitrage_profit}</div>
        <div>24H Profit: {data?.profit_24}</div>
        <div>Total Position: {data?.total_position}</div>
        <div>Current Position: {data?.position}</div>
        <div>Total Volume: {data?.volume_total}</div>
        <div>24H Volume: {data?.volume_24h}</div>
        <div>Total Users: {data?.total_users}</div>
      </div>
    </div>
  );
}

function DCAVaults() {
  const columns = [
    { prop: 'index', label: '#' },
    { prop: 'name', label: 'Vault' },
    { prop: 'side', label: 'Side' },
    { prop: 'investmentAmount', label: 'Investment' },
    { prop: 'profit', label: 'Profit' },
    { prop: 'profit_percent', label: 'Historical ROI' },
    { prop: 'status', label: 'Status' },
    { prop: 'bot_create_time', label: 'Created Time' },
  ];

  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [list, setList] = useState<MarketDCAVault[]>([]);
  const [hasMore, setHasMore] = useState(false);

  const { loading } = useRequest(
    () => sdk.getMarketDCAVaults({ orderBy: 'profit_24_usd', dir: 'desc', page, pageSize }),
    {
      refreshDeps: [page],
      onSuccess(res) {
        const list = res?.list || [];
        if (page === 1) setList(list);
        else setList((prev = []) => [...prev, ...list]);
        setHasMore(!!res?.has_next_page);
      },
    },
  );

  return (
    <div>
      <div className="text-2xl font-bold">Market DCA Vaults</div>
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
            <TableRow key={item.id}>
              {(rowKey) => <TableCell>{getKeyValue(item, rowKey)}</TableCell>}
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
