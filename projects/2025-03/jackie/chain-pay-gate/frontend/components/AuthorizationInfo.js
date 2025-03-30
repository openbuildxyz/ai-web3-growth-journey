export default function AuthorizationInfo({ balance, allowance }) {
  if (!balance && !allowance) return null
  
  const balanceValue = Number.parseFloat(balance || '0')
  const allowanceValue = Number.parseFloat(allowance || '0')
  const hasAllowance = allowanceValue > 0
  
  return (
    <div className={`authorization-info ${hasAllowance ? '' : 'inactive'}`}>
      <div>
        <div><strong>余额:</strong> {balanceValue.toFixed(2)} 代币</div>
        <div><strong>已授权:</strong> {allowanceValue.toFixed(2)} 代币</div>
      </div>
    </div>
  )
} 