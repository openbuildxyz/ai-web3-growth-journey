E2E（端到端）测试持续失败并返回 `401 Unauthorized` 错误，这通常意味着发出的请求没有通过身份验证。在我们的应用中，身份验证是通过 JWT (JSON Web Token) 完成的。`401` 错误表明，请求头中携带的 JWT token 是无效的、已过期的，或者是由一个与服务器验证时使用的密钥不匹配的密钥签名的。

### 为什么 E2E 测试一直失败？

1.  **问题根源**: 根本问题在于 **JWT 密钥不一致**。
    *   当用户登录 (`/auth/login`) 时，`AuthService` 使用 `JwtService` 和一个密钥 (`JWT_SECRET`) 来**签发**一个 token。
    *   当用户携带这个 token 访问受保护的接口（例如 `/tasks/:id/execute` 或 `/users/me`）时，`JwtStrategy` (一个 Passport.js 策略) 会使用**同一个**密钥 (`JWT_SECRET`) 来**验证**这个 token 的签名是否有效。
    *   在 E2E 测试环境中，`Test.createTestingModule` 会创建一个独立的、隔离的应用实例。在这个实例中，签发 token 的服务和验证 token 的策略可能由于配置加载问题，没有获取到完全相同的 `JWT_SECRET`。如果签发和验证的密钥不一致，所有验证都会失败，从而导致 `401 Unauthorized` 错误。

2.  **环境差异**: `ConfigService` 负责从环境变量（`.env` 文件）中读取 `JWT_SECRET`。常规开发环境 (`pnpm start:dev`) 和 Jest 运行的 E2E 测试环境在加载这些环境变量时可能存在差异，导致了上述的密钥不一致问题。

### 为什么要 Mock `JWT_SECRET`？

**Mock `JWT_SECRET` 是解决 E2E 测试中密钥不一致问题的标准做法。**

1.  **保证一致性**: 通过在测试代码中 `overrideProvider(ConfigService)`，我为整个测试应用提供了一个**确定性**的、**固定**的 `JWT_SECRET`。`ConfigService` 的 `get` 方法被我“劫持”了，当任何服务（无论是 `AuthService` 还是 `JwtStrategy`）向它请求 `JWT_SECRET` 时，它们得到的都是我指定的同一个测试密钥（例如 `'e2e-test-secret'`）。

2.  **消除环境依赖**: 这样做可以使 E2E 测试完全摆脱对外部 `.env` 文件或环境变量的依赖，让测试变得更加健壮和可移植。无论在谁的机器上或在 CI/CD 流水线中运行，测试都将使用这个固定的密钥，确保了测试结果的一致性。

**总结来说，E2E 测试的失败是因为在测试环境下，用于签发和验证 JWT 的密钥不一致。我通过 Mock `ConfigService` 来强制在整个测试应用中使用一个固定的 `JWT_SECRET`，从而修复这个问题，确保身份验证能够正常工作。**