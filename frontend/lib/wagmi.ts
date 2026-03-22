import { injected } from "@wagmi/core";
import { createConfig, http } from "wagmi";
import { hardhat, sepolia } from "wagmi/chains";

const hardhatRpc =
  process.env.NEXT_PUBLIC_HARDHAT_RPC_URL ?? "http://127.0.0.1:8545";
const sepoliaRpc =
  process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL ??
  "https://ethereum-sepolia-rpc.publicnode.com";

export const wagmiConfig = createConfig({
  chains: [hardhat, sepolia],
  connectors: [injected()],
  transports: {
    [hardhat.id]: http(hardhatRpc),
    [sepolia.id]: http(sepoliaRpc),
  },
  ssr: true,
});
