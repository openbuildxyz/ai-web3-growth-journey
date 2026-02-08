// apps/CangjieMagic/sdk/javascript/src/index.ts
import axios from 'axios';

// Define types for skill configuration
export interface EnvironmentConfig {
  [key: string]: string | undefined;
}

// Define types for skill metadata
export interface SkillMetadata {
  name: string;
  version: string;
  description: string;
  author: string;
}

// Define types for tool parameters
export interface ToolParameter {
  name: string;
  paramType: 'string' | 'number' | 'boolean' | 'file';
  description: string;
  required: boolean;
  defaultValue?: string | number | boolean;
}

// Define types for tool definitions
export interface ToolDefinition {
  name: string;
  description: string;
  parameters: ToolParameter[];
  handler: (args: Record<string, any>) => Promise<any>;
}

// Define types for skill definition
export interface SkillDefinition {
  metadata: SkillMetadata;
  tools: ToolDefinition[];
  validateConfig?: (config: EnvironmentConfig) => { ok: null } | { err: string };
}

// Define types for skill execution result
export interface SkillExecutionResult {
  success: boolean;
  output: string;
  errorMessage: string | null;
}

/**
 * Defines a skill with metadata, tools, and optional configuration validation.
 * @param config The skill configuration
 * @returns A skill definition
 */
export function defineSkill(config: SkillDefinition): SkillDefinition {
  return config;
}

/**
 * Gets configuration from environment variables.
 * @returns The configuration object
 */
export function getConfig<T extends EnvironmentConfig = EnvironmentConfig>(): T {
  const config: Record<string, string> = {};

  // Extract configuration from environment variables with SKILL_ prefix
  for (const [key, value] of Object.entries(process.env)) {
    if (key.startsWith('SKILL_') && value !== undefined) {
      const configKey = key.substring(6); // Remove 'SKILL_' prefix
      config[configKey] = value;
    }
  }

  return config as T;
}

/**
 * Interface for communicating with the CangjieMagic Skill Runtime
 */
export class SkillRuntimeClient {
  private baseUrl: string;
  private jwtToken?: string;

  constructor(baseUrl: string, jwtToken?: string) {
    this.baseUrl = baseUrl;
    this.jwtToken = jwtToken;
  }

  /**
   * Install a skill from a local path or Git repository
   */
  async installSkill(options: {
    path?: string,
    git?: string,
    branch?: string,
    tag?: string,
    commit?: string,
    name?: string
  }): Promise<{ success: boolean, message: string }> {
    try {
      const headers = this.jwtToken ? { Authorization: `Bearer ${this.jwtToken}` } : {};

      const response = await axios.post(`${this.baseUrl}/skills/install`, options, { headers });

      return {
        success: response.status === 200 || response.status === 201,
        message: response.data.message || 'Skill installed successfully'
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Failed to install skill'
      };
    }
  }

  /**
   * List all installed skills
   */
  async listSkills(): Promise<{ success: boolean, skills: any[] }> {
    try {
      const headers = this.jwtToken ? { Authorization: `Bearer ${this.jwtToken}` } : {};

      const response = await axios.get(`${this.baseUrl}/skills`, { headers });

      return {
        success: response.status === 200,
        skills: response.data.skills || []
      };
    } catch (error: any) {
      return {
        success: false,
        skills: []
      };
    }
  }

  /**
   * Run a specific skill tool
   */
  async runSkillTool(skillName: string, toolName: string, args: Record<string, any>): Promise<SkillExecutionResult> {
    try {
      const headers = this.jwtToken ? { Authorization: `Bearer ${this.jwtToken}` } : {};

      const response = await axios.post(`${this.baseUrl}/skills/${skillName}/tools/${toolName}/run`, {
        args
      }, { headers });

      return {
        success: response.data.success ?? true,
        output: response.data.output || '',
        errorMessage: response.data.errorMessage || null
      };
    } catch (error: any) {
      return {
        success: false,
        output: '',
        errorMessage: error.response?.data?.errorMessage || error.message || 'Failed to run skill tool'
      };
    }
  }

  /**
   * Search for skills using semantic search
   */
  async searchSkills(query: string): Promise<{ success: boolean, skills: any[] }> {
    try {
      const headers = this.jwtToken ? { Authorization: `Bearer ${this.jwtToken}` } : {};

      const response = await axios.get(`${this.baseUrl}/skills/search?q=${encodeURIComponent(query)}`, { headers });

      return {
        success: response.status === 200,
        skills: response.data.skills || []
      };
    } catch (error: any) {
      return {
        success: false,
        skills: []
      };
    }
  }
}

// Export the client for use in skills
export { SkillRuntimeClient };