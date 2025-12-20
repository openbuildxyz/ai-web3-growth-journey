import { Client, Long } from "@bnb-chain/greenfield-js-sdk";
import { ReedSolomon } from "@bnb-chain/reed-solomon";

// Initialize client
const client = Client.create("https://gnfd-testnet-fullnode-tendermint-us.bnbchain.org", "5600");

interface RequestData {
  walletAddress?: string;
  privateKey?: string;
  swapData?: any;
  [key: string]: any;
}

// Helper function to convert BigInt values to strings
function serializeBigInt(obj: any): any {
  return JSON.parse(JSON.stringify(obj, (key, value) =>
    typeof value === 'bigint' ? value.toString() : value
  ));
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const objectName = url.searchParams.get('objectName');
    const privateKey = "0xd6cf38f45715f41ba20935e461b25f574c301fd8eeb6b1f4faad6728abb14ba3";
    const bucketName = "my-rebalance-logs3";

    if (objectName) {
      // Fetch a specific object
      try {
        const objectInfo = await client.object.headObject(bucketName, objectName);
        
        let content = null;
        let downloadError = null;

        // Try to download content with different auth methods
        try {
          if (privateKey) {
            // Try with private key authentication
            const objectData = await client.object.getObject(
              {
                bucketName: bucketName,
                objectName: objectName,
              },
              {
                type: 'ECDSA',
                privateKey: privateKey,
              }
            );

            if (objectData.body) {
              const arrayBuffer = await objectData.body.arrayBuffer();
              const text = new TextDecoder().decode(arrayBuffer);
              
              try {
                content = JSON.parse(text);
              } catch (e) {
                content = text;
              }
            }
          } else {
            // Try without authentication for public objects
            try {
              const objectData = await client.object.getObject(
                {
                  bucketName: bucketName,
                  objectName: objectName,
                },
                {
                  type: 'ECDSA',
                  privateKey: '',
                }
              );

              if (objectData && objectData.body) {
                const arrayBuffer = await objectData.body.arrayBuffer();
                const text = new TextDecoder().decode(arrayBuffer);
                
                try {
                  content = JSON.parse(text);
                } catch (e) {
                  content = text;
                }
              }
            } catch (publicDownloadError: any) {
              // If public download fails, try with getObject without auth
              try {
                const objectData = await client.object.getObject(
                  {
                    bucketName: bucketName,
                    objectName: objectName,
                  },
                  {
                    type: 'ECDSA',
                    privateKey: '',
                  }
                );

                if (objectData.body) {
                  const arrayBuffer = await objectData.body.arrayBuffer();
                  const text = new TextDecoder().decode(arrayBuffer);
                  
                  try {
                    content = JSON.parse(text);
                  } catch (e) {
                    content = text;
                  }
                }
              } catch (getObjectError: any) {
                downloadError = `Public download failed: ${publicDownloadError.message}. GetObject failed: ${getObjectError.message}`;
              }
            }
          }
        } catch (downloadErr: any) {
          downloadError = downloadErr.message;
        }

        return new Response(JSON.stringify({
          success: true,
          object: {
            name: objectName,
            info: serializeBigInt(objectInfo),
            content: content,
            downloadError: downloadError,
            note: !content && !privateKey ? "Content might require authentication. Try adding ?privateKey=0x... to the URL" : undefined
          }
        }), {
          status: 200,
          headers: { "Content-Type": "application/json" }
        });
      } catch (error: any) {
        return new Response(JSON.stringify({
          success: false,
          error: `Failed to fetch object: ${error.message}`
        }), {
          status: 404,
          headers: { "Content-Type": "application/json" }
        });
      }
    } else {
      // List all objects in the bucket
      try {
        const bucketInfo = await client.bucket.headBucket(bucketName);
        
        // List objects using storage provider
        const spList = await client.sp.getStorageProviders();
        if (!spList || spList.length === 0) {
          throw new Error("No storage providers available");
        }

        const primarySp = spList[0];
        
        const objectsList = await client.object.listObjects({
          bucketName: bucketName,
          endpoint: primarySp.endpoint
        });

        return new Response(JSON.stringify({
          success: true,
          bucket: {
            name: bucketName,
            info: serializeBigInt(bucketInfo),
            objects: serializeBigInt(objectsList)
          }
        }), {
          status: 200,
          headers: { "Content-Type": "application/json" }
        });
      } catch (error: any) {
        return new Response(JSON.stringify({
          success: false,
          error: `Failed to list objects: ${error.message}`
        }), {
          status: 500,
          headers: { "Content-Type": "application/json" }
        });
      }
    }
  } catch (error: any) {
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}

