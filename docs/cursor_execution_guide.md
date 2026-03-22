# Cursor Execution Guide

Use these prompts in order. Do **not** expand scope beyond the package unless a step fails.

## Prompt 1 - bootstrap and compile
```text
Open this repository and inspect all files first. Do not rewrite the architecture.

Goal: get the Hardhat contracts compiling exactly as written.

Tasks:
1. Install dependencies from package.json.
2. Run `npm run compile`.
3. If compilation fails, fix only the minimum syntax/import/version issues.
4. Do not change the contract logic unless required for compilation.
5. Report back with:
   - any files changed
   - final compile status
   - exact commands used
```

## Prompt 2 - run tests and patch only what is necessary
```text
Now run the Hardhat test suite exactly as provided.

Tasks:
1. Run `npm test`.
2. If tests fail, patch only the failing issues.
3. Preserve the current course scope: commit, reveal, verify, dispute-lite.
4. Do not add ERC20, staking, DAO, or backend services.
5. After tests pass, save the full terminal output to `docs/testing_evidence_log.txt`.
6. Update `docs/testing_evidence_template.md` with the real command output summary.
```

## Prompt 3 - minimal frontend scaffold
```text
Build a very small Next.js frontend in a separate `frontend/` folder.

Requirements:
- pages/screens: Home, Commit, Reveal, Verify, My Records, Dispute
- wagmi wallet connect
- local keccak256 hashing for text/file inputs
- no backend required
- optional CID field only; no real IPFS implementation required
- read contract addresses from `.env.local`
- keep styling minimal but clean

Do not add auth, databases, or tokenomics.
```

## Prompt 4 - final cleanup for submission
```text
Prepare this repository for an Assignment 3 submission.

Tasks:
1. Ensure README is accurate.
2. Add compiler version and framework version into docs.
3. Add final screenshots if available.
4. Keep the whitepaper feature mapping table intact.
5. Produce a final concise submission checklist in `docs/submission_checklist.md`.
```
