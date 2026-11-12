// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title ApnaListingRegistry
 * @notice Anchors every public Apna Coding listing (hackathons, jobs, news,
 *         events, communities, products) on Sepolia testnet, one transaction
 *         per listing. Each record stores the listing's public content ID,
 *         title and a keccak256 content hash so the website can link every
 *         listing page to its on-chain proof.
 *
 *         Only public directory data is stored on-chain. No user data,
 *         credentials or private/admin fields are ever written.
 *
 *         Ownership starts with the deploying wallet and can be transferred
 *         to the platform owner's wallet later. The registrar address runs
 *         the registration script.
 */
contract ApnaListingRegistry {

    enum Category { Hackathon, Job, News, Event, Community, Product }
    enum Status { None, Active, Revoked }

    struct Record {
        Category category;
        Status status;
        bytes32 contentHash;
        string contentId;
        string title;
        uint256 updatedAt;
    }

    address public owner;
    address public registrar;

    uint256 public recordCount;
    mapping(uint256 => Record) public records;
    // keccak256(uint8 category, contentId) => recordId
    mapping(bytes32 => uint256) public recordIds;

    event ListingRegistered(
        uint256 indexed recordId,
        Category indexed category,
        string contentId,
        bytes32 contentHash,
        string title
    );
    event ListingUpdated(
        uint256 indexed recordId,
        Category indexed category,
        string contentId,
        bytes32 contentHash,
        string title
    );
    event ListingRevoked(uint256 indexed recordId, Category indexed category, string contentId);
    event RegistrarChanged(address indexed previousRegistrar, address indexed newRegistrar);
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner");
        _;
    }

    modifier onlyRegistrar() {
        require(msg.sender == registrar || msg.sender == owner, "Only registrar");
        _;
    }

    constructor() {
        owner = msg.sender;
        registrar = msg.sender;
    }

    function keyFor(Category _category, string memory _contentId) public pure returns (bytes32) {
        return keccak256(abi.encodePacked(uint8(_category), _contentId));
    }

    function register(
        Category _category,
        string calldata _contentId,
        bytes32 _contentHash,
        string calldata _title
    ) external onlyRegistrar returns (uint256) {
        bytes32 key = keyFor(_category, _contentId);
        require(recordIds[key] == 0, "Already registered");

        recordCount++;
        records[recordCount] = Record({
            category: _category,
            status: Status.Active,
            contentHash: _contentHash,
            contentId: _contentId,
            title: _title,
            updatedAt: block.timestamp
        });
        recordIds[key] = recordCount;

        emit ListingRegistered(recordCount, _category, _contentId, _contentHash, _title);
        return recordCount;
    }

    function update(
        Category _category,
        string calldata _contentId,
        bytes32 _contentHash,
        string calldata _title
    ) external onlyRegistrar {
        bytes32 key = keyFor(_category, _contentId);
        uint256 id = recordIds[key];
        require(id != 0, "Not registered");

        Record storage rec = records[id];
        rec.contentHash = _contentHash;
        rec.title = _title;
        rec.status = Status.Active;
        rec.updatedAt = block.timestamp;

        emit ListingUpdated(id, _category, _contentId, _contentHash, _title);
    }

    function revoke(Category _category, string calldata _contentId) external onlyRegistrar {
        bytes32 key = keyFor(_category, _contentId);
        uint256 id = recordIds[key];
        require(id != 0, "Not registered");

        records[id].status = Status.Revoked;
        records[id].updatedAt = block.timestamp;

        emit ListingRevoked(id, _category, _contentId);
    }

    function getRecord(Category _category, string calldata _contentId)
        external
        view
        returns (uint256 id, Status status, bytes32 contentHash, string memory title, uint256 updatedAt)
    {
        bytes32 key = keyFor(_category, _contentId);
        id = recordIds[key];
        require(id != 0, "Not registered");
        Record storage rec = records[id];
        return (id, rec.status, rec.contentHash, rec.title, rec.updatedAt);
    }

    function setRegistrar(address _newRegistrar) external onlyOwner {
        emit RegistrarChanged(registrar, _newRegistrar);
        registrar = _newRegistrar;
    }

    function transferOwnership(address _newOwner) external onlyOwner {
        require(_newOwner != address(0), "Zero address");
        emit OwnershipTransferred(owner, _newOwner);
        owner = _newOwner;
    }
}
