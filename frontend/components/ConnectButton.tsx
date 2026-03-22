"use client";

import { useAccount, useConnect, useDisconnect, useChainId } from "wagmi";

export function ConnectButton() {
  const chainId = useChainId();
  const { address, isConnected } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();

  if (isConnected && address) {
    return (
      <div className="flex items-center gap-2 text-xs">
        <span className="rounded bg-zinc-100 px-2 py-1 font-mono text-zinc-700 dark:bg-zinc-900 dark:text-zinc-300">
          {chainId}
        </span>
        <span className="max-w-[140px] truncate font-mono text-zinc-600 dark:text-zinc-400">
          {address.slice(0, 6)}…{address.slice(-4)}
        </span>
        <button
          type="button"
          onClick={() => disconnect()}
          className="rounded-md border border-zinc-300 px-2 py-1 text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-900"
        >
          Disconnect
        </button>
      </div>
    );
  }

  const connector = connectors[0];
  return (
    <button
      type="button"
      disabled={isPending || !connector}
      onClick={() => connector && connect({ connector })}
      className="rounded-md bg-zinc-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
    >
      {isPending ? "Connecting…" : "Connect wallet"}
    </button>
  );
}
