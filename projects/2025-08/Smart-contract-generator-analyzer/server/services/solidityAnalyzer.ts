export function validateSolidityCode(code: string): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // Basic validation checks
  if (!code.includes('pragma solidity')) {
    errors.push('Missing pragma solidity directive');
  }
  
  if (!code.includes('SPDX-License-Identifier')) {
    errors.push('Missing SPDX license identifier');
  }
  
  if (!code.includes('contract ')) {
    errors.push('No contract definition found');
  }
  
  // Check for balanced brackets
  const openBraces = (code.match(/{/g) || []).length;
  const closeBraces = (code.match(/}/g) || []).length;
  if (openBraces !== closeBraces) {
    errors.push('Unbalanced braces in contract');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

export function extractContractName(code: string): string {
  const match = code.match(/contract\s+(\w+)/);
  return match ? match[1] : 'Contract';
}

export function formatSolidityCode(code: string): string {
  // Basic formatting - in a real implementation, you'd use a proper Solidity formatter
  return code
    .split('\n')
    .map(line => line.trim())
    .join('\n')
    .replace(/;/g, ';\n')
    .replace(/{/g, ' {\n')
    .replace(/}/g, '\n}\n');
}
