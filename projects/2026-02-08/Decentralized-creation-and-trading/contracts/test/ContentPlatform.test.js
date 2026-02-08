const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("ContentPlatform", function () {
  let contentToken;
  let contentPlatform;
  let owner;
  let creator;
  let user1;
  let user2;

  beforeEach(async function () {
    [owner, creator, user1, user2] = await ethers.getSigners();

    // 部署ContentToken
    const ContentToken = await ethers.getContractFactory("ContentToken");
    contentToken = await ContentToken.deploy(owner.address);
    await contentToken.waitForDeployment();

    // 部署ContentPlatform
    const ContentPlatform = await ethers.getContractFactory("ContentPlatform");
    contentPlatform = await ContentPlatform.deploy(
      await contentToken.getAddress(),
      owner.address
    );
    await contentPlatform.waitForDeployment();

    // 向平台合约转入代币
    const transferAmount = ethers.parseEther("10000000");
    await contentToken.transfer(await contentPlatform.getAddress(), transferAmount);
  });

  describe("部署", function () {
    it("应该正确设置平台代币地址", async function () {
      expect(await contentPlatform.platformToken()).to.equal(await contentToken.getAddress());
    });

    it("应该正确初始化分润配置", async function () {
      const config = await contentPlatform.revenueConfig();
      expect(config.likeReward).to.equal(ethers.parseEther("10"));
      expect(config.shareReward).to.equal(ethers.parseEther("50"));
      expect(config.creatorShare).to.equal(80);
      expect(config.platformFee).to.equal(20);
    });
  });

  describe("内容发布", function () {
    it("应该能成功发布内容", async function () {
      const ipfsHash = "QmTest123456789";
      const tx = await contentPlatform.connect(creator).publishContent(ipfsHash);
      const receipt = await tx.wait();

      expect(await contentPlatform.contentCounter()).to.equal(1);
      
      const content = await contentPlatform.getContent(1);
      expect(content.creator).to.equal(creator.address);
      expect(content.ipfsHash).to.equal(ipfsHash);
      expect(content.likes).to.equal(0);
      expect(content.shares).to.equal(0);
    });

    it("不能发布空的IPFS哈希", async function () {
      await expect(
        contentPlatform.connect(creator).publishContent("")
      ).to.be.revertedWith("IPFS hash cannot be empty");
    });

    it("应该正确记录用户发布的内容", async function () {
      await contentPlatform.connect(creator).publishContent("QmTest1");
      await contentPlatform.connect(creator).publishContent("QmTest2");
      
      const userContents = await contentPlatform.getUserContents(creator.address);
      expect(userContents.length).to.equal(2);
      expect(userContents[0]).to.equal(1);
      expect(userContents[1]).to.equal(2);
    });
  });

  describe("点赞功能", function () {
    let contentId;

    beforeEach(async function () {
      const tx = await contentPlatform.connect(creator).publishContent("QmTest");
      await tx.wait();
      contentId = 1;
    });

    it("应该能成功点赞内容", async function () {
      await contentPlatform.connect(user1).likeContent(contentId);
      
      const content = await contentPlatform.getContent(contentId);
      expect(content.likes).to.equal(1);
      expect(await contentPlatform.hasLiked(contentId, user1.address)).to.be.true;
    });

    it("应该正确分配点赞奖励", async function () {
      const initialBalance = await contentToken.balanceOf(creator.address);
      
      await contentPlatform.connect(user1).likeContent(contentId);
      
      const finalBalance = await contentToken.balanceOf(creator.address);
      const expectedReward = ethers.parseEther("10") * BigInt(80) / BigInt(100); // 80%
      
      expect(finalBalance - initialBalance).to.equal(expectedReward);
    });

    it("不能重复点赞", async function () {
      await contentPlatform.connect(user1).likeContent(contentId);
      
      await expect(
        contentPlatform.connect(user1).likeContent(contentId)
      ).to.be.revertedWith("Already liked");
    });

    it("创作者不能点赞自己的内容", async function () {
      await expect(
        contentPlatform.connect(creator).likeContent(contentId)
      ).to.be.revertedWith("Cannot like own content");
    });

    it("不能点赞不存在的内容", async function () {
      await expect(
        contentPlatform.connect(user1).likeContent(999)
      ).to.be.revertedWith("Content does not exist");
    });
  });

  describe("分享功能", function () {
    let contentId;

    beforeEach(async function () {
      const tx = await contentPlatform.connect(creator).publishContent("QmTest");
      await tx.wait();
      contentId = 1;
    });

    it("应该能成功分享内容", async function () {
      await contentPlatform.connect(user1).shareContent(contentId);
      
      const content = await contentPlatform.getContent(contentId);
      expect(content.shares).to.equal(1);
      expect(await contentPlatform.hasShared(contentId, user1.address)).to.be.true;
    });

    it("应该正确分配分享奖励", async function () {
      const creatorInitialBalance = await contentToken.balanceOf(creator.address);
      const sharerInitialBalance = await contentToken.balanceOf(user1.address);
      
      await contentPlatform.connect(user1).shareContent(contentId);
      
      const creatorFinalBalance = await contentToken.balanceOf(creator.address);
      const sharerFinalBalance = await contentToken.balanceOf(user1.address);
      
      const baseReward = ethers.parseEther("50") * BigInt(80) / BigInt(100); // 80%
      const sharerReward = baseReward / BigInt(10); // 10%
      const creatorReward = baseReward - sharerReward;
      
      expect(creatorFinalBalance - creatorInitialBalance).to.equal(creatorReward);
      expect(sharerFinalBalance - sharerInitialBalance).to.equal(sharerReward);
    });

    it("不能重复分享", async function () {
      await contentPlatform.connect(user1).shareContent(contentId);
      
      await expect(
        contentPlatform.connect(user1).shareContent(contentId)
      ).to.be.revertedWith("Already shared");
    });

    it("创作者不能分享自己的内容", async function () {
      await expect(
        contentPlatform.connect(creator).shareContent(contentId)
      ).to.be.revertedWith("Cannot share own content");
    });
  });

  describe("分润配置更新", function () {
    it("所有者应该能更新分润配置", async function () {
      await contentPlatform.updateRevenueConfig(
        ethers.parseEther("20"),
        ethers.parseEther("100"),
        70,
        30
      );

      const config = await contentPlatform.revenueConfig();
      expect(config.likeReward).to.equal(ethers.parseEther("20"));
      expect(config.shareReward).to.equal(ethers.parseEther("100"));
      expect(config.creatorShare).to.equal(70);
      expect(config.platformFee).to.equal(30);
    });

    it("非所有者不能更新分润配置", async function () {
      await expect(
        contentPlatform.connect(user1).updateRevenueConfig(
          ethers.parseEther("20"),
          ethers.parseEther("100"),
          70,
          30
        )
      ).to.be.reverted;
    });

    it("分成比例之和必须等于100", async function () {
      await expect(
        contentPlatform.updateRevenueConfig(
          ethers.parseEther("20"),
          ethers.parseEther("100"),
          70,
          40
        )
      ).to.be.revertedWith("Shares must sum to 100");
    });
  });

  describe("代币管理", function () {
    it("所有者应该能提取代币", async function () {
      const withdrawAmount = ethers.parseEther("1000");
      const initialBalance = await contentToken.balanceOf(owner.address);
      
      await contentPlatform.withdrawTokens(withdrawAmount);
      
      const finalBalance = await contentToken.balanceOf(owner.address);
      expect(finalBalance - initialBalance).to.equal(withdrawAmount);
    });

    it("应该能查询合约代币余额", async function () {
      const balance = await contentPlatform.getContractBalance();
      expect(balance).to.equal(ethers.parseEther("10000000"));
    });
  });

  describe("综合场景", function () {
    it("完整的内容发布和互动流程", async function () {
      // 发布内容
      await contentPlatform.connect(creator).publishContent("QmTest");
      const contentId = 1;

      // 多个用户点赞
      await contentPlatform.connect(user1).likeContent(contentId);
      await contentPlatform.connect(user2).likeContent(contentId);

      // 用户分享
      await contentPlatform.connect(user1).shareContent(contentId);

      // 验证最终状态
      const content = await contentPlatform.getContent(contentId);
      expect(content.likes).to.equal(2);
      expect(content.shares).to.equal(1);
      expect(content.totalEarnings).to.be.greaterThan(0);
    });
  });
});
