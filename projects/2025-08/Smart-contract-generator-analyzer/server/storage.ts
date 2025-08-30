import { type Contract, type InsertContract, type Template, type InsertTemplate } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Contract operations
  getContract(id: string): Promise<Contract | undefined>;
  createContract(contract: InsertContract): Promise<Contract>;
  updateContract(id: string, contract: Partial<InsertContract>): Promise<Contract | undefined>;
  deleteContract(id: string): Promise<boolean>;
  getAllContracts(): Promise<Contract[]>;
  
  // Template operations
  getTemplate(id: string): Promise<Template | undefined>;
  createTemplate(template: InsertTemplate): Promise<Template>;
  getAllTemplates(): Promise<Template[]>;
}

export class MemStorage implements IStorage {
  private contracts: Map<string, Contract>;
  private templates: Map<string, Template>;

  constructor() {
    this.contracts = new Map();
    this.templates = new Map();
    this.initializeTemplates();
  }

  private initializeTemplates() {
    const defaultTemplates = [
      {
        id: randomUUID(),
        name: "ERC20 Token",
        description: "Standard token with supply controls",
        icon: "fas fa-coins",
        prompt: "Create an ERC20 token with name, symbol, total supply, and basic transfer functionality",
        category: "tokens"
      },
      {
        id: randomUUID(),
        name: "NFT Collection",
        description: "ERC721 with metadata support",
        icon: "fas fa-image",
        prompt: "Create an ERC721 NFT collection with minting functionality, metadata URI support, and ownership controls",
        category: "nft"
      },
      {
        id: randomUUID(),
        name: "Voting Contract",
        description: "Democratic decision making",
        icon: "fas fa-vote-yea",
        prompt: "Create a voting contract with candidate registration, voting functionality, and result tallying",
        category: "governance"
      },
      {
        id: randomUUID(),
        name: "Simple Counter",
        description: "Basic state management example",
        icon: "fas fa-calculator",
        prompt: "Create a simple counter contract with increment, decrement, and read functionality",
        category: "basic"
      }
    ];

    defaultTemplates.forEach(template => {
      this.templates.set(template.id, template);
    });
  }

  async getContract(id: string): Promise<Contract | undefined> {
    return this.contracts.get(id);
  }

  async createContract(insertContract: InsertContract): Promise<Contract> {
    const id = randomUUID();
    const contract: Contract = {
      ...insertContract,
      id,
      createdAt: new Date(),
      gasOptimizations: insertContract.gasOptimizations || [],
      securityIssues: insertContract.securityIssues || [],
      stats: insertContract.stats || {}
    };
    this.contracts.set(id, contract);
    return contract;
  }

  async updateContract(id: string, updateData: Partial<InsertContract>): Promise<Contract | undefined> {
    const existing = this.contracts.get(id);
    if (!existing) return undefined;
    
    const updated: Contract = { ...existing, ...updateData };
    this.contracts.set(id, updated);
    return updated;
  }

  async deleteContract(id: string): Promise<boolean> {
    return this.contracts.delete(id);
  }

  async getAllContracts(): Promise<Contract[]> {
    return Array.from(this.contracts.values());
  }

  async getTemplate(id: string): Promise<Template | undefined> {
    return this.templates.get(id);
  }

  async createTemplate(insertTemplate: InsertTemplate): Promise<Template> {
    const id = randomUUID();
    const template: Template = { ...insertTemplate, id };
    this.templates.set(id, template);
    return template;
  }

  async getAllTemplates(): Promise<Template[]> {
    return Array.from(this.templates.values());
  }
}

export const storage = new MemStorage();
