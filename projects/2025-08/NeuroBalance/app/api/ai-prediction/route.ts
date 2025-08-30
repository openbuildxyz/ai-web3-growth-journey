import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

// Define AI Model API endpoint
const AI_MODEL_URL = "https://lstm-backend-production-d690.up.railway.app"; // Base URL for AI model server

// export async function POST(req: NextRequest) {
//   try {
//     const body = await req.json();
//     const { allocation, strategy } = body;

//     if (!allocation || !strategy) {
//       return NextResponse.json({ error: "Missing allocation or strategy" }, { status: 400 });
//     }

//     // Call the AI model API for rebalance
//     const response = await axios.post(`${AI_MODEL_URL}/rebalance`, {
//       allocation,
//       strategy
//     });

//     // Return the AI model predictions and allocation recommendations
//     return NextResponse.json(response.data);
//   } catch (error) {
//     console.error("AI prediction error:", error);
//     return NextResponse.json({ 
//       error: "Failed to fetch AI predictions",
//       details: error instanceof Error ? error.message : "Unknown error"
//     }, { status: 500 });
//   }
// }
export async function POST(req: NextRequest) {
  try {
    console.log("Incoming POST request to /api/ai-prediction");

    const body = await req.json();
    const { allocation, strategy } = body;

    console.log("Request body received:", body);

    if (!allocation || !strategy) {
      console.warn("Missing allocation or strategy:", { allocation, strategy });
      return NextResponse.json({ error: "Missing allocation or strategy" }, { status: 400 });
    }

    // Step 1: Convert WBNB to BNB for AI model
    const transformedAllocation: Record<string, number> = {};
    for (const [key, value] of Object.entries(allocation)) {
      const token = key === "WBNB" ? "BNB" : key;
      if (typeof value === 'number') {
        transformedAllocation[token] = value;
      }
      
    }

    const payload = {
      current_portfolio: transformedAllocation,
      strategy
    };

    console.log("Sending request to AI model API for rebalance...");
    console.log("Transformed payload:", payload);

    const response = await axios.post(`${AI_MODEL_URL}/rebalance`, payload);
    const rawData = response.data;

    console.log("AI model response received:", rawData);

    // Step 2: Convert BNB back to WBNB in new_allocation
    const newAllocation: Record<string, number> = {};
    for (const [key, value] of Object.entries(rawData.new_allocation || {})) {
      const token = key === "BNB" ? "WBNB" : key;
      if (typeof value === 'number') {
        newAllocation[token] = value;
      }
    }

    // Step 3: Construct response in original frontend format
    const result = {
      predictions: rawData.predictions || {}, // use empty object if not provided
      new_allocation: newAllocation,
      strategy: rawData.strategy || { id: strategy.toLowerCase(), name: strategy, description: "" }
    };
    console.log("result", result);

    return NextResponse.json(result);
  } catch (error) {
    console.error("AI prediction error:", error);
    return NextResponse.json({ 
      error: "Failed to fetch AI predictions",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}




// GET endpoint to fetch AI-defined strategies
// export async function GET() {
//   try {
//     // Call the AI model API to get strategies
//     const response = await axios.get(`${AI_MODEL_URL}/strategies`);
    
//     return NextResponse.json(response.data);
//   } catch (error) {
//     console.error("Failed to fetch AI strategies:", error);
//     return NextResponse.json({
//       error: "Failed to fetch AI-defined strategies",
//       details: error instanceof Error ? error.message : "Unknown error"
//     }, { status: 500 });
//   }
// }

export async function GET() {
  try {
    const strategies = ["Growth", "Balanced", "Conservative"];

    return NextResponse.json({ strategies });
  } catch (error) {
    console.error("Failed to return strategies:", error);
    return NextResponse.json(
      {
        error: "Failed to return strategies",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
