const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("DisputeRegistryLite", function () {
  async function deployFixture() {
    const [owner, alice, bob, carol] = await ethers.getSigners();
    const commitFee = ethers.parseEther("0.0001");
    const disputeFee = ethers.parseEther("0.0002");

    const IdeaRegistry = await ethers.getContractFactory("IdeaRegistry");
    const registry = await IdeaRegistry.deploy(commitFee);
    await registry.waitForDeployment();

    const DisputeRegistryLite = await ethers.getContractFactory("DisputeRegistryLite");
    const disputeRegistry = await DisputeRegistryLite.deploy(await registry.getAddress(), disputeFee);
    await disputeRegistry.waitForDeployment();

    return { registry, disputeRegistry, owner, alice, bob, carol, commitFee, disputeFee };
  }

  function hashBytes(input) {
    return ethers.keccak256(ethers.toUtf8Bytes(input));
  }

  async function createCommitment(registry, signer, content, saltLabel, metadataLabel, fee) {
    const contentHash = hashBytes(content);
    const salt = hashBytes(saltLabel);
    const metadataHash = hashBytes(metadataLabel);
    const commitmentHash = await registry.computeCommitment(signer.address, contentHash, salt, metadataHash);
    await registry.connect(signer).commit(commitmentHash, metadataHash, "", { value: fee });
    return { commitmentHash, contentHash, salt, metadataHash };
  }

  it("opens a dispute when both commitments exist", async function () {
    const { registry, disputeRegistry, alice, bob, carol, commitFee, disputeFee } = await deployFixture();
    const a = await createCommitment(registry, alice, "idea-a", "salt-a", "meta-a", commitFee);
    const b = await createCommitment(registry, bob, "idea-b", "salt-b", "meta-b", commitFee);

    await expect(
      disputeRegistry.connect(carol).openDispute(a.commitmentHash, b.commitmentHash, "ipfs://reason-1", { value: disputeFee })
    ).to.emit(disputeRegistry, "DisputeOpened");

    const dispute = await disputeRegistry.getDispute(1);
    expect(dispute.challenger).to.equal(carol.address);
    expect(dispute.challengedCommitmentHash).to.equal(a.commitmentHash);
  });

  it("rejects disputes with unknown commitments", async function () {
    const { disputeRegistry, carol, disputeFee } = await deployFixture();
    const fakeHash = hashBytes("fake");

    await expect(
      disputeRegistry.connect(carol).openDispute(fakeHash, fakeHash, "ipfs://reason", { value: disputeFee })
    ).to.be.reverted;
  });

  it("allows owner to resolve a dispute", async function () {
    const { registry, disputeRegistry, owner, alice, bob, carol, commitFee, disputeFee } = await deployFixture();
    const a = await createCommitment(registry, alice, "idea-a", "salt-a", "meta-a", commitFee);
    const b = await createCommitment(registry, bob, "idea-b", "salt-b", "meta-b", commitFee);
    await disputeRegistry.connect(carol).openDispute(a.commitmentHash, b.commitmentHash, "ipfs://reason-1", { value: disputeFee });

    await expect(
      disputeRegistry.connect(owner).resolveDispute(1, 3, "ipfs://resolution-1")
    ).to.emit(disputeRegistry, "DisputeResolved");

    const dispute = await disputeRegistry.getDispute(1);
    expect(dispute.resolved).to.equal(true);
    expect(dispute.outcome).to.equal(3);
  });
});
