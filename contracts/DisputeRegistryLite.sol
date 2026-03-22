// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./interfaces/IIdeaRegistry.sol";

/**
 * @title DisputeRegistryLite
 * @notice Lightweight course-scope dispute registration contract for IdeaStamp.
 * @dev This contract does not implement token staking or arbitrator voting. It simply
 *      records disputes against existing commitments and allows an admin to mark them resolved.
 */
contract DisputeRegistryLite {
    error UnknownCommitment();
    error InvalidDispute();
    error InsufficientDisputeFee();
    error DisputeNotFound();
    error AlreadyResolved();

    enum Outcome {
        Unresolved,
        Rejected,
        AcceptedForChallenger,
        AcceptedForOriginalAuthor,
        SettledOffChain
    }

    struct Dispute {
        uint256 id;
        address challenger;
        bytes32 challengedCommitmentHash;
        bytes32 challengerCommitmentHash;
        string reasonUri;
        uint64 createdAt;
        bool resolved;
        Outcome outcome;
        string resolutionUri;
    }

    address public owner;
    uint256 public disputeFeeWei;
    IIdeaRegistry public immutable registry;
    uint256 public nextDisputeId = 1;

    mapping(uint256 => Dispute) private disputes;

    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);
    event DisputeFeeUpdated(uint256 previousFeeWei, uint256 newFeeWei);
    event DisputeOpened(
        uint256 indexed disputeId,
        address indexed challenger,
        bytes32 indexed challengedCommitmentHash,
        bytes32 challengerCommitmentHash,
        string reasonUri,
        uint256 timestamp
    );
    event DisputeResolved(
        uint256 indexed disputeId,
        Outcome outcome,
        string resolutionUri,
        uint256 timestamp
    );

    modifier onlyOwner() {
        require(msg.sender == owner, "only owner");
        _;
    }

    constructor(address registryAddress, uint256 initialDisputeFeeWei) {
        require(registryAddress != address(0), "zero registry");
        registry = IIdeaRegistry(registryAddress);
        owner = msg.sender;
        disputeFeeWei = initialDisputeFeeWei;
        emit OwnershipTransferred(address(0), msg.sender);
    }

    function openDispute(
        bytes32 challengedCommitmentHash,
        bytes32 challengerCommitmentHash,
        string calldata reasonUri
    ) external payable returns (uint256 disputeId) {
        if (challengedCommitmentHash == bytes32(0) || challengerCommitmentHash == bytes32(0)) {
            revert InvalidDispute();
        }
        if (challengedCommitmentHash == challengerCommitmentHash) revert InvalidDispute();
        if (!registry.hasCommitment(challengedCommitmentHash) || !registry.hasCommitment(challengerCommitmentHash)) {
            revert UnknownCommitment();
        }
        if (msg.value < disputeFeeWei) revert InsufficientDisputeFee();

        disputeId = nextDisputeId++;
        disputes[disputeId] = Dispute({
            id: disputeId,
            challenger: msg.sender,
            challengedCommitmentHash: challengedCommitmentHash,
            challengerCommitmentHash: challengerCommitmentHash,
            reasonUri: reasonUri,
            createdAt: uint64(block.timestamp),
            resolved: false,
            outcome: Outcome.Unresolved,
            resolutionUri: ""
        });

        emit DisputeOpened(
            disputeId,
            msg.sender,
            challengedCommitmentHash,
            challengerCommitmentHash,
            reasonUri,
            block.timestamp
        );
    }

    function resolveDispute(
        uint256 disputeId,
        Outcome outcome,
        string calldata resolutionUri
    ) external onlyOwner {
        Dispute storage disputeRecord = disputes[disputeId];
        if (disputeRecord.id == 0) revert DisputeNotFound();
        if (disputeRecord.resolved) revert AlreadyResolved();
        require(outcome != Outcome.Unresolved, "invalid outcome");

        disputeRecord.resolved = true;
        disputeRecord.outcome = outcome;
        disputeRecord.resolutionUri = resolutionUri;

        emit DisputeResolved(disputeId, outcome, resolutionUri, block.timestamp);
    }

    function getDispute(uint256 disputeId) external view returns (Dispute memory) {
        Dispute memory disputeRecord = disputes[disputeId];
        if (disputeRecord.id == 0) revert DisputeNotFound();
        return disputeRecord;
    }

    function updateDisputeFee(uint256 newDisputeFeeWei) external onlyOwner {
        uint256 previousFee = disputeFeeWei;
        disputeFeeWei = newDisputeFeeWei;
        emit DisputeFeeUpdated(previousFee, newDisputeFeeWei);
    }

    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "zero owner");
        emit OwnershipTransferred(owner, newOwner);
        owner = newOwner;
    }

    function withdraw(address payable recipient) external onlyOwner {
        require(recipient != address(0), "zero recipient");
        (bool ok, ) = recipient.call{value: address(this).balance}("");
        require(ok, "withdraw failed");
    }
}