export async function POST(req: Request) {
  try {
    // Safely parse JSON - handle empty requests
    let data: RequestData = {};
    try {
      if (req.body) {
        data = await req.json();
      }
    } catch (e) {
      // Continue with empty data object if JSON parsing fails
    }
    
    const address = data.walletAddress || "0x6ed1B934670a5F42E0ba1E19FbFe5B6d1e2eDEa7";
    const privateKey = "0xd6cf38f45715f41ba20935e461b25f574c301fd8eeb6b1f4faad6728abb14ba3";
    
    // Validate required swap data
    if (!data.swapData) {
      return new Response(JSON.stringify({
        success: false,
        error: "Missing swap data. Please provide swapData in request body."
      }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    // First, get available storage providers
    const spList = await client.sp.getStorageProviders();
    if (!spList || spList.length === 0) {
      throw new Error("No storage providers available");
    }
    
    // Select the first available SP
    const primarySp = spList[0];
    
    // Get existing objects to determine the next log number
    let logNumber = 1;
    try {
      // For now, use a simpler approach - just use timestamp to ensure uniqueness
      // In a production system, you might want to implement proper sequential numbering
      logNumber = Math.floor(Date.now() / 1000); // Unix timestamp for uniqueness
    } catch (listError) {
      console.warn("Could not determine log number, using timestamp:", listError);
      logNumber = Math.floor(Date.now() / 1000);
    }
    
    // Create object info from actual swap data
    const objectInfo = {
      walletAddress: address,
      swapId: `${address.toLowerCase()}-logs${logNumber}`,
      oldAllocation: data.swapData.oldAllocation || {},
      newAllocation: data.swapData.newAllocation || {},
      strategy: data.swapData.strategy || "Balanced",
      timestamp: data.swapData.timestamp || new Date().toISOString()
    };
    
    // Skip bucket creation - use existing bucket "my-rebalance-logs3"
    const bucketName = "my-rebalance-logs3";
    
    let objectResult = null;

    // Only attempt object creation if private key is provided
    if (privateKey) {
      try {
        const objectData = JSON.stringify(objectInfo, null, 2); // Pretty print JSON
        const objectBuffer = new TextEncoder().encode(objectData);
        
        // Calculate Reed-Solomon checksums
        const rs = new ReedSolomon();
        const expectCheckSums = rs.encode(objectBuffer);
        
        const objectName = `${address.toLowerCase()}-logs${logNumber}.json`;
        
        const createObjectTx = await client.object.createObject({
          bucketName: bucketName,
          objectName: objectName,
          creator: address,
          visibility: 1,
          contentType: 'application/json',
          redundancyType: 0, // REDUNDANCY_EC_TYPE
          payloadSize: Long.fromInt(objectBuffer.length),
          expectChecksums: expectCheckSums.map((checksum: string) => 
            Uint8Array.from(Buffer.from(checksum, 'base64'))
          ),
        });
        
        const objectSimulate = await createObjectTx.simulate({
          denom: "BNB",
        });
        
        const objectBroadcast = await createObjectTx.broadcast({
          denom: "BNB",
          gasLimit: Number(objectSimulate.gasLimit),
          gasPrice: objectSimulate.gasPrice,
          payer: address,
          granter: '',
          privateKey: privateKey
        });
        
        objectResult = serializeBigInt(objectBroadcast);

        // If object creation was successful, upload the actual data
        if (objectBroadcast.code === 0) {
          try {
            const uploadRes = await client.object.uploadObject(
              {
                bucketName: bucketName,
                objectName: objectName,
                body: {
                  name: objectName,
                  type: 'application/json',
                  size: objectBuffer.length,
                  content: Buffer.from(objectBuffer),
                },
                txnHash: objectBroadcast.transactionHash,
              },
              {
                type: 'ECDSA',
                privateKey: privateKey,
              }
            );
            objectResult.uploadStatus = uploadRes;
            objectResult.objectName = objectName;
          } catch (uploadError: any) {
            objectResult.uploadError = uploadError.message;
          }
        }
      } catch (objectError: any) {
        return new Response(JSON.stringify({ 
          success: false, 
          error: `Object creation failed: ${objectError.message}`,
          swapData: objectInfo
        }), {
          status: 400,
          headers: { "Content-Type": "application/json" }
        });
      }
    }

    return new Response(JSON.stringify({ 
      success: true,
      message: "Swap data stored in Greenfield successfully",
      swapData: objectInfo,
      objectTransaction: objectResult,
      storedObjectName: objectResult?.objectName || null,
      logNumber: logNumber
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
