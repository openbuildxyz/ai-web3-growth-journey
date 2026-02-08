// Utility functions for Omni app

export function formatAddress(address: string): string {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

export function generateMockTransaction() {
  const addresses = [
    '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
    '0xAb5801a7D398351b8bE11C439e05C5B3259aeC9B',
    '0x4B20993Bc481177ec7E8f571ceCaE8A9e22C02db',
    '0x78731D3Ca6b7E34aC0F824c42a7cC18A495cabaB'
  ];
  
  const amounts = ['0.01', '0.05', '0.1', '0.5', '1.0', '2.0'];
  const times = ['2 min ago', '15 min ago', '1 hour ago', '3 hours ago', 'Yesterday'];
  
  return {
    from: addresses[Math.floor(Math.random() * addresses.length)],
    to: addresses[Math.floor(Math.random() * addresses.length)],
    amount: amounts[Math.floor(Math.random() * amounts.length)],
    time: times[Math.floor(Math.random() * times.length)],
    hash: `0x${Array.from({length: 64}, () => 
      '0123456789abcdef'[Math.floor(Math.random() * 16)]
    ).join('')}`
  };
}

export function simulateAIProcessing(message: string): Promise<string> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const responses = [
        `I've analyzed the content: "${message}". The key insights are...`,
        `Based on the video content, here are the main points...`,
        `AI analysis complete! The video covers these important topics...`,
        `🤖 Processing complete! Here's what I found...`
      ];
      resolve(responses[Math.floor(Math.random() * responses.length)]);
    }, 1500);
  });
}