// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {Timer} from "./timer.sol";

contract InsuranceManager {
    address public owner;
    IERC20 public usdc;
    Timer public timer;
    
    // Insurance ID generation: keccak256(abi.encodePacked(country, disasterType, month, year))
    struct InsuranceInfo {
        string country;
        string disasterType;
        uint month;
        uint year;
        bool exists;
        bool disasterHappened;
        uint totalPool;        // Total USDC in this insurance pool
        uint totalShares;      // Total shares sold for this insurance
        uint claimRatio;       // Claim ratio (0-100), percentage of pool that can be claimed
        bool poolProcessed;    // Whether the pool has been processed for inheritance
        uint inheritedAmount;  // Amount inherited from previous month
    }
    
    // Insurance ID => Insurance Info
    mapping(bytes32 => InsuranceInfo) public insuranceInfos;
    
    // User => Insurance ID => User's shares
    mapping(address => mapping(bytes32 => uint)) public userShares;
    
    // User => Insurance ID => Whether user has claimed
    mapping(address => mapping(bytes32 => bool)) public userClaimed;
    
    // Exchange rate: 1 USDC = how many shares (with 18 decimals)
    uint public exchangeRate = 1e18; // 1 USDC = 1 share
    
    // Company profit ratio (0-100), percentage kept by company
    uint public companyProfitRatio = 20; // 20%
    
    // Mysterious address for charity/community funds
    address public mysteriousAddress; // Default to address(0)
    
    // Distribution ratios for unclaimed pools
    uint public mysteriousRatio = 20;     // 20% to mysterious address
    uint public inheritanceRatio = 80;    // 80% to next month's insurance
    
    // Inheritance chain mapping: current insurance ID => next month insurance ID
    mapping(bytes32 => bytes32) public inheritanceChain;
    
    // Events
    event InsuranceCreated(bytes32 indexed insuranceId, string country, string disasterType, uint month, uint year);
    event InsurancePurchased(address indexed user, bytes32 indexed insuranceId, uint usdcAmount, uint shares);
    event Donated(address indexed donor, bytes32 indexed insuranceId, uint amount);
    event DisasterDeclared(bytes32 indexed insuranceId, uint claimRatio);
    event Claimed(address indexed user, bytes32 indexed insuranceId, uint claimAmount);
    event MysteriousTransfer(bytes32 indexed insuranceId, address indexed mysteriousAddress, uint amount);
    event FundsInherited(bytes32 indexed fromInsuranceId, bytes32 indexed toInsuranceId, uint amount);
    event PoolProcessed(bytes32 indexed insuranceId, uint totalAmount, uint mysteriousAmount, uint inheritedAmount);
    
    constructor(address _usdc) {
        owner = msg.sender;
        usdc = IERC20(_usdc);
        timer = new Timer();
        // Transfer timer ownership to this contract for testing control
        timer.transferOwnership(address(this));
    }
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }
    
    // Generate insurance ID
    function getInsuranceId(string memory country, string memory disasterType, uint month, uint year) 
        public pure returns (bytes32) {
        return keccak256(abi.encodePacked(country, disasterType, month, year));
    }
    
    // Create a new insurance type
    function createInsurance(string memory country, string memory disasterType, uint month, uint year) 
        external onlyOwner {
        require(month >= 1 && month <= 12, "Invalid month");
        require(year >= 1970, "Year must be 1970 or later");
        
        bytes32 insuranceId = getInsuranceId(country, disasterType, month, year);
        require(!insuranceInfos[insuranceId].exists, "Insurance already exists");
        
        // Cannot create insurance for past months
        uint currentYear = timer.getYear();
        uint currentMonth = timer.getMonth();
        require(year > currentYear || (year == currentYear && month > currentMonth), 
                "Cannot create insurance for past months");
        
        insuranceInfos[insuranceId] = InsuranceInfo({
            country: country,
            disasterType: disasterType,
            month: month,
            year: year,
            exists: true,
            disasterHappened: false,
            totalPool: 0,
            totalShares: 0,
            claimRatio: 0,
            poolProcessed: false,
            inheritedAmount: 0
        });
        
        emit InsuranceCreated(insuranceId, country, disasterType, month, year);
    }
    
    // Purchase insurance
    function buyInsurance(bytes32 insuranceId, uint usdcAmount) external {
        require(insuranceInfos[insuranceId].exists, "Insurance does not exist");
        require(usdcAmount > 0, "Amount must be greater than 0");
        require(usdc.balanceOf(msg.sender) >= usdcAmount, "Insufficient USDC balance");
        
        InsuranceInfo storage info = insuranceInfos[insuranceId];
        
        // Cannot buy insurance for current or past months
        uint currentYear = timer.getYear();
        uint currentMonth = timer.getMonth();
        require(info.year > currentYear || (info.year == currentYear && info.month > currentMonth), 
                "Cannot buy insurance for current or past months");
        
        // Transfer USDC from user to this contract
        usdc.transferFrom(msg.sender, address(this), usdcAmount);
        
        // Calculate shares
        uint shares = usdcAmount * exchangeRate / 1e18;
        
        // Update records
        info.totalPool += usdcAmount;
        info.totalShares += shares;
        userShares[msg.sender][insuranceId] += shares;
        
        emit InsurancePurchased(msg.sender, insuranceId, usdcAmount, shares);
    }
    
    // Donate to insurance pool (no shares received)
    function donate(bytes32 insuranceId, uint amount) external {
        require(insuranceInfos[insuranceId].exists, "Insurance does not exist");
        require(amount > 0, "Amount must be greater than 0");
        require(usdc.balanceOf(msg.sender) >= amount, "Insufficient USDC balance");
        
        usdc.transferFrom(msg.sender, address(this), amount);
        insuranceInfos[insuranceId].totalPool += amount;
        
        emit Donated(msg.sender, insuranceId, amount);
    }
    
    // Declare disaster and set claim ratio
    function declareDisaster(bytes32 insuranceId, uint claimRatio) external onlyOwner {
        require(insuranceInfos[insuranceId].exists, "Insurance does not exist");
        require(claimRatio <= 100, "Claim ratio cannot exceed 100%");
        require(!insuranceInfos[insuranceId].disasterHappened, "Disaster already declared");
        
        InsuranceInfo storage info = insuranceInfos[insuranceId];
        
        // Can only declare disaster for current or past months
        uint currentYear = timer.getYear();
        uint currentMonth = timer.getMonth();
        require(info.year < currentYear || (info.year == currentYear && info.month <= currentMonth), 
                "Can only declare disaster for current or past months");
        
        info.disasterHappened = true;
        info.claimRatio = claimRatio;
        
        emit DisasterDeclared(insuranceId, claimRatio);
    }
    
    // Claim insurance
    function claim(bytes32 insuranceId) external {
        require(insuranceInfos[insuranceId].exists, "Insurance does not exist");
        require(userShares[msg.sender][insuranceId] > 0, "No shares to claim");
        require(!userClaimed[msg.sender][insuranceId], "Already claimed");
        
        InsuranceInfo storage info = insuranceInfos[insuranceId];
        
        // Can only claim after the insurance month has passed
        uint currentYear = timer.getYear();
        uint currentMonth = timer.getMonth();
        require(info.year < currentYear || (info.year == currentYear && info.month <= currentMonth), 
                "Insurance month has not passed yet");
        
        // NEW: Can only claim if disaster status has been determined
        // This prevents claiming from insurance without disaster declaration
        require(info.disasterHappened || info.poolProcessed, 
                "Disaster status has not been determined yet");
        
        uint claimAmount = 0;
        
        if (info.disasterHappened && info.claimRatio > 0) {
            // Calculate claim amount
            uint userSharesAmount = userShares[msg.sender][insuranceId];
            uint claimablePool = info.totalPool * info.claimRatio / 100;
            claimAmount = claimablePool * userSharesAmount / info.totalShares;
        }
        // If no disaster happened, no payout (claimAmount remains 0)
        
        // Mark as claimed
        userClaimed[msg.sender][insuranceId] = true;
        
        // Transfer claim amount if any
        if (claimAmount > 0) {
            usdc.transfer(msg.sender, claimAmount);
        }
        
        emit Claimed(msg.sender, insuranceId, claimAmount);
    }
    
    // Owner functions
    function setExchangeRate(uint _exchangeRate) external onlyOwner {
        exchangeRate = _exchangeRate;
    }
    
    function setCompanyProfitRatio(uint _ratio) external onlyOwner {
        require(_ratio <= 100, "Ratio cannot exceed 100%");
        companyProfitRatio = _ratio;
    }
    
    // Timer testing functions
    function setTestTime(uint256 _year, uint256 _month) external onlyOwner {
        timer.setTestTime(_year, _month);
    }
    
    function disableTestMode() external onlyOwner {
        timer.disableTestMode();
    }
    
    function withdrawCompanyProfits() external onlyOwner {
        // Calculate total company profits from all expired insurances
        // This is a simplified version - in practice you'd track this more carefully
        uint balance = usdc.balanceOf(address(this));
        uint withdrawAmount = balance * companyProfitRatio / 100;
        
        usdc.transfer(owner, withdrawAmount);
    }
    
    // View functions
    function getUserShares(address user, bytes32 insuranceId) external view returns (uint) {
        return userShares[user][insuranceId];
    }
    
    function getInsurancePool(bytes32 insuranceId) external view returns (uint) {
        return insuranceInfos[insuranceId].totalPool;
    }
    
    function getTotalShares(bytes32 insuranceId) external view returns (uint) {
        return insuranceInfos[insuranceId].totalShares;
    }
    
    function hasUserClaimed(address user, bytes32 insuranceId) external view returns (bool) {
        return userClaimed[user][insuranceId];
    }
    
    function getContractUSDCBalance() external view returns (uint) {
        return usdc.balanceOf(address(this));
    }
    
    // Get potential claim amount for a user (before claiming)
    function getPotentialClaim(address user, bytes32 insuranceId) external view returns (uint) {
        if (userShares[user][insuranceId] == 0 || userClaimed[user][insuranceId]) {
            return 0;
        }
        
        InsuranceInfo storage info = insuranceInfos[insuranceId];
        
        // Check if insurance month has passed
        uint currentYear = timer.getYear();
        uint currentMonth = timer.getMonth();
        if (info.year > currentYear || (info.year == currentYear && info.month > currentMonth)) {
            return 0; // Insurance month hasn't passed yet
        }
        
        if (!info.disasterHappened || info.claimRatio == 0) {
            return 0; // No disaster or no payout
        }
        
        uint userSharesAmount = userShares[user][insuranceId];
        uint claimablePool = info.totalPool * info.claimRatio / 100;
        return claimablePool * userSharesAmount / info.totalShares;
    }
    
    // ========== NEW INHERITANCE SYSTEM ==========
    
    // Set mysterious address for charity/community funds
    function setMysteriousAddress(address _mysteriousAddress) external onlyOwner {
        mysteriousAddress = _mysteriousAddress;
    }
    
    // Set distribution ratios (must add up to 100 or less)
    function setDistributionRatios(uint _mysteriousRatio, uint _inheritanceRatio) external onlyOwner {
        require(_mysteriousRatio + _inheritanceRatio <= 100, "Ratios cannot exceed 100%");
        mysteriousRatio = _mysteriousRatio;
        inheritanceRatio = _inheritanceRatio;
    }
    
    // Process unclaimed pool at month end (redistribute funds)
    function processUnclaimedPool(bytes32 insuranceId) external onlyOwner {
        InsuranceInfo storage info = insuranceInfos[insuranceId];
        require(info.exists, "Insurance does not exist");
        require(!info.poolProcessed, "Pool already processed");
        
        // Ensure insurance month has ended
        uint currentYear = timer.getYear();
        uint currentMonth = timer.getMonth();
        require(info.year < currentYear || 
               (info.year == currentYear && info.month < currentMonth), 
               "Insurance month has not ended yet");
        
        uint totalAmount = info.totalPool;
        uint mysteriousAmount = 0;
        uint inheritedAmount = 0;
        
        // Only process if no disaster happened or no claims were made
        if (!info.disasterHappened || info.claimRatio == 0) {
            // Calculate mysterious address amount
            if (mysteriousAddress != address(0) && totalAmount > 0) {
                mysteriousAmount = totalAmount * mysteriousRatio / 100;
                usdc.transfer(mysteriousAddress, mysteriousAmount);
                emit MysteriousTransfer(insuranceId, mysteriousAddress, mysteriousAmount);
            }
            
            // Calculate inheritance amount
            inheritedAmount = totalAmount * inheritanceRatio / 100;
            
            // Find or create next month's insurance
            bytes32 nextInsuranceId = findOrCreateNextInsurance(
                info.country, 
                info.disasterType, 
                info.month, 
                info.year
            );
            
            if (nextInsuranceId != bytes32(0) && inheritedAmount > 0) {
                inheritanceChain[insuranceId] = nextInsuranceId;
                inheritFunds(nextInsuranceId, inheritedAmount);
                emit FundsInherited(insuranceId, nextInsuranceId, inheritedAmount);
            }
        }
        
        info.poolProcessed = true;
        emit PoolProcessed(insuranceId, totalAmount, mysteriousAmount, inheritedAmount);
    }
    
    // Internal function to inherit funds to next insurance
    function inheritFunds(bytes32 inheritInsuranceId, uint amount) internal {
        InsuranceInfo storage inheritInfo = insuranceInfos[inheritInsuranceId];
        inheritInfo.inheritedAmount += amount;
        inheritInfo.totalPool += amount;
    }
    
    // Find or create next month's insurance
    function findOrCreateNextInsurance(
        string memory country, 
        string memory disasterType, 
        uint currentMonth, 
        uint currentYear
    ) internal returns (bytes32) {
        uint nextMonth = currentMonth + 1;
        uint nextYear = currentYear;
        
        if (nextMonth > 12) {
            nextMonth = 1;
            nextYear += 1;
        }
        
        bytes32 nextId = getInsuranceId(country, disasterType, nextMonth, nextYear);
        
        // If next month's insurance doesn't exist, create it automatically
        if (!insuranceInfos[nextId].exists) {
            insuranceInfos[nextId] = InsuranceInfo({
                country: country,
                disasterType: disasterType,
                month: nextMonth,
                year: nextYear,
                exists: true,
                disasterHappened: false,
                totalPool: 0,
                totalShares: 0,
                claimRatio: 0,
                poolProcessed: false,
                inheritedAmount: 0
            });
            
            emit InsuranceCreated(nextId, country, disasterType, nextMonth, nextYear);
        }
        
        return nextId;
    }
    
    // Get insurance financial information including inheritance
    function getInsuranceFinancialInfo(bytes32 insuranceId) 
        external view returns (
            uint totalPool,
            uint userContributions, 
            uint inheritedAmount,
            uint availableForClaim,
            bool isProcessed
        ) {
        InsuranceInfo storage info = insuranceInfos[insuranceId];
        require(info.exists, "Insurance does not exist");
        
        return (
            info.totalPool,
            info.totalPool - info.inheritedAmount,
            info.inheritedAmount,
            info.disasterHappened ? info.totalPool * info.claimRatio / 100 : 0,
            info.poolProcessed
        );
    }
    
    // Get inheritance chain starting from a specific insurance
    function getInheritanceChain(bytes32 startInsuranceId, uint maxLength) 
        external view returns (bytes32[] memory chain) {
        chain = new bytes32[](maxLength);
        bytes32 currentId = startInsuranceId;
        uint length = 0;
        
        while (currentId != bytes32(0) && length < maxLength) {
            chain[length] = currentId;
            currentId = inheritanceChain[currentId];
            length++;
        }
        
        // Resize array to actual length
        bytes32[] memory result = new bytes32[](length);
        for (uint i = 0; i < length; i++) {
            result[i] = chain[i];
        }
        
        return result;
    }
} 