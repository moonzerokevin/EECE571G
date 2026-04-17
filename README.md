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
