import { time, loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("-- CRYPTO BET ---", function () {
  async function setupCryptoBet() {
    const [owner, addr1, addr2] = await ethers.getSigners();
    const cryptoBetContract = await ethers.getContractFactory("CryptoBet");
    const cryptoBet = await cryptoBetContract.deploy();
    return { cryptoBet, owner, addr1, addr2 };
  }

  function BN(value: number) {
    return ethers.BigNumber.from(value);
  }

  const BET_VALUE = "0.000000000000000010" // 10 wei
  const BET_VALUE_WRONG = "0.000000000000000015" // 15 wei

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
  
        const response = await cryptoBet.getBetters();
        expect(response.length).to.equal(0);
        await cryptoBet.registerBet(2, { value: ethers.utils.parseEther(BET_VALUE) });
        const response2 = await cryptoBet.getBetters();
        expect(response2[0]).to.equal(owner.address);
      });
  
      it("should set a bet DOWN correctly", async function () {
        const { cryptoBet, owner } = await setupCryptoBet();
  
        const response = await cryptoBet.getBetters();
        expect(response.length).to.equal(0);
        await cryptoBet.registerBet(1, { value: ethers.utils.parseEther(BET_VALUE) });
        const response2 = await cryptoBet.getBetters();
        expect(response2[0]).to.equal(owner.address);
      });
    })

    describe.skip("nextRound() :", function () {
      it("MOCK ORACLE FUNCTION", async function () {
        const { cryptoBet, owner } = await setupCryptoBet();
  
        const response = await cryptoBet.nextRound();
        console.log("response ns -> ", response);
      });
    })

    describe.skip("claimBet() :", function () {
      it("MOCK ORACLE FUNCTION", async function () {
        const { cryptoBet, owner } = await setupCryptoBet();
  
        const response = await cryptoBet.claimBet();
        console.log("response ns -> ", response);
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

    describe.skip("evt_betFinish :", function () {
      it("MOCK ORACLE FUNCTION", async function () {
        const { cryptoBet, owner } = await setupCryptoBet();
  
        const response = await cryptoBet.nextRound();
        console.log("response ns -> ", response);
      });
    })

    describe.skip("evt_nextRound :", function () {
      it("MOCK ORACLE FUNCTION", async function () {
        const { cryptoBet, owner } = await setupCryptoBet();
  
        const response = await cryptoBet.claimBet();
        console.log("response ns -> ", response);
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

      it.skip("MOCK ORACLE FUNCTION", async function () {
        const { cryptoBet, owner } = await setupCryptoBet();

        const response = await cryptoBet.nextRound();
        console.log("response ns -> ", response);
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
    it.skip("Should transfer right funds to the caller", async function () {
      // const { lock, unlockTime, lockedAmount, owner } = await loadFixture(
      //   deployOneYearLockFixture
      // );

      // await time.increaseTo(unlockTime);

      // await expect(lock.withdraw()).to.changeEtherBalances(
      //   [owner, lock],
      //   [lockedAmount, -lockedAmount]
      // );
    });
  });
});
