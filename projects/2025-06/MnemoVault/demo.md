# MnemoVault 演示文档

## 演示概述

MnemoVault 是一个命令行助记词分片加密工具，提供军用级别的安全保护。

## 功能演示

### 1. 程序启动界面

```
============================================================
🔐 MnemoVault v1.0.0
助记词分片加密工具 - 使用AES-256加密并分割成3个安全分片
============================================================

请选择操作模式:
1. 🔐 加密助记词 (生成分片)
2. 🔓 恢复助记词 (从分片恢复)
3. ❌ 退出程序

请输入选项 (1-3):
```

## 加密模式演示（选项1）

### 2. 助记词输入示例

```bash
🔐 进入加密模式
----------------------------------------
请输入助记词 (多个单词用空格分隔): abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about
✅ 助记词验证通过 (12个单词)
```

### 3. 密码设置流程

```bash
请输入加密密码: [用户输入密码]
请再次输入密码确认: [用户再次输入密码]

🔐 正在使用AES-256-GCM算法加密...
✅ 加密完成
🔄 正在分割密文...
```

### 4. 分片结果展示

```bash
🔓 加密分片完成！
============================================================
⚠️  请安全保存以下3个分片，需要全部分片才能恢复助记词
============================================================

分片 1/3:
----------------------------------------
YWJhbmRvbiBhYmFuZG9uIGFiYW5kb24gYWJhbmRvbiBhYmFuZG9uIGFiYW5kb24gYWJhbmRvbiBhYmFuZG9uIGFiYW5kb24gYWJhbmRvbiBhYmFuZG9uIGFib3V0
----------------------------------------

分片 2/3:
----------------------------------------
ZXhhbXBsZSBjaXBoZXIgdGV4dCBmb3IgZGVtb25zdHJhdGlvbiBwdXJwb3NlcyBvbmx5IG5vdCByZWFsIGVuY3J5cHRpb24gcmVzdWx0IGZvciBzZWN1cml0eQ==
----------------------------------------

分片 3/3:
----------------------------------------
dGhpcyBpcyBhIHNhbXBsZSBkZW1vbnN0cmF0aW9uIG9mIHRoZSBNbmVtb1ZhdWx0IHRvb2wgZm9yIGFzc2lnbm1lbnQgcHVycG9zZXMgb25seQ==
----------------------------------------

📝 安全提示:
• 将每个分片保存在不同的安全位置
• 不要将所有分片存储在同一设备上
• 确保密码的安全性，丢失密码将无法恢复
• 建议将分片保存在离线环境中

🎉 加密操作完成！
```

## 恢复模式演示（选项2）

### 1. 选择恢复模式

```bash
请输入选项 (1-3): 2

🔓 进入恢复模式
----------------------------------------
```

### 2. 输入分片

```bash
请依次输入3个分片:
分片 1/3: YWJhbmRvbiBhYmFuZG9uIGFiYW5kb24gYWJhbmRvbiBhYmFuZG9uIGFiYW5kb24gYWJhbmRvbiBhYmFuZG9uIGFiYW5kb24gYWJhbmRvbiBhYmFuZG9uIGFib3V0
分片 2/3: ZXhhbXBsZSBjaXBoZXIgdGV4dCBmb3IgZGVtb25zdHJhdGlvbiBwdXJwb3NlcyBvbmx5IG5vdCByZWFsIGVuY3J5cHRpb24gcmVzdWx0IGZvciBzZWN1cml0eQ==  
分片 3/3: dGhpcyBpcyBhIHNhbXBsZSBkZW1vbnN0cmF0aW9uIG9mIHRoZSBNbmVtb1ZhdWx0IHRvb2wgZm9yIGFzc2lnbm1lbnQgcHVycG9zZXMgb25seQ==

✅ 分片读取完成
🔄 正在重组分片...
✅ 分片重组完成
```

### 3. 输入解密密码

```bash
请输入解密密码: [输入加密时使用的密码]

🔐 正在使用AES-256-GCM算法解密...
✅ 解密完成
```

### 4. 恢复结果展示

```bash
🎉 助记词恢复成功！
============================================================
恢复的助记词:
----------------------------------------
abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about
----------------------------------------
✅ 验证: 包含 12 个单词

📝 安全提示:
• 请立即将助记词复制到安全位置
• 确认助记词正确后删除屏幕显示记录
• 不要在不安全的环境中显示助记词
• 建议重新生成新的分片以替换旧分片

🎉 恢复操作完成！
```

## 编译和运行演示

### 准备环境

```bash
# 确保安装了 Go 1.21 或更高版本
go version

# 进入项目目录
cd projects/2025-04/hawkli-1994
```

### 编译项目

```bash
# 编译生成可执行文件
go build -o mnemovault main.go

# 验证编译成功
ls -la mnemovault
```

### 运行演示

```bash
# 运行程序
./mnemovault

# 或者直接运行 Go 代码
go run main.go
```

## 测试用例

### 测试用例 1: 标准12单词助记词

**输入**:
```
助记词: abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about
密码: TestPassword123!
```

**输出**: 
- 3个Base64编码的分片
- 每个分片长度相近
- 分片总长度等于原始密文长度

### 测试用例 2: 24单词助记词

**输入**:
```
助记词: abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon art
密码: SecurePass2024@
```

**输出**:
- 更长的加密分片
- 同样分割成3个部分
- 保持数据完整性

### 测试用例 3: 输入验证测试

**无效输入测试**:
```bash
# 助记词单词数量不足
请输入助记词: hello world
❌ 助记词格式错误: 助记词应包含12-24个单词，当前有2个单词

# 密码长度不足
请输入加密密码: 123
❌ 密码长度至少需要8位字符

# 密码确认不匹配
请输入加密密码: password123
请再次输入密码确认: password124
❌ 两次输入的密码不一致
```

## 安全特性演示

### 1. 加密强度

- **算法**: AES-256-GCM
- **密钥长度**: 256位
- **认证**: 内置完整性验证
- **随机性**: 每次加密结果不同

### 2. 分片安全性

```bash
# 单个分片无法还原原始数据
分片1: YWJhbmRvbiBhYmFuZG9uIGFiYW5kb24=
# 无法从中获取有意义的信息

# 必须3个分片组合才能重构密文
分片1 + 分片2 + 分片3 = 完整密文
```

### 3. 离线安全

- 程序不需要网络连接
- 不会将数据发送到外部服务器
- 本地加密和分片处理

## 技术亮点

1. **零依赖**: 仅使用 Go 标准库
2. **跨平台**: 支持所有主流操作系统  
3. **内存安全**: 及时清理敏感数据
4. **错误处理**: 完善的异常处理机制
5. **用户友好**: 清晰的命令行界面

## 使用场景

- 🏦 个人钱包助记词备份
- 🏢 企业级密钥管理
- 📚 密码学教学演示
- 🔬 安全研究和测试

---

**注意**: 本演示使用的是示例数据，实际使用时请使用真实的助记词和强密码。 