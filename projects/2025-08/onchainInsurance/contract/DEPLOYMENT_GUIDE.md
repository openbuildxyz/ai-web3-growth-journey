# 🚀 部署和前端集成指南

## 📦 部署步骤

### 1. 准备环境
```bash
# 安装依赖
cd contract
forge install

# 编译合约
forge build

# 运行测试确保一切正常
forge test
```

### 2. 部署到测试网
```bash
# 设置环境变量
export PRIVATE_KEY=your_private_key
export RPC_URL=https://sepolia.infura.io/v3/your_key

# 部署
forge script script/Deploy.s.sol:DeployScript --rpc-url $RPC_URL --private-key $PRIVATE_KEY --broadcast --verify
```

### 3. 获取合约地址
部署成功后，记录以下地址：
```
✅ MockUSDC deployed at: 0x...
✅ InsuranceManager deployed at: 0x...
```

---

## 🔧 前端集成

### 1. 获取ABI
```bash
# 提取主要合约的ABI
cat out/InsuranceManager.sol/InsuranceManager.json | jq .abi > InsuranceManager.abi.json
cat out/MockUSDC.sol/MockUSDC.json | jq .abi > MockUSDC.abi.json
```

### 2. 前端配置文件
创建 `config.js`:
```javascript
export const config = {
  // 合约地址 (部署后填入)
  INSURANCE_MANAGER_ADDRESS: "0x...",
  MOCK_USDC_ADDRESS: "0x...",
  
  // 网络配置
  NETWORK: {
    chainId: 11155111, // Sepolia
    name: "Sepolia",
    rpcUrl: "https://sepolia.infura.io/v3/your_key"
  },
  
  // USDC配置
  USDC_DECIMALS: 6
};
```

### 3. 合约实例创建
```javascript
import { ethers } from 'ethers';
import { config } from './config.js';
import InsuranceManagerABI from './InsuranceManager.abi.json';
import MockUSDCABI from './MockUSDC.abi.json';

// 连接钱包
const provider = new ethers.providers.Web3Provider(window.ethereum);
const signer = provider.getSigner();

// 创建合约实例
export const insuranceContract = new ethers.Contract(
  config.INSURANCE_MANAGER_ADDRESS,
  InsuranceManagerABI,
  signer
);

export const usdcContract = new ethers.Contract(
  config.MOCK_USDC_ADDRESS,
  MockUSDCABI,
  signer
);
```

---

## 🎯 核心功能实现示例

### 1. 连接钱包
```javascript
const connectWallet = async () => {
  try {
    await window.ethereum.request({ method: 'eth_requestAccounts' });
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const address = await signer.getAddress();
    
    console.log('钱包连接成功:', address);
    return { provider, signer, address };
  } catch (error) {
    console.error('连接钱包失败:', error);
    throw error;
  }
};
```

### 2. 获取保险列表
```javascript
const getInsuranceList = async () => {
  // 由于没有直接的获取所有保险的函数，我们需要监听创建事件
  const filter = insuranceContract.filters.InsuranceCreated();
  const events = await insuranceContract.queryFilter(filter);
  
  const insurances = await Promise.all(
    events.map(async (event) => {
      const { insuranceId, country, disasterType, month, year } = event.args;
      const info = await insuranceContract.insuranceInfos(insuranceId);
      
      return {
        id: insuranceId,
        country,
        disasterType,
        month: month.toNumber(),
        year: year.toNumber(),
        exists: info.exists,
        disasterHappened: info.disasterHappened,
        totalPool: ethers.utils.formatUnits(info.totalPool, 6),
        totalShares: ethers.utils.formatUnits(info.totalShares, 6),
        claimRatio: info.claimRatio.toNumber(),
        poolProcessed: info.poolProcessed,
        inheritedAmount: ethers.utils.formatUnits(info.inheritedAmount, 6)
      };
    })
  );
  
  return insurances.filter(ins => ins.exists);
};
```

### 3. 购买保险
```javascript
const buyInsurance = async (insuranceId, usdcAmount) => {
  try {
    // 1. 检查USDC余额
    const userAddress = await signer.getAddress();
    const balance = await usdcContract.balanceOf(userAddress);
    
    if (balance.lt(usdcAmount)) {
      throw new Error('USDC余额不足');
    }
    
    // 2. 检查授权额度
    const allowance = await usdcContract.allowance(userAddress, config.INSURANCE_MANAGER_ADDRESS);
    
    if (allowance.lt(usdcAmount)) {
      console.log('需要授权USDC...');
      const approveTx = await usdcContract.approve(config.INSURANCE_MANAGER_ADDRESS, usdcAmount);
      await approveTx.wait();
      console.log('USDC授权成功');
    }
    
    // 3. 购买保险
    console.log('购买保险中...');
    const buyTx = await insuranceContract.buyInsurance(insuranceId, usdcAmount);
    const receipt = await buyTx.wait();
    
    console.log('保险购买成功!', receipt.transactionHash);
    return receipt;
    
  } catch (error) {
    console.error('购买保险失败:', error);
    throw error;
  }
};
```

### 4. 申请理赔
```javascript
const claimInsurance = async (insuranceId) => {
  try {
    // 1. 检查理赔状态
    const userAddress = await signer.getAddress();
    const potentialClaim = await insuranceContract.getPotentialClaim(userAddress, insuranceId);
    
    if (potentialClaim.eq(0)) {
      throw new Error('当前无法理赔或理赔金额为0');
    }
    
    // 2. 申请理赔
    console.log('申请理赔中...');
    const claimTx = await insuranceContract.claim(insuranceId);
    const receipt = await claimTx.wait();
    
    const claimAmount = ethers.utils.formatUnits(potentialClaim, 6);
    console.log(`理赔成功! 获得 ${claimAmount} USDC`);
    return receipt;
    
  } catch (error) {
    console.error('理赔失败:', error);
    throw error;
  }
};
```

