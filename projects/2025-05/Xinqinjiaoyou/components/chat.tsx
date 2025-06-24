'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send } from 'lucide-react';
import { ethers } from 'ethers';
import { getChatContract, getChatContractWithSigner } from '@/lib/contracts/Chat';
import { encryptMessage, decryptMessage, generateKeyPair } from '@/lib/encryption';
import OpenAI from 'openai'

interface Message {
  sender: string;
  content: string;
  timestamp: number;
  encrypted: boolean;
}

interface ChatProps {
  address: string | null;
  recipient: string;
}

interface NewMessageEvent {
  sender: string;
  recipient: string;
  content: string;
  timestamp: bigint;
}

export function Chat({ address, recipient }: ChatProps) {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [provider, setProvider] = useState<ethers.Provider | null>(null);
  const [signer, setSigner] = useState<ethers.Signer | null>(null);
  const [keyPair, setKeyPair] = useState<{ privateKey: string; publicKey: string } | null>(null);

  // 初始化 provider、signer 和密钥对
  useEffect(() => {
    if (typeof window.ethereum !== 'undefined') {
      const provider = new ethers.BrowserProvider(window.ethereum);
      setProvider(provider);
      provider.getSigner().then(setSigner);
      
      // 生成或加载密钥对
      const storedKeyPair = localStorage.getItem('chatKeyPair');
      if (storedKeyPair) {
        setKeyPair(JSON.parse(storedKeyPair));
      } else {
        generateKeyPair().then((newKeyPair) => {
          setKeyPair(newKeyPair);
          localStorage.setItem('chatKeyPair', JSON.stringify(newKeyPair));
        });
      }
    }
  }, []);

  // 监听新消息
  const listenToMessages = useCallback(async () => {
    if (!provider || !address || !keyPair) return;

    const contract = getChatContract(provider);
    const filter = contract.filters.NewMessage(null, [address, recipient]);
    
    contract.on(filter, async (sender, recipient, content, timestamp) => {
      try {
        // 尝试解密消息
        const decryptedContent = await decryptMessage(content, keyPair.privateKey);
        const newMessage: Message = {
          sender,
          content: decryptedContent,
          timestamp: Number(timestamp),
          encrypted: true,
        };
        setMessages((prev) => [...prev, newMessage]);
      } catch (error) {
        console.error('解密消息失败:', error);
        // 如果解密失败，显示加密的消息
        const newMessage: Message = {
          sender,
          content: '[加密消息]',
          timestamp: Number(timestamp),
          encrypted: true,
        };
        setMessages((prev) => [...prev, newMessage]);
      }
    });

    return () => {
      contract.removeAllListeners(filter);
    };
  }, [provider, address, recipient, keyPair]);

  // 获取历史消息
  const fetchMessages = useCallback(async () => {
    if (!provider || !address || !keyPair) return;
    
    try {
      setIsLoading(true);
      const contract = getChatContract(provider);
      const filter = contract.filters.NewMessage(null, [address, recipient]);
      const events = await contract.queryFilter(filter);
      
      const messagePromises = events.map(async (event) => {
        if (!('args' in event)) return null;
        
        const args = event.args as unknown as [string, string, string, bigint];
        const [sender, recipient, content, timestamp] = args;
        
        try {
          const decryptedContent = await decryptMessage(
            content,
            keyPair.privateKey
          );
          return {
            sender,
            content: decryptedContent,
            timestamp: Number(timestamp),
            encrypted: true,
          } as Message;
        } catch (error) {
          console.error('解密消息失败:', error);
          return {
            sender,
            content: '[加密消息]',
            timestamp: Number(timestamp),
            encrypted: true,
          } as Message;
        }
      });
      
      const messageHistory = (await Promise.all(messagePromises)).filter((msg): msg is Message => msg !== null);
      setMessages(messageHistory);
    } catch (error) {
      console.error('获取消息失败:', error);
    } finally {
      setIsLoading(false);
    }
  }, [provider, address, recipient, keyPair]);

  // 发送消息
  const sendMessage = async () => {
    console.log("message");
    // if (!message.trim() || !address || !signer || !keyPair) return;

    try {
      // setIsLoading(true);
      // // 加密消息
      // const encryptedContent = await encryptMessage(message, keyPair.publicKey);
      
      // const contract = getChatContractWithSigner(provider!, signer);
      // const tx = await contract.sendMessage(recipient, encryptedContent);
      // await tx.wait();

      setIsLoading(true);
      
      // 加密消息
      // const encryptedContent = await encryptMessage(message, keyPair.publicKey);
      
      // const contract = getChatContractWithSigner(provider!, signer);
      // const tx = await contract.sendMessage(recipient, encryptedContent);
      // await tx.wait();

      // 调用AI模型生成图片
      const client = new OpenAI({
        baseURL: "https://ai.gitee.com/v1",
        apiKey: "XPC7TOMMFU3GAGHXQF5YFFQI5K3GSRCRJMNDL7O4",
      });

      const response = await client.images.generate({
        model: "Kolors",
        size: "1024x1024", 
        num_inference_steps: 25,
        guidance_scale: 7.5,
        prompt: message,
      });

      // 将生成的图片URL添加到消息列表
      if (response.data?.[0]?.url) {
        setMessages(prev => [...prev, {
          sender: address,
          content: response.data[0].url,
          timestamp: Math.floor(Date.now() / 1000),
          encrypted: false,
          isImage: true
        }]);
      }
      setMessage('');
    } catch (error) {
      console.error('发送消息失败:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (address && keyPair) {
      fetchMessages();
      const cleanup = listenToMessages();
      return () => {
        cleanup?.then((fn) => fn?.());
      };
    }
  }, [address, keyPair, fetchMessages, listenToMessages]);

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleTimeString();
  };

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  return (
    <Card className="h-[600px] flex flex-col">
      <div className="p-4 border-b">
        <h3 className="font-semibold">与 {formatAddress(recipient)} 的对话</h3>
      </div>
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex ${
                msg.sender === address ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`max-w-[70%] rounded-lg p-3 ${
                  msg.sender === address
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted'
                }`}
              >
                <p>{msg.content}</p>
                <p className="text-xs mt-1 opacity-70">
                  {formatTimestamp(msg.timestamp)}
                  {msg.encrypted && (
                    <span className="ml-2 text-xs">🔒</span>
                  )}
                </p>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
      <div className="p-4 border-t">
        <div className="flex space-x-2">
          <Input
            placeholder="输入消息..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                sendMessage();
              }
            }}
            disabled={isLoading || !address}
          />
          <Button onClick={sendMessage} disabled={isLoading || !address}>
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
} 