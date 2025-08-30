export interface ModelMetadata {
  name: string;
  description: string;
  modelType: string;
  version: string;
  author?: string;
  license?: string;
  tags?: string[];
}

export interface UploadResult {
  ipfsHash: string;
  size: number;
  timestamp: number;
}

export interface RegistryModel {
  id: number;
  metadata: ModelMetadata;
  ipfsHash: string;
  owner: string;
  timestamp: number;
  active: boolean;
}