### 5. 获取用户保险状态
```javascript
const getUserInsuranceStatus = async (insuranceId) => {
  try {
    const userAddress = await signer.getAddress();
    
    const [userShares, hasClaimed, potentialClaim, info] = await Promise.all([
      insuranceContract.getUserShares(userAddress, insuranceId),
      insuranceContract.hasUserClaimed(userAddress, insuranceId),
      insuranceContract.getPotentialClaim(userAddress, insuranceId),
      insuranceContract.insuranceInfos(insuranceId)
    ]);
    
    return {
      hasShares: !userShares.eq(0),
      shares: ethers.utils.formatUnits(userShares, 6),
      hasClaimed,
      potentialClaim: ethers.utils.formatUnits(potentialClaim, 6),
      canClaim: !potentialClaim.eq(0) && !hasClaimed,
      status: getInsuranceStatus(info, userShares, hasClaimed, potentialClaim)
    };
    
  } catch (error) {
    console.error('获取保险状态失败:', error);
    throw error;
  }
};

const getInsuranceStatus = (info, userShares, hasClaimed, potentialClaim) => {
  if (userShares.eq(0)) return '未购买';
  if (hasClaimed) return '已理赔';
  if (!info.disasterHappened && !info.poolProcessed) return '等待灾害结果';
  if (potentialClaim.eq(0)) return '无理赔(无灾害)';
  return '可理赔';
};
```

---

## 📊 事件监听实现

### 1. 实时更新保险状态
```javascript
const setupEventListeners = () => {
  // 监听保险购买事件
  insuranceContract.on('InsurancePurchased', (user, insuranceId, usdcAmount, shares) => {
    console.log('保险购买事件:', {
      user,
      insuranceId,
      amount: ethers.utils.formatUnits(usdcAmount, 6),
      shares: ethers.utils.formatUnits(shares, 6)
    });
    
    // 更新UI
    updateInsuranceDisplay(insuranceId);
  });
  
  // 监听灾害声明事件
  insuranceContract.on('DisasterDeclared', (insuranceId, claimRatio) => {
    console.log('灾害声明事件:', {
      insuranceId,
      claimRatio: claimRatio.toNumber()
    });
    
    // 通知用户可以理赔
    notifyClaimAvailable(insuranceId);
  });
  
  // 监听理赔事件
  insuranceContract.on('Claimed', (user, insuranceId, claimAmount) => {
    console.log('理赔事件:', {
      user,
      insuranceId,
      amount: ethers.utils.formatUnits(claimAmount, 6)
    });
  });
  
  // 监听资金继承事件
  insuranceContract.on('FundsInherited', (fromId, toId, amount) => {
    console.log('资金继承事件:', {
      from: fromId,
      to: toId,
      amount: ethers.utils.formatUnits(amount, 6)
    });
  });
};
```

### 2. 错误处理
```javascript
const handleError = (error) => {
  if (error.code === 4001) {
    return '用户取消了交易';
  } else if (error.code === -32603) {
    return '交易执行失败，请检查参数';
  } else if (error.message.includes('insufficient funds')) {
    return '余额不足';
  } else if (error.message.includes('User denied')) {
    return '用户拒绝了交易';
  } else {
    return error.message || '未知错误';
  }
};
```

---

## 🎨 UI组件建议

### 1. 保险卡片组件
```jsx
const InsuranceCard = ({ insurance }) => {
  const [userStatus, setUserStatus] = useState(null);
  
  useEffect(() => {
    getUserInsuranceStatus(insurance.id).then(setUserStatus);
  }, [insurance.id]);
  
  return (
    <div className="insurance-card">
      <h3>{insurance.country} {insurance.disasterType}</h3>
      <p>{insurance.year}年{insurance.month}月</p>
      
      <div className="stats">
        <span>总池: {insurance.totalPool} USDC</span>
        {insurance.inheritedAmount > 0 && (
          <span>继承: {insurance.inheritedAmount} USDC</span>
        )}
      </div>
      
      <div className="actions">
        {!userStatus?.hasShares && (
          <button onClick={() => handleBuyInsurance(insurance.id)}>
            购买保险
          </button>
        )}
        
        {userStatus?.canClaim && (
          <button onClick={() => handleClaim(insurance.id)}>
            理赔 ({userStatus.potentialClaim} USDC)
          </button>
        )}
        
        <span className="status">{userStatus?.status}</span>
      </div>
    </div>
  );
};
```

### 2. 用户钱包余额组件
```jsx
const WalletBalance = () => {
  const [balance, setBalance] = useState('0');
  
  useEffect(() => {
    const updateBalance = async () => {
      const userAddress = await signer.getAddress();
      const usdcBalance = await usdcContract.balanceOf(userAddress);
      setBalance(ethers.utils.formatUnits(usdcBalance, 6));
    };
    
    updateBalance();
    const interval = setInterval(updateBalance, 10000); // 每10秒更新
    
    return () => clearInterval(interval);
  }, []);
  
  return (
    <div className="wallet-balance">
      <span>USDC余额: {balance}</span>
    </div>
  );
};
```

这份文档提供了完整的前端集成指南，包含了所有必要的代码示例和最佳实践！ 