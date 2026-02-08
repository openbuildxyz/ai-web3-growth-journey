/**
 * 🔒 安全交易API模块
 * 
 * 本模块实现了安全的交易功能，所有资产计算和验证都在服务器端完成
 * 客户端只能发送交易请求，不能直接修改资产数据
 */

/**
 * 执行交易（买入或卖出）
 * @param {string} engName - 用户英文名
 * @param {string} tradeType - 交易类型：'buy' 或 'sell'
 * @param {string} cryptoSymbol - 加密货币符号（如 'BTC'）
 * @param {number} quantity - 交易数量
 * @returns {Promise<Object>} 交易结果
 */
export async function executeTrade(engName, tradeType, cryptoSymbol, quantity) {
    try {
        console.log('🔒 [安全交易] 发送交易请求到服务器');
        console.log(`  - 用户: ${engName}`);
        console.log(`  - 类型: ${tradeType}`);
        console.log(`  - 币种: ${cryptoSymbol}`);
        console.log(`  - 数量: ${quantity}`);
        
        const response = await fetch('/api/trade/execute', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                eng_name: engName,
                trade_type: tradeType,
                crypto_symbol: cryptoSymbol,
                quantity: quantity
            })
        });
        
        console.log(`🔒 [安全交易] 服务器响应状态: ${response.status}`);
        
        const result = await response.json();
        
        if (!response.ok) {
            console.error('🔒 [安全交易] 交易失败:', result.detail || result.message);
            throw new Error(result.detail || result.message || '交易失败');
        }
        
        console.log('🔒 [安全交易] 交易成功');
        console.log('  - 交易金额:', result.trade_data.total_amount);
        console.log('  - 新总资产:', result.user_assets.total_assets);
        console.log('  - 新可用资金:', result.user_assets.available_cash);
        
        return result;
        
    } catch (error) {
        console.error('🔒 [安全交易] 交易请求失败:', error);
        throw error;
    }
}

/**
 * 获取用户最新资产数据
 * @param {string} engName - 用户英文名
 * @returns {Promise<Object>} 用户资产数据
 */
export async function getUserAssets(engName) {
    try {
        console.log(`🔒 [安全查询] 获取用户 ${engName} 的最新资产数据`);
        
        const response = await fetch(`/api/user/load/${engName}`);
        
        if (!response.ok) {
            throw new Error('获取用户资产失败');
        }
        
        const result = await response.json();
        
        if (!result.success) {
            throw new Error(result.message || '获取用户资产失败');
        }
        
        console.log('🔒 [安全查询] 资产数据获取成功');
        console.log('  - 总资产:', result.user_data.total_assets);
        console.log('  - 可用资金:', result.user_data.available_cash);
        console.log('  - 持仓数量:', result.portfolios.length);
        
        return result;
        
    } catch (error) {
        console.error('🔒 [安全查询] 获取资产失败:', error);
        throw error;
    }
}

/**
 * 验证交易参数
 * @param {string} tradeType - 交易类型
 * @param {string} cryptoSymbol - 加密货币符号
 * @param {number} quantity - 交易数量
 * @returns {Object} 验证结果 {valid: boolean, error: string}
 */
export function validateTradeParams(tradeType, cryptoSymbol, quantity) {
    // 验证交易类型
    if (!tradeType || (tradeType !== 'buy' && tradeType !== 'sell')) {
        return {
            valid: false,
            error: '交易类型必须是buy或sell'
        };
    }
    
    // 验证币种符号
    if (!cryptoSymbol || typeof cryptoSymbol !== 'string' || cryptoSymbol.trim() === '') {
        return {
            valid: false,
            error: '请选择要交易的币种'
        };
    }
    
    // 验证交易数量
    if (!quantity || typeof quantity !== 'number' || isNaN(quantity)) {
        return {
            valid: false,
            error: '请输入有效的交易数量'
        };
    }
    
    if (quantity <= 0) {
        return {
            valid: false,
            error: '交易数量必须大于0'
        };
    }
    
    if (quantity > 1000000000) {
        return {
            valid: false,
            error: '交易数量超过限制（最大10亿）'
        };
    }
    
    // 检查是否为有限数值
    if (!isFinite(quantity)) {
        return {
            valid: false,
            error: '交易数量必须是有限数值'
        };
    }
    
    return {
        valid: true,
        error: null
    };
}

/**
 * 格式化交易错误信息
 * @param {Error} error - 错误对象
 * @returns {string} 格式化后的错误信息
 */
export function formatTradeError(error) {
    if (!error) {
        return '未知错误';
    }
    
    const errorMessage = error.message || error.toString();
    
    // 常见错误信息的友好化处理
    if (errorMessage.includes('资金不足')) {
        return '💰 可用资金不足，无法完成买入';
    }
    
    if (errorMessage.includes('持仓不足')) {
        return '📦 持仓数量不足，无法完成卖出';
    }
    
    if (errorMessage.includes('数据库')) {
        return '🔧 系统繁忙，请稍后再试';
    }
    
    if (errorMessage.includes('网络')) {
        return '🌐 网络连接失败，请检查网络';
    }
    
    if (errorMessage.includes('Too Many Requests')) {
        return '⏱️ 操作过于频繁，请稍后再试';
    }
    
    return errorMessage;
}
