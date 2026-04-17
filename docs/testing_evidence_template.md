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

## Assignment 3 (EECE571G) — requirement cross-check (from course PDF)

Not official grading; follow your TA and rubric.

| Requirement (summary) | This repo |
| --- | --- |
| Core contracts aligned with A2 white paper, compile | `IdeaRegistry.sol`, `DisputeRegistryLite.sol`; commit–reveal–verify + lite dispute; ERC20/staking/DAO deferred (see `README.md`, `whitepaper_feature_mapping.md`). |
| Comments, events, access control, validation | NatSpec/comments, `event`, `onlyOwner`, custom errors, etc. |
| Multiple contracts + interaction | `DisputeRegistryLite` uses `IIdeaRegistry`; architecture in root `README.md`. |
| Unit tests: main paths + failures/unauthorized | Hardhat, 20 tests on `IdeaRegistry` (dispute suite archived, not run by default). |
| Framework + reproducible steps | `npm test` in `package.json`; evidence in this file and `testing_evidence_log.txt`. |
| dApp wireframe: main screens and journey | `IdeaStamp_A3_Wireframe.pdf` (root + `frontend_wireframe/`); wallet, Commit/Reveal/Verify, Records, Dispute Lite + admin. |
| Brief technical doc: compile, test, wireframe | Root `README.md`, `docs/README.md`. |
| Short mapping to white paper promises | `docs/whitepaper_feature_mapping.md` + README table. |
| Recommended: compiler, framework, test command, logs/screenshots | `docs/toolchain_versions.md` + this file + `testing_evidence_log.txt`. |

### “Fully compliant”?
- **Core deliverables (code, runnable tests, wireframe, docs, white-paper link): covered with verifiable logs.**
- Suggested structure mentioned a **PDF** README/report; primary doc is **`README.md`**. If required, export to PDF before submission.
- Screenshots are *recommended*; logs can substitute if the rubric allows.
- Runnable `frontend/` goes beyond “wireframe only”; it does not replace the wireframe PDF but supports the same flows.
