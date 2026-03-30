/**
 * Explicit gas limits for writeContract calls.
 *
 * When a call is expected to revert (e.g. wrong reveal args → CommitmentNotFound),
 * wallets often fail eth_estimateGas and fall back to a huge gas limit (~block gas),
 * which Hardhat rejects (tx gas cap). Setting a modest fixed gas keeps failed txs
 * readable as contract reverts instead of "gas exceeds cap".
 */
export const GAS_COMMIT = 450_000n;
export const GAS_REVEAL = 350_000n;
export const GAS_OPEN_DISPUTE = 500_000n;
export const GAS_RESOLVE_DISPUTE = 300_000n;
