import { encodePacked, keccak256, stringToBytes, type Hex } from "viem";

/** Matches Hardhat tests: keccak256(utf8(text)). */
export function hashUtf8(text: string): Hex {
  return keccak256(stringToBytes(text));
}

export function hashFileBytes(bytes: Uint8Array): Hex {
  return keccak256(bytes);
}

/** Solidity: keccak256(abi.encodePacked(chainId, author, contentHash, salt, metadataHash)) */
export function computeCommitmentLocal(
  chainId: number,
  author: Hex,
  contentHash: Hex,
  salt: Hex,
  metadataHash: Hex
): Hex {
  return keccak256(
    encodePacked(
      ["uint256", "address", "bytes32", "bytes32", "bytes32"],
      [BigInt(chainId), author, contentHash, salt, metadataHash]
    )
  );
}

export function parseBytes32Hex(input: string): Hex | null {
  const s = input.trim();
  if (!/^0x[a-fA-F0-9]{64}$/.test(s)) return null;
  return s as Hex;
}

export function randomSalt32(): Hex {
  const b = new Uint8Array(32);
  crypto.getRandomValues(b);
  return (`0x${Array.from(b, (x) => x.toString(16).padStart(2, "0")).join("")}`) as Hex;
}
