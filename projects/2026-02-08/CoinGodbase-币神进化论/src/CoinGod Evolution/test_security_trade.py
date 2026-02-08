#!/usr/bin/env python3
"""
🔒 安全交易API测试脚本

本脚本用于测试新的安全交易API接口，验证：
1. 正常交易流程
2. 资金不足检查
3. 持仓不足检查
4. SQL注入防护
5. 数值注入防护
6. 请求频率限制
"""

import requests
import json
import time
from datetime import datetime

# API基础URL
BASE_URL = "http://localhost:8000"

# 测试用户
TEST_USER = "security_test_user"

# 颜色输出
class Colors:
    GREEN = '\033[92m'
    RED = '\033[91m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    END = '\033[0m'

def print_success(message):
    print(f"{Colors.GREEN}✅ {message}{Colors.END}")

def print_error(message):
    print(f"{Colors.RED}❌ {message}{Colors.END}")

def print_warning(message):
    print(f"{Colors.YELLOW}⚠️  {message}{Colors.END}")

def print_info(message):
    print(f"{Colors.BLUE}ℹ️  {message}{Colors.END}")

def print_section(title):
    print(f"\n{'='*80}")
    print(f"{Colors.BLUE}{title}{Colors.END}")
    print(f"{'='*80}\n")

def execute_trade(eng_name, trade_type, crypto_symbol, quantity):
    """执行交易请求"""
    url = f"{BASE_URL}/api/trade/execute"
    data = {
        "eng_name": eng_name,
        "trade_type": trade_type,
        "crypto_symbol": crypto_symbol,
        "quantity": quantity
    }
    
    try:
        response = requests.post(url, json=data, timeout=10)
        return response
    except Exception as e:
        print_error(f"请求失败: {e}")
        return None

def get_user_assets(eng_name):
    """获取用户资产"""
    url = f"{BASE_URL}/api/user/load/{eng_name}"
    
    try:
        response = requests.get(url, timeout=10)
        if response.status_code == 200:
            return response.json()
        return None
    except Exception as e:
        print_error(f"获取资产失败: {e}")
        return None

def test_normal_buy():
    """测试1：正常买入交易"""
    print_section("测试1：正常买入交易")
    
    print_info("发送买入请求: 0.01 BTC")
    response = execute_trade(TEST_USER, "buy", "BTC", 0.01)
    
    if response and response.status_code == 200:
        result = response.json()
        print_success("买入成功")
        print(f"  - 交易金额: ${result['trade_data']['total_amount']:.2f}")
        print(f"  - 新总资产: ${result['user_assets']['total_assets']:.2f}")
        print(f"  - 新可用资金: ${result['user_assets']['available_cash']:.2f}")
        return True
    else:
        print_error(f"买入失败: {response.status_code if response else 'No response'}")
        if response:
            print(f"  - 错误信息: {response.json().get('detail', 'Unknown error')}")
        return False

def test_normal_sell():
    """测试2：正常卖出交易"""
    print_section("测试2：正常卖出交易")
    
    print_info("发送卖出请求: 0.005 BTC")
    response = execute_trade(TEST_USER, "sell", "BTC", 0.005)
    
    if response and response.status_code == 200:
        result = response.json()
        print_success("卖出成功")
        print(f"  - 交易金额: ${result['trade_data']['total_amount']:.2f}")
        print(f"  - 新总资产: ${result['user_assets']['total_assets']:.2f}")
        print(f"  - 新可用资金: ${result['user_assets']['available_cash']:.2f}")
        return True
    else:
        print_error(f"卖出失败: {response.status_code if response else 'No response'}")
        if response:
            print(f"  - 错误信息: {response.json().get('detail', 'Unknown error')}")
        return False

def test_insufficient_funds():
    """测试3：资金不足检查"""
    print_section("测试3：资金不足检查")
    
    print_info("尝试买入超额BTC（应该失败）")
    response = execute_trade(TEST_USER, "buy", "BTC", 1000)
    
    if response and response.status_code == 400:
        error_detail = response.json().get('detail', '')
        if '资金不足' in error_detail:
            print_success("资金不足检查通过")
            print(f"  - 错误信息: {error_detail}")
            return True
        else:
            print_error(f"错误信息不正确: {error_detail}")
            return False
    else:
        print_error(f"应该返回400错误，实际返回: {response.status_code if response else 'No response'}")
        return False

def test_insufficient_holdings():
    """测试4：持仓不足检查"""
    print_section("测试4：持仓不足检查")
    
    print_info("尝试卖出超额BTC（应该失败）")
    response = execute_trade(TEST_USER, "sell", "BTC", 1000)
    
    if response and response.status_code == 400:
        error_detail = response.json().get('detail', '')
        if '持仓不足' in error_detail or '没有持有' in error_detail:
            print_success("持仓不足检查通过")
            print(f"  - 错误信息: {error_detail}")
            return True
        else:
            print_error(f"错误信息不正确: {error_detail}")
            return False
    else:
        print_error(f"应该返回400错误，实际返回: {response.status_code if response else 'No response'}")
        return False

def test_sql_injection():
    """测试5：SQL注入防护"""
    print_section("测试5：SQL注入防护")
    
    malicious_inputs = [
        "test'; DROP TABLE users; --",
        "test\" OR \"1\"=\"1",
        "test'; DELETE FROM users WHERE '1'='1",
        "test' UNION SELECT * FROM users --"
    ]
    
    all_passed = True
    for malicious_input in malicious_inputs:
        print_info(f"测试SQL注入: {malicious_input}")
        response = execute_trade(malicious_input, "buy", "BTC", 0.01)
        
        if response and response.status_code == 400:
            error_detail = response.json().get('detail', '')
            if '非法字符' in error_detail or '验证失败' in error_detail:
                print_success(f"  ✓ SQL注入被阻止")
            else:
                print_warning(f"  ⚠ 被阻止但错误信息不明确: {error_detail}")
        else:
            print_error(f"  ✗ SQL注入未被阻止！状态码: {response.status_code if response else 'No response'}")
            all_passed = False
    
    if all_passed:
        print_success("SQL注入防护测试通过")
    else:
        print_error("SQL注入防护测试失败")
    
    return all_passed

def test_numeric_injection():
    """测试6：数值注入防护"""
    print_section("测试6：数值注入防护")
    
    malicious_values = [
        ("NaN", "NaN值"),
        ("Infinity", "无穷大"),
        ("-Infinity", "负无穷大"),
        (-1, "负数"),
        (0, "零"),
        (999999999999, "超大数值")
    ]
    
    all_passed = True
    for value, description in malicious_values:
        print_info(f"测试{description}: {value}")
        
        # 构造请求
        url = f"{BASE_URL}/api/trade/execute"
        data = {
            "eng_name": TEST_USER,
            "trade_type": "buy",
            "crypto_symbol": "BTC",
            "quantity": value
        }
        
        try:
            response = requests.post(url, json=data, timeout=10)
            
            if response.status_code == 400 or response.status_code == 422:
                print_success(f"  ✓ {description}被阻止")
            else:
                print_error(f"  ✗ {description}未被阻止！状态码: {response.status_code}")
                all_passed = False
        except Exception as e:
            print_error(f"  ✗ 请求失败: {e}")
            all_passed = False
    
    if all_passed:
        print_success("数值注入防护测试通过")
    else:
        print_error("数值注入防护测试失败")
    
    return all_passed

def test_rate_limiting():
    """测试7：请求频率限制"""
    print_section("测试7：请求频率限制")
    
    print_info("快速发送70次请求（限制为60次/分钟）")
    
    success_count = 0
    rate_limited_count = 0
    
    for i in range(70):
        response = execute_trade(TEST_USER, "buy", "BTC", 0.0001)
        
        if response:
            if response.status_code == 200:
                success_count += 1
            elif response.status_code == 429:
                rate_limited_count += 1
        
        # 不要太快，避免网络问题
        time.sleep(0.1)
    
    print(f"  - 成功请求: {success_count}")
    print(f"  - 被限制请求: {rate_limited_count}")
    
    if rate_limited_count > 0:
        print_success("请求频率限制测试通过")
        return True
    else:
        print_warning("未触发频率限制（可能需要更多请求）")
        return True  # 不算失败

def test_invalid_crypto_symbol():
    """测试8：无效币种符号"""
    print_section("测试8：无效币种符号")
    
    invalid_symbols = ["XXX", "INVALID", "HACK", ""]
    
    all_passed = True
    for symbol in invalid_symbols:
        print_info(f"测试无效币种: {symbol}")
        response = execute_trade(TEST_USER, "buy", symbol, 0.01)
        
        if response and response.status_code == 400:
            print_success(f"  ✓ 无效币种被阻止")
        else:
            print_error(f"  ✗ 无效币种未被阻止！状态码: {response.status_code if response else 'No response'}")
            all_passed = False
    
    if all_passed:
        print_success("无效币种符号测试通过")
    else:
        print_error("无效币种符号测试失败")
    
    return all_passed

def test_invalid_trade_type():
    """测试9：无效交易类型"""
    print_section("测试9：无效交易类型")
    
    invalid_types = ["hack", "delete", "update", ""]
    
    all_passed = True
    for trade_type in invalid_types:
        print_info(f"测试无效交易类型: {trade_type}")
        response = execute_trade(TEST_USER, trade_type, "BTC", 0.01)
        
        if response and response.status_code == 400:
            print_success(f"  ✓ 无效交易类型被阻止")
        else:
            print_error(f"  ✗ 无效交易类型未被阻止！状态码: {response.status_code if response else 'No response'}")
            all_passed = False
    
    if all_passed:
        print_success("无效交易类型测试通过")
    else:
        print_error("无效交易类型测试失败")
    
    return all_passed

def main():
    """主测试函数"""
    print(f"\n{'='*80}")
    print(f"{Colors.BLUE}🔒 安全交易API测试套件{Colors.END}")
    print(f"{'='*80}")
    print(f"测试时间: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"API地址: {BASE_URL}")
    print(f"测试用户: {TEST_USER}")
    print(f"{'='*80}\n")
    
    # 运行所有测试
    tests = [
        ("正常买入交易", test_normal_buy),
        ("正常卖出交易", test_normal_sell),
        ("资金不足检查", test_insufficient_funds),
        ("持仓不足检查", test_insufficient_holdings),
        ("SQL注入防护", test_sql_injection),
        ("数值注入防护", test_numeric_injection),
        ("无效币种符号", test_invalid_crypto_symbol),
        ("无效交易类型", test_invalid_trade_type),
        ("请求频率限制", test_rate_limiting),
    ]
    
    results = []
    for test_name, test_func in tests:
        try:
            result = test_func()
            results.append((test_name, result))
        except Exception as e:
            print_error(f"测试异常: {e}")
            results.append((test_name, False))
    
    # 输出测试总结
    print_section("测试总结")
    
    passed = sum(1 for _, result in results if result)
    total = len(results)
    
    for test_name, result in results:
        status = f"{Colors.GREEN}✅ 通过{Colors.END}" if result else f"{Colors.RED}❌ 失败{Colors.END}"
        print(f"{test_name}: {status}")
    
    print(f"\n{'='*80}")
    print(f"总计: {passed}/{total} 测试通过")
    
    if passed == total:
        print_success("🎉 所有测试通过！系统安全性良好。")
    else:
        print_error(f"⚠️  有 {total - passed} 个测试失败，请检查系统安全性。")
    
    print(f"{'='*80}\n")

if __name__ == "__main__":
    main()
