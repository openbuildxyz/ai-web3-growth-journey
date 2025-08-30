import {
    S3Client,
    PutObjectCommand,
    ListObjectsV2Command,
    GetObjectCommand,
    DeleteObjectCommand
  } from "@aws-sdk/client-s3";
  import { NextRequest, NextResponse } from "next/server";
  
  const {
    R2_ACCESS_KEY_ID,
    R2_SECRET_ACCESS_KEY,
    R2_BUCKET_NAME,
    R2_ENDPOINT
  } = process.env;
  
  const s3 = new S3Client({
    region: "auto",
    endpoint: R2_ENDPOINT,
    credentials: {
      accessKeyId: R2_ACCESS_KEY_ID!,
      secretAccessKey: R2_SECRET_ACCESS_KEY!
    }
  });

  function streamToString(stream: any): Promise<string> {
    const reader = stream.getReader();
    const decoder = new TextDecoder();
    let result = "";
  
    return reader.read().then(function processText({ done, value }: { done: boolean; value: Uint8Array | undefined }): any {
      if (done) return result;
      result += decoder.decode(value, { stream: true });
      return reader.read().then(processText);
    });
  }
  
  const BUCKET = R2_BUCKET_NAME!;
  const PREFIX = "Neurobalance";
  
  export async function POST(req: NextRequest) {
    try {
      const { swapData } = await req.json();
      const walletAddress = swapData?.walletAddress?.toLowerCase();
  
      if (!walletAddress) {
        return NextResponse.json({ success: false, error: "Missing wallet address" }, { status: 400 });
      }
  
      const listCommand = new ListObjectsV2Command({
        Bucket: BUCKET,
        Prefix: `${PREFIX}/${walletAddress}-logs`,
      });
  
      const listed = await s3.send(listCommand);
      const existingLogs = listed.Contents || [];
      const logNumber = existingLogs.length + 1;
      const objectKey = `${PREFIX}/${walletAddress}-logs${logNumber}.json`;
  
      const putCommand = new PutObjectCommand({
        Bucket: BUCKET,
        Key: objectKey,
        Body: JSON.stringify(swapData),
        ContentType: "application/json"
      });
  
      await s3.send(putCommand);
  
      return NextResponse.json({ success: true, storedObjectName: objectKey });
    } catch (error) {
      console.error("Error storing swap log:", error);
      return NextResponse.json({ success: false, error: (error as Error).message });
    }
  }
  
  export async function GET(req: NextRequest) {
    try {
      const { searchParams } = new URL(req.url);
      const objectName = searchParams.get("objectName");
  
      if (objectName) {
        const command = new GetObjectCommand({
          Bucket: BUCKET,
          Key: `${PREFIX}/${objectName}`
        });
  
        const { Body } = await s3.send(command);
        const text = await streamToString(Body);
        const content = JSON.parse(text);
  
        return NextResponse.json({ success: true, object: { content } });
      } else {
        const listCommand = new ListObjectsV2Command({
          Bucket: BUCKET,
          Prefix: `${PREFIX}/`
        });
  
        const listed = await s3.send(listCommand);
        return NextResponse.json({ success: true, bucket: { objects: listed } });
      }
    } catch (error) {
      console.error("Error fetching swap log(s):", error);
      return NextResponse.json({ success: false, error: (error as Error).message });
    }
  }
  
  
  