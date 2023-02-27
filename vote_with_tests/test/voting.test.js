const Voting = artifacts.require("./voting.sol");
const { BN, expectRevert, expectEvent } = require('@openzeppelin/test-helpers');
const { expect } = require('chai');
 
contract("Voting", accounts => {
  const owner = accounts[0];
  const second = accounts[1];
  const third = accounts[2];
  const fourth = accounts[3];

  let vi; // "vi" means VotingInstance

  describe("Test workflow changes and events", function () {

    before(async function () {
      vi = await Voting.new({ from:owner });
    });

    it("Should be RegisteringVoters by default", async () => {
      expect(await vi.workflowStatus.call({ from:owner })).to.be.bignumber.equal(new BN(0));
    });

    it("Should switch to ProposalsRegistrationStarted and emit good event", async () => {
      const event = await vi.startProposalsRegistering({ from: owner });
      expectEvent(event, "WorkflowStatusChange", { previousStatus: new BN(0), newStatus: new BN(1) });
    });

    it("Should be ProposalsRegistrationStarted", async () => {
      expect(await vi.workflowStatus.call({ from:owner })).to.be.bignumber.equal(new BN(1));
    });

    it("Should switch to ProposalsRegistrationEnded and emit good event", async () => {
      const event = await vi.endProposalsRegistering({ from: owner });
      expectEvent(event, "WorkflowStatusChange", { previousStatus: new BN(1), newStatus: new BN(2) });
    });

    it("Should be ProposalsRegistrationEnded", async () => {
      expect(await vi.workflowStatus.call({ from:owner })).to.be.bignumber.equal(new BN(2));
    });

    it("Should switch to VotingSessionStarted and emit good event", async () => {
      const event = await vi.startVotingSession({ from: owner });
      expectEvent(event, "WorkflowStatusChange", { previousStatus: new BN(2), newStatus: new BN(3) });
    });

    it("Should be VotingSessionStarted", async () => {
      expect(await vi.workflowStatus.call({ from:owner })).to.be.bignumber.equal(new BN(3));
    });

    it("Should switch to VotingSessionEnded and emit good event", async () => {
      const event = await vi.endVotingSession({ from: owner });
      expectEvent(event, "WorkflowStatusChange", { previousStatus: new BN(3), newStatus: new BN(4) });
    });

    it("Should be VotingSessionEnded", async () => {
      expect(await vi.workflowStatus.call({ from:owner })).to.be.bignumber.equal(new BN(4));
    });

    it("Should switch to VotesTallied and emit good event", async () => {
      const event = await vi.tallyVotes({ from: owner });
      expectEvent(event, "WorkflowStatusChange", { previousStatus: new BN(4), newStatus: new BN(5) });
    });

    it("Should be VotesTallied", async () => {
      expect(await vi.workflowStatus.call({ from:owner })).to.be.bignumber.equal(new BN(5));
    });
  });

  describe("Test all setters and getters", function () {

    before(async function () {
      vi = await Voting.new({from:owner});

      await vi.addVoter(owner, { from: owner });
      await vi.addVoter(second, { from: owner });
    });

    describe("addVoter() / getVoter()", function () {

      it("Should set & get voter owner", async () => {
        const ownerVoter = await vi.getVoter.call(owner, { from: owner});
        expect(ownerVoter.isRegistered).to.be.true;
      });

      it("Should set & get voter second", async () => {
        const secondVoter = await vi.getVoter.call(second , { from: second});
        expect(secondVoter.isRegistered).to.be.true;
      });

      it("Should not set & get voter third", async () => {
        const thirdVoter = await vi.getVoter.call(third, { from: owner});
        expect(thirdVoter.isRegistered).to.be.false;
      });
    });

    describe("addProposal() / getOneProposal()", function () {

      before(async function () {
        await vi.addVoter(third, { from: owner });
        await vi.startProposalsRegistering({ from: owner });

        await vi.addProposal("lorem", { from: owner });
        await vi.addProposal("ipsum", { from: second });
        await vi.addProposal("dolor", { from: third });
      });

      it("Should get proposal owner -> owner", async () => {
        const proposal = await vi.getOneProposal.call(1, { from: owner });
        expect(proposal.description).to.equal("lorem");
      });

      it("Should get proposal second -> owner", async () => {
        const proposal = await vi.getOneProposal.call(1, { from: second });
        expect(proposal.description).to.equal("lorem");
      });

      it("Should get proposal third -> second", async () => {
        const proposal = await vi.getOneProposal.call(2, { from: third });
        expect(proposal.description).to.equal("ipsum");
      });

      it("Should get proposal third -> third", async () => {
        const proposal = await vi.getOneProposal.call(3, { from: third });
        expect(proposal.description).to.equal("dolor");
      });
    });

    describe("setVote()", function () {

      before(async function () {
        await vi.endProposalsRegistering({ from: owner });
        await vi.startVotingSession({ from: owner });
        await vi.setVote(1, { from: owner });
        await vi.setVote(1, { from: second });
      });

      it("Should proposal 'lorem' exist", async () => {
        const proposal = await vi.getOneProposal.call(1);
        expect(proposal.description).to.equal("lorem");
      });

      it("Should proposal 'lorem' have 2 votes", async () => {
        const proposal = await vi.getOneProposal.call(1);
        expect(proposal.voteCount).to.be.bignumber.equal(new BN(2));
      });

      it("Should owner has voted and vote for proposal 1", async () => {
        const ownerVoter = await vi.getVoter.call(owner);
        expect(ownerVoter.hasVoted).to.be.true;
        expect(ownerVoter.votedProposalId).to.be.bignumber.equal(new BN(1));
      });

      it("Should second has voted and vote for proposal 1", async () => {
        const secondVoter = await vi.getVoter.call(second);
        expect(secondVoter.hasVoted).to.be.true;
        expect(secondVoter.votedProposalId).to.be.bignumber.equal(new BN(1));
      });

      it("Should third has not voted", async () => {
        const thirdVoter = await vi.getVoter.call(third);
        expect(thirdVoter.hasVoted).to.be.false;
        expect(thirdVoter.votedProposalId).to.be.bignumber.equal(new BN(0));
      });
    });
  });

  describe("Test of votes counting : tallyVotes()", function () {

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

      expect(await vi.winningProposalID.call()).to.be.bignumber.equal(new BN(1));
    });

    it("Should 'lorem' win majority", async () => {
      await vi.setVote(1, { from: owner });
      await vi.setVote(1, { from: second });
      await vi.setVote(2, { from: third });
      await vi.setVote(1, { from: fourth });

      await vi.endVotingSession({ from: owner });
      await vi.tallyVotes({ from: owner });

      expect(await vi.winningProposalID.call()).to.be.bignumber.equal(new BN(1));
    });

    it("Should 'ipsum' win unanimity", async () => {
      await vi.setVote(2, { from: owner });
      await vi.setVote(2, { from: second });
      await vi.setVote(2, { from: third });
      await vi.setVote(2, { from: fourth });

      await vi.endVotingSession({ from: owner });
      await vi.tallyVotes({ from: owner });

      expect(await vi.winningProposalID.call()).to.be.bignumber.equal(new BN(2));
    });

    it("Should 'ipsum' win majority", async () => {
      await vi.setVote(2, { from: owner });
      await vi.setVote(2, { from: second });
      await vi.setVote(2, { from: third });
      await vi.setVote(1, { from: fourth });

      await vi.endVotingSession({ from: owner });
      await vi.tallyVotes({ from: owner });

      expect(await vi.winningProposalID.call()).to.be.bignumber.equal(new BN(2));
    });

    it("Should 'lorem' win equality (first in proposals array)", async () => {
      await vi.setVote(2, { from: owner });
      await vi.setVote(2, { from: second });
      await vi.setVote(1, { from: third });
      await vi.setVote(1, { from: fourth });

      await vi.endVotingSession({ from: owner });
      await vi.tallyVotes({ from: owner });

      expect(await vi.winningProposalID.call()).to.be.bignumber.equal(new BN(1));
    });
  });

  describe("Test events emits", function () {

    before(async function () {
      vi = await Voting.new({ from:owner });
    });

    it("Should emit event 'VoterRegistered'", async () => {
      const event = await vi.addVoter(owner, { from: owner });
      expectEvent(event, "VoterRegistered", { voterAddress: owner });
    });

    it("Should emit event 'ProposalRegistered'", async () => {
      await vi.startProposalsRegistering({ from: owner });
      const event = await vi.addProposal("lorem", { from: owner });
      expectEvent(event, "ProposalRegistered", { proposalId: new BN(1) });
    });

    it("Should emit event 'Voted'", async () => {
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
        await expectRevert(vi.addVoter.call(owner, { from: second }), 'Ownable: caller is not the owner');
      });

      it("Should not add voter already registered", async () => {
        await vi.addVoter(owner, { from: owner });
        await expectRevert(vi.addVoter.call(owner, { from: owner }), 'Already registered');
      });

      it("Should not add voter if wrong step", async () => {
        await vi.startProposalsRegistering({ from: owner });
        await expectRevert(vi.addVoter.call(owner, { from: owner }), 'Voters registration is not open yet');
      });
    });

    describe("addProposal()", function () {

      it("Should not add proposal if not voter", async () => {
        await expectRevert(vi.addProposal.call("lorem", { from: second }), "You're not a voter");
      });

      it("Should not add proposal if not description", async () => {
        await expectRevert(vi.addProposal.call("", { from: owner }), 'Vous ne pouvez pas ne rien proposer');
        await vi.addProposal("lorem", { from: owner });
      });

      it("Should not add proposal if wrong step", async () => {
        await vi.endProposalsRegistering( { from: owner });
        await expectRevert(vi.addProposal.call("lorem", { from: owner }), 'Proposals are not allowed yet');
      });
    });

    describe("setVote()", function () {

      it("Should not vote if not voter", async () => {
        await vi.startVotingSession( { from: owner });
        await expectRevert(vi.setVote.call(1, { from: second }), "You're not a voter");
      });

      it("Should not vote if proposal not exist", async () => {
        await expectRevert(vi.setVote.call(999, { from: owner }), 'Proposal not found');
      });

      it("Should not vote if already voted", async () => {
        await vi.setVote(1, { from: owner });
        await expectRevert(vi.setVote.call(1, { from: owner }), 'You have already voted');
      });

      it("Should not vote if wrong step", async () => {
        await vi.endVotingSession( { from: owner });
        await expectRevert(vi.setVote.call(1, { from: owner }), 'Voting session havent started yet');
      });
    });

    describe("Workflow changes functions", function () {

      it("Should not switch to 'RegisteringVoters' if not owner", async () => {
        await expectRevert(vi.startProposalsRegistering.call( { from: second }), 'Ownable: caller is not the owner');
      });

      it("Should not switch to 'RegisteringVoters' if wrong step", async () => {
        await expectRevert(vi.startProposalsRegistering.call( { from: owner }), 'Registering proposals cant be started now');
      });

      it("Should not switch to 'ProposalsRegistrationEnded' if not owner", async () => {
        await expectRevert(vi.endProposalsRegistering.call( { from: second }), 'Ownable: caller is not the owner');
      });

      it("Should not switch to 'ProposalsRegistrationEnded' if wrong step", async () => {
        await expectRevert(vi.endProposalsRegistering.call( { from: owner }), 'Registering proposals havent started yet');
      });

      it("Should not switch to 'VotingSessionStarted' if not owner", async () => {
        await expectRevert(vi.startVotingSession.call( { from: second }), 'Ownable: caller is not the owner');
      });

      it("Should not switch to 'VotingSessionStarted' if wrong step", async () => {
        await expectRevert(vi.startVotingSession.call( { from: owner }), 'Registering proposals phase is not finished');
      });

      it("Should not switch to 'VotingSessionEnded' if not owner", async () => {
        await expectRevert(vi.endVotingSession.call( { from: second }), 'Ownable: caller is not the owner');
      });

      it("Should not switch to 'VotingSessionEnded' if wrong step", async () => {
        await expectRevert(vi.endVotingSession.call( { from: owner }), 'Voting session havent started yet');
      });

      it("Should not switch to 'VotesTallied' if not owner", async () => {
        await expectRevert(vi.tallyVotes.call( { from: second }), 'Ownable: caller is not the owner');
      });

      it("Should not switch to 'VotesTallied' if wrong step", async () => {
        await vi.tallyVotes( { from: owner });
        await expectRevert(vi.tallyVotes.call( { from: owner }), "Current status is not voting session ended");
      });
    });
  });
});