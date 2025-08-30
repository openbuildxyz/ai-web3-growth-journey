import { expect } from "chai";
import { ethers } from "hardhat";
import { ForgeToken, ForgeFaucet } from "../typechain-types";
import { Signer } from "ethers";
import { time } from "@nomicfoundation/hardhat-network-helpers";

describe("ForgeFaucet", function () {
    let forgeToken: ForgeToken;
    let faucet: ForgeFaucet;
    let owner: Signer;
    let addr1: Signer;
    let addr2: Signer;

    const FAUCET_AMOUNT = ethers.parseEther("100");
    const COOLDOWN_PERIOD = 3600; // 1 hour

    beforeEach(async function () {
        [owner, addr1, addr2] = await ethers.getSigners();

        // Deploy ForgeToken
        const ForgeTokenFactory = await ethers.getContractFactory("ForgeToken");
        forgeToken = await ForgeTokenFactory.deploy();
        await forgeToken.waitForDeployment();

        // Deploy ForgeFaucet
        const FaucetFactory = await ethers.getContractFactory("ForgeFaucet");
        faucet = await FaucetFactory.deploy(await forgeToken.getAddress());
        await faucet.waitForDeployment();

        // Fund the faucet with tokens
        const faucetAddress = await faucet.getAddress();
        await forgeToken.mint(faucetAddress, ethers.parseEther("10000"));
    });

    describe("Deployment", function () {
        it("Should set the correct forge token address", async function () {
            expect(await faucet.forgeToken()).to.equal(await forgeToken.getAddress());
        });

        it("Should set the correct owner", async function () {
            expect(await faucet.owner()).to.equal(await owner.getAddress());
        });

        it("Should have correct constants", async function () {
            expect(await faucet.FAUCET_AMOUNT()).to.equal(FAUCET_AMOUNT);
            expect(await faucet.COOLDOWN_PERIOD()).to.equal(COOLDOWN_PERIOD);
        });

        it("Should not be paused by default", async function () {
            expect(await faucet.paused()).to.equal(false);
        });

        it("Should revert if token address is zero", async function () {
            const FaucetFactory = await ethers.getContractFactory("ForgeFaucet");
            await expect(
                FaucetFactory.deploy(ethers.ZeroAddress)
            ).to.be.revertedWith("ForgeFaucet: token address cannot be zero");
        });
    });

    describe("Token claiming", function () {
        it("Should allow user to claim tokens", async function () {
            const addr1Address = await addr1.getAddress();

            await expect(faucet.connect(addr1).claimTokens())
                .to.emit(faucet, "TokensClaimed")
                .withArgs(addr1Address, FAUCET_AMOUNT);

            expect(await forgeToken.balanceOf(addr1Address)).to.equal(FAUCET_AMOUNT);
            expect(await faucet.totalClaimed(addr1Address)).to.equal(FAUCET_AMOUNT);
            expect(await faucet.totalDispensed()).to.equal(FAUCET_AMOUNT);
        });

        it("Should not allow claiming before cooldown period", async function () {
            const addr1Address = await addr1.getAddress();

            // First claim
            await faucet.connect(addr1).claimTokens();

            // Try to claim again immediately
            await expect(
                faucet.connect(addr1).claimTokens()
            ).to.be.revertedWith("ForgeFaucet: cooldown period not elapsed");
        });

        it("Should allow claiming after cooldown period", async function () {
            const addr1Address = await addr1.getAddress();

            // First claim
            await faucet.connect(addr1).claimTokens();

            // Fast forward time by 1 hour
            await time.increase(COOLDOWN_PERIOD);

            // Second claim should work
            await expect(faucet.connect(addr1).claimTokens())
                .to.emit(faucet, "TokensClaimed")
                .withArgs(addr1Address, FAUCET_AMOUNT);

            expect(await forgeToken.balanceOf(addr1Address)).to.equal(FAUCET_AMOUNT * 2n);
            expect(await faucet.totalClaimed(addr1Address)).to.equal(FAUCET_AMOUNT * 2n);
        });

        it("Should revert if faucet has insufficient balance", async function () {
            // Deploy new faucet without funding it
            const FaucetFactory = await ethers.getContractFactory("ForgeFaucet");
            const emptyFaucet = await FaucetFactory.deploy(await forgeToken.getAddress());
            await emptyFaucet.waitForDeployment();

            await expect(
                emptyFaucet.connect(addr1).claimTokens()
            ).to.be.revertedWith("ForgeFaucet: insufficient faucet balance");
        });

        it("Should not allow claiming when paused", async function () {
            await faucet.pause();

            await expect(
                faucet.connect(addr1).claimTokens()
            ).to.be.revertedWith("ForgeFaucet: faucet is paused");
        });

        it("Should track multiple users correctly", async function () {
            const addr1Address = await addr1.getAddress();
            const addr2Address = await addr2.getAddress();

            // Both users claim
            await faucet.connect(addr1).claimTokens();
            await faucet.connect(addr2).claimTokens();

            expect(await forgeToken.balanceOf(addr1Address)).to.equal(FAUCET_AMOUNT);
            expect(await forgeToken.balanceOf(addr2Address)).to.equal(FAUCET_AMOUNT);
            expect(await faucet.totalDispensed()).to.equal(FAUCET_AMOUNT * 2n);
        });
    });

    describe("Claim status checks", function () {
        it("Should correctly report if user can claim", async function () {
            const addr1Address = await addr1.getAddress();

            // Initially should be able to claim
            expect(await faucet.canClaim(addr1Address)).to.equal(true);

            // After claiming, should not be able to claim
            await faucet.connect(addr1).claimTokens();
            expect(await faucet.canClaim(addr1Address)).to.equal(false);

            // After cooldown, should be able to claim again
            await time.increase(COOLDOWN_PERIOD);
            expect(await faucet.canClaim(addr1Address)).to.equal(true);
        });

        it("Should correctly report time until next claim", async function () {
            const addr1Address = await addr1.getAddress();

            // Initially should return 0
            expect(await faucet.timeUntilNextClaim(addr1Address)).to.equal(0);

            // After claiming, should return the cooldown period
            await faucet.connect(addr1).claimTokens();
            const timeUntilNext = await faucet.timeUntilNextClaim(addr1Address);
            expect(timeUntilNext).to.be.greaterThan(0);
            expect(timeUntilNext).to.be.at.most(COOLDOWN_PERIOD);
        });
    });

    describe("Admin functions", function () {
        it("Should allow owner to pause and unpause", async function () {
            // Pause
            await expect(faucet.pause())
                .to.emit(faucet, "FaucetPaused");
            expect(await faucet.paused()).to.equal(true);

            // Unpause
            await expect(faucet.unpause())
                .to.emit(faucet, "FaucetUnpaused");
            expect(await faucet.paused()).to.equal(false);
        });

        it("Should not allow non-owner to pause", async function () {
            await expect(
                faucet.connect(addr1).pause()
            ).to.be.revertedWith("Ownable: caller is not the owner");
        });

        it("Should allow owner to emergency withdraw", async function () {
            const ownerAddress = await owner.getAddress();
            const faucetAddress = await faucet.getAddress();
            const withdrawAmount = ethers.parseEther("1000");

            const initialOwnerBalance = await forgeToken.balanceOf(ownerAddress);
            const initialFaucetBalance = await forgeToken.balanceOf(faucetAddress);

            await expect(faucet.emergencyWithdraw(await forgeToken.getAddress(), withdrawAmount))
                .to.emit(faucet, "EmergencyWithdraw")
                .withArgs(await forgeToken.getAddress(), withdrawAmount);

            expect(await forgeToken.balanceOf(ownerAddress)).to.equal(
                initialOwnerBalance + withdrawAmount
            );
            expect(await forgeToken.balanceOf(faucetAddress)).to.equal(
                initialFaucetBalance - withdrawAmount
            );
        });

        it("Should not allow non-owner to emergency withdraw", async function () {
            await expect(
                faucet.connect(addr1).emergencyWithdraw(await forgeToken.getAddress(), ethers.parseEther("1000"))
            ).to.be.revertedWith("Ownable: caller is not the owner");
        });

        it("Should not allow emergency withdraw with zero address", async function () {
            await expect(
                faucet.emergencyWithdraw(ethers.ZeroAddress, ethers.parseEther("1000"))
            ).to.be.revertedWith("ForgeFaucet: token address cannot be zero");
        });

        it("Should not allow emergency withdraw with zero amount", async function () {
            await expect(
                faucet.emergencyWithdraw(await forgeToken.getAddress(), 0)
            ).to.be.revertedWith("ForgeFaucet: amount must be positive");
        });
    });

    describe("Statistics", function () {
        it("Should return correct faucet stats", async function () {
            const addr1Address = await addr1.getAddress();

            // Initial stats
            let stats = await faucet.getFaucetStats();
            expect(stats.faucetBalance).to.equal(ethers.parseEther("10000"));
            expect(stats.totalDispensedAmount).to.equal(0);
            expect(stats.isPaused).to.equal(false);

            // After one claim
            await faucet.connect(addr1).claimTokens();
            stats = await faucet.getFaucetStats();
            expect(stats.faucetBalance).to.equal(ethers.parseEther("10000") - FAUCET_AMOUNT);
            expect(stats.totalDispensedAmount).to.equal(FAUCET_AMOUNT);
            expect(stats.isPaused).to.equal(false);
        });

        it("Should return correct user stats", async function () {
            const addr1Address = await addr1.getAddress();

            // Initial stats
            let userStats = await faucet.getUserStats(addr1Address);
            expect(userStats.userTotalClaimed).to.equal(0);
            expect(userStats.userLastClaimTime).to.equal(0);
            expect(userStats.userCanClaimNow).to.equal(true);

            // After claim
            await faucet.connect(addr1).claimTokens();
            userStats = await faucet.getUserStats(addr1Address);
            expect(userStats.userTotalClaimed).to.equal(FAUCET_AMOUNT);
            expect(userStats.userLastClaimTime).to.be.greaterThan(0);
            expect(userStats.userCanClaimNow).to.equal(false);
        });
    });
});
