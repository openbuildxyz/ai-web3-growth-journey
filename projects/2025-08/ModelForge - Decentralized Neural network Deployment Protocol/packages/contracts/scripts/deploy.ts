import hre from 'hardhat';

async function main() {
    console.log('Deploying ModelRegistry...');

    const ModelRegistry = await hre.ethers.getContractFactory('ModelRegistry');
    const registry = await ModelRegistry.deploy();

    await registry.waitForDeployment();

    const address = await registry.getAddress();
    console.log('ModelRegistry deployed to:', address);

    return address;
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
