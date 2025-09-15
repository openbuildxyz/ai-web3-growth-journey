// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract Timer {
    uint256 constant SECONDS_PER_YEAR = 31556952;
    uint256 constant SECONDS_PER_MONTH = 2629746;
    uint256 constant SECONDS_PER_DAY = 86400;
    uint256 constant START_YEAR = 1970;
    
    // For testing purposes - allows manual time override
    bool public isTestMode = false;
    uint256 public testYear = 1970;
    uint256 public testMonth = 1;
    address public owner;
    
    constructor() {
        owner = msg.sender;
    }
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }
    
    // Enable test mode and set custom time
    function setTestTime(uint256 _year, uint256 _month) external onlyOwner {
        require(_month >= 1 && _month <= 12, "Invalid month");
        require(_year >= 1970, "Invalid year");
        isTestMode = true;
        testYear = _year;
        testMonth = _month;
    }
    
    // Disable test mode (return to real time)
    function disableTestMode() external onlyOwner {
        isTestMode = false;
    }
    
    // Transfer ownership (useful for testing)
    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "New owner cannot be zero address");
        owner = newOwner;
    }

    function getYear() public view returns (uint256) {
        if (isTestMode) {
            return testYear;
        }
        return START_YEAR + block.timestamp / SECONDS_PER_YEAR;
    }

    function getMonth() public view returns (uint256) {
        if (isTestMode) {
            return testMonth;
        }
        uint256 secondsThisYear = block.timestamp % SECONDS_PER_YEAR;
        uint256 month = secondsThisYear / SECONDS_PER_MONTH + 1;
        if (month > 12) {
            month = 12;
        }
        return month;
    }

    function getDayInMonth() public view returns (uint256) {
        uint256 secondsThisYear = block.timestamp % SECONDS_PER_YEAR;
        uint256 secondsThisMonth = secondsThisYear % SECONDS_PER_MONTH;
        return (secondsThisMonth / SECONDS_PER_DAY) + 1;
    }

    function isLastDayOfMonth() public view returns (bool) {
        // 假设每月 30 天
        return getDayInMonth() >= 30;
    }
}
