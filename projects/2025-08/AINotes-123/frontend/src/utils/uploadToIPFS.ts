import axios from 'axios'

const PINATA_API_KEY = import.meta.env.VITE_PINATA_API_KEY
const PINATA_SECRET_API_KEY = import.meta.env.VITE_PINATA_SECRET_API_KEY

export async function uploadToIPFS(file: File): Promise<string> {
  const url = 'https://api.pinata.cloud/pinning/pinFileToIPFS'
  const formData = new FormData()
  formData.append('file', file)

  try {
    const res = await axios.post(url, formData, {
      maxBodyLength: Infinity,
      headers: {
        'Content-Type': 'multipart/form-data',
        pinata_api_key: PINATA_API_KEY,
        pinata_secret_api_key: PINATA_SECRET_API_KEY,
      },
    })
    // 返回可访问的 IPFS 网关链接
    const cid = res.data.IpfsHash
    return `https://gateway.pinata.cloud/ipfs/${cid}`
  } catch (error) {
    console.error('上传到 Pinata 失败:', error)
    throw error
  }
}