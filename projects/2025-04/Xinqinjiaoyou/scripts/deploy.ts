import { ethers } from "hardhat";

async function main() {
  console.log("Deploying Chat contract...");

  const Chat = await ethers.getContractFactory("Chat");
  const chat = await Chat.deploy();

  await chat.waitForDeployment();

  const address = await chat.getAddress();
  console.log(`Chat contract deployed to: ${address}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
}); 