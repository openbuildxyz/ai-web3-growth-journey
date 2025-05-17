import { ethers } from 'ethers';

// 生成密钥对
export async function generateKeyPair() {
  const wallet = ethers.Wallet.createRandom();
  return {
    privateKey: wallet.privateKey,
    publicKey: wallet.publicKey,
  };
}

// 使用接收者的公钥加密消息
export async function encryptMessage(message: string, recipientPublicKey: string) {
  // 这里使用简单的异或加密作为示例
  // 在实际应用中，应该使用更安全的加密算法，如 ECIES
  const messageBytes = ethers.toUtf8Bytes(message);
  const keyBytes = ethers.toUtf8Bytes(recipientPublicKey.slice(2, 10));
  
  const encryptedBytes = messageBytes.map((byte, index) => 
    byte ^ keyBytes[index % keyBytes.length]
  );
  
  return ethers.hexlify(encryptedBytes);
}

// 使用私钥解密消息
export async function decryptMessage(encryptedMessage: string, privateKey: string) {
  // 解密过程与加密相反
  const encryptedBytes = ethers.getBytes(encryptedMessage);
  const keyBytes = ethers.toUtf8Bytes(privateKey.slice(2, 10));
  
  const decryptedBytes = encryptedBytes.map((byte, index) => 
    byte ^ keyBytes[index % keyBytes.length]
  );
  
  return ethers.toUtf8String(decryptedBytes);
}

// 生成共享密钥
export async function generateSharedSecret(privateKey: string, publicKey: string) {
  const wallet = new ethers.Wallet(privateKey);
  const sharedSecret = await wallet.signMessage(publicKey);
  return sharedSecret;
} 