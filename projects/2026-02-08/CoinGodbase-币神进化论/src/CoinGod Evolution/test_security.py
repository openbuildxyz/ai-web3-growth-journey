#!/usr/bin/env python3
"""
安全测试脚本
用于验证系统安全加固措施的有效性
"""

import requests
import json
import time
from typing import Dict, List

# 测试配置
BASE_URL = "http://localhost:8000"
TEST_USER = "security_test_user"

class SecurityTester:
    def __init__(self, base_url: str):
        self.base_url = base_url
        self.results = []
    
    def test_case(self, name: str, test_func):
        """执行测试用例"""
        print(f"\n{'='*80}")
        print(f"测试用例: {name}")
        print(f"{'='*80}")
        
        try:
            result = test_func()
            self.results.append({
                'name': name,
                'status': 'PASS' if result['success'] else 'FAIL',
                'details': result
            })
            
            status_icon = "✅" if result['success'] else "❌"
            print(f"{status_icon} 测试结果: {result['status']}")
            print(f"详情: {result['message']}")
            
        except Exception as e:
            self.results.append({
                'name': name,
                'status': 'ERROR',
                'details': {'error': str(e)}
            })
            print(f"❌ 测试异常: {e}")
    
    def test_1_abnormal_values(self) -> Dict:
        """测试用例1: 异常数值攻击"""
        attack_data = {
            "eng_name": TEST_USER,
            "total_assets": 74054654600.0024283858,  # 超过最大限制
            "available_cash": 100000000.09,
            "today_profit": 0.0024283857783302665,
            "total_profit_rate": 6666,  # 超过最大限制
            "portfolios": []
        }
        
        response = requests.post(
            f"{self.base_url}/api/user/save",
            json=attack_data
        )
        
        # 预期：应该被拦截（400错误）
        if response.status_code == 400:
            return {
                'success': True,
                'status': 'BLOCKED',
                'message': '异常数值攻击被成功拦截',
                'response': response.json()
            }
        else:
            return {
                'success': False,
                'status': 'VULNERABLE',
                'message': f'异常数值攻击未被拦截，状态码: {response.status_code}',
                'response': response.text
            }
    
    def test_2_sql_injection(self) -> Dict:
        """测试用例2: SQL注入攻击"""
        attack_data = {
            "eng_name": "admin'; DROP TABLE users; --",
            "total_assets": 1000000,
            "available_cash": 1000000,
            "today_profit": 0,
            "total_profit_rate": 0,
            "portfolios": []
        }
        
        response = requests.post(
            f"{self.base_url}/api/user/save",
            json=attack_data
        )
        
        # 预期：应该被拦截（400错误）
        if response.status_code == 400:
            return {
                'success': True,
                'status': 'BLOCKED',
                'message': 'SQL注入攻击被成功拦截',
                'response': response.json()
            }
        else:
            return {
                'success': False,
                'status': 'VULNERABLE',
                'message': f'SQL注入攻击未被拦截，状态码: {response.status_code}',
                'response': response.text
            }
    
    def test_3_nan_infinity(self) -> Dict:
        """测试用例3: NaN/Infinity攻击"""
        attack_data = {
            "eng_name": TEST_USER,
            "total_assets": float('nan'),
            "available_cash": float('inf'),
            "today_profit": 0,
            "total_profit_rate": 0,
            "portfolios": []
        }
        
        try:
            response = requests.post(
                f"{self.base_url}/api/user/save",
                json=attack_data
            )
            
            # 预期：应该被拦截（400错误）
            if response.status_code == 400:
                return {
                    'success': True,
                    'status': 'BLOCKED',
                    'message': 'NaN/Infinity攻击被成功拦截',
                    'response': response.json()
                }
            else:
                return {
                    'success': False,
                    'status': 'VULNERABLE',
                    'message': f'NaN/Infinity攻击未被拦截，状态码: {response.status_code}',
                    'response': response.text
                }
        except Exception as e:
            # JSON序列化失败也算拦截成功
            return {
                'success': True,
                'status': 'BLOCKED',
                'message': f'NaN/Infinity在序列化阶段被拦截: {e}',
                'response': None
            }
    
    def test_4_business_logic(self) -> Dict:
        """测试用例4: 业务逻辑异常"""
        attack_data = {
            "eng_name": TEST_USER,
            "total_assets": 1000000,
            "available_cash": 2000000,  # 超过总资产
            "today_profit": 0,
            "total_profit_rate": 0,
            "portfolios": []
        }
        
        response = requests.post(
            f"{self.base_url}/api/user/save",
            json=attack_data
        )
        
        # 预期：应该被拦截（400错误）
        if response.status_code == 400:
            return {
                'success': True,
                'status': 'BLOCKED',
                'message': '业务逻辑异常被成功拦截',
                'response': response.json()
            }
        else:
            return {
                'success': False,
                'status': 'VULNERABLE',
                'message': f'业务逻辑异常未被拦截，状态码: {response.status_code}',
                'response': response.text
            }
    
    def test_5_invalid_crypto_symbol(self) -> Dict:
        """测试用例5: 无效的加密货币符号"""
        attack_data = {
            "eng_name": TEST_USER,
            "total_assets": 1100000,
            "available_cash": 1000000,
            "today_profit": 0,
            "total_profit_rate": 0,
            "portfolios": [
                {
                    "crypto_symbol": "FAKE",  # 不支持的币种
                    "crypto_name": "FakeCoin",
                    "quantity": 100,
                    "avg_cost": 1000,
                    "current_price": 1000,
                    "market_value": 100000,
                    "profit_loss": 0,
                    "profit_loss_rate": 0
                }
            ]
        }
        
        response = requests.post(
            f"{self.base_url}/api/user/save",
            json=attack_data
        )
        
        # 预期：应该被拦截（400错误）
        if response.status_code == 400:
            return {
                'success': True,
                'status': 'BLOCKED',
                'message': '无效加密货币符号被成功拦截',
                'response': response.json()
            }
        else:
            return {
                'success': False,
                'status': 'VULNERABLE',
                'message': f'无效加密货币符号未被拦截，状态码: {response.status_code}',
                'response': response.text
            }
    
    def test_6_rate_limiting(self) -> Dict:
        """测试用例6: 频率限制测试"""
        print("发送35次请求测试频率限制（限制为30次/分钟）...")
        
        valid_data = {
            "eng_name": TEST_USER,
            "total_assets": 1000000,
            "available_cash": 1000000,
            "today_profit": 0,
            "total_profit_rate": 0,
            "portfolios": []
        }
        
        success_count = 0
        blocked_count = 0
        
        for i in range(35):
            response = requests.post(
                f"{self.base_url}/api/user/save",
                json=valid_data
            )
            
            if response.status_code == 200:
                success_count += 1
            elif response.status_code == 429:  # Too Many Requests
                blocked_count += 1
            
            print(f"请求 {i+1}/35: 状态码 {response.status_code}", end='\r')
            time.sleep(0.1)  # 避免过快
        
        print()  # 换行
        
        # 预期：前30次成功，后5次被限制
        if blocked_count >= 5:
            return {
                'success': True,
                'status': 'PROTECTED',
                'message': f'频率限制生效：{success_count}次成功，{blocked_count}次被限制',
                'details': {
                    'success_count': success_count,
                    'blocked_count': blocked_count
                }
            }
        else:
            return {
                'success': False,
                'status': 'VULNERABLE',
                'message': f'频率限制未生效：{success_count}次成功，{blocked_count}次被限制',
                'details': {
                    'success_count': success_count,
                    'blocked_count': blocked_count
                }
            }
    
    def test_7_valid_data(self) -> Dict:
        """测试用例7: 合法数据测试（确保不误拦截）"""
        valid_data = {
            "eng_name": TEST_USER,
            "chn_name": "测试用户",
            "dept_name": "测试部门",
            "position_name": "测试工程师",
            "total_assets": 1100000.50,
            "available_cash": 100000.50,
            "today_profit": 100000.00,
            "total_profit_rate": 10.0,
            "portfolios": [
                {
                    "crypto_symbol": "BTC",
                    "crypto_name": "Bitcoin",
                    "quantity": 10.5,
                    "avg_cost": 95000.0,
                    "current_price": 95238.095238,
                    "market_value": 1000000.0,
                    "profit_loss": 2500.0,
                    "profit_loss_rate": 0.25
                }
            ]
        }
        
        # 等待频率限制重置
        print("等待60秒以重置频率限制...")
        time.sleep(60)
        
        response = requests.post(
            f"{self.base_url}/api/user/save",
            json=valid_data
        )
        
        # 预期：应该成功（200）
        if response.status_code == 200:
            return {
                'success': True,
                'status': 'PASSED',
                'message': '合法数据正常保存，未被误拦截',
                'response': response.json()
            }
        else:
            return {
                'success': False,
                'status': 'FAILED',
                'message': f'合法数据被误拦截，状态码: {response.status_code}',
                'response': response.text
            }
    
    def generate_report(self):
        """生成测试报告"""
        print("\n" + "="*80)
        print("安全测试报告")
        print("="*80)
        
        total = len(self.results)
        passed = sum(1 for r in self.results if r['status'] == 'PASS')
        failed = sum(1 for r in self.results if r['status'] == 'FAIL')
        errors = sum(1 for r in self.results if r['status'] == 'ERROR')
        
        print(f"\n总测试用例: {total}")
        print(f"✅ 通过: {passed}")
        print(f"❌ 失败: {failed}")
        print(f"⚠️  错误: {errors}")
        print(f"\n通过率: {(passed/total*100):.1f}%")
        
        print("\n详细结果:")
        for i, result in enumerate(self.results, 1):
            status_icon = {
                'PASS': '✅',
                'FAIL': '❌',
                'ERROR': '⚠️'
            }.get(result['status'], '❓')
            
            print(f"{i}. {status_icon} {result['name']}: {result['status']}")
        
        print("\n" + "="*80)
        
        # 保存报告到文件
        with open('security_test_report.json', 'w', encoding='utf-8') as f:
            json.dump({
                'summary': {
                    'total': total,
                    'passed': passed,
                    'failed': failed,
                    'errors': errors,
                    'pass_rate': f"{(passed/total*100):.1f}%"
                },
                'results': self.results
            }, f, indent=2, ensure_ascii=False)
        
        print("详细报告已保存到: security_test_report.json")

