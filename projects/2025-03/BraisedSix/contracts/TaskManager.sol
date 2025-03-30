// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/* Errors */
error task__bountyUSDCBalanceLow();
error task__executorError();
error task__ownerError();
error task__timeout();

contract TaskManager is Ownable {
    /* State variables */
    // 支付用usdc
    IERC20 USDC;
    // 当前任务编号
    uint256 public currentIndex;
    // 所有任务
    mapping(uint256 => Task) public tasks;

    constructor(address _USDC) Ownable(msg.sender) {
        USDC = IERC20(_USDC);
        currentIndex = 0;
    }

    /* Structs */
    struct Task {
        // 任务编号
        uint256 index;
        // 任务标题
        string title;
        // 任务描述
        string desc;
        // 任务目标
        string target;
        // 任务限定时间(天)
        uint256 limitTime;
        // 任务开始时间
        uint256 startTime;
        // 任务赏金
        uint256 bounty;
        // 任务状态
        Status status;
        // 任务发布者
        address owner;
        // 任务执行人
        address executor;
        // 是否完成
        bool finish;
    }

    /* Enums */
    enum Status {
        Open,
        Pending,
        Finish,
        Close
    }

    /* Events */
    event PublishTask(address indexed owner, uint256 indexed index, Task task);
    event FinishTask(
        address indexed owner,
        address indexed executor,
        uint256 indexed index
    );

    /**Modifiers */

    modifier taskOnlyOwner(uint256 index) {
        if (tasks[index].owner != msg.sender) {
            revert task__ownerError();
        }
        _;
    }

    modifier taskTimeout(uint256 index) {
        if (tasks[index].startTime + tasks[index].limitTime < block.timestamp) {
            revert task__timeout();
        }
        _;
    }

    /* Functions */
    // 发布任务
    function publishTask(
        string memory desc,
        string memory title,
        string memory target,
        uint256 limitTime,
        uint256 bounty
    ) public {
        if (
            USDC.balanceOf(msg.sender) < bounty ||
            USDC.allowance(msg.sender, address(this)) < bounty
        ) {
            revert task__bountyUSDCBalanceLow();
        }
        USDC.transferFrom(msg.sender, address(this), bounty);
        Task memory task = Task(
            currentIndex,
            title,
            desc,
            target,
            limitTime * 1 days,
            0,
            bounty,
            Status.Open,
            msg.sender,
            address(0x0),
            false
        );
        tasks[currentIndex] = task;
        emit PublishTask(msg.sender, currentIndex, task);
        currentIndex += 1;
    }

    // 接收任务
    function overTake(uint256 index) public {
        tasks[index].executor = msg.sender;
        tasks[index].startTime = block.timestamp;
        tasks[index].status = Status.Pending;
    }

    // 完成任务
    function finishTask(uint256 index) public taskTimeout(index) {
        if (tasks[index].executor != msg.sender) {
            revert task__executorError();
        }
        tasks[index].status = Status.Finish;
    }

    // 任务验收
    function acceptanceTask(
        uint256 index,
        bool finish
    ) public taskOnlyOwner(index) {
        if (finish) {
            USDC.transfer(tasks[index].executor, tasks[index].bounty);
            tasks[index].finish = finish;
            tasks[index].status = Status.Close;
            emit FinishTask(
                msg.sender,
                tasks[index].executor,
                tasks[index].index
            );
        }
    }

    /**
     * Getter Functions
     */

    /**
     * Setter Functions
     */
    function closeTask(uint256 index) public taskOnlyOwner(index) {
        tasks[index].status = Status.Close;
    }
}
