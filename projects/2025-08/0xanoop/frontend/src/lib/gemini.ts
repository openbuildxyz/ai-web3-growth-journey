import {
  GoogleGenerativeAI,
  GenerateContentResult,
  Tool,
} from "@google/generative-ai";
import { Node } from "reactflow";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
if (!API_KEY) {
  throw new Error("VITE_GEMINI_API_KEY is not set in .env.local");
}

const genAI = new GoogleGenerativeAI(API_KEY);

// --- AI Model for Chat Assistant ---
const chatTools: Tool[] = [
  {
    functionDeclarations: [
      {
        name: "addNode",
        description: "Adds a new component node to the DAO canvas.",
        parameters: {
          type: "OBJECT",
          properties: {
            type: {
              type: "STRING",
              description:
                "The type of node to add. Can be 'token', 'voting', 'treasury', 'quorum', or 'timelock'.",
            },
            connectToType: {
              type: "STRING",
              description: "Optional. The type of an existing node to connect this new node to. For example, when adding a 'voting' node, you might set this to 'token'."
            }
          },
          required: ["type"],
        },
      },
      {
        name: "addCustomNode",
        description: "Adds a special, AI-generated node to the canvas for custom logic or functions described by the user.",
        parameters: {
          type: "OBJECT",
          properties: {
            label: {
              type: "STRING",
              description: "A concise title for the custom node. For example, 'Quarterly Payouts'."
            },
            description: {
              type: "STRING",
              description: "A detailed description of the custom logic the user wants. For example, 'A function to distribute 20% of treasury profits to token holders every quarter.'"
            }
          },
          required: ["label", "description"]
        }
      }
    ],
  },
];

const chatModel = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
  systemInstruction: `You are a helpful and neutral expert in DAO governance. Your role is to assist users in building a DAO by adding components to a visual canvas.
- Use the 'addNode' function for standard components: 'token', 'voting', 'treasury', 'quorum', or 'timelock'.
- When a user asks to add multiple components that should be connected (e.g., 'a token and voting'), you MUST make multiple 'addNode' calls in the correct order.
- Use the 'connectToType' parameter in the 'addNode' function to create a connection. For example, to connect a new 'voting' node to an existing 'token' node, call 'addNode' with type: 'voting' and connectToType: 'token'.
- Logical connections are important: a 'voting' node needs a 'token' node, a 'quorum' node also connects to the 'token', a 'timelock' connects from a 'voting' node, and a 'treasury' connects from a 'timelock' or 'voting' node.
- Before adding a standard node, check if a node of the same type already exists. If it does, inform the user.
- For user requests that describe custom logic, rules, or functions not covered by the standard nodes, you MUST use the 'addCustomNode' function. For example, if a user asks for 'a way to distribute profits to token holders' or 'a module for milestone-based funding', use 'addCustomNode'.
- When calling 'addCustomNode', provide a clear 'label' and a detailed 'description' based on the user's request.
- After adding any node, confirm the action and ask the user if they want to configure it or keep the defaults.
- If the user asks for an explanation of a configuration parameter, provide a simple, clear definition.
- Do not give financial or investment advice.`,
  tools: chatTools,
});

export const chatSession = chatModel.startChat({
  history: [],
});

export const sendMessageToAI = async (
  message: string,
  nodes: Node[]
): Promise<GenerateContentResult> => {
  const contextMessage = `
    User message: "${message}"
    ---
    System context: The current nodes on the canvas are: ${JSON.stringify(nodes.map(n => ({id: n.id, type: n.type})))}. 
    Do not add nodes of a type that already exists. When adding new nodes, use the 'connectToType' parameter to connect them logically if appropriate.
  `;
  const result = await chatSession.sendMessage(contextMessage);
  return result;
};


// --- AI Model for Smart Contract Generation ---
const contractGenerationModel = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
  systemInstruction: `You are an expert Solidity smart contract developer specializing in DAO architecture. Your task is to take a high-level description of a DAO's structure and a set of placeholder Solidity contracts, and then write the final, complete, and deployable smart contracts.

**CRITICAL INSTRUCTIONS:**
1.  **REPLACE ALL PLACEHOLDERS:** Your primary goal is to replace ALL placeholder logic with complete, production-ready Solidity code. The final code MUST NOT contain any placeholder comments like \`// TODO\`, \`// Note:\`, or \`// Placeholder:\`.
2.  **IMPLEMENT GOVERNANCE LOGIC:** For any \`Governor\` contract, you MUST implement a full proposal lifecycle:
    -   A \`propose\` function that creates a proposal with a description, targets, values, and calldatas.
    -   Proposal state tracking (e.g., \`enum ProposalState { Pending, Active, Succeeded, Defeated, Executed }\`).
    -   A \`castVote\` function allowing token holders to vote.
    -   Vote counting logic and quorum checks against the \`quorumPercentage\`.
    -   An \`execute\` function that sends the proposal to the \`Timelock\` for execution after a successful vote.
3.  **IMPLEMENT TIMELOCK LOGIC:** For any \`Timelock\` contract, implement a full transaction lifecycle: queueing, execution, and cancellation. It should be the owner of the \`Treasury\` if one is present.
4.  **IMPLEMENT CUSTOM LOGIC:** For any 'ai' type nodes, you MUST implement the functionality described in the \`description\` field within the corresponding placeholder contract.
5.  **INTERCONNECT CONTRACTS:** Ensure contracts are linked correctly by passing addresses in constructors based on the \`edges\` data. The \`Governor\` needs the \`Token\` address, and the \`Treasury\` needs the owner address (either \`Timelock\` or \`Governor\`).
6.  **OUTPUT FORMAT (STRICT):** Your response MUST follow this exact text-based format. Do not use JSON or markdown.

For each contract, provide the filename and the code like this:
FILENAME: TheFileName.sol
CODE_START
// The complete, fully implemented Solidity code goes here...
CODE_END

If you are generating multiple files, separate each complete block (from FILENAME to CODE_END) with '---FILE_SEPARATOR---' on its own line.
`,
});

export const generateFinalContractsFromAI = async (
  nodes: Node[],
  edges: Edge[],
  placeholders: { filename: string; code: string }[]
): Promise<{ filename: string; code: string }[]> => {
  const prompt = `
    Here is the DAO structure:
    Nodes: ${JSON.stringify(nodes)}
    Edges: ${JSON.stringify(edges)}

    Here are the placeholder contracts:
    ${JSON.stringify(placeholders)}

    Please generate the final, complete code based on the structure and placeholders, following all instructions.
  `;

  const result = await contractGenerationModel.generateContent(prompt);
  const responseText = result.response.text();
  
  const contracts: { filename: string; code: string }[] = [];
  const fileSeparator = '---FILE_SEPARATOR---';
  const fileBlocks = responseText.split(fileSeparator);

  for (const block of fileBlocks) {
    const trimmedBlock = block.trim();
    if (!trimmedBlock) continue;

    const filenameMatch = trimmedBlock.match(/^FILENAME: (.*)$/m);
    const codeMatch = trimmedBlock.match(/CODE_START\n([\s\S]*)\nCODE_END$/);

    if (filenameMatch && filenameMatch[1] && codeMatch && codeMatch[1]) {
      const filename = filenameMatch[1].trim();
      const code = codeMatch[1].trim();
      contracts.push({ filename, code });
    }
  }

  if (contracts.length === 0) {
    console.error("Failed to parse AI response with custom format:", responseText);
    throw new Error("The AI returned an invalid response. Please try again.");
  }

  return contracts;
};