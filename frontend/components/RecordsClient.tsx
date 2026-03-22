"use client";

import { useAccount, useReadContract } from "wagmi";
import type { Hex } from "viem";
import { ideaRegistryAbi, ideaRegistryAddress } from "@/lib/contracts";
import { ContractHint } from "./ContractHint";

function RecordCard({ registry, hash }: { registry: `0x${string}`; hash: Hex }) {
  const { data: record } = useReadContract({
    address: registry,
    abi: ideaRegistryAbi,
    functionName: "getCommitment",
    args: [hash],
  });

  if (!record) {
    return (
      <li className="rounded-lg border border-zinc-200 p-3 font-mono text-xs dark:border-zinc-800">
        {hash} … loading
      </li>
    );
  }

  return (
    <li className="rounded-lg border border-zinc-200 p-3 text-sm dark:border-zinc-800">
      <p className="font-mono text-xs break-all text-zinc-500">{hash}</p>
      <ul className="mt-2 space-y-1 font-mono text-xs break-all text-zinc-700 dark:text-zinc-300">
        <li>committedAt: {record.committedAt.toString()}</li>
        <li>block: {record.committedBlock.toString()}</li>
        <li>revealed: {record.revealed ? "yes" : "no"}</li>
        <li>commitCid: {record.commitCid || "—"}</li>
      </ul>
    </li>
  );
}

export function RecordsClient() {
  const registry = ideaRegistryAddress();
  const { address, isConnected } = useAccount();

  const { data: hashes, isLoading } = useReadContract({
    address: registry,
    abi: ideaRegistryAbi,
    functionName: "getAuthorCommitments",
    args: address ? [address] : undefined,
    query: { enabled: !!registry && !!address },
  });

  return (
    <div className="space-y-6">
      <ContractHint />
      {!isConnected && (
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Connect a wallet to list commitments for the current address.
        </p>
      )}
      {isConnected && registry && address && (
        <>
          <p className="font-mono text-sm text-zinc-600 dark:text-zinc-400">{address}</p>
          {isLoading && <p className="text-sm">Loading…</p>}
          {!isLoading && (!hashes || hashes.length === 0) && (
            <p className="text-sm text-zinc-500">No records yet.</p>
          )}
          {hashes && hashes.length > 0 && (
            <ul className="space-y-3">
              {hashes.map((h) => (
                <RecordCard key={h} registry={registry} hash={h} />
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  );
}
