import React, { memo, useState } from 'react'

// 直接导入图片
import 金T1 from '@/assets/img/金/t1/天雄星-豹子头-林冲.png'
import 金T2 from '@/assets/img/金/t2/天暴星-双头蛇-解珍.png'
import 金T3 from '@/assets/img/金/t3/天伤星-行者-武松.png'
import 木T1 from '@/assets/img/木/t1/天闲星-入云龙-公孙胜.png'
import 木T2 from '@/assets/img/木/t2/天剑星-地太岁-阮小二.png'
import 木T3 from '@/assets/img/木/t3/天威星-双鞭将-呼延灼.png'
import 水T1 from '@/assets/img/水/t1/天寿星-混江龙-李俊.png'
import 水T2 from '@/assets/img/水/t2/天勇星-大刀-关胜.png'
import 水T3 from '@/assets/img/水/t3/天损星-浪里白条-张顺.png'
import 火T1 from '@/assets/img/火/t1/天微星-九纹龙-史进.png'
import 火T2 from '@/assets/img/火/t2/天异星-赤发鬼-刘唐.png'
import 火T3 from '@/assets/img/火/t3/天哭星-双尾蝎-解宝.png'
import 土T1 from '@/assets/img/土/t1/天杀星-黑旋风-李逵.png'
import 土T2 from '@/assets/img/土/t2/天富星-扑天雕-李应.png'
import 土T3 from '@/assets/img/土/t3/天佑星-金枪手-徐宁.png'

// 角色信息映射
const characterInfo: Record<string, { name: string, title: string, star: string, atr:string }> = {
  '金-1': { name: '林冲', title: '豹子头', star: '天雄星',atr:'金' },
  '金-2': { name: '解珍', title: '双头蛇', star: '天暴星' ,atr:'金'},
  '金-3': { name: '武松', title: '行者', star: '天伤星' ,atr:'金'},
  '木-1': { name: '公孙胜', title: '入云龙', star: '天闲星' ,atr:'木'},
  '木-2': { name: '阮小二', title: '地太岁', star: '天剑星' ,atr:'木'},
  '木-3': { name: '呼延灼', title: '双鞭将', star: '天威星' ,atr:'木'},
  '水-1': { name: '李俊', title: '混江龙', star: '天寿星' ,atr:'水'},
  '水-2': { name: '关胜', title: '大刀', star: '天勇星' ,atr:'水'},
  '水-3': { name: '张顺', title: '浪里白条', star: '天损星',atr:'水' },
  '火-1': { name: '史进', title: '九纹龙', star: '天微星' ,atr:'火'},
  '火-2': { name: '刘唐', title: '赤发鬼', star: '天异星' ,atr:'火'},
  '火-3': { name: '解宝', title: '双尾蝎', star: '天哭星',atr:'火' },
  '土-1': { name: '李逵', title: '黑旋风', star: '天杀星' ,atr:'土'},
  '土-2': { name: '李应', title: '扑天雕', star: '天富星',atr:'土' },
  '土-3': { name: '徐宁', title: '金枪手', star: '天佑星' ,atr:'土'},
}

// 图片映射对象
const imageMap: Record<string, string> = {
  '金-1': 金T1,
  '金-2': 金T2,
  '金-3': 金T3,
  '木-1': 木T1,
  '木-2': 木T2,
  '木-3': 木T3,
  '水-1': 水T1,
  '水-2': 水T2,
  '水-3': 水T3,
  '火-1': 火T1,
  '火-2': 火T2,
  '火-3': 火T3,
  '土-1': 土T1,
  '土-2': 土T2,
  '土-3': 土T3,
}

interface CardProps {
  type: string
  level: number
  selected?: boolean
  onClick?: () => void
}

const Card: React.FC<CardProps> = ({ type, level, selected, onClick }) => {
  const imagePath = `${type}-${level}`
  const info = characterInfo[imagePath]
  
  return (
    <div 
      className={`relative cursor-pointer transition-all duration-300 ${
        selected ? 'scale-105 ring-2 ring-blue-500' : 'hover:scale-105'
      }`}
      onClick={onClick}
    >
      <div className="absolute top-0 left-0 right-0 bg-black bg-opacity-30 text-white p-1 rounded-t-lg z-10">
        <p className="text-center text-xs">{info.star}【{info.atr}】</p>
      </div>
      <img 
        src={imageMap[imagePath]} 
        alt={`${info.name}-${info.title}`}
        className="w-38 h-38 ml-[40px] mt-[30px] mb-[30px]"
      />
      <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-30 text-white p-1 rounded-b-lg">
        <p className="text-center text-sm font-medium">{info.name} - {info.title}</p>
        <p className="text-center text-xs">{type}系 T{level}级</p>
      </div>
    </div>
  )
}

const Buy = memo(() => {
  const [selectedType, setSelectedType] = useState<string>('')
  const [selectedLevel, setSelectedLevel] = useState<number>(0)

  const types = ['金', '木', '水', '火', '土']
  const levels = [1, 2, 3]

  return (
    <div className="pb-[100px] w-full min-h-screen p-8 bg-gray-50"> {/* 更改背景色为更浅的灰色 */}
 
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8">
        {types.map(type => (
          levels.map(level => (
            <Card
              key={`${type}-${level}`}
              type={type}
              level={level}
              selected={selectedType === type && selectedLevel === level}
              onClick={() => {
                setSelectedType(type)
                setSelectedLevel(level)
              }}
            />
          ))
        ))}
      </div>

      {selectedType && selectedLevel > 0 && (
        <div className="mt-8 text-center">
          <button 
            className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors text-base font-medium"
            onClick={() => {
              console.log('购买:', selectedType, 'T', selectedLevel)
            }}
          >
            购买 {selectedType}系 T{selectedLevel} 英雄
          </button>
        </div>
      )}
    </div>
  )
})

export default Buy