'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageCircle, Heart, UserPlus, Send } from 'lucide-react';
import { WalletConnect } from '@/components/wallet-connect';
import { Chat } from '@/components/chat';

export default function MakeFriendsPage() {
  const [activeTab, setActiveTab] = useState('mood');
  const [message, setMessage] = useState('');
  const [selectedRecipient, setSelectedRecipient] = useState<string | null>(null);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);

  // 模拟数据
  const moodCards = [
    {
      id: 1,
      user: {
        name: 'Alice',
        avatar: '/avatars/alice.png',
        mood: 'Happy',
        address: '0x1234567890123456789012345678901234567890',
      },
      content: '今天和AI聊得很开心，学到了很多新知识！',
      timestamp: '2024-03-20 10:30',
      tags: ['学习', '开心', '成长'],
    },
    {
      id: 2,
      user: {
        name: 'Bob',
        avatar: '/avatars/bob.png',
        mood: 'Calm',
        address: '0x2345678901234567890123456789012345678901',
      },
      content: '通过AI的引导，我找到了内心的平静。',
      timestamp: '2024-03-20 09:15',
      tags: ['平静', '冥想', '自我探索'],
    },
  ];

  const matches = [
    {
      id: 1,
      name: 'Charlie',
      avatar: '/avatars/charlie.png',
      address: '0x3456789012345678901234567890123456789012',
      matchRate: 95,
      commonTags: ['学习', '成长', '技术'],
    },
    {
      id: 2,
      name: 'Diana',
      avatar: '/avatars/diana.png',
      address: '0x4567890123456789012345678901234567890123',
      matchRate: 88,
      commonTags: ['冥想', '艺术', '音乐'],
    },
  ];

  const handleWalletConnect = (address: string) => {
    setWalletAddress(address);
  };

  const handleStartChat = (recipientAddress: string) => {
    setSelectedRecipient(recipientAddress);
    setActiveTab('chat');
  };

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">心情交友</h1>
        <p className="text-gray-600 dark:text-gray-400">
          通过AI分析你的心情，找到志同道合的朋友
        </p>
      </div>

      <div className="mb-8">
        <WalletConnect onConnect={handleWalletConnect} />
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="mood">心情卡片</TabsTrigger>
          <TabsTrigger value="matches">匹配推荐</TabsTrigger>
          <TabsTrigger value="chat">聊天</TabsTrigger>
        </TabsList>

        <TabsContent value="mood" className="mt-6">
          <div className="space-y-4">
            {moodCards.map((card) => (
              <Card key={card.id} className="p-4">
                <div className="flex items-start space-x-4">
                  <Avatar>
                    <AvatarImage src={card.user.avatar} />
                    <AvatarFallback>{card.user.name[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold">{card.user.name}</h3>
                        <p className="text-sm text-gray-500">{card.timestamp}</p>
                      </div>
                      <Badge variant="outline" className="capitalize">
                        {card.user.mood}
                      </Badge>
                    </div>
                    <p className="mt-2">{card.content}</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {card.tags.map((tag) => (
                        <Badge key={tag} variant="secondary">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    <Button 
                      className="mt-3" 
                      size="sm"
                      onClick={() => handleStartChat(card.user.address)}
                    >
                      <MessageCircle className="w-4 h-4 mr-2" />
                      开始聊天
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="matches" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {matches.map((match) => (
              <Card key={match.id} className="p-4">
                <div className="flex items-center space-x-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={match.avatar} />
                    <AvatarFallback>{match.name[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold">{match.name}</h3>
                      <Badge variant="default">
                        匹配度 {match.matchRate}%
                      </Badge>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {match.commonTags.map((tag) => (
                        <Badge key={tag} variant="secondary">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    <div className="mt-3 space-x-2">
                      <Button 
                        size="sm"
                        onClick={() => handleStartChat(match.address)}
                      >
                        <MessageCircle className="w-4 h-4 mr-2" />
                        开始聊天
                      </Button>
                      <Button size="sm" variant="outline">
                        <UserPlus className="w-4 h-4 mr-2" />
                        添加好友
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="chat" className="mt-6">
          {selectedRecipient ? (
            <Chat 
              address={walletAddress} 
              recipient={selectedRecipient}
            />
          ) : (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground">
                请选择一个用户开始聊天
              </p>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
} 