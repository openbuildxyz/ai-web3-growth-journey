import Link from "next/link";

/**
 * Landing page for AgentBridge
 * Features hero section, feature cards, and quick navigation
 */
export default function Home() {
  return (
    <div className="flex flex-col items-center">
      {/* Hero Section */}
      <section className="mt-8 flex flex-col items-center text-center sm:mt-16">
        <div className="inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-4 py-1.5 text-sm text-blue-700 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-300">
          ERC-8004 + x402 + Circle CCTP
        </div>

        <h1 className="mt-6 max-w-2xl text-4xl font-bold leading-tight tracking-tight text-zinc-900 sm:text-5xl dark:text-zinc-50">
          Trust & Payment Bridge for{" "}
          <span className="text-blue-600 dark:text-blue-400">
            Autonomous AI Agents
          </span>
        </h1>

        <p className="mt-4 max-w-xl text-lg leading-relaxed text-zinc-600 dark:text-zinc-400">
          Discover agents, evaluate trustworthiness, and transact across
          blockchains using portable on-chain identity. Agent-to-agent, no
          humans required.
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/register"
            className="rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
          >
            Register an Agent
          </Link>
          <Link
            href="/agents"
            className="rounded-lg border border-zinc-300 px-6 py-3 text-sm font-semibold text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            Browse Agents
          </Link>
          <Link
            href="/demo"
            className="rounded-lg border border-zinc-300 px-6 py-3 text-sm font-semibold text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            Cross-Chain Demo
          </Link>
        </div>
      </section>

      {/* Feature Cards */}
      <section className="mt-20 grid w-full max-w-4xl gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <FeatureCard
          title="Portable Identity"
          description="ERC-8004-style ERC-721 identity. One canonical reference for your agent across all chains."
          icon="identity"
        />
        <FeatureCard
          title="Trust Scoring"
          description="On-chain reputation via feedback signals. Indexed and queryable through The Graph."
          icon="trust"
        />
        <FeatureCard
          title="Trust-Gated Access"
          description="Agents query trust scores before interacting. No interaction without earned trust."
          icon="gate"
        />
        <FeatureCard
          title="x402 Payments"
          description="Programmatic USDC payments between agents. No human intervention needed."
          icon="payment"
        />
        <FeatureCard
          title="CCTP Cross-Chain"
          description="Native USDC transfers via Circle CCTP. Burn on Sepolia, mint on Solana."
          icon="bridge"
        />
        <FeatureCard
          title="Fully Verifiable"
          description="All actions on-chain. Verify registrations, reputation, and payments on block explorers."
          icon="verify"
        />
      </section>

      {/* Architecture Overview */}
      <section className="mt-20 w-full max-w-4xl">
        <h2 className="text-center text-2xl font-bold text-zinc-900 dark:text-zinc-100">
          How It Works
        </h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-4">
          <StepCard step={1} title="Register" description="Mint an ERC-721 identity NFT with your agent metadata" />
          <StepCard step={2} title="Build Trust" description="Receive on-chain feedback from other agents and clients" />
          <StepCard step={3} title="Gate Access" description="Other agents check your trust score before interacting" />
          <StepCard step={4} title="Transact" description="Send USDC tips via x402 or cross-chain via CCTP" />
        </div>
      </section>

      <div className="mt-20" />
    </div>
  );
}

/** Feature card component for the landing page */
function FeatureCard({
  title,
  description,
  icon,
}: {
  title: string;
  description: string;
  icon: string;
}) {
  const iconMap: Record<string, string> = {
    identity: "🪪",
    trust: "⭐",
    gate: "🔐",
    payment: "💳",
    bridge: "🌉",
    verify: "✅",
  };

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-700 dark:bg-zinc-900">
      <div className="text-2xl">{iconMap[icon] || "🔷"}</div>
      <h3 className="mt-3 text-base font-semibold text-zinc-900 dark:text-zinc-100">
        {title}
      </h3>
      <p className="mt-1.5 text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
        {description}
      </p>
    </div>
  );
}

/** Step card for "How It Works" section */
function StepCard({
  step,
  title,
  description,
}: {
  step: number;
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col items-center text-center">
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">
        {step}
      </div>
      <h3 className="mt-3 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
        {title}
      </h3>
      <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
        {description}
      </p>
    </div>
  );
}
