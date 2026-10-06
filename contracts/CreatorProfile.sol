// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {ERC1155} from "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/// @notice A creator identity, limited early-supporter badge, and tip splitter.
contract CreatorProfile is ERC1155, Ownable, ReentrancyGuard {
    uint256 public constant BADGE_ID = 1;
    uint256 public constant MAX_BADGES = 100;

    uint256 public badgesMinted;
    address[] public earlySupporters;
    mapping(address => bool) public hasClaimed;

    /// @notice Tips received but not yet allocated by distributeRevenue.
    uint256 public pendingRevenue;
    /// @notice Amount each address may withdraw after revenue allocation.
    mapping(address => uint256) public withdrawableRevenue;

    event BadgeClaimed(address indexed supporter);
    event Tipped(address indexed tipper, uint256 amount);
    event RevenueDistributed(uint256 creatorAmount, uint256 supporterPool, uint256 perSupporter);
    event RevenueWithdrawn(address indexed account, uint256 amount);
    event URIUpdated(string newUri);

    constructor(address creator, string memory metadataUri) ERC1155(metadataUri) Ownable(creator) {
        require(creator != address(0), "Creator is zero address");
    }

    function claimBadge() external {
        require(!hasClaimed[msg.sender], "Already claimed");
        require(badgesMinted < MAX_BADGES, "Badge supply exhausted");

        hasClaimed[msg.sender] = true;
        badgesMinted += 1;
        earlySupporters.push(msg.sender);
        _mint(msg.sender, BADGE_ID, 1, "");
        emit BadgeClaimed(msg.sender);
    }

    /// @notice Allows the creator to point the profile at updated IPFS metadata.
    function setURI(string calldata newUri) external onlyOwner {
        _setURI(newUri);
        emit URIUpdated(newUri);
    }

    receive() external payable {
        pendingRevenue += msg.value;
        emit Tipped(msg.sender, msg.value);
    }

    /// @notice Allocate pending tips. No badge holders means the tips remain pending.
    function distributeRevenue() external onlyOwner nonReentrant {
        uint256 amount = pendingRevenue;
        require(amount > 0, "No pending revenue");
        require(badgesMinted > 0, "No badge holders");

        // Clear first. Credits are liabilities and are not reprocessed as new revenue.
        pendingRevenue = 0;
        // Split without multiplying the full amount, which could overflow for a
        // balance near uint256's maximum.
        uint256 creatorAmount = (amount / 100) * 80 + ((amount % 100) * 80) / 100;
        uint256 supporterPool = amount - creatorAmount;
        uint256 perSupporter = supporterPool / badgesMinted;

        // Send integer-division dust to the creator so no share is stranded.
        uint256 creatorCredit = creatorAmount + (supporterPool - (perSupporter * badgesMinted));
        withdrawableRevenue[owner()] += creatorCredit;

        uint256 supporterCount = earlySupporters.length;
        for (uint256 i; i < supporterCount; ) {
            withdrawableRevenue[earlySupporters[i]] += perSupporter;
            unchecked { ++i; }
        }

        emit RevenueDistributed(creatorCredit, supporterPool, perSupporter);
    }

    /// @notice Withdraw the caller's creator or supporter credits.
    function withdrawRevenue() external nonReentrant {
        uint256 amount = withdrawableRevenue[msg.sender];
        require(amount > 0, "Nothing to withdraw");

        withdrawableRevenue[msg.sender] = 0;
        (bool success, ) = payable(msg.sender).call{value: amount}("");
        require(success, "Withdrawal failed");
        emit RevenueWithdrawn(msg.sender, amount);
    }
}
