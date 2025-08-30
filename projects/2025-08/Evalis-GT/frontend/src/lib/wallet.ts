// Minimal MetaMask connect helper (placeholder for full wagmi integration)
export async function connectWallet(): Promise<string | null> {
  const anyWindow = window as any;
  if (!anyWindow.ethereum) {
    alert('MetaMask not found');
    return null;
  }
  const accounts = await anyWindow.ethereum.request({ method: 'eth_requestAccounts' });
  return accounts?.[0] || null;
}
