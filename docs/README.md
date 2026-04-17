# IdeaStamp — Technical Documentation (Supplement)

## Overview
This folder supplements the **repository root `README.md`**, which is the primary entry point for the final submission.

**IdeaStamp** is a Web3 application for timestamped, privacy-preserving commitments to research ideas and drafts. This release implements the core workflow from the project white paper:

1. **Commit** a salted hash that proves prior possession without publishing the full text on-chain.
2. **Reveal** the content hash and salt later, as the original author.
3. **Verify** that a revealed claim matches the on-chain commitment.
4. **Dispute handling** exists at the contract level (`DisputeRegistryLite.sol`) in a minimal form; the shipped web UI focuses on commit / reveal / verify / records.

The implementation is a research prototype, not a production system with full tokenomics or governance.

## White Paper Alignment
| White paper feature | Status in this release |
| --- | --- |
| Timestamped commitment registry | Implemented in `IdeaRegistry.sol` |
| Commit–reveal verification | Implemented in `IdeaRegistry.sol` |
| Public verifiability | Contract getters + `computeCommitment` |
| Privacy-preserving salted commitments | Off-chain hash construction in `frontend/` |
| Dispute module (minimal) | `DisputeRegistryLite.sol` |
| ERC20 incentives / staking | Deferred |
| DAO governance | Deferred |
| Organization memberships | Deferred |

## Contract Architecture
### `IdeaRegistry.sol`
Stores research-priority commitments and reveal state.

Core responsibilities:
- store commitment hashes on-chain
- prevent duplicate commitments
- record commit timestamp and block number
- allow reveal of content hash and salt
- expose records for verification and the records view

Commitment formula:
```solidity
keccak256(abi.encodePacked(chainId, authorAddress, contentHash, salt, metadataHash))
```

### `DisputeRegistryLite.sol`
Lightweight registry for disputed claims: open a dispute against an existing commitment, link a challenger commitment, record a reason URI, and allow an owner to mark resolution. No staking or decentralized arbitration in this version.

## Folder Structure (high level)
```text
IdeaStamp_A3_Package/
├── contracts/
├── test/
├── archive/test-dispute/
├── scripts/
├── docs/
├── frontend/
├── frontend_wireframe/
├── hardhat.config.js
└── package.json
```

## Setup
Authoritative run instructions for contracts, deploy, and the web app are in the **root `README.md`**.

Quick contract commands from the repository root:
```bash
npm install
npm run compile
npm test
```

## Assumptions
- The frontend computes content hash, metadata hash, salt, and commitment hash locally.
- Full document content is not stored on-chain.
- Optional CID strings may point to IPFS or another store; hosting that content is outside this repository.

## Main User Flow (dApp)
### Commit
1. User provides idea text or a file; the client derives `contentHash`.
2. Optional metadata yields `metadataHash`.
3. Client generates salt and computes `commitmentHash`.
4. User sends `commit(...)` with the required fee.

### Reveal
1. User supplies the same content and salt.
2. Client recomputes `contentHash` and `commitmentHash`.
3. User sends `reveal(...)`.

### Verify
A verifier recomputes the commitment and checks on-chain state (existence, reveal, timestamps).

## Deferred Features (relative to the full white paper vision)
- ERC20 IDEA token
- staking or slashing for disputes
- DAO governance
- encrypted file storage gateway
- organization accounts and subscriptions
- external integrations (ORCID, GitHub, Overleaf, Notion, etc.)

## Additional Files Here
- `toolchain_versions.md` — dependency versions
- `testing_evidence_log.txt` / `testing_evidence_template.md` — reproducible command logs
- `whitepaper_feature_mapping.md` — mapping table for reviewers
