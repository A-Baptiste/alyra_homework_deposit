// SPDX-License-Identifier: MIT

pragma solidity 0.8.13;

import "@openzeppelin/contracts/access/Ownable.sol";

contract Voting is Ownable {
    
    // --- VARIABLES ---

    struct Voter {
        bool isRegistered;
        bool hasVoted;
        uint256 votedProposalId;
    }

    struct Proposal {
        string description;
        uint voteCount;
    }

    enum WorkflowStatus {
        RegisteringVoters,
        ProposalsRegistrationStarted,
        ProposalsRegistrationEnded,
        VotingSessionStarted,
        VotingSessionEnded,
        VotesTallied
    }

    uint256 winningProposalId;

    mapping (address => Voter) votersList;

    // --- EVENTS ---

    event VoterRegistered(address voterAddress); 
    event WorkflowStatusChange(WorkflowStatus previousStatus, WorkflowStatus newStatus);
    event ProposalRegistered(uint proposalId);
    event Voted (address voter, uint proposalId);

    // --- CONSTRUCTOR ---

    constructor() {

    }

    // --- MODIFIERS ---

    modifier isRegistered {
        require(votersList[msg.sender].isRegistered == true, unicode"Vous n'êtes pas whitelisté");
        _;
    }

    // --- FUCTIONS ---

    function resgisterVoter(address _addr) public onlyOwner {
        votersList[_addr].isRegistered = true;
        emit VoterRegistered(_addr);
    }
}