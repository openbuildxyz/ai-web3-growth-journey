// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol"; 
import "@openzeppelin/contracts/access/Ownable.sol";

/// @notice ERC20 escrow vault keyed by taskId.
/// @dev Only the configured TaskManager is allowed to move funds.
contract EscrowVault is Ownable {
    using SafeERC20 for IERC20;

    /// @notice ERC20 token held in escrow.
    IERC20 public immutable token;
    
    /// @notice taskId => escrowed token amount currently held.
    mapping(uint256 => uint256) public escrowOf;

    /// @notice Authorized TaskManager contract.
    address public taskManager;

    event TaskManagerSet(address indexed taskManager);
    event Deposited(uint256 indexed taskId, address indexed from, uint256 amount);
    event Released(uint256 indexed taskId, address indexed to, uint256 amount);
    event Refunded(uint256 indexed taskId, address indexed to, uint256 amount);

    modifier onlyTaskManager() {
        require(msg.sender == taskManager, "Vault: caller is not the task manager");
        _;
    }

    /// @param _token ERC20 token used for escrow.
    constructor(IERC20 _token) Ownable(msg.sender) {
        token = _token;
    }

    /// @notice Owner can update the TaskManager address.
    function setTaskManager(address _taskManager) external onlyOwner {
        require(_taskManager != address(0), "Vault: taskManager address cannot be zero");
        taskManager = _taskManager;
        emit TaskManagerSet(_taskManager);
    }

    /// @notice Deposit escrow for a task.
    /// @dev Increases `escrowOf[taskId]` then pulls tokens via `transferFrom`.
    function deposit(uint256 taskId, address from, uint256 amount) external onlyTaskManager {
        require(amount > 0, "Vault: amount must be greater than zero");
        escrowOf[taskId] += amount;
        token.safeTransferFrom(from, address(this), amount);
        emit Deposited(taskId, from, amount);
    }

    /// @notice Release escrow to recipient.
    /// @dev Decreases `escrowOf[taskId]` and transfers tokens out.
    function release(uint256 taskId, address to, uint256 amount) external onlyTaskManager {
        require(amount <= escrowOf[taskId], "Vault: insufficient funds");
        escrowOf[taskId] -= amount;
        token.safeTransfer(to, amount);
        emit Released(taskId, to, amount);
    }

    /// @notice Refund escrow to recipient.
    /// @dev Decreases `escrowOf[taskId]` and transfers tokens out.
    function refund(uint256 taskId, address to, uint256 amount) external onlyTaskManager {
        require(amount <= escrowOf[taskId], "Vault: insufficient funds");
        escrowOf[taskId] -= amount;
        token.safeTransfer(to, amount);
        emit Refunded(taskId, to, amount);
    }

    /// @notice Return current escrowed balance for a task.
    function getEscrowBalance(uint256 taskId) external view returns (uint256) {
        return escrowOf[taskId];
    }
}