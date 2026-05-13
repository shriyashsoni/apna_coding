// Product Launch Verification Smart Contract
// Deployed on Base Sepolia (Testnet) and Base Mainnet

export const PRODUCT_LAUNCH_CONTRACT = {
  // Base Sepolia Testnet
  'base-sepolia': {
    address: '0x_DEPLOY_ADDRESS_HERE' as `0x${string}`,
    chainId: 84532,
  },
  // Base Mainnet
  'base': {
    address: '0x_DEPLOY_ADDRESS_HERE' as `0x${string}`,
    chainId: 8453,
  },
} as const;

// Contract Constants
export const LAUNCH_FEE = '0.001'; // 0.001 ETH
export const LAUNCH_FEE_WEI = 1000000000000000n; // 0.001 ETH in wei

export const ADMIN_ADDRESS = '0x9D307F0C1B614C9088Aa83eAE9AA3D9779c4921D' as `0x${string}`;

// Product Status
export const ProductStatus = {
  Pending: 0,
  Approved: 1,
  Rejected: 2,
} as const;

// Contract ABI
export const PRODUCT_LAUNCH_ABI = [
  {
    "type": "function",
    "name": "admin",
    "stateMutability": "view",
    "inputs": [],
    "outputs": [{ "name": "", "type": "address" }]
  },
  {
    "type": "function",
    "name": "minimumStake",
    "stateMutability": "view",
    "inputs": [],
    "outputs": [{ "name": "", "type": "uint256" }]
  },
  {
    "type": "function",
    "name": "productCount",
    "stateMutability": "view",
    "inputs": [],
    "outputs": [{ "name": "", "type": "uint256" }]
  },
  {
    "type": "function",
    "name": "products",
    "stateMutability": "view",
    "inputs": [{ "name": "", "type": "uint256" }],
    "outputs": [
      { "name": "founder", "type": "address" },
      { "name": "stakeAmount", "type": "uint256" },
      { "name": "status", "type": "uint8" }
    ]
  },
  {
    "type": "function",
    "name": "launchProduct",
    "stateMutability": "payable",
    "inputs": [
      { "name": "name", "type": "string" },
      { "name": "description", "type": "string" },
      { "name": "category", "type": "string" },
      { "name": "logoUrl", "type": "string" },
      { "name": "websiteUrl", "type": "string" },
      { "name": "socialLinks", "type": "string[]" }
    ],
    "outputs": []
  },
  {
    "type": "function",
    "name": "approveProduct",
    "stateMutability": "nonpayable",
    "inputs": [{ "name": "productId", "type": "uint256" }],
    "outputs": []
  },
  {
    "type": "function",
    "name": "rejectProduct",
    "stateMutability": "nonpayable",
    "inputs": [{ "name": "productId", "type": "uint256" }],
    "outputs": []
  },
  {
    "type": "function",
    "name": "withdraw",
    "stateMutability": "nonpayable",
    "inputs": [],
    "outputs": []
  },
  {
    "type": "event",
    "name": "ProductLaunched",
    "inputs": [
      { "name": "productId", "type": "uint256", "indexed": true },
      { "name": "founder", "type": "address", "indexed": true },
      { "name": "stakeAmount", "type": "uint256", "indexed": false }
    ]
  },
  {
    "type": "event",
    "name": "ProductApproved",
    "inputs": [
      { "name": "productId", "type": "uint256", "indexed": true }
    ]
  },
  {
    "type": "event",
    "name": "ProductRejected",
    "inputs": [
      { "name": "productId", "type": "uint256", "indexed": true }
    ]
  }
] as const;
