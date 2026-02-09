// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./OrbToken.sol";

/**
 * @title OrbPool
 * @dev Simple AMM pool for token swapping with constant product formula (x * y = k)
 *
 * Features:
 * - Liquidity provision with LP tokens
 * - Token swapping with 0.3% fee
 * - Add/remove liquidity
 * - Flash loan protection
 */
contract OrbPool is ReentrancyGuard {
    using SafeERC20 for IERC20;
    using SafeERC20 for OrbToken;

    // Tokens in the pool
    IERC20 public immutable token0;
    IERC20 public immutable token1;

    // Pool reserves
    uint256 public reserve0;
    uint256 public reserve1;

    // LP token
    string public constant name = "Orbit Liquidity Provider";
    string public constant symbol = "ORBLP";
    uint8 public constant decimals = 18;
    uint256 public totalSupply;

    // User LP balances
    mapping(address => uint256) public balanceOf;

    // Allowances for LP tokens
    mapping(address => mapping(address => uint256)) public allowance;

    // Constant fee (0.3% = 3 basis points)
    uint256 public constant FEE_BASIS_POINTS = 3; // 0.3%
    uint256 public constant BASIS_POINTS = 1000;

    // Minimum liquidity when creating pool
    uint256 public constant MINIMUM_LIQUIDITY = 1000;

    // Events
    event Mint(address indexed sender, uint256 amount0, uint256 amount1);
    event Burn(address indexed sender, uint256 amount0, uint256 amount1, address indexed to);
    event Swap(
        address indexed sender,
        uint256 amount0In,
        uint256 amount1In,
        uint256 amount0Out,
        uint256 amount1Out,
        address indexed to
    );
    event Sync(uint256 reserve0, uint256 reserve1);

    // Errors
    error InsufficientLiquidity();
    error InsufficientOutputAmount();
    error InsufficientLiquidityMinted();
    error InsufficientLiquidityBurned();
    error InvalidToken();
    error IdenticalAddresses();
    error ZeroAddress();

    modifier validTokens(address tokenA, address tokenB) {
        if (tokenA == tokenB) revert IdenticalAddresses();
        if (tokenA == address(0) || tokenB == address(0)) revert ZeroAddress();
        if (tokenA != address(token0) && tokenA != address(token1)) revert InvalidToken();
        if (tokenB != address(token0) && tokenB != address(token1)) revert InvalidToken();
        _;
    }

    modifier validRecipient(address to) {
        if (to == address(0)) revert ZeroAddress();
        _;
    }

    constructor(address _token0, address _token1) {
        if (_token0 == _token1) revert IdenticalAddresses();
        if (_token0 == address(0) || _token1 == address(0)) revert ZeroAddress();

        token0 = IERC20(_token0);
        token1 = IERC20(_token1);
    }

    /**
     * @dev Get the reserves of the pool
     */
    function getReserves() external view returns (uint256 _reserve0, uint256 _reserve1) {
        return (reserve0, reserve1);
    }

    /**
     * @dev Calculate amount out using constant product formula
     * @param amountIn Input amount
     * @param reserveIn Input reserve
     * @param reserveOut Output reserve
     * @return amountOut Output amount
     */
    function getAmountOut(
        uint256 amountIn,
        uint256 reserveIn,
        uint256 reserveOut
    ) public pure returns (uint256 amountOut) {
        if (reserveIn == 0 || reserveOut == 0) revert InsufficientLiquidity();

        // Calculate input amount after fee
        uint256 amountInWithFee = amountIn * (BASIS_POINTS - FEE_BASIS_POINTS);

        // Calculate output using constant product formula
        // amountOut = (amountInWithFee * reserveOut) / (reserveIn + amountInWithFee)
        uint256 numerator = amountInWithFee * reserveOut;
        uint256 denominator = (reserveIn * BASIS_POINTS) + amountInWithFee;

        amountOut = numerator / denominator;
    }

    /**
     * @dev Quote a swap without executing it
     */
    function quote(
        uint256 amountA,
        address tokenA,
        address tokenB
    ) external view validTokens(tokenA, tokenB) returns (uint256 amountB) {
        if (tokenA == address(token0)) {
            return getAmountOut(amountA, reserve0, reserve1);
        } else {
            return getAmountOut(amountA, reserve1, reserve0);
        }
    }

    /**
     * @dev Add liquidity to the pool
     * @param amount0Desired Desired amount of token0
     * @param amount1Desired Desired amount of token1
     * @param amount0Min Minimum amount of token0
     * @param amount1Min Minimum amount of token1
     * @return amount0 Amount of token0 actually deposited
     * @return amount1 Amount of token1 actually deposited
     * @return liquidity LP tokens minted
     */
    function addLiquidity(
        uint256 amount0Desired,
        uint256 amount1Desired,
        uint256 amount0Min,
        uint256 amount1Min
    ) external nonReentrant returns (
        uint256 amount0,
        uint256 amount1,
        uint256 liquidity
    ) {
        // Calculate optimal deposit ratio
        uint256 reserve0Current = reserve0;
        uint256 reserve1Current = reserve1;

        if (reserve0Current == 0 && reserve1Current == 0) {
            // First deposit - use desired amounts
            amount0 = amount0Desired;
            amount1 = amount1Desired;
            liquidity = sqrt(amount0 * amount1) - MINIMUM_LIQUIDITY;

            // Lock minimum liquidity permanently
            _mint(address(0), MINIMUM_LIQUIDITY);
        } else {
            // Calculate optimal amount1 based on ratio
            uint256 amount1Optimal = (amount0Desired * reserve1Current) / reserve0Current;

            if (amount1Optimal <= amount1Desired) {
                // Need more token0
                amount0 = amount0Desired;
                amount1 = amount1Optimal;
            } else {
                // Need more token1
                uint256 amount0Optimal = (amount1Desired * reserve0Current) / reserve1Current;
                amount0 = amount0Optimal;
                amount1 = amount1Desired;
            }

            // Check minimums
            if (amount0 < amount0Min || amount1 < amount1Min) revert InsufficientLiquidity();

            // Mint LP tokens proportional to existing liquidity
            liquidity = (totalSupply * (amount0 - 1)) / (reserve0Current - 1);
        }

        if (liquidity == 0) revert InsufficientLiquidityMinted();

        // Transfer tokens from sender
        token0.safeTransferFrom(msg.sender, address(this), amount0);
        token1.safeTransferFrom(msg.sender, address(this), amount1);

        // Mint LP tokens to sender
        _mint(msg.sender, liquidity);

        // Update reserves
        reserve0 = token0.balanceOf(address(this));
        reserve1 = token1.balanceOf(address(this));

        emit Mint(msg.sender, amount0, amount1);
        emit Sync(reserve0, reserve1);
    }

    /**
     * @dev Remove liquidity from the pool
     * @param liquidity Amount of LP tokens to burn
     * @param amount0Min Minimum amount of token0 to receive
     * @param amount1Min Minimum amount of token1 to receive
     * @param to Address to send tokens to
     * @return amount0 Amount of token0 withdrawn
     * @return amount1 Amount of token1 withdrawn
     */
    function removeLiquidity(
        uint256 liquidity,
        uint256 amount0Min,
        uint256 amount1Min,
        address to
    ) external nonReentrant returns (uint256 amount0, uint256 amount1) {
        if (liquidity == 0) revert InsufficientLiquidity();

        // Calculate share of reserves
        uint256 balance0 = token0.balanceOf(address(this));
        uint256 balance1 = token1.balanceOf(address(this));

        uint256 _totalSupply = totalSupply;
        amount0 = (liquidity * balance0) / _totalSupply;
        amount1 = (liquidity * balance1) / _totalSupply;

        if (amount0 < amount0Min || amount1 < amount1Min) revert InsufficientLiquidityBurned();

        // Burn LP tokens
        _burn(msg.sender, liquidity);

        // Transfer tokens to recipient
        token0.safeTransfer(to, amount0);
        token1.safeTransfer(to, amount1);

        // Update reserves
        reserve0 = token0.balanceOf(address(this));
        reserve1 = token1.balanceOf(address(this));

        emit Burn(msg.sender, amount0, amount1, to);
        emit Sync(reserve0, reserve1);
    }

    /**
     * @dev Swap tokens through the pool
     * @param amount0In Amount of token0 to swap in (0 if swapping token1)
     * @param amount1In Amount of token1 to swap in (0 if swapping token0)
     * @param amount0OutMinimum Minimum amount of token0 to receive (0 if not receiving token0)
     * @param amount1OutMinimum Minimum amount of token1 to receive (0 if not receiving token1)
     * @param to Address to send output tokens to
     * @return amount0Out Amount of token0 received
     * @return amount1Out Amount of token1 received
     */
    function swap(
        uint256 amount0In,
        uint256 amount1In,
        uint256 amount0OutMinimum,
        uint256 amount1OutMinimum,
        address to
    ) external nonReentrant validRecipient(to) returns (
        uint256 amount0Out,
        uint256 amount1Out
    ) {
        // Must be swapping exactly one direction
        if (amount0In == 0 && amount1In == 0) revert InsufficientOutputAmount();
        if (amount0In > 0 && amount1In > 0) revert InsufficientOutputAmount();

        uint256 balance0 = token0.balanceOf(address(this));
        uint256 balance1 = token1.balanceOf(address(this));

        // Calculate output amounts
        if (amount0In > 0) {
            // Swapping token0 for token1
            amount0Out = getAmountOut(amount0In, reserve0, reserve1);
            if (amount0Out < amount0OutMinimum) revert InsufficientOutputAmount();

            // Transfer input token
            token0.safeTransferFrom(msg.sender, address(this), amount0In);

            // Calculate final balances to determine actual output
            uint256 reserve0Calc = balance0 + amount0In;
            uint256 reserve1Calc = balance1 - amount0Out;

            require(reserve0Calc * reserve1Calc >= reserve0 * reserve1, "K violated");

            // Transfer output token
            token1.safeTransfer(to, amount0Out);

            // Update reserves
            reserve0 = token0.balanceOf(address(this));
            reserve1 = token1.balanceOf(address(this));

            emit Swap(msg.sender, amount0In, 0, 0, amount0Out, to);
        } else {
            // Swapping token1 for token0
            amount1Out = getAmountOut(amount1In, reserve1, reserve0);
            if (amount1Out < amount1OutMinimum) revert InsufficientOutputAmount();

            // Transfer input token
            token1.safeTransferFrom(msg.sender, address(this), amount1In);

            // Calculate final balances to determine actual output
            uint256 reserve1Calc = balance1 + amount1In;
            uint256 reserve0Calc = balance0 - amount1Out;

            require(reserve0Calc * reserve1Calc >= reserve0 * reserve1, "K violated");

            // Transfer output token
            token0.safeTransfer(to, amount1Out);

            // Update reserves
            reserve0 = token0.balanceOf(address(this));
            reserve1 = token1.balanceOf(address(this));

            emit Swap(msg.sender, 0, amount1In, amount1Out, 0, to);
        }

        emit Sync(reserve0, reserve1);
    }

    /**
     * @dev Mint LP tokens
     */
    function _mint(address to, uint256 amount) internal {
        totalSupply += amount;
        balanceOf[to] += amount;
        emit Transfer(address(0), to, amount);
    }

    /**
     * @dev Burn LP tokens
     */
    function _burn(address from, uint256 amount) internal {
        balanceOf[from] -= amount;
        totalSupply -= amount;
        emit Transfer(from, address(0), amount);
    }

    /**
     * @dev ERC20 transfer for LP tokens
     */
    function transfer(address to, uint256 amount) external returns (bool) {
        balanceOf[msg.sender] -= amount;
        balanceOf[to] += amount;
        emit Transfer(msg.sender, to, amount);
        return true;
    }

    /**
     * @dev ERC20 approve for LP tokens
     */
    function approve(address spender, uint256 amount) external returns (bool) {
        allowance[msg.sender][spender] = amount;
        emit Approval(msg.sender, spender, amount);
        return true;
    }

    /**
     * @dev ERC20 transferFrom for LP tokens
     */
    function transferFrom(
        address from,
        address to,
        uint256 amount
    ) external returns (bool) {
        uint256 current = allowance[from][msg.sender];
        require(current >= amount, "ERC20: insufficient allowance");

        allowance[from][msg.sender] = current - amount;
        balanceOf[from] -= amount;
        balanceOf[to] += amount;
        emit Transfer(from, to, amount);
        return true;
    }

    /**
     * @dev Square root function for liquidity calculations
     */
    function sqrt(uint256 x) internal pure returns (uint256) {
        if (x == 0) return 0;
        uint256 z = ((x + 1) / 2);
        uint256 y = x;
        while (z < y) {
            y = z;
            z = ((x / z) + z) / 2;
        }
        return y;
    }

    // ERC20 events for LP token
    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
}
