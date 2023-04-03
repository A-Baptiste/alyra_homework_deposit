import { time, loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import { ethers } from "hardhat";
require('dotenv').config();

describe("-- CRYPTO BET ---", function () {
  async function setupCryptoBet() {
    const [owner, addr1, addr2] = await ethers.getSigners();
    const cryptoBetContract = await ethers.getContractFactory("CryptoBet");
    // @ts-ignore
    const cryptoBet = await cryptoBetContract.deploy(process.env.SEPOLIA_ORACLE_ADDRESS);

    return { cryptoBet, owner, addr1, addr2 };
  }

  function BN(value: number) {
    return ethers.BigNumber.from(value);
  }

  const BET_VALUE = "0.000000000000000010" // 10 wei
  const BET_VALUE_WRONG = "0.000000000000000015" // 15 wei
  const BALANCE_MARGIN_1 = "0.000000000000000009" // 9 wei
  const BALANCE_MARGIN_2 = "0.000000000000000018" // 20 wei

  describe("-> Getters functions :", function () {
    it("getBetters() should return array of betters", async function () {
      const { cryptoBet, owner } = await setupCryptoBet();

      const response = await cryptoBet.getBetters();
      expect(response.length).to.equal(0);
      await cryptoBet.registerBet(2, { value: ethers.utils.parseEther(BET_VALUE) });
      const response2 = await cryptoBet.getBetters();
      expect(response2[0]).to.equal(owner.address);
    });

    it("getOneBetter() should return data of one better", async function () {
      const { cryptoBet, owner } = await setupCryptoBet();

      await cryptoBet.registerBet(2, { value: ethers.utils.parseEther(BET_VALUE) });
      const response = await cryptoBet.getOneBetter(owner.address);

      expect(response.betValue).to.equal(BN(10));
      expect(response.balance).to.equal(BN(0));
      expect(response.expectStatus).to.equal(2);
      expect(response.betStatus).to.equal(1);
    });
  });

  describe("-> Setters functions :", function () {
    describe("registerBet() :", function () {
      it("should set a bet UP correctly", async function () {
        const { cryptoBet, owner } = await setupCryptoBet();

        expect(await cryptoBet.currentBetBalance()).to.equal(0);
  
        const response = await cryptoBet.getBetters();
        expect(response.length).to.equal(0);
        await cryptoBet.registerBet(2, { value: ethers.utils.parseEther(BET_VALUE) });
        const response2 = await cryptoBet.getBetters();
        expect(response2[0]).to.equal(owner.address);

        expect(await cryptoBet.currentBetBalance()).to.equal(10);
      });
  
      it("should set a bet DOWN correctly", async function () {
        const { cryptoBet, owner } = await setupCryptoBet();

        expect(await cryptoBet.currentBetBalance()).to.equal(0);
  
        const response = await cryptoBet.getBetters();
        expect(response.length).to.equal(0);
        await cryptoBet.registerBet(1, { value: ethers.utils.parseEther(BET_VALUE) });
        const response2 = await cryptoBet.getBetters();
        expect(response2[0]).to.equal(owner.address);

        expect(await cryptoBet.currentBetBalance()).to.equal(10);
      });
    })

    describe("nextRound() :", function () {
      it("should compute results correctly ( 1 winner 1 looser )", async function () {
        const { cryptoBet, owner, addr1 } = await setupCryptoBet();

        expect(await cryptoBet.currentPriceFeed()).to.equal(0);
        // vote down always loose - vote up always win
        await cryptoBet.registerBet(1, { value: ethers.utils.parseEther(BET_VALUE) });
        await cryptoBet.connect(addr1).registerBet(2, { value: ethers.utils.parseEther(BET_VALUE) });
        await cryptoBet.nextRound();

        const getBetOwner = await cryptoBet.getOneBetter(owner.address)
        const getBetAddr1 = await cryptoBet.getOneBetter(addr1.address);

        expect(getBetOwner.betValue).to.equal(BN(10));
        expect(getBetOwner.expectStatus).to.equal(1);
        expect(getBetOwner.betStatus).to.equal(2);
        expect(getBetOwner.balance).to.equal(BN(0));

        expect(getBetAddr1.betValue).to.equal(BN(10));
        expect(getBetAddr1.expectStatus).to.equal(2);
        expect(getBetAddr1.betStatus).to.equal(3);
        expect(getBetAddr1.balance).to.equal(BN(20));
      });

      it("should compute results correctly ( 2 losers )", async function () {
        const { cryptoBet, owner, addr1 } = await setupCryptoBet();

        expect(await cryptoBet.currentPriceFeed()).to.equal(0);
        // vote down always loose - vote up always win
        await cryptoBet.registerBet(1, { value: ethers.utils.parseEther(BET_VALUE) });
        await cryptoBet.connect(addr1).registerBet(1, { value: ethers.utils.parseEther(BET_VALUE) });
        await cryptoBet.nextRound();

        const getBetOwner = await cryptoBet.getOneBetter(owner.address)
        const getBetAddr1 = await cryptoBet.getOneBetter(addr1.address);

        expect(getBetOwner.betValue).to.equal(BN(10));
        expect(getBetOwner.expectStatus).to.equal(1);
        expect(getBetOwner.betStatus).to.equal(2);
        expect(getBetOwner.balance).to.equal(BN(0));

        expect(getBetAddr1.betValue).to.equal(BN(10));
        expect(getBetAddr1.expectStatus).to.equal(1);
        expect(getBetAddr1.betStatus).to.equal(2);
        expect(getBetAddr1.balance).to.equal(BN(0));
      });

      it("should compute results correctly ( 2 winners )", async function () {
        const { cryptoBet, owner, addr1 } = await setupCryptoBet();

        expect(await cryptoBet.currentPriceFeed()).to.equal(0);
        // vote down always loose - vote up always win
        await cryptoBet.registerBet(2, { value: ethers.utils.parseEther(BET_VALUE) });
        await cryptoBet.connect(addr1).registerBet(2, { value: ethers.utils.parseEther(BET_VALUE) });
        await cryptoBet.nextRound();

        const getBetOwner = await cryptoBet.getOneBetter(owner.address)
        const getBetAddr1 = await cryptoBet.getOneBetter(addr1.address);

        expect(getBetOwner.betValue).to.equal(BN(10));
        expect(getBetOwner.expectStatus).to.equal(2);
        expect(getBetOwner.betStatus).to.equal(3);
        expect(getBetOwner.balance).to.equal(BN(10));

        expect(getBetAddr1.betValue).to.equal(BN(10));
        expect(getBetAddr1.expectStatus).to.equal(2);
        expect(getBetAddr1.betStatus).to.equal(3);
        expect(getBetAddr1.balance).to.equal(BN(10));
      });
    })

    describe("claimBet() :", function () {
      it("should remove data ( LOOSE )", async function () {
        const { cryptoBet, owner } = await setupCryptoBet();
        expect(await cryptoBet.currentPriceFeed()).to.equal(0);
        await cryptoBet.registerBet(1, { value: ethers.utils.parseEther(BET_VALUE) });
        await cryptoBet.nextRound();
        await cryptoBet.claimBet();

        const getBetOwner = await cryptoBet.getOneBetter(owner.address);
        expect(getBetOwner.betValue).to.equal(BN(0));
        expect(getBetOwner.expectStatus).to.equal(0);
        expect(getBetOwner.betStatus).to.equal(0);
        expect(getBetOwner.balance).to.equal(BN(0));
      });

      it("should remove data ( WIN )", async function () {
        const { cryptoBet, owner } = await setupCryptoBet();
        expect(await cryptoBet.currentPriceFeed()).to.equal(0);
        await cryptoBet.registerBet(2, { value: ethers.utils.parseEther(BET_VALUE) });
        await cryptoBet.nextRound();
        await cryptoBet.claimBet();

        const getBetOwner = await cryptoBet.getOneBetter(owner.address);
        expect(getBetOwner.betValue).to.equal(BN(0));
        expect(getBetOwner.expectStatus).to.equal(0);
        expect(getBetOwner.betStatus).to.equal(0);
        expect(getBetOwner.balance).to.equal(BN(0));
      });
    })
  });

  describe("-> Events :", function () {
    describe("evt_newBet :", function () {
      it("trigger new bet event (first bet)", async function () {
        const { cryptoBet } = await setupCryptoBet();

        await expect(cryptoBet.registerBet(2, { value: ethers.utils.parseEther(BET_VALUE) }))
          .to.emit(cryptoBet, "evt_newBet")
          .withArgs(1, BN(10));
      });

      it("trigger new bet event (second bet)", async function () {
        const { cryptoBet, addr1 } = await setupCryptoBet();
        await cryptoBet.registerBet(2, { value: ethers.utils.parseEther(BET_VALUE) });

        await expect(cryptoBet.connect(addr1).registerBet(2, { value: ethers.utils.parseEther(BET_VALUE) }))
          .to.emit(cryptoBet, "evt_newBet")
          .withArgs(2, BN(20));
      });
    })

    describe("evt_betFinish :", function () {
      it("trigger bet finish event on win", async function () {
        const { cryptoBet, owner } = await setupCryptoBet();
        expect(await cryptoBet.currentPriceFeed()).to.equal(0);
        await cryptoBet.registerBet(2, { value: ethers.utils.parseEther(BET_VALUE) });
        await expect(cryptoBet.nextRound())
          .to.emit(cryptoBet, "evt_betFinish")
          .withArgs(owner.address, true);
      });

      it("trigger bet finish event on loose", async function () {
        const { cryptoBet, owner } = await setupCryptoBet();
        expect(await cryptoBet.currentPriceFeed()).to.equal(0);
        await cryptoBet.registerBet(1, { value: ethers.utils.parseEther(BET_VALUE) });
        await expect(cryptoBet.nextRound())
          .to.emit(cryptoBet, "evt_betFinish")
          .withArgs(owner.address, false);
      });
    })

    describe("evt_nextRound :", function () {
      it("trigger next round with right data ( 1 winner 1 looser )", async function () {
        const { cryptoBet, addr1 } = await setupCryptoBet();
        expect(await cryptoBet.currentPriceFeed()).to.equal(0);
        await cryptoBet.registerBet(1, { value: ethers.utils.parseEther(BET_VALUE) });
        await cryptoBet.connect(addr1).registerBet(2, { value: ethers.utils.parseEther(BET_VALUE) });
        await expect(cryptoBet.nextRound())
          .to.emit(cryptoBet, "evt_nextRound")
          .withArgs(1, 2, await cryptoBet.currentPriceFeed());
      });

      it("trigger next round with right data ( 2 losers )", async function () {
        const { cryptoBet, addr1 } = await setupCryptoBet();
        expect(await cryptoBet.currentPriceFeed()).to.equal(0);
        await cryptoBet.registerBet(1, { value: ethers.utils.parseEther(BET_VALUE) });
        await cryptoBet.connect(addr1).registerBet(1, { value: ethers.utils.parseEther(BET_VALUE) });
        await expect(cryptoBet.nextRound())
          .to.emit(cryptoBet, "evt_nextRound")
          .withArgs(0, 2, await cryptoBet.currentPriceFeed());
      });

      it("trigger next round with right data ( 2 winners )", async function () {
        const { cryptoBet, addr1 } = await setupCryptoBet();
        expect(await cryptoBet.currentPriceFeed()).to.equal(0);
        await cryptoBet.registerBet(2, { value: ethers.utils.parseEther(BET_VALUE) });
        await cryptoBet.connect(addr1).registerBet(2, { value: ethers.utils.parseEther(BET_VALUE) });
        await expect(cryptoBet.nextRound())
          .to.emit(cryptoBet, "evt_nextRound")
          .withArgs(2, 2, await cryptoBet.currentPriceFeed());
      });
    })
  });

  describe("-> Reverts :", function () {
    describe("registerBet() :", function () {
      it("Should revert if user already betting", async function () {
        const { cryptoBet } = await setupCryptoBet();
        await cryptoBet.registerBet(2, { value: ethers.utils.parseEther(BET_VALUE) });

        await expect(cryptoBet.registerBet(2, { value: ethers.utils.parseEther(BET_VALUE) }))
        .to.be.revertedWith(
          "must not betting to execute this function"
        );
      });

      it("Should revert if user not send right value", async function () {
        const { cryptoBet } = await setupCryptoBet();

        await expect(cryptoBet.registerBet(2, { value: ethers.utils.parseEther(BET_VALUE_WRONG) }))
        .to.be.revertedWith(
          "you must send exactly the bet value"
        );
      });
    })

    describe("nextRound() :", function () {
      it("Should revert if caller is not owner", async function () {
        const { cryptoBet, addr1 } = await setupCryptoBet();

        await expect(cryptoBet.connect(addr1).nextRound())
        .to.be.revertedWith(
          "Ownable: caller is not the owner"
        );
      });
    })

    describe("claimBet() :", function () {
      it("Should revert if user is not betting", async function () {
        const { cryptoBet } = await setupCryptoBet();

        await expect(cryptoBet.claimBet())
        .to.be.revertedWith(
          "wait till your bet has finished"
        );
      });
    })
  });

  describe("-> Value transfers", function () {
    it("Should transfer right funds to the caller ( 10 wei )", async function () {
      const { cryptoBet, owner } = await setupCryptoBet();
      expect(await cryptoBet.currentPriceFeed()).to.equal(0);
      await cryptoBet.registerBet(2, { value: ethers.utils.parseEther(BET_VALUE) });
      await cryptoBet.nextRound();

      const getBetOwner = await cryptoBet.getOneBetter(owner.address);
      expect(getBetOwner.balance).to.equal(10);
        
      await expect(cryptoBet.claimBet()).to.changeEtherBalances(
        [owner, cryptoBet],
        [ethers.utils.parseEther(BALANCE_MARGIN_1), -ethers.utils.parseEther(BALANCE_MARGIN_1)]
      );
    });

    it("Should transfer right funds to the caller ( 20 wei )", async function () {
      const { cryptoBet, owner, addr1 } = await setupCryptoBet();
      expect(await cryptoBet.currentPriceFeed()).to.equal(0);
      await cryptoBet.registerBet(2, { value: ethers.utils.parseEther(BET_VALUE) });
      await cryptoBet.connect(addr1).registerBet(1, { value: ethers.utils.parseEther(BET_VALUE) });
      await cryptoBet.nextRound();

      const getBetOwner = await cryptoBet.getOneBetter(owner.address);
      expect(getBetOwner.balance).to.equal(20);
        
      await expect(cryptoBet.claimBet()).to.changeEtherBalances(
        [owner, cryptoBet],
        [ethers.utils.parseEther(BALANCE_MARGIN_2), -ethers.utils.parseEther(BALANCE_MARGIN_2)]
      );
    });
  });
});
