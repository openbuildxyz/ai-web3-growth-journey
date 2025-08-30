import { ethers } from 'ethers';
import type { RegistryModel, ModelMetadata } from './types';

export class ModelRegistryClient {
  private contract: ethers.Contract;
  private signer: ethers.Signer;

  constructor(contractAddress: string, signer: ethers.Signer) {
    // ABI will be imported from generated types in real implementation
    const abi = [
      'function registerModel(string name, string description, string ipfsHash, string modelType, string version) external returns (uint256)',
      'function getModel(uint256 modelId) external view returns (tuple(string name, string description, string ipfsHash, string modelType, string version, address owner, uint256 timestamp, bool active))',
      'function getModelsByOwner(address owner) external view returns (uint256[])',
      'function getTotalModels() external view returns (uint256)',
    ];

    this.contract = new ethers.Contract(contractAddress, abi, signer);
    this.signer = signer;
  }

  /**
   * Register a new model on the blockchain
   */
  async registerModel(
    metadata: ModelMetadata,
    ipfsHash: string
  ): Promise<{ modelId: number; transactionHash: string }> {
    try {
      if (!this.contract) {
        throw new Error('Contract not initialized');
      }

      const tx = await this.contract.registerModel(
        metadata.name,
        metadata.description,
        ipfsHash,
        metadata.modelType,
        metadata.version
      );

      const receipt = await tx.wait();

      // Extract model ID from events
      const event = receipt.events?.find(
        (e: any) => e.event === 'ModelRegistered'
      );
      const modelId = event?.args?.modelId?.toNumber() || 0;

      return {
        modelId,
        transactionHash: receipt.transactionHash,
      };
    } catch (error) {
      throw new Error(`Failed to register model: ${error}`);
    }
  }

  /**
   * Get model by ID
   */
  async getModel(modelId: number): Promise<RegistryModel> {
    try {
      const result = await this.contract.getModel(modelId);

      return {
        id: modelId,
        metadata: {
          name: result.name,
          description: result.description,
          modelType: result.modelType,
          version: result.version,
        },
        ipfsHash: result.ipfsHash,
        owner: result.owner,
        timestamp: result.timestamp.toNumber(),
        active: result.active,
      };
    } catch (error) {
      throw new Error(`Failed to get model: ${error}`);
    }
  }

  /**
   * Get all models by owner
   */
  async getModelsByOwner(owner: string): Promise<number[]> {
    try {
      const modelIds = await this.contract.getModelsByOwner(owner);
      return modelIds.map((id: any) => id.toNumber());
    } catch (error) {
      throw new Error(`Failed to get models by owner: ${error}`);
    }
  }

  /**
   * Get total number of models
   */
  async getTotalModels(): Promise<number> {
    try {
      const count = await this.contract.getTotalModels();
      return count.toNumber();
    } catch (error) {
      throw new Error(`Failed to get total models: ${error}`);
    }
  }

  /**
   * Get signer address
   */
  async getAddress(): Promise<string> {
    return await this.signer.getAddress();
  }
}
