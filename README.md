# DeltaTradeSDK

DeltaTradeSDK is a JavaScript SDK for interacting with the Delta Trade platform, supporting both NEAR and Solana blockchains.

## Installation

Install DeltaTradeSDK using npm or pnpm:

```bash
npm install @delta-trade/core
# or
pnpm add @delta-trade/core
```

## Initialization

Before using the SDK, you need to initialize it. You can do this using the `DeltaTradeSDK.initEnv` method.

```typescript
import DeltaTradeSDK from '@delta-trade/core';

const sdk = DeltaTradeSDK.initEnv({
  chain: 'near', // or 'solana'
  network: 'testnet', // or 'mainnet'
  accountId: 'your-account-id', // optional
  nearConfig: {
    jsonRpcUrls: ['https://rpc.testnet.near.org'], // optional
  },
  solanaConfig: {
    endpoint: 'https://api.testnet.solana.com', // optional
  },
});
```

### Change Environment

```typescript
sdk.changeEnv({
  chain: 'near',
  network: 'testnet',
  accountId: 'your-account-id',
});
```

## Usage Examples

### Retrieve Pairs

To create a vault, you need a `pairId`. You can retrieve available pairs using the following method:

```typescript
const pairs = await sdk.getPairs({ type: 'dca' });
console.log('Available Pairs:', pairs);

// Example: Selecting a pairId
const pairId = pairs[0]?.pair_id;
console.log('Selected Pair ID:', pairId);
```

### Create a DCA Vault

```typescript
const createParams = {
  pairId: 'pair-id',
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
const errors = await sdk.validateDCAVaultParams(createParams);
if (!errors) {
  const transaction = await sdk.createDCAVault(createParams);
  console.log('Transaction:', transaction);
  // sign and send transaction
  const wallet = await walletSelector?.wallet();
  await wallet.signAndSendTransactions(transaction);
} else {
  console.error('Validation Errors:', errors);
}
```

### Create a Grid Vault

```typescript
const gridParams = {
  pairId: 'pair-id',
  minPrice: '0.1',
  maxPrice: '1.0',
  gridAmount: 10,
  quantityPreGrid: '100',
  name: 'test-grid-vault',
  slippage: 1,
};
const gridErrors = await sdk.validateGridVaultParams(gridParams);
if (!gridErrors) {
  const gridTransaction = await sdk.createGridVault(gridParams);
  console.log('Grid Transaction:', gridTransaction);
} else {
  console.error('Grid Validation Errors:', gridErrors);
}
```

### Create a Classic Swing Vault

```typescript
const swingParams = {
  pairId: 'pair-id',
  tradeType: 'buy',
  buyPrice: '0.5',
  sellPrice: '1.0',
  everyPhasedAmount: '50',
  name: 'test-swing-vault',
};
const swingErrors = await sdk.validateSwingVaultParams('classic', swingParams);
if (!swingErrors) {
  const swingTransaction = await sdk.createClassicSwingVault(swingParams);
  console.log('Swing Transaction:', swingTransaction);
} else {
  console.error('Swing Validation Errors:', swingErrors);
}
```

### Create a Phased Swing Vault

```typescript
const phasedSwingParams = {
  pairId: 'pair-id',
  tradeType: 'buy',
  gridAmount: 5,
  intervalPrice: '0.1',
  everyPhasedAmount: '50',
  highestBuyPrice: '1.0',
  name: 'test-phased-swing-vault',
};
const phasedSwingErrors = await sdk.validateSwingVaultParams('phased', phasedSwingParams);
if (!phasedSwingErrors) {
  const phasedSwingTransaction = await sdk.createPhasedSwingVault(phasedSwingParams);
  console.log('Phased Swing Transaction:', phasedSwingTransaction);
} else {
  console.error('Phased Swing Validation Errors:', phasedSwingErrors);
}
```

### Manage Vaults

#### Get My Vaults

```typescript
const myGridVaults = await sdk.getMyGridVaults();
console.log('My Grid Vaults:', myGridVaults);

const mySwingVaults = await sdk.getMySwingVaults();
console.log('My Swing Vaults:', mySwingVaults);

const myDCAVaults = await sdk.getMyDCAVaults();
console.log('My DCA Vaults:', myDCAVaults);
```

#### Claim Vault

```typescript
const claimResult = await sdk.claimGridVault({ botId: 'your-vault-id' });
console.log('Claim Result:', claimResult);
```

#### Close Vault

```typescript
const closeResult = await sdk.closeGridVault({ botId: 'your-vault-id' });
console.log('Close Result:', closeResult);
```

### Get Market Information

```typescript
const marketInfo = await sdk.getMarketInfo();
console.log('Market Info:', marketInfo);
```

### Get Account Assets

```typescript
const assets = await sdk.getAccountAssets();
console.log('Account Assets:', assets);
```

