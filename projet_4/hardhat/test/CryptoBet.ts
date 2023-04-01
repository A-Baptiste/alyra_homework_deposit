import { time, loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("--- CRYPTO BET ---", function () {
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

  // let cb: any;
  // const owner = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";
  // const account1 = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8";
  // const account2 = "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC";
  // const account3 = "0x90F79bf6EB2c4f870365E785982E1f101E93b906";

  describe("Getters functions :", function () {
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

  describe("Setters functions :", function () {
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

    describe.only("nextRound() :", function () {
      it("should work", async function () {
        const { cryptoBet, owner } = await setupCryptoBet();
  
        const response = await cryptoBet.nextRound();
        console.log("response ns -> ", response);
      });
  
      // it("should set a bet DOWN correctly", async function () {
      //   const { cryptoBet, owner } = await setupCryptoBet();
  
      //   const response = await cryptoBet.getBetters();
      //   expect(response.length).to.equal(0);
      //   await cryptoBet.registerBet(1, { value: ethers.utils.parseEther(BET_VALUE) });
      //   const response2 = await cryptoBet.getBetters();
      //   expect(response2[0]).to.equal(owner.address);
      // });
    })

    // it("getOneBetter() should return data of one better", async function () {
    //   const response = await cb.getOneBetter(owner);
    //   expect(response.betValue).to.equal(BN(10));
    //   expect(response.balance).to.equal(BN(0));
    //   expect(response.expectStatus).to.equal(2);
    //   expect(response.betStatus).to.equal(1);
    // });
  });

  // describe("Withdrawals", function () {
  //   describe("Validations", function () {
  //     it("Should revert with the right error if called too soon", async function () {
  //       const { lock } = await loadFixture(deployOneYearLockFixture);

  //       await expect(lock.withdraw()).to.be.revertedWith(
  //         "You can't withdraw yet"
  //       );
  //     });

  //     it("Should revert with the right error if called from another account", async function () {
  //       const { lock, unlockTime, otherAccount } = await loadFixture(
  //         deployOneYearLockFixture
  //       );

  //       // We can increase the time in Hardhat Network
  //       await time.increaseTo(unlockTime);

  //       // We use lock.connect() to send a transaction from another account
  //       await expect(lock.connect(otherAccount).withdraw()).to.be.revertedWith(
  //         "You aren't the owner"
  //       );
  //     });

  //     it("Shouldn't fail if the unlockTime has arrived and the owner calls it", async function () {
  //       const { lock, unlockTime } = await loadFixture(
  //         deployOneYearLockFixture
  //       );

  //       // Transactions are sent using the first signer by default
  //       await time.increaseTo(unlockTime);

  //       await expect(lock.withdraw()).not.to.be.reverted;
  //     });
  //   });

  //   describe("Events", function () {
  //     it("Should emit an event on withdrawals", async function () {
  //       const { lock, unlockTime, lockedAmount } = await loadFixture(
  //         deployOneYearLockFixture
  //       );

  //       await time.increaseTo(unlockTime);

  //       await expect(lock.withdraw())
  //         .to.emit(lock, "Withdrawal")
  //         .withArgs(lockedAmount, anyValue); // We accept any value as `when` arg
  //     });
  //   });

  //   describe("Transfers", function () {
  //     it("Should transfer the funds to the owner", async function () {
  //       const { lock, unlockTime, lockedAmount, owner } = await loadFixture(
  //         deployOneYearLockFixture
  //       );

  //       await time.increaseTo(unlockTime);

  //       await expect(lock.withdraw()).to.changeEtherBalances(
  //         [owner, lock],
  //         [lockedAmount, -lockedAmount]
  //       );
  //     });
  //   });
  // });
});
