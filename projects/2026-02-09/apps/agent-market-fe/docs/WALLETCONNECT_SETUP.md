# WalletConnect Project ID Setup Guide

## Overview

This application uses RainbowKit with WalletConnect to enable mobile wallet connections. To use this functionality, you need to obtain a WalletConnect Project ID from WalletConnect Cloud.

## Why is this required?

WalletConnect is a protocol that allows users to connect their mobile wallets (like MetaMask Mobile, Trust Wallet, Rainbow, etc.) to your dApp by scanning a QR code. The Project ID is used to:

- Enable WalletConnect v2 protocol
- Track connection analytics
- Ensure proper relay server communication
- Support mobile wallet deep linking

**Without a valid Project ID, mobile wallet connections will not work.**

## Step-by-Step Setup Instructions

### 1. Create a WalletConnect Cloud Account

1. Navigate to [WalletConnect Cloud](https://cloud.walletconnect.com)
2. Click "Sign Up" or "Get Started"
3. Sign up using:
   - GitHub account (recommended for developers)
   - Email address
   - Google account

### 2. Create a New Project

1. Once logged in, you'll see your dashboard
2. Click the **"Create New Project"** button (or **"New Project"** if you have existing projects)
3. Fill in the project details:
   - **Project Name**: `Agent Market` (or your preferred name)
   - **Project Type**: Select **"App"**
   - **Description**: (Optional) "Agent marketplace with wallet integration"

4. Click **"Create"** or **"Submit"**

### 3. Get Your Project ID

1. After creating the project, you'll be taken to the project dashboard
2. Look for the **"Project ID"** section - it will be a long alphanumeric string
3. The Project ID format looks like: `a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6`
4. Click the **copy icon** next to the Project ID to copy it to your clipboard

### 4. Add Project ID to Environment Variables

1. Open your `.env` file in the `apps/agent-market-fe` directory
2. Find the line with `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=`
3. Paste your Project ID after the equals sign:

```env
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6
```

4. Save the file

**Important Notes:**
- Do NOT add quotes around the Project ID
- Do NOT commit your `.env` file to version control (it should be in `.gitignore`)
- The `.env.example` file shows the format but should not contain your actual Project ID

### 5. Verify the Setup

1. Restart your development server if it's running:
   ```bash
   pnpm dev
   ```

2. Open your application in a browser
3. Click the wallet connect button
4. You should see the wallet selection modal
5. Select "WalletConnect" from the options
6. A QR code should appear - this confirms your Project ID is working

### 6. Test Mobile Wallet Connection

1. Open a mobile wallet app on your phone (MetaMask, Trust Wallet, Rainbow, etc.)
2. Look for the "WalletConnect" or "Scan QR" option in the wallet
3. Scan the QR code displayed in your application
4. Approve the connection request in your mobile wallet
5. Your wallet should now be connected to the application

## Troubleshooting

### "Invalid Project ID" Error

- Double-check that you copied the entire Project ID
- Ensure there are no extra spaces before or after the ID
- Verify the environment variable name is exactly `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID`
- Restart your development server after adding the ID

### QR Code Not Appearing

- Check browser console for errors
- Verify your Project ID is set in the `.env` file
- Ensure the environment variable starts with `NEXT_PUBLIC_` (required for Next.js)
- Clear your browser cache and reload

### Mobile Wallet Not Connecting

- Ensure your mobile device is on the same network as your development machine (for local development)
- Try a different mobile wallet app
- Check that the QR code is not expired (they typically expire after a few minutes)
- Verify your WalletConnect project is active in the Cloud dashboard

### Environment Variable Not Loading

- Environment variable names must start with `NEXT_PUBLIC_` to be accessible in the browser
- Restart your Next.js development server after changing `.env` files
- Check that `.env` is in the correct directory (`apps/agent-market-fe/`)
- Verify the file is named exactly `.env` (not `.env.txt` or similar)

## Additional Configuration (Optional)

### Project Settings in WalletConnect Cloud

You can customize your project settings in the WalletConnect Cloud dashboard:

1. **Allowed Domains**: Add your production domain(s) for security
2. **Webhooks**: Set up webhooks for connection events
3. **Analytics**: View connection statistics and usage data
4. **Rate Limits**: Monitor your API usage

### Multiple Environments

For different environments (development, staging, production), you can create separate WalletConnect projects:

1. Create a project for each environment
2. Use different Project IDs in each environment's `.env` file
3. This allows you to track analytics separately and apply different settings

Example:
```env
# Development
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=dev_project_id_here

# Production (in .env.production)
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=prod_project_id_here
```

## Security Best Practices

1. **Never commit your Project ID to public repositories** - while it's not a secret key, it's best to keep it in environment variables
2. **Use different Project IDs for development and production** - this helps with analytics and security
3. **Monitor your usage** - check the WalletConnect Cloud dashboard regularly for unusual activity
4. **Set allowed domains** - in production, restrict your Project ID to specific domains

## Resources

- [WalletConnect Cloud Dashboard](https://cloud.walletconnect.com)
- [WalletConnect Documentation](https://docs.walletconnect.com)
- [RainbowKit Documentation](https://rainbowkit.com/docs/introduction)
- [Supported Wallets List](https://explorer.walletconnect.com)

## Support

If you encounter issues:
1. Check the [WalletConnect Discord](https://discord.gg/walletconnect)
2. Review [RainbowKit GitHub Issues](https://github.com/rainbow-me/rainbowkit/issues)
3. Consult the [WalletConnect FAQ](https://docs.walletconnect.com/faq)
