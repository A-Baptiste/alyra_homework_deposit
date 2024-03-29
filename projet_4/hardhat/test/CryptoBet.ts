import { expect } from "chai";
import { ethers } from "hardhat";
require('dotenv').config();

describe("-- CRYPTO BET ---", function () {
  async function setupCryptoBet() {
    const [owner, addr1, addr2, addr3] = await ethers.getSigners();
    const cryptoBetContract = await ethers.getContractFactory("CryptoBet");
    // @ts-ignore
    const cryptoBet = await cryptoBetContract.deploy(process.env.SEPOLIA_ORACLE_ADDRESS);

    return { cryptoBet, owner, addr1, addr2, addr3 };
  }

  function BN(value: number | string) {
    return ethers.BigNumber.from(value);
  }

  const BET_VALUE_ETH = "1";
  const BET_VALUE_WEI = "1000000000000000000";

  describe("-> Getters functions :", function () {
    it("getBetters() should return array of betters", async function () {
      const { cryptoBet, owner } = await setupCryptoBet();

      const response = await cryptoBet.getBetters();
      expect(response.length).to.equal(0);
      await cryptoBet.registerBet(2, { value: ethers.utils.parseEther(BET_VALUE_ETH) });
      const response2 = await cryptoBet.getBetters();
      expect(response2[0]).to.equal(owner.address);
    });

    it("getOneBetter() should return data of one better", async function () {
      const { cryptoBet, owner } = await setupCryptoBet();

      await cryptoBet.registerBet(2, { value: ethers.utils.parseEther(BET_VALUE_ETH) });
      const response = await cryptoBet.getOneBetter(owner.address);

      expect(response.betValue).to.equal(BN(BET_VALUE_WEI));
      expect(response.balance).to.equal(BN(0));
      expect(response.expectStatus).to.equal(2);
      expect(response.betStatus).to.equal(1);
      expect(response.token).to.equal(false);
    });

    it("getOneBetter() should return data of one better (use token)", async function () {
      const { cryptoBet, owner } = await setupCryptoBet();

      await cryptoBet.registerBetErc20(2);
      const response = await cryptoBet.getOneBetter(owner.address);

      expect(response.betValue).to.equal(BN(10));
      expect(response.balance).to.equal(BN(0));
      expect(response.expectStatus).to.equal(2);
      expect(response.betStatus).to.equal(1);
      expect(response.token).to.equal(true);
    });
  });

  describe("-> Setters functions :", function () {
    describe("registerBet() :", function () {
      it("should set a bet UP correctly", async function () {
        const { cryptoBet, owner } = await setupCryptoBet();

        expect(await cryptoBet.currentBetBalance()).to.equal(0);
  
        const response = await cryptoBet.getBetters();
        expect(response.length).to.equal(0);
        await cryptoBet.registerBet(2, { value: ethers.utils.parseEther(BET_VALUE_ETH) });
        const response2 = await cryptoBet.getBetters();
        expect(response2[0]).to.equal(owner.address);

        expect(await cryptoBet.currentBetBalance()).to.equal(BN(BET_VALUE_WEI));
      });
  
      it("should set a bet DOWN correctly", async function () {
        const { cryptoBet, owner } = await setupCryptoBet();

        expect(await cryptoBet.currentBetBalance()).to.equal(0);
  
        const response = await cryptoBet.getBetters();
        expect(response.length).to.equal(0);
        await cryptoBet.registerBet(1, { value: ethers.utils.parseEther(BET_VALUE_ETH) });
        const response2 = await cryptoBet.getBetters();
        expect(response2[0]).to.equal(owner.address);

        expect(await cryptoBet.currentBetBalance()).to.equal(BN(BET_VALUE_WEI));
      });

      it("should set a bet UP correctly (use token)", async function () {
        const { cryptoBet, owner } = await setupCryptoBet();

        expect(await cryptoBet.currentBetBalance()).to.equal(0);
  
        const response = await cryptoBet.getBetters();
        expect(response.length).to.equal(0);
        await cryptoBet.registerBetErc20(2);
        const response2 = await cryptoBet.getBetters();
        expect(response2[0]).to.equal(owner.address);

        expect(await cryptoBet.currentBetBalanceErc20()).to.equal(10);
      });

      it("should set a bet DOWN correctly (use token)", async function () {
        const { cryptoBet, owner } = await setupCryptoBet();

        expect(await cryptoBet.currentBetBalance()).to.equal(0);
  
        const response = await cryptoBet.getBetters();
        expect(response.length).to.equal(0);
        await cryptoBet.registerBetErc20(1);
        const response2 = await cryptoBet.getBetters();
        expect(response2[0]).to.equal(owner.address);

        expect(await cryptoBet.currentBetBalanceErc20()).to.equal(10);
      });
    })

    describe("nextRound() :", function () {
      it("should compute results correctly ( 1 winner 1 looser )", async function () {
        const { cryptoBet, owner, addr1 } = await setupCryptoBet();

        expect(await cryptoBet.currentPriceFeed()).to.equal(0);
        // vote down always loose - vote up always win
        await cryptoBet.registerBet(1, { value: ethers.utils.parseEther(BET_VALUE_ETH) });
        await cryptoBet.connect(addr1).registerBet(2, { value: ethers.utils.parseEther(BET_VALUE_ETH) });
        await cryptoBet.nextRound();

        const getBetOwner = await cryptoBet.getOneBetter(owner.address)
        const getBetAddr1 = await cryptoBet.getOneBetter(addr1.address);

        expect(getBetOwner.betValue).to.equal(BN(BET_VALUE_WEI));
        expect(getBetOwner.expectStatus).to.equal(1);
        expect(getBetOwner.betStatus).to.equal(2);
        expect(getBetOwner.balance).to.equal(BN(0));

        expect(getBetAddr1.betValue).to.equal(BN(BET_VALUE_WEI));
        expect(getBetAddr1.expectStatus).to.equal(2);
        expect(getBetAddr1.betStatus).to.equal(3);
        expect(getBetAddr1.balance).to.equal(BN(BET_VALUE_WEI).add(BN(BET_VALUE_WEI)));
      });

      it("should compute results correctly ( 2 losers )", async function () {
        const { cryptoBet, owner, addr1 } = await setupCryptoBet();

        expect(await cryptoBet.currentPriceFeed()).to.equal(0);
        // vote down always loose - vote up always win
        await cryptoBet.registerBet(1, { value: ethers.utils.parseEther(BET_VALUE_ETH) });
        await cryptoBet.connect(addr1).registerBet(1, { value: ethers.utils.parseEther(BET_VALUE_ETH) });
        await cryptoBet.nextRound();

        const getBetOwner = await cryptoBet.getOneBetter(owner.address)
        const getBetAddr1 = await cryptoBet.getOneBetter(addr1.address);

        expect(getBetOwner.betValue).to.equal(BN(BET_VALUE_WEI));
        expect(getBetOwner.expectStatus).to.equal(1);
        expect(getBetOwner.betStatus).to.equal(2);
        expect(getBetOwner.balance).to.equal(BN(0));

        expect(getBetAddr1.betValue).to.equal(BN(BET_VALUE_WEI));
        expect(getBetAddr1.expectStatus).to.equal(1);
        expect(getBetAddr1.betStatus).to.equal(2);
        expect(getBetAddr1.balance).to.equal(BN(0));
      });

      it("should compute results correctly ( 2 winners )", async function () {
        const { cryptoBet, owner, addr1 } = await setupCryptoBet();

        expect(await cryptoBet.currentPriceFeed()).to.equal(0);
        // vote down always loose - vote up always win
        await cryptoBet.registerBet(2, { value: ethers.utils.parseEther(BET_VALUE_ETH) });
        await cryptoBet.connect(addr1).registerBet(2, { value: ethers.utils.parseEther(BET_VALUE_ETH) });
        await cryptoBet.nextRound();

        const getBetOwner = await cryptoBet.getOneBetter(owner.address)
        const getBetAddr1 = await cryptoBet.getOneBetter(addr1.address);

        expect(getBetOwner.betValue).to.equal(BN(BET_VALUE_WEI));
        expect(getBetOwner.expectStatus).to.equal(2);
        expect(getBetOwner.betStatus).to.equal(3);
        expect(getBetOwner.balance).to.equal(BN(BET_VALUE_WEI));

        expect(getBetAddr1.betValue).to.equal(BN(BET_VALUE_WEI));
        expect(getBetAddr1.expectStatus).to.equal(2);
        expect(getBetAddr1.betStatus).to.equal(3);
        expect(getBetAddr1.balance).to.equal(BN(BET_VALUE_WEI));
      });

      it("should compute results correctly ( 1 winner 1 looser ) (use token)", async function () {
        const { cryptoBet, owner, addr1 } = await setupCryptoBet();

        expect(await cryptoBet.currentPriceFeed()).to.equal(0);
        // vote down always loose - vote up always win
        await cryptoBet.registerBetErc20(1);
        await cryptoBet.connect(addr1).mintEDFT();
        await cryptoBet.connect(addr1).registerBetErc20(2);
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

      it("should compute results correctly ( 2 losers ) (use token)", async function () {
        const { cryptoBet, owner, addr1 } = await setupCryptoBet();

        expect(await cryptoBet.currentPriceFeed()).to.equal(0);
        // vote down always loose - vote up always win
        await cryptoBet.registerBetErc20(1);
        await cryptoBet.connect(addr1).mintEDFT();
        await cryptoBet.connect(addr1).registerBetErc20(1);
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

      it("should compute results correctly ( 2 winner ) (use token)", async function () {
        const { cryptoBet, owner, addr1 } = await setupCryptoBet();

        expect(await cryptoBet.currentPriceFeed()).to.equal(0);
        // vote down always loose - vote up always win
        await cryptoBet.registerBetErc20(2);
        await cryptoBet.connect(addr1).mintEDFT();
        await cryptoBet.connect(addr1).registerBetErc20(2);
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

      it("should compute results correctly (token and eth user)", async function () {
        const { cryptoBet, owner, addr1, addr2, addr3 } = await setupCryptoBet();

        expect(await cryptoBet.currentPriceFeed()).to.equal(0);
        // vote down always loose - vote up always win
        await cryptoBet.connect(addr1).mintEDFT();

        await cryptoBet.registerBetErc20(1);
        await cryptoBet.connect(addr1).registerBetErc20(2);
        await cryptoBet.connect(addr2).registerBet(1,  { value: ethers.utils.parseEther(BET_VALUE_ETH) });
        await cryptoBet.connect(addr3).registerBet(2,  { value: ethers.utils.parseEther(BET_VALUE_ETH) });

        expect(await cryptoBet.currentBetBalance()).to.equal(BN(BET_VALUE_WEI).add(BN(BET_VALUE_WEI)));
        expect(await cryptoBet.currentBetBalanceErc20()).to.equal(20);

        await cryptoBet.nextRound();

        const getBetOwner = await cryptoBet.getOneBetter(owner.address);
        const getBetAddr1 = await cryptoBet.getOneBetter(addr1.address);
        const getBetAddr2 = await cryptoBet.getOneBetter(addr2.address);
        const getBetAddr3 = await cryptoBet.getOneBetter(addr3.address);


        expect(getBetOwner.betValue).to.equal(BN(10));
        expect(getBetOwner.expectStatus).to.equal(1);
        expect(getBetOwner.betStatus).to.equal(2);
        expect(getBetOwner.balance).to.equal(BN(0));

        expect(getBetAddr1.betValue).to.equal(BN(10));
        expect(getBetAddr1.expectStatus).to.equal(2);
        expect(getBetAddr1.betStatus).to.equal(3);
        expect(getBetAddr1.balance).to.equal(BN(20));

        expect(getBetAddr2.betValue).to.equal(BN(BET_VALUE_WEI));
        expect(getBetAddr2.expectStatus).to.equal(1);
        expect(getBetAddr2.betStatus).to.equal(2);
        expect(getBetAddr2.balance).to.equal(BN(0));

        expect(getBetAddr3.betValue).to.equal(BN(BET_VALUE_WEI));
        expect(getBetAddr3.expectStatus).to.equal(2);
        expect(getBetAddr3.betStatus).to.equal(3);
        expect(getBetAddr3.balance).to.equal(BN(BET_VALUE_WEI).add(BN(BET_VALUE_WEI)));

        expect(await cryptoBet.currentBetBalance()).to.equal(0);
        expect(await cryptoBet.currentBetBalanceErc20()).to.equal(0);
      });
    })

    describe("claimBet() :", function () {
      it("should remove data ( LOOSE )", async function () {
        const { cryptoBet, owner } = await setupCryptoBet();
        expect(await cryptoBet.currentPriceFeed()).to.equal(0);
        await cryptoBet.registerBet(1, { value: ethers.utils.parseEther(BET_VALUE_ETH) });
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
        await cryptoBet.registerBet(2, { value: ethers.utils.parseEther(BET_VALUE_ETH) });
        await cryptoBet.nextRound();
        await cryptoBet.claimBet();

        const getBetOwner = await cryptoBet.getOneBetter(owner.address);
        expect(getBetOwner.betValue).to.equal(BN(0));
        expect(getBetOwner.expectStatus).to.equal(0);
        expect(getBetOwner.betStatus).to.equal(0);
        expect(getBetOwner.balance).to.equal(BN(0));
      });

      it("should remove data ( LOOSE ) ( use token )", async function () {
        const { cryptoBet, owner } = await setupCryptoBet();
        expect(await cryptoBet.currentPriceFeed()).to.equal(0);
        await cryptoBet.registerBetErc20(1);
        await cryptoBet.nextRound();
        await cryptoBet.claimBet();

        const getBetOwner = await cryptoBet.getOneBetter(owner.address);
        expect(getBetOwner.betValue).to.equal(BN(0));
        expect(getBetOwner.expectStatus).to.equal(0);
        expect(getBetOwner.betStatus).to.equal(0);
        expect(getBetOwner.balance).to.equal(BN(0));
      });

      it("should remove data ( WIN ) ( use token )", async function () {
        const { cryptoBet, owner } = await setupCryptoBet();
        expect(await cryptoBet.currentPriceFeed()).to.equal(0);
        await cryptoBet.registerBetErc20(2);
        await cryptoBet.nextRound();
        await cryptoBet.claimBet();

        const getBetOwner = await cryptoBet.getOneBetter(owner.address);
        expect(getBetOwner.betValue).to.equal(BN(0));
        expect(getBetOwner.expectStatus).to.equal(0);
        expect(getBetOwner.betStatus).to.equal(0);
        expect(getBetOwner.balance).to.equal(BN(0));
      });

      it("should remove data ( WIN 2 times ) ( use token )", async function () {
        const { cryptoBet, owner, addr1 } = await setupCryptoBet();
        expect(await cryptoBet.currentPriceFeed()).to.equal(0);
        await cryptoBet.registerBetErc20(2);
        await cryptoBet.nextRound();
        await cryptoBet.claimBet();

        const getBetOwner = await cryptoBet.getOneBetter(owner.address);
        expect(getBetOwner.betValue).to.equal(BN(0));
        expect(getBetOwner.expectStatus).to.equal(0);
        expect(getBetOwner.betStatus).to.equal(0);
        expect(getBetOwner.balance).to.equal(BN(0));

        await cryptoBet.connect(addr1).mintEDFT();
        await cryptoBet.connect(addr1).registerBetErc20(2);
        await cryptoBet.registerBetErc20(1);
        await cryptoBet.nextRound();
        await cryptoBet.claimBet();

        const getBetOwner2 = await cryptoBet.getOneBetter(owner.address);
        expect(getBetOwner2.betValue).to.equal(BN(0));
        expect(getBetOwner2.expectStatus).to.equal(0);
        expect(getBetOwner2.betStatus).to.equal(0);
        expect(getBetOwner2.balance).to.equal(BN(0));
      });
    })
  });

  describe("-> Events :", function () {
    describe("evt_newBet :", function () {
      it("trigger new bet event (first bet)", async function () {
        const { cryptoBet, owner } = await setupCryptoBet();

        await expect(cryptoBet.registerBet(2, { value: ethers.utils.parseEther(BET_VALUE_ETH) }))
          .to.emit(cryptoBet, "evt_newBet")
          .withArgs(owner.address, 1, BN(BET_VALUE_WEI), false);
      });

      it("trigger new bet event (second bet)", async function () {
        const { cryptoBet, addr1 } = await setupCryptoBet();
        await cryptoBet.registerBet(2, { value: ethers.utils.parseEther(BET_VALUE_ETH) });

        await expect(cryptoBet.connect(addr1).registerBet(2, { value: ethers.utils.parseEther(BET_VALUE_ETH) }))
          .to.emit(cryptoBet, "evt_newBet")
          .withArgs(addr1.address, 2, BN(BET_VALUE_WEI).add(BN(BET_VALUE_WEI)), false);
      });

      it("trigger new bet event (first bet - use token)", async function () {
        const { cryptoBet, owner } = await setupCryptoBet();

        await expect(cryptoBet.registerBetErc20(2))
          .to.emit(cryptoBet, "evt_newBet")
          .withArgs(owner.address, 1, BN(10), true);
      });

      it("trigger new bet event (second bet - use token)", async function () {
        const { cryptoBet, addr1 } = await setupCryptoBet();
        await cryptoBet.registerBetErc20(2);

        await cryptoBet.connect(addr1).mintEDFT();
        await expect(cryptoBet.connect(addr1).registerBetErc20(2))
          .to.emit(cryptoBet, "evt_newBet")
          .withArgs(addr1.address, 2, BN(20), true);
      });
    })

    describe("evt_betFinish :", function () {
      it("trigger bet finish event on win", async function () {
        const { cryptoBet, owner } = await setupCryptoBet();
        expect(await cryptoBet.currentPriceFeed()).to.equal(0);
        await cryptoBet.registerBet(2, { value: ethers.utils.parseEther(BET_VALUE_ETH) });
        await expect(cryptoBet.nextRound())
          .to.emit(cryptoBet, "evt_betFinish")
          .withArgs(owner.address, true);
      });

      it("trigger bet finish event on loose", async function () {
        const { cryptoBet, owner } = await setupCryptoBet();
        expect(await cryptoBet.currentPriceFeed()).to.equal(0);
        await cryptoBet.registerBet(1, { value: ethers.utils.parseEther(BET_VALUE_ETH) });
        await expect(cryptoBet.nextRound())
          .to.emit(cryptoBet, "evt_betFinish")
          .withArgs(owner.address, false);
      });

      it("trigger bet finish event on win (use token)", async function () {
        const { cryptoBet, owner } = await setupCryptoBet();
        expect(await cryptoBet.currentPriceFeed()).to.equal(0);
        await cryptoBet.registerBetErc20(2);
        await expect(cryptoBet.nextRound())
          .to.emit(cryptoBet, "evt_betFinish")
          .withArgs(owner.address, true);
      });

      it("trigger bet finish event on loose (use token)", async function () {
        const { cryptoBet, owner } = await setupCryptoBet();
        expect(await cryptoBet.currentPriceFeed()).to.equal(0);
        await cryptoBet.registerBetErc20(1);
        await expect(cryptoBet.nextRound())
          .to.emit(cryptoBet, "evt_betFinish")
          .withArgs(owner.address, false);
      });
    })

    describe("evt_nextRound :", function () {
      it("trigger next round with right data ( 1 winner 1 looser )", async function () {
        const { cryptoBet, addr1 } = await setupCryptoBet();
        expect(await cryptoBet.currentPriceFeed()).to.equal(0);
        await cryptoBet.registerBet(1, { value: ethers.utils.parseEther(BET_VALUE_ETH) });
        await cryptoBet.connect(addr1).registerBet(2, { value: ethers.utils.parseEther(BET_VALUE_ETH) });
        await expect(cryptoBet.nextRound())
          .to.emit(cryptoBet, "evt_nextRound")
          .withArgs(1, 0, 1, 0, await cryptoBet.currentPriceFeed());
      });

      it("trigger next round with right data ( 2 losers )", async function () {
        const { cryptoBet, addr1 } = await setupCryptoBet();
        expect(await cryptoBet.currentPriceFeed()).to.equal(0);
        await cryptoBet.registerBet(1, { value: ethers.utils.parseEther(BET_VALUE_ETH) });
        await cryptoBet.connect(addr1).registerBet(1, { value: ethers.utils.parseEther(BET_VALUE_ETH) });
        await expect(cryptoBet.nextRound())
          .to.emit(cryptoBet, "evt_nextRound")
          .withArgs(0, 0, 2, 0, await cryptoBet.currentPriceFeed());
      });

      it("trigger next round with right data ( 2 winners )", async function () {
        const { cryptoBet, addr1 } = await setupCryptoBet();
        expect(await cryptoBet.currentPriceFeed()).to.equal(0);
        await cryptoBet.registerBet(2, { value: ethers.utils.parseEther(BET_VALUE_ETH) });
        await cryptoBet.connect(addr1).registerBet(2, { value: ethers.utils.parseEther(BET_VALUE_ETH) });
        await expect(cryptoBet.nextRound())
          .to.emit(cryptoBet, "evt_nextRound")
          .withArgs(2, 0, 0, 0, await cryptoBet.currentPriceFeed());
      });

      it("trigger next round with right data ( 1 winner 1 looser ) (use token)", async function () {
        const { cryptoBet, addr1 } = await setupCryptoBet();
        expect(await cryptoBet.currentPriceFeed()).to.equal(0);
        await cryptoBet.connect(addr1).mintEDFT();

        await cryptoBet.registerBetErc20(1);
        await cryptoBet.connect(addr1).registerBetErc20(2);
        await expect(cryptoBet.nextRound())
          .to.emit(cryptoBet, "evt_nextRound")
          .withArgs(0, 1, 0, 1, await cryptoBet.currentPriceFeed());
      });

      it("trigger next round with right data ( 2 losers ) (use token)", async function () {
        const { cryptoBet, addr1 } = await setupCryptoBet();
        expect(await cryptoBet.currentPriceFeed()).to.equal(0);
        await cryptoBet.connect(addr1).mintEDFT();

        await cryptoBet.registerBetErc20(1);
        await cryptoBet.connect(addr1).registerBetErc20(1);
        await expect(cryptoBet.nextRound())
          .to.emit(cryptoBet, "evt_nextRound")
          .withArgs(0, 0, 0, 2, await cryptoBet.currentPriceFeed());
      });

      it("trigger next round with right data ( 2 winners ) (use token)", async function () {
        const { cryptoBet, addr1 } = await setupCryptoBet();
        expect(await cryptoBet.currentPriceFeed()).to.equal(0);
        await cryptoBet.connect(addr1).mintEDFT();

        await cryptoBet.registerBetErc20(2);
        await cryptoBet.connect(addr1).registerBetErc20(2);
        await expect(cryptoBet.nextRound())
          .to.emit(cryptoBet, "evt_nextRound")
          .withArgs(0, 2, 0, 0, await cryptoBet.currentPriceFeed());
      });

      it("trigger next round with right data (token and eth user)", async function () {
        const { cryptoBet, owner, addr1, addr2, addr3 } = await setupCryptoBet();

        expect(await cryptoBet.currentPriceFeed()).to.equal(0);
        // vote down always loose - vote up always win
        await cryptoBet.connect(addr1).mintEDFT();

        await cryptoBet.registerBetErc20(1);
        await cryptoBet.connect(addr1).registerBetErc20(2);
        await cryptoBet.connect(addr2).registerBet(1,  { value: ethers.utils.parseEther(BET_VALUE_ETH) });
        await cryptoBet.connect(addr3).registerBet(2,  { value: ethers.utils.parseEther(BET_VALUE_ETH) });

        expect(await cryptoBet.currentBetBalance()).to.equal(BN(BET_VALUE_WEI).add(BN(BET_VALUE_WEI)));
        expect(await cryptoBet.currentBetBalanceErc20()).to.equal(20);

        await expect(cryptoBet.nextRound())
          .to.emit(cryptoBet, "evt_nextRound")
          .withArgs(1, 1, 1, 1, await cryptoBet.currentPriceFeed());
      });
    })
  });

  describe("-> Reverts :", function () {
    describe("registerBet() :", function () {
      it("Should revert if user already betting", async function () {
        const { cryptoBet } = await setupCryptoBet();
        await cryptoBet.registerBet(2, { value: ethers.utils.parseEther(BET_VALUE_ETH) });

        await expect(cryptoBet.registerBet(2, { value: ethers.utils.parseEther(BET_VALUE_ETH) }))
        .to.be.revertedWith(
          "must not betting to execute this function"
        );
      });

      it("Should revert if user not send right value", async function () {
        const { cryptoBet } = await setupCryptoBet();

        await expect(cryptoBet.registerBet(2, { value: ethers.utils.parseEther("999") }))
        .to.be.revertedWith(
          "you must send exactly the bet value"
        );
      });

      it("Should revert if user already betting (use token)", async function () {
        const { cryptoBet } = await setupCryptoBet();
        await cryptoBet.registerBetErc20(2);

        await expect(cryptoBet.registerBetErc20(2))
        .to.be.revertedWith(
          "must not betting to execute this function"
        );
      });

      it("Should revert if user not have enough EDFT (use token)", async function () {
        const { cryptoBet, addr1 } = await setupCryptoBet();

        await expect(cryptoBet.connect(addr1).registerBetErc20(2))
        .to.be.revertedWith(
          "not enough EDFT"
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

    describe("mintEDFT() :", function () {
      it("Should revert if user has too much token", async function () {
        const { cryptoBet } = await setupCryptoBet();

        await expect(cryptoBet.mintEDFT())
        .to.be.revertedWith(
          "you have too much EDFT"
        );
      });
    })

    describe("drainTheFund() :", function () {
      it("Should revert if caller is not owner", async function () {
        const { cryptoBet, addr1 } = await setupCryptoBet();

        await expect(cryptoBet.connect(addr1).drainTheFund(ethers.utils.parseEther(BET_VALUE_ETH)))
        .to.be.revertedWith(
          "Ownable: caller is not the owner"
        );
      });
    })
  });

  describe("-> Value transfers", function () {
    it("Should transfer right funds to the caller ( 1 ETH )", async function () {
      const { cryptoBet, owner } = await setupCryptoBet();
      expect(await cryptoBet.currentPriceFeed()).to.equal(0);
      await cryptoBet.registerBet(2, { value: ethers.utils.parseEther(BET_VALUE_ETH) });
      await cryptoBet.nextRound();

      const getBetOwner = await cryptoBet.getOneBetter(owner.address);
      // expect(getBetOwner.balance).to.equal(BN(BET_VALUE_WEI));
        
      await expect(cryptoBet.claimBet()).to.changeEtherBalances(
        [owner, cryptoBet],
        [900000000000000000n, -900000000000000000n]
      );
    });

    it("Should transfer right funds to the caller ( 2 ETH )", async function () {
      const { cryptoBet, owner, addr1 } = await setupCryptoBet();
      expect(await cryptoBet.currentPriceFeed()).to.equal(0);
      await cryptoBet.registerBet(2, { value: ethers.utils.parseEther(BET_VALUE_ETH) });
      await cryptoBet.connect(addr1).registerBet(1, { value: ethers.utils.parseEther(BET_VALUE_ETH) });
      await cryptoBet.nextRound();

      const getBetOwner = await cryptoBet.getOneBetter(owner.address);
      expect(getBetOwner.balance).to.equal(BN(BET_VALUE_WEI).add(BN(BET_VALUE_WEI)));
        
      await expect(cryptoBet.claimBet()).to.changeEtherBalances(
        [owner, cryptoBet],
        [1800000000000000000n, -1800000000000000000n]
      );
    });

    it("Should drain right funds to the owner", async function () {
      const { cryptoBet, owner, addr1 } = await setupCryptoBet();
      expect(await cryptoBet.currentPriceFeed()).to.equal(0);
      await cryptoBet.registerBet(1, { value: ethers.utils.parseEther(BET_VALUE_ETH) });
      await cryptoBet.nextRound();

      const getBetOwner = await cryptoBet.getOneBetter(owner.address);
      expect(getBetOwner.balance).to.equal(0);
        
      await expect(cryptoBet.drainTheFund(1)).to.changeEtherBalances(
        [owner, cryptoBet],
        [1, -1]
      );
    });

    it("Should transfer right ERC20 to the caller ( 10 EDFT )", async function () {
      const { cryptoBet, addr1 } = await setupCryptoBet();
      await cryptoBet.connect(addr1).mintEDFT();

      const balance1 = await cryptoBet.connect(addr1).balanceOf(addr1.address);
      expect(balance1).to.equal(BN("30000000000000000000"));

      expect(await cryptoBet.connect(addr1).currentPriceFeed()).to.equal(0);
      await cryptoBet.connect(addr1).registerBetErc20(2);

      const balance2 = await cryptoBet.connect(addr1).balanceOf(addr1.address);
      expect(balance2).to.equal(BN("20000000000000000000"));

      await cryptoBet.nextRound();
      const getBetOwner = await cryptoBet.connect(addr1).getOneBetter(addr1.address);
      expect(getBetOwner.balance).to.equal(10);
        
      await cryptoBet.connect(addr1).claimBet();
      const balance3 = await cryptoBet.connect(addr1).balanceOf(addr1.address);
      expect(balance3).to.equal(BN("30000000000000000000"));
    });
  });
});
