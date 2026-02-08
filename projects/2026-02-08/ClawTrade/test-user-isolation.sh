#!/bin/bash

# 测试用户隔离功能

API_URL="http://localhost:3001"

echo "🧪 测试用户隔离功能"
echo "===================="

# 用户 A
USER_A="user_test_alice"
echo ""
echo "👤 用户 A ($USER_A) 买入 BTC"
curl -X POST $API_URL/api/trade/buy \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "'$USER_A'",
    "coin_id": "bitcoin",
    "symbol": "BTC",
    "amount_usd": 1000
  }' | jq .

echo ""
echo "📊 用户 A 查询持仓"
curl "$API_URL/api/portfolio?userId=$USER_A" | jq .

# 用户 B
USER_B="user_test_bob"
echo ""
echo "===================="
echo "👤 用户 B ($USER_B) 买入 ETH"
curl -X POST $API_URL/api/trade/buy \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "'$USER_B'",
    "coin_id": "ethereum",
    "symbol": "ETH",
    "amount_usd": 500
  }' | jq .

echo ""
echo "📊 用户 B 查询持仓"
curl "$API_URL/api/portfolio?userId=$USER_B" | jq .

echo ""
echo "===================="
echo "✅ 测试完成！"
echo "用户 A 应该只有 BTC"
echo "用户 B 应该只有 ETH"
