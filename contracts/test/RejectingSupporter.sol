// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {ERC1155Holder} from "@openzeppelin/contracts/token/ERC1155/utils/ERC1155Holder.sol";

interface IFirstInProfile {
    function claimBadge() external;
    function withdrawRevenue() external;
}

/// @dev Test helper proving a recipient with a reverting receive hook can withdraw later.
contract RejectingSupporter is ERC1155Holder {
    function claim(address profile) external {
        IFirstInProfile(profile).claimBadge();
    }

    function withdraw(address profile) external {
        IFirstInProfile(profile).withdrawRevenue();
    }

    receive() external payable {
        revert("RejectingSupporter: reject ETH");
    }
}
