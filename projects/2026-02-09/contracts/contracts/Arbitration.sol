// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21; 

import "@openzeppelin/contracts/access/Ownable.sol"; 
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol"; 
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol"; 
import "@openzeppelin/contracts/token/ERC20/IERC20.sol"; 

/// @dev Minimal TaskManager interface used for arbitration callbacks.
interface ITaskManager {
    function onArbitrated(uint256 taskId, uint256 buyerAmount, uint256 agentAmount) external;
}

/// @notice Simple token-staked voting arbitration.
/// @dev TaskManager opens cases; stakers vote; anyone can finalize after deadline/quorum.
contract Arbitration is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    enum Decision {
        None,
        BuyerWins, // Full refund to buyer
        AgentWins  // Full payout to agent
    }

    struct Case {
        bool exists;       // Case existence flag
        bool finalized;    // Prevent double-finalization
        address buyer;     // Buyer address
        address agent;     // Agent address
        uint256 amount;    // Escrow amount for the task
        uint64 openedAt;   // Case creation timestamp
        uint64 deadline;   // Voting deadline timestamp
        uint32 quorum;     // Minimum votes required for non-timeout finalization
        uint32 buyerVotes; // Votes for BuyerWins
        uint32 agentVotes; // Votes for AgentWins
        Decision result;   // Final decision
    }

    /// @notice Token used for staking (voting eligibility).
    IERC20 public immutable platformToken;

    /// @notice TaskManager allowed to open cases and receive callbacks.
    ITaskManager public taskManager;

    /// @notice Minimum stake required to vote.
    uint256 public minStake;

    /// @notice Default voting duration (seconds) used when opening a case.
    uint64 public voteDuration;

    /// @notice Default quorum used when opening a case.
    uint32 public defaultQuorum;

    /// @notice voter => staked token balance.
    mapping(address => uint256) public staked;

    /// @notice taskId => arbitration case.
    mapping(uint256 => Case) public cases;

    /// @notice taskId => (voter => voted?).
    mapping(uint256 => mapping(address => bool)) public hasVoted;

    event TaskManagerSet(address indexed taskManager);
    event ParamsSet(uint256 minStake, uint64 voteDuration, uint32 defaultQuorum);
    event Staked(address indexed user, uint256 amount);
    event Unstaked(address indexed user, uint256 amount);
    event CaseOpened(
        uint256 indexed taskId,
        address indexed buyer,
        address indexed agent,
        uint256 amount,
        uint64 deadline,
        uint32 quorum
    );
    event Voted(uint256 indexed taskId, address indexed voter, Decision decision);
    event CaseFinalized(uint256 indexed taskId, Decision result, uint32 buyerVotes, uint32 agentVotes);

    modifier onlyTaskManager() {
        require(msg.sender == address(taskManager), "Arbitration: not taskManager");
        _;
    }

    constructor(IERC20 _platformToken, address _taskManager) Ownable(msg.sender) {
        require(address(_platformToken) != address(0), "Arbitration: token=0");
        require(_taskManager != address(0), "Arbitration: taskManager=0");
        platformToken = _platformToken;
        taskManager = ITaskManager(_taskManager);
        // Reasonable defaults; can be updated by owner.
        minStake = 100 * 1e18;
        voteDuration = 3 days;
        defaultQuorum = 3;
        emit TaskManagerSet(_taskManager);
        emit ParamsSet(minStake, voteDuration, defaultQuorum);
    }

    /// @notice Owner can update TaskManager.
    /// @dev This changes who can open cases and who receives callbacks.
    function setTaskManager(address _taskManager) external onlyOwner {
        require(_taskManager != address(0), "Arbitration: taskManager=0");
        taskManager = ITaskManager(_taskManager);
        emit TaskManagerSet(_taskManager);
    }

    /// @notice Owner can update arbitration parameters.
    /// @dev `minStake` is checked at vote time.
    function setParams(uint256 _minStake, uint64 _voteDuration, uint32 _defaultQuorum) external onlyOwner {
        require(_minStake > 0, "Arbitration: minStake=0");
        require(_voteDuration > 0, "Arbitration: voteDuration=0");
        require(_defaultQuorum > 0, "Arbitration: quorum=0");
        minStake = _minStake;
        voteDuration = _voteDuration;
        defaultQuorum = _defaultQuorum;
        emit ParamsSet(_minStake, _voteDuration, _defaultQuorum);
    }

    /// @notice Stake platform tokens to become eligible to vote.
    /// @dev Does not lock per-case; stake is global and reusable.
    function stake(uint256 amount) external nonReentrant {
        require(amount > 0, "Arbitration: amount=0");
        staked[msg.sender] = staked[msg.sender] + amount;
        platformToken.safeTransferFrom(msg.sender, address(this), amount);
        emit Staked(msg.sender, amount);
    }

    /// @notice Unstake previously staked tokens.
    /// @dev Users can unstake anytime; this contract does not penalize voters.
    function unstake(uint256 amount) external nonReentrant {
        require(amount > 0, "Arbitration: amount=0");
        require(staked[msg.sender] >= amount, "Arbitration: insufficient stake");
        staked[msg.sender] = staked[msg.sender] - amount;
        platformToken.safeTransfer(msg.sender, amount);
        emit Unstaked(msg.sender, amount);
    }

    /// @notice Open a case for a task.
    /// @dev Only callable by TaskManager.
    function openCase(uint256 taskId, address buyer, address agent, uint256 amount) external onlyTaskManager {
        require(taskId != 0, "Arbitration: taskId=0");
        require(buyer != address(0), "Arbitration: buyer=0");
        require(agent != address(0), "Arbitration: agent=0");
        require(amount > 0, "Arbitration: amount=0");
        require(!cases[taskId].exists, "Arbitration: case exists");

        uint64 deadline = uint64(block.timestamp) + voteDuration;

        cases[taskId] = Case({
            exists: true,
            finalized: false,
            buyer: buyer,
            agent: agent,
            amount: amount,
            openedAt: uint64(block.timestamp),
            deadline: deadline,
            quorum: defaultQuorum,
            buyerVotes: 0,
            agentVotes: 0,
            result: Decision.None
        });

        emit CaseOpened(taskId, buyer, agent, amount, deadline, defaultQuorum);
    }

    /// @notice Cast a vote on an open case.
    /// @dev One address can vote once per case if stake >= minStake.
    function vote(uint256 taskId, Decision decision) external {
        Case storage c = cases[taskId];
        require(c.exists, "Arbitration: case not found");
        require(!c.finalized, "Arbitration: already finalized");
        require(block.timestamp <= c.deadline, "Arbitration: voting ended");
        require(decision == Decision.BuyerWins || decision == Decision.AgentWins, "Arbitration: invalid decision");
        require(!hasVoted[taskId][msg.sender], "Arbitration: already voted");
        require(staked[msg.sender] >= minStake, "Arbitration: stake too low");

        hasVoted[taskId][msg.sender] = true;

        if (decision == Decision.BuyerWins) {
            c.buyerVotes = c.buyerVotes + 1;
        } else {
            c.agentVotes = c.agentVotes + 1;
        }

        emit Voted(taskId, msg.sender, decision);
    }

    /// @notice Finalize a case and trigger TaskManager payout.
    /// @dev If deadline reached but votes < quorum, defaults to BuyerWins.
    function finalize(uint256 taskId) external nonReentrant {
        Case storage c = cases[taskId];
        require(c.exists, "Arbitration: case not found");
        require(!c.finalized, "Arbitration: already finalized");

        bool timeReached = block.timestamp > c.deadline;
        uint256 totalVotes = uint256(c.buyerVotes) + uint256(c.agentVotes);

        require(timeReached || totalVotes >= c.quorum, "Arbitration: not ready");

        Decision result;
        if (totalVotes < c.quorum && timeReached) {
            result = Decision.BuyerWins;
        } else {
            // Tie-breaker favors the buyer.
            result = (c.buyerVotes >= c.agentVotes) ? Decision.BuyerWins : Decision.AgentWins;
        }

        c.finalized = true;
        c.result = result;

        uint256 buyerAmount;
        uint256 agentAmount;
        if (result == Decision.BuyerWins) {
            buyerAmount = c.amount;
            agentAmount = 0;
        } else {
            buyerAmount = 0;
            agentAmount = c.amount;
        }

        taskManager.onArbitrated(taskId, buyerAmount, agentAmount);
        emit CaseFinalized(taskId, result, c.buyerVotes, c.agentVotes);
    }

    /// @notice Convenience getter for full case struct.
    function getCase(uint256 taskId) external view returns (Case memory) {
        return cases[taskId];
    }
}