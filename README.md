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
Le smart contract de vote corrigé avec environnement Truffle.
 Objectif: faire un fichier ```.test.js``` pour tester le smart contract de vote et executer les tests.
 À été testé (dans l'ordre) :
 - Les switch de workflow et leurs events
 - Les getters et setters
 - Le comptage des votes
 - Les events
 - Les reverts et le require
###### Utilisation :
Avoir Ganache et Truffle
Avoir Node et Npm à jour

Cloner le repo et installer les packages :
```
npm install
```
Lancer les test :
```
truffle test
``` 