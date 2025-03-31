// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

/**
 * @title TicTacToe Game Contract
 * @dev A simple tic-tac-toe game that supports two players
 */
contract TicTacToe {
    // Game state enum
    enum GameState { WAITING, ACTIVE, FINISHED }
    
    // Game result enum
    enum GameResult { ONGOING, PLAYER1_WIN, PLAYER2_WIN, DRAW }
    
    // Game struct
    struct Game {
        address player1;
        address player2;
        address nextPlayer;
        uint8[9] board;       // 0: empty, 1: player1, 2: player2
        GameState state;
        GameResult result;
        uint256 createdAt;
    }
    
    // Mapping from game ID to game
    mapping(uint256 => Game) public games;
    
    // Current game counter
    uint256 public gameCounter;
    
    // Events
    event GameCreated(uint256 gameId, address player1);
    event GameJoined(uint256 gameId, address player2);
    event MoveMade(uint256 gameId, address player, uint8 position);
    event GameFinished(uint256 gameId, GameResult result);
    
    /**
     * @dev Create a new game
     */
    function createGame() external returns (uint256) {
        uint256 gameId = gameCounter++;
        
        games[gameId].player1 = msg.sender;
        games[gameId].nextPlayer = msg.sender;
        games[gameId].state = GameState.WAITING;
        games[gameId].result = GameResult.ONGOING;
        games[gameId].createdAt = block.timestamp;
        
        emit GameCreated(gameId, msg.sender);
        
        return gameId;
    }
    
    /**
     * @dev Join a game
     * @param gameId Game ID
     */
    function joinGame(uint256 gameId) external {
        Game storage game = games[gameId];
        
        require(game.player1 != address(0), "Game does not exist");
        require(game.state == GameState.WAITING, "Game cannot be joined");
        require(msg.sender != game.player1, "Cannot play against yourself");
        
        game.player2 = msg.sender;
        game.state = GameState.ACTIVE;
        
        emit GameJoined(gameId, msg.sender);
    }
    
    /**
     * @dev Make a move
     * @param gameId Game ID
     * @param position Position to place mark (0-8)
     */
    function makeMove(uint256 gameId, uint8 position) external {
        Game storage game = games[gameId];
        
        require(game.state == GameState.ACTIVE, "Game is not active");
        require(msg.sender == game.nextPlayer, "Not your turn");
        require(position < 9, "Invalid position");
        require(game.board[position] == 0, "Position already taken");
        
        // Determine player mark
        uint8 mark = (msg.sender == game.player1) ? 1 : 2;
        
        // Update board
        game.board[position] = mark;
        
        // Check game result
        GameResult result = checkGameResult(game.board);
        
        if (result != GameResult.ONGOING) {
            game.state = GameState.FINISHED;
            game.result = result;
            emit GameFinished(gameId, result);
        } else {
            // Switch to next player
            game.nextPlayer = (msg.sender == game.player1) ? game.player2 : game.player1;
        }
        
        emit MoveMade(gameId, msg.sender, position);
    }
    
    /**
     * @dev Check game result
     * @param board Game board
     * @return Game result
     */
    function checkGameResult(uint8[9] memory board) internal pure returns (GameResult) {
        // Check rows
        for (uint8 i = 0; i < 3; i++) {
            if (board[i*3] != 0 && board[i*3] == board[i*3+1] && board[i*3+1] == board[i*3+2]) {
                return board[i*3] == 1 ? GameResult.PLAYER1_WIN : GameResult.PLAYER2_WIN;
            }
        }
        
        // Check columns
        for (uint8 i = 0; i < 3; i++) {
            if (board[i] != 0 && board[i] == board[i+3] && board[i+3] == board[i+6]) {
                return board[i] == 1 ? GameResult.PLAYER1_WIN : GameResult.PLAYER2_WIN;
            }
        }
        
        // Check diagonals
        if (board[0] != 0 && board[0] == board[4] && board[4] == board[8]) {
            return board[0] == 1 ? GameResult.PLAYER1_WIN : GameResult.PLAYER2_WIN;
        }
        
        if (board[2] != 0 && board[2] == board[4] && board[4] == board[6]) {
            return board[2] == 1 ? GameResult.PLAYER1_WIN : GameResult.PLAYER2_WIN;
        }
        
        // Check for draw
        bool isDraw = true;
        for (uint8 i = 0; i < 9; i++) {
            if (board[i] == 0) {
                isDraw = false;
                break;
            }
        }
        
        if (isDraw) {
            return GameResult.DRAW;
        }
        
        // Game continues
        return GameResult.ONGOING;
    }
    
    /**
     * @dev Get game information
     * @param gameId Game ID
     */
    function getGameInfo(uint256 gameId) external view returns (
        address player1,
        address player2,
        address nextPlayer,
        uint8[9] memory board,
        GameState state,
        GameResult result
    ) {
        Game storage game = games[gameId];
        return (
            game.player1,
            game.player2,
            game.nextPlayer,
            game.board,
            game.state,
            game.result
        );
    }
} 