import { useState } from 'react'

export default function ServiceForm({
  service,
  allowance,
  isLoading,
  onApprove,
  onSubmit,
  txHash
}) {
  const [requestData, setRequestData] = useState(service?.example || '')
  const allowanceValue = Number.parseFloat(allowance || '0')
  const needsApproval = allowanceValue <= 0
  
  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit(requestData)
  }
  
  return (
    <div className="card">
      <form onSubmit={handleSubmit}>
        <h3>请求参数</h3>
        <textarea
          rows={5}
          value={requestData}
          onChange={(e) => setRequestData(e.target.value)}
          placeholder="输入JSON格式的请求参数"
        />
        
        <div className="btn-group">
          {needsApproval && (
            <button 
              type="button"
              onClick={onApprove} 
              disabled={isLoading}
            >
              {isLoading && <span className="loading" />}
              授权代币
            </button>
          )}
          <button 
            type="submit" 
            disabled={isLoading || needsApproval}
          >
            {isLoading && <span className="loading" />}
            调用服务
          </button>
        </div>
        
        {txHash && (
          <div className="tx-info">
            交易哈希: <a href={`https://mumbai.polygonscan.com/tx/${txHash}`} target="_blank" rel="noopener noreferrer">
              {txHash.substring(0, 10)}...{txHash.substring(56)}
            </a>
          </div>
        )}
      </form>
    </div>
  )
} 