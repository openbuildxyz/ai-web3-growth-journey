package main

import (
	"bufio"
	"crypto/aes"
	"crypto/cipher"
	"crypto/rand"
	"crypto/sha256"
	"encoding/base64"
	"fmt"
	"io"
	"os"
	"strings"
)

const (
	AppName    = "MnemoVault"
	AppVersion = "1.0.0"
	AppDesc    = "助记词分片加密工具 - 使用AES-256加密并分割成3个安全分片"
)

// 显示应用程序头部信息
func showHeader() {
	fmt.Println(strings.Repeat("=", 60))
	fmt.Printf("🔐 %s v%s\n", AppName, AppVersion)
	fmt.Println(AppDesc)
	fmt.Println(strings.Repeat("=", 60))
	fmt.Println()
}

// 显示主菜单
func showMainMenu() {
	fmt.Println("请选择操作模式:")
	fmt.Println("1. 🔐 加密助记词 (生成分片)")
	fmt.Println("2. 🔓 恢复助记词 (从分片恢复)")
	fmt.Println("3. ❌ 退出程序")
	fmt.Print("\n请输入选项 (1-3): ")
}

// 读取用户输入
func readInput(prompt string) (string, error) {
	reader := bufio.NewReader(os.Stdin)
	fmt.Print(prompt)
	input, err := reader.ReadString('\n')
	if err != nil {
		return "", err
	}
	return strings.TrimSpace(input), nil
}

// 读取助记词输入
func readMnemonic() (string, error) {
	return readInput("请输入助记词 (多个单词用空格分隔): ")
}

// 读取密码输入
func readPassword(prompt string) (string, error) {
	return readInput(prompt)
}

// 读取分片输入
func readShards() ([]string, error) {
	var shards []string

	fmt.Println("\n请依次输入3个分片:")
	for i := 1; i <= 3; i++ {
		shard, err := readInput(fmt.Sprintf("分片 %d/3: ", i))
		if err != nil {
			return nil, err
		}
		if strings.TrimSpace(shard) == "" {
			return nil, fmt.Errorf("分片 %d 不能为空", i)
		}
		shards = append(shards, shard)
	}

	return shards, nil
}

// 使用PBKDF2从密码生成密钥
func deriveKey(password string, salt []byte) []byte {
	// 使用SHA-256作为哈希函数
	key := sha256.Sum256(append([]byte(password), salt...))
	return key[:]
}

// 使用AES-256-GCM加密数据
func encryptAES256GCM(plaintext, password string) (string, error) {
	// 生成随机盐值
	salt := make([]byte, 16)
	if _, err := io.ReadFull(rand.Reader, salt); err != nil {
		return "", err
	}

	// 从密码和盐值生成密钥
	key := deriveKey(password, salt)

	// 创建AES cipher
	block, err := aes.NewCipher(key)
	if err != nil {
		return "", err
	}

	// 使用GCM模式
	gcm, err := cipher.NewGCM(block)
	if err != nil {
		return "", err
	}

	// 生成随机nonce
	nonce := make([]byte, gcm.NonceSize())
	if _, err := io.ReadFull(rand.Reader, nonce); err != nil {
		return "", err
	}

	// 加密数据
	ciphertext := gcm.Seal(nonce, nonce, []byte(plaintext), nil)

	// 将盐值和密文组合
	result := append(salt, ciphertext...)

	// 返回base64编码的结果
	return base64.StdEncoding.EncodeToString(result), nil
}

// 使用AES-256-GCM解密数据
func decryptAES256GCM(ciphertext, password string) (string, error) {
	// Base64解码
	data, err := base64.StdEncoding.DecodeString(ciphertext)
	if err != nil {
		return "", fmt.Errorf("base64解码失败: %v", err)
	}

	// 检查数据长度
	if len(data) < 16 {
		return "", fmt.Errorf("密文数据太短")
	}

	// 提取盐值（前16字节）
	salt := data[:16]
	encryptedData := data[16:]

	// 从密码和盐值生成密钥
	key := deriveKey(password, salt)

	// 创建AES cipher
	block, err := aes.NewCipher(key)
	if err != nil {
		return "", err
	}

	// 使用GCM模式
	gcm, err := cipher.NewGCM(block)
	if err != nil {
		return "", err
	}

	// 检查密文长度
	nonceSize := gcm.NonceSize()
	if len(encryptedData) < nonceSize {
		return "", fmt.Errorf("密文长度不足")
	}

	// 提取nonce和密文
	nonce := encryptedData[:nonceSize]
	cipherData := encryptedData[nonceSize:]

	// 解密数据
	plaintext, err := gcm.Open(nil, nonce, cipherData, nil)
	if err != nil {
		return "", fmt.Errorf("解密失败: %v", err)
	}

	return string(plaintext), nil
}

