import React, { useState, useEffect, useCallback } from 'react';
import { ArrowRight, ArrowDown, Activity, ShieldCheck, Loader2, ChevronDown } from 'lucide-react';
import { NETWORKS, TOKENS } from '../constants';
import { Network, Token, BridgeAnalysis, TransactionRecord, EIP1193Provider } from '../types';
import { getBridgeAnalysis } from '../services/geminiService';

interface BridgeInterfaceProps {
  isWalletConnected: boolean;
  walletProvider: EIP1193Provider | null;
  onConnectWallet: () => void;
  onAddTransaction: (tx: TransactionRecord) => void;
}

const BridgeInterface: React.FC<BridgeInterfaceProps> = ({ isWalletConnected, walletProvider, onConnectWallet, onAddTransaction }) => {
  const [fromNetwork, setFromNetwork] = useState<Network>(NETWORKS[0]);
  const [toNetwork, setToNetwork] = useState<Network>(NETWORKS[2]);
  const [selectedToken, setSelectedToken] = useState<Token>(TOKENS[0]);
  const [amount, setAmount] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isBridging, setIsBridging] = useState(false);
  const [analysis, setAnalysis] = useState<BridgeAnalysis | null>(null);
  const [isTokenListOpen, setIsTokenListOpen] = useState(false);

  // Swap networks
  const handleSwap = () => {
    const temp = fromNetwork;
    setFromNetwork(toNetwork);
    setToNetwork(temp);
    setAnalysis(null);
  };

  // Debounced analysis when inputs change
  useEffect(() => {
    const timer = setTimeout(() => {
      if (amount && parseFloat(amount) > 0) {
        performAnalysis();
      } else {
        setAnalysis(null);
      }
    }, 800);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [amount, fromNetwork, toNetwork, selectedToken]);

  const performAnalysis = useCallback(async () => {
    setIsAnalyzing(true);
    try {
      const result = await getBridgeAnalysis(amount, selectedToken.symbol, fromNetwork.name, toNetwork.name);
      setAnalysis(result);
    } catch (e) {
      console.error(e);
    } finally {
      setIsAnalyzing(false);
    }
  }, [amount, selectedToken, fromNetwork, toNetwork]);

  const handleBridge = async () => {
    if (!isWalletConnected || !walletProvider) {
      onConnectWallet();
      return;
    }
    
    setIsBridging(true);

    try {
      // 1. Switch Network if needed
      // @ts-ignore
      const currentChainId = await walletProvider.request({ method: 'eth_chainId' });
      // @ts-ignore
      const targetChainId = (fromNetwork as any).chainId || '0xaa36a7'; // Default to Sepolia if undefined

      if (currentChainId !== targetChainId) {
        try {
          await walletProvider.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: targetChainId }],
          });
        } catch (switchError: any) {
          // This error code indicates that the chain has not been added to MetaMask.
          if (switchError.code === 4902) {
             alert("Please add this network to your wallet first.");
             setIsBridging(false);
             return;
          }
          throw switchError;
        }
      }

      // 2. Send Transaction
      // Using a dummy "Burn" address for the bridge destination on testnet
      const BRIDGE_ADDRESS = "0x000000000000000000000000000000000000dEaD";
      
      // Basic Wei conversion (not production precision safe but good for demo)
      const valueWei = "0x" + Math.floor(parseFloat(amount) * 1e18).toString(16);
      const fromAddress = (await walletProvider.request({ method: 'eth_accounts' }))[0];

      const txParams = {
        to: BRIDGE_ADDRESS,
        from: fromAddress,
        value: valueWei,
        gas: '0x5208', // 21000 Gwei
      };

      const txHash = await walletProvider.request({
        method: 'eth_sendTransaction',
        params: [txParams],
      });

      // 3. Record Transaction
      const newTx: TransactionRecord = {
        id: Math.random().toString(36).substring(7),
        timestamp: Date.now(),
        fromNetwork: fromNetwork.name,
        toNetwork: toNetwork.name,
        token: selectedToken.symbol,
        amount: amount,
        status: 'completed',
        hash: txHash,
        aiMessage: analysis?.message || 'Bridge transfer initiated successfully.'
      };

      onAddTransaction(newTx);
      setAmount('');
      setAnalysis(null);

    } catch (error: any) {
      console.error("Bridge Error:", error);
      alert("Transaction failed: " + (error.message || "User rejected"));
    } finally {
      setIsBridging(false);
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto">
      {/* Main Card */}
      <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
        {/* Glow Effect */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>

        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white">Bridge Assets</h2>
          <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-900 px-3 py-1 rounded-full">
            <Activity size={14} className="text-green-400" />
            <span>Operational</span>
          </div>
        </div>

        {/* From Section */}
        <div className="space-y-2 mb-2">
          <div className="flex justify-between text-sm text-slate-400">
            <span>From</span>
            <span>Balance: 4.204 {selectedToken.symbol}</span>
          </div>
          <div className="bg-slate-900 p-4 rounded-xl border border-slate-700 hover:border-slate-600 transition-colors">
            <div className="flex items-center justify-between mb-3">
              <input
                type="number"
                placeholder="0.0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="bg-transparent text-3xl font-medium text-white outline-none w-full placeholder-slate-600"
              />
              
              <div className="relative">
                <button 
                  onClick={() => setIsTokenListOpen(!isTokenListOpen)}
                  className="flex items-center gap-2 bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700 hover:bg-slate-700 transition-colors group"
                >
                  <span className="text-xl group-hover:scale-110 transition-transform">{selectedToken.icon}</span>
                  <span className="font-semibold text-white">{selectedToken.symbol}</span>
                  <ChevronDown size={16} className={`text-slate-400 transition-transform ${isTokenListOpen ? 'rotate-180' : ''}`} />
                </button>

                {isTokenListOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsTokenListOpen(false)} />
                    <div className="absolute right-0 top-full mt-2 w-48 bg-slate-800 border border-slate-700 rounded-xl shadow-xl z-50 overflow-hidden ring-1 ring-black/50">
                      <div className="p-1">
                        {TOKENS.map((token) => (
                          <button
                            key={token.id}
                            onClick={() => {
                              setSelectedToken(token);
                              setIsTokenListOpen(false);
                            }}
                            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-left ${
                              selectedToken.id === token.id ? 'bg-slate-700/50' : 'hover:bg-slate-700'
                            }`}
                          >
                            <span className="text-xl">{token.icon}</span>
                            <div>
                              <div className="font-medium text-slate-200">{token.symbol}</div>
                              <div className="text-xs text-slate-500">{token.name}</div>
                            </div>
                            {selectedToken.id === token.id && (
                              <div className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <select 
                value={fromNetwork.id}
                onChange={(e) => setFromNetwork(NETWORKS.find(n => n.id === e.target.value) || NETWORKS[0])}
                className="bg-slate-800 text-slate-200 text-sm py-1 px-2 rounded-lg border-none outline-none cursor-pointer hover:bg-slate-700"
              >
                {NETWORKS.map(net => (
                  <option key={`from-${net.id}`} value={net.id}>{net.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Swap Arrow */}
        <div className="flex justify-center -my-3 z-10 relative">
          <button 
            onClick={handleSwap}
            className="bg-slate-700 border-4 border-slate-800 p-2 rounded-full text-slate-300 hover:text-white hover:bg-slate-600 transition-all hover:scale-110"
          >
            <ArrowDown size={20} />
          </button>
        </div>

        {/* To Section */}
        <div className="space-y-2 mt-2">
          <div className="flex justify-between text-sm text-slate-400">
            <span>To (Mainnet)</span>
          </div>
          <div className="bg-slate-900 p-4 rounded-xl border border-slate-700">
             <div className="flex items-center justify-between h-12">
               <span className="text-slate-400 text-lg">
                 {amount ? amount : '0.0'}
               </span>
               <div className="flex items-center gap-2">
                 <div className={`w-2 h-2 rounded-full ${toNetwork.iconColor}`}></div>
                 <select 
                  value={toNetwork.id}
                  onChange={(e) => setToNetwork(NETWORKS.find(n => n.id === e.target.value) || NETWORKS[2])}
                  className="bg-transparent text-slate-200 text-sm font-medium outline-none cursor-pointer"
                >
                  {NETWORKS.map(net => (
                    <option key={`to-${net.id}`} value={net.id}>{net.name}</option>
                  ))}
                </select>
               </div>
             </div>
          </div>
        </div>

        {/* AI Analysis Panel */}
        {amount && parseFloat(amount) > 0 && (
          <div className="mt-6 bg-slate-900/50 rounded-xl p-4 border border-slate-700/50">
            {isAnalyzing ? (
              <div className="flex items-center gap-3 text-slate-400">
                <Loader2 className="animate-spin" size={18} />
                <span className="text-sm">Gemini AI analyzing route...</span>
              </div>
            ) : analysis ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-400 flex items-center gap-1">
                     <ShieldCheck size={14} className="text-blue-400" /> Risk Assessment
                  </span>
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                    analysis.riskScore === 'High' ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'
                  }`}>
                    {analysis.riskScore} Risk
                  </span>
                </div>
                
                <div className="flex justify-between text-xs text-slate-400 border-t border-slate-800 pt-3">
                  <div className="text-center">
                    <div className="text-slate-500 mb-1">Gas Est.</div>
                    <div className="text-slate-200">{analysis.estimatedGas} ETH</div>
                  </div>
                  <div className="text-center">
                    <div className="text-slate-500 mb-1">Time</div>
                    <div className="text-slate-200">{analysis.estimatedTime}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-slate-500 mb-1">Fee</div>
                    <div className="text-slate-200">$2.54</div>
                  </div>
                </div>

                <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
                  <p className="text-xs text-blue-300 italic">"{analysis.message}"</p>
                </div>
              </div>
            ) : null}
          </div>
        )}

        {/* Action Button */}
        <button
          onClick={handleBridge}
          disabled={!amount || isBridging || isAnalyzing}
          className={`w-full mt-6 py-4 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-2
            ${!amount || isAnalyzing 
              ? 'bg-slate-700 text-slate-500 cursor-not-allowed' 
              : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg shadow-blue-500/20 active:scale-95'
            }
          `}
        >
          {isBridging ? (
             <>
               <Loader2 className="animate-spin" /> Bridging Assets...
             </>
          ) : !isWalletConnected ? (
            'Connect Wallet to Bridge'
          ) : (
            <>
              Bridge Funds <ArrowRight size={20} />
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default BridgeInterface;
