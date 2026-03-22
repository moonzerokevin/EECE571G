# Assignment 3 — submission checklist (short)

## Contracts and tests
- [ ] Root: `npm install`, `npm run compile`, and `npm test` succeed.
- [ ] Test evidence updated: `docs/testing_evidence_log.txt`, `docs/testing_evidence_template.md`.
- [ ] Versions recorded or linked in `docs/toolchain_versions.md`.

## Frontend (minimal prototype)
- [ ] `frontend/`: `npm install` and `npm run build` succeed.
- [ ] Copy `frontend/.env.local.example` to `frontend/.env.local` and set `NEXT_PUBLIC_IDEA_REGISTRY` and `NEXT_PUBLIC_DISPUTE_REGISTRY`.
- [ ] Local demo: `npx hardhat node` → another terminal `npm run deploy:local` → `cd frontend && npm run dev`, wallet on Hardhat (chain ID 31337), exercise Commit / Reveal / Verify.

## Course materials
- [ ] Wireframe PDF: `IdeaStamp_A3_Wireframe.pdf` and/or `frontend_wireframe/IdeaStamp_A3_Wireframe.pdf` (per course format).
- [ ] If the course requires a **PDF** report: export root `README.md` (optionally merge key points from `docs/whitepaper_feature_mapping.md`) to PDF.
- [ ] Keep the white paper mapping available: `docs/whitepaper_feature_mapping.md`.
- [ ] Short paragraph linking this prototype to the white paper scope (in your write-up if required).

## Optional
- [ ] Screenshot of passing tests or terminal (`testing_evidence_log.txt` can substitute if allowed).
- [ ] For Sepolia: set `NEXT_PUBLIC_SEPOLIA_RPC_URL` and switch MetaMask to Sepolia.
