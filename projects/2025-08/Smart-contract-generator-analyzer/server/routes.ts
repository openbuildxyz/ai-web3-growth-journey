import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertContractSchema, insertTemplateSchema } from "@shared/schema";
import { generateContract, type ContractGenerationRequest } from "./services/geminiService";
import { validateSolidityCode, extractContractName } from "./services/solidityAnalyzer";
import { analyzeContract } from "./services/contractAnalysisService";

export async function registerRoutes(app: Express): Promise<Server> {
  // Get all templates
  app.get("/api/templates", async (req, res) => {
    try {
      const templates = await storage.getAllTemplates();
      res.json(templates);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch templates" });
    }
  });

  // Get template by ID
  app.get("/api/templates/:id", async (req, res) => {
    try {
      const template = await storage.getTemplate(req.params.id);
      if (!template) {
        return res.status(404).json({ message: "Template not found" });
      }
      res.json(template);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch template" });
    }
  });

  // Generate contract from natural language
  app.post("/api/contracts/generate", async (req, res) => {
    try {
      const { description, includeOptimizations, includeSecurity, includeBestPractices } = req.body;
      
      if (!description) {
        return res.status(400).json({ message: "Description is required" });
      }

      const request: ContractGenerationRequest = {
        description,
        includeOptimizations: includeOptimizations ?? true,
        includeSecurity: includeSecurity ?? true,
        includeBestPractices: includeBestPractices ?? true
      };

      const result = await generateContract(request);
      
      // Validate the generated code
      const validation = validateSolidityCode(result.code);
      if (!validation.isValid) {
        return res.status(400).json({ 
          message: "Generated contract contains errors",
          errors: validation.errors 
        });
      }

      // Save the contract
      const contract = await storage.createContract({
        name: result.name,
        description,
        code: result.code,
        gasOptimizations: result.gasOptimizations,
        securityIssues: result.securityIssues,
        stats: result.stats
      });

      res.json(contract);
    } catch (error) {
      console.error("Contract generation error:", error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : "Failed to generate contract"
      });
    }
  });

  // Get all contracts
  app.get("/api/contracts", async (req, res) => {
    try {
      const contracts = await storage.getAllContracts();
      res.json(contracts);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch contracts" });
    }
  });

  // Get contract by ID
  app.get("/api/contracts/:id", async (req, res) => {
    try {
      const contract = await storage.getContract(req.params.id);
      if (!contract) {
        return res.status(404).json({ message: "Contract not found" });
      }
      res.json(contract);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch contract" });
    }
  });

  // Update contract
  app.patch("/api/contracts/:id", async (req, res) => {
    try {
      const updateData = insertContractSchema.partial().parse(req.body);
      const contract = await storage.updateContract(req.params.id, updateData);
      
      if (!contract) {
        return res.status(404).json({ message: "Contract not found" });
      }
      
      res.json(contract);
    } catch (error) {
      res.status(400).json({ message: "Invalid request data" });
    }
  });

  // Delete contract
  app.delete("/api/contracts/:id", async (req, res) => {
    try {
      const success = await storage.deleteContract(req.params.id);
      if (!success) {
        return res.status(404).json({ message: "Contract not found" });
      }
      res.json({ message: "Contract deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete contract" });
    }
  });

  // Download contract as .sol file
  app.get("/api/contracts/:id/download", async (req, res) => {
    try {
      const contract = await storage.getContract(req.params.id);
      if (!contract) {
        return res.status(404).json({ message: "Contract not found" });
      }

      const filename = `${contract.name}.sol`;
      res.setHeader('Content-Type', 'text/plain');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.send(contract.code);
    } catch (error) {
      res.status(500).json({ message: "Failed to download contract" });
    }
  });

  // Analyze existing contract
  app.post("/api/contracts/analyze", async (req, res) => {
    try {
      const { contractCode } = req.body;
      
      if (!contractCode) {
        return res.status(400).json({ message: "Contract code is required" });
      }

      // Validate the contract code first
      const validation = validateSolidityCode(contractCode);
      if (!validation.isValid) {
        return res.status(400).json({ 
          message: "Invalid Solidity contract",
          errors: validation.errors 
        });
      }

      const analysisResult = await analyzeContract(contractCode);
      res.json(analysisResult);
    } catch (error) {
      console.error("Contract analysis error:", error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : "Failed to analyze contract"
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
