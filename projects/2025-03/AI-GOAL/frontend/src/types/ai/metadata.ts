export interface Metadata {
    symbol: string;
    name: string;
    description: string;
}

export interface MetadataApiResponse {
    success: boolean;
    message: Metadata;
}
