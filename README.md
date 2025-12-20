# Rent3 - Blockchain-based Rental Marketplace

**Rent3** is a simplified blockchain-based rental platform that allows property owners and tenants to trade rental contracts as digital assets. Built with a modern tech stack and inspired by the minimalist design of Airbnb, it bridges the gap between traditional real estate and Web3.

## 🚀 Team: The Rent3 Builders

* **Buuvei**
* **Andy**
* **Eddy**

---

## 🏠 Project Overview

Rent3 simplifies property management and contract transfers. Every rental contract is treated as a transferable asset on the blockchain. When a tenant buys a contract, the ownership of that rental right is transferred in real-time via a ETH transaction.

### Key Features

* **Property Management:** Owners and agents can Create, Read, Update, and Delete (CRUD) property listings (Name, Location, Multi-image upload, Rent price).
* **Airbnb-style UI:** A sleek, modern interface for browsing properties globally.
* **Blockchain "Buy" Logic:** Integrated MetaMask payment flow.
* **Ownership Sync:** Real-time UI updates reflecting the new owner of a rental contract after a successful on-chain transaction.

---

## 🛠️ Tech Stack

* **Framework:** [Next.js](https://nextjs.org/) (App Router)
* **Database:** [Supabase](https://supabase.com/)
* **ORM:** [Drizzle ORM](https://orm.drizzle.team/) (with automated schema pushing)
* **Styling:** [Tailwind CSS](https://tailwindcss.com/) + [ShadcnUI](https://ui.shadcn.com/)
* **Web3:** [Ethers.js](https://docs.ethers.org/) / [Viem](https://viem.sh/) + MetaMask Integration
* **Network:** Ethereum Sepolia Testnet

---

## 📦 Getting Started

### 1. Prerequisites

Ensure you have the following environment variables in your `.env.local`:

```bash
DATABASE_URL=your_supabase_postgres_connection_string
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

```

### 2. Installation

```bash
# Clone the repository
git clone <your-repo-link>

# Install dependencies
npm install

# Push database schema via Drizzle
npm run db:push

# Run the development server
npm run dev

```
