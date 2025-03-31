import { useState, useEffect } from 'react'
import { useAccount, useContract, useSigner } from 'wagmi'
import { ethers } from 'ethers'
import ConnectWallet from '../components/ConnectWallet'
import AuthorizationInfo from '../components/AuthorizationInfo'
import ServiceCard from '../components/ServiceCard'
import ServiceForm from '../components/ServiceForm'
import ResultDisplay from '../components/ResultDisplay'

// 模拟ABI
const tokenAbi = [
  'function approve(address spender, uint256 amount) external returns (bool)',
  'function allowance(address owner, address spender) external view returns (uint256)',
  'function balanceOf(address account) external view returns (uint256)',
  'function transfer(address to, uint256 amount) external returns (bool)'
]

const payGateAbi = [
  'function requestService(uint serviceId, string calldata requestData) external returns (bytes32)',
  'function getServicePrice(uint serviceId) external view returns (uint256)',
  'function getAvailableServices() external view returns (uint[] memory)'
]

// 服务数据
const SERVICES = [
  { 
    id: 1, 
    name: '天气查询', 
    description: '查询指定城市的天气信息，支持全球主要城市', 
    price: '10', 
    endpoint: '/weather',
    example: JSON.stringify({city: 'Shanghai'}, null, 2)
  },
  { 
    id: 2, 
    name: 'FAQ问答', 
    description: '基于区块链和Web3知识库的问答服务', 
    price: '5', 
    endpoint: '/faq',
    example: JSON.stringify({question: '什么是MCP协议?'}, null, 2)
  },
  { 
    id: 3, 
    name: '文本翻译', 
    description: '将文本翻译成指定的目标语言', 
    price: '15', 
    endpoint: '/translate',
    example: JSON.stringify({text: 'Hello World', targetLang: 'zh'}, null, 2)
  }
]

export default function Home() {
  // Wagmi钩子
  const { address, isConnected } = useAccount()
  const { data: signer } = useSigner()

  // 状态管理
  const [selectedService, setSelectedService] = useState(null)
  const [responseData, setResponseData] = useState('')
  const [allowance, setAllowance] = useState('0')
  const [balance, setBalance] = useState('0')
  const [isLoading, setIsLoading] = useState(false)
  const [txHash, setTxHash] = useState('')

  // 合约地址（测试环境）
  const TOKEN_ADDRESS = process.env.NEXT_PUBLIC_TOKEN_ADDRESS || '0x5FbDB2315678afecb367f032d93F642f64180aa3'
  const PAY_GATE_ADDRESS = process.env.NEXT_PUBLIC_PAY_GATE_ADDRESS || '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512'
  
  // 获取合约实例
  const tokenContract = useContract({
    address: TOKEN_ADDRESS,
    abi: tokenAbi,
    signerOrProvider: signer,
  })

  const payGateContract = useContract({
    address: PAY_GATE_ADDRESS,
    abi: payGateAbi,
    signerOrProvider: signer,
  })

  // 初始化选中第一个服务
  useEffect(() => {
    if (SERVICES.length > 0 && !selectedService) {
      setSelectedService(SERVICES[0])
    }
  }, [selectedService])

  // 连接钱包后更新余额和授权额度
  useEffect(() => {
    if (isConnected && tokenContract && payGateContract && address) {
      updateBalanceAndAllowance()
    }
  }, [isConnected, tokenContract, payGateContract, address])

  // 更新余额和授权信息
  const updateBalanceAndAllowance = async () => {
    try {
      const balanceWei = await tokenContract.balanceOf(address)
      const allowanceWei = await tokenContract.allowance(address, PAY_GATE_ADDRESS)
      
      setBalance(ethers.utils.formatUnits(balanceWei, 18))
      setAllowance(ethers.utils.formatUnits(allowanceWei, 18))
    } catch (error) {
      console.error('更新余额和授权信息失败:', error)
    }
  }

  // 授权代币给支付网关
  const approveTokens = async () => {
    if (!selectedService || !tokenContract) return
    
    try {
      setIsLoading(true)
      
      // 授权1000个代币，方便演示多次使用
      const approveAmount = ethers.utils.parseUnits('1000', 18)
      const tx = await tokenContract.approve(PAY_GATE_ADDRESS, approveAmount)
      
      setTxHash(tx.hash)
      await tx.wait()
      await updateBalanceAndAllowance()
      
      setIsLoading(false)
    } catch (error) {
      console.error('授权失败:', error)
      setIsLoading(false)
    }
  }

  // 调用MCP服务
  const callService = async (requestData) => {
    if (!selectedService || !address) return
    
    try {
      setIsLoading(true)
      setResponseData('')
      
      // 准备请求数据
      let parsedData
      try {
        parsedData = JSON.parse(requestData)
      } catch (e) {
        parsedData = { rawData: requestData }
      }
      
      // 获取授权令牌
      const authResponse = await fetch('http://localhost:3001/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address })
      })
      
      if (!authResponse.ok) {
        throw new Error('获取授权令牌失败')
      }
      
      const { token } = await authResponse.json()
      
      // 调用MCP服务
      const response = await fetch(`http://localhost:3001/api/mcp${selectedService.endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          serviceId: selectedService.id,
          data: parsedData
        })
      })
      
      if (!response.ok) {
        throw new Error('服务调用失败')
      }
      
      const result = await response.json()
      setResponseData(JSON.stringify(result, null, 2))
      await updateBalanceAndAllowance()
      
      setIsLoading(false)
    } catch (error) {
      console.error('服务调用失败:', error)
      setResponseData(`错误: ${error.message}`)
      setIsLoading(false)
    }
  }

  // 选择服务
  const handleSelectService = (service) => {
    setSelectedService(service)
    setResponseData('')
  }

  return (
    <div className="container">
      <div className="header">
        <h1>链智付 - 通用MCP支付网关</h1>
        <ConnectWallet />
      </div>
      
      <AuthorizationInfo balance={balance} allowance={allowance} />
      
      {isConnected ? (
        <>
          <h2>选择服务</h2>
          <div className="service-list">
            {SERVICES.map((service) => (
              <ServiceCard 
                key={service.id}
                service={service}
                isSelected={selectedService?.id === service.id}
                onClick={handleSelectService}
              />
            ))}
          </div>
          
          {selectedService && (
            <>
              <ServiceForm 
                service={selectedService}
                allowance={allowance}
                isLoading={isLoading}
                onApprove={approveTokens}
                onSubmit={callService}
                txHash={txHash}
              />
              
              <ResultDisplay data={responseData} />
            </>
          )}
        </>
      ) : (
        <div className="card">
          <h2>欢迎使用链智付</h2>
          <p>链智付是一个基于区块链的通用MCP支付网关，让你可以使用代币一键调用各种服务。</p>
          <p>请连接钱包以开始使用服务。</p>
        </div>
      )}
    </div>
  )
} 