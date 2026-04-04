# IdeaStamp Assignment 3 Submission

## Project Summary
IdeaStamp is a blockchain-based priority proof system for early-stage research ideas and draft outputs. This Assignment 3 submission implements the core commit-reveal workflow proposed in the Assignment 2 white paper:

1. A user creates a salted commitment off-chain.
2. The commitment hash is stored on-chain with a timestamp and block number.
3. The original author may later reveal the content hash and salt.
4. Any third party can verify that the revealed material matches the earlier on-chain commitment.

The submission focuses on logical correctness, testability, and a clear dApp user flow. It is not intended to be production-ready.

## Submission Contents
- Smart contract source code in `contracts/`
- Unit tests in `test/`
- Wireframe PDF in `frontend_wireframe/IdeaStamp_A3_Wireframe.pdf`
- This `README.md` as the brief technical documentation
- Supporting evidence and version notes in `docs/`

## Smart Contract Design

### `IdeaRegistry.sol`
`IdeaRegistry.sol` is the main contract used in this submission. It stores commitments and supports later reveal and verification.

Main responsibilities:
- store unique commitment hashes on-chain
- record the author, commit timestamp, and block number
- support later reveal of `contentHash` and `salt`
- expose record data for public verification
- maintain simple owner-controlled fee administration

Commitment formula:

```solidity
keccak256(abi.encodePacked(chainId, authorAddress, contentHash, salt, metadataHash))
```

### `DisputeRegistryLite.sol`
`DisputeRegistryLite.sol` is included as an additional exploratory contract from the broader project design. It references `IdeaRegistry` through `IIdeaRegistry` and shows how a lightweight dispute registry could be connected to the commitment system. It is not part of the primary tested user flow for this Assignment 3 submission.

## White Paper Alignment
| White paper feature | Status in this submission |
| --- | --- |
| Timestamped commitment registry | Implemented |
| Commit-reveal proof workflow | Implemented |
| Public verification of priority claims | Implemented |
| Privacy-preserving salted commitments | Implemented |
| Basic dApp user journey | Represented in the wireframe |
| Token incentives and staking | Deferred |
| DAO governance | Deferred |
| Extended dispute process | Deferred from the main submission flow |

## Repository Structure
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
├── frontend/
├── frontend_wireframe/
│   └── IdeaStamp_A3_Wireframe.pdf
├── docs/
│   ├── testing_evidence_log.txt
│   ├── toolchain_versions.md
│   └── whitepaper_feature_mapping.md
├── hardhat.config.js
└── package.json
```

## Build and Test Instructions

### Prerequisites
- Node.js 18+ or 20+
- npm

### Install dependencies
```bash
npm install
```

### Compile the contracts
```bash
npm run compile
```

### Run the unit tests
```bash
npm test
```

## Unit Testing Scope
The unit test suite in `test/IdeaRegistry.test.js` covers the main contract behavior, including:
- successful commitment creation
- duplicate commitment rejection
- fee validation
- successful reveal
- invalid reveal and double reveal rejection
- author ownership checks
- commitment lookup and reveal status checks
- owner-only administrative operations
- withdrawal logic

Test execution evidence is recorded in `docs/testing_evidence_log.txt`.

## dApp Wireframe
The wireframe is provided in `frontend_wireframe/IdeaStamp_A3_Wireframe.pdf`. It documents the main user journey required for this prototype:
- landing page
- wallet connection entry point
- commit flow
- reveal flow
- verify flow
- records view

The wireframe is intended to communicate the front-end structure and expected interaction flow rather than a finished visual design.

## Assumptions and Scope
- Content is hashed off-chain before any blockchain transaction is sent.
- Full research content is not stored on-chain.
- `metadataHash` may represent optional metadata associated with the submission.
- The core assessed workflow is commit, reveal, and verify.
- Tokenomics, DAO governance, and a full dispute process are outside the scope of this assignment version.

## Local Front-End Prototype
This repository also contains a minimal Next.js prototype in `frontend/`. It is included as a supporting implementation artifact, but the Assignment 3 requirement is satisfied by the wireframe PDF rather than by a production-ready front end.

If needed for local demonstration:

Terminal A:
```bash
npx hardhat node
```

Terminal B:
```bash
npm run deploy:local
```

Terminal C:
```bash
cd frontend
npm install
npm run dev
```

## Toolchain Notes
- Solidity version: `0.8.24`
- Hardhat framework: listed in `package.json`
- Additional version notes: `docs/toolchain_versions.md`

## Evidence Included
- smart contract source files
- executable unit tests
- test execution log
- wireframe PDF
- white paper feature mapping

## Conclusion
This submission translates the core IdeaStamp white paper proposal into a testable smart contract prototype with a documented user workflow. The implementation demonstrates a clear on-chain design, executable validation through unit tests, and a dApp structure suitable for the Assignment 3 deliverables.
