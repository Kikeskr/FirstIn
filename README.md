# FirstIn

FirstIn lets creators publish a profile and issue up to 100 early-supporter badges. Tips are split into 80% creator revenue and 20% shared equally among badge claimants. Revenue is allocated onchain and withdrawn by each recipient.

## Stack

- Solidity `^0.8.20`, OpenZeppelin ERC-1155 and Ownable
- Hardhat 2 for contract compilation, tests, and deployment
- Next.js App Router, TypeScript, Tailwind, Wagmi, and RainbowKit
- Monad Testnet, chain ID `10143`, native currency `MON`

## Setup

Use Node.js 20 or newer. The Monad Hardhat deployment guide recommends WSL 2 for Windows.

```sh
npm install
cp .env.example .env
```

Set `PRIVATE_KEY` in `.env` to a testnet funded deployer key. Keep it private and never commit `.env`. Set `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` from WalletConnect Cloud to enable WalletConnect; injected browser wallets can be used for local testing without it.

To enable creator metadata uploads directly from the app, create a Pinata JWT and set `PINATA_JWT` in `.env.local` (server-side only). Without this key, creators can download the metadata JSON, pin it with their preferred IPFS provider, and paste the resulting `ipfs://` URI into the form.

## Verify contracts

```sh
npm run compile
npm test
```

The Hardhat compiler targets Osaka per Monad's deployment guide. The unit tests run on a local Hardhat chain and need no funded wallet.

## Deploy to Monad Testnet

Get testnet MON from the [Monad faucet](https://faucet.monad.xyz), then deploy:

```sh
npm run deploy:testnet
```

The script writes the factory address to `deployments/monadTestnet.json` and `.env.local` as `NEXT_PUBLIC_FACTORY_ADDRESS`. Restart the Next.js server after deployment so it picks up that address.

## Run the app

```sh
npm run dev
```

Open http://localhost:3000, connect a wallet on Monad Testnet, create an IPFS metadata URI, and launch a profile. The profile route supports badge claims, native MON tips, creator revenue distribution, and individual withdrawals. The factory must be deployed before create-profile is available.

## Revenue behavior

- Tips are tracked as pending revenue until the creator distributes them.
- If there are no badge claimants, distribution reverts and tips stay pending.
- After distribution, creator and supporter credits are pull withdrawals. A rejecting recipient cannot stop allocation or anyone else's withdrawal.
- Supporter-pool division remainder goes to the creator.

## Hackathon reference

The official Metropolis page lists Social, Attention & Culture as a track and currently gives an October 13, 2026 submission deadline. Check the [official event page](https://monad.xyz/developers/hackathons/metropolis) for current requirements and resources.
