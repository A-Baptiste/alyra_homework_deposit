# EasyDapp

- Front déployé : [EasyDapp](https://alyra-homework-deposit.vercel.app/)
- Vidéo démonstration : [Démo EasyDapp](https://drive.google.com/file/d/1mUS5Oxzx2nC8-nO-Lh2DpxRU8uwn6mtM/view?usp=sharing)

## Description

*EasyDapp est une application décentralisée qui as pour vocation à aider les néophites à comprendre les applications possible à la cryptomonaie et la blockchain.*
*Pour l'instant EasyDapp permet seulement de parier sur le cours du ETH / USD et de récolter une recompense en fonction des utilisateur ayant gagné ou perdu leurs pari.*
*Il est possible de jouer un un token dédieé, l'EDFT, qui permet de jouer sans perdre d'argent car celui ci est obtenable gratuitement.*

## CRON

*Pour fonctionner EasyDapp utilise un CRON qui viens trigger le round suivant toutes les 6 heures (8h / 14h / 20h / 2h), à ce moment les pari sont calculées et les gagnants peuvent réclammer leurs recompense.*
*Ce CRON est fait avec [l'outil d'automation de ChainLink](https://automation.chain.link/), il suffit de rentrer l'adresse / abi du contract et avec un peut de configuration le CRON est capable de se déclencher automatiquement.*
*En raison du cout en ETH de test, il est tres probable que le CRON soit éteint au moment où vous lisez ces lignes*


## Utilisation

### Dossier hardhat :

> Verifiez que votre node et npm sont à jour.

installer les dependances
```
npm install
```

Lancer la blockchain locale
```
npx hardhat node
```

Lancer les tests avec coverage
```
npx hardhat coverage
```

Deployer le contract en local
```
npx hardhat run scripts/deploy.ts --network localhost
```

Deployer le contract sur sepolia
```
npx hardhat run scripts/deploy.ts --network sepolia
```

### Dossier client :

> Verifiez que votre node et npm sont à jour.

Installer les dependances
```
npm install
```

laner le serveur local
```
npm run dev
```

## Stack technique

- [Hardhat](https://hardhat.org/)
- [ChainLink](https://chain.link/)
- [OpenZeppelin](https://www.openzeppelin.com/)
- [Typescript](https://www.typescriptlang.org)
- [Tailwind](https://tailwindcss.com/) & [DaisyUI](https://daisyui.com/)
- [Rainbowkit](https://www.rainbowkit.com/)
- [EthersJS](https://ethers.org/)
- [Wagmi](https://wagmi.sh/)
- [Vercel](https://vercel.com/home)
- [React-toastify](fkhadra.github.io/react-toastify)
