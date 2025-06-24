"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Upload, ExternalLink, CheckCircle, Loader2, Sparkles } from "lucide-react"

interface NFTMinterProps {
  posterData: any
  selectedImage: string
  account: string
  shouldAutoMint: boolean
  onAutoMintComplete: () => void
}

export default function NFTMinter({
  posterData,
  selectedImage,
  account,
  shouldAutoMint,
  onAutoMintComplete,
}: NFTMinterProps) {
  const [nftName, setNftName] = useState("")
  const [nftDescription, setNftDescription] = useState("")
  const [mintPrice, setMintPrice] = useState("0.001")
  const [isMinting, setIsMinting] = useState(false)
  const [mintingStep, setMintingStep] = useState(0)
  const [ipfsHash, setIpfsHash] = useState("")
  const [nftTokenId, setNftTokenId] = useState("")
  const [nftData, setNftData] = useState<any>(null)
  const [isAutoMinting, setIsAutoMinting] = useState(false)

  const mintingSteps = ["准备铸造", "上传到IPFS", "创建元数据", "调用智能合约", "确认交易", "铸造完成"]

  // 监听自动铸造触发
  useEffect(() => {
    if (shouldAutoMint && selectedImage && !isAutoMinting && !nftData) {
      startAutoMint()
    }
  }, [shouldAutoMint, selectedImage, isAutoMinting, nftData])

  const startAutoMint = async () => {
    setIsAutoMinting(true)
    setIsMinting(true)
    setMintingStep(0)

    // 自动设置NFT信息
    const autoName = `AI Generated NFT #${Math.floor(Math.random() * 10000)}`
    const autoDescription = "AI生成的个性化NFT，独一无二的数字艺术作品"
    setNftName(autoName)
    setNftDescription(autoDescription)

    try {
      // 步骤1: 准备铸造
      setMintingStep(1)
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // 步骤2: 上传到IPFS
      setMintingStep(2)
      await new Promise((resolve) => setTimeout(resolve, 1000))
      const mockImageHash = `QmYx${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 8)}`
      setIpfsHash(mockImageHash)

      // 步骤3: 创建元数据
      setMintingStep(3)
      await new Promise((resolve) => setTimeout(resolve, 1000))
      const metadata = {
        name: autoName,
        description: autoDescription,
        image: `ipfs://${mockImageHash}`,
        attributes: [
          {
            trait_type: "Creator",
            value: account,
          },
          {
            trait_type: "Creation Date",
            value: new Date().toISOString(),
          },
          {
            trait_type: "Type",
            value: "AI Generated Poster",
          },
          {
            trait_type: "Rarity",
            value: ["Common", "Rare", "Epic", "Legendary"][Math.floor(Math.random() * 4)],
          },
        ],
      }

      const mockMetadataHash = `QmMd${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 8)}`

      // 步骤4: 调用智能合约
      setMintingStep(4)
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // 生成假的合约地址和交易哈希
      const mockContractAddress = `0x${Math.random().toString(16).substring(2, 10)}${Math.random().toString(16).substring(2, 10)}${Math.random().toString(16).substring(2, 10)}${Math.random().toString(16).substring(2, 10)}`
      const mockTxHash = `0x${Math.random().toString(16).substring(2, 10)}${Math.random().toString(16).substring(2, 10)}${Math.random().toString(16).substring(2, 10)}${Math.random().toString(16).substring(2, 10)}${Math.random().toString(16).substring(2, 10)}${Math.random().toString(16).substring(2, 10)}${Math.random().toString(16).substring(2, 6)}`

      // 步骤5: 确认交易
      setMintingStep(5)
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // 步骤6: 铸造完成
      setMintingStep(6)
      const tokenId = Math.floor(Math.random() * 10000).toString()

      // 设置完整的NFT数据
      const nftData = {
        tokenId,
        contractAddress: mockContractAddress,
        transactionHash: mockTxHash,
        ipfsImageHash: mockImageHash,
        ipfsMetadataHash: mockMetadataHash,
        name: autoName,
        description: autoDescription,
        creator: account,
        mintedAt: new Date().toISOString(),
        network: "Ethereum Mainnet",
        gasUsed: (Math.random() * 0.01 + 0.005).toFixed(6),
      }

      setNftTokenId(tokenId)
      setNftData(nftData)
      onAutoMintComplete()
    } catch (error) {
      console.error("自动铸造NFT失败:", error)
    } finally {
      setIsMinting(false)
      setIsAutoMinting(false)
    }
  }

  const uploadToIPFS = async (data: any) => {
    // 模拟IPFS上传过程
    await new Promise((resolve) => setTimeout(resolve, 2000))
    const mockHash = `Qm${Math.random().toString(36).substring(2, 15)}`
    setIpfsHash(mockHash)
    return mockHash
  }

  const mintNFT = async () => {
    if (!posterData || !nftName) return

    setIsMinting(true)
    setMintingStep(0)

    try {
      // 步骤1: 上传到IPFS
      setMintingStep(1)
      await new Promise((resolve) => setTimeout(resolve, 2000))
      const mockImageHash = `QmYx${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 8)}`
      setIpfsHash(mockImageHash)

      // 步骤2: 创建元数据
      setMintingStep(2)
      await new Promise((resolve) => setTimeout(resolve, 1500))
      const metadata = {
        name: nftName,
        description: nftDescription,
        image: `ipfs://${mockImageHash}`,
        attributes: [
          {
            trait_type: "Creator",
            value: account,
          },
          {
            trait_type: "Creation Date",
            value: new Date().toISOString(),
          },
          {
            trait_type: "Type",
            value: "AI Generated Poster",
          },
          {
            trait_type: "Rarity",
            value: ["Common", "Rare", "Epic", "Legendary"][Math.floor(Math.random() * 4)],
          },
        ],
      }

      const mockMetadataHash = `QmMd${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 8)}`

      // 步骤3: 调用智能合约
      setMintingStep(3)
      await new Promise((resolve) => setTimeout(resolve, 3000))

      // 生成假的合约地址和交易哈希
      const mockContractAddress = `0x${Math.random().toString(16).substring(2, 10)}${Math.random().toString(16).substring(2, 10)}${Math.random().toString(16).substring(2, 10)}${Math.random().toString(16).substring(2, 10)}`
      const mockTxHash = `0x${Math.random().toString(16).substring(2, 10)}${Math.random().toString(16).substring(2, 10)}${Math.random().toString(16).substring(2, 10)}${Math.random().toString(16).substring(2, 10)}${Math.random().toString(16).substring(2, 10)}${Math.random().toString(16).substring(2, 10)}${Math.random().toString(16).substring(2, 6)}`

      // 步骤4: 确认交易
      setMintingStep(4)
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // 步骤5: 铸造完成
      setMintingStep(5)
      const tokenId = Math.floor(Math.random() * 10000).toString()

      // 设置完整的NFT数据
      const nftData = {
        tokenId,
        contractAddress: mockContractAddress,
        transactionHash: mockTxHash,
        ipfsImageHash: mockImageHash,
        ipfsMetadataHash: mockMetadataHash,
        name: nftName,
        description: nftDescription,
        creator: account,
        mintedAt: new Date().toISOString(),
        network: "Ethereum Mainnet",
        gasUsed: (Math.random() * 0.01 + 0.005).toFixed(6),
      }

      setNftTokenId(tokenId)
      setNftData(nftData)
    } catch (error) {
      console.error("铸造NFT失败:", error)
    } finally {
      setIsMinting(false)
    }
  }

  const openOnOpenSea = () => {
    // 模拟OpenSea链接
    const url = `https://testnets.opensea.io/assets/ethereum/${account}/${nftTokenId}`
    window.open(url, "_blank")
  }

  // 如果正在自动铸造，显示特殊的Loading界面
  if (isAutoMinting || (shouldAutoMint && selectedImage && !nftData)) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-white animate-pulse" />
            </div>
            <CardTitle className="text-2xl bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              正在为您铸造NFT...
            </CardTitle>
            <CardDescription className="text-lg">AI生成的图像正在转换为独一无二的NFT</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">铸造进度</span>
                <span className="text-sm text-gray-500">{mintingStep}/6</span>
              </div>
              <Progress value={(mintingStep / 6) * 100} className="w-full h-3" />
              <p className="text-center text-gray-600 font-medium">{mintingSteps[mintingStep] || "准备开始..."}</p>
            </div>

            {/* 显示选中的图像 */}
            <div className="max-w-sm mx-auto">
              <div className="relative">
                <img
                  src={selectedImage || "/placeholder.svg"}
                  alt="Selected image for NFT"
                  className="w-full rounded-lg border-2 border-purple-200"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent rounded-lg flex items-end justify-center p-4">
                  <div className="text-white text-center">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                    <p className="text-sm font-medium">转换为NFT中...</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="text-center space-y-2">
              <p className="text-sm text-gray-600">
                <strong>NFT名称:</strong> {nftName}
              </p>
              <p className="text-sm text-gray-600">
                <strong>创建者:</strong> {account.slice(0, 6)}...{account.slice(-4)}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // 如果没有海报数据但有选中图像，显示简化版本
  if (!posterData && selectedImage) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="w-5 h-5 text-green-600" />
              NFT铸造
            </CardTitle>
            <CardDescription>您选中的AI生成图像已准备好铸造为NFT</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="max-w-sm mx-auto">
              <img
                src={selectedImage || "/placeholder.svg"}
                alt="Selected image for NFT"
                className="w-full rounded-lg border"
              />
            </div>

            {nftData && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="font-medium text-green-800">NFT铸造成功！</span>
                </div>
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Token ID:</span>
                      <div className="font-mono font-bold">#{nftData.tokenId}</div>
                    </div>
                    <div>
                      <span className="text-gray-600">Gas费用:</span>
                      <div className="font-mono">{nftData.gasUsed} ETH</div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div>
                      <span className="text-xs text-gray-600">合约地址:</span>
                      <div className="font-mono text-xs bg-gray-100 p-2 rounded break-all">
                        {nftData.contractAddress}
                      </div>
                    </div>

                    <div>
                      <span className="text-xs text-gray-600">交易哈希:</span>
                      <div className="font-mono text-xs bg-gray-100 p-2 rounded break-all">
                        {nftData.transactionHash}
                      </div>
                    </div>

                    <div>
                      <span className="text-xs text-gray-600">IPFS图像哈希:</span>
                      <div className="font-mono text-xs bg-gray-100 p-2 rounded break-all">{nftData.ipfsImageHash}</div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={openOnOpenSea} className="flex-1">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      OpenSea
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(`https://etherscan.io/tx/${nftData.transactionHash}`, "_blank")}
                      className="flex-1"
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Etherscan
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!posterData && !selectedImage) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5 text-green-600" />
            NFT铸造
          </CardTitle>
          <CardDescription>请先在AI生成Tab中选择图像或创建海报</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <Upload className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>暂无图像或海报数据</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5 text-green-600" />
            NFT铸造
          </CardTitle>
          <CardDescription>将您的个性化海报铸造为NFT，存储在区块链上确保唯一性和可交易性</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nftName">NFT名称</Label>
            <Input
              id="nftName"
              placeholder="为您的NFT起一个独特的名字"
              value={nftName}
              onChange={(e) => setNftName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="nftDescription">NFT描述</Label>
            <Input
              id="nftDescription"
              placeholder="描述这个NFT的特色和意义"
              value={nftDescription}
              onChange={(e) => setNftDescription(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="mintPrice">铸造费用 (ETH)</Label>
            <Input
              id="mintPrice"
              type="number"
              step="0.001"
              value={mintPrice}
              onChange={(e) => setMintPrice(e.target.value)}
            />
          </div>

          {isMinting && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">铸造进度</span>
                <span className="text-sm text-gray-500">{mintingStep}/5</span>
              </div>
              <Progress value={(mintingStep / 5) * 100} className="w-full" />
              <p className="text-sm text-gray-600">{mintingSteps[mintingStep] || "准备开始..."}</p>
            </div>
          )}

          <Button onClick={mintNFT} disabled={isMinting || !nftName} className="w-full">
            {isMinting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                铸造中...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                铸造NFT ({mintPrice} ETH)
              </>
            )}
          </Button>

          {ipfsHash && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-800">IPFS存储成功</span>
              </div>
              <p className="text-xs text-blue-600 break-all">IPFS Hash: {ipfsHash}</p>
            </div>
          )}

          {nftData && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="font-medium text-green-800">NFT铸造成功！</span>
              </div>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Token ID:</span>
                    <div className="font-mono font-bold">#{nftData.tokenId}</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Gas费用:</span>
                    <div className="font-mono">{nftData.gasUsed} ETH</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div>
                    <span className="text-xs text-gray-600">合约地址:</span>
                    <div className="font-mono text-xs bg-gray-100 p-2 rounded break-all">{nftData.contractAddress}</div>
                  </div>

                  <div>
                    <span className="text-xs text-gray-600">交易哈希:</span>
                    <div className="font-mono text-xs bg-gray-100 p-2 rounded break-all">{nftData.transactionHash}</div>
                  </div>

                  <div>
                    <span className="text-xs text-gray-600">IPFS图像哈希:</span>
                    <div className="font-mono text-xs bg-gray-100 p-2 rounded break-all">{nftData.ipfsImageHash}</div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={openOnOpenSea} className="flex-1">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    OpenSea
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(`https://etherscan.io/tx/${nftData.transactionHash}`, "_blank")}
                    className="flex-1"
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Etherscan
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 海报预览 */}
      <Card>
        <CardHeader>
          <CardTitle>即将铸造的NFT</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="max-w-sm mx-auto">
            <img src={posterData.canvas || "/placeholder.svg"} alt="NFT Preview" className="w-full rounded-lg border" />
            <div className="mt-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">创建者:</span>
                <span className="text-sm font-mono">
                  {account.slice(0, 6)}...{account.slice(-4)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">创建时间:</span>
                <span className="text-sm">{new Date(posterData.timestamp).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
