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
        uint id;
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
    WorkflowStatus public voteStatus;

    uint256 winningProposalId;

    bool private isAlreadySet = false;

    mapping (address => Voter) votersList;
    // mapping (uint256 => Proposal) proposalList;

    Proposal [] proposals;

    // --- EVENTS ---

    event VoterRegistered(address voterAddress); 
    event WorkflowStatusChange(WorkflowStatus previousStatus, WorkflowStatus newStatus);
    event ProposalRegistered(uint proposalId);
    event Voted (address voter, uint proposalId);

    // --- CONSTRUCTOR ---

    constructor() {
        // automatic register the owner
        votersList[msg.sender].isRegistered = true;
    }

    // --- MODIFIERS ---

    modifier isRegistered {
        require(votersList[msg.sender].isRegistered == true, unicode"Vous n'êtes pas whitelisté");
        _;
    }

    modifier isGoodStep(WorkflowStatus stepNeeded) {
        require(stepNeeded == voteStatus, unicode"Ce n'est pas la bonne étape pour cela");
        _;
    }

    modifier hasNotVoted {
        require(votersList[msg.sender].hasVoted == false, unicode"Vous avez déjà voté");
        _;
    }

    modifier hasNotSetProposal {
        require(votersList[msg.sender].votedProposalId == 0, unicode"Vous avez déjà emis une proposition");
        _;

    }

    // --- FUCTIONS ---

    // register one adress to votersList mapping
    function resgisterVoter(address _addr) public onlyOwner {
        votersList[_addr].isRegistered = true;
        emit VoterRegistered(_addr);
    }

    // register a proposal id
    function registerProposal(
        uint256 _proposalId,
        string calldata _description
    )
    public
    isRegistered
    hasNotSetProposal
    isGoodStep(WorkflowStatus.ProposalsRegistrationStarted)
    {
        for (uint256 i = 0; i < proposals.length; i = i + 1) {
            if (proposals[i].id == _proposalId) {
                isAlreadySet = true;
            }
        }

        if (isAlreadySet) {
            isAlreadySet = false;
            revert(unicode"Une autre personne à déja proposé cela");
        } else {
            votersList[msg.sender].votedProposalId = _proposalId;
            proposals.push(Proposal({id: _proposalId, description: _description, voteCount: 0}));
            // proposalList[_proposalId] = Proposal({description: _description, voteCount: 0});
            //,proposalsIds.push(_proposalId);
        }
    }

    // register a vote
    function registerVote(
        uint256 _proposalId
    )
    public
    isRegistered
    hasNotVoted
    isGoodStep(WorkflowStatus.VotingSessionStarted)
    {
        for (uint256 i = 0; i < proposals.length; i = i + 1) {
            if (proposals[i].id == _proposalId) {
                proposals[i].voteCount = proposals[i].voteCount + 1;
                votersList[msg.sender].hasVoted = true;
                return;
            }
        }
        revert(unicode"Cette proposition n'existe pas");
    }

    // set voteStatus to next step
    function nextStep() public onlyOwner {
        if (voteStatus == WorkflowStatus.RegisteringVoters) {
            voteStatus = WorkflowStatus.ProposalsRegistrationStarted; // step 0 to 1
        } else if (voteStatus == WorkflowStatus.ProposalsRegistrationStarted) {
            voteStatus = WorkflowStatus.ProposalsRegistrationEnded; // step 1 to 2
        } else if (voteStatus == WorkflowStatus.ProposalsRegistrationEnded) {
            voteStatus = WorkflowStatus.VotingSessionStarted; // step 2 to 3
        } else if (voteStatus == WorkflowStatus.VotingSessionStarted) {
            voteStatus = WorkflowStatus.VotingSessionEnded; // step 3 to 4
        } else if (voteStatus == WorkflowStatus.VotingSessionEnded) {
            voteStatus = WorkflowStatus.VotesTallied; // step 4 to 5
        }
    }

    // reset step
    function resetVote() public onlyOwner {
        voteStatus = WorkflowStatus.RegisteringVoters;
        // TODO : reset the rest of the vote
    }

    // get proposal list id
    function getProposalsId() public view returns(Proposal[] memory) {
        return proposals;
    }
}