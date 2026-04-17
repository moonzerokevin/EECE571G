# Testing evidence template

## Environment
- Node.js version: v22.22.0
- npm version: 10.9.4
- Hardhat version: 2.28.6
- Solidity compiler: 0.8.24 (`hardhat.config.js`)
- Evidence log timestamp (UTC): see the `date:` line at the top of `testing_evidence_log.txt`

## Commands run
```bash
# Repo root (contracts + tests)
npm install
npm run compile
npm test

# Frontend production build (appended to the same log)
cd frontend && npm run build
```

## Terminal output
Full output is in **`docs/testing_evidence_log.txt`** (environment, `npm install`, `compile`, `test`, and `frontend` `npm run build`). Excerpt — tests only:

```text
=== npm test ===

> ideastamp-a3@1.0.0 test
> hardhat test

  IdeaRegistry
    ✔ … (20 tests total: commit/reveal paths, fees, owner ops, view helpers, negative cases)

  20 passing
```

## Summary
- Passing tests: **20** on `IdeaRegistry` (`DisputeRegistryLite` suite archived under `archive/test-dispute/`, not run by `npm test`)
- Warnings: `npm install` audit notices (e.g. glob); do not block compile/test. Watch Next.js security advisories when upgrading.
- Fix after first run: `IdeaRegistry` test `Committed` event — use `anyUint` matchers (not `anyValue()`) for uint args. See test file.

---

## Deliverable cross-check (final submission)

| Area | This repository |
| --- | --- |
| Core contracts aligned with the white paper, compile | `IdeaRegistry.sol`, `DisputeRegistryLite.sol`; commit–reveal–verify plus optional lite dispute contract; token/staking/DAO deferred (see root `README.md`, `whitepaper_feature_mapping.md`). |
| Comments, events, access control, validation | NatSpec, events, `onlyOwner`, custom errors, etc. |
| Multiple contracts + interaction | `DisputeRegistryLite` uses `IIdeaRegistry`; described in root `README.md`. |
| Unit tests: main paths + failures / unauthorized | Hardhat, 20 tests on `IdeaRegistry` (dispute suite in `archive/test-dispute/`, not run by `npm test`). |
| Reproducible commands | `npm test`, `cd frontend && npm run build`; logs in `testing_evidence_log.txt`. |
| Runnable dApp | `frontend/` — wallet, Commit / Reveal / Verify / My Records. |
| Wireframe / design reference | `frontend_wireframe/IdeaStamp_A3_Wireframe.pdf` |
| Technical documentation | Root `README.md`, this folder (`docs/README.md`, mapping, toolchain). |

### Notes
- The **live UI** in `frontend/` is the primary demonstration surface; the **PDF wireframe** documents the intended screen structure and flow.
- Export root `README.md` to PDF only if a course portal still requires a PDF report.
