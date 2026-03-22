"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  useAccount,
  useChainId,
  useReadContract,
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
  randomSalt32,
} from "@/lib/hash";
import { ContractHint } from "./ContractHint";

const ZERO: Hex =
  "0x0000000000000000000000000000000000000000000000000000000000000000";

export function CommitClient() {
  const registry = ideaRegistryAddress();
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const [contentText, setContentText] = useState("");
  const [fileBytes, setFileBytes] = useState<Uint8Array | null>(null);
  const [useFile, setUseFile] = useState(false);
  const [metadata, setMetadata] = useState("");
  const [saltMode, setSaltMode] = useState<"random" | "text" | "hex">("random");
  const [saltText, setSaltText] = useState("");
  const [saltHex, setSaltHex] = useState("");
  const [randomSalt, setRandomSalt] = useState<Hex>(() => randomSalt32());
  const [cid, setCid] = useState("");

  const { data: commitFee } = useReadContract({
    address: registry,
    abi: ideaRegistryAbi,
    functionName: "commitFeeWei",
    query: { enabled: !!registry },
  });

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

  const prevSaltMode = useRef(saltMode);
  useEffect(() => {
    if (prevSaltMode.current !== saltMode && saltMode === "random") {
      setRandomSalt(randomSalt32());
    }
    prevSaltMode.current = saltMode;
  }, [saltMode]);

  const salt: Hex | null = useMemo(() => {
    if (saltMode === "random") return randomSalt;
    if (saltMode === "text") {
      if (!saltText) return null;
      return hashUtf8(saltText);
    }
    return parseBytes32Hex(saltHex);
  }, [saltMode, randomSalt, saltText, saltHex]);

  const commitmentPreview = useMemo(() => {
    if (!address || !contentHash || !salt) return null;
    return computeCommitmentLocal(chainId, address, contentHash, salt, metadataHash);
  }, [address, chainId, contentHash, salt, metadataHash]);

  async function onCommit() {
    if (!registry || !commitmentPreview || commitFee == null) return;
    reset();
    writeContract({
      address: registry,
      abi: ideaRegistryAbi,
      functionName: "commit",
      args: [commitmentPreview, metadataHash, cid],
      value: commitFee,
    });
  }

  const disabled =
    !isConnected ||
    !registry ||
    !address ||
    !contentHash ||
    !salt ||
    !commitmentPreview ||
    commitFee == null ||
    isPending ||
    isConfirming;

  return (
    <div className="space-y-6">
      <ContractHint />
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        Hash text or file bytes with Keccak-256 locally, combine with salt and metadata hash per the contract
        formula, then pay <code className="font-mono">commitFeeWei</code> to submit on-chain.
      </p>

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={useFile}
          onChange={(e) => setUseFile(e.target.checked)}
        />
        Use a file as content (otherwise use the text area below)
      </label>

      {useFile ? (
        <div>
          <label className="mb-1 block text-sm font-medium">File</label>
          <input
            type="file"
            className="block w-full text-sm"
            onChange={async (e) => {
              const f = e.target.files?.[0];
              if (!f) {
                setFileBytes(null);
                return;
              }
              const buf = new Uint8Array(await f.arrayBuffer());
              setFileBytes(buf);
            }}
          />
        </div>
      ) : (
        <div>
          <label className="mb-1 block text-sm font-medium">Idea / draft text</label>
          <textarea
            className="min-h-[120px] w-full rounded-lg border border-zinc-300 bg-white p-3 font-mono text-sm dark:border-zinc-700 dark:bg-zinc-950"
            value={contentText}
            onChange={(e) => setContentText(e.target.value)}
            placeholder="UTF-8 text; same as tests: keccak256(utf8 bytes)"
          />
        </div>
      )}

      <div>
        <label className="mb-1 block text-sm font-medium">Metadata (optional)</label>
        <input
          className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 font-mono text-sm dark:border-zinc-700 dark:bg-zinc-950"
          value={metadata}
          onChange={(e) => setMetadata(e.target.value)}
          placeholder="Leave empty for metadataHash = bytes32(0)"
        />
      </div>

      <div>
        <span className="mb-2 block text-sm font-medium">Salt</span>
        <div className="mb-2 flex flex-wrap gap-3 text-sm">
          {(["random", "text", "hex"] as const).map((m) => (
            <label key={m} className="flex items-center gap-1">
              <input
                type="radio"
                name="salt"
                checked={saltMode === m}
                onChange={() => setSaltMode(m)}
              />
              {m === "random"
                ? "Random 32 bytes"
                : m === "text"
                  ? "Text (hashed to bytes32)"
                  : "Raw bytes32 hex"}
            </label>
          ))}
        </div>
        {saltMode === "text" && (
          <input
            className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
            value={saltText}
            onChange={(e) => setSaltText(e.target.value)}
            placeholder="Same as Hardhat tests: keccak256(utf8)"
          />
        )}
        {saltMode === "hex" && (
          <input
            className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 font-mono text-sm dark:border-zinc-700 dark:bg-zinc-950"
            value={saltHex}
            onChange={(e) => setSaltHex(e.target.value)}
            placeholder="0x + 64 hex"
          />
        )}
        {saltMode === "random" && (
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <span className="font-mono text-xs break-all text-zinc-600 dark:text-zinc-400">
              {randomSalt}
            </span>
            <button
              type="button"
              className="rounded border border-zinc-300 px-2 py-1 text-xs dark:border-zinc-600"
              onClick={() => setRandomSalt(randomSalt32())}
            >
              Regenerate
            </button>
          </div>
        )}
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">CID (optional)</label>
        <input
          className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
          value={cid}
          onChange={(e) => setCid(e.target.value)}
          placeholder="ipfs://... or leave empty"
        />
      </div>

      <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 text-sm dark:border-zinc-800 dark:bg-zinc-900/40">
        <p className="font-mono text-xs break-all">
          <span className="text-zinc-500">contentHash:</span> {contentHash ?? "—"}
        </p>
        <p className="mt-1 font-mono text-xs break-all">
          <span className="text-zinc-500">metadataHash:</span> {metadataHash}
        </p>
        <p className="mt-1 font-mono text-xs break-all">
          <span className="text-zinc-500">salt:</span> {salt ?? "—"}
        </p>
        <p className="mt-1 font-mono text-xs break-all">
          <span className="text-zinc-500">commitmentHash:</span> {commitmentPreview ?? "—"}
        </p>
        <p className="mt-1 text-zinc-600 dark:text-zinc-400">
          commitFeeWei: {commitFee != null ? commitFee.toString() : "—"}
        </p>
      </div>

      <button
        type="button"
        disabled={disabled}
        onClick={onCommit}
        className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-40 dark:bg-zinc-100 dark:text-zinc-900"
      >
        {isPending || isConfirming ? "Sending transaction…" : "Submit commit"}
      </button>

      {error && <p className="text-sm text-red-600">{error.message}</p>}
      {hash && <p className="font-mono text-xs break-all text-zinc-600">tx: {hash}</p>}
      {isSuccess && <p className="text-sm text-green-700 dark:text-green-400">Transaction confirmed.</p>}
    </div>
  );
}
