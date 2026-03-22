"use client";

import { useMemo, useRef, useState } from "react";
import {
  useAccount,
  useChainId,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import type { Hex } from "viem";
import { ideaRegistryAbi, ideaRegistryAddress } from "@/lib/contracts";
import {
  computeCommitmentLocal,
  hashFileBytes,
  hashUtf8,
  parseBytes32Hex,
} from "@/lib/hash";
import { ContractHint } from "./ContractHint";

const ZERO: Hex =
  "0x0000000000000000000000000000000000000000000000000000000000000000";

export function RevealClient() {
  const registry = ideaRegistryAddress();
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const [contentText, setContentText] = useState("");
  const [fileBytes, setFileBytes] = useState<Uint8Array | null>(null);
  const [useFile, setUseFile] = useState(false);
  const [metadata, setMetadata] = useState("");
  const [saltText, setSaltText] = useState("");
  const [saltHex, setSaltHex] = useState("");
  const [saltKind, setSaltKind] = useState<"text" | "hex">("text");
  const [cid, setCid] = useState("");

  const { writeContract, data: hash, isPending, error, reset } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const contentHash = useMemo(() => {
    if (useFile && fileBytes) return hashFileBytes(fileBytes);
    if (!useFile && contentText) return hashUtf8(contentText);
    return null;
  }, [useFile, fileBytes, contentText]);

  const metadataHash = useMemo(() => {
    if (!metadata.trim()) return ZERO;
    return hashUtf8(metadata);
  }, [metadata]);

  const salt: Hex | null = useMemo(() => {
    if (saltKind === "text") {
      if (!saltText) return null;
      return hashUtf8(saltText);
    }
    return parseBytes32Hex(saltHex);
  }, [saltKind, saltText, saltHex]);

  const commitmentPreview = useMemo(() => {
    if (!address || !contentHash || !salt) return null;
    return computeCommitmentLocal(chainId, address, contentHash, salt, metadataHash);
  }, [address, chainId, contentHash, salt, metadataHash]);

  const lastReveal = useRef<{ ch: Hex; s: Hex; mh: Hex } | null>(null);

  async function onReveal() {
    if (!registry || !contentHash || !salt) return;
    lastReveal.current = { ch: contentHash, s: salt, mh: metadataHash };
    reset();
    writeContract({
      address: registry,
      abi: ideaRegistryAbi,
      functionName: "reveal",
      args: [contentHash, salt, metadataHash, cid],
    });
  }

  const disabled =
    !isConnected ||
    !registry ||
    !address ||
    !contentHash ||
    !salt ||
    isPending ||
    isConfirming;

  return (
    <div className="space-y-6">
      <ContractHint />
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        Use the same content/file, metadata, and salt as at commit time; chain ID and author address must
        match.
      </p>

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={useFile}
          onChange={(e) => setUseFile(e.target.checked)}
        />
        Use file
      </label>

      {useFile ? (
        <input
          type="file"
          className="block w-full text-sm"
          onChange={async (e) => {
            const f = e.target.files?.[0];
            if (!f) {
              setFileBytes(null);
              return;
            }
            setFileBytes(new Uint8Array(await f.arrayBuffer()));
          }}
        />
      ) : (
        <textarea
          className="min-h-[120px] w-full rounded-lg border border-zinc-300 bg-white p-3 font-mono text-sm dark:border-zinc-700 dark:bg-zinc-950"
          value={contentText}
          onChange={(e) => setContentText(e.target.value)}
        />
      )}

      <input
        className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
        value={metadata}
        onChange={(e) => setMetadata(e.target.value)}
        placeholder="Metadata (empty = bytes32(0))"
      />

      <div className="flex gap-4 text-sm">
        <label className="flex items-center gap-1">
          <input
            type="radio"
            checked={saltKind === "text"}
            onChange={() => setSaltKind("text")}
          />
          Salt as text (keccak256 utf8)
        </label>
        <label className="flex items-center gap-1">
          <input
            type="radio"
            checked={saltKind === "hex"}
            onChange={() => setSaltKind("hex")}
          />
          Salt as bytes32 hex
        </label>
      </div>
      {saltKind === "text" ? (
        <input
          className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
          value={saltText}
          onChange={(e) => setSaltText(e.target.value)}
        />
      ) : (
        <input
          className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 font-mono text-sm dark:border-zinc-700 dark:bg-zinc-950"
          value={saltHex}
          onChange={(e) => setSaltHex(e.target.value)}
          placeholder="0x + 64 hex"
        />
      )}

      <input
        className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
        value={cid}
        onChange={(e) => setCid(e.target.value)}
        placeholder="Reveal CID (optional)"
      />

      <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 font-mono text-xs break-all dark:border-zinc-800 dark:bg-zinc-900/40">
        commitment: {commitmentPreview ?? "—"}
      </div>

      <button
        type="button"
        disabled={disabled}
        onClick={onReveal}
        className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-40 dark:bg-zinc-100 dark:text-zinc-900"
      >
        {isPending || isConfirming ? "Sending…" : "reveal"}
      </button>

      {error && <p className="text-sm text-red-600">{error.message}</p>}
      {hash && <p className="font-mono text-xs break-all text-zinc-600">tx: {hash}</p>}
      {isSuccess && lastReveal.current && (
        <p className="text-sm text-green-700 dark:text-green-400">
          Revealed. Keep salt and content for verifiers: salt = {lastReveal.current.s}
        </p>
      )}
    </div>
  );
}
