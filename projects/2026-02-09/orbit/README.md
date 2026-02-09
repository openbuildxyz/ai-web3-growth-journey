This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Setup

Copy `.env.example` to `.env` and set at least:

- **`NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID`** — Get a free project ID from [WalletConnect Cloud](https://cloud.walletconnect.com). Without it, Web3Modal API calls return 403 and the wallet modal falls back to local/default values.

## Troubleshooting

| Issue | Cause | Fix |
|-------|--------|-----|
| **403** from `api.web3modal.org` | App is using placeholder `default-project-id`. | Set `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` in `.env` from [cloud.walletconnect.com](https://cloud.walletconnect.com). |
| **500** on `POST /api/railgun/init` | RAILGUN engine init failed (e.g. RPC, native deps). | Check server logs and the API response body (in dev it includes `stack` / `cause`). Ensure `RAILGUN_RPC_URL` and fallbacks in `.env` are valid Sepolia RPCs. |
| **"Denying load of chrome-extension://...content/inpage.js"** | Orbit Wallet extension: `content/inpage.js` must be loadable by the page. | In the Orbit Wallet extension project, add `content/inpage.js` to the `web_accessible_resources` array in `manifest.json`. |
| **GET chrome-extension://invalid/ net::ERR_FAILED** | Some script is requesting an invalid extension URL. | Usually from a wallet detector; safe to ignore or fix in the extension if it’s your code. |
