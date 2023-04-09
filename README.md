# Dépot des devoirs Alyra

Sont placés sur ce repository les dossiers qui contiennent les diférents devois et projets pour Alyra.

### Devoir 1 : Smart contract de vote
```📁 app_vote```
###### Description :
Un smart contract de vote, utilisant isOwner de la libraire openZeppelin. 
###### Instalation :
Pas d'instalation specifique.

### Devoir 2 : Smart contract de vote avec tests
```📁 vote_with_tests```
###### Description :
Le smart contract de vote corrigé avec environnement Truffle. \
 Objectif: faire un fichier ```.test.js``` pour tester le smart contract de vote et executer les tests. \
 À été testé (dans l'ordre) :
 - Les switch de workflow et leurs events
   - RegisteringVoters default
   - ProposalsRegistrationStarted switch
   - ProposalsRegistrationStarted event
   - ProposalsRegistrationEnded switch
   - ProposalsRegistrationEnded event
   - VotingSessionStarted switch
   - VotingSessionStarted event
   - VotingSessionEnded switch
   - VotingSessionEnded event
   - VotesTallied switch
   - VotesTallied event
 - Les getters et setters
   - ```addVoter()``` get owner
   - ```addVoter()``` get second
   - ```addVoter()``` get third
   - ```addProposal()``` get owner's proposal from owner
   - ```addProposal()``` get owner's proposal from second
   - ```addProposal()``` get second's proposal from third
   - ```addProposal()``` get third's proposal from third
   - ```setVote()``` is vote 'lorem' exist
   - ```setVote()``` is vote 'lorem' have 2 votes
   - ```setVote()``` is owner has voted for 'lorem'
   - ```setVote()``` is second has voted for 'lorem'
   - ```setVote()``` is third has not voted
 - Le comptage des votes
   - ```tallyVotes()``` unanimity for 'lorem'
   - ```tallyVotes()``` majority for 'lorem'
   - ```tallyVotes()``` unanimity for 'ipsum'
   - ```tallyVotes()``` majority for 'ipsum'
   - ```tallyVotes()``` equality win for 'lorem'
 - Les events
   - VoterRegistered event
   - ProposalRegistered event
   - Voted event
 - Les reverts et le require
   - ```addVoter()``` revert si le caller n'est pas owner
   - ```addVoter()``` revert si le voter est déjà enregistré
   - ```addVoter()``` revert si pas la bonne étape
   - ```addProposal()``` revert si le caller n'est pas voter
   - ```addproposal()``` revert si pas de description
   - ```addProposal()``` revert si pas la bonne étape
   - ```setVote()``` revert si le caller n'est pas voter
   - ```setVote()``` revert si le vote n'existe pas
   - ```setVote()``` revert si le caller a déjà voté
   - ```setVite()``` revert si pas la bonne étape
   - ```startProposalsRegistering()``` revert si le caller n'est pas owner
   - ```startProposalsRegistering()``` revert si pas la bonne étape
   - ```endProposalsRegistering()``` revert si le caller n'est pas owner
   - ```endProposalsRegistering()``` revert si pas la bonne étape
   - ```startVotingSession()``` revert si le caller n'est pas owner
   - ```startVotingSession()``` revert si pas la bonne étape
   - ```endVotingSession()``` revert si le caller n'est pas owner
   - ```endVotingSession()``` revert si pas la bonne étape
   - ```tallyVotes()``` revert si le caller n'est pas owner
   - ```tallyVotes()``` revert si pas la bonne étape
###### Utilisation :
Avoir Ganache et Truffle \
Avoir Node et Npm à jour

Cloner le repo et se metter dans le bon repertoire :
```
cd vote_with_tests/
```
Installer les packages :
```
npm install
```
Lancer les test :
```
truffle test
``` 

### Projet Final : EasyDapp application décentralisée de pari
```📁 Projet_4```
