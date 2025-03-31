export default function ResultDisplay({ data }) {
  if (!data) return null
  
  return (
    <div className="result-card">
      <h3>响应结果</h3>
      <pre>{data}</pre>
    </div>
  )
} 