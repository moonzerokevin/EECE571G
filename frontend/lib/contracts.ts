import type { Address } from "viem";

export function ideaRegistryAddress(): Address | undefined {
  const v = process.env.NEXT_PUBLIC_IDEA_REGISTRY;
  if (!v || !/^0x[a-fA-F0-9]{40}$/.test(v)) return undefined;
  return v as Address;
}

export function disputeRegistryAddress(): Address | undefined {
  const v = process.env.NEXT_PUBLIC_DISPUTE_REGISTRY;
  if (!v || !/^0x[a-fA-F0-9]{40}$/.test(v)) return undefined;
  return v as Address;
}

export const ideaRegistryAbi = [
  {
    type: "function",
    name: "computeCommitment",
    stateMutability: "view",
    inputs: [
      { name: "author", type: "address" },
      { name: "contentHash", type: "bytes32" },
      { name: "salt", type: "bytes32" },
      { name: "metadataHash", type: "bytes32" },
    ],
    outputs: [{ type: "bytes32" }],
  },
  {
    type: "function",
    name: "commit",
    stateMutability: "payable",
    inputs: [
      { name: "commitmentHash", type: "bytes32" },
      { name: "metadataHash", type: "bytes32" },
      { name: "cid", type: "string" },
    ],
    outputs: [],
  },
  {
    type: "function",
    name: "reveal",
    stateMutability: "nonpayable",
    inputs: [
      { name: "contentHash", type: "bytes32" },
      { name: "salt", type: "bytes32" },
      { name: "metadataHash", type: "bytes32" },
      { name: "cid", type: "string" },
    ],
    outputs: [],
  },
  {
    type: "function",
    name: "getCommitment",
    stateMutability: "view",
    inputs: [{ name: "commitmentHash", type: "bytes32" }],
    outputs: [
      {
        type: "tuple",
        components: [
          { name: "author", type: "address" },
          { name: "committedAt", type: "uint64" },
          { name: "committedBlock", type: "uint64" },
          { name: "commitmentHash", type: "bytes32" },
          { name: "metadataHash", type: "bytes32" },
          { name: "commitCid", type: "string" },
          { name: "exists", type: "bool" },
          { name: "revealed", type: "bool" },
          { name: "revealedContentHash", type: "bytes32" },
          { name: "revealSalt", type: "bytes32" },
          { name: "revealCid", type: "string" },
          { name: "revealedAt", type: "uint64" },
        ],
      },
    ],
  },
  {
    type: "function",
    name: "hasCommitment",
    stateMutability: "view",
    inputs: [{ name: "commitmentHash", type: "bytes32" }],
    outputs: [{ type: "bool" }],
  },
  {
    type: "function",
    name: "isRevealed",
    stateMutability: "view",
    inputs: [{ name: "commitmentHash", type: "bytes32" }],
    outputs: [{ type: "bool" }],
  },
  {
    type: "function",
    name: "getAuthorCommitments",
    stateMutability: "view",
    inputs: [{ name: "author", type: "address" }],
    outputs: [{ type: "bytes32[]" }],
  },
  {
    type: "function",
    name: "commitFeeWei",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "uint256" }],
  },
  {
    type: "function",
    name: "owner",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "address" }],
  },
] as const;

export const disputeRegistryAbi = [
  {
    type: "function",
    name: "openDispute",
    stateMutability: "payable",
    inputs: [
      { name: "challengedCommitmentHash", type: "bytes32" },
      { name: "challengerCommitmentHash", type: "bytes32" },
      { name: "reasonUri", type: "string" },
    ],
    outputs: [{ type: "uint256" }],
  },
  {
    type: "function",
    name: "disputeFeeWei",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "uint256" }],
  },
  {
    type: "function",
    name: "getDispute",
    stateMutability: "view",
    inputs: [{ name: "disputeId", type: "uint256" }],
    outputs: [
      {
        type: "tuple",
        components: [
          { name: "id", type: "uint256" },
          { name: "challenger", type: "address" },
          { name: "challengedCommitmentHash", type: "bytes32" },
          { name: "challengerCommitmentHash", type: "bytes32" },
          { name: "reasonUri", type: "string" },
          { name: "createdAt", type: "uint64" },
          { name: "resolved", type: "bool" },
          { name: "outcome", type: "uint8" },
          { name: "resolutionUri", type: "string" },
        ],
      },
    ],
  },
  {
    type: "function",
    name: "resolveDispute",
    stateMutability: "nonpayable",
    inputs: [
      { name: "disputeId", type: "uint256" },
      { name: "outcome", type: "uint8" },
      { name: "resolutionUri", type: "string" },
    ],
    outputs: [],
  },
  {
    type: "function",
    name: "owner",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "address" }],
  },
] as const;
