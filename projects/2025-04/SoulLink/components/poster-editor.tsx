"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Slider } from "@/components/ui/slider"
import { FileText, Download, Palette } from "lucide-react"

interface PosterEditorProps {
  generatedImages: string[]
  onPosterCreated: (data: any) => void
  account: string
}

export default function PosterEditor({ generatedImages, onPosterCreated, account }: PosterEditorProps) {
  const [selectedImage, setSelectedImage] = useState<string>("")
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [textColor, setTextColor] = useState("#ffffff")
  const [fontSize, setFontSize] = useState([24])
  const canvasRef = useRef<HTMLCanvasElement>(null)

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

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600" />
            海报编辑器
          </CardTitle>
          <CardDescription>选择AI生成的图像，添加个人信息，创建独特的自我介绍海报</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {generatedImages.length > 0 && (
            <div className="space-y-2">
              <Label>选择背景图像</Label>
              <div className="grid grid-cols-3 gap-2">
                {generatedImages.map((image, index) => (
                  <div
                    key={index}
                    className={`relative cursor-pointer border-2 rounded-lg overflow-hidden ${
                      selectedImage === image ? "border-blue-500" : "border-gray-200"
                    }`}
                    onClick={() => setSelectedImage(image)}
                  >
                    <img
                      src={image || "/placeholder.svg"}
                      alt={`Option ${index + 1}`}
                      className="w-full h-24 object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="title">标题</Label>
            <Input
              id="title"
              placeholder="输入您的姓名或标题"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">自我介绍</Label>
            <Textarea
              id="description"
              placeholder="简单介绍一下自己..."
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
              创建海报
            </Button>
            <Button variant="outline" onClick={downloadPoster} disabled={!selectedImage || !title}>
              <Download className="w-4 h-4 mr-2" />
              下载
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 隐藏的画布用于生成海报 */}
      <canvas ref={canvasRef} className="hidden" width={800} height={1000} />

      {/* 预览区域 */}
      {selectedImage && title && (
        <Card>
          <CardHeader>
            <CardTitle>海报预览</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative max-w-sm mx-auto">
              <img src={selectedImage || "/placeholder.svg"} alt="Poster preview" className="w-full rounded-lg" />
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
