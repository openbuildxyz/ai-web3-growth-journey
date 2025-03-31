export default function ServiceCard({ service, isSelected, onClick }) {
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      onClick(service)
    }
  }

  return (
    <div 
      className={`service-card ${isSelected ? 'selected' : ''}`}
      onClick={() => onClick(service)}
      onKeyPress={handleKeyPress}
      role="button"
      tabIndex={0}
    >
      <h3>{service.name}</h3>
      <p>{service.description}</p>
      <div className="price">{service.price} 代币</div>
    </div>
  )
} 