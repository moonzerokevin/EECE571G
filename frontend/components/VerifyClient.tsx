"use client";

import { useMemo, useState } from "react";
import { useAccount, useChainId, useReadContract } from "wagmi";
import { isAddress, type Address, type Hex } from "viem";
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

export function VerifyClient() {
  const registry = ideaRegistryAddress();
  const { address: connected } = useAccount();
  const chainId = useChainId();
  const [authorInput, setAuthorInput] = useState("");
  const authorRaw = authorInput.trim() || connected || "";
  const author = isAddress(authorRaw) ? (authorRaw as Address) : null;
  const [contentText, setContentText] = useState("");
  const [fileBytes, setFileBytes] = useState<Uint8Array | null>(null);
  const [useFile, setUseFile] = useState(false);
  const [metadata, setMetadata] = useState("");
  const [saltText, setSaltText] = useState("");
  const [saltHex, setSaltHex] = useState("");
  const [saltKind, setSaltKind] = useState<"text" | "hex">("text");
  const [byHash, setByHash] = useState("");
  const [mode, setMode] = useState<"derive" | "hash">("derive");

  const contentHash = useMemo(() => {
    if (mode === "hash") return null;
    if (useFile && fileBytes) return hashFileBytes(fileBytes);
    if (!useFile && contentText) return hashUtf8(contentText);
    return null;
  }, [mode, useFile, fileBytes, contentText]);

  const metadataHash = useMemo(() => {
    if (mode === "hash") return ZERO;
    if (!metadata.trim()) return ZERO;
    return hashUtf8(metadata);
  }, [mode, metadata]);

  const salt: Hex | null = useMemo(() => {
    if (mode === "hash") return null;
    if (saltKind === "text") {
      if (!saltText) return null;
      return hashUtf8(saltText);
    }
    return parseBytes32Hex(saltHex);
  }, [mode, saltKind, saltText, saltHex]);

  const derivedCommitment = useMemo(() => {
    if (mode !== "derive" || author == null || !contentHash || !salt) return null;
    return computeCommitmentLocal(chainId, author, contentHash, salt, metadataHash);
  }, [mode, author, chainId, contentHash, salt, metadataHash]);

  const commitmentHash = useMemo(() => {
    if (mode === "hash") return parseBytes32Hex(byHash);
    return derivedCommitment;
  }, [mode, byHash, derivedCommitment]);

  const { data: exists } = useReadContract({
    address: registry,
    abi: ideaRegistryAbi,
    functionName: "hasCommitment",
    args: commitmentHash ? [commitmentHash] : undefined,
    query: { enabled: !!registry && !!commitmentHash },
  });

  const { data: revealed } = useReadContract({
    address: registry,
    abi: ideaRegistryAbi,
    functionName: "isRevealed",
    args: commitmentHash ? [commitmentHash] : undefined,
    query: { enabled: !!registry && !!commitmentHash && !!exists },
  });

  const { data: record } = useReadContract({
    address: registry,
    abi: ideaRegistryAbi,
    functionName: "getCommitment",
    args: commitmentHash ? [commitmentHash] : undefined,
    query: { enabled: !!registry && !!commitmentHash && !!exists },
  });

  return (
    <div className="space-y-6">
      <ContractHint />
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        Derive the commitment from author + content + salt locally, or paste a commitment hash, then read
        on-chain state (wallet RPC must point at the deployed network).
      </p>

      <div className="flex gap-4 text-sm">
        <label className="flex items-center gap-1">
          <input
            type="radio"
            checked={mode === "derive"}
            onChange={() => setMode("derive")}
          />
          Derive from content
        </label>
        <label className="flex items-center gap-1">
          <input
            type="radio"
            checked={mode === "hash"}
            onChange={() => setMode("hash")}
          />
          Paste commitment hash
        </label>
      </div>

      {mode === "derive" && (
        <>
          <input
            className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 font-mono text-sm dark:border-zinc-700 dark:bg-zinc-950"
            value={authorInput}
            onChange={(e) => setAuthorInput(e.target.value)}
            placeholder={`Author address (empty = connected wallet: ${connected ?? "none"})`}
          />
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
              className="min-h-[100px] w-full rounded-lg border border-zinc-300 bg-white p-3 font-mono text-sm dark:border-zinc-700 dark:bg-zinc-950"
              value={contentText}
              onChange={(e) => setContentText(e.target.value)}
            />
          )}
          <input
            className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
            value={metadata}
            onChange={(e) => setMetadata(e.target.value)}
            placeholder="Metadata (optional)"
          />
          <div className="flex gap-4 text-sm">
            <label className="flex items-center gap-1">
              <input
                type="radio"
                checked={saltKind === "text"}
                onChange={() => setSaltKind("text")}
              />
              Salt: text
            </label>
            <label className="flex items-center gap-1">
              <input
                type="radio"
                checked={saltKind === "hex"}
                onChange={() => setSaltKind("hex")}
              />
              Salt: hex
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
            />
          )}
        </>
      )}

      {mode === "hash" && (
        <input
          className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 font-mono text-sm dark:border-zinc-700 dark:bg-zinc-950"
          value={byHash}
          onChange={(e) => setByHash(e.target.value)}
          placeholder="commitment bytes32"
        />
      )}

      <p className="font-mono text-xs break-all text-zinc-700 dark:text-zinc-300">
        Current chain ID (from wallet): {chainId} — derivation uses this chainId.
      </p>
      <p className="font-mono text-xs break-all text-zinc-700 dark:text-zinc-300">
        Lookup hash: {commitmentHash ?? "—"}
      </p>

      {commitmentHash && exists === false && (
        <p className="text-sm text-amber-700 dark:text-amber-300">No such commitment on-chain.</p>
      )}
      {exists && (
        <div className="space-y-2 rounded-lg border border-zinc-200 bg-zinc-50 p-4 text-sm dark:border-zinc-800 dark:bg-zinc-900/40">
          <p>
            On-chain record. Revealed: {revealed ? "yes" : "no"}
          </p>
          {record && (
            <ul className="space-y-1 font-mono text-xs break-all text-zinc-600 dark:text-zinc-400">
              <li>author: {record.author}</li>
              <li>committedAt: {record.committedAt.toString()}</li>
              <li>committedBlock: {record.committedBlock.toString()}</li>
              <li>commitCid: {record.commitCid || "—"}</li>
              {revealed && (
                <>
                  <li>revealedContentHash: {record.revealedContentHash}</li>
                  <li>revealSalt: {record.revealSalt}</li>
                  <li>revealCid: {record.revealCid || "—"}</li>
                </>
              )}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
