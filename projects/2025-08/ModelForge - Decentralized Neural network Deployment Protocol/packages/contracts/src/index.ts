import { readFileSync, existsSync } from "fs";
import { join } from "path";

// Contract ABIs
import ForgeTokenABI from "../artifacts/contracts/ForgeToken.sol/ForgeToken.json";
import ForgeFaucetABI from "../artifacts/contracts/ForgeFaucet.sol/ForgeFaucet.json";
import ModelRegistryABI from "../artifacts/contracts/ModelRegistry.sol/ModelRegistry.json";

export interface ModelData {
  name: string;
  description: string;
  ipfsHash: string;
  modelType: string;
  version: string;
  owner: string;
  timestamp: number;
  active: boolean;
}

export interface DeploymentConfig {
  network: string;
  gasLimit?: number;
  gasPrice?: string;
}

export interface ContractDeployment {
  address: string;
  abi: any[];
}

export interface NetworkDeployments {
  forgeToken: ContractDeployment;
  faucet: ContractDeployment;
  modelRegistry: ContractDeployment;
  deployer: string;
  network: string;
  timestamp: number;
}

/**
 * Get deployment data for a specific network
 * @param network - Network name (localhost, sepolia, mainnet, etc.)
 * @returns Deployment data including addresses and ABIs
 */
export function getDeployments(network: string = "localhost"): NetworkDeployments {
  const deploymentPath = join(__dirname, "..", "artifacts", "deployments", `${network}.json`);

  if (!existsSync(deploymentPath)) {
    throw new Error(`No deployment found for network: ${network}. Please deploy contracts first.`);
  }

  const deploymentData = JSON.parse(readFileSync(deploymentPath, "utf8"));

  return {
    forgeToken: {
      address: deploymentData.forgeToken,
      abi: ForgeTokenABI.abi
    },
    faucet: {
      address: deploymentData.faucet,
      abi: ForgeFaucetABI.abi
    },
    modelRegistry: {
      address: deploymentData.modelRegistry,
      abi: ModelRegistryABI.abi
    },
    deployer: deploymentData.deployer,
    network: deploymentData.network,
    timestamp: deploymentData.timestamp
  };
}

/**
 * Get specific contract deployment
 * @param contractName - Name of the contract (forgeToken, faucet, modelRegistry)
 * @param network - Network name
 * @returns Contract deployment with address and ABI
 */
export function getContract(contractName: keyof Pick<NetworkDeployments, 'forgeToken' | 'faucet' | 'modelRegistry'>, network: string = "localhost"): ContractDeployment {
  const deployments = getDeployments(network);
  const contract = deployments[contractName];

  if (!contract || typeof contract !== "object" || !("address" in contract)) {
    throw new Error(`Contract ${contractName} not found in ${network} deployments`);
  }

  return contract as ContractDeployment;
}

/**
 * Get all available networks with deployments
 * @returns Array of network names that have deployments
 */
export function getAvailableNetworks(): string[] {
  const deploymentsDir = join(__dirname, "..", "artifacts", "deployments");

  if (!existsSync(deploymentsDir)) {
    return [];
  }

  const fs = require("fs");
  return fs.readdirSync(deploymentsDir)
    .filter((file: string) => file.endsWith(".json"))
    .map((file: string) => file.replace(".json", ""));
}

/**
 * Check if deployments exist for a network
 * @param network - Network name to check
 * @returns True if deployments exist
 */
export function hasDeployments(network: string): boolean {
  const deploymentPath = join(__dirname, "..", "artifacts", "deployments", `${network}.json`);
  return existsSync(deploymentPath);
}

// Re-export ABIs for direct use
export const ABIs = {
  ForgeToken: ForgeTokenABI.abi,
  ForgeFaucet: ForgeFaucetABI.abi,
  ModelRegistry: ModelRegistryABI.abi
};

// Export contract addresses for quick access
export function getAddresses(network: string = "localhost") {
  const deployments = getDeployments(network);
  return {
    forgeToken: deployments.forgeToken.address,
    faucet: deployments.faucet.address,
    modelRegistry: deployments.modelRegistry.address
  };
}
