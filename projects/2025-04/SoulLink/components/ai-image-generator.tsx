"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import { Sparkles, Download, Loader2, FileText, Palette, ArrowRight } from "lucide-react"

interface AIImageGeneratorProps {
  onImagesGenerated: (images: string[]) => void
  onPosterCreated: (data: any) => void
  onImageSelected: (image: string) => void
  account: string
}

export default function AIImageGenerator({
  onImagesGenerated,
  onPosterCreated,
  onImageSelected,
  account,
}: AIImageGeneratorProps) {
  const [prompt, setPrompt] = useState("")
  const [style, setStyle] = useState("portrait")
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedImages, setGeneratedImages] = useState<string[]>([])

  // 海报编辑相关状态
  const [selectedImage, setSelectedImage] = useState<string>("")
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [textColor, setTextColor] = useState("#ffffff")
  const [fontSize, setFontSize] = useState([24])
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // 预设的AI艺术图片
  const aiArtImages = [
    "/images/ai-art-1.png", // 数字故障艺术风格女性肖像
    "/images/ai-art-2.png", // 彩色数字艺术女性人物
    "/images/ai-art-3.png", // 赛博朋克风格数字化人物
    "/images/ai-art-4.png", // VR/未来主义风格人物
  ]

  const generateImages = async () => {
    if (!prompt.trim()) return

    setIsGenerating(true)
    // 重置之前的选择
    setSelectedImage("")

    try {
      // 模拟AI图像生成过程
      await new Promise((resolve) => setTimeout(resolve, 3000))

      // 根据提示词和风格选择不同的图片组合
      let selectedImages: string[] = []

      if (style === "cyberpunk" || prompt.toLowerCase().includes("cyber") || prompt.toLowerCase().includes("digital")) {
        selectedImages = [aiArtImages[2], aiArtImages[3], aiArtImages[0]] // 更偏向赛博朋克风格
      } else if (
        style === "portrait" ||
        prompt.toLowerCase().includes("portrait") ||
        prompt.toLowerCase().includes("face")
      ) {
        selectedImages = [aiArtImages[0], aiArtImages[1], aiArtImages[2]] // 更偏向人物肖像
      } else if (
        style === "abstract" ||
        prompt.toLowerCase().includes("abstract") ||
        prompt.toLowerCase().includes("art")
      ) {
        selectedImages = [aiArtImages[1], aiArtImages[3], aiArtImages[0]] // 更偏向抽象艺术
      } else {
        // 默认随机选择3张
        const shuffled = [...aiArtImages].sort(() => 0.5 - Math.random())
        selectedImages = shuffled.slice(0, 3)
      }

      setGeneratedImages(selectedImages)
      onImagesGenerated(selectedImages)
    } catch (error) {
      console.error("生成图像失败:", error)
    } finally {
      setIsGenerating(false)
    }
  }

  const downloadImage = (e: React.MouseEvent, imageUrl: string, index: number) => {
    // 阻止事件冒泡，避免触发图像选择
    e.stopPropagation()
    const link = document.createElement("a")
    link.href = imageUrl
    link.download = `ai-generated-${index + 1}.png`
    link.click()
  }

  const createPoster = () => {
    if (!selectedImage || !title) return

    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // 设置画布尺寸
    canvas.width = 800
    canvas.height = 1000

    // 创建图像对象
    const img = new Image()
    img.crossOrigin = "anonymous"
    img.onload = () => {
      // 绘制背景图像
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

      // 添加半透明遮罩
      ctx.fillStyle = "rgba(0, 0, 0, 0.4)"
      ctx.fillRect(0, canvas.height - 300, canvas.width, 300)

      // 设置文字样式
      ctx.fillStyle = textColor
      ctx.font = `bold ${fontSize[0]}px Arial`
      ctx.textAlign = "center"

      // 绘制标题
      ctx.fillText(title, canvas.width / 2, canvas.height - 200)

      // 绘制描述
      if (description) {
        ctx.font = `${fontSize[0] * 0.6}px Arial`
        const words = description.split(" ")
        let line = ""
        let y = canvas.height - 150

        for (let n = 0; n < words.length; n++) {
          const testLine = line + words[n] + " "
          const metrics = ctx.measureText(testLine)
          const testWidth = metrics.width
          if (testWidth > canvas.width - 100 && n > 0) {
            ctx.fillText(line, canvas.width / 2, y)
            line = words[n] + " "
            y += fontSize[0] * 0.8
          } else {
            line = testLine
          }
        }
        ctx.fillText(line, canvas.width / 2, y)
      }

      // 添加钱包地址水印
      ctx.font = "12px Arial"
      ctx.fillStyle = "rgba(255, 255, 255, 0.7)"
      ctx.textAlign = "right"
      ctx.fillText(`Created by: ${account.slice(0, 6)}...${account.slice(-4)}`, canvas.width - 20, canvas.height - 20)

      // 创建海报数据
      const posterData = {
        title,
        description,
        image: selectedImage,
        canvas: canvas.toDataURL(),
        creator: account,
        timestamp: Date.now(),
      }

      onPosterCreated(posterData)
    }

    img.src = selectedImage
  }

  const downloadPoster = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const link = document.createElement("a")
    link.download = `poster-${Date.now()}.png`
    link.href = canvas.toDataURL()
    link.click()
  }

  // 修改图片选择处理函数
  const handleImageSelect = (image: string) => {
    setSelectedImage(image)
    onImageSelected(image)
  }

  // 获取图片描述
  const getImageDescription = (imageUrl: string) => {
    const index = aiArtImages.indexOf(imageUrl)
    const descriptions = [
      "数字故障艺术风格，彩色人物肖像",
      "赛博朋克风格，未来主义数字艺术",
      "像素化数字代码艺术，科技感强烈",
      "VR虚拟现实主题，前卫艺术风格",
    ]
    return descriptions[index] || "AI生成的数字艺术作品"
  }

  return (
    <div className="space-y-6">
      {/* AI图像生成器 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-600" />
            AI图像生成器
          </CardTitle>
          <CardDescription>输入关键词和描述，AI将为您生成个性化的数字艺术作品</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="prompt">生成提示词</Label>
            <Textarea
              id="prompt"
              placeholder="描述您想要的图像风格，例如：赛博朋克风格的数字艺术，故障艺术效果，未来主义肖像..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="min-h-[100px]"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="style">图像风格</Label>
            <div className="flex gap-2 flex-wrap">
              {[
                { key: "portrait", label: "人物肖像" },
                { key: "cyberpunk", label: "赛博朋克" },
                { key: "abstract", label: "抽象艺术" },
                { key: "digital", label: "数字艺术" },
                { key: "glitch", label: "故障艺术" },
              ].map((styleOption) => (
                <Badge
                  key={styleOption.key}
                  variant={style === styleOption.key ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => setStyle(styleOption.key)}
                >
                  {styleOption.label}
                </Badge>
              ))}
            </div>
          </div>

          <Button onClick={generateImages} disabled={isGenerating || !prompt.trim()} className="w-full">
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                AI正在创作中...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                生成AI艺术作品
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* 生成的图像展示 */}
      {generatedImages.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>AI生成的艺术作品</CardTitle>
            <CardDescription>点击选择您喜欢的数字艺术作品，将自动跳转到NFT铸造页面</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {generatedImages.map((image, index) => (
                <div key={index} className="relative group">
                  <div
                    className={`relative cursor-pointer border-2 rounded-lg overflow-hidden transition-all duration-200 hover:shadow-lg ${
                      selectedImage === image
                        ? "border-purple-500 ring-2 ring-purple-200"
                        : "border-gray-200 hover:border-purple-300"
                    }`}
                    onClick={() => handleImageSelect(image)}
                  >
                    <img
                      src={image || "/placeholder.svg"}
                      alt={`AI Generated Art ${index + 1}`}
                      className="w-full h-48 object-cover"
                    />

                    {/* 选中状态指示器 */}
                    {selectedImage === image && (
                      <div className="absolute top-2 right-2">
                        <Badge className="bg-purple-500 text-white">已选择</Badge>
                      </div>
                    )}

                    {/* 点击提示 */}
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-200 rounded-lg flex items-center justify-center">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity text-white text-center">
                        <ArrowRight className="w-8 h-8 mx-auto mb-2" />
                        <p className="text-sm font-medium">点击选择并铸造NFT</p>
                      </div>
                    </div>
                  </div>

                  {/* 图片描述和下载按钮 */}
                  <div className="mt-2 space-y-2">
                    <p className="text-xs text-gray-600 text-center">{getImageDescription(image)}</p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => downloadImage(e, image, index)}
                      className="w-full"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      下载艺术作品
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {/* 选择提示 */}
            {generatedImages.length > 0 && !selectedImage && (
              <div className="mt-4 p-4 bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg text-center">
                <p className="text-purple-800 font-medium">✨ 点击任意艺术作品即可自动跳转到NFT铸造页面</p>
                <p className="text-sm text-purple-600 mt-1">这些独特的数字艺术作品将成为您专属的NFT收藏</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* 海报编辑器 - 只在选中图像时显示 */}
      {selectedImage && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600" />
              海报编辑器 (可选)
            </CardTitle>
            <CardDescription>您可以为选中的艺术作品添加文字信息，或直接跳转到NFT铸造</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">标题 (可选)</Label>
              <Input
                id="title"
                placeholder="为您的数字艺术作品起个名字"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">艺术描述 (可选)</Label>
              <Textarea
                id="description"
                placeholder="描述这件艺术作品的创作理念或特色..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="min-h-[100px]"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="textColor">文字颜色</Label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    id="textColor"
                    value={textColor}
                    onChange={(e) => setTextColor(e.target.value)}
                    className="w-8 h-8 rounded border"
                  />
                  <span className="text-sm text-gray-600">{textColor}</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label>字体大小: {fontSize[0]}px</Label>
                <Slider value={fontSize} onValueChange={setFontSize} max={48} min={16} step={2} className="w-full" />
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={createPoster} disabled={!selectedImage || !title} className="flex-1">
                <Palette className="w-4 h-4 mr-2" />
                创建艺术海报
              </Button>
              <Button variant="outline" onClick={downloadPoster} disabled={!selectedImage || !title}>
                <Download className="w-4 h-4 mr-2" />
                下载海报
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 隐藏的画布用于生成海报 */}
      <canvas ref={canvasRef} className="hidden" width={800} height={1000} />

      {/* 海报预览 */}
      {selectedImage && title && (
        <Card>
          <CardHeader>
            <CardTitle>艺术海报预览</CardTitle>
            <CardDescription>您的个性化艺术海报预览，可以直接用于NFT铸造</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative max-w-sm mx-auto">
              <img src={selectedImage || "/placeholder.svg"} alt="Art poster preview" className="w-full rounded-lg" />
              <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-60 text-white p-4 rounded-b-lg">
                <h3 className="font-bold text-lg" style={{ color: textColor, fontSize: `${fontSize[0] * 0.6}px` }}>
                  {title}
                </h3>
                {description && (
                  <p className="text-sm mt-1 opacity-90" style={{ fontSize: `${fontSize[0] * 0.4}px` }}>
                    {description.slice(0, 100)}...
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
