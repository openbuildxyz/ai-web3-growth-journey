import { create } from 'ipfs-http-client';
import type { UploadResult, ModelMetadata } from './types';

export class IPFSUploader {
  private client: any;

  constructor(apiUrl = 'http://127.0.0.1:5001') {
    this.client = create({ url: apiUrl });
  }

  /**
   * Upload a file to IPFS
   */
  async uploadFile(file: File | Buffer | string): Promise<UploadResult> {
    try {
      const result = await this.client.add(file);

      return {
        ipfsHash: result.path,
        size: result.size,
        timestamp: Date.now(),
      };
    } catch (error) {
      throw new Error(`Failed to upload to IPFS: ${error}`);
    }
  }

  /**
   * Upload model with metadata
   */
  async uploadModel(
    modelFile: File | Buffer,
    metadata: ModelMetadata
  ): Promise<UploadResult> {
    try {
      // Create a directory with model file and metadata
      const files = [
        {
          path: 'model.bin',
          content: modelFile,
        },
        {
          path: 'metadata.json',
          content: JSON.stringify(metadata, null, 2),
        },
      ];

      const result = await this.client.addAll(files, {
        wrapWithDirectory: true,
      });
      let directoryHash = '';

      // Get the directory hash (last item)
      for await (const file of result) {
        if (file.path === '') {
          directoryHash = file.path;
        }
      }

      return {
        ipfsHash: directoryHash,
        size: 0, // Will be calculated
        timestamp: Date.now(),
      };
    } catch (error) {
      throw new Error(`Failed to upload model: ${error}`);
    }
  }

  /**
   * Download a file from IPFS
   */
  async downloadFile(ipfsHash: string): Promise<Buffer> {
    try {
      const chunks = [];
      for await (const chunk of this.client.cat(ipfsHash)) {
        chunks.push(chunk);
      }
      return Buffer.concat(chunks);
    } catch (error) {
      throw new Error(`Failed to download from IPFS: ${error}`);
    }
  }

  /**
   * Pin a file to keep it available
   */
  async pinFile(ipfsHash: string): Promise<void> {
    try {
      await this.client.pin.add(ipfsHash);
    } catch (error) {
      throw new Error(`Failed to pin file: ${error}`);
    }
  }
}
