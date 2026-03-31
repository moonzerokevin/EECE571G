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

  it("rejects commit with zero commitment hash", async function () {
    const { registry, alice, fee } = await deployFixture();
    const metadataHash = hashBytes("meta");
    await expect(
      registry.connect(alice).commit(ethers.ZeroHash, metadataHash, "", { value: fee })
    ).to.be.revertedWithCustomError(registry, "InvalidCommitmentHash");
  });

  it("getCommitment reverts when commitment does not exist", async function () {
    const { registry } = await deployFixture();
    const fake = hashBytes("no-such-commitment");
    await expect(registry.getCommitment(fake)).to.be.revertedWithCustomError(registry, "CommitmentNotFound");
  });

  it("hasCommitment and isRevealed reflect state", async function () {
    const { registry, alice, fee } = await deployFixture();
    const data = await buildCommitment(registry, alice, "idea one", "salt-a", "meta-a");
    expect(await registry.hasCommitment(data.commitmentHash)).to.equal(false);
    expect(await registry.isRevealed(data.commitmentHash)).to.equal(false);

    await registry.connect(alice).commit(data.commitmentHash, data.metadataHash, "", { value: fee });
    expect(await registry.hasCommitment(data.commitmentHash)).to.equal(true);
    expect(await registry.isRevealed(data.commitmentHash)).to.equal(false);

    await registry.connect(alice).reveal(data.contentHash, data.salt, data.metadataHash, "");
    expect(await registry.isRevealed(data.commitmentHash)).to.equal(true);
  });

  it("rejects reveal when stored metadata does not match reveal args", async function () {
    const { registry, alice, fee } = await deployFixture();
    const data = await buildCommitment(registry, alice, "idea one", "salt-a", "meta-a");
    const wrongStoredMeta = hashBytes("wrong-meta-on-record");
    await registry.connect(alice).commit(data.commitmentHash, wrongStoredMeta, "", { value: fee });

    await expect(
      registry.connect(alice).reveal(data.contentHash, data.salt, data.metadataHash, "")
    ).to.be.revertedWithCustomError(registry, "MetadataHashMismatch");
  });

  it("rejects reveal by non-author when commitment binds another address", async function () {
    const { registry, alice, bob, fee } = await deployFixture();
    const forBob = await buildCommitment(registry, bob, "shared idea", "salt-x", "meta-x");
    await registry.connect(alice).commit(forBob.commitmentHash, forBob.metadataHash, "", { value: fee });

    await expect(
      registry.connect(bob).reveal(forBob.contentHash, forBob.salt, forBob.metadataHash, "")
    ).to.be.revertedWithCustomError(registry, "UnauthorizedAuthor");
  });

  it("commit and reveal with zero metadataHash", async function () {
    const { registry, alice, fee } = await deployFixture();
    const contentHash = hashBytes("plain");
    const salt = hashBytes("salt-z");
    const metadataHash = ethers.ZeroHash;
    const commitmentHash = await registry.computeCommitment(alice.address, contentHash, salt, metadataHash);

    await registry.connect(alice).commit(commitmentHash, metadataHash, "", { value: fee });
    await registry.connect(alice).reveal(contentHash, salt, metadataHash, "");
    const record = await registry.getCommitment(commitmentHash);
    expect(record.revealed).to.equal(true);
    expect(record.metadataHash).to.equal(ethers.ZeroHash);
  });

  it("allows owner to transfer ownership", async function () {
    const { registry, owner, alice, bob } = await deployFixture();
    await expect(registry.connect(owner).transferOwnership(alice.address))
      .to.emit(registry, "OwnershipTransferred")
      .withArgs(owner.address, alice.address);
    expect(await registry.owner()).to.equal(alice.address);
    await expect(registry.connect(bob).updateCommitFee(99n)).to.be.revertedWith("only owner");
    await expect(registry.connect(alice).updateCommitFee(99n)).to.emit(registry, "CommitFeeUpdated");
  });

  it("rejects transferOwnership to zero address", async function () {
    const { registry, owner } = await deployFixture();
    await expect(registry.connect(owner).transferOwnership(ethers.ZeroAddress)).to.be.revertedWith("zero owner");
  });

  it("rejects transferOwnership from non-owner", async function () {
    const { registry, alice, bob } = await deployFixture();
    await expect(registry.connect(alice).transferOwnership(bob.address)).to.be.revertedWith("only owner");
  });

  it("allows owner to withdraw balance", async function () {
    const { registry, owner, alice, bob, fee } = await deployFixture();
    const data = await buildCommitment(registry, alice, "idea one", "salt-a", "meta-a");
    await registry.connect(alice).commit(data.commitmentHash, data.metadataHash, "", { value: fee });

    const before = await ethers.provider.getBalance(bob.address);
    await registry.connect(owner).withdraw(bob.address);
    const after = await ethers.provider.getBalance(bob.address);
    expect(after - before).to.equal(fee);
    expect(await ethers.provider.getBalance(await registry.getAddress())).to.equal(0n);
  });

  it("rejects withdraw from non-owner", async function () {
    const { registry, alice, bob, fee } = await deployFixture();
    const data = await buildCommitment(registry, alice, "idea one", "salt-a", "meta-a");
    await registry.connect(alice).commit(data.commitmentHash, data.metadataHash, "", { value: fee });
    await expect(registry.connect(bob).withdraw(bob.address)).to.be.revertedWith("only owner");
  });

  it("rejects withdraw to zero address", async function () {
    const { registry, owner } = await deployFixture();
    await expect(registry.connect(owner).withdraw(ethers.ZeroAddress)).to.be.revertedWith("zero recipient");
  });
});
