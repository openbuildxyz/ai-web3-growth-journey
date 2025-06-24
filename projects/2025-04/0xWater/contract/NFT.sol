// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "./Battle.sol";
import "./interfaces/IERC20.sol";

contract NFT is ERC721, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;
    
    // USDT合约地址
    IERC20 public usdtToken;
    
    // NFT铸造价格（USDT）
    uint256 public constant MINT_PRICE_USDT = 5 * 10**6; // 5 USDT (6位小数)
    
    // NFT等级基础价值（USDT）
    mapping(Battle.NFTLevel => uint256) public levelValues;
    
    // NFT元数据
    struct NFTData {
        Battle.NFTLevel level;
        Battle.Element element;
        uint256 power;
        bool isFused;
    }
    
    // tokenId => NFTData
    mapping(uint256 => NFTData) public nftData;
    
    // 事件
    event NFTMinted(address indexed to, uint256 tokenId, Battle.NFTLevel level, Battle.Element element);
    event NFTFused(address indexed owner, uint256 tokenId1, uint256 tokenId2, uint256 newTokenId);
    event LevelValueUpdated(Battle.NFTLevel level, uint256 newValue);
    event USDTTokenUpdated(address indexed newToken);
    
    constructor(address _usdtToken) ERC721("NFT Battle", "NFTB") {
        usdtToken = IERC20(_usdtToken);
        
        // 设置NFT等级基础价值（USDT）
        levelValues[Battle.NFTLevel.T1] = 20 * 10**6;  // 20 USDT
        levelValues[Battle.NFTLevel.T2] = 10 * 10**6;  // 10 USDT
        levelValues[Battle.NFTLevel.T3] = 5 * 10**6;   // 5 USDT
    }
    
    // 更新USDT合约地址（仅管理员）
    function updateUSDTToken(address _usdtToken) external onlyOwner {
        usdtToken = IERC20(_usdtToken);
        emit USDTTokenUpdated(_usdtToken);
    }
    
    // 更新NFT等级价值（仅管理员）
    function updateLevelValue(Battle.NFTLevel level, uint256 newValue) external onlyOwner {
        require(level != Battle.NFTLevel.T3 || newValue == 5 * 10**6, "T3 value must be 5 USDT");
        levelValues[level] = newValue;
        emit LevelValueUpdated(level, newValue);
    }
    
    // 获取NFT价值
    function getNFTValue(uint256 tokenId) external view returns (uint256) {
        NFTData memory data = nftData[tokenId];
        return levelValues[data.level];
    }
    
    // 铸造NFT（使用USDT）
    function mint() external returns (uint256) {
        // 检查USDT余额和授权
        require(usdtToken.balanceOf(msg.sender) >= MINT_PRICE_USDT, "Insufficient USDT balance");
        require(usdtToken.allowance(msg.sender, address(this)) >= MINT_PRICE_USDT, "Insufficient USDT allowance");
        
        // 转移USDT
        require(usdtToken.transferFrom(msg.sender, address(this), MINT_PRICE_USDT), "USDT transfer failed");
        
        _tokenIds.increment();
        uint256 newTokenId = _tokenIds.current();
        
        // 随机生成属性
        Battle.Element element = Battle.Element(uint8(block.timestamp % 5));
        Battle.NFTLevel level = Battle.NFTLevel.T3; // 初始都是T3
        
        NFTData memory data = NFTData({
            level: level,
            element: element,
            power: 10, // T3基础战力
            isFused: false
        });
        
        nftData[newTokenId] = data;
        _mint(msg.sender, newTokenId);
        
        emit NFTMinted(msg.sender, newTokenId, level, element);
        
        return newTokenId;
    }
    
    // 合成NFT（使用USDT）
    function fuse(uint256 tokenId1, uint256 tokenId2) external {
        require(msg.sender == address(this) || msg.sender == owner(), "Only contract or owner can call");
        
        // 检查USDT余额和授权
        require(usdtToken.balanceOf(msg.sender) >= Battle.FUSION_FEE_USDT, "Insufficient USDT balance");
        require(usdtToken.allowance(msg.sender, address(this)) >= Battle.FUSION_FEE_USDT, "Insufficient USDT allowance");
        
        require(ownerOf(tokenId1) == tx.origin && ownerOf(tokenId2) == tx.origin, "Not owner of both tokens");
        require(!nftData[tokenId1].isFused && !nftData[tokenId2].isFused, "Token already fused");
        
        // 转移USDT
        require(usdtToken.transferFrom(msg.sender, address(this), Battle.FUSION_FEE_USDT), "USDT transfer failed");
        
        NFTData memory data1 = nftData[tokenId1];
        NFTData memory data2 = nftData[tokenId2];
        
        require(data1.level == data2.level, "Different levels");
        
        // 计算新NFT的等级
        Battle.NFTLevel newLevel;
        if (data1.level == Battle.NFTLevel.T3) {
            newLevel = Battle.NFTLevel.T2;
        } else if (data1.level == Battle.NFTLevel.T2) {
            newLevel = Battle.NFTLevel.T1;
        } else {
            revert("Cannot fuse T1 NFTs");
        }
        
        // 计算新NFT的属性
        Battle.Element newElement;
        if (data1.element == data2.element) {
            newElement = data1.element;
        } else {
            // 50%概率继承第一个NFT的属性
            newElement = uint256(keccak256(abi.encodePacked(block.timestamp))) % 2 == 0 ? 
                data1.element : data2.element;
        }
        
        // 计算新NFT的战力
        uint256 newPower = data1.power + data2.power;
        
        // 创建新NFT
        _tokenIds.increment();
        uint256 newTokenId = _tokenIds.current();
        
        NFTData memory newData = NFTData({
            level: newLevel,
            element: newElement,
            power: newPower,
            isFused: false
        });
        
        nftData[newTokenId] = newData;
        _mint(tx.origin, newTokenId);
        
        // 标记原NFT为已合成
        nftData[tokenId1].isFused = true;
        nftData[tokenId2].isFused = true;
        
        emit NFTFused(tx.origin, tokenId1, tokenId2, newTokenId);
    }
    
    // 获取NFT数据
    function getNFTData(uint256 tokenId) external view returns (
        Battle.NFTLevel level,
        Battle.Element element,
        uint256 power,
        bool isFused
    ) {
        NFTData memory data = nftData[tokenId];
        return (data.level, data.element, data.power, data.isFused);
    }
    
    // 提取USDT余额
    function withdrawUSDT() external onlyOwner {
        uint256 balance = usdtToken.balanceOf(address(this));
        require(balance > 0, "No USDT to withdraw");
        require(usdtToken.transfer(owner(), balance), "USDT transfer failed");
    }
} 