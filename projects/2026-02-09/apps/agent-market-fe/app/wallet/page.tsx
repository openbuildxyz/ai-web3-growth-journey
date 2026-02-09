import QuickStats from './components/QuickStats'
import BalanceCard from './components/BalanceCard'
import WalletHeader from './components/WalletHeader'
import Transactions from './components/Transactions'

export default function WalletPage() {
  return (
    <section className="container mx-auto px-4 max-w-4xl">
      <WalletHeader />
      <BalanceCard />
      <QuickStats />
      <Transactions />
    </section>
  )
}
