import { ethers } from 'ethers';
import type { ModelData } from './index.js';

export class ModelRegistryClient {
    constructor(private contract: any) { }

    static async deploy() {
        // This would need to be called from a hardhat script context
        // const ModelRegistry = await ethers.getContractFactory('ModelRegistry');
        // const registry = await ModelRegistry.deploy();
        // await registry.waitForDeployment();
        // return new ModelRegistryClient(registry);
        throw new Error('Deploy method should be called from hardhat script context');
    }

    async registerModel(modelData: Omit<ModelData, 'owner' | 'timestamp' | 'active'>) {
        const tx = await this.contract.registerModel(
            modelData.name,
            modelData.description,
            modelData.ipfsHash,
            modelData.modelType,
            modelData.version
        );
        return await tx.wait();
    }

    async getModel(modelId: number): Promise<ModelData> {
        const model = await this.contract.getModel(modelId);
        return {
            name: model.name,
            description: model.description,
            ipfsHash: model.ipfsHash,
            modelType: model.modelType,
            version: model.version,
            owner: model.owner,
            timestamp: Number(model.timestamp),
            active: model.active
        };
    }

    async getModelsByOwner(owner: string): Promise<number[]> {
        const modelIds = await this.contract.getModelsByOwner(owner);
        return modelIds.map((id: any) => Number(id));
    }

    async getTotalModels(): Promise<number> {
        const count = await this.contract.getTotalModels();
        return Number(count);
    }
}
