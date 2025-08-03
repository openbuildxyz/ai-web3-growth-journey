import React, { useEffect, useState } from 'react'
import { ethers } from 'ethers'

declare global {
  interface Window {
    ethereum?: any
  }
}

const MetaMaskConnector: React.FC = () => {
  const [account, setAccount] = useState<string | null>(null)

  const isMetaMaskInstalled = () => typeof window.ethereum !== 'undefined'

  const connectWallet = async () => {
    if (!isMetaMaskInstalled()) {
      alert('请先安装 MetaMask 插件！')
      return
    }

    try {
      const provider = new ethers.BrowserProvider(window.ethereum)
      const accounts = await provider.send('eth_requestAccounts', [])
      setAccount(accounts[0])

      // 可选：获取余额
      const balance = await provider.getBalance(accounts[0])
      console.log('余额:', ethers.formatEther(balance))
    } catch (err) {
      console.error('连接失败:', err)
    }
  }

  useEffect(() => {
    if (window.ethereum) {
      const handleAccountsChanged = (accounts: string[]) => {
        setAccount(accounts[0] || null)
      }

      window.ethereum.on('accountsChanged', handleAccountsChanged)

      return () => {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged)
      }
    }
  }, [])

  return (
    <div style={{ padding: 20 }}>
      {account ? (
        <div>
          <p>当前账户: {account}</p>
          <button onClick={() => setAccount(null)}>断开连接</button>
        </div>
      ) : (
        <button onClick={connectWallet}>连接 MetaMask 钱包</button>
      )}
    </div>
  )
}

export default MetaMaskConnector