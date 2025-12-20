'use client';

import { useState } from 'react';
import { Fingerprint, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface BioAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  title?: string;
  description?: string;
}

export default function BioAuthModal({
  isOpen,
  onClose,
  onSuccess,
  title = '生物识别授权 / Biometric Authorization',
  description = '请使用您的设备完成生物识别授权 / Please authenticate with your device',
}: BioAuthModalProps) {
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  if (!isOpen) return null;

  const handleAuth = () => {
    setIsAuthenticating(true);

    // 模拟生物识别过程
    setTimeout(() => {
      setIsAuthenticating(false);
      onSuccess();
      onClose();
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
      <div className="bg-gray-900 border border-gray-800 rounded-lg p-8 max-w-md w-full mx-4 relative">
        {/* 关闭按钮 */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
          disabled={isAuthenticating}
        >
          <X className="w-5 h-5" />
        </button>

        {/* 标题 */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-white mb-2">{title}</h2>
          <p className="text-gray-400 text-sm">{description}</p>
        </div>

        {/* 生物识别按钮 */}
        <div className="flex flex-col items-center justify-center py-8">
          <Button
            onClick={handleAuth}
            disabled={isAuthenticating}
            className="w-48 h-48 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex flex-col items-center justify-center gap-4 transition-all hover:scale-105"
          >
            <Fingerprint className={`w-24 h-24 text-white ${isAuthenticating ? 'animate-pulse' : ''}`} />
            <span className="text-base font-semibold text-center leading-relaxed px-4 whitespace-pre-line">
              {isAuthenticating ? '授权中...\nAuthenticating...' : '点击授权\nTap to Auth'}
            </span>
          </Button>

          <p className="text-gray-400 text-center mt-6 text-sm max-w-xs">
            {isAuthenticating
              ? '正在验证您的生物识别信息... / Verifying your biometric data...'
              : '点击上方按钮模拟生物识别授权 / Tap the button above to simulate biometric auth'}
          </p>
        </div>

        {/* 安全提示 */}
        <div className="bg-blue-900/30 border border-blue-700 rounded-lg p-4 mt-4">
          <p className="text-blue-200 text-xs leading-relaxed">
            <span className="font-semibold">🔒 隐私保护 / Privacy Protected：</span>
            私钥永不离开您的设备，所有签名操作都在安全区域内完成。
            / Your private key never leaves your device. All signing operations are performed in secure enclave.
          </p>
        </div>
      </div>
    </div>
  );
}
