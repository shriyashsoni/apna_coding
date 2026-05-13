// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title ProductStaking
 * @dev Staking contract for product creators and supporters
 * @author Apna Coding
 * Deployed at: 0xE114AA229DE7c88BC22d2F5ec628532c9c46663c
 */
contract ProductStaking {

    // Staking position structure
    struct StakePosition {
        uint256 amount;
        uint256 timestamp;
        uint256 productId;
        uint256 rewardDebt;
        bool isActive;
    }

    // Product staking pool
    struct StakingPool {
        uint256 productId;
        uint256 totalStaked;
        uint256 rewardRate; // Reward per second
        uint256 lastUpdateTime;
        uint256 accRewardPerShare;
        bool isActive;
    }

    // State variables
    address public owner;
    address public deployer = 0x6F9788e39e8C629f73C27db48cce03eA1fB9Acc1;

    uint256 public constant PRECISION = 1e18;
    uint256 public minStakeAmount = 0.001 ether;
    uint256 public defaultRewardRate = 100; // Default rewards per second

    // Mappings
    mapping(uint256 => StakingPool) public stakingPools;
    mapping(address => mapping(uint256 => StakePosition)) public userStakes;
    mapping(address => uint256[]) public userStakedProducts;
    mapping(uint256 => address[]) public poolStakers;

    // Events
    event Staked(
        address indexed user,
        uint256 indexed productId,
        uint256 amount,
        uint256 timestamp
    );

    event Unstaked(
        address indexed user,
        uint256 indexed productId,
        uint256 amount,
        uint256 reward
    );

    event RewardsClaimed(
        address indexed user,
        uint256 indexed productId,
        uint256 amount
    );

    event PoolCreated(uint256 indexed productId, uint256 rewardRate);
    event PoolUpdated(uint256 indexed productId, uint256 newRewardRate);

    // Modifiers
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner");
        _;
    }

    modifier poolExists(uint256 _productId) {
        require(stakingPools[_productId].isActive, "Pool does not exist");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    /**
     * @dev Create a new staking pool for a product
     */
    function createStakingPool(uint256 _productId, uint256 _rewardRate)
        external
        onlyOwner
    {
        require(!stakingPools[_productId].isActive, "Pool already exists");
        require(_rewardRate > 0, "Invalid reward rate");

        stakingPools[_productId] = StakingPool({
            productId: _productId,
            totalStaked: 0,
            rewardRate: _rewardRate,
            lastUpdateTime: block.timestamp,
            accRewardPerShare: 0,
            isActive: true
        });

        emit PoolCreated(_productId, _rewardRate);
    }

    /**
     * @dev Stake tokens for a product
     */
    function stake(uint256 _productId)
        external
        payable
        poolExists(_productId)
    {
        require(msg.value >= minStakeAmount, "Amount too low");

        updatePool(_productId);

        StakePosition storage position = userStakes[msg.sender][_productId];
        StakingPool storage pool = stakingPools[_productId];

        // Claim pending rewards if any
        if (position.amount > 0) {
            uint256 pending = calculatePendingRewards(msg.sender, _productId);
            if (pending > 0) {
                _safeTransferETH(msg.sender, pending);
                emit RewardsClaimed(msg.sender, _productId, pending);
            }
        } else {
            // First time staking this product
            userStakedProducts[msg.sender].push(_productId);
            poolStakers[_productId].push(msg.sender);
        }

        position.amount += msg.value;
        position.timestamp = block.timestamp;
        position.productId = _productId;
        position.rewardDebt = (position.amount * pool.accRewardPerShare) / PRECISION;
        position.isActive = true;

        pool.totalStaked += msg.value;

        emit Staked(msg.sender, _productId, msg.value, block.timestamp);
    }

    /**
     * @dev Unstake tokens from a product
     */
    function unstake(uint256 _productId, uint256 _amount)
        external
        poolExists(_productId)
    {
        StakePosition storage position = userStakes[msg.sender][_productId];
        require(position.amount >= _amount, "Insufficient staked amount");

        updatePool(_productId);

        uint256 pending = calculatePendingRewards(msg.sender, _productId);

        position.amount -= _amount;
        stakingPools[_productId].totalStaked -= _amount;

        if (position.amount == 0) {
            position.isActive = false;
        }

        StakingPool storage pool = stakingPools[_productId];
        position.rewardDebt = (position.amount * pool.accRewardPerShare) / PRECISION;

        // Transfer staked amount + rewards
        uint256 totalTransfer = _amount + pending;
        _safeTransferETH(msg.sender, totalTransfer);

        emit Unstaked(msg.sender, _productId, _amount, pending);
    }

    /**
     * @dev Claim rewards without unstaking
     */
    function claimRewards(uint256 _productId)
        external
        poolExists(_productId)
    {
        updatePool(_productId);

        uint256 pending = calculatePendingRewards(msg.sender, _productId);
        require(pending > 0, "No rewards to claim");

        StakePosition storage position = userStakes[msg.sender][_productId];
        StakingPool storage pool = stakingPools[_productId];

        position.rewardDebt = (position.amount * pool.accRewardPerShare) / PRECISION;

        _safeTransferETH(msg.sender, pending);

        emit RewardsClaimed(msg.sender, _productId, pending);
    }

    /**
     * @dev Update pool rewards
     */
    function updatePool(uint256 _productId) public poolExists(_productId) {
        StakingPool storage pool = stakingPools[_productId];

        if (block.timestamp <= pool.lastUpdateTime) {
            return;
        }

        if (pool.totalStaked == 0) {
            pool.lastUpdateTime = block.timestamp;
            return;
        }

        uint256 timeElapsed = block.timestamp - pool.lastUpdateTime;
        uint256 reward = timeElapsed * pool.rewardRate;

        pool.accRewardPerShare += (reward * PRECISION) / pool.totalStaked;
        pool.lastUpdateTime = block.timestamp;
    }

    /**
     * @dev Calculate pending rewards for a user
     */
    function calculatePendingRewards(address _user, uint256 _productId)
        public
        view
        returns (uint256)
    {
        StakePosition storage position = userStakes[_user][_productId];
        StakingPool storage pool = stakingPools[_productId];

        if (position.amount == 0) {
            return 0;
        }

        uint256 accRewardPerShare = pool.accRewardPerShare;

        if (block.timestamp > pool.lastUpdateTime && pool.totalStaked > 0) {
            uint256 timeElapsed = block.timestamp - pool.lastUpdateTime;
            uint256 reward = timeElapsed * pool.rewardRate;
            accRewardPerShare += (reward * PRECISION) / pool.totalStaked;
        }

        uint256 pending = (position.amount * accRewardPerShare) / PRECISION;

        if (pending > position.rewardDebt) {
            return pending - position.rewardDebt;
        }

        return 0;
    }

    /**
     * @dev Get user's stake position
     */
    function getUserStake(address _user, uint256 _productId)
        external
        view
        returns (
            uint256 amount,
            uint256 timestamp,
            uint256 pendingRewards,
            bool isActive
        )
    {
        StakePosition storage position = userStakes[_user][_productId];
        uint256 pending = calculatePendingRewards(_user, _productId);

        return (
            position.amount,
            position.timestamp,
            pending,
            position.isActive
        );
    }

    /**
     * @dev Get all products a user has staked in
     */
    function getUserStakedProducts(address _user)
        external
        view
        returns (uint256[] memory)
    {
        return userStakedProducts[_user];
    }

    /**
     * @dev Get all stakers in a pool
     */
    function getPoolStakers(uint256 _productId)
        external
        view
        returns (address[] memory)
    {
        return poolStakers[_productId];
    }

    /**
     * @dev Get pool information
     */
    function getPoolInfo(uint256 _productId)
        external
        view
        returns (
            uint256 totalStaked,
            uint256 rewardRate,
            uint256 stakerCount,
            bool isActive
        )
    {
        StakingPool storage pool = stakingPools[_productId];
        return (
            pool.totalStaked,
            pool.rewardRate,
            poolStakers[_productId].length,
            pool.isActive
        );
    }

    /**
     * @dev Update reward rate for a pool (only owner)
     */
    function updateRewardRate(uint256 _productId, uint256 _newRate)
        external
        onlyOwner
        poolExists(_productId)
    {
        updatePool(_productId);
        stakingPools[_productId].rewardRate = _newRate;
        emit PoolUpdated(_productId, _newRate);
    }

    /**
     * @dev Update minimum stake amount (only owner)
     */
    function updateMinStakeAmount(uint256 _newAmount) external onlyOwner {
        minStakeAmount = _newAmount;
    }

    /**
     * @dev Emergency withdraw (only owner)
     */
    function emergencyWithdraw() external onlyOwner {
        uint256 balance = address(this).balance;
        _safeTransferETH(owner, balance);
    }

    /**
     * @dev Safe ETH transfer
     */
    function _safeTransferETH(address _to, uint256 _amount) private {
        (bool success, ) = payable(_to).call{value: _amount}("");
        require(success, "Transfer failed");
    }

    /**
     * @dev Receive function to accept ETH
     */
    receive() external payable {}
}
