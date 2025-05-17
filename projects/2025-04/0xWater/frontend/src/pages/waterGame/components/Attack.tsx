import React, { memo, useState } from 'react'

interface Character {
  name: string
  T: number
  hp: number
  maxHp: number
}

const Attack = memo(() => {
  const [playerCharacter, setPlayerCharacter] = useState<Character>({
    name: '霹雳火',
    T: 3,
    hp: 1,        // 修改为1
    maxHp: 1
  })

  const [enemyCharacter, setEnemyCharacter] = useState<Character>({
    name: '九纹龙',
    T: 1,
    hp: 0,        // 修改为0
    maxHp: 1
  })

 

  const HPBar: React.FC<{ hp: number; maxHp: number }> = ({ hp, maxHp }) => {
    const percentage = (hp / maxHp) * 100
    return (
      <div className="w-full bg-gray-200 h-2 rounded-full">
        <div
          className={`h-full rounded-full ${percentage > 50 ? 'bg-green-500' : percentage > 20 ? 'bg-yellow-500' : 'bg-red-500'}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    )
  }

  const CharacterStatus: React.FC<{ character: Character }> = ({ character }) => (
    <div className="bg-white p-4 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-2">
        <span className="font-medium">{character.name}</span>
        <span className="text-sm">L:{character.T}</span>
      </div>
      <div className="space-y-1">
        <HPBar hp={character.hp} maxHp={character.maxHp} />
        <div className="text-right text-sm">
          {character.hp}/{character.maxHp}
        </div>
      </div>
    </div>
  )

  return (
    <div className="w-full h-full bg-gray-100 p-4">
      <div className="max-w-4xl mx-auto">
        {/* 战斗区域 */}
        <div className="relative h-96 bg-gray-200 rounded-lg p-4 mb-4">
          {/* 敌方状态 */}
          <div className="absolute top-4 right-4 w-64">
            <CharacterStatus character={enemyCharacter} />
          </div>
          
          {/* 我方状态 */}
          <div className="absolute bottom-4 left-4 w-64">
            <CharacterStatus character={playerCharacter} />
          </div>
        </div>

        {/* 战斗信息 */}
        <div className="bg-white rounded-lg p-4 mb-4 min-h-[60px] text-center">
          
        </div>

       
      </div>
    </div>
  )
})

export default Attack