import { parseAbi } from "viem";

export const FACTORY_ADDRESS =
  process.env.NEXT_PUBLIC_FACTORY_ADDRESS as `0x${string}` | undefined;

export const factoryAbi = parseAbi([
  "function creatorToProfile(address) view returns (address)",
  "function allProfiles(uint256) view returns (address)",
  "function profileCount() view returns (uint256)",
  "function createProfile(string uri) returns (address profileAddress)",
  "event ProfileCreated(address indexed creator, address profileAddress)",
]);

export const profileAbi = parseAbi([
  "function BADGE_ID() view returns (uint256)",
  "function MAX_BADGES() view returns (uint256)",
  "function badgesMinted() view returns (uint256)",
  "function hasClaimed(address) view returns (bool)",
  "function pendingRevenue() view returns (uint256)",
  "function withdrawableRevenue(address) view returns (uint256)",
  "function owner() view returns (address)",
  "function uri(uint256) view returns (string)",
  "function claimBadge()",
  "function distributeRevenue()",
  "function withdrawRevenue()",
  "function setURI(string newUri)",
  "event BadgeClaimed(address indexed supporter)",
  "event Tipped(address indexed tipper, uint256 amount)",
  "event RevenueDistributed(uint256 creatorAmount, uint256 supporterPool, uint256 perSupporter)",
  "event RevenueWithdrawn(address indexed account, uint256 amount)",
]);
