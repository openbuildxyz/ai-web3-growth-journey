const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("ContentToken", function () {
  let contentToken;
  let owner;
  let minter;
  let user1;
  let user2;

  beforeEach(async function () {
    [owner, minter, user1, user2] = await ethers.getSigners();
    
    const ContentToken = await ethers.getContractFactory("ContentToken");
    contentToken = await ContentToken.deploy(owner.address);
    await contentToken.waitForDeployment();
  });

  describe("部署", function () {
    it("应该正确设置代币名称和符号", async function () {
      expect(await contentToken.name()).to.equal("Content Platform Token");
      expect(await contentToken.symbol()).to.equal("CPT");
    });

    it("应该给所有者铸造初始供应量", async function () {
      const initialSupply = ethers.parseEther("100000000");
      expect(await contentToken.balanceOf(owner.address)).to.equal(initialSupply);
    });

    it("应该将所有者设置为初始铸币者", async function () {
      expect(await contentToken.minters(owner.address)).to.be.true;
    });
  });

  describe("铸币权限管理", function () {
    it("所有者应该能添加新铸币者", async function () {
      await contentToken.addMinter(minter.address);
      expect(await contentToken.minters(minter.address)).to.be.true;
    });

    it("非所有者不能添加铸币者", async function () {
      await expect(
        contentToken.connect(user1).addMinter(minter.address)
      ).to.be.reverted;
    });

    it("所有者应该能移除铸币者", async function () {
      await contentToken.addMinter(minter.address);
      await contentToken.removeMinter(minter.address);
      expect(await contentToken.minters(minter.address)).to.be.false;
    });

    it("不能添加零地址为铸币者", async function () {
      await expect(
        contentToken.addMinter(ethers.ZeroAddress)
      ).to.be.revertedWith("Invalid minter address");
    });
  });

  describe("铸币功能", function () {
    beforeEach(async function () {
      await contentToken.addMinter(minter.address);
    });

    it("铸币者应该能铸造代币", async function () {
      const amount = ethers.parseEther("1000");
      await contentToken.connect(minter).mint(user1.address, amount);
      expect(await contentToken.balanceOf(user1.address)).to.equal(amount);
    });

    it("非铸币者不能铸造代币", async function () {
      const amount = ethers.parseEther("1000");
      await expect(
        contentToken.connect(user1).mint(user2.address, amount)
      ).to.be.revertedWith("Caller is not a minter");
    });

    it("不能铸造到零地址", async function () {
      const amount = ethers.parseEther("1000");
      await expect(
        contentToken.connect(minter).mint(ethers.ZeroAddress, amount)
      ).to.be.revertedWith("Cannot mint to zero address");
    });
  });

  describe("销毁功能", function () {
    it("用户应该能销毁自己的代币", async function () {
      const transferAmount = ethers.parseEther("1000");
      await contentToken.transfer(user1.address, transferAmount);
      
      const burnAmount = ethers.parseEther("500");
      await contentToken.connect(user1).burn(burnAmount);
      
      expect(await contentToken.balanceOf(user1.address)).to.equal(
        transferAmount - burnAmount
      );
    });

    it("销毁超过余额的代币应该失败", async function () {
      const burnAmount = ethers.parseEther("1");
      await expect(
        contentToken.connect(user1).burn(burnAmount)
      ).to.be.reverted;
    });
  });

  describe("代币转账", function () {
    it("应该能正常转账", async function () {
      const amount = ethers.parseEther("1000");
      await contentToken.transfer(user1.address, amount);
      expect(await contentToken.balanceOf(user1.address)).to.equal(amount);
    });

    it("转账超过余额应该失败", async function () {
      const amount = ethers.parseEther("1000");
      await expect(
        contentToken.connect(user1).transfer(user2.address, amount)
      ).to.be.reverted;
    });
  });
});
