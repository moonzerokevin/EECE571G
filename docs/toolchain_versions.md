# Toolchain versions (paste into reports if needed)

To verify: run `npm list --depth=0` in the repo root and in `frontend/`.

## Smart contracts (repo root)
| Component | Version |
| --- | --- |
| Solidity (`hardhat.config.js`) | 0.8.24 |
| Hardhat | 2.28.6 (example: `npm list hardhat`) |
| @nomicfoundation/hardhat-toolbox | ^5.0.0 |

## Frontend (`frontend/`)
| Component | Version |
| --- | --- |
| Next.js | 15.2.4 |
| React / React DOM | ^19.0.0 |
| wagmi | 3.5.0 |
| @wagmi/core | 3.4.0 (resolved with wagmi) |
| viem | 2.47.6 |
| @tanstack/react-query | ^5.x |
| TypeScript | ^5.x |

## Notes
- Exact pins are in each `package-lock.json`.
- Screenshots are optional; test evidence is in `docs/testing_evidence_log.txt` and `docs/testing_evidence_template.md`.
