// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title PublicSubmissionStaking
 * @dev Handles staking for public submissions of Events, Hackathons, and Products.
 * Charge: 0.01 ETH
 */
contract PublicSubmissionStaking {
    address public admin;
    uint256 public constant STAKE_AMOUNT = 0.01 ether;

    enum SubmissionType { Event, Hackathon, Product }
    enum Status { Pending, Approved, Rejected, Refunded }

    struct Submission {
        address submitter;
        SubmissionType subType;
        uint256 stakeAmount;
        Status status;
        string contentId; // ID in Supabase
    }

    mapping(uint256 => Submission) public submissions;
    uint256 public submissionCount;

    event Submitted(uint256 indexed id, address indexed submitter, SubmissionType subType, string contentId);
    event StatusChanged(uint256 indexed id, Status status);

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can call this");
        _;
    }

    constructor() {
        admin = msg.sender;
    }

    function submit(SubmissionType _type, string memory _contentId) external payable {
        require(msg.value == STAKE_AMOUNT, "Incorrect stake amount. Must be 0.01 ETH");
        
        submissionCount++;
        submissions[submissionCount] = Submission({
            submitter: msg.sender,
            subType: _type,
            stakeAmount: msg.value,
            status: Status.Pending,
            contentId: _contentId
        });

        emit Submitted(submissionCount, msg.sender, _type, _contentId);
    }

    function approve(uint256 _id) external onlyAdmin {
        Submission storage sub = submissions[_id];
        require(sub.status == Status.Pending, "Submission not pending");
        
        sub.status = Status.Approved;
        
        // Refund stake to submitter on approval
        (bool success, ) = sub.submitter.call{value: sub.stakeAmount}("");
        require(success, "Refund failed");
        
        sub.status = Status.Refunded;
        emit StatusChanged(_id, Status.Refunded);
    }

    function reject(uint256 _id) external onlyAdmin {
        Submission storage sub = submissions[_id];
        require(sub.status == Status.Pending, "Submission not pending");
        
        sub.status = Status.Rejected;
        emit StatusChanged(_id, Status.Rejected);
    }

    function withdraw() external onlyAdmin {
        (bool success, ) = admin.call{value: address(this).balance}("");
        require(success, "Withdraw failed");
    }

    function updateAdmin(address _newAdmin) external onlyAdmin {
        admin = _newAdmin;
    }
}
