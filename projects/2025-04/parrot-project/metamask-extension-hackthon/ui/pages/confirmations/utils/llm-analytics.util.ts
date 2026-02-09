import { ethers } from 'ethers';
import {
  Confirmation,
  SignatureRequestType,
} from '../types/confirm';

// A simplified interface for a transaction object that we expect.
// Based on the fields used in the PRD examples.
interface Transaction {
  from: string;
  to: string;
  value: string; // Hex string
  data?: string; // Hex string, optional
  gas?: string; // Hex string, optional
  gasPrice?: string; // Hex string, optional
  chainId: number | string;
}

// A simple mock for token info. In a real scenario, this would come from a token list.
const MOCK_TOKEN_INFO: { [key: string]: { name: string; symbol: string } } = {
  '0xdac17f958d2ee523a2206206994597c13d831ec7': {
    name: 'Tether USD',
    symbol: 'USDT',
  },
  '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2': {
    name: 'Wrapped Ether',
    symbol: 'WETH',
  },
};

// Function selectors for common ERC20 and other high-risk functions
const FUNCTION_SIGNATURES: { [key: string]: string } = {
  '0xa9059cbb': 'transfer(address,uint256)',
  '0x23b872dd': 'transferFrom(address,address,uint256)',
  '0x095ea7b3': 'approve(address,uint256)',
};

const getPromptTemplate = (type: 'plain_eth_transfer' | 'contract_interaction') => {
  if (type === 'plain_eth_transfer') {
    return `您是一位区块链安全专家。请从用户的角度分析以下区块链交易，并提供一个简短、易于理解的中文摘要。请重点关注该交易的潜在安全风险。

交易详情:
\${transaction_details}

您的分析应包括：
1.  对此交易目的的极简摘要 (例如: "从您的账户向一个地址发送 0.1 ETH")。
2.  清晰的风险评估 (low, medium, 或 high)。
3.  一句话解释与此交易相关的最大潜在风险 (例如: "接收地址是一个已知的诈骗地址", "这是一个常规转账，风险较低")。

请将您的回复格式化为一个JSON对象，包含两个键："analysis" (一个包含您的摘要和风险解释的字符串) 和 "riskLevel" (一个字符串: "low", "medium", 或 "high")。
您的整个回复必须是一个JSON对象。不要包含任何其他文本或格式。
"analysis" 字段的内容必须是中文。`;
  }
  // Default to the contract interaction prompt as it's the most comprehensive
  return `您是一位区块链安全专家。请从用户的角度分析以下智能合约交互，并提供一个简短、易于理解的中文摘要。请重点关注该交易的潜在安全风险，特别是该操作可能授予的权限，例如 'approve' 或其他危险函数。

交易详情:
\${transaction_details}

您的分析应包括：
1.  对此交易目的的极简摘要 (例如: "调用 Uniswap 的 'swap' 功能", "对一个未知合约进行 'approve' 授权")。
2.  对该合约交互的风险评估 (low, medium, 或 high)，尤其要高亮说明授权（approve）、权限提升等高危操作。
3.  一句话解释与此交易相关的最大潜在风险 (例如: "您正在授权该合约转移您的所有 WETH 代币，风险极高!", "这是一个常规的去中心化交易所交互，风险中等")。

请将您的回复格式化为一个JSON对象，包含两个键："analysis" (一个包含您的摘要和风险解释的字符串) 和 "riskLevel" (一个字符串: "low", "medium", 或 "high")。
您的整个回复必须是一个JSON对象。不要包含任何其他文本或格式。
"analysis" 字段的内容必须是中文。`;
};

/**
 * Analyzes transaction data to determine the type and decode if possible.
 * This is a simplified decoder for the PoC.
 */
const analyzeTransactionData = (tx: Transaction) => {
  if (!tx.data || tx.data === '0x') {
    return { type: 'plain_eth_transfer', decoded_data: null };
  }

  const selector = tx.data.slice(0, 10);
  const signature = FUNCTION_SIGNATURES[selector];

  if (signature?.startsWith('transfer')) {
    // Simplified decoding for transfer
    const recipient = `0x${tx.data.slice(34, 74)}`;
    const amount = `0x${tx.data.slice(74)}`;
    return {
      type: 'token_transfer',
      decoded_data: {
        function: signature,
        recipient,
        amount,
        token_info: MOCK_TOKEN_INFO[tx.to.toLowerCase()] || {
          name: 'Unknown Token',
          symbol: 'Unknown',
        },
      },
    };
  }

  if (signature?.startsWith('approve')) {
    // Simplified decoding for approve
    const spender = `0x${tx.data.slice(34, 74)}`;
    const amount = `0x${tx.data.slice(74)}`;
    return {
      type: 'contract_interaction',
      decoded_data: {
        function_name: 'approve',
        function_signature: signature,
        arguments: {
          spender,
          amount,
        },
      },
    };
  }

  return { type: 'contract_interaction', decoded_data: { raw_data: tx.data } };
};

/**
 * Formats a transaction into a detailed prompt for LLM analysis.
 *
 * @param transaction - The transaction object.
 * @returns A formatted prompt string, or null if the input is invalid.
 */
export const formatTransactionForLLM = (transaction: Transaction) => {
  if (!transaction || !transaction.from || !transaction.to) {
    return null;
  }

  const { type, decoded_data } = analyzeTransactionData(transaction);

  let transactionDetails: object;

  if (type === 'plain_eth_transfer') {
    transactionDetails = {
      from: transaction.from,
      to: transaction.to,
      value: transaction.value,
      gas: transaction.gas,
      gasPrice: transaction.gasPrice,
      chainId: transaction.chainId,
      type: 'plain_eth_transfer',
    };
  } else {
    // Covers 'token_transfer' and 'contract_interaction'
    transactionDetails = {
      from: transaction.from,
      to_contract: transaction.to,
      value: transaction.value,
      gas: transaction.gas,
      chainId: transaction.chainId,
      type,
      decoded_data,
    };
  }

  const templateType =
    type === 'plain_eth_transfer' ? 'plain_eth_transfer' : 'contract_interaction';
  const promptTemplate = getPromptTemplate(templateType);
  const finalPrompt = promptTemplate.replace(
    '${transaction_details}',
    JSON.stringify(transactionDetails, null, 2),
  );

  return finalPrompt;
};