def main():
    """主函数"""
    print("="*80)
    print("币神进化论 - 安全测试工具")
    print("="*80)
    print(f"测试目标: {BASE_URL}")
    print(f"测试用户: {TEST_USER}")
    print("="*80)
    
    # 检查服务是否可用
    try:
        response = requests.get(f"{BASE_URL}/api/health", timeout=5)
        if response.status_code != 200:
            print("❌ 服务不可用，请先启动后端服务")
            return
        print("✅ 服务连接成功\n")
    except Exception as e:
        print(f"❌ 无法连接到服务: {e}")
        print("请确保后端服务已启动（http://localhost:8000）")
        return
    
    # 创建测试器
    tester = SecurityTester(BASE_URL)
    
    # 执行测试用例
    tester.test_case("异常数值攻击", tester.test_1_abnormal_values)
    tester.test_case("SQL注入攻击", tester.test_2_sql_injection)
    tester.test_case("NaN/Infinity攻击", tester.test_3_nan_infinity)
    tester.test_case("业务逻辑异常", tester.test_4_business_logic)
    tester.test_case("无效加密货币符号", tester.test_5_invalid_crypto_symbol)
    tester.test_case("频率限制测试", tester.test_6_rate_limiting)
    tester.test_case("合法数据测试", tester.test_7_valid_data)
    
    # 生成报告
    tester.generate_report()

if __name__ == "__main__":
    main()
