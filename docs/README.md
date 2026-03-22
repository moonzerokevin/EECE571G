# IdeaStamp Assignment 3 Prototype

## Overview
This package implements a course-scope prototype for **IdeaStamp**, the Web3 dApp proposed in Assignment 2. The prototype focuses on the core workflow promised in the white paper:

1. **Commit** a salted hash proving prior possession of an idea or preprint draft.
2. **Reveal** the original content hash and salt later.
3. **Verify** that the reveal matches the earlier on-chain commitment.
4. **Optionally register a dispute** in a lightweight way for contested claims.

This is intentionally **not** a production-ready system and does **not** implement the full long-term tokenomics/governance vision from the white paper.

## White Paper Alignment
| White paper feature | Assignment 3 implementation status |
| --- | --- |
| Timestamped commitment registry | Implemented in `IdeaRegistry.sol` |
| Commit–reveal verification | Implemented in `IdeaRegistry.sol` |
| Public verifiability | Implemented through contract getters + pure hash helper |
| Privacy-preserving salted commitments | Implemented through off-chain commitment construction |
| Dispute module | Partially implemented in `DisputeRegistryLite.sol` |
| ERC20 incentives / staking | Deferred to future work |
| DAO governance | Deferred to future work |
| Organization memberships | Deferred to future work |

## Contract Architecture
### 1. `IdeaRegistry.sol`
Main contract for storing research-priority commitments.

Core responsibilities:
- store commitment hashes on-chain
- prevent duplicate commitments
- record commit timestamp and block number
- allow reveal of content hash + salt later
- expose records for verification and user dashboards

Commitment formula:
```solidity
keccak256(abi.encodePacked(chainId, authorAddress, contentHash, salt, metadataHash))
```

### 2. `DisputeRegistryLite.sol`
Lightweight registry for disputed claims. This contract is intentionally simple for course scope.

Core responsibilities:
- open a dispute against an existing commitment
- link a challenger commitment to the challenged commitment
- record a reason URI
- allow an owner/admin to mark the dispute resolved

## Folder Structure
```text
IdeaStamp_A3_Package/
├── contracts/
│   ├── IdeaRegistry.sol
│   ├── DisputeRegistryLite.sol
│   └── interfaces/
│       └── IIdeaRegistry.sol
├── test/
│   ├── IdeaRegistry.test.js
│   └── DisputeRegistryLite.test.js
├── scripts/
│   └── deploy.js
├── docs/
│   ├── README.md
│   ├── cursor_execution_guide.md
│   ├── whitepaper_feature_mapping.md
│   ├── testing_evidence_template.md
│   ├── testing_evidence_log.txt
│   ├── toolchain_versions.md
│   └── submission_checklist.md
├── frontend/
├── frontend_wireframe/
│   └── IdeaStamp_A3_Wireframe.pdf
├── hardhat.config.js
└── package.json
```

## Setup
Authoritative steps (local Hardhat node, deploy, MetaMask, `frontend/.env.local`) are in the **repository root `README.md`**.

Quick commands from the repo root:
```bash
npm install
npm run compile
npm test
```

## Assumptions
- The frontend computes the content hash, metadata hash, salt, and commitment hash locally.
- Full document content is **not** stored on-chain.
- Optional CID strings may point to IPFS or another content-addressed store, but storage is not required for the MVP.
- The dispute module is administrative and does not yet include staking or decentralized arbitration.

## Main User Flow
### Commit
1. User writes an idea note or uploads a draft.
2. Frontend computes `contentHash` from the raw bytes.
3. Frontend computes `metadataHash` from optional metadata.
4. Frontend generates a random 32-byte salt.
5. Frontend computes `commitmentHash`.
6. User submits `commitmentHash` to `IdeaRegistry.commit(...)`.

### Reveal
1. User re-opens the same content.
2. Frontend recomputes the same `contentHash`.
3. User supplies the original salt.
4. User submits `reveal(...)`.
5. Contract verifies that the recomputed commitment exists and belongs to the sender.

### Verify
1. Any verifier recomputes the commitment hash using the revealed values.
2. The verifier checks that the record exists on-chain and that it has been revealed.
3. The verifier compares timestamps/block numbers to establish proof-of-priority.

## Deferred Features
The following features remain consistent with the white paper but are intentionally deferred for Assignment 3:
- ERC20 IDEA token
- staking/slashing for disputes
- DAO governance
- encrypted file storage gateway
- organization accounts and subscriptions
- ORCID, GitHub, Overleaf, or Notion integrations

## Recommended Submission Notes
For the final A3 submission, include:
- compiler version
- Hardhat version
- screenshot or terminal log of successful test execution
- exported wireframe PDF
- short paragraph mapping the prototype back to the white paper

See also `submission_checklist.md` and `toolchain_versions.md` in this folder.
