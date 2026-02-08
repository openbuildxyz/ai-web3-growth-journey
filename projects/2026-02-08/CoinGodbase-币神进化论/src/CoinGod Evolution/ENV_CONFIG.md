# 环境变量配置说明

本项目使用环境变量来管理敏感配置信息，确保数据安全。

## 必需的环境变量

### 数据库配置

在运行应用之前，请设置以下环境变量：

```bash
# 数据库主机地址
export DB_HOST=your_database_host

# 数据库端口（默认3306）
export DB_PORT=3306

# 数据库用户名
export DB_USER=your_database_user

# 数据库密码
export DB_PASSWORD=your_database_password

# 数据库名称
export DB_NAME=your_database_name
```

## 配置方式

### 方式一：使用 .env 文件（推荐）

1. 复制 `config.example.env` 为 `.env`
2. 修改 `.env` 文件中的配置值
3. 应用会自动读取 `.env` 文件中的配置

### 方式二：直接设置环境变量

在启动应用前，在终端中执行：

```bash
export DB_HOST=your_database_host
export DB_PORT=3306
export DB_USER=your_database_user
export DB_PASSWORD=your_database_password
export DB_NAME=your_database_name
```

### 方式三：Docker 环境变量

在 `docker-compose.yml` 或 `docker run` 命令中设置：

```yaml
environment:
  - DB_HOST=your_database_host
  - DB_PORT=3306
  - DB_USER=your_database_user
  - DB_PASSWORD=your_database_password
  - DB_NAME=your_database_name
```

## 安全提示

⚠️ **重要安全提示**：

1. **切勿**将包含真实密码的 `.env` 文件提交到版本控制系统
2. `.env` 文件已添加到 `.gitignore`，确保不会被意外提交
3. 在生产环境中，建议使用密钥管理服务（如 AWS Secrets Manager、Azure Key Vault 等）
4. 定期更换数据库密码
5. 使用强密码策略

## 降级模式

如果数据库连接失败，应用将自动进入降级模式：

- ✅ 前端页面可正常访问
- ✅ 使用静态备用数据展示加密货币价格
- ⚠️ 用户数据保存功能将不可用
- ⚠️ 排行榜功能将不可用

## 故障排查

### 数据库连接失败

如果遇到数据库连接问题，请检查：

1. 环境变量是否正确设置
2. 数据库服务器是否可访问
3. 数据库用户名和密码是否正确
4. 数据库是否已创建
5. 防火墙是否允许连接

### 查看日志

应用启动时会输出数据库连接状态：

```
[DB] Database connection successful  # 连接成功
[DB ERROR] Database connection failed: ...  # 连接失败
```

## 联系支持

如需获取数据库连接信息，请联系系统管理员。
