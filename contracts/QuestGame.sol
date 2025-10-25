// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title QuestGame
 * @dev Smart contract for managing quest game challenges with staking
 */
contract QuestGame {
    struct Challenge {
        address creator;
        address opponent;
        uint256 stake;
        uint256 createdAt;
        bool completed;
        address winner;
        string gameId;
    }

    mapping(string => Challenge) public challenges;
    mapping(address => uint256) public playerBalances;
    
    uint256 public totalStaked;
    address public owner;

    event ChallengeCreated(
        string indexed gameId,
        address indexed creator,
        uint256 stake,
        uint256 timestamp
    );

    event ChallengeAccepted(
        string indexed gameId,
        address indexed opponent,
        uint256 timestamp
    );

    event ChallengeCompleted(
        string indexed gameId,
        address indexed winner,
        uint256 payout,
        uint256 timestamp
    );

    event StakeWithdrawn(
        address indexed player,
        uint256 amount,
        uint256 timestamp
    );

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this");
        _;
    }

    modifier gameExists(string memory gameId) {
        require(challenges[gameId].creator != address(0), "Game does not exist");
        _;
    }

    modifier gameNotCompleted(string memory gameId) {
        require(!challenges[gameId].completed, "Game already completed");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    /**
     * @dev Create a new challenge with stake
     */
    function createChallenge(
        string memory gameId,
        address opponent
    ) external payable {
        require(msg.value > 0, "Stake must be greater than 0");
        require(opponent != address(0), "Invalid opponent address");
        require(opponent != msg.sender, "Cannot challenge yourself");
        require(challenges[gameId].creator == address(0), "Game ID already exists");

        challenges[gameId] = Challenge({
            creator: msg.sender,
            opponent: opponent,
            stake: msg.value,
            createdAt: block.timestamp,
            completed: false,
            winner: address(0),
            gameId: gameId
        });

        totalStaked += msg.value;

        emit ChallengeCreated(gameId, msg.sender, msg.value, block.timestamp);
    }

    /**
     * @dev Accept a challenge (opponent deposits matching stake)
     */
    function acceptChallenge(string memory gameId) external payable gameExists(gameId) gameNotCompleted(gameId) {
        Challenge storage challenge = challenges[gameId];
        
        require(msg.sender == challenge.opponent, "Only opponent can accept");
        require(msg.value == challenge.stake, "Stake must match creator's stake");

        totalStaked += msg.value;

        emit ChallengeAccepted(gameId, msg.sender, block.timestamp);
    }

    /**
     * @dev Complete a challenge and award winner
     */
    function completeChallenge(
        string memory gameId,
        address winner
    ) external onlyOwner gameExists(gameId) gameNotCompleted(gameId) {
        Challenge storage challenge = challenges[gameId];
        
        require(
            winner == challenge.creator || winner == challenge.opponent,
            "Winner must be one of the players"
        );

        challenge.completed = true;
        challenge.winner = winner;

        // Calculate payout (total stake goes to winner)
        uint256 payout = challenge.stake * 2;
        playerBalances[winner] += payout;
        totalStaked -= payout;

        emit ChallengeCompleted(gameId, winner, payout, block.timestamp);
    }

    /**
     * @dev Withdraw winnings
     */
    function withdrawWinnings() external {
        uint256 amount = playerBalances[msg.sender];
        require(amount > 0, "No winnings to withdraw");

        playerBalances[msg.sender] = 0;
        
        (bool success, ) = msg.sender.call{value: amount}("");
        require(success, "Withdrawal failed");

        emit StakeWithdrawn(msg.sender, amount, block.timestamp);
    }

    /**
     * @dev Get challenge details
     */
    function getChallenge(string memory gameId) 
        external 
        view 
        gameExists(gameId) 
        returns (Challenge memory) 
    {
        return challenges[gameId];
    }

    /**
     * @dev Get player balance
     */
    function getPlayerBalance(address player) external view returns (uint256) {
        return playerBalances[player];
    }

    /**
     * @dev Emergency withdrawal (only owner)
     */
    function emergencyWithdraw() external onlyOwner {
        uint256 balance = address(this).balance;
        (bool success, ) = owner.call{value: balance}("");
        require(success, "Emergency withdrawal failed");
    }

    receive() external payable {}
}
