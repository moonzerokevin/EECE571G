// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface IIdeaRegistry {
    function hasCommitment(bytes32 commitmentHash) external view returns (bool);
}
