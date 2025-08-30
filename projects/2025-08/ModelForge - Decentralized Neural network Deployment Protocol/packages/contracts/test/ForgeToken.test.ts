import { expect } from "chai";
import { ethers } from "hardhat";
import { ForgeToken } from "../typechain-types";
import { Signer } from "ethers";

describe("ForgeToken", function () {
    let forgeToken: ForgeToken;
    let owner: Signer;
    let addr1: Signer;
    let addr2: Signer;

    beforeEach(async function () {
        [owner, addr1, addr2] = await ethers.getSigners();

        const ForgeTokenFactory = await ethers.getContractFactory("ForgeToken");
        forgeToken = await ForgeTokenFactory.deploy();
        await forgeToken.waitForDeployment();
    });

    describe("Deployment", function () {
        it("Should set the right owner", async function () {
            expect(await forgeToken.owner()).to.equal(await owner.getAddress());
        });

        it("Should assign the total supply of tokens to the owner", async function () {
            const ownerBalance = await forgeToken.balanceOf(await owner.getAddress());
            expect(await forgeToken.totalSupply()).to.equal(ownerBalance);
        });

        it("Should have correct name, symbol, and decimals", async function () {
            expect(await forgeToken.name()).to.equal("ModelForge Token");
            expect(await forgeToken.symbol()).to.equal("FORGE");
            expect(await forgeToken.decimals()).to.equal(18);
        });

        it("Should have the correct initial supply", async function () {
            const expectedSupply = ethers.parseEther("1000000"); // 1 million FORGE
            expect(await forgeToken.totalSupply()).to.equal(expectedSupply);
            expect(await forgeToken.INITIAL_SUPPLY()).to.equal(expectedSupply);
        });
    });

    describe("Minting", function () {
        it("Should allow owner to mint tokens", async function () {
            const mintAmount = ethers.parseEther("1000");
            const addr1Address = await addr1.getAddress();

            await expect(forgeToken.mint(addr1Address, mintAmount))
                .to.emit(forgeToken, "TokensMinted")
                .withArgs(addr1Address, mintAmount);

            expect(await forgeToken.balanceOf(addr1Address)).to.equal(mintAmount);
        });

        it("Should not allow non-owner to mint tokens", async function () {
            const mintAmount = ethers.parseEther("1000");
            const addr2Address = await addr2.getAddress();

            await expect(
                forgeToken.connect(addr1).mint(addr2Address, mintAmount)
            ).to.be.revertedWith("Ownable: caller is not the owner");
        });

        it("Should not allow minting to zero address", async function () {
            const mintAmount = ethers.parseEther("1000");

            await expect(
                forgeToken.mint(ethers.ZeroAddress, mintAmount)
            ).to.be.revertedWith("ForgeToken: mint to zero address");
        });

        it("Should not allow minting zero amount", async function () {
            const addr1Address = await addr1.getAddress();

            await expect(
                forgeToken.mint(addr1Address, 0)
            ).to.be.revertedWith("ForgeToken: mint amount must be positive");
        });

        it("Should update total supply after minting", async function () {
            const initialSupply = await forgeToken.totalSupply();
            const mintAmount = ethers.parseEther("1000");
            const addr1Address = await addr1.getAddress();

            await forgeToken.mint(addr1Address, mintAmount);

            expect(await forgeToken.totalSupply()).to.equal(initialSupply + mintAmount);
        });
    });

    describe("Standard ERC20 functionality", function () {
        beforeEach(async function () {
            // Give addr1 some tokens for testing
            const addr1Address = await addr1.getAddress();
            await forgeToken.mint(addr1Address, ethers.parseEther("1000"));
        });

        it("Should transfer tokens between accounts", async function () {
            const transferAmount = ethers.parseEther("500");
            const addr1Address = await addr1.getAddress();
            const addr2Address = await addr2.getAddress();

            await expect(
                forgeToken.connect(addr1).transfer(addr2Address, transferAmount)
            ).to.changeTokenBalances(
                forgeToken,
                [addr1, addr2],
                [-transferAmount, transferAmount]
            );
        });

        it("Should not transfer more than balance", async function () {
            const addr1Address = await addr1.getAddress();
            const addr2Address = await addr2.getAddress();
            const balance = await forgeToken.balanceOf(addr1Address);
            const transferAmount = balance + ethers.parseEther("1");

            await expect(
                forgeToken.connect(addr1).transfer(addr2Address, transferAmount)
            ).to.be.revertedWith("ERC20: transfer amount exceeds balance");
        });
    });
});
