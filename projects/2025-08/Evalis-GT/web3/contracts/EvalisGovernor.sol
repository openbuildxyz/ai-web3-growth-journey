// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Governor} from "@openzeppelin/contracts/governance/Governor.sol";
import {GovernorCountingSimple} from "@openzeppelin/contracts/governance/extensions/GovernorCountingSimple.sol";
import {GovernorVotes} from "@openzeppelin/contracts/governance/extensions/GovernorVotes.sol";
import {GovernorVotesQuorumFraction} from "@openzeppelin/contracts/governance/extensions/GovernorVotesQuorumFraction.sol";
import {IVotes} from "@openzeppelin/contracts/governance/utils/IVotes.sol";
import {IGovernor} from "@openzeppelin/contracts/governance/IGovernor.sol";

contract EvalisGovernor is Governor, GovernorCountingSimple, GovernorVotes, GovernorVotesQuorumFraction {
    uint256 public s_votingDelay; // in blocks
    uint256 public s_votingPeriod; // in blocks

    constructor(IVotes _token, uint256 _votingDelay, uint256 _votingPeriod, uint256 _quorumPercent)
        Governor("EvalisGovernor")
        GovernorVotes(_token)
        GovernorVotesQuorumFraction(_quorumPercent)
    {
        s_votingDelay = _votingDelay; // e.g., 1 block
        s_votingPeriod = _votingPeriod; // e.g., ~1 week in blocks
    }

    function votingDelay() public view override(IGovernor) returns (uint256) {
        return s_votingDelay;
    }

    function votingPeriod() public view override(IGovernor) returns (uint256) {
        return s_votingPeriod;
    }

    // The following functions are overrides required by Solidity.
    function quorum(uint256 blockNumber)
        public
        view
    override(IGovernor, GovernorVotesQuorumFraction)
        returns (uint256)
    {
        return super.quorum(blockNumber);
    }

    // No additional overrides required; OZ v5 Governor exposes base behavior.
}
