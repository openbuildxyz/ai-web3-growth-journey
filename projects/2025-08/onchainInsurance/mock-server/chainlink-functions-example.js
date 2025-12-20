/**
 * Chainlink Functions 脚本示例
 * 用于调用灾害新闻API并返回理赔比例
 * 
 * 参数说明:
 * args[0] - country (国家: China, Japan, USA)
 * args[1] - disasterType (灾害类型: Flood, Typhoon, Earthquake)  
 * args[2] - year (年份: 2025)
 * args[3] - month (月份: 1-12)
 */

// 从arguments获取参数
const country = args[0];
const disasterType = args[1]; 
const year = args[2];
const month = args[3];

// 验证参数
if (!country || !disasterType || !year || !month) {
  throw Error("Missing required parameters: country, disasterType, year, month");
}

// API服务器地址 (替换为你的实际服务器地址)
const API_BASE_URL = "http://your-mock-server.com";

// 构建API请求URL
const apiUrl = `${API_BASE_URL}/api/disasters/chainlink?country=${encodeURIComponent(country)}&disaster_type=${encodeURIComponent(disasterType)}&year=${year}&month=${month}`;

console.log(`🔍 查询参数: ${country}, ${disasterType}, ${year}年${month}月`);
console.log(`📡 API请求: ${apiUrl}`);

// 发起HTTP请求
const apiRequest = Functions.makeHttpRequest({
  url: apiUrl,
  method: "GET",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 9000, // 9秒超时
});

// 等待API响应
const apiResponse = await apiRequest;

console.log(`📡 API响应状态: ${apiResponse.status}`);

// 检查API响应状态
if (apiResponse.error) {
  console.error("❌ API请求失败:", apiResponse.error);
  throw Error(`API request failed: ${apiResponse.error}`);
}

if (apiResponse.status !== 200) {
  console.error(`❌ API返回错误状态: ${apiResponse.status}`);
  throw Error(`API returned status: ${apiResponse.status}`);
}

// 解析响应数据
let responseData;
try {
  responseData = apiResponse.data;
  console.log("📊 API响应数据:", JSON.stringify(responseData, null, 2));
} catch (error) {
  console.error("❌ JSON解析失败:", error);
  throw Error("Failed to parse API response");
}

// 验证响应格式
if (!responseData.success) {
  console.error("❌ API返回失败状态");
  throw Error("API returned failure status");
}

// 获取推荐的理赔比例
const claimRatio = responseData.recommended_claim_ratio || 0;
const foundDisasters = responseData.found_disasters || 0;
const maxSeverity = responseData.max_severity || 0;

console.log(`🎯 查询结果:`);
console.log(`   - 找到 ${foundDisasters} 个灾害事件`);
console.log(`   - 最高严重程度: ${maxSeverity}`);
console.log(`   - 推荐理赔比例: ${claimRatio}%`);

// 如果找到灾害事件，记录详细信息
if (foundDisasters > 0 && responseData.disasters) {
  console.log(`📋 灾害事件详情:`);
  responseData.disasters.forEach((disaster, index) => {
    console.log(`   ${index + 1}. ${disaster.headline}`);
    console.log(`      严重程度: ${disaster.severity}, 伤亡: ${disaster.casualties}人`);
  });
}

// 返回理赔比例给智能合约
// 注意: Chainlink Functions 需要返回 bytes 格式
return Functions.encodeUint256(claimRatio);

// =============================================================================
// 使用示例 (在 Chainlink Functions 订阅中)
// =============================================================================

/**
 * 智能合约中的调用示例:
 * 
 * // 构建参数数组
 * string[] memory args = new string[](4);
 * args[0] = "China";        // 国家
 * args[1] = "Typhoon";      // 灾害类型  
 * args[2] = "2025";         // 年份
 * args[3] = "5";            // 月份
 * 
 * // 发起 Functions 请求
 * bytes32 requestId = _sendRequest(
 *     source,               // 上面的 JavaScript 代码
 *     args,                 // 参数数组
 *     new bytes[](0),       // 加密的秘密参数 (可选)
 *     subscriptionId,       // 订阅ID
 *     gasLimit              // Gas限制
 * );
 * 
 * // 在回调函数中处理结果
 * function fulfillRequest(bytes32 requestId, bytes memory response, bytes memory err) 
 *     internal override {
 *     if (err.length > 0) {
 *         // 处理错误
 *         return;
 *     }
 *     
 *     // 解码理赔比例
 *     uint256 claimRatio = abi.decode(response, (uint256));
 *     
 *     // 调用保险合约的灾害声明函数
 *     bytes32 insuranceId = getInsuranceId("China", "Typhoon", 5, 2025);
 *     insuranceManager.declareDisaster(insuranceId, claimRatio);
 * }
 */

// =============================================================================
// 测试用例
// =============================================================================

/**
 * 测试案例 1: 查询中国台风 (2025年5月)
 * args = ["China", "Typhoon", "2025", "5"]
 * 预期结果: 找到super typhoon, 理赔比例 100%
 * 
 * 测试案例 2: 查询日本地震 (2025年1月)  
 * args = ["Japan", "Earthquake", "2025", "1"]
 * 预期结果: 找到6.8级地震, 理赔比例 80%
 * 
 * 测试案例 3: 查询美国洪水 (2025年3月)
 * args = ["USA", "Flood", "2025", "3"] 
 * 预期结果: 无事件, 理赔比例 0%
 */ 