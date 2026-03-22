// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title IdeaRegistry
 * @notice Course-scope commit-reveal registry for research idea priority proofs.
 * @dev The contract stores salted commitments on-chain and later allows the
 *      original author to reveal the corresponding content hash and salt.
 *
 * Commitment formula used by the frontend and this contract:
 * keccak256(abi.encodePacked(chainId, authorAddress, contentHash, salt, metadataHash))
 */
contract IdeaRegistry {
    error InvalidCommitmentHash();
    error DuplicateCommitment();
    error CommitmentNotFound();
    error UnauthorizedAuthor();
    error AlreadyRevealed();
    error MetadataHashMismatch();
    error InsufficientCommitFee();
    error TransferFailed();

    struct CommitmentRecord {
        address author;
        uint64 committedAt;
        uint64 committedBlock;
        bytes32 commitmentHash;
        bytes32 metadataHash;
        string commitCid;
        bool exists;
        bool revealed;
        bytes32 revealedContentHash;
        bytes32 revealSalt;
        string revealCid;
        uint64 revealedAt;
    }

    address public owner;
    uint256 public commitFeeWei;

    mapping(bytes32 => CommitmentRecord) private commitments;
    mapping(address => bytes32[]) private authorCommitments;

    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);
    event CommitFeeUpdated(uint256 previousFeeWei, uint256 newFeeWei);
    event Committed(
        address indexed author,
        bytes32 indexed commitmentHash,
        bytes32 indexed metadataHash,
        string cid,
        uint256 timestamp,
        uint256 blockNumber
    );
    event Revealed(
        address indexed author,
        bytes32 indexed commitmentHash,
        bytes32 indexed contentHash,
        bytes32 salt,
        string cid,
        uint256 timestamp
    );

    modifier onlyOwner() {
        require(msg.sender == owner, "only owner");
        _;
    }

    constructor(uint256 initialCommitFeeWei) {
        owner = msg.sender;
        commitFeeWei = initialCommitFeeWei;
        emit OwnershipTransferred(address(0), msg.sender);
    }

    /**
     * @notice Computes the salted commitment hash used for both commit and reveal.
     */
    function computeCommitment(
        address author,
        bytes32 contentHash,
        bytes32 salt,
        bytes32 metadataHash
    ) public view returns (bytes32) {
        return keccak256(abi.encodePacked(block.chainid, author, contentHash, salt, metadataHash));
    }

    /**
     * @notice Stores a previously computed commitment hash on-chain.
     * @param commitmentHash Salted commitment hash produced off-chain.
     * @param metadataHash Hash of optional metadata JSON or bytes32(0) if unused.
     * @param cid Optional content-addressed storage reference. Can be empty.
     */
    function commit(bytes32 commitmentHash, bytes32 metadataHash, string calldata cid) external payable {
        if (commitmentHash == bytes32(0)) revert InvalidCommitmentHash();
        if (commitments[commitmentHash].exists) revert DuplicateCommitment();
        if (msg.value < commitFeeWei) revert InsufficientCommitFee();

        commitments[commitmentHash] = CommitmentRecord({
            author: msg.sender,
            committedAt: uint64(block.timestamp),
            committedBlock: uint64(block.number),
            commitmentHash: commitmentHash,
            metadataHash: metadataHash,
            commitCid: cid,
            exists: true,
            revealed: false,
            revealedContentHash: bytes32(0),
            revealSalt: bytes32(0),
            revealCid: "",
            revealedAt: 0
        });

        authorCommitments[msg.sender].push(commitmentHash);

        emit Committed(msg.sender, commitmentHash, metadataHash, cid, block.timestamp, block.number);
    }

    /**
     * @notice Reveals the content hash and salt corresponding to an earlier commitment.
     * @dev Only the original author can reveal because the commitment binds author address.
     */
    function reveal(
        bytes32 contentHash,
        bytes32 salt,
        bytes32 metadataHash,
        string calldata cid
    ) external {
        bytes32 computedCommitment = computeCommitment(msg.sender, contentHash, salt, metadataHash);
        CommitmentRecord storage record = commitments[computedCommitment];

        if (!record.exists) revert CommitmentNotFound();
        if (record.author != msg.sender) revert UnauthorizedAuthor();
        if (record.revealed) revert AlreadyRevealed();
        if (record.metadataHash != metadataHash) revert MetadataHashMismatch();

        record.revealed = true;
        record.revealedContentHash = contentHash;
        record.revealSalt = salt;
        record.revealCid = cid;
        record.revealedAt = uint64(block.timestamp);

        emit Revealed(msg.sender, computedCommitment, contentHash, salt, cid, block.timestamp);
    }

    function getCommitment(bytes32 commitmentHash) external view returns (CommitmentRecord memory) {
        CommitmentRecord memory record = commitments[commitmentHash];
        if (!record.exists) revert CommitmentNotFound();
        return record;
    }

    function hasCommitment(bytes32 commitmentHash) external view returns (bool) {
        return commitments[commitmentHash].exists;
    }

    function isRevealed(bytes32 commitmentHash) external view returns (bool) {
        return commitments[commitmentHash].revealed;
    }

    function getAuthorCommitments(address author) external view returns (bytes32[] memory) {
        return authorCommitments[author];
    }

    function updateCommitFee(uint256 newCommitFeeWei) external onlyOwner {
        uint256 previousFee = commitFeeWei;
        commitFeeWei = newCommitFeeWei;
        emit CommitFeeUpdated(previousFee, newCommitFeeWei);
    }

    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "zero owner");
        emit OwnershipTransferred(owner, newOwner);
        owner = newOwner;
    }

    function withdraw(address payable recipient) external onlyOwner {
        require(recipient != address(0), "zero recipient");
        (bool ok, ) = recipient.call{value: address(this).balance}("");
        if (!ok) revert TransferFailed();
    }
}