### Withdraw Account Asset

```typescript
const result = await sdk.withdrawAccountAsset({ assetId: 'your-asset-id', amount: 100 });
console.log('Withdraw Result:', result);
```

### Generate Referral URL

```typescript
const referralUrl = await sdk.generateReferralUrl();
console.log('Referral URL:', referralUrl);
```

## API Documentation

### Initialization and Environment

- **`DeltaTradeSDK.initEnv(params)`**: Initialize the SDK environment.

  - **Parameters**:
    - `params.chain`: `'near' | 'solana'`
    - `params.network`: `'mainnet' | 'testnet'`
    - `params.accountId`: `string` (optional)
    - `params.nearConfig`: `{ jsonRpcUrls?: string[] }` (optional)
    - `params.solanaConfig`: `{ endpoint?: string }` (optional)
  - **Returns**: `DeltaTradeSDK` instance

- **`sdk.changeEnv(params)`**: Change the SDK environment.
  - **Parameters**: `Partial<SDKParams>`

### Market and Pairs

- **`sdk.getMarketInfo()`**: Get market information.

  - **Returns**: `Promise<MarketInfo>`

- **`sdk.getPairs(params)`**: Retrieve available trading pairs.

  - **Parameters**: `{ type: string }`
  - **Returns**: `Promise<Pair[]>`

- **`sdk.getPairPrices(pairIds)`**: Get prices for specific pairs.
  - **Parameters**: `string[]`
  - **Returns**: `Promise<Price[]>`

### Vault Management

#### DCA Vaults

- **`sdk.validateDCAVaultParams(params)`**: Validate parameters for creating a DCA vault.

  - **Parameters**: `CreateDCAVaultParams`
  - **Returns**: `Promise<ValidationErrors | null>`

- **`sdk.createDCAVault(params)`**: Create a DCA vault.

  - **Parameters**: `CreateDCAVaultParams`
  - **Returns**: `Promise<Transaction[]>`

- **`sdk.claimDCAVault(params)`**: Claim a DCA vault.

  - **Parameters**: `{ botId: string }`
  - **Returns**: `Promise<ClaimResult>`

- **`sdk.closeDCAVault(params)`**: Close a DCA vault.
  - **Parameters**: `{ botId: string }`
  - **Returns**: `Promise<CloseResult>`

#### Grid Vaults

- **`sdk.validateGridVaultParams(params)`**: Validate parameters for creating a grid vault.

  - **Parameters**: `CreateGridVaultParams`
  - **Returns**: `Promise<ValidationErrors | null>`

- **`sdk.createGridVault(params)`**: Create a grid vault.

  - **Parameters**: `CreateGridVaultParams`
  - **Returns**: `Promise<Transaction[]>`

- **`sdk.claimGridVault(params)`**: Claim a grid vault.

  - **Parameters**: `{ botId: string }`
  - **Returns**: `Promise<ClaimResult>`

- **`sdk.closeGridVault(params)`**: Close a grid vault.
  - **Parameters**: `{ botId: string }`
  - **Returns**: `Promise<CloseResult>`

#### Swing Vaults

- **`sdk.validateSwingVaultParams(type, params)`**: Validate parameters for creating a swing vault.

  - **Parameters**: `SwingVaultType`, `CreateSwingVaultParams`
  - **Returns**: `Promise<ValidationErrors | null>`

- **`sdk.createClassicSwingVault(params)`**: Create a classic swing vault.

  - **Parameters**: `CreateClassicSwingVaultParams`
  - **Returns**: `Promise<Transaction[]>`

- **`sdk.createPhasedSwingVault(params)`**: Create a phased swing vault.

  - **Parameters**: `CreatePhasedSwingVaultParams`
  - **Returns**: `Promise<Transaction[]>`

- **`sdk.claimSwingVault(params)`**: Claim a swing vault.

  - **Parameters**: `{ botId: string }`
  - **Returns**: `Promise<ClaimResult>`

- **`sdk.closeSwingVault(params)`**: Close a swing vault.
  - **Parameters**: `{ botId: string }`
  - **Returns**: `Promise<CloseResult>`

### Asset Management

- **`sdk.getAccountAssets()`**: Get account assets.

  - **Returns**: `Promise<AccountAssets>`

- **`sdk.withdrawAccountAsset(params)`**: Withdraw an account asset.
  - **Parameters**: `{ assetId: string, amount: number }`
  - **Returns**: `Promise<WithdrawResult>`

### Referral

- **`sdk.generateReferralUrl()`**: Generate a referral URL.
  - **Returns**: `Promise<string>`

## Contributing

Contributions are welcome! Please read [CONTRIBUTING.md](./CONTRIBUTING.md) for more information.

## License

ISC © [Delta Trade](https://github.com/DeltaBotDev/sdk-ts)
