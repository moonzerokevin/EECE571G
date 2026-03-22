const fs = require("fs");
const path = require("path");
const hre = require("hardhat");

/**
 * Updates frontend/.env.local so the Next app picks up addresses without manual copy.
 * Does not modify .env.local.example — that file stays a generic template for git clones.
 */
function upsertFrontendEnvLocal(ideaRegistryAddr, disputeRegistryAddr) {
  const frontendDir = path.join(__dirname, "..", "frontend");
  const envPath = path.join(frontendDir, ".env.local");
  const examplePath = path.join(frontendDir, ".env.local.example");

  let content = "";
  if (fs.existsSync(envPath)) {
    content = fs.readFileSync(envPath, "utf8");
  } else if (fs.existsSync(examplePath)) {
    content = fs.readFileSync(examplePath, "utf8");
  } else {
    content =
      "# Auto-maintained by npm run deploy:local (do not commit — use .gitignore)\n";
  }

  const lines = content.split(/\r?\n/);
  const upsert = (key, value) => {
    const prefix = `${key}=`;
    const idx = lines.findIndex((line) => {
      const t = line.trim();
      if (t.startsWith("#")) return false;
      return t.startsWith(prefix);
    });
    const nextLine = `${key}=${value}`;
    if (idx >= 0) lines[idx] = nextLine;
    else lines.push(nextLine);
  };

  upsert("NEXT_PUBLIC_IDEA_REGISTRY", ideaRegistryAddr);
  upsert("NEXT_PUBLIC_DISPUTE_REGISTRY", disputeRegistryAddr);

  const out = lines.join("\n").replace(/\s*$/, "\n");
  fs.writeFileSync(envPath, out, "utf8");
  console.log("");
  console.log("Updated frontend/.env.local with contract addresses.");
  console.log("Restart `npm run dev` in frontend/ if it is already running (NEXT_PUBLIC_* is read at startup).");
}

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying with:", deployer.address);

  const commitFeeWei = hre.ethers.parseEther("0.0001");
  const disputeFeeWei = hre.ethers.parseEther("0.0002");

  const IdeaRegistry = await hre.ethers.getContractFactory("IdeaRegistry");
  const registry = await IdeaRegistry.deploy(commitFeeWei);
  await registry.waitForDeployment();

  const registryAddress = await registry.getAddress();
  console.log("IdeaRegistry deployed to:", registryAddress);

  const DisputeRegistryLite = await hre.ethers.getContractFactory("DisputeRegistryLite");
  const disputeRegistry = await DisputeRegistryLite.deploy(registryAddress, disputeFeeWei);
  await disputeRegistry.waitForDeployment();

  const disputeAddress = await disputeRegistry.getAddress();
  console.log("DisputeRegistryLite deployed to:", disputeAddress);

  upsertFrontendEnvLocal(registryAddress, disputeAddress);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