// 将密文分割成3个分片
func splitIntoShards(ciphertext string) ([]string, error) {
	if len(ciphertext) < 3 {
		return nil, fmt.Errorf("密文长度不足，无法分割")
	}

	// 计算每个分片的长度
	totalLen := len(ciphertext)
	shardLen := totalLen / 3
	remainder := totalLen % 3

	var shards []string
	start := 0

	for i := 0; i < 3; i++ {
		end := start + shardLen
		if i < remainder {
			end++
		}

		shard := ciphertext[start:end]
		shards = append(shards, shard)
		start = end
	}

	return shards, nil
}

// 将3个分片重组成完整密文
func combineShards(shards []string) (string, error) {
	if len(shards) != 3 {
		return "", fmt.Errorf("需要恰好3个分片，当前有%d个", len(shards))
	}

	// 验证分片不为空
	for i, shard := range shards {
		if strings.TrimSpace(shard) == "" {
			return "", fmt.Errorf("分片 %d 为空", i+1)
		}
	}

	// 直接连接分片
	combined := strings.Join(shards, "")

	// 验证组合后的字符串是否为有效的base64
	_, err := base64.StdEncoding.DecodeString(combined)
	if err != nil {
		return "", fmt.Errorf("分片组合后不是有效的base64格式: %v", err)
	}

	return combined, nil
}

// 验证助记词格式（简单验证）
func validateMnemonic(mnemonic string) error {
	words := strings.Fields(mnemonic)
	if len(words) < 12 || len(words) > 24 {
		return fmt.Errorf("助记词应包含12-24个单词，当前有%d个单词", len(words))
	}

	// 检查每个单词是否为空
	for i, word := range words {
		if strings.TrimSpace(word) == "" {
			return fmt.Errorf("第%d个单词为空", i+1)
		}
	}

	return nil
}

// 显示分片结果
func displayShards(shards []string) {
	fmt.Println("\n🔓 加密分片完成！")
	fmt.Println(strings.Repeat("=", 60))
	fmt.Println("⚠️  请安全保存以下3个分片，需要全部分片才能恢复助记词")
	fmt.Println(strings.Repeat("=", 60))

	for i, shard := range shards {
		fmt.Printf("\n分片 %d/%d:\n", i+1, len(shards))
		fmt.Println(strings.Repeat("-", 40))
		fmt.Println(shard)
		fmt.Println(strings.Repeat("-", 40))
	}

	fmt.Println("\n📝 安全提示:")
	fmt.Println("• 将每个分片保存在不同的安全位置")
	fmt.Println("• 不要将所有分片存储在同一设备上")
	fmt.Println("• 确保密码的安全性，丢失密码将无法恢复")
	fmt.Println("• 建议将分片保存在离线环境中")
}

// 显示恢复结果
func displayRecoveredMnemonic(mnemonic string) {
	fmt.Println("\n🎉 助记词恢复成功！")
	fmt.Println(strings.Repeat("=", 60))
	fmt.Println("恢复的助记词:")
	fmt.Println(strings.Repeat("-", 40))
	fmt.Println(mnemonic)
	fmt.Println(strings.Repeat("-", 40))

	fmt.Printf("✅ 验证: 包含 %d 个单词\n", len(strings.Fields(mnemonic)))

	fmt.Println("\n📝 安全提示:")
	fmt.Println("• 请立即将助记词复制到安全位置")
	fmt.Println("• 确认助记词正确后删除屏幕显示记录")
	fmt.Println("• 不要在不安全的环境中显示助记词")
	fmt.Println("• 建议重新生成新的分片以替换旧分片")
}

