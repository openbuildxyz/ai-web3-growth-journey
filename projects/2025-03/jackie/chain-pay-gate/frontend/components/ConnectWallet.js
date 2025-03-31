import { useAccount, useConnect, useDisconnect } from 'wagmi'
import { InjectedConnector } from 'wagmi/connectors/injected'

export default function ConnectWallet() {
  const { address, isConnected } = useAccount()
  const { connect } = useConnect({
    connector: new InjectedConnector(),
  })
  const { disconnect } = useDisconnect()

  if (isConnected) {
    return (
      <button 
        type="button"
        onClick={disconnect}
        className="connect-button"
      >
        断开钱包 ({address.substring(0, 6)}...{address.substring(38)})
      </button>
    )
  }

  return (
    <button 
      type="button"
      onClick={connect}
      className="connect-button"
    >
      连接钱包
    </button>
  )
} 