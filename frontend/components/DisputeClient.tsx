"use client";

import { useMemo, useState } from "react";
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { disputeRegistryAbi, disputeRegistryAddress, ideaRegistryAddress } from "@/lib/contracts";
import { parseBytes32Hex } from "@/lib/hash";
import { ContractHint } from "./ContractHint";
import { MainnetDevWarning } from "./MainnetDevWarning";

const OUTCOMES = [
  { v: 1, label: "Rejected" },
  { v: 2, label: "AcceptedForChallenger" },
  { v: 3, label: "AcceptedForOriginalAuthor" },
  { v: 4, label: "SettledOffChain" },
] as const;

export function DisputeClient() {
  const ideaReg = ideaRegistryAddress();
  const disputeReg = disputeRegistryAddress();
  const { address, isConnected } = useAccount();

  const [challenged, setChallenged] = useState("");
  const [challenger, setChallenger] = useState("");
  const [reasonUri, setReasonUri] = useState("");

  const [lookupId, setLookupId] = useState("");
  const [resolveId, setResolveId] = useState("");
  const [outcome, setOutcome] = useState<number>(1);
  const [resolutionUri, setResolutionUri] = useState("");

  const challengedH = useMemo(() => parseBytes32Hex(challenged), [challenged]);
  const challengerH = useMemo(() => parseBytes32Hex(challenger), [challenger]);

  const { data: disputeFee } = useReadContract({
    address: disputeReg,
    abi: disputeRegistryAbi,
    functionName: "disputeFeeWei",
    query: { enabled: !!disputeReg },
  });

  const { data: disputeOwner } = useReadContract({
    address: disputeReg,
    abi: disputeRegistryAbi,
    functionName: "owner",
    query: { enabled: !!disputeReg },
  });

  const lookupBn = useMemo(() => {
    try {
      if (!lookupId.trim()) return undefined;
      return BigInt(lookupId.trim());
    } catch {
      return undefined;
    }
  }, [lookupId]);

  const { data: disputeRecord } = useReadContract({
    address: disputeReg,
    abi: disputeRegistryAbi,
    functionName: "getDispute",
    args: lookupBn !== undefined ? [lookupBn] : undefined,
    query: { enabled: !!disputeReg && lookupBn !== undefined && lookupBn > 0n },
  });

  const { writeContract: writeOpen, data: openHash, isPending: openPending, error: openErr, reset: resetOpen } =
    useWriteContract();
  const { isLoading: openConfirming, isSuccess: openOk } = useWaitForTransactionReceipt({
    hash: openHash,
  });

  const { writeContract: writeResolve, data: resHash, isPending: resPending, error: resErr, reset: resetRes } =
    useWriteContract();
  const { isLoading: resConfirming, isSuccess: resOk } = useWaitForTransactionReceipt({
    hash: resHash,
  });

  const isDisputeOwner =
    disputeOwner && address && disputeOwner.toLowerCase() === address.toLowerCase();

  async function onOpen() {
    if (!disputeReg || !challengedH || !challengerH || disputeFee == null) return;
    resetOpen();
    writeOpen({
      address: disputeReg,
      abi: disputeRegistryAbi,
      functionName: "openDispute",
      args: [challengedH, challengerH, reasonUri],
      value: disputeFee,
    });
  }

  async function onResolve() {
    if (!disputeReg) return;
    const id = BigInt(resolveId.trim());
    resetRes();
    writeResolve({
      address: disputeReg,
      abi: disputeRegistryAbi,
      functionName: "resolveDispute",
      args: [id, outcome, resolutionUri],
    });
  }

  const openDisabled =
    !isConnected ||
    !disputeReg ||
    !challengedH ||
    !challengerH ||
    disputeFee == null ||
    openPending ||
    openConfirming;

  return (
    <div className="space-y-10">
      <MainnetDevWarning />
      <ContractHint />
      {!ideaReg || !disputeReg ? null : (
        <p className="text-xs text-zinc-500">
          IdeaRegistry: {ideaReg.slice(0, 10)}… · DisputeRegistry: {disputeReg.slice(0, 10)}…
        </p>
      )}

      <section className="space-y-4">
        <h2 className="text-lg font-medium">Open dispute</h2>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Both commitments must exist on IdeaRegistry. Pay <code className="font-mono">disputeFeeWei</code>.
        </p>
        <p className="text-sm">Current fee: {disputeFee?.toString() ?? "—"} wei</p>
        <input
          className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 font-mono text-sm dark:border-zinc-700 dark:bg-zinc-950"
          value={challenged}
          onChange={(e) => setChallenged(e.target.value)}
          placeholder="Challenged commitment (bytes32)"
        />
        <input
          className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 font-mono text-sm dark:border-zinc-700 dark:bg-zinc-950"
          value={challenger}
          onChange={(e) => setChallenger(e.target.value)}
          placeholder="Challenger commitment (bytes32)"
        />
        <input
          className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
          value={reasonUri}
          onChange={(e) => setReasonUri(e.target.value)}
          placeholder="Reason URI (empty string allowed)"
        />
        <button
          type="button"
          disabled={openDisabled}
          onClick={onOpen}
          className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-40 dark:bg-zinc-100 dark:text-zinc-900"
        >
          {openPending || openConfirming ? "Sending…" : "openDispute"}
        </button>
        {openErr && <p className="text-sm text-red-600">{openErr.message}</p>}
        {openHash && <p className="font-mono text-xs break-all">{openHash}</p>}
        {openOk && <p className="text-sm text-green-700 dark:text-green-400">Dispute opened.</p>}
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-medium">Look up dispute</h2>
        <input
          className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
          value={lookupId}
          onChange={(e) => setLookupId(e.target.value)}
          placeholder="Dispute id (uint)"
        />
        {disputeRecord && (
          <pre className="overflow-x-auto rounded-lg bg-zinc-100 p-3 font-mono text-xs dark:bg-zinc-900">
            {JSON.stringify(
              {
                id: disputeRecord.id.toString(),
                challenger: disputeRecord.challenger,
                challengedCommitmentHash: disputeRecord.challengedCommitmentHash,
                challengerCommitmentHash: disputeRecord.challengerCommitmentHash,
                reasonUri: disputeRecord.reasonUri,
                createdAt: disputeRecord.createdAt.toString(),
                resolved: disputeRecord.resolved,
                outcome: disputeRecord.outcome,
                resolutionUri: disputeRecord.resolutionUri,
              },
              null,
              2
            )}
          </pre>
        )}
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-medium">Owner resolve</h2>
        {!isDisputeOwner && (
          <p className="text-sm text-zinc-500">Only the DisputeRegistry owner wallet can resolve.</p>
        )}
        <input
          className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
          value={resolveId}
          onChange={(e) => setResolveId(e.target.value)}
          placeholder="dispute id"
        />
        <select
          className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
          value={outcome}
          onChange={(e) => setOutcome(Number(e.target.value))}
        >
          {OUTCOMES.map((o) => (
            <option key={o.v} value={o.v}>
              {o.v} — {o.label}
            </option>
          ))}
        </select>
        <input
          className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
          value={resolutionUri}
          onChange={(e) => setResolutionUri(e.target.value)}
          placeholder="resolution URI"
        />
        <button
          type="button"
          disabled={
            !isDisputeOwner ||
            !disputeReg ||
            !resolveId.trim() ||
            resPending ||
            resConfirming
          }
          onClick={onResolve}
          className="rounded-lg border border-zinc-400 px-4 py-2 text-sm disabled:opacity-40 dark:border-zinc-600"
        >
          {resPending || resConfirming ? "Sending…" : "resolveDispute"}
        </button>
        {resErr && <p className="text-sm text-red-600">{resErr.message}</p>}
        {resOk && <p className="text-sm text-green-700 dark:text-green-400">Resolved.</p>}
      </section>
    </div>
  );
}
