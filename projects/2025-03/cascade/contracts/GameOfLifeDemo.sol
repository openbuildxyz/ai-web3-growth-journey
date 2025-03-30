// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract GameOfLifeDemo is ERC721, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;
    
    // 游戏状态结构
    struct GameState {
        string boardState;     // IPFS哈希，存储棋盘状态
        uint256 generation;    // 当前代数
        uint256 timestamp;     // 记录时间
        address player;        // 玩家地址
    }
    
    // 存储每个NFT对应的游戏状态
    mapping(uint256 => GameState) public gameStates;
    
    // NFT铸造价格
    uint256 public constant MINT_PRICE = 0.01 ether;
    
    constructor() ERC721("Game of Life Demo", "GOLD") {}
    
    // 铸造NFT并保存初始游戏状态
    function mintGame(string memory initialState) public payable {
        require(msg.value >= MINT_PRICE, "Insufficient payment");
        
        _tokenIds.increment();
        uint256 newTokenId = _tokenIds.current();
        
        _safeMint(msg.sender, newTokenId);
        
        gameStates[newTokenId] = GameState({
            boardState: initialState,
            generation: 0,
            timestamp: block.timestamp,
            player: msg.sender
        });
    }
    
    // 更新游戏状态
    function updateGameState(uint256 tokenId, string memory newState, uint256 generation) public {
        require(ownerOf(tokenId) == msg.sender, "Not the owner");
        
        GameState storage game = gameStates[tokenId];
        game.boardState = newState;
        game.generation = generation;
        game.timestamp = block.timestamp;
    }
    
    // 获取游戏状态
    function getGameState(uint256 tokenId) public view returns (
        string memory boardState,
        uint256 generation,
        uint256 timestamp,
        address player
    ) {
        GameState memory game = gameStates[tokenId];
        return (
            game.boardState,
            game.generation,
            game.timestamp,
            game.player
        );
    }
    
    // 提取合约收益
    function withdraw() public onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }
}
