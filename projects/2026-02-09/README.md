# Agent Market

## Monorepo packages
- `apps/agent-market-fe` - Next.js frontend
- `apps/agent-market-be` - NestJS backend
- `contracts/ai-agent` - Smart contracts (Hardhat)
- `packages/ui` - Shared UI components
- `packages/hooks` - Shared React hooks

## Publish to private npm registry (GitHub Actions)

### Prerequisites
- Ensure the package has a valid `name` and `version` in `apps/agent-market-be/package.json`.
- Set `"private": false` if you want to publish this package.
- Add the following repository secrets in GitHub:
  - `NPM_TOKEN`: npm auth token for your private registry

### Trigger a publish
1. Go to GitHub Actions and run the workflow `Publish NPM Package`.
2. Fill in inputs:
   - `package_path`: `apps/agent-market-be` (or any package path in this monorepo)
   - `registry_url`: your private npm registry URL
   - `tag`: dist-tag (default `latest`)

The workflow installs dependencies, then publishes the specified package to the registry using `NPM_TOKEN`.

## Changeset example: bump @agent-market/ui to 0.2.0 only

Goal: upgrade `@agent-market/ui` from `0.1.0` to `0.2.0`, keep `@agent-market/hooks` unchanged.

1. Create a changeset and select only `@agent-market/ui` with a **minor** bump.
   ```bash
   pnpm changeset
   ```
   Example changeset content:
   ```md
   ---
   "@agent-market/ui": minor
   ---

   feat: bump ui minor version
   ```

2. Apply versions (only `@agent-market/ui` will change):
   ```bash
   pnpm changeset version
   ```

3. Verify `packages/ui/package.json` is now `0.2.0`, and `packages/hooks/package.json` remains unchanged.

4. Publish to your private registry:
   ```bash
   pnpm changeset publish --registry <YOUR_PRIVATE_REGISTRY_URL>
   ```

Note: in most teams, build and publish are run in GitHub Actions. Local runs are mainly for creating changesets and verifying versions, while CI handles install/build/publish with consistent env and centralized credentials.
