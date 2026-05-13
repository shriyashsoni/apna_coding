// Flow blockchain configuration for Apna Coding Certificate NFTs

export const FLOW_CONFIG = {
  testnet: {
    accessNode: "https://rest-testnet.onflow.org",
    contractAddress: "0x_PASTE_YOUR_CONTRACT_ADDRESS_HERE_", // ← UPDATE THIS LINE!
    contractName: "ApnaCodingCertificate",
    chainId: "flow-testnet",
    explorer: "https://testnet.flowscan.org",
  },
  mainnet: {
    accessNode: "https://rest-mainnet.onflow.org",
    contractAddress: "0x_YOUR_MAINNET_CONTRACT_ADDRESS_",
    contractName: "ApnaCodingCertificate",
    chainId: "flow-mainnet",
    explorer: "https://flowscan.org",
  },
} as const;

// Current network (change to 'mainnet' for production)
export const CURRENT_NETWORK: keyof typeof FLOW_CONFIG = "testnet";

// Get current config
export const getCurrentFlowConfig = () => FLOW_CONFIG[CURRENT_NETWORK];

// Certificate achievement levels
export const ACHIEVEMENT_LEVELS = {
  PARTICIPANT: "participant",
  WINNER: "winner",
  COMPLETION: "completion",
} as const;

// Certificate types
export const CERTIFICATE_TYPES = {
  PARTICIPATION: "participation",
  WINNER: "winner",
  RUNNER_UP: "runner-up",
  COMPLETION: "completion",
  SPECIAL_MENTION: "special-mention",
} as const;

// Event types
export const EVENT_TYPES = {
  HACKATHON: "hackathon",
  EVENT: "event",
  COURSE: "course",
  INTERNSHIP: "internship",
} as const;

// Claim status
export const CLAIM_STATUS = {
  PENDING: "pending",
  CLAIMED: "claimed",
  MINTED: "minted",
} as const;
