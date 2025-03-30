import { useWallet } from "./wallet-provider"

export function Hero() {
  const { isConnected } = useWallet()

  return (
    <section className="w-full py-12 md:py-24 lg:py-32">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl">
              Welcome to Web3 App
            </h1>
            <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400">
              Connect your wallet to explore the decentralized web
            </p>
          </div>
          <div className="space-y-4">
            {isConnected ? (
              <div className="inline-block rounded-lg bg-green-100 px-3 py-1 text-sm dark:bg-green-800/30">
                ✓ Wallet Connected
              </div>
            ) : (
              <div className="inline-block rounded-lg bg-yellow-100 px-3 py-1 text-sm dark:bg-yellow-800/30">
                Wallet not connected
              </div>
            )}
            <p className="mx-auto max-w-[600px] text-gray-500 dark:text-gray-400">
              {isConnected
                ? "Your wallet is connected. You can now interact with the blockchain."
                : "Connect your wallet using the button in the top right corner to get started."}
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

