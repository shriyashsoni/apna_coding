// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract ProductLaunchVerification {

    // FIXED ADMIN WALLET (PUBLIC ADDRESS ONLY)
    address public constant admin =
        0x9D307F0C1B614C9088Aa83eAE9AA3D9779c4921D;

    // 0.001 ETH
    uint256 public constant minimumStake = 1000000000000000;

    enum Status {
        Pending,
        Approved,
        Rejected
    }

    struct Product {
        address founder;
        uint256 stakeAmount;
        Status status;
    }

    uint256 public productCount;
    mapping(uint256 => Product) public products;

    event ProductLaunched(
        uint256 indexed productId,
        address indexed founder,
        uint256 stakeAmount
    );

    event ProductApproved(uint256 indexed productId);
    event ProductRejected(uint256 indexed productId);

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin");
        _;
    }

    // USER: launch product with stake
    function launchProduct() external payable {
        require(msg.value == minimumStake, "Incorrect stake amount");

        productCount++;

        products[productCount] = Product({
            founder: msg.sender,
            stakeAmount: msg.value,
            status: Status.Pending
        });

        emit ProductLaunched(productCount, msg.sender, msg.value);
    }

    // ADMIN: approve product and refund stake
    function approveProduct(uint256 productId) external onlyAdmin {
        Product storage product = products[productId];
        require(product.status == Status.Pending, "Already reviewed");

        product.status = Status.Approved;
        payable(product.founder).transfer(product.stakeAmount);

        emit ProductApproved(productId);
    }

    // ADMIN: reject product (stake stays in contract)
    function rejectProduct(uint256 productId) external onlyAdmin {
        Product storage product = products[productId];
        require(product.status == Status.Pending, "Already reviewed");

        product.status = Status.Rejected;
        emit ProductRejected(productId);
    }

    // ADMIN: withdraw slashed stakes
    function withdraw() external onlyAdmin {
        payable(admin).transfer(address(this).balance);
    }
}
