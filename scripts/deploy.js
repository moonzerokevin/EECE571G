const hre = require("hardhat");

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

  console.log("DisputeRegistryLite deployed to:", await disputeRegistry.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
