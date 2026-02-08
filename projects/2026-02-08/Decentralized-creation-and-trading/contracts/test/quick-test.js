// 快速测试脚本 - 验证核心功能
// 运行方式: npx hardhat test test/quick-test.js

const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("🚀 快速功能演示", function () {
  let contentToken, contentPlatform;
  let owner, creator, user1, user2;

  before(async function () {
    console.log("\n========================================");
    console.log("  代币经济与分润系统 - 快速测试");
    console.log("========================================\n");

    [owner, creator, user1, user2] = await ethers.getSigners();

    // 部署代币合约
    console.log("📝 正在部署 ContentToken...");
    const ContentToken = await ethers.getContractFactory("ContentToken");
    contentToken = await ContentToken.deploy(owner.address);
    await contentToken.waitForDeployment();
    console.log("✅ ContentToken 已部署:", await contentToken.getAddress());

    // 部署平台合约
    console.log("📝 正在部署 ContentPlatform...");
    const ContentPlatform = await ethers.getContractFactory("ContentPlatform");
    contentPlatform = await ContentPlatform.deploy(
      await contentToken.getAddress(),
      owner.address
    );
    await contentPlatform.waitForDeployment();
    console.log("✅ ContentPlatform 已部署:", await contentPlatform.getAddress());

    // 转入代币到平台
    const transferAmount = ethers.parseEther("1000000");
    await contentToken.transfer(await contentPlatform.getAddress(), transferAmount);
    console.log("✅ 已转入", ethers.formatEther(transferAmount), "CPT 到平台\n");
  });

  it("🎬 完整流程演示", async function () {
    console.log("----------------------------------------");
    console.log("场景: 创作者发布内容，用户互动");
    console.log("----------------------------------------\n");

    // 1. 发布内容
    console.log("📝 步骤1: 创作者发布内容");
    const ipfsHash = "QmExampleHash123456789";
    const tx1 = await contentPlatform.connect(creator).publishContent(ipfsHash);
    await tx1.wait();
    console.log("  ✅ 内容ID: 1");
    console.log("  ✅ IPFS: " + ipfsHash);

    // 查询初始状态
    let content = await contentPlatform.getContent(1);
    console.log("  ✅ 创作者:", content.creator);
    console.log();

    // 2. 用户1点赞
    console.log("👍 步骤2: 用户1点赞内容");
    const creatorBalanceBefore = await contentToken.balanceOf(creator.address);
    console.log("  点赞前创作者余额:", ethers.formatEther(creatorBalanceBefore), "CPT");

    const tx2 = await contentPlatform.connect(user1).likeContent(1);
    await tx2.wait();

    const creatorBalanceAfter = await contentToken.balanceOf(creator.address);
    const reward1 = creatorBalanceAfter - creatorBalanceBefore;
    console.log("  点赞后创作者余额:", ethers.formatEther(creatorBalanceAfter), "CPT");
    console.log("  ✅ 创作者获得奖励:", ethers.formatEther(reward1), "CPT");
    console.log();

    // 验证点赞奖励
    expect(reward1).to.equal(ethers.parseEther("8")); // 10 * 80% = 8

    // 3. 用户2点赞
    console.log("👍 步骤3: 用户2也点赞内容");
    const tx3 = await contentPlatform.connect(user2).likeContent(1);
    await tx3.wait();

    const creatorBalanceAfter2 = await contentToken.balanceOf(creator.address);
    const totalReward = creatorBalanceAfter2 - creatorBalanceBefore;
    console.log("  ✅ 创作者累计收益:", ethers.formatEther(totalReward), "CPT");
    console.log();

    // 4. 用户1分享
    console.log("🔄 步骤4: 用户1分享内容");
    const creatorBalance3 = await contentToken.balanceOf(creator.address);
    const sharerBalanceBefore = await contentToken.balanceOf(user1.address);

    const tx4 = await contentPlatform.connect(user1).shareContent(1);
    await tx4.wait();

    const creatorBalance4 = await contentToken.balanceOf(creator.address);
    const sharerBalanceAfter = await contentToken.balanceOf(user1.address);

    const creatorShareReward = creatorBalance4 - creatorBalance3;
    const sharerReward = sharerBalanceAfter - sharerBalanceBefore;

    console.log("  ✅ 创作者获得:", ethers.formatEther(creatorShareReward), "CPT");
    console.log("  ✅ 分享者获得:", ethers.formatEther(sharerReward), "CPT");
    console.log();

    // 验证分享奖励
    expect(creatorShareReward).to.equal(ethers.parseEther("36")); // 50 * 80% * 90%
    expect(sharerReward).to.equal(ethers.parseEther("4")); // 50 * 80% * 10%

    // 5. 查询最终状态
    console.log("📊 步骤5: 查询最终内容状态");
    content = await contentPlatform.getContent(1);

    console.log("  点赞数:", content.likes.toString());
    console.log("  分享数:", content.shares.toString());
    console.log("  总收益:", ethers.formatEther(content.totalEarnings), "CPT");
    console.log();

    // 验证最终状态
    expect(content.likes).to.equal(2);
    expect(content.shares).to.equal(1);
    expect(content.totalEarnings).to.equal(ethers.parseEther("52")); // 8 + 8 + 36

    console.log("========================================");
    console.log("  ✨ 所有功能测试通过！");
    console.log("========================================\n");
  });

  it("🔄 多用户互动场景", async function () {
    console.log("----------------------------------------");
    console.log("场景: 多个内容，多用户互动");
    console.log("----------------------------------------\n");

    // 发布3个内容
    console.log("📝 创作者发布3个内容...");
    for (let i = 2; i <= 4; i++) {
      await contentPlatform.connect(creator).publishContent(`QmHash${i}`);
      console.log(`  ✅ 内容${i}已发布`);
    }
    console.log();

    // 用户1点赞所有内容
    console.log("👍 用户1点赞所有内容...");
    for (let i = 2; i <= 4; i++) {
      await contentPlatform.connect(user1).likeContent(i);
    }
    console.log("  ✅ 已点赞3个内容");
    console.log();

    // 查询创作者的所有内容
    console.log("📊 查询创作者的所有内容...");
    const userContents = await contentPlatform.getUserContents(creator.address);
    console.log("  ✅ 创作者共发布:", userContents.length, "个内容");
    console.log();

    expect(userContents.length).to.equal(4);
  });

  it("💰 代币余额查询", async function () {
    console.log("----------------------------------------");
    console.log("查询各方代币余额");
    console.log("----------------------------------------\n");

    const creatorBalance = await contentToken.balanceOf(creator.address);
    const user1Balance = await contentToken.balanceOf(user1.address);
    const platformBalance = await contentToken.balanceOf(await contentPlatform.getAddress());

    console.log("  创作者余额:", ethers.formatEther(creatorBalance), "CPT");
    console.log("  用户1余额:", ethers.formatEther(user1Balance), "CPT");
    console.log("  平台余额:", ethers.formatEther(platformBalance), "CPT");
    console.log();
  });
});
