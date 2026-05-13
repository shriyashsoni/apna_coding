// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title ProductLaunch
 * @dev Smart contract for launching and managing Web3 products on-chain
 * @author Apna Coding
 */
contract ProductLaunch {

    // Product structure
    struct Product {
        uint256 id;
        address creator;
        string name;
        string description;
        string category;
        string logoUrl;
        string websiteUrl;
        string[] socialLinks;
        uint256 launchTimestamp;
        uint256 upvotes;
        bool isActive;
        bool isVerified;
    }

    // State variables
    address public owner;
    uint256 public productCount;
    uint256 public launchFee = 0.01 ether; // Fee to launch a product

    // Mappings
    mapping(uint256 => Product) public products;
    mapping(address => uint256[]) public creatorProducts;
    mapping(uint256 => mapping(address => bool)) public hasUpvoted;
    mapping(uint256 => address[]) public productUpvoters;

    // Events
    event ProductLaunched(
        uint256 indexed productId,
        address indexed creator,
        string name,
        uint256 timestamp
    );

    event ProductUpvoted(
        uint256 indexed productId,
        address indexed voter,
        uint256 newUpvoteCount
    );

    event ProductVerified(uint256 indexed productId);
    event ProductDeactivated(uint256 indexed productId);
    event LaunchFeeUpdated(uint256 newFee);
    event FundsWithdrawn(address indexed to, uint256 amount);

    // Modifiers
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this");
        _;
    }

    modifier productExists(uint256 _productId) {
        require(_productId > 0 && _productId <= productCount, "Product does not exist");
        _;
    }

    modifier productActive(uint256 _productId) {
        require(products[_productId].isActive, "Product is not active");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    /**
     * @dev Launch a new product on-chain
     */
    function launchProduct(
        string memory _name,
        string memory _description,
        string memory _category,
        string memory _logoUrl,
        string memory _websiteUrl,
        string[] memory _socialLinks
    ) external payable returns (uint256) {
        require(msg.value >= launchFee, "Insufficient launch fee");
        require(bytes(_name).length > 0, "Name cannot be empty");
        require(bytes(_description).length > 0, "Description cannot be empty");

        productCount++;

        Product storage newProduct = products[productCount];
        newProduct.id = productCount;
        newProduct.creator = msg.sender;
        newProduct.name = _name;
        newProduct.description = _description;
        newProduct.category = _category;
        newProduct.logoUrl = _logoUrl;
        newProduct.websiteUrl = _websiteUrl;
        newProduct.socialLinks = _socialLinks;
        newProduct.launchTimestamp = block.timestamp;
        newProduct.upvotes = 0;
        newProduct.isActive = true;
        newProduct.isVerified = false;

        creatorProducts[msg.sender].push(productCount);

        emit ProductLaunched(productCount, msg.sender, _name, block.timestamp);

        return productCount;
    }

    /**
     * @dev Upvote a product
     */
    function upvoteProduct(uint256 _productId)
        external
        productExists(_productId)
        productActive(_productId)
    {
        require(!hasUpvoted[_productId][msg.sender], "Already upvoted");

        hasUpvoted[_productId][msg.sender] = true;
        products[_productId].upvotes++;
        productUpvoters[_productId].push(msg.sender);

        emit ProductUpvoted(_productId, msg.sender, products[_productId].upvotes);
    }

    /**
     * @dev Remove upvote from a product
     */
    function removeUpvote(uint256 _productId)
        external
        productExists(_productId)
    {
        require(hasUpvoted[_productId][msg.sender], "Haven't upvoted yet");

        hasUpvoted[_productId][msg.sender] = false;
        products[_productId].upvotes--;

        // Remove from upvoters array
        address[] storage upvoters = productUpvoters[_productId];
        for (uint256 i = 0; i < upvoters.length; i++) {
            if (upvoters[i] == msg.sender) {
                upvoters[i] = upvoters[upvoters.length - 1];
                upvoters.pop();
                break;
            }
        }
    }

    /**
     * @dev Get product details
     */
    function getProduct(uint256 _productId)
        external
        view
        productExists(_productId)
        returns (
            uint256 id,
            address creator,
            string memory name,
            string memory description,
            string memory category,
            string memory logoUrl,
            string memory websiteUrl,
            uint256 launchTimestamp,
            uint256 upvotes,
            bool isActive,
            bool isVerified
        )
    {
        Product storage product = products[_productId];
        return (
            product.id,
            product.creator,
            product.name,
            product.description,
            product.category,
            product.logoUrl,
            product.websiteUrl,
            product.launchTimestamp,
            product.upvotes,
            product.isActive,
            product.isVerified
        );
    }

    /**
     * @dev Get product social links
     */
    function getProductSocialLinks(uint256 _productId)
        external
        view
        productExists(_productId)
        returns (string[] memory)
    {
        return products[_productId].socialLinks;
    }

    /**
     * @dev Get all products by creator
     */
    function getCreatorProducts(address _creator)
        external
        view
        returns (uint256[] memory)
    {
        return creatorProducts[_creator];
    }

    /**
     * @dev Get all upvoters for a product
     */
    function getProductUpvoters(uint256 _productId)
        external
        view
        productExists(_productId)
        returns (address[] memory)
    {
        return productUpvoters[_productId];
    }

    /**
     * @dev Check if user has upvoted a product
     */
    function hasUserUpvoted(uint256 _productId, address _user)
        external
        view
        productExists(_productId)
        returns (bool)
    {
        return hasUpvoted[_productId][_user];
    }

    /**
     * @dev Get latest products (last N products)
     */
    function getLatestProducts(uint256 _count)
        external
        view
        returns (uint256[] memory)
    {
        uint256 count = _count > productCount ? productCount : _count;
        uint256[] memory latestIds = new uint256[](count);

        for (uint256 i = 0; i < count; i++) {
            latestIds[i] = productCount - i;
        }

        return latestIds;
    }

    /**
     * @dev Verify a product (only owner)
     */
    function verifyProduct(uint256 _productId)
        external
        onlyOwner
        productExists(_productId)
    {
        products[_productId].isVerified = true;
        emit ProductVerified(_productId);
    }

    /**
     * @dev Deactivate a product (only owner or creator)
     */
    function deactivateProduct(uint256 _productId)
        external
        productExists(_productId)
    {
        require(
            msg.sender == owner || msg.sender == products[_productId].creator,
            "Not authorized"
        );

        products[_productId].isActive = false;
        emit ProductDeactivated(_productId);
    }

    /**
     * @dev Update launch fee (only owner)
     */
    function updateLaunchFee(uint256 _newFee) external onlyOwner {
        launchFee = _newFee;
        emit LaunchFeeUpdated(_newFee);
    }

    /**
     * @dev Withdraw contract funds (only owner)
     */
    function withdrawFunds() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No funds to withdraw");

        (bool success, ) = payable(owner).call{value: balance}("");
        require(success, "Withdrawal failed");

        emit FundsWithdrawn(owner, balance);
    }

    /**
     * @dev Transfer ownership (only owner)
     */
    function transferOwnership(address _newOwner) external onlyOwner {
        require(_newOwner != address(0), "Invalid address");
        owner = _newOwner;
    }

    /**
     * @dev Get contract balance
     */
    function getContractBalance() external view returns (uint256) {
        return address(this).balance;
    }
}
