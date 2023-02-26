const Voting = artifacts.require("./voting.sol");
const { BN, expectRevert, expectEvent } = require('@openzeppelin/test-helpers');
const { expect } = require('chai');
const constants = require('@openzeppelin/test-helpers/src/constants');
 
contract("Voting", accounts => {
  const owner = accounts[0];
  const second = accounts[1];
  const third = accounts[2];
  const fourth = accounts[3];

  let vi; // "vi" alias VotingInstance

  describe("Test workflow changes and events", function () {

    before(async function () {
      vi = await Voting.deployed({ from:owner });
    });

    it("Should be RegisteringVoters by default", async () => {
      expect(await vi.workflowStatus()).to.be.bignumber.equal(new BN(0));
    });

    it("Should switch to ProposalsRegistrationStarted and emit good event", async () => {
      const event = await vi.startProposalsRegistering({ from: owner });
      expectEvent(event, "WorkflowStatusChange", { previousStatus: new BN(0), newStatus: new BN(1) });
      expect(await vi.workflowStatus()).to.be.bignumber.equal(new BN(1));
    });

    it("Should switch to ProposalsRegistrationEnded and emit good event", async () => {
      const event = await vi.endProposalsRegistering({ from: owner });
      expect(await vi.workflowStatus()).to.be.bignumber.equal(new BN(2));
      expectEvent(event, "WorkflowStatusChange", { previousStatus: new BN(1), newStatus: new BN(2) });
    });

    it("Should switch to VotingSessionStarted and emit good event", async () => {
      const event = await vi.startVotingSession({ from: owner });
      expect(await vi.workflowStatus()).to.be.bignumber.equal(new BN(3));
      expectEvent(event, "WorkflowStatusChange", { previousStatus: new BN(2), newStatus: new BN(3) });
    });

    it("Should switch to VotingSessionEnded and emit good event", async () => {
      const event = await vi.endVotingSession({ from: owner });
      expect(await vi.workflowStatus()).to.be.bignumber.equal(new BN(4));
      expectEvent(event, "WorkflowStatusChange", { previousStatus: new BN(3), newStatus: new BN(4) });
    });

    it("Should switch to VotesTallied and emit good event", async () => {
      const event = await vi.tallyVotes({ from: owner });
      expect(await vi.workflowStatus()).to.be.bignumber.equal(new BN(5));
      expectEvent(event, "WorkflowStatusChange", { previousStatus: new BN(4), newStatus: new BN(5) });
    });
  });

  describe("Test all setters and getters", function () {

    beforeEach(async function () {
      vi = await Voting.new({from:owner});
      await vi.addVoter(owner, { from: owner });
    });

    it("Should set & get voter owner", async () => {
      const ownerVoter = await vi.getVoter(owner);
      expect(ownerVoter.isRegistered).to.equal(true);
    });

    it("Should set & get voter second", async () => {
      await vi.addVoter(second, { from: owner });
      const secondVoter = await vi.getVoter(second);
      expect(secondVoter.isRegistered).to.equal(true);
    });

    it("Should not set & get voter third", async () => {
      const thirdVoter = await vi.getVoter(third);
      expect(thirdVoter.isRegistered).to.equal(false);
    });

    it("Should set & get a proposal", async () => {
      await vi.startProposalsRegistering({ from: owner });
      await vi.addProposal("lorem", { from: owner });
      const proposal = await vi.getOneProposal(1);
      expect(proposal.description).to.equal("lorem");
    });

    it("Should set & get multiple proposals", async () => {
      await vi.startProposalsRegistering({ from: owner });
      await vi.addProposal("lorem", { from: owner });
      await vi.addProposal("ipsum", { from: owner });
      await vi.addProposal("sit", { from: owner });
      const proposal_1 = await vi.getOneProposal(1);
      const proposal_2 = await vi.getOneProposal(2);
      const proposal_3 = await vi.getOneProposal(3);
      expect(proposal_1.description).to.equal("lorem");
      expect(proposal_2.description).to.equal("ipsum");
      expect(proposal_3.description).to.equal("sit");
    });

    it("Should set & get a vote", async () => {
      await vi.addVoter(second, { from: owner });
      await vi.addVoter(third, { from: owner });

      await vi.startProposalsRegistering({ from: owner });
      await vi.addProposal("lorem", { from: owner });
      await vi.endProposalsRegistering({ from: owner });
      await vi.startVotingSession({ from: owner });
      await vi.setVote(1, { from: owner });
      await vi.setVote(1, { from: second });

      const proposal = await vi.getOneProposal(1);
      const ownerVoter = await vi.getVoter(owner);
      const secondVoter = await vi.getVoter(second);
      const thirdVoter = await vi.getVoter(third);

      expect(proposal.description).to.equal("lorem");
      expect(proposal.voteCount).to.be.bignumber.equal(new BN(2));
      expect(ownerVoter.hasVoted).to.be.true;
      expect(ownerVoter.votedProposalId).to.be.bignumber.equal(new BN(1));
      expect(secondVoter.hasVoted).to.be.true;
      expect(secondVoter.votedProposalId).to.be.bignumber.equal(new BN(1));
      expect(thirdVoter.hasVoted).to.be.false;
      expect(thirdVoter.votedProposalId).to.be.bignumber.equal(new BN(0));
    });
  });

  describe("Test vote counting", function () {

    beforeEach(async function () {
      vi = await Voting.new({ from:owner });

      await vi.addVoter(owner, { from: owner });
      await vi.addVoter(second, { from: owner });
      await vi.addVoter(third, { from: owner });
      await vi.addVoter(fourth, { from: owner });

      await vi.startProposalsRegistering({ from: owner });
      await vi.addProposal("lorem", { from: owner });
      await vi.addProposal("ipsum", { from: second });
      await vi.endProposalsRegistering({ from: owner });
      await vi.startVotingSession({ from: owner });
    });

    it("Should 'lorem' win unanimity", async () => {
      await vi.setVote(1, { from: owner });
      await vi.setVote(1, { from: second });
      await vi.setVote(1, { from: third });
      await vi.setVote(1, { from: fourth });

      await vi.endVotingSession({ from: owner });
      await vi.tallyVotes({ from: owner });

      expect(await vi.winningProposalID()).to.be.bignumber.equal(new BN(1));
    });

    it("Should 'lorem' win majority", async () => {
      await vi.setVote(1, { from: owner });
      await vi.setVote(1, { from: second });
      await vi.setVote(2, { from: third });
      await vi.setVote(1, { from: fourth });

      await vi.endVotingSession({ from: owner });
      await vi.tallyVotes({ from: owner });

      expect(await vi.winningProposalID()).to.be.bignumber.equal(new BN(1));
    });

    it("Should 'ipsum' win unanimity", async () => {
      await vi.setVote(2, { from: owner });
      await vi.setVote(2, { from: second });
      await vi.setVote(2, { from: third });
      await vi.setVote(2, { from: fourth });

      await vi.endVotingSession({ from: owner });
      await vi.tallyVotes({ from: owner });

      expect(await vi.winningProposalID()).to.be.bignumber.equal(new BN(2));
    });

    it("Should 'ipsum' win majority", async () => {
      await vi.setVote(2, { from: owner });
      await vi.setVote(2, { from: second });
      await vi.setVote(2, { from: third });
      await vi.setVote(1, { from: fourth });

      await vi.endVotingSession({ from: owner });
      await vi.tallyVotes({ from: owner });

      expect(await vi.winningProposalID()).to.be.bignumber.equal(new BN(2));
    });

    it("Should 'lorem' win (first in proposals array)", async () => {
      await vi.setVote(2, { from: owner });
      await vi.setVote(2, { from: second });
      await vi.setVote(1, { from: third });
      await vi.setVote(1, { from: fourth });

      await vi.endVotingSession({ from: owner });
      await vi.tallyVotes({ from: owner });

      expect(await vi.winningProposalID()).to.be.bignumber.equal(new BN(1));
    });
  });

  describe("Test events emits", function () {

    beforeEach(async function () {
      vi = await Voting.new({ from:owner });
    });

    it("Should emit event 'VoterRegistered'", async () => {
      const event = await vi.addVoter(owner, { from: owner });
      expectEvent(event, "VoterRegistered", { voterAddress: owner });
    });

    it("Should emit event 'ProposalRegistered'", async () => {
      await vi.addVoter(owner, { from: owner });
      await vi.startProposalsRegistering({ from: owner });
      const event = await vi.addProposal("lorem", { from: owner });
      expectEvent(event, "ProposalRegistered", { proposalId: new BN(1) });
    });

    it("Should emit event 'Voted'", async () => {
      await vi.addVoter(owner, { from: owner });
      await vi.startProposalsRegistering({ from: owner });
      await vi.addProposal("lorem", { from: owner });
      await vi.endProposalsRegistering({ from: owner });
      await vi.startVotingSession({ from: owner });
      const event = await vi.setVote(1, { from: owner });
      expectEvent(event, "Voted", { voter: owner, proposalId: new BN(1) });
    });
  });

  describe("Test all reverts an the require", function () {

    before(async function () {
      vi = await Voting.new({from:owner});
    });
    
    describe("addVoter()", function () {

      it("Should not add voter if not owner", async () => {
        await expectRevert(vi.addVoter(owner, { from: second }), 'Ownable: caller is not the owner');
      });

      it("Should not add voter already registered", async () => {
        await vi.addVoter(owner, { from: owner });
        await expectRevert(vi.addVoter(owner, { from: owner }), 'Already registered');
      });

      it("Should not add voter if wrong step", async () => {
        await vi.startProposalsRegistering({ from: owner });
        await expectRevert(vi.addVoter(owner, { from: owner }), 'Voters registration is not open yet');
      });
    });

    describe("addProposal()", function () {

      it("Should not add proposal if not voter", async () => {
        await expectRevert(vi.addProposal("lorem", { from: second }), "You're not a voter");
      });

      it("Should not add proposal if not description", async () => {
        await expectRevert(vi.addProposal("", { from: owner }), 'Vous ne pouvez pas ne rien proposer');
        await vi.addProposal("lorem", { from: owner });
      });

      it("Should not add proposal if wrong step", async () => {
        await vi.endProposalsRegistering( { from: owner });
        await expectRevert(vi.addProposal("lorem", { from: owner }), 'Proposals are not allowed yet');
      });
    });

    describe("setVote()", function () {

      it("Should not vote if not voter", async () => {
        await vi.startVotingSession( { from: owner });
        await expectRevert(vi.setVote(1, { from: second }), "You're not a voter");
      });

      it("Should not vote if proposal not exist", async () => {
        await expectRevert(vi.setVote(999, { from: owner }), 'Proposal not found');
      });

      it("Should not vote if already voted", async () => {
        await vi.setVote(1, { from: owner });
        await expectRevert(vi.setVote(1, { from: owner }), 'You have already voted');
      });

      it("Should not vote if wrong step", async () => {
        await vi.endVotingSession( { from: owner });
        await expectRevert(vi.setVote(1, { from: owner }), 'Voting session havent started yet');
      });
    });

    describe("Workflow changes functions", function () {

      it("Should not switch to 'RegisteringVoters' if wrong step or not owner", async () => {
        await expectRevert(vi.startProposalsRegistering( { from: second }), 'Ownable: caller is not the owner');
        await expectRevert(vi.startProposalsRegistering( { from: owner }), 'Registering proposals cant be started now');
      });

      it("Should not switch to 'ProposalsRegistrationEnded' if wrong or and not owner", async () => {
        await expectRevert(vi.endProposalsRegistering( { from: second }), 'Ownable: caller is not the owner');
        await expectRevert(vi.endProposalsRegistering( { from: owner }), 'Registering proposals havent started yet');
      });

      it("Should not switch to 'VotingSessionStarted' if wrong step or not owner", async () => {
        await expectRevert(vi.startVotingSession( { from: second }), 'Ownable: caller is not the owner');
        await expectRevert(vi.startVotingSession( { from: owner }), 'Registering proposals phase is not finished');
      });

      it("Should not switch to 'VotingSessionEnded' if wrong step or not owner", async () => {
        await expectRevert(vi.endVotingSession( { from: second }), 'Ownable: caller is not the owner');
        await expectRevert(vi.endVotingSession( { from: owner }), 'Voting session havent started yet');
      });

      it("Should not switch to 'VotesTallied' if wrong step or not owner", async () => {
        await vi.tallyVotes( { from: owner });
        await expectRevert(vi.tallyVotes( { from: second }), 'Ownable: caller is not the owner');
        await expectRevert(vi.tallyVotes( { from: owner }), "Current status is not voting session ended");
      });
    });
  });
});