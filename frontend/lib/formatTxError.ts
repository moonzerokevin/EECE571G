/**
 * Map long viem/wagmi revert strings to a short user-facing line.
 * Full text is kept for optional "technical details" disclosure.
 */
export function contractErrorSummary(error: unknown): { user: string; technical: string } {
  const technical =
    error instanceof Error ? error.message : typeof error === "string" ? error : String(error);

  const t = technical;

  if (/CommitmentNotFound/i.test(t)) {
    return {
      user: "No matching commitment on-chain. Use the same wallet, content, salt, and metadata as when you committed.",
      technical,
    };
  }
  if (/AlreadyRevealed/i.test(t)) {
    return {
      user: "This commitment was already revealed.",
      technical,
    };
  }
  if (/UnauthorizedAuthor/i.test(t)) {
    return {
      user: "Only the original author wallet can reveal this commitment.",
      technical,
    };
  }
  if (/MetadataHashMismatch/i.test(t)) {
    return {
      user: "Metadata does not match the original commit.",
      technical,
    };
  }
  if (/DuplicateCommitment/i.test(t)) {
    return {
      user: "This commitment hash already exists.",
      technical,
    };
  }
  if (/InvalidCommitmentHash/i.test(t)) {
    return {
      user: "Invalid commitment hash (zero is not allowed).",
      technical,
    };
  }
  if (/InsufficientCommitFee/i.test(t)) {
    return {
      user: "Sent value is below the required commit fee.",
      technical,
    };
  }
  if (/UnknownCommitment/i.test(t)) {
    return {
      user: "One or both commitments are not registered on IdeaRegistry.",
      technical,
    };
  }
  if (/InvalidDispute/i.test(t)) {
    return {
      user: "Invalid dispute input (e.g. duplicate or zero hashes).",
      technical,
    };
  }
  if (/InsufficientDisputeFee/i.test(t)) {
    return {
      user: "Sent value is below the required dispute fee.",
      technical,
    };
  }
  if (/DisputeNotFound/i.test(t)) {
    return {
      user: "No dispute with that id.",
      technical,
    };
  }
  if (/AlreadyResolved/i.test(t)) {
    return {
      user: "This dispute is already resolved.",
      technical,
    };
  }
  if (/User rejected|denied transaction|rejected the request/i.test(t)) {
    return {
      user: "Transaction was rejected in the wallet.",
      technical,
    };
  }

  const max = 180;
  const user =
    technical.length <= max
      ? technical
      : `${technical.slice(0, max).trim()}… (see details below)`;

  return { user, technical };
}
