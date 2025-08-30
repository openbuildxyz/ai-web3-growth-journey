// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/**
 * @title ForgeFaucet
 * @dev Faucet contract that dispenses FORGE tokens
 * Features:
 * - 100 FORGE per address per hour
 * - Rate limiting per address
 * - Emergency pause functionality
 * - Owner can update rates and withdraw
 */
contract ForgeFaucet is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    IERC20 public immutable forgeToken;

    uint256 public constant FAUCET_AMOUNT = 100 * 10 ** 18; // 100 FORGE tokens
    uint256 public constant COOLDOWN_PERIOD = 1 hours;

    mapping(address => uint256) public lastClaimTime;
    mapping(address => uint256) public totalClaimed;

    uint256 public totalDispensed;
    bool public paused;

    event TokensClaimed(address indexed claimer, uint256 amount);
    event FaucetPaused();
    event FaucetUnpaused();
    event EmergencyWithdraw(address indexed token, uint256 amount);

    modifier whenNotPaused() {
        require(!paused, "ForgeFaucet: faucet is paused");
        _;
    }

    /**
     * @dev Constructor
     * @param _forgeToken Address of the FORGE token contract
     */
    constructor(address _forgeToken) {
        require(_forgeToken != address(0), "ForgeFaucet: token address cannot be zero");
        forgeToken = IERC20(_forgeToken);
    }

    /**
     * @dev Claim tokens from the faucet
     * Can only be called once per hour per address
     */
    function claimTokens() external nonReentrant whenNotPaused {
        address claimer = msg.sender;

        require(claimer != address(0), "ForgeFaucet: claimer cannot be zero address");
        require(!isContract(claimer), "ForgeFaucet: contracts cannot claim tokens");
        require(canClaim(claimer), "ForgeFaucet: cooldown period not elapsed");

        // Check if faucet has enough tokens
        uint256 faucetBalance = forgeToken.balanceOf(address(this));
        require(faucetBalance >= FAUCET_AMOUNT, "ForgeFaucet: insufficient faucet balance");

        // Update claim time and totals
        lastClaimTime[claimer] = block.timestamp;
        totalClaimed[claimer] += FAUCET_AMOUNT;
        totalDispensed += FAUCET_AMOUNT;

        // Transfer tokens
        forgeToken.safeTransfer(claimer, FAUCET_AMOUNT);

        emit TokensClaimed(claimer, FAUCET_AMOUNT);
    }

    /**
     * @dev Check if an address can claim tokens
     * @param user Address to check
     * @return True if the user can claim tokens
     */
    function canClaim(address user) public view returns (bool) {
        return block.timestamp >= lastClaimTime[user] + COOLDOWN_PERIOD;
    }

    /**
     * @dev Get time remaining until next claim
     * @param user Address to check
     * @return Time in seconds until next claim (0 if can claim now)
     */
    function timeUntilNextClaim(address user) external view returns (uint256) {
        if (canClaim(user)) {
            return 0;
        }
        return (lastClaimTime[user] + COOLDOWN_PERIOD) - block.timestamp;
    }

    /**
     * @dev Check if address is a contract
     * @param addr Address to check
     * @return True if address is a contract
     */
    function isContract(address addr) internal view returns (bool) {
        uint256 size;
        assembly {
            size := extcodesize(addr)
        }
        return size > 0;
    }

    /**
     * @dev Pause the faucet (owner only)
     */
    function pause() external onlyOwner {
        paused = true;
        emit FaucetPaused();
    }

    /**
     * @dev Unpause the faucet (owner only)
     */
    function unpause() external onlyOwner {
        paused = false;
        emit FaucetUnpaused();
    }

    /**
     * @dev Emergency withdraw function for owner
     * @param token Address of token to withdraw (use FORGE token address for FORGE)
     * @param amount Amount to withdraw
     */
    function emergencyWithdraw(address token, uint256 amount) external onlyOwner {
        require(token != address(0), "ForgeFaucet: token address cannot be zero");
        require(amount > 0, "ForgeFaucet: amount must be positive");

        IERC20(token).safeTransfer(owner(), amount);
        emit EmergencyWithdraw(token, amount);
    }

    /**
     * @dev Get faucet statistics
     * @return faucetBalance Current token balance of the faucet
     * @return totalDispensedAmount Total amount dispensed so far
     * @return isPaused Whether the faucet is paused
     */
    function getFaucetStats()
        external
        view
        returns (uint256 faucetBalance, uint256 totalDispensedAmount, bool isPaused)
    {
        faucetBalance = forgeToken.balanceOf(address(this));
        totalDispensedAmount = totalDispensed;
        isPaused = paused;
    }

    /**
     * @dev Get user claim statistics
     * @param user Address to check
     * @return userTotalClaimed Total amount claimed by user
     * @return userLastClaimTime Last claim timestamp
     * @return userCanClaimNow Whether user can claim now
     */
    function getUserStats(
        address user
    ) external view returns (uint256 userTotalClaimed, uint256 userLastClaimTime, bool userCanClaimNow) {
        userTotalClaimed = totalClaimed[user];
        userLastClaimTime = lastClaimTime[user];
        userCanClaimNow = canClaim(user);
    }
}
