# IdeaStamp — Final Submission

## Project Summary
IdeaStamp is a blockchain-based priority proof system for early-stage research ideas and draft outputs. This repository is the **final course submission**: it implements the core commit–reveal workflow from the project white paper, ships a **working web client** in `frontend/`, and includes supporting tests and design documentation.

1. A user creates a salted commitment off-chain.
2. The commitment hash is stored on-chain with a timestamp and block number.
3. The original author may later reveal the content hash and salt.
4. Any third party can verify that the revealed material matches the earlier on-chain commitment.

The system is a complete prototype, not a production deployment. Token incentives, DAO governance, and a full dispute marketplace remain out of scope for this release.

## What Is Included
- Smart contract sources in `contracts/`
- Hardhat unit tests in `test/`
- **Runnable Next.js dApp** in `frontend/` (wallet connect, Commit / Reveal / Verify / My Records)
- Wireframe PDF in `frontend_wireframe/IdeaStamp_A3_Wireframe.pdf` (design reference; complements the live UI)
- Technical notes and evidence under `docs/`

## Smart Contract Design

### `IdeaRegistry.sol`
Primary registry for timestamped commitments, reveal, and public reads.

Main responsibilities:
- store unique commitment hashes on-chain
- record the author, commit timestamp, and block number
- support later reveal of `contentHash` and `salt`
- expose record data for public verification
- owner-controlled commit fee and withdrawals

Commitment formula:

```solidity
keccak256(abi.encodePacked(chainId, authorAddress, contentHash, salt, metadataHash))
```

### `DisputeRegistryLite.sol`
Optional companion contract that records lightweight disputes against existing commitments and supports an owner-only resolution step. It is **not** exposed in the current web UI; the main evaluated flow is commit / reveal / verify through `IdeaRegistry`.

## White Paper Alignment
| White paper feature | Status in this release |
| --- | --- |
| Timestamped commitment registry | Implemented |
| Commit–reveal proof workflow | Implemented |
| Public verification of priority claims | Implemented |
| Privacy-preserving salted commitments | Implemented |
| Working dApp (wallet + main flows) | Implemented in `frontend/` |
| Design wireframes | `frontend_wireframe/IdeaStamp_A3_Wireframe.pdf` |
| Token incentives and staking | Deferred |
| DAO governance | Deferred |
| Full dispute marketplace | Deferred; lite contract present, UI not shipped |

## Repository Layout
```text
IdeaStamp_A3_Package/
├── contracts/
│   ├── IdeaRegistry.sol
│   ├── DisputeRegistryLite.sol
│   └── interfaces/IIdeaRegistry.sol
├── test/
│   └── IdeaRegistry.test.js
├── scripts/
│   └── deploy.js
├── frontend/                 # Next.js + wagmi (required runnable UI)
├── frontend_wireframe/
│   └── IdeaStamp_A3_Wireframe.pdf
├── docs/
│   ├── testing_evidence_log.txt
│   ├── toolchain_versions.md
│   └── whitepaper_feature_mapping.md
├── hardhat.config.js
└── package.json
```

## Contracts — Build and Test

### Prerequisites
- Node.js 18+ or 20+
- npm

### Install, compile, test
```bash
npm install
npm run compile
npm test
```

Test output is also captured in `docs/testing_evidence_log.txt`.

## Web Application — Run Locally
The frontend is part of the final deliverable. It expects a local Hardhat chain and deployed contract addresses (written to `frontend/.env.local` by the deploy script).

Use **three terminals** so the node and the app stay running at the same time.

**Terminal A** — local chain (leave running):
```bash
npx hardhat node
```

**Terminal B** — deploy contracts (from repository root):
```bash
npm run deploy:local
```
This updates `frontend/.env.local` with `NEXT_PUBLIC_IDEA_REGISTRY` and related addresses. Restart the dev server after deploy if it was already running, so new `NEXT_PUBLIC_*` values load.

**Terminal C** — web app:
```bash
cd frontend
npm install
npm run dev
```
Open the URL printed in the terminal (typically `http://localhost:3000`). Connect a browser wallet to **Localhost / chain ID 31337** and use a Hardhat test account for transactions.

### Automated tests vs browser testing
- **`npm test`** runs entirely inside Hardhat. It does not use MetaMask or a browser. Anyone with Node.js and the repo dependencies should get the same automated test results after `npm install`.
- **Manual testing in the browser** depends on MetaMask (or another injected wallet), the correct local network, and an account funded with Hardhat’s fake ETH. That path is environment-specific; two machines can behave differently if the wallet is on the wrong chain, uses a stale local state, or shows security prompts for localhost contract addresses.

### MetaMask on localhost (common fixes)
1. **Network:** Add or select **Localhost 8545** (or a custom network) with **RPC** `http://127.0.0.1:8545` and **chain ID** `31337`. Do not use Ethereum mainnet for this demo.
2. **Account with ETH:** When `npx hardhat node` starts, it prints **test private keys**. In MetaMask: import account → paste one of those keys. That account receives 10000 test ETH on the local chain only.
3. **Restart clean:** If transactions fail with odd nonce or “wrong network” errors, restart `npx hardhat node`, run `npm run deploy:local` again, restart `npm run dev`, and in MetaMask try **Settings → Advanced → Clear activity tab data** for the local network (wording varies by version).
4. **Dedicated browser profile:** Some developers use a separate Chrome profile (or a fresh MetaMask install) only for local chain work so mainnet accounts, old localhost allowances, and other extensions do not interfere. That is optional but often avoids the “it worked only after I isolated the wallet” situation.

**Production build check:**
```bash
cd frontend
npm run build
```

## Assumptions
- Content is hashed in the browser before sending transactions.
- Full research text is not stored on-chain.
- `metadataHash` may represent optional metadata for the submission.

## Documentation and Evidence
- Tool versions: `docs/toolchain_versions.md`
- Test and frontend build logs: `docs/testing_evidence_log.txt`, `docs/testing_evidence_template.md`
- Feature-to-white-paper mapping: `docs/whitepaper_feature_mapping.md`
- Extended technical notes: `docs/README.md`

## Closing Note
This final submission delivers tested on-chain logic, a working dApp for the core user journey, and design documentation aligned with the IdeaStamp white paper. Deferred features are listed explicitly so the scope of this release remains clear.
