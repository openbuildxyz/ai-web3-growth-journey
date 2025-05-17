import WaterGame from '@/pages/waterGame'
import { useAccountEffect } from 'wagmi'

function App() {
  useAccountEffect({
    onConnect(data) {
      console.log('Connected!', data)
    },
    onDisconnect() {
      console.log('Disconnected!')
    }
  })

  return (
    <div className="h-screen w-screen">
      <WaterGame />
    </div>
  )
}

export default App
