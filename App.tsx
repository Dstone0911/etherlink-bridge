import React, { useState, useEffect } from 'react';
import { LayoutGrid, Wallet, History, ExternalLink, Zap, Loader2, AlertCircle, X, Smartphone, Monitor, QrCode, Copy, Check } from 'lucide-react';
import BridgeInterface from './components/BridgeInterface';
import GasTracker from './components/GasTracker';
import { TransactionRecord, EIP1193Provider, EIP6963ProviderDetail } from './types';

// Extend the Window interface to include ethereum
declare global {
  interface Window {
    ethereum: any;
  }
}

// --- Wallet Modal Component ---
interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConnect: (provider: EIP1193Provider) => void;
  isConnecting: boolean;
  connectError: string | null;
  detectedProviders: EIP6963ProviderDetail[];
}

const WalletModal: React.FC<WalletModalProps> = ({ isOpen, onClose, onConnect, isConnecting, connectError, detectedProviders }) => {
  const [activeView, setActiveView] = useState<'select' | 'walletconnect'>('select');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen) setActiveView('select');
  }, [isOpen]);

  const handleCopy = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleConnectProvider = (provider: EIP1193Provider) => {
    onConnect(provider);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-700 bg-slate-900/50">
          <h3 className="text-lg font-bold text-white">
            {activeView === 'select' ? 'Connect Wallet' : 'WalletConnect'}
          </h3>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors p-1 hover:bg-slate-700 rounded-lg"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-5">
          {connectError && (
            <div className="mb-4 bg-red-500/10 border border-red-500/20 text-red-200 p-3 rounded-lg text-sm flex items-start gap-2">
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
              <span>{connectError}</span>
            </div>
          )}

          {activeView === 'select' ? (
            <div className="space-y-3">
              
              {/* List Detected EIP-6963 Providers */}
              {detectedProviders.map((detail) => (
                <button
                  key={detail.info.uuid}
                  onClick={() => handleConnectProvider(detail.provider)}
                  disabled={isConnecting}
                  className="w-full flex items-center justify-between p-4 bg-slate-700/50 hover:bg-slate-700 border border-slate-600 hover:border-blue-500/50 rounded-xl group transition-all"
                >
                  <div className="flex items-center gap-4">
                     <img src={detail.info.icon} alt={detail.info.name} className="w-8 h-8 rounded-lg" />
                     <div className="text-left">
                       <div className="font-semibold text-slate-200">{detail.info.name}</div>
                       <div className="text-xs text-slate-400">Detected</div>
                     </div>
                  </div>
                  {isConnecting ? (
                     <Loader2 className="animate-spin text-blue-400" size={20} />
                   ) : (
                     <div className="w-2 h-2 rounded-full bg-slate-500 group-hover:bg-green-400 transition-colors" />
                   )}
                </button>
              ))}

              {/* Fallback for standard Window.Ethereum if no duplicates found OR just to always show generic */}
              <button
                onClick={() => handleConnectProvider(window.ethereum)}
                disabled={isConnecting}
                className="w-full flex items-center justify-between p-4 bg-slate-700/50 hover:bg-slate-700 border border-slate-600 hover:border-blue-500/50 rounded-xl group transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className="bg-orange-500/10 p-2 rounded-lg group-hover:bg-orange-500/20 transition-colors">
                    <Monitor className="text-orange-500" size={24} />
                  </div>
                  <div className="text-left">
                    <div className="font-semibold text-slate-200">Browser Wallet</div>
                    <div className="text-xs text-slate-400">MetaMask, Brave, etc.</div>
                  </div>
                </div>
                {isConnecting ? (
                  <Loader2 className="animate-spin text-blue-400" size={20} />
                ) : (
                  <div className="w-2 h-2 rounded-full bg-slate-500 group-hover:bg-green-400 transition-colors" />
                )}
              </button>

              {/* WalletConnect Option */}
              <button
                onClick={() => setActiveView('walletconnect')}
                className="w-full flex items-center justify-between p-4 bg-slate-700/50 hover:bg-slate-700 border border-slate-600 hover:border-blue-500/50 rounded-xl group transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className="bg-blue-500/10 p-2 rounded-lg group-hover:bg-blue-500/20 transition-colors">
                    <Smartphone className="text-blue-500" size={24} />
                  </div>
                  <div className="text-left">
                    <div className="font-semibold text-slate-200">WalletConnect</div>
                    <div className="text-xs text-slate-400">Scan with your mobile wallet</div>
                  </div>
                </div>
                <div className="w-2 h-2 rounded-full bg-slate-500 group-hover:bg-blue-400 transition-colors" />
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center animate-in slide-in-from-right-10 duration-200">
              <div className="bg-white p-4 rounded-xl mb-4 shadow-inner">
                {/* Mock QR Code Visual */}
                <div className="w-48 h-48 bg-slate-900 pattern-dots relative flex items-center justify-center overflow-hidden rounded-lg">
                   <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:8px_8px] text-black"></div>
                   <QrCode size={140} className="text-slate-900" />
                   <div className="absolute inset-0 flex items-center justify-center">
                     <div className="bg-blue-500 p-2 rounded-full shadow-lg">
                       <Wallet className="text-white" size={24} />
                     </div>
                   </div>
                </div>
              </div>
              
              <p className="text-center text-slate-300 font-medium mb-1">Scan with your phone</p>
              <div className="bg-yellow-500/10 border border-yellow-500/20 p-2 rounded text-xs text-yellow-200 mb-4 max-w-[260px] text-center">
                Demo Mode: WalletConnect requires a valid Cloud Project ID for live production usage.
              </div>

              <button 
                onClick={handleCopy}
                className="flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 transition-colors bg-blue-500/10 px-4 py-2 rounded-lg border border-blue-500/20"
              >
                {copied ? <Check size={14} /> : <Copy size={14} />}
                {copied ? "Copied to clipboard" : "Copy Link"}
              </button>

              <button 
                onClick={() => setActiveView('select')}
                className="mt-6 text-xs text-slate-500 hover:text-slate-300"
              >
                ← Back to wallet selection
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// --- Main App Component ---

const App: React.FC = () => {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [walletProvider, setWalletProvider] = useState<EIP1193Provider | null>(null);
  const [transactions, setTransactions] = useState<TransactionRecord[]>([]);
  const [activeTab, setActiveTab] = useState<'bridge' | 'history'>('bridge');
  
  // Wallet Connection State
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectError, setConnectError] = useState<string | null>(null);
  const [detectedProviders, setDetectedProviders] = useState<EIP6963ProviderDetail[]>([]);

  // EIP-6963 Discovery Logic
  useEffect(() => {
    const onAnnounceProvider = (event: CustomEvent<EIP6963ProviderDetail>) => {
      setDetectedProviders(prev => {
        // Dedup based on UUID
        if (prev.some(p => p.info.uuid === event.detail.info.uuid)) return prev;
        return [...prev, event.detail];
      });
    };

    window.addEventListener('eip6963:announceProvider', onAnnounceProvider as EventListener);
    window.dispatchEvent(new Event('eip6963:requestProvider'));

    return () => {
      window.removeEventListener('eip6963:announceProvider', onAnnounceProvider as EventListener);
    };
  }, []);

  // Standard wallet listeners
  useEffect(() => {
    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length > 0) {
        setWalletAddress(accounts[0]);
        setConnectError(null);
        setIsWalletModalOpen(false);
      } else {
        setWalletAddress(null);
        setWalletProvider(null);
      }
    };

    const handleChainChanged = () => {
      window.location.reload();
    };

    if (walletProvider) {
      walletProvider.on('accountsChanged', handleAccountsChanged);
      walletProvider.on('chainChanged', handleChainChanged);
    }

    return () => {
      if (walletProvider) {
        walletProvider.removeListener('accountsChanged', handleAccountsChanged);
        walletProvider.removeListener('chainChanged', handleChainChanged);
      }
    };
  }, [walletProvider]);

  // Initial Check for generic window.ethereum
  useEffect(() => {
    if (typeof window.ethereum !== 'undefined' && !walletProvider) {
       // We can optimistically check if generic ethereum is already authorized
       window.ethereum.request({ method: 'eth_accounts' })
        .then((accounts: string[]) => {
          if (accounts.length > 0) {
            setWalletAddress(accounts[0]);
            setWalletProvider(window.ethereum);
          }
        })
        .catch(console.error);
    }
  }, [walletProvider]);

  const openWalletModal = () => {
    setConnectError(null);
    setIsWalletModalOpen(true);
    // Re-trigger discovery just in case
    window.dispatchEvent(new Event('eip6963:requestProvider'));
  };

  const connectWallet = async (provider: EIP1193Provider) => {
    setConnectError(null);
    setIsConnecting(true);

    if (!provider) {
      setConnectError("No wallet provider found. Please install a wallet.");
      setIsConnecting(false);
      return;
    }

    try {
      const accounts = await provider.request({ method: 'eth_requestAccounts' });
      
      if (accounts && accounts.length > 0) {
        setWalletAddress(accounts[0]);
        setWalletProvider(provider);
        setIsWalletModalOpen(false);
      } else {
        throw new Error("No accounts found");
      }
    } catch (error: any) {
      console.error("Connection error:", error);
      
      let errorMessage = "Failed to connect wallet.";
      if (error.code === 4001) {
        errorMessage = "You rejected the connection request.";
      } else if (error.code === -32002) {
        errorMessage = "Request pending. Please check your wallet extension.";
      } else if (error.message) {
        errorMessage = error.message.length > 60 ? "Connection failed" : error.message;
      }
      
      setConnectError(errorMessage);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = () => {
    setWalletAddress(null);
    setWalletProvider(null);
  };

  const handleAddTransaction = (tx: TransactionRecord) => {
    setTransactions(prev => [tx, ...prev]);
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-100 selection:bg-indigo-500/30 font-sans">
      
      <WalletModal 
        isOpen={isWalletModalOpen} 
        onClose={() => setIsWalletModalOpen(false)}
        onConnect={connectWallet}
        isConnecting={isConnecting}
        connectError={connectError}
        detectedProviders={detectedProviders}
      />

      {/* Navbar */}
      <nav className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-gradient-to-tr from-blue-500 to-purple-600 p-2 rounded-lg shadow-lg shadow-blue-500/20">
              <Zap size={20} className="text-white" fill="white" />
            </div>
            <span className="font-bold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
              EtherLink
            </span>
            <span className="hidden sm:block text-[10px] uppercase font-bold tracking-wider bg-slate-800 text-slate-400 px-2 py-0.5 rounded border border-slate-700 ml-2">
              Testnet
            </span>
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={walletAddress ? handleDisconnect : openWalletModal}
              className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium transition-all text-sm relative overflow-hidden group
                ${walletAddress 
                  ? 'bg-slate-800 text-blue-400 border border-blue-500/30 hover:bg-slate-700' 
                  : 'bg-white text-slate-900 hover:bg-indigo-50 hover:shadow-lg hover:shadow-indigo-500/20'
                }`}
            >
              {walletAddress ? (
                <>
                  <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                  <span className="font-mono">{walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}</span>
                  <X size={14} className="ml-1 opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-red-400" />
                </>
              ) : (
                <>
                  <Wallet size={16} />
                  Connect Wallet
                </>
              )}
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 relative">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Bridge & History */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Tabs */}
            <div className="flex space-x-6 border-b border-slate-800 pb-1 px-1">
              <button
                onClick={() => setActiveTab('bridge')}
                className={`pb-3 text-sm font-medium transition-colors relative flex items-center gap-2 ${
                  activeTab === 'bridge' ? 'text-blue-400' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Bridge Assets
                {activeTab === 'bridge' && (
                  <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-500 rounded-t-full shadow-[0_-2px_8px_rgba(59,130,246,0.5)]" />
                )}
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={`pb-3 text-sm font-medium transition-colors relative flex items-center gap-2 ${
                  activeTab === 'history' ? 'text-blue-400' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Transaction History
                {activeTab === 'history' && (
                  <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-500 rounded-t-full shadow-[0_-2px_8px_rgba(59,130,246,0.5)]" />
                )}
              </button>
            </div>

            {activeTab === 'bridge' ? (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <BridgeInterface 
                  isWalletConnected={!!walletAddress}
                  walletProvider={walletProvider}
                  onConnectWallet={openWalletModal}
                  onAddTransaction={handleAddTransaction}
                />
              </div>
            ) : (
              <div className="bg-slate-800 border border-slate-700 rounded-2xl overflow-hidden shadow-xl animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="p-4 border-b border-slate-700 bg-slate-900/50 flex justify-between items-center">
                  <h3 className="font-semibold text-slate-200 flex items-center gap-2">
                    <History size={16} className="text-blue-400" /> Recent Activity
                  </h3>
                  <span className="text-xs text-slate-500">{transactions.length} transactions</span>
                </div>
                {transactions.length === 0 ? (
                  <div className="p-12 text-center text-slate-500 flex flex-col items-center">
                    <div className="bg-slate-700/30 p-4 rounded-full mb-4">
                      <History className="opacity-50" size={32} />
                    </div>
                    <p className="font-medium text-slate-400">No transactions yet</p>
                    <p className="text-xs mt-1">Your bridge history will appear here.</p>
                  </div>
                ) : (
                  <div className="max-h-[500px] overflow-y-auto custom-scrollbar">
                    {transactions.map((tx) => (
                      <div key={tx.id} className="p-4 border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors last:border-0">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center gap-3">
                             <div className="bg-green-500/10 p-2 rounded-lg text-green-400">
                               <Zap size={16} />
                             </div>
                             <div>
                               <div className="font-bold text-slate-200 text-sm flex items-center gap-2">
                                 {tx.amount} {tx.token}
                                 <span className="text-slate-500 font-normal text-xs">from {tx.fromNetwork}</span>
                               </div>
                               <div className="text-slate-400 text-xs mt-0.5">To: {tx.toNetwork}</div>
                             </div>
                          </div>
                          <span className="text-[10px] bg-slate-900 border border-slate-700 text-slate-400 px-2 py-1 rounded-md font-mono">
                            {new Date(tx.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                        
                        {tx.aiMessage && (
                          <div className="mt-2 text-xs text-indigo-300 bg-indigo-500/10 p-2.5 rounded-lg border border-indigo-500/20 flex gap-2 items-start">
                             <Zap size={12} className="shrink-0 mt-0.5 text-indigo-400" />
                             <span>{tx.aiMessage}</span>
                          </div>
                        )}

                        <div className="mt-2 flex items-center gap-2">
                          <a href={`#${tx.hash}`} className="text-[10px] text-blue-400 hover:underline flex items-center gap-1">
                            View on Explorer <ExternalLink size={10} />
                          </a>
                          <span className="text-[10px] text-slate-600">•</span>
                          <span className="text-[10px] text-slate-500">Hash: {tx.hash.slice(0, 12)}...</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Column: Stats & Info */}
          <div className="lg:col-span-5 space-y-6">
            <GasTracker />
            
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 shadow-xl">
              <h3 className="text-lg font-semibold text-slate-200 mb-4 flex items-center gap-2">
                <LayoutGrid size={18} className="text-purple-400" />
                Bridge Statistics
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700/50">
                  <div className="text-slate-500 text-xs uppercase tracking-wider mb-1 font-semibold">Total Volume (24h)</div>
                  <div className="text-2xl font-bold text-white tracking-tight">$14.2M</div>
                </div>
                <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700/50">
                  <div className="text-slate-500 text-xs uppercase tracking-wider mb-1 font-semibold">Successful Txs</div>
                  <div className="text-2xl font-bold text-white tracking-tight">4,291</div>
                </div>
                <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700/50">
                  <div className="text-slate-500 text-xs uppercase tracking-wider mb-1 font-semibold">Avg. Time</div>
                  <div className="text-2xl font-bold text-white tracking-tight">~4 mins</div>
                </div>
                <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700/50">
                  <div className="text-slate-500 text-xs uppercase tracking-wider mb-1 font-semibold">Relayers</div>
                  <div className="text-2xl font-bold text-white tracking-tight">128</div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-indigo-900/80 to-slate-900 border border-indigo-500/30 rounded-xl p-6 relative overflow-hidden group">
               <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                 <LayoutGrid size={120} />
               </div>
               <h3 className="text-lg font-bold text-white mb-4 relative z-10 flex items-center gap-2">
                 Why EtherLink?
               </h3>
               <ul className="space-y-3 relative z-10">
                 <li className="flex gap-3 text-sm text-indigo-100/80">
                   <div className="bg-indigo-500/20 rounded-full p-1 h-fit mt-0.5 border border-indigo-500/40">
                     <Check size={12} className="text-indigo-300"/>
                   </div>
                   Optimized routes via Gemini AI Analysis
                 </li>
                 <li className="flex gap-3 text-sm text-indigo-100/80">
                   <div className="bg-indigo-500/20 rounded-full p-1 h-fit mt-0.5 border border-indigo-500/40">
                      <Check size={12} className="text-indigo-300"/>
                   </div>
                   Instant liquidity on 15+ chains
                 </li>
                 <li className="flex gap-3 text-sm text-indigo-100/80">
                   <div className="bg-indigo-500/20 rounded-full p-1 h-fit mt-0.5 border border-indigo-500/40">
                      <Check size={12} className="text-indigo-300"/>
                   </div>
                   Bank-grade security architecture
                 </li>
               </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;