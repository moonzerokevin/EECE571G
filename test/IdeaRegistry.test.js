const { expect } = require("chai");
const { anyUint } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { ethers } = require("hardhat");

describe("IdeaRegistry", function () {
  async function deployFixture() {
    const [owner, alice, bob] = await ethers.getSigners();
    const fee = ethers.parseEther("0.0001");
    const Factory = await ethers.getContractFactory("IdeaRegistry");
    const registry = await Factory.deploy(fee);
    await registry.waitForDeployment();
    return { registry, owner, alice, bob, fee };
  }

  function hashBytes(input) {
    return ethers.keccak256(ethers.toUtf8Bytes(input));
  }

  async function buildCommitment(registry, author, content, saltLabel, metadataLabel) {
    const contentHash = hashBytes(content);
    const salt = hashBytes(saltLabel);
    const metadataHash = hashBytes(metadataLabel);
    const commitmentHash = await registry.computeCommitment(author.address, contentHash, salt, metadataHash);
    return { contentHash, salt, metadataHash, commitmentHash };
  }

  it("stores a commitment successfully", async function () {
    const { registry, alice, fee } = await deployFixture();
    const { commitmentHash, metadataHash } = await buildCommitment(registry, alice, "idea one", "salt-a", "meta-a");

    await expect(registry.connect(alice).commit(commitmentHash, metadataHash, "cid://draft-1", { value: fee }))
      .to.emit(registry, "Committed")
      .withArgs(alice.address, commitmentHash, metadataHash, "cid://draft-1", anyUint, anyUint);

    const record = await registry.getCommitment(commitmentHash);
    expect(record.author).to.equal(alice.address);
    expect(record.metadataHash).to.equal(metadataHash);
    expect(record.revealed).to.equal(false);
  });

  it("rejects duplicate commitment hashes", async function () {
    const { registry, alice, fee } = await deployFixture();
    const { commitmentHash, metadataHash } = await buildCommitment(registry, alice, "idea one", "salt-a", "meta-a");

    await registry.connect(alice).commit(commitmentHash, metadataHash, "", { value: fee });

    await expect(
      registry.connect(alice).commit(commitmentHash, metadataHash, "", { value: fee })
    ).to.be.revertedWithCustomError(registry, "DuplicateCommitment");
  });

  it("rejects insufficient commit fees", async function () {
    const { registry, alice } = await deployFixture();
    const { commitmentHash, metadataHash } = await buildCommitment(registry, alice, "idea one", "salt-a", "meta-a");

    await expect(
      registry.connect(alice).commit(commitmentHash, metadataHash, "", { value: 1n })
    ).to.be.revertedWithCustomError(registry, "InsufficientCommitFee");
  });

  it("reveals a commitment successfully", async function () {
    const { registry, alice, fee } = await deployFixture();
    const data = await buildCommitment(registry, alice, "idea one", "salt-a", "meta-a");

    await registry.connect(alice).commit(data.commitmentHash, data.metadataHash, "cid://sealed", { value: fee });

    await expect(
      registry.connect(alice).reveal(data.contentHash, data.salt, data.metadataHash, "cid://reveal")
    ).to.emit(registry, "Revealed");

    const record = await registry.getCommitment(data.commitmentHash);
    expect(record.revealed).to.equal(true);
    expect(record.revealedContentHash).to.equal(data.contentHash);
    expect(record.revealSalt).to.equal(data.salt);
  });

  it("rejects reveal for nonexistent commitment", async function () {
    const { registry, alice } = await deployFixture();
    const data = await buildCommitment(registry, alice, "idea one", "salt-a", "meta-a");

    await expect(
      registry.connect(alice).reveal(data.contentHash, data.salt, data.metadataHash, "")
    ).to.be.revertedWithCustomError(registry, "CommitmentNotFound");
  });

  it("rejects double reveal", async function () {
    const { registry, alice, fee } = await deployFixture();
    const data = await buildCommitment(registry, alice, "idea one", "salt-a", "meta-a");

    await registry.connect(alice).commit(data.commitmentHash, data.metadataHash, "", { value: fee });
    await registry.connect(alice).reveal(data.contentHash, data.salt, data.metadataHash, "");

    await expect(
      registry.connect(alice).reveal(data.contentHash, data.salt, data.metadataHash, "")
    ).to.be.revertedWithCustomError(registry, "AlreadyRevealed");
  });

  it("tracks commitments by author", async function () {
    const { registry, alice, fee } = await deployFixture();
    const a = await buildCommitment(registry, alice, "idea one", "salt-a", "meta-a");
    const b = await buildCommitment(registry, alice, "idea two", "salt-b", "meta-b");

    await registry.connect(alice).commit(a.commitmentHash, a.metadataHash, "", { value: fee });
    await registry.connect(alice).commit(b.commitmentHash, b.metadataHash, "", { value: fee });

    const hashes = await registry.getAuthorCommitments(alice.address);
    expect(hashes).to.have.length(2);
    expect(hashes[0]).to.equal(a.commitmentHash);
    expect(hashes[1]).to.equal(b.commitmentHash);
  });

  it("allows only owner to update fee", async function () {
    const { registry, owner, bob } = await deployFixture();
    await expect(registry.connect(owner).updateCommitFee(123n)).to.emit(registry, "CommitFeeUpdated");
    await expect(registry.connect(bob).updateCommitFee(321n)).to.be.revertedWith("only owner");
  });
});
