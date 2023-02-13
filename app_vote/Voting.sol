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
        uint256 id;
        string description;
        uint256 voteCount;
        uint256 lastVoteTime;
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

    enum EqualityRules {
        first,
        random
    }
    EqualityRules public equalityRule;

    uint256 winningProposalId;
    uint256 private helper_currentWinner = 0;
    uint256 private helper_currentWinnerIndex = 0;

    bool private isAlreadySet = false;

    mapping(address => Voter) votersList;

    Proposal[] proposals;
    uint256[] equality;

    // --- EVENTS ---

    event VoterRegistered(address voterAddress);
    event WorkflowStatusChange(
        WorkflowStatus previousStatus,
        WorkflowStatus newStatus
    );
    event ProposalRegistered(uint256 proposalId);
    event Voted(address voter, uint256 proposalId);

    // --- CONSTRUCTOR ---

    constructor() {
        voteStatus = WorkflowStatus.RegisteringVoters;
        equalityRule = EqualityRules.first;
        // automatic register the owner
        resgisterVoter(msg.sender);
    }

    // --- MODIFIERS ---

    modifier isRegistered() {
        require(
            votersList[msg.sender].isRegistered == true,
            unicode"Vous n'êtes pas whitelisté"
        );
        _;
    }

    modifier isGoodStep(WorkflowStatus stepNeeded) {
        require(
            stepNeeded == voteStatus,
            unicode"Ce n'est pas la bonne étape pour cela"
        );
        _;
    }

    modifier hasNotVoted() {
        require(
            votersList[msg.sender].hasVoted == false,
            unicode"Vous avez déjà voté"
        );
        _;
    }

    modifier hasNotSetProposal() {
        require(
            votersList[msg.sender].votedProposalId == 0,
            unicode"Vous avez déjà emis une proposition"
        );
        _;
    }

    modifier isNotStepFive() {
        require(
            voteStatus != WorkflowStatus.VotesTallied,
            unicode"Le processus de vote est terminé"
        );
        _;
    }

    // --- FUCTIONS ---

    // register one adress to votersList mapping
    function resgisterVoter(address _addr) public onlyOwner {
        votersList[_addr].isRegistered = true;
        emit VoterRegistered(_addr);
    }

    // register a proposal id, revert if proposal already exist
    function registerProposal(uint256 _proposalId, string calldata _description)
        external
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
            proposals.push(
                Proposal({
                    id: _proposalId,
                    description: _description,
                    lastVoteTime: 0,
                    voteCount: 0
                })
            );
            emit ProposalRegistered(_proposalId);
        }
    }

    // register a vote, revert if you vote for unexisting proposal
    function registerVote(uint256 _proposalId)
        external
        isRegistered
        hasNotVoted
        isGoodStep(WorkflowStatus.VotingSessionStarted)
    {
        for (uint256 i = 0; i < proposals.length; i = i + 1) {
            if (proposals[i].id == _proposalId) {
                proposals[i].voteCount = proposals[i].voteCount + 1;
                proposals[i].lastVoteTime = block.timestamp;
                votersList[msg.sender].hasVoted = true;
                emit Voted(msg.sender, _proposalId);
                return;
            }
        }
        revert(unicode"Cette proposition n'existe pas");
    }

    // counting votes return winner or call handleEquality in case of equality
    function votesCounting()
        external
        onlyOwner
        isGoodStep(WorkflowStatus.VotingSessionEnded)
    {
        for (uint256 i = 0; i < proposals.length; i = i + 1) {
            if (proposals[i].voteCount > helper_currentWinner) {
                helper_currentWinner = proposals[i].voteCount;
                helper_currentWinnerIndex = i;
                delete equality;
                continue;
            }
            if (proposals[i].voteCount == helper_currentWinner) {
                equality.push(i);
            }
        }

        if (equality.length > 0) {
            handleEquality();
        } else {
            winningProposalId = proposals[helper_currentWinnerIndex].id;
        }
    }

    // handle the case of equality, redirect to good rule
    function handleEquality() private {
        equality.push(helper_currentWinnerIndex);

        if (equalityRule == EqualityRules.first) {
            handleEqualityFirst();
        }
        if (equalityRule == EqualityRules.random) {
            handleEqualityRandom();
        }
    }

    // set the winner for the first who get the amount of votes (in case of equality)
    function handleEqualityFirst() private {
        helper_currentWinner = proposals[equality[0]].lastVoteTime;
        helper_currentWinnerIndex = 0;

        for (uint256 i = 0; i < equality.length; i = i + 1) {
            if (proposals[equality[i]].lastVoteTime < helper_currentWinner) {
                helper_currentWinner = proposals[equality[i]].lastVoteTime;
                helper_currentWinnerIndex = i;
            }
        }

        winningProposalId = proposals[equality[helper_currentWinnerIndex]].id;
    }

    // set the winner to a random (in case of equality)
    function handleEqualityRandom() private {
        uint256 randomIndex = uint256(
            keccak256(abi.encodePacked(block.timestamp, msg.sender))
        ) % equality.length;
        winningProposalId = proposals[equality[randomIndex]].id;
    }

    // toggle equality rules
    function toggleEqualityRule() external onlyOwner {
        if (equalityRule == EqualityRules.first) {
            equalityRule = EqualityRules.random;
            return;
        }
        equalityRule = EqualityRules.first;
    }

    // get winner, only on votes tailed
    function getWinner()
        external
        view
        isRegistered
        isGoodStep(WorkflowStatus.VotesTallied)
        returns (uint256)
    {
        return winningProposalId;
    }

    // get proposals, only on votes tailled
    function getProposals()
        external
        view
        isRegistered
        isGoodStep(WorkflowStatus.VotesTallied)
        returns (Proposal[] memory)
    {
        return proposals;
    }

    // set voteStatus to next step
    function nextStep() external isNotStepFive onlyOwner {
        voteStatus = WorkflowStatus(uint256(voteStatus) + 1); // next step
        emit WorkflowStatusChange(
            WorkflowStatus(uint256(voteStatus) - 1),
            voteStatus
        );
    }

    // reset vote with same voters and equality rule
    function resetVote() external onlyOwner {
        voteStatus = WorkflowStatus.RegisteringVoters;
        winningProposalId = 0;
        isAlreadySet = false;
        helper_currentWinner = 0;
        helper_currentWinnerIndex = 0;
        delete proposals;
        delete equality;
    }
}
