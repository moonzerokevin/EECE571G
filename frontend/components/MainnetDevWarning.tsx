"use client";

import { useChainId } from "wagmi";

/**
 * Local Hardhat deploy addresses only exist on chain 31337. The same 0x… on Ethereum mainnet is a
 * different contract/account — Blockaid correctly warns if the user sends there by mistake.
 */
export function MainnetDevWarning() {
  const chainId = useChainId();
  if (chainId !== 1) return null;
  return (
    <div className="mb-4 rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-900 dark:border-red-900 dark:bg-red-950/40 dark:text-red-100">
      <strong>Wrong network:</strong> MetaMask is on <strong>Ethereum Mainnet</strong>. Contracts from{" "}
      <code className="font-mono">npm run deploy:local</code> exist only on the{" "}
      <strong>local Hardhat</strong> chain (<strong>31337</strong>, RPC{" "}
      <code className="font-mono">http://127.0.0.1:8545</code>). On mainnet, the same address is someone
      else&apos;s account — security tools will flag it. Add/switch to the Localhost 31337 network in
      MetaMask, then use the test ETH from your <code className="font-mono">hardhat node</code> account.
    </div>
  );
}
