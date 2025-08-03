#!/bin/bash

# Solana Token Minter API 测试脚本
# 使用固定token模式

API_URL="http://localhost:3000"

echo "🧪 Solana Token Minter API 测试"
echo "================================="

echo -e "\n1️⃣ 检查服务器状态"
curl -s $API_URL/status | jq .

echo -e "\n2️⃣ 查看token信息"
curl -s $API_URL/token-info | jq .

echo -e "\n3️⃣ 生成测试地址"
TEST_ADDR=$(curl -s $API_URL/generate-test-address | jq -r '.data.publicKey')
echo "生成的测试地址: $TEST_ADDR"

echo -e "\n4️⃣ 向测试地址铸造500个代币"
curl -s -X POST $API_URL/mint \
  -H "Content-Type: application/json" \
  -d "{\"address\":\"$TEST_ADDR\",\"amount\":500}" | jq .

echo -e "\n5️⃣ 再次铸造200个代币到同一地址"
curl -s -X POST $API_URL/mint \
  -H "Content-Type: application/json" \
  -d "{\"address\":\"$TEST_ADDR\",\"amount\":200}" | jq .

echo -e "\n6️⃣ 测试无效地址（应该失败）"
curl -s -X POST $API_URL/mint \
  -H "Content-Type: application/json" \
  -d '{"address":"invalid-address","amount":100}' | jq .

echo -e "\n7️⃣ 测试无效数量（应该失败）"
curl -s -X POST $API_URL/mint \
  -H "Content-Type: application/json" \
  -d "{\"address\":\"$TEST_ADDR\",\"amount\":-100}" | jq .

echo -e "\n✅ 测试完成！"
echo -e "\n📋 有用的命令:"
echo "   生成测试地址: curl $API_URL/generate-test-address"
echo "   铸造代币: curl -X POST $API_URL/mint -H \"Content-Type: application/json\" -d '{\"address\":\"YOUR_ADDRESS\",\"amount\":100}'"
echo "   查看状态: curl $API_URL/status"
echo "   重置token: curl -X POST $API_URL/reset-token"
