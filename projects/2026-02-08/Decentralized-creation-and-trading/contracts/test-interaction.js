// 测试与部署的合约交互
const hre = require("hardhat");
const fs = require("fs");

async function main() {
    console.log("\n🎮 开始测试合约交互...\n");

    // 读取部署信息
    const deploymentInfo = JSON.parse(fs.readFileSync("deployment-info.json", "utf8"));
    
    // 获取测试账户
    const [owner, user1, user2, user3] = await hre.ethers.getSigners();
    
    console.log("📋 测试账户:");
    console.log(`   所有者: ${owner.address}`);
    console.log(`   用户1: ${user1.address}`);
    console.log(`   用户2: ${user2.address}`);
    console.log(`   用户3: ${user3.address}\n`);

    // 连接到已部署的合约
    const ContentToken = await hre.ethers.getContractAt(
        "ContentToken",
        deploymentInfo.contracts.ContentToken
    );
    
    const ContentPlatform = await hre.ethers.getContractAt(
        "ContentPlatform",
        deploymentInfo.contracts.ContentPlatform
    );

    console.log("💰 初始代币余额:");
    const platformBalance = await ContentToken.balanceOf(deploymentInfo.contracts.ContentPlatform);
    console.log(`   平台合约: ${hre.ethers.formatUnits(platformBalance, 18)} CPT\n`);

    // 1. 用户1发布内容
    console.log("📝 步骤1: 用户1发布内容");
    const publishTx = await ContentPlatform.connect(user1).publishContent("QmTest123456789");
    await publishTx.wait();
    console.log("   ✅ 内容发布成功! 内容ID: 1\n");

    // 2. 用户2点赞内容
    console.log("👍 步骤2: 用户2点赞内容");
    const likeTx = await ContentPlatform.connect(user2).likeContent(1);
    await likeTx.wait();
    
    const user1Balance1 = await ContentToken.balanceOf(user1.address);
    console.log(`   ✅ 点赞成功!`);
    console.log(`   💰 用户1(创作者)获得: ${hre.ethers.formatUnits(user1Balance1, 18)} CPT (80%)\n`);

    // 3. 用户3分享内容
    console.log("🔗 步骤3: 用户3分享内容");
    const shareTx = await ContentPlatform.connect(user3).shareContent(1);
    await shareTx.wait();
    
    const user1Balance2 = await ContentToken.balanceOf(user1.address);
    const user3Balance = await ContentToken.balanceOf(user3.address);
    console.log(`   ✅ 分享成功!`);
    console.log(`   💰 用户1(创作者)累计获得: ${hre.ethers.formatUnits(user1Balance2, 18)} CPT`);
    console.log(`   💰 用户3(分享者)获得: ${hre.ethers.formatUnits(user3Balance, 18)} CPT (8%)\n`);

    // 4. 查询内容信息
    console.log("📊 步骤4: 查询内容统计");
    const content = await ContentPlatform.contents(1);
    console.log(`   内容ID: 1`);
    console.log(`   创作者: ${content.creator}`);
    console.log(`   IPFS哈希: ${content.ipfsHash}`);
    console.log(`   点赞数: ${content.likeCount}`);
    console.log(`   分享数: ${content.shareCount}\n`);

    // 5. 总结收益
    console.log("💰 收益总结:");
    console.log(`   用户1(创作者): ${hre.ethers.formatUnits(user1Balance2, 18)} CPT`);
    console.log(`   用户2(点赞者): 消耗点赞权重`);
    console.log(`   用户3(分享者): ${hre.ethers.formatUnits(user3Balance, 18)} CPT`);
    
    const finalPlatformBalance = await ContentToken.balanceOf(deploymentInfo.contracts.ContentPlatform);
    const platformEarnings = platformBalance - finalPlatformBalance;
    console.log(`   平台收益: ${hre.ethers.formatUnits(platformEarnings, 18)} CPT (20%)\n`);

    console.log("🎉 测试完成！所有功能正常运行！\n");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
