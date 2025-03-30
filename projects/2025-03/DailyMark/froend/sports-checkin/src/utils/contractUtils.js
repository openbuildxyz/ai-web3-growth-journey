import { ethers } from 'ethers';

// 合约ABI
const CONTRACT_ABI = [
  "function firstLogin() external",
  "function checkIn() external",
  "function getUserData(address user) external view returns (bool hasLoggedIn, bool hasCheckedIn, uint256 lastCheckInTime, uint256 consecutiveCheckIns, bool[] milestonesAchieved, bool hasInterrupted, bool hasResumedAfterInterrupt, uint256 lastCheckInDay)",
  "function tokenURI(uint256 tokenId) external view returns (string memory)",
  "event FirstLogin(address indexed user, uint256 timestamp)",
  "event CheckedIn(address indexed user, uint256 timestamp, uint256 consecutiveCount)",
  "event MilestoneAchieved(address indexed user, uint8 milestone, uint256 tokenId)"
];

// 里程碑类型对应表
const MILESTONE_TYPES = [
  "首次登录",
  "第一次打卡",
  "连续打卡7天",
  "连续打卡1月",
  "连续打卡3月",
  "连续打卡1年",
  "中断后恢复打卡"
];

// NFT图片映射（由于没有IPFS，直接使用本地或CDN图片）
const MILESTONE_IMAGES = [
  "/images/nft-first-login.png",
  "/images/nft-first-checkin.png",
  "/images/nft-7days.png",
  "/images/nft-1month.png",
  "/images/nft-3months.png",
  "/images/nft-1year.png",
  "/images/nft-resumed.png"
];

// 合约地址
const CONTRACT_ADDRESS = "0x..."; // 替换为实际部署的合约地址

class SportCheckInContract {
  constructor(provider) {
    this.provider = provider;
    this.contract = null;
    if (provider) {
      const signer = provider.getSigner();
      this.contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
    }
  }

  // 首次登录
  async firstLogin() {
    try {
      if (!this.contract) throw new Error("合约实例未初始化");
      
      const tx = await this.contract.firstLogin();
      await tx.wait();
      return { success: true };
    } catch (error) {
      console.error("首次登录失败:", error);
      return { 
        success: false, 
        error: this.parseErrorMessage(error) 
      };
    }
  }

  // 打卡
  async checkIn() {
    try {
      if (!this.contract) throw new Error("合约实例未初始化");
      
      const tx = await this.contract.checkIn();
      await tx.wait();
      return { success: true };
    } catch (error) {
      console.error("打卡失败:", error);
      return { 
        success: false, 
        error: this.parseErrorMessage(error) 
      };
    }
  }

  // 获取用户数据
  async getUserData(address) {
    try {
      if (!this.contract) throw new Error("合约实例未初始化");
      
      const data = await this.contract.getUserData(address);
      
      return {
        success: true,
        data: {
          hasLoggedIn: data.hasLoggedIn,
          hasCheckedIn: data.hasCheckedIn,
          lastCheckInTime: data.lastCheckInTime.toNumber(),
          consecutiveCheckIns: data.consecutiveCheckIns.toNumber(),
          milestonesAchieved: data.milestonesAchieved,
          hasInterrupted: data.hasInterrupted,
          hasResumedAfterInterrupt: data.hasResumedAfterInterrupt,
          lastCheckInDay: data.lastCheckInDay.toNumber()
        }
      };
    } catch (error) {
      console.error("获取用户数据失败:", error);
      return { 
        success: false, 
        error: this.parseErrorMessage(error) 
      };
    }
  }

  // 获取里程碑信息（根据类型返回静态数据）
  getMilestoneInfo(milestoneType) {
    const index = MILESTONE_TYPES.indexOf(milestoneType);
    if (index === -1) return null;
    
    return {
      name: MILESTONE_TYPES[index],
      imageUrl: MILESTONE_IMAGES[index],
      description: this.getMilestoneDescription(index)
    };
  }
  
  // 获取里程碑描述
  getMilestoneDescription(index) {
    const descriptions = [
      "欢迎加入运动打卡，开启健康生活！",
      "完成第一次运动打卡，坚持的旅程由此开始！",
      "连续打卡一周，养成良好习惯！",
      "连续打卡一个月，展现超强毅力！",
      "连续打卡三个月，成为运动达人！",
      "连续打卡一整年，运动已成为生活的一部分！",
      "重新回到运动轨道，永不放弃！"
    ];
    
    return descriptions[index] || "恭喜获得成就！";
  }

  // 获取NFT URI
  async getTokenURI(tokenId) {
    try {
      if (!this.contract) throw new Error("合约实例未初始化");
      
      const uri = await this.contract.tokenURI(tokenId);
      return { success: true, uri };
    } catch (error) {
      console.error("获取NFT URI失败:", error);
      return { 
        success: false, 
        error: this.parseErrorMessage(error) 
      };
    }
  }

  // 设置事件监听
  setupEventListeners(userAddress, callbacks) {
    if (!this.contract) return;

    // 里程碑达成事件
    this.contract.on("MilestoneAchieved", (user, milestone, tokenId) => {
      if (user.toLowerCase() === userAddress.toLowerCase()) {
        const milestoneType = MILESTONE_TYPES[milestone];
        callbacks.onMilestoneAchieved && 
          callbacks.onMilestoneAchieved(milestoneType, tokenId.toNumber());
      }
    });

    // 打卡事件
    this.contract.on("CheckedIn", (user, timestamp, consecutiveCount) => {
      if (user.toLowerCase() === userAddress.toLowerCase()) {
        callbacks.onCheckedIn && 
          callbacks.onCheckedIn(timestamp.toNumber(), consecutiveCount.toNumber());
      }
    });

    // 首次登录事件
    this.contract.on("FirstLogin", (user, timestamp) => {
      if (user.toLowerCase() === userAddress.toLowerCase()) {
        callbacks.onFirstLogin && 
          callbacks.onFirstLogin(timestamp.toNumber());
      }
    });
  }

  // 移除事件监听
  removeEventListeners() {
    if (!this.contract) return;
    this.contract.removeAllListeners();
  }

  // 解析错误信息
  parseErrorMessage(error) {
    let message = "未知错误";
    
    if (error.message) {
      if (error.message.includes("User has already logged in")) {
        message = "您已经登录过了";
      } else if (error.message.includes("Already checked in today")) {
        message = "您今天已经打过卡了，明天再来吧！";
      } else if (error.message.includes("Please wait for minimum check-in interval")) {
        message = "请等待最小打卡间隔时间";
      } else if (error.message.includes("User must login first")) {
        message = "请先进行登录";
      } else if (error.message.includes("Contract is paused")) {
        message = "系统维护中，请稍后再试";
      } else if (error.message.includes("Check-in operation in progress")) {
        message = "打卡操作正在处理中";
      } else {
        message = error.message.slice(0, 100);
      }
    }
    
    return message;
  }

  // 获取下一次可打卡时间
  async getNextAvailableCheckInTime(address) {
    try {
      const { success, data } = await this.getUserData(address);
      if (!success || !data) return null;
      
      // 假设最小打卡间隔为20小时
      const minIntervalMs = 20 * 60 * 60 * 1000;
      const nextAvailable = data.lastCheckInTime * 1000 + minIntervalMs;
      return nextAvailable;
    } catch (error) {
      console.error("获取下次打卡时间失败:", error);
      return null;
    }
  }
}

export default SportCheckInContract;
