// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {CreatorProfile} from "./CreatorProfile.sol";

/// @notice Creates and indexes one isolated CreatorProfile per wallet.
contract FirstInFactory {
    mapping(address => address) public creatorToProfile;
    address[] public allProfiles;

    event ProfileCreated(address indexed creator, address profileAddress);

    function createProfile(string calldata uri) external returns (address profileAddress) {
        require(creatorToProfile[msg.sender] == address(0), "Profile already exists");

        CreatorProfile profile = new CreatorProfile(msg.sender, uri);
        profileAddress = address(profile);
        creatorToProfile[msg.sender] = profileAddress;
        allProfiles.push(profileAddress);
        emit ProfileCreated(msg.sender, profileAddress);
    }

    function profileCount() external view returns (uint256) {
        return allProfiles.length;
    }
}
