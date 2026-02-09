// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./EscrowVault.sol";

/// @dev Minimal arbitration interface used by TaskManager.
interface IArbitration {
    function openCase(
        uint256 taskId,
        address buyer,
        address agent,
        uint256 amount
    ) external;
}

/// @notice Task lifecycle manager with ERC20 escrow and dispute arbitration hook.
/// @dev Funds are held in EscrowVault; this contract only instructs deposit/release/refund.
contract TaskManager is Ownable, ReentrancyGuard {
    enum Status {
        Created, // Task created by buyer; escrow deposited; no agent yet
        Accepted, // Agent accepted the task
        InProgress, // agent marked task as started
        PendingReview, // Agent submitted delivery; waiting for buyer approval
        Completed, // Buyer approved; funds released to agent
        Disputed, // Dispute opened; awaiting arbitration
        Arbitrated, // Arbitration executed and escrow split
        Cancelled // Buyer cancelled before acceptance; escrow refunded
    }

    struct Task {
        address buyer; // Buyer who funded the escrow
        address agent; // Agent who accepted the task (0 until accepted)
        uint256 amount; // Escrowed amount (in vault token units)
        Status status; // Current lifecycle status
        uint64 createdAt; // Creation timestamp
        uint64 acceptedAt; // Acceptance timestamp
        uint64 submittedAt; // Delivery submission timestamp
        uint64 disputedAt; // Dispute opening timestamp
        bytes32 metaHash; // Off-chain metadata hash (e.g., IPFS/Arweave)
        bytes32 deliveryHash; // Off-chain delivery hash
    }

    /// @notice Escrow vault that holds the ERC20 funds.
    EscrowVault public vault;

    /// @notice Arbitration contract allowed to call `onArbitrated`.
    address public arbitration;

    /// @notice Auto-incrementing task id counter (starts at 1).
    uint256 public nextTaskId;

    /// @dev Interface used to open arbitration cases.
    IArbitration public arb;

    /// @notice taskId => Task data.
    mapping(uint256 => Task) public tasks;

    event VaultSet(address indexed vault);
    event ArbitrationSet(address indexed arbitration);

    event TaskCreated(
        uint256 indexed taskId,
        address indexed buyer,
        uint256 amount,
        bytes32 metaHash
    );
    event TaskAccepted(uint256 indexed taskId, address indexed agent);
    event TaskSubmitted(uint256 indexed taskId, bytes32 deliveryHash);
    event TaskApproved(uint256 indexed taskId);
    event TaskCancelled(uint256 indexed taskId);
    event TaskDisputed(uint256 indexed taskId, address indexed by);
    event TaskArbitrated(
        uint256 indexed taskId,
        uint256 buyerAmount,
        uint256 agentAmount
    );

    /// @dev Restricts caller to the task buyer.
    modifier onlyBuyer(uint256 taskId) {
        require(
            tasks[taskId].buyer != address(0),
            "TaskManager: task not found"
        );
        require(msg.sender == tasks[taskId].buyer, "TaskManager: not buyer");
        _;
    }

    /// @dev Restricts caller to the task agent.
    modifier onlyAgent(uint256 taskId) {
        require(
            tasks[taskId].buyer != address(0),
            "TaskManager: task not found"
        );
        require(
            tasks[taskId].agent != address(0),
            "TaskManager: agent not set"
        );
        require(msg.sender == tasks[taskId].agent, "TaskManager: not agent");
        _;
    }

    /// @dev Restricts caller to the configured arbitration contract.
    modifier onlyArbitration() {
        require(msg.sender == arbitration, "TaskManager: not arbitration");
        _;
    }

    constructor(address vaultAddr) Ownable(msg.sender) {
        require(vaultAddr != address(0), "TaskManager: vault=0");
        vault = EscrowVault(vaultAddr);
        nextTaskId = 1;
    }

    /// @notice Owner can update the vault address.
    /// @dev Does not migrate balances; vault must be configured correctly.
    function setVault(address vaultAddr) external onlyOwner {
        require(vaultAddr != address(0), "TaskManager: vault=0");
        vault = EscrowVault(vaultAddr);
        emit VaultSet(vaultAddr);
    }

    /// @notice Owner can set the arbitration contract.
    /// @dev The arbitration contract is expected to call back `onArbitrated`.
    function setArbitration(address arbitrationAddr) external onlyOwner {
        require(arbitrationAddr != address(0), "TaskManager: arbitration=0");
        arbitration = arbitrationAddr;
        arb = IArbitration(arbitrationAddr);
        emit ArbitrationSet(arbitrationAddr);
    }

    /// @notice Create a task and deposit funds into the vault.
    /// @param amount Escrow amount to deposit.
    /// @param metaHash Off-chain metadata hash.
    /// @dev Buyer must approve the vault for at least `amount` before calling.
    function createTask(
        uint256 amount,
        bytes32 metaHash
    ) external nonReentrant returns (uint256 taskId) {
        require(amount > 0, "TaskManager: amount=0");

        taskId = nextTaskId;
        nextTaskId = nextTaskId + 1;

        tasks[taskId] = Task({
            buyer: msg.sender,
            agent: address(0),
            amount: amount,
            status: Status.Created,
            createdAt: uint64(block.timestamp),
            acceptedAt: 0,
            submittedAt: 0,
            disputedAt: 0,
            metaHash: metaHash,
            deliveryHash: bytes32(0)
        });

        vault.deposit(taskId, msg.sender, amount);

        emit TaskCreated(taskId, msg.sender, amount, metaHash);
    }

    /// @notice Accept a task as the agent.
    /// @dev Sets `agent` and moves status to Accepted.
    function acceptTask(uint256 taskId) external nonReentrant {
        Task storage t = tasks[taskId];
        require(t.buyer != address(0), "TaskManager: task not found");
        require(t.status == Status.Created, "TaskManager: not Created");
        require(t.agent == address(0), "TaskManager: already has agent");

        t.agent = msg.sender;
        t.status = Status.Accepted;
        t.acceptedAt = uint64(block.timestamp);

        emit TaskAccepted(taskId, msg.sender);
    }

    /// @notice move Accepted -> InProgress.
    /// @dev No funds move here; escrow remains locked in the vault.
    function startTask(uint256 taskId) external {
        Task storage t = tasks[taskId];
        require(t.buyer != address(0), "TaskManager: task not found");
        require(t.status == Status.Accepted, "TaskManager: not Accepted");
        require(msg.sender == t.agent, "TaskManager: not agent");

        t.status = Status.InProgress;
    }

    /// @notice Submit a delivery hash for review.
    /// @param deliveryHash Off-chain delivery hash.
    /// @dev Allowed from Accepted or InProgress.
    function submitDelivery(uint256 taskId, bytes32 deliveryHash) external {
        Task storage t = tasks[taskId];
        require(t.buyer != address(0), "TaskManager: task not found");
        require(msg.sender == t.agent, "TaskManager: not agent");
        require(deliveryHash != bytes32(0), "TaskManager: deliveryHash=0");
        require(
            t.status == Status.Accepted || t.status == Status.InProgress,
            "TaskManager: invalid status"
        );

        t.deliveryHash = deliveryHash;
        t.status = Status.PendingReview;
        t.submittedAt = uint64(block.timestamp);

        emit TaskSubmitted(taskId, deliveryHash);
    }

    /// @notice Buyer approves the delivery and releases funds to the agent.
    /// @dev Marks task Completed, then releases escrow from the vault.
    function approve(uint256 taskId) external nonReentrant onlyBuyer(taskId) {
        Task storage t = tasks[taskId];
        require(
            t.status == Status.PendingReview,
            "TaskManager: not PendingReview"
        );
        require(t.agent != address(0), "TaskManager: no agent");

        t.status = Status.Completed;
        vault.release(taskId, t.agent, t.amount);

        emit TaskApproved(taskId);
    }

    /// @notice Buyer can cancel only before acceptance.
    /// @dev Refunds the full escrow amount.
    function cancelTask(
        uint256 taskId
    ) external nonReentrant onlyBuyer(taskId) {
        Task storage t = tasks[taskId];
        require(
            t.status == Status.Created,
            "TaskManager: only Created can cancel"
        );
        require(t.agent == address(0), "TaskManager: already accepted");

        t.status = Status.Cancelled;
        vault.refund(taskId, t.buyer, t.amount);

        emit TaskCancelled(taskId);
    }

    /// @notice Either party can dispute during PendingReview.
    /// @dev Opens an arbitration case; escrow remains locked until `onArbitrated`.
    function dispute(uint256 taskId) external nonReentrant {
        Task storage t = tasks[taskId];
        require(t.buyer != address(0), "TaskManager: task not found");
        require(
            msg.sender == t.buyer || msg.sender == t.agent,
            "TaskManager: not party"
        );
        require(
            t.status == Status.PendingReview,
            "TaskManager: only PendingReview can dispute"
        );

        require(arbitration != address(0), "TaskManager: arbitration not set");

        t.status = Status.Disputed;
        t.disputedAt = uint64(block.timestamp);

        arb.openCase(taskId, t.buyer, t.agent, t.amount);

        emit TaskDisputed(taskId, msg.sender);
    }

    /// @notice Arbitration callback that executes a split.
    /// @param buyerAmount Amount to refund to buyer.
    /// @param agentAmount Amount to release to agent.
    /// @dev Must sum to the original task escrow amount.
    function onArbitrated(
        uint256 taskId,
        uint256 buyerAmount,
        uint256 agentAmount
    ) external nonReentrant onlyArbitration {
        Task storage t = tasks[taskId];
        require(t.buyer != address(0), "TaskManager: task not found");
        require(t.status == Status.Disputed, "TaskManager: not Disputed");
        require(
            buyerAmount + agentAmount == t.amount,
            "TaskManager: invalid split"
        );

        t.status = Status.Arbitrated;

        if (buyerAmount > 0) {
            vault.refund(taskId, t.buyer, buyerAmount);
        }
        if (agentAmount > 0) {
            vault.release(taskId, t.agent, agentAmount);
        }

        emit TaskArbitrated(taskId, buyerAmount, agentAmount);
    }

    /// @notice Convenience getter for full task struct.
    function getTask(uint256 taskId) external view returns (Task memory) {
        return tasks[taskId];
    }
}
