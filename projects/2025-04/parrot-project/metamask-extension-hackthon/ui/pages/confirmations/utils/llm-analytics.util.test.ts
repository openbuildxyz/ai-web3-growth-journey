import { formatTransactionForLLM } from './llm-analytics.util';

describe('formatTransactionForLLM', () => {
  const MOCK_TRANSACTION_BASE = {
    from: '0x1234567890123456789012345678901234567890',
    gas: '0x5208', // 21000
    gasPrice: '0x4A817C800', // 20 Gwei
    chainId: '1',
  };

  it('should return null for invalid input', () => {
    // @ts-expect-error - Testing invalid input
    expect(formatTransactionForLLM(null)).toBeNull();
    // @ts-expect-error - Testing invalid input
    expect(formatTransactionForLLM({})).toBeNull();
  });

  it('should format a plain ETH transfer correctly', () => {
    const tx = {
      ...MOCK_TRANSACTION_BASE,
      to: '0x0987654321098765432109876543210987654321',
      value: '0xDE0B6B3A7640000', // 1 ETH
      data: '0x',
    };

    const result = formatTransactionForLLM(tx);
    if (!result) {
      throw new Error('Test failed: formatTransactionForLLM returned null');
    }
    const match = result.match(/\{.*\}/su);
    if (!match) {
      throw new Error('Test failed: Could not find JSON in prompt');
    }
    const details = JSON.parse(match[0]);
    expect(details.type).toBe('plain_eth_transfer');
    expect(details.to).toBe(tx.to);
  });

  it('should format an ERC20 token transfer correctly', () => {
    const tx = {
      ...MOCK_TRANSACTION_BASE,
      to: '0xdac17f958d2ee523a2206206994597c13d831ec7', // USDT Contract
      value: '0x0',
      // transfer(address to, uint256 amount)
      data: '0xa9059cbb000000000000000000000000a1a2a3a4a5a6a7a8a9a0a1a2a3a4a5a6a7a8a9a000000000000000000000000000000000000000000000000000000005f5e100', // 100 USDT
    };

    const result = formatTransactionForLLM(tx);
    if (!result) {
      throw new Error('Test failed: formatTransactionForLLM returned null');
    }
    const match = result.match(/\{.*\}/su);
    if (!match) {
      throw new Error('Test failed: Could not find JSON in prompt');
    }
    const details = JSON.parse(match[0]);
    expect(details.type).toBe('token_transfer');
    expect(details.to_contract).toBe(tx.to);
    expect(details.decoded_data.function).toContain('transfer');
    expect(details.decoded_data.token_info.symbol).toBe('USDT');
  });

  it('should format a high-risk "approve" transaction correctly and use the contract interaction prompt', () => {
    const unlimitedApproveAmount =
      '115792089237316195423570985008687907853269984665640564039457584007913129639935';
    const tx = {
      ...MOCK_TRANSACTION_BASE,
      to: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2', // WETH Contract
      value: '0x0',
      // approve(address spender, uint256 amount)
      data: `0x095ea7b30000000000000000000000007a250d5630b4cf539739df2c5dacb4c659f2488d00000000000000000000000000000000000000000000000000000000ffffffff`,
    };
    // A bit of a hack to get the full unlimited amount in the data string
    tx.data = tx.data.replace(
      'ffffffff',
      BigInt(unlimitedApproveAmount).toString(16).padStart(64, '0'),
    );


    const result = formatTransactionForLLM(tx);
    if (!result) {
      throw new Error('Test failed: formatTransactionForLLM returned null');
    }
    const match = result.match(/\{.*\}/su);
    if (!match) {
      throw new Error('Test failed: Could not find JSON in prompt');
    }
    const details = JSON.parse(match[0]);
    expect(details.type).toBe('contract_interaction');
    expect(details.decoded_data.function_name).toBe('approve');
    expect(details.decoded_data.arguments.spender).toBe(
      '0x7a250d5630b4cf539739df2c5dacb4c659f2488d',
    );
    expect(BigInt(details.decoded_data.arguments.amount).toString()).toBe(
      unlimitedApproveAmount,
    );
  });
});