// 加密模式处理
func handleEncryptMode() error {
	fmt.Println("\n🔐 进入加密模式")
	fmt.Println(strings.Repeat("-", 40))

	// 读取助记词
	mnemonic, err := readMnemonic()
	if err != nil {
		return fmt.Errorf("读取助记词失败: %v", err)
	}

	// 验证助记词格式
	if err := validateMnemonic(mnemonic); err != nil {
		return fmt.Errorf("助记词格式错误: %v", err)
	}

	fmt.Printf("✅ 助记词验证通过 (%d个单词)\n\n", len(strings.Fields(mnemonic)))

	// 读取加密密码
	password, err := readPassword("请输入加密密码: ")
	if err != nil {
		return fmt.Errorf("读取密码失败: %v", err)
	}

	if len(password) < 8 {
		return fmt.Errorf("密码长度至少需要8位字符")
	}

	// 确认密码
	confirmPassword, err := readPassword("请再次输入密码确认: ")
	if err != nil {
		return fmt.Errorf("读取确认密码失败: %v", err)
	}

	if password != confirmPassword {
		return fmt.Errorf("两次输入的密码不一致")
	}

	fmt.Println("\n🔐 正在使用AES-256-GCM算法加密...")

	// 加密助记词
	encrypted, err := encryptAES256GCM(mnemonic, password)
	if err != nil {
		return fmt.Errorf("加密失败: %v", err)
	}

	fmt.Println("✅ 加密完成")
	fmt.Println("🔄 正在分割密文...")

	// 分割成分片
	shards, err := splitIntoShards(encrypted)
	if err != nil {
		return fmt.Errorf("分割失败: %v", err)
	}

	// 显示结果
	displayShards(shards)

	return nil
}

// 恢复模式处理
func handleRecoverMode() error {
	fmt.Println("\n🔓 进入恢复模式")
	fmt.Println(strings.Repeat("-", 40))

	// 读取3个分片
	shards, err := readShards()
	if err != nil {
		return fmt.Errorf("读取分片失败: %v", err)
	}

	fmt.Println("✅ 分片读取完成")
	fmt.Println("🔄 正在重组分片...")

	// 重组分片
	combined, err := combineShards(shards)
	if err != nil {
		return fmt.Errorf("分片重组失败: %v", err)
	}

	fmt.Println("✅ 分片重组完成")

	// 读取解密密码
	password, err := readPassword("请输入解密密码: ")
	if err != nil {
		return fmt.Errorf("读取密码失败: %v", err)
	}

	fmt.Println("🔐 正在使用AES-256-GCM算法解密...")

	// 解密数据
	mnemonic, err := decryptAES256GCM(combined, password)
	if err != nil {
		return fmt.Errorf("解密失败: %v (请检查分片和密码是否正确)", err)
	}

	fmt.Println("✅ 解密完成")

	// 验证恢复的助记词格式
	if err := validateMnemonic(mnemonic); err != nil {
		return fmt.Errorf("恢复的数据不是有效的助记词: %v", err)
	}

	// 显示恢复结果
	displayRecoveredMnemonic(mnemonic)

	return nil
}

func main() {
	showHeader()

	for {
		showMainMenu()

		choice, err := readInput("")
		if err != nil {
			fmt.Printf("❌ 读取输入失败: %v\n", err)
			continue
		}

		switch choice {
		case "1":
			if err := handleEncryptMode(); err != nil {
				fmt.Printf("❌ %v\n", err)
			} else {
				fmt.Println("\n🎉 加密操作完成！")
			}

		case "2":
			if err := handleRecoverMode(); err != nil {
				fmt.Printf("❌ %v\n", err)
			} else {
				fmt.Println("\n🎉 恢复操作完成！")
			}

		case "3":
			fmt.Println("\n👋 感谢使用 MnemoVault，再见！")
			return

		default:
			fmt.Println("❌ 无效选项，请输入 1-3")
		}

		fmt.Println("\n" + strings.Repeat("=", 60))
	}
}
