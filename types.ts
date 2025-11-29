export interface Network {
  id: string;
  name: string;
  type: 'testnet' | 'mainnet';
  currency: string;
  iconColor: string;
}

export interface Token {
  id: string;
  symbol: string;
  name: string;
  icon: string; // URL or emoji
}

export interface TransactionRecord {
  id: string;
  timestamp: number;
  fromNetwork: string;
  toNetwork: string;
  token: string;
  amount: string;
  status: 'pending' | 'completed' | 'failed';
  hash: string;
  aiMessage?: string;
}

export interface BridgeAnalysis {
  estimatedGas: string;
  estimatedTime: string;
  riskScore: string;
  message: string;
}

// Wallet Provider Types (EIP-1193 & EIP-6963)
export interface EIP1193Provider {
  request: (args: { method: string; params?: any[] }) => Promise<any>;
  on: (eventName: string, handler: (...args: any[]) => void) => void;
  removeListener: (eventName: string, handler: (...args: any[]) => void) => void;
  isMetaMask?: boolean;
}

export interface EIP6963ProviderInfo {
  uuid: string;
  name: string;
  icon: string;
  rdns: string;
}

export interface EIP6963ProviderDetail {
  info: EIP6963ProviderInfo;
  provider: EIP1193Provider;
}
