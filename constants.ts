import { Network, Token } from './types';

export const NETWORKS: (Network & { chainId: string })[] = [
  { id: 'sepolia', name: 'Sepolia Testnet', type: 'testnet', currency: 'SEP', iconColor: 'bg-yellow-500', chainId: '0xaa36a7' },
  { id: 'goerli', name: 'Goerli Testnet', type: 'testnet', currency: 'GOR', iconColor: 'bg-blue-500', chainId: '0x5' },
  { id: 'ethereum', name: 'Ethereum Mainnet', type: 'mainnet', currency: 'ETH', iconColor: 'bg-indigo-600', chainId: '0x1' },
  { id: 'polygon', name: 'Polygon Mainnet', type: 'mainnet', currency: 'MATIC', iconColor: 'bg-purple-600', chainId: '0x89' },
];

export const TOKENS: Token[] = [
  { id: 'eth', symbol: 'ETH', name: 'Ethereum', icon: '💎' },
  { id: 'usdc', symbol: 'USDC', name: 'USD Coin', icon: '💵' },
  { id: 'usdt', symbol: 'USDT', name: 'Tether', icon: '₮' },
  { id: 'dai', symbol: 'DAI', name: 'Dai Stablecoin', icon: '🔸' },
];

export const MOCK_GAS_HISTORY = [
  { time: '10:00', price: 15 },
  { time: '11:00', price: 18 },
  { time: '12:00', price: 25 },
  { time: '13:00', price: 22 },
  { time: '14:00', price: 30 },
  { time: '15:00', price: 28 },
  { time: '16:00', price: 12 },
];