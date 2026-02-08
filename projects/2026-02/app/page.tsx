'use client';

import { useState, useEffect, useRef } from 'react';
import { 
  Zap, Brain, DollarSign, Users, Shield, Sparkles, Video, 
  Coins, Globe, Rocket, Menu, X, Play, Pause, Volume2, 
  TrendingUp, Cpu, Database, Send, Wallet, CreditCard,
  MessageCircle, BarChart3, TrendingDown, Activity, 
  Percent, Target, ArrowUpDown, CheckCircle, Clock,
  AlertTriangle, Eye, EyeOff, RefreshCw, Filter,
  ShoppingBag, History, ArrowRight, ArrowLeft,
  ExternalLink, LineChart, Battery, Shield as ShieldIcon,
  QrCode, UserPlus, Search, Bell, Settings, LogOut,
  Copy, ChevronRight, Star, Award, TrendingUp as TrendingUpIcon,
  ShoppingCart, Banknote, Receipt, Gift, User, Mail,
  Phone, MapPin, Camera, Edit, Trash2, Heart, Bookmark,
  Share2, Download, Upload, Lock, Unlock, Key,
  HelpCircle, Info, Check, XCircle, Plus, Minus,
  ChevronDown, ChevronUp, Star as StarIcon, Calendar,
  Bell as BellIcon, ShieldCheck, Globe as GlobeIcon,
  Video as VideoIcon, Film, Youtube, Twitch, Instagram,
  Facebook, Twitter, Linkedin, Github, Eye as EyeIcon,
  Hash, AtSign, CreditCard as CardIcon, Smartphone,
  Wifi, Bluetooth, Music, Image, FileText, Link,
  Paperclip, Mic, Headphones, Radio, Tv, Monitor,
  Smartphone as PhoneIcon, Tablet, Laptop, Server,
  HardDrive, Cpu as CpuIcon, MemoryStick, Mouse,
  Keyboard, GamepadIcon, Speaker, Headphones as HeadphonesIcon,
  Smile, AtSign as AtSignIcon, Phone as PhoneIcon2,
  Info as InfoIcon, TrendingUp as TrendingUpIcon2,
  Settings as SettingsIcon, Filter as FilterIcon,
  Target as TargetIcon, Activity as ActivityIcon,
  ShieldCheck as ShieldCheckIcon, Globe as GlobeIcon2,
  Shield as ShieldIcon2, ArrowRight as ArrowRightIcon,
  Percent as PercentIcon, TrendingDown as TrendingDownIcon,
  AlertTriangle as AlertTriangleIcon, Clock as ClockIcon,
  BarChart3 as BarChart3Icon, Zap as ZapIcon, Users as UsersIcon,
  CreditCard as CreditCardIcon, Smartphone as SmartphoneIcon,
  HardDrive as HardDriveIcon, Cpu as CpuIcon2
} from 'lucide-react';

// Types
interface Message {
  id: string;
  sender: string;
  text: string;
  timestamp: Date;
  type: 'text' | 'payment' | 'trade' | 'video' | 'location' | 'file';
  amount?: number;
  status?: 'pending' | 'completed' | 'failed';
  recipient?: string;
  videoUrl?: string;
  location?: { name: string; address: string };
  file?: { name: string; size: string; type: string };
  isRead?: boolean;
}

interface BankCard {
  id: string;
  type: 'visa' | 'mastercard' | 'amex' | 'discover';
  last4: string;
  name: string;
  expiry: string;
  isDefault: boolean;
}

interface Transaction {
  id: string;
  type: 'deposit' | 'withdrawal' | 'send' | 'receive' | 'purchase' | 'trade' | 'subscription';
  amount: number;
  description: string;
  timestamp: Date;
  status: 'completed' | 'pending' | 'failed';
  to?: string;
  from?: string;
  currency: string;
  icon: string;
}

interface TradingPair {
  symbol: string;
  name: string;
  currentPrice: number;
  change24h: number;
  change24hPercent: number;
  volume24h: number;
  marketCap: number;
  category: 'crypto' | 'stocks' | 'forex' | 'nft' | 'defi';
  color: string;
  tags?: string[];
  sponsor?: string;
  description?: string;
}

interface TradeOrder {
  id: string;
  pair: string;
  type: 'buy' | 'sell';
  orderType: 'market' | 'limit' | 'stop';
  amount: number;
  price: number;
  leverage: number;
  status: 'open' | 'filled' | 'cancelled' | 'partial';
  pnl?: number;
  pnlPercent?: number;
  timestamp: Date;
}

interface UserProfile {
  name: string;
  email: string;
  phone: string;
  avatar: string;
  bio: string;
  location: string;
  joinedDate: Date;
  verified: boolean;
  twoFactorEnabled: boolean;
}

interface VideoContent {
  id: string;
  title: string;
  creator: string;
  views: number;
  likes: number;
  duration: string;
  thumbnail: string;
  category: string;
  uploadedAt: Date;
}

export default function Home() {
  // State Management
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [showWallet, setShowWallet] = useState(false);
  const [showTrading, setShowTrading] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showVideos, setShowVideos] = useState(false);
  const [activeWalletTab, setActiveWalletTab] = useState<'overview' | 'cards' | 'transactions'>('overview');
  
  // Chat State
  const [messages, setMessages] = useState<Message[]>([
  { id: '1', sender: 'Alice Johnson', text: 'Hey there! How are you doing today?', timestamp: new Date(Date.now() - 3600000), type: 'text', isRead: true },
  { id: '2', sender: 'You', text: 'I\'m doing great! Just finished setting up this awesome chat.', timestamp: new Date(Date.now() - 3500000), type: 'text', isRead: true },
  { id: '3', sender: 'Bob Smith', text: 'Can you send me $50 for lunch? I\'ll pay you back tomorrow.', timestamp: new Date(Date.now() - 3400000), type: 'payment', amount: 50, status: 'pending', recipient: 'You', isRead: true },
  { id: '4', sender: 'Crypto Trader', text: 'Just made 25% profit on ETH trade! 🚀', timestamp: new Date(Date.now() - 3300000), type: 'trade', isRead: false },
  { id: '5', sender: 'Support', text: 'Your premium subscription has been activated!', timestamp: new Date(Date.now() - 3200000), type: 'payment', amount: 9.99, status: 'completed', isRead: false },
  { id: '6', sender: 'Group Chat', text: 'Welcome to the group! Feel free to share files, locations, and make payments here.', timestamp: new Date(Date.now() - 3100000), type: 'text', isRead: true },
]);
  
  const [newMessage, setNewMessage] = useState('');
  
  // Wallet State
  const [walletBalance, setWalletBalance] = useState(5420.75);
  const [showBalance, setShowBalance] = useState(true);
  const [bankCards, setBankCards] = useState<BankCard[]>([
    { id: '1', type: 'visa', last4: '4242', name: 'John Doe', expiry: '12/25', isDefault: true },
    { id: '2', type: 'mastercard', last4: '8888', name: 'John Doe', expiry: '08/26', isDefault: false },
  ]);
  const [transactions, setTransactions] = useState<Transaction[]>([
    { id: '1', type: 'deposit', amount: 2000, description: 'Bank Transfer from Visa ****4242', timestamp: new Date(Date.now() - 86400000), status: 'completed', currency: 'USD', icon: '🏦' },
    { id: '2', type: 'send', amount: 500, description: 'To Alice Johnson for lunch', timestamp: new Date(Date.now() - 43200000), status: 'completed', to: 'Alice Johnson', currency: 'USD', icon: '👩‍💻' },
    { id: '3', type: 'withdrawal', amount: 1000, description: 'ATM Withdrawal', timestamp: new Date(Date.now() - 21600000), status: 'completed', currency: 'USD', icon: '🏧' },
    { id: '4', type: 'purchase', amount: 89.99, description: 'Amazon Shopping', timestamp: new Date(Date.now() - 10800000), status: 'completed', currency: 'USD', icon: '🛒' },
    { id: '5', type: 'subscription', amount: 9.99, description: 'Netflix Monthly', timestamp: new Date(Date.now() - 3600000), status: 'pending', currency: 'USD', icon: '🎬' },
    { id: '6', type: 'deposit', amount: 1500, description: 'Salary Deposit', timestamp: new Date(Date.now() - 1800000), status: 'completed', currency: 'USD', icon: '💰' },
  ]);
  
  const [depositAmount, setDepositAmount] = useState('100');
  const [withdrawalAmount, setWithdrawalAmount] = useState('100');
  const [sendAmount, setSendAmount] = useState('');
  const [sendTo, setSendTo] = useState('');
  const [showAddCard, setShowAddCard] = useState(false);
  const [newCard, setNewCard] = useState({
    type: 'visa' as 'visa' | 'mastercard' | 'amex' | 'discover',
    number: '',
    name: '',
    expiry: '',
    cvv: ''
  });
  
  // Trading State
  const [tradingPairs, setTradingPairs] = useState<TradingPair[]>([
    { symbol: 'BTC/USD', name: 'Bitcoin', currentPrice: 45128.50, change24h: 1245.30, change24hPercent: 2.84, volume24h: 2845000000, marketCap: 885000000000, category: 'crypto', color: '#F7931A', tags: ['Popular', 'Sponsor'], sponsor: '0G Labs', description: 'Powered by 0G decentralized infrastructure' },
    { symbol: 'ETH/USD', name: 'Ethereum', currentPrice: 2415.75, change24h: 45.25, change24hPercent: 1.91, volume24h: 1548000000, marketCap: 290000000000, category: 'crypto', color: '#627EEA', tags: ['Smart Contracts'], description: 'Ethereum blockchain native token' },
    { symbol: 'SOL/USD', name: 'Solana', currentPrice: 112.48, change24h: 8.52, change24hPercent: 8.19, volume24h: 2850000000, marketCap: 49000000000, category: 'crypto', color: '#00FFA3', tags: ['Fast'], description: 'High-performance blockchain' },
    { symbol: 'NOFA/USD', name: 'NOFA NFT', currentPrice: 25.45, change24h: 5.25, change24hPercent: 26.01, volume24h: 12500000, marketCap: 85000000, category: 'nft', color: '#FF6B8B', tags: ['NFT', 'Hot'], sponsor: 'Visual Agent Studio', description: 'AI-powered NFT creation platform' },
    { symbol: 'OG/USD', name: 'OG Token', currentPrice: 0.85, change24h: 0.15, change24hPercent: 21.43, volume24h: 12500000, marketCap: 85000000, category: 'crypto', color: '#8B5CF6', tags: ['Infrastructure'], sponsor: '0G Labs', description: '0G Labs infrastructure token' },
    { symbol: 'DAI/USD', name: 'DAI Stablecoin', currentPrice: 1.00, change24h: 0.001, change24hPercent: 0.10, volume24h: 85000000, marketCap: 5400000000, category: 'defi', color: '#F4B731', tags: ['Stablecoin'], sponsor: 'MakerDAO', description: 'Decentralized stablecoin by MakerDAO' },
  ]);
  
  const [activePair, setActivePair] = useState<TradingPair>(tradingPairs[0]);
  const [tradeOrders, setTradeOrders] = useState<TradeOrder[]>([
    { id: '1', pair: 'BTC/USD', type: 'buy', orderType: 'market', amount: 0.05, price: 43000, leverage: 5, status: 'open', pnl: 642.5, pnlPercent: 2.99, timestamp: new Date(Date.now() - 7200000) },
    { id: '2', pair: 'ETH/USD', type: 'sell', orderType: 'limit', amount: 0.5, price: 2400, leverage: 3, status: 'filled', pnl: -75.25, pnlPercent: -1.25, timestamp: new Date(Date.now() - 3600000) },
    { id: '3', pair: 'NOFA/USD', type: 'buy', orderType: 'market', amount: 100, price: 24.50, leverage: 1, status: 'filled', pnl: 95.00, pnlPercent: 3.88, timestamp: new Date(Date.now() - 1800000) },
  ]);
  
  const [orderAmount, setOrderAmount] = useState('0.01');
  const [orderPrice, setOrderPrice] = useState('');
  const [orderType, setOrderType] = useState<'market' | 'limit' | 'stop'>('market');
  const [orderSide, setOrderSide] = useState<'buy' | 'sell'>('buy');
  const [selectedLeverage, setSelectedLeverage] = useState(5);
  const [tradingView, setTradingView] = useState<'chart' | 'orders' | 'positions'>('chart');
  const [marketFilters, setMarketFilters] = useState<string[]>(['all']);
  const [isTradingAdvanced, setIsTradingAdvanced] = useState(false);
  const [takeProfit, setTakeProfit] = useState('');
  const [stopLoss, setStopLoss] = useState('');
  
  // Profile State
  const [userProfile, setUserProfile] = useState<UserProfile>({
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '+1 (555) 123-4567',
    avatar: '👨‍💼',
    bio: 'Digital creator & crypto enthusiast. Building the future of web3.',
    location: 'San Francisco, CA',
    joinedDate: new Date('2023-01-15'),
    verified: true,
    twoFactorEnabled: true
  });
  
  // Videos State
  const [videos, setVideos] = useState<VideoContent[]>([
    { id: '1', title: 'How to Trade Crypto for Beginners', creator: 'Crypto University', views: 1250000, likes: 85000, duration: '15:30', thumbnail: '🎬', category: 'Education', uploadedAt: new Date(Date.now() - 86400000) },
    { id: '2', title: 'AI Revolution in 2024', creator: 'Tech Insights', views: 850000, likes: 42000, duration: '22:15', thumbnail: '🤖', category: 'Technology', uploadedAt: new Date(Date.now() - 172800000) },
    { id: '3', title: 'Building Web3 Applications', creator: 'Web3 Academy', views: 320000, likes: 18000, duration: '45:20', thumbnail: '⚡', category: 'Development', uploadedAt: new Date(Date.now() - 259200000) },
    { id: '4', title: 'Trading Strategies That Work', creator: 'Market Masters', views: 950000, likes: 51000, duration: '28:45', thumbnail: '📈', category: 'Finance', uploadedAt: new Date(Date.now() - 345600000) },
  ]);
  
  const [activeVideo, setActiveVideo] = useState<VideoContent>(videos[0]);
  const [videoPlaying, setVideoPlaying] = useState(false);
  const [videoVolume, setVideoVolume] = useState(0.8);
  const [videoProgress, setVideoProgress] = useState(0);
  
  // Toast notification system
  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const toastContainer = document.getElementById('toast-container');
    if (toastContainer) {
      const toast = document.createElement('div');
      toast.className = `bg-gray-800 text-white px-4 py-3 rounded-lg shadow-lg border ${
        type === 'success' ? 'border-green-500' : 
        type === 'error' ? 'border-red-500' : 
        'border-blue-500'
      }`;
      toast.textContent = message;
      
      toastContainer.appendChild(toast);
      toastContainer.classList.remove('hidden');
      
      setTimeout(() => {
        toast.remove();
        if (toastContainer.children.length === 0) {
          toastContainer.classList.add('hidden');
        }
      }, 3000);
    }
  };
  
  // ============ WALLET FUNCTIONS ============
  const handleDeposit = () => {
    const amount = parseFloat(depositAmount);
    if (!amount || amount <= 0) {
      showToast('❌ Please enter valid amount', 'error');
      return;
    }
    
    if (!bankCards.some(card => card.isDefault)) {
      showToast('❌ Please add a payment card first', 'error');
      setShowAddCard(true);
      return;
    }
    
    const defaultCard = bankCards.find(card => card.isDefault);
    const transaction: Transaction = {
      id: Date.now().toString(),
      type: 'deposit',
      amount,
      description: `Deposit from ${defaultCard?.type.toUpperCase()} ****${defaultCard?.last4}`,
      timestamp: new Date(),
      status: 'pending',
      currency: 'USD',
      icon: '💳'
    };
    
    setTransactions([transaction, ...transactions]);
    showToast(`⏳ Processing $${amount} deposit...`, 'info');
    
    // Simulate processing
    setTimeout(() => {
      setWalletBalance(prev => prev + amount);
      transaction.status = 'completed';
      showToast(`✅ $${amount} deposited successfully`, 'success');
    }, 2000);
  };
  
  const handleWithdrawal = () => {
    const amount = parseFloat(withdrawalAmount);
    if (!amount || amount <= 0) {
      showToast('❌ Please enter valid amount', 'error');
      return;
    }
    
    if (amount > walletBalance) {
      showToast('❌ Insufficient funds', 'error');
      return;
    }
    
    if (!bankCards.some(card => card.isDefault)) {
      showToast('❌ Please add a bank card first', 'error');
      setShowAddCard(true);
      return;
    }
    
    const defaultCard = bankCards.find(card => card.isDefault);
    const transaction: Transaction = {
      id: Date.now().toString(),
      type: 'withdrawal',
      amount,
      description: `Withdrawal to ${defaultCard?.type.toUpperCase()} ****${defaultCard?.last4}`,
      timestamp: new Date(),
      status: 'pending',
      currency: 'USD',
      icon: '🏧'
    };
    
    setWalletBalance(prev => prev - amount);
    setTransactions([transaction, ...transactions]);
    showToast(`⏳ Processing $${amount} withdrawal...`, 'info');
    
    // Simulate processing
    setTimeout(() => {
      transaction.status = 'completed';
      showToast(`✅ $${amount} withdrawn successfully`, 'success');
    }, 2000);
  };
  
  const handleSendMoney = () => {
    const amount = parseFloat(sendAmount);
    if (!amount || amount <= 0) {
      showToast('❌ Please enter valid amount', 'error');
      return;
    }
    
    if (amount > walletBalance) {
      showToast('❌ Insufficient funds', 'error');
      return;
    }
    
    if (!sendTo.trim()) {
      showToast('❌ Please enter recipient', 'error');
      return;
    }
    
    const transaction: Transaction = {
      id: Date.now().toString(),
      type: 'send',
      amount,
      description: `To ${sendTo}`,
      timestamp: new Date(),
      status: 'completed',
      to: sendTo,
      currency: 'USD',
      icon: '👤'
    };
    
    setWalletBalance(prev => prev - amount);
    setTransactions([transaction, ...transactions]);
    setSendAmount('');
    setSendTo('');
    
    showToast(`✅ $${amount} sent to ${sendTo}`, 'success');
  };
  
  const handleAddCard = () => {
    if (!newCard.number || !newCard.name || !newCard.expiry || !newCard.cvv) {
      showToast('❌ Please fill all card details', 'error');
      return;
    }
    
    // Simple validation
    if (newCard.number.length < 16) {
      showToast('❌ Please enter valid card number', 'error');
      return;
    }
    
    if (newCard.cvv.length < 3) {
      showToast('❌ Please enter valid CVV', 'error');
      return;
    }
    
    const newCardObj: BankCard = {
      id: Date.now().toString(),
      type: newCard.type,
      last4: newCard.number.slice(-4),
      name: newCard.name,
      expiry: newCard.expiry,
      isDefault: bankCards.length === 0 // First card is default
    };
    
    setBankCards([...bankCards, newCardObj]);
    setNewCard({ type: 'visa', number: '', name: '', expiry: '', cvv: '' });
    setShowAddCard(false);
    
    showToast('✅ Payment card added successfully', 'success');
  };
  
  const handleSetDefaultCard = (cardId: string) => {
    setBankCards(cards => 
      cards.map(card => ({
        ...card,
        isDefault: card.id === cardId
      }))
    );
    showToast('✅ Default card updated', 'success');
  };
  
  const handleRemoveCard = (cardId: string) => {
    if (bankCards.length <= 1) {
      showToast('❌ You must have at least one payment card', 'error');
      return;
    }
    
    setBankCards(cards => cards.filter(card => card.id !== cardId));
    showToast('✅ Card removed successfully', 'success');
  };
  
  // ============ CHAT FUNCTIONS ============
const handleSendMessage = () => {
  if (!newMessage.trim()) return;
  
  const message: Message = {
    id: Date.now().toString(),
    sender: 'You',
    text: newMessage,
    timestamp: new Date(),
    type: 'text',
    isRead: true
  };
  
  setMessages([...messages, message]);
  setNewMessage('');
  
  // Auto-scroll to bottom
  setTimeout(() => {
    const messagesContainer = document.querySelector('.messages-container');
    if (messagesContainer) {
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
  }, 100);
  
  // Simulate AI response
  setTimeout(() => {
    const replies = [
      "Thanks for your message! How can I help you today?",
      "That's interesting! Tell me more about it.",
      "I'll get back to you on that shortly.",
      "Great point! Let me check and get back to you.",
      "Thanks for sharing! Is there anything specific you'd like to discuss?"
    ];
    const reply = replies[Math.floor(Math.random() * replies.length)];
    
    const replyMessage: Message = {
      id: (Date.now() + 1).toString(),
      sender: 'AI Assistant',
      text: reply,
      timestamp: new Date(),
      type: 'text',
      isRead: false
    };
    setMessages(prev => [...prev, replyMessage]);
    
    // Show notification
    showToast('💬 New message from AI Assistant', 'info');
  }, 1500);
};

const handleSendPayment = (amount: number, recipient: string) => {
  if (amount > walletBalance) {
    showToast('❌ Insufficient funds', 'error');
    return;
  }
  
  const paymentMessage: Message = {
    id: Date.now().toString(),
    sender: 'You',
    text: `Sent $${amount} to ${recipient}`,
    timestamp: new Date(),
    type: 'payment',
    amount,
    status: 'completed',
    recipient,
    isRead: true
  };
  
  setWalletBalance(prev => prev - amount);
  setMessages([...messages, paymentMessage]);
  
  // Add transaction
  const transaction: Transaction = {
    id: Date.now().toString(),
    type: 'send',
    amount,
    description: `To ${recipient} via chat`,
    timestamp: new Date(),
    status: 'completed',
    to: recipient,
    currency: 'USD',
    icon: '💸'
  };
  setTransactions([transaction, ...transactions]);
  
  showToast(`✅ $${amount} sent to ${recipient}`, 'success');
  
  // Auto-scroll
  setTimeout(() => {
    const messagesContainer = document.querySelector('.messages-container');
    if (messagesContainer) {
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
  }, 100);
};

const handleSendFile = () => {
  // Simulate file upload
  const fileMessage: Message = {
    id: Date.now().toString(),
    sender: 'You',
    text: 'Check out this file!',
    timestamp: new Date(),
    type: 'file',
    file: {
      name: 'document.pdf',
      size: '2.4 MB',
      type: 'pdf'
    },
    isRead: true
  };
  
  setMessages([...messages, fileMessage]);
  showToast('📁 File shared successfully', 'success');
};

const handleSendLocation = () => {
  const locationMessage: Message = {
    id: Date.now().toString(),
    sender: 'You',
    text: 'Here is my current location',
    timestamp: new Date(),
    type: 'location',
    location: {
      name: 'Coffee Shop',
      address: '123 Main St, San Francisco, CA'
    },
    isRead: true
  };
  
  setMessages([...messages, locationMessage]);
  showToast('📍 Location shared successfully', 'success');
};

const handleSendImage = () => {
  const imageMessage: Message = {
    id: Date.now().toString(),
    sender: 'You',
    text: 'Check out this photo!',
    timestamp: new Date(),
    type: 'file',
    file: {
      name: 'photo.jpg',
      size: '4.2 MB',
      type: 'image'
    },
    isRead: true
  };
  
  setMessages([...messages, imageMessage]);
  showToast('🖼️ Image shared successfully', 'success');
};
  
  // ============ TRADING FUNCTIONS ============
  const placeTradeOrder = () => {
    const amount = parseFloat(orderAmount);
    if (!amount || amount <= 0) {
      showToast('❌ Please enter valid amount', 'error');
      return;
    }
    
    const price = orderType === 'market' ? activePair.currentPrice : parseFloat(orderPrice);
    if (orderType !== 'market' && (!price || price <= 0)) {
      showToast('❌ Please enter valid price', 'error');
      return;
    }
    
    // Calculate total cost
    const totalCost = amount * price * selectedLeverage;
    if (totalCost > walletBalance) {
      showToast('❌ Insufficient funds for this trade', 'error');
      return;
    }
    
    const newOrder: TradeOrder = {
      id: Date.now().toString(),
      pair: activePair.symbol,
      type: orderSide,
      orderType: orderType,
      amount: amount,
      price: price,
      leverage: selectedLeverage,
      status: orderType === 'market' ? 'filled' : 'open',
      timestamp: new Date()
    };
    
    setTradeOrders([newOrder, ...tradeOrders]);
    
    // Add transaction
    const transaction: Transaction = {
      id: Date.now().toString(),
      type: 'trade',
      amount: amount * price,
      description: `${orderSide.toUpperCase()} ${activePair.symbol} (${selectedLeverage}x)`,
      timestamp: new Date(),
      status: 'completed',
      currency: 'USD',
      icon: orderSide === 'buy' ? '📈' : '📉'
    };
    setTransactions([transaction, ...transactions]);
    
    // Update wallet balance
    setWalletBalance(prev => prev - (amount * price));
    
    showToast(`✅ ${orderSide.toUpperCase()} order placed for ${activePair.symbol}`, 'success');
    
    // Reset form
    setOrderAmount('0.01');
    setOrderPrice('');
    setTakeProfit('');
    setStopLoss('');
  };
  
  const cancelOrder = (orderId: string) => {
    setTradeOrders(orders => 
      orders.map(order => 
        order.id === orderId ? { ...order, status: 'cancelled' } : order
      )
    );
    showToast('❌ Order cancelled', 'info');
  };
  
  const closePosition = (orderId: string) => {
    const order = tradeOrders.find(o => o.id === orderId);
    if (order) {
      // Calculate profit/loss
      const currentPrice = activePair.currentPrice;
      const profit = order.type === 'buy' 
        ? (currentPrice - order.price) * order.amount * order.leverage
        : (order.price - currentPrice) * order.amount * order.leverage;
      
      // Update wallet with profit/loss
      setWalletBalance(prev => prev + (order.amount * order.price) + profit);
      
      // Mark as cancelled (closed)
      setTradeOrders(orders => 
        orders.map(o => 
          o.id === orderId ? { ...o, status: 'cancelled', pnl: profit } : o
        )
      );
      
      showToast(`📉 Position closed. P&L: $${profit.toFixed(2)}`, 'info');
    }
  };
  
  // ============ VIDEO FUNCTIONS ============
  const handlePlayVideo = (video: VideoContent) => {
    setActiveVideo(video);
    setVideoPlaying(true);
  };
  
  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 text-white">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 backdrop-blur-md bg-white/5 border-b border-white/10">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  Omni
                </h1>
                <p className="text-xs text-gray-400">All-in-One Platform</p>
              </div>
            </div>

            <div className="hidden md:flex items-center space-x-3">
              {/* Separated Action Buttons */}
              <button 
                onClick={() => setShowChat(true)}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-lg hover:opacity-90 transition-opacity"
              >
                <MessageCircle className="w-5 h-5" />
                <span>Chat</span>
              </button>
              
              <button 
                onClick={() => setShowVideos(true)}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg hover:opacity-90 transition-opacity"
              >
                <VideoIcon className="w-5 h-5" />
                <span>Videos</span>
              </button>
              
              <button 
                onClick={() => setShowWallet(true)}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 rounded-lg hover:opacity-90 transition-opacity"
              >
                <Wallet className="w-5 h-5" />
                <span>Wallet</span>
                {!showBalance && <EyeOff className="w-4 h-4" />}
              </button>
              
              <button 
                onClick={() => setShowTrading(true)}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-600 to-red-600 rounded-lg hover:opacity-90 transition-opacity"
              >
                <BarChart3 className="w-5 h-5" />
                <span>Trade</span>
              </button>
              
              <button 
                onClick={() => setShowProfile(true)}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-gray-600 to-gray-700 rounded-lg hover:opacity-90 transition-opacity"
              >
                <User className="w-5 h-5" />
                <span>Profile</span>
              </button>
            </div>

            <button className="md:hidden p-2" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
          
          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden mt-4 space-y-3 pb-4">
              <button 
                onClick={() => { setShowChat(true); setMobileMenuOpen(false); }}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-lg"
              >
                <MessageCircle className="w-5 h-5" />
                <span>Chat</span>
              </button>
              <button 
                onClick={() => { setShowVideos(true); setMobileMenuOpen(false); }}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg"
              >
                <VideoIcon className="w-5 h-5" />
                <span>Videos</span>
              </button>
              <button 
                onClick={() => { setShowWallet(true); setMobileMenuOpen(false); }}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-600 rounded-lg"
              >
                <Wallet className="w-5 h-5" />
                <span>Wallet</span>
              </button>
              <button 
                onClick={() => { setShowTrading(true); setMobileMenuOpen(false); }}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-orange-600 to-red-600 rounded-lg"
              >
                <BarChart3 className="w-5 h-5" />
                <span>Trade</span>
              </button>
              <button 
                onClick={() => { setShowProfile(true); setMobileMenuOpen(false); }}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-gray-600 to-gray-700 rounded-lg"
              >
                <User className="w-5 h-5" />
                <span>Profile</span>
              </button>
            </div>
          )}
        </div>
      </nav>

      {/* ============ CHAT MODAL ============ */}
      {showChat && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-lg p-4">
          <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-6xl h-[90vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-700">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl">
                  <MessageCircle className="w-8 h-8" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Omni Chat</h2>
                  <p className="text-gray-400">Secure messaging with friends and colleagues</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button className="p-2 hover:bg-gray-800 rounded-lg">
                  <VideoIcon className="w-5 h-5" />
                </button>
                <button className="p-2 hover:bg-gray-800 rounded-lg">
                  <Phone className="w-5 h-5" />
                </button>
                <button 
                  onClick={() => setShowChat(false)}
                  className="p-2 hover:bg-gray-800 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-hidden">
              <div className="grid grid-cols-1 lg:grid-cols-4 h-full">
                {/* Left: Contacts Sidebar */}
                <div className="lg:col-span-1 border-r border-gray-700 overflow-y-auto">
                  <div className="p-4">
                    {/* Search Bar */}
                    <div className="relative mb-6">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search conversations..."
                        className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg"
                      />
                    </div>
                    
                    {/* Chat Categories */}
                    <div className="flex gap-2 mb-6">
                      <button className="px-3 py-2 bg-blue-600/20 text-blue-400 rounded-lg text-sm">
                        All
                      </button>
                      <button className="px-3 py-2 bg-gray-800 rounded-lg text-sm hover:bg-gray-700">
                        Unread
                      </button>
                      <button className="px-3 py-2 bg-gray-800 rounded-lg text-sm hover:bg-gray-700">
                        Groups
                      </button>
                    </div>
                    
                    {/* Contacts List */}
                    <div className="space-y-2">
                      {[
                        { name: 'Alice Johnson', avatar: '👩‍💼', status: 'online', lastMessage: 'Sent a video', time: '2 min ago', unread: 0 },
                        { name: 'Bob Smith', avatar: '👨‍💻', status: 'online', lastMessage: 'Requested $50', time: '1 hour ago', unread: 1 },
                        { name: 'Crypto Trader', avatar: '🤖', status: 'online', lastMessage: '+25% on ETH trade! 🚀', time: '3 hours ago', unread: 2 },
                        { name: 'Support Team', avatar: '🛡️', status: 'away', lastMessage: 'Premium activated', time: 'Yesterday', unread: 0 },
                        { name: 'Trading Group', avatar: '👥', status: 'online', lastMessage: 'Sarah: Check BTC analysis', time: '2 days ago', unread: 0 },
                        { name: 'Family Group', avatar: '🏠', status: 'offline', lastMessage: 'Mom: Dinner tonight?', time: '3 days ago', unread: 3 },
                      ].map((contact, idx) => (
                        <button
                          key={idx}
                          className="w-full p-3 rounded-lg text-left hover:bg-gray-800/50 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div className="relative">
                              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center text-xl">
                                {contact.avatar}
                              </div>
                              <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-gray-900 ${
                                contact.status === 'online' ? 'bg-green-500' :
                                contact.status === 'away' ? 'bg-yellow-500' : 'bg-gray-500'
                              }`}></div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex justify-between items-start">
                                <div className="font-semibold truncate">{contact.name}</div>
                                <div className="text-xs text-gray-400">{contact.time}</div>
                              </div>
                              <div className="flex justify-between items-center">
                                <div className="text-sm text-gray-400 truncate">{contact.lastMessage}</div>
                                {contact.unread > 0 && (
                                  <span className="px-2 py-0.5 bg-blue-600 text-xs rounded-full">
                                    {contact.unread}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                    
                    {/* New Chat Button */}
                    <button className="w-full mt-6 p-3 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-lg hover:opacity-90">
                      <Plus className="w-5 h-5 inline mr-2" />
                      New Chat
                    </button>
                  </div>
                </div>
                
                {/* Center: Chat Messages */}
                <div className="lg:col-span-3 flex flex-col">
                  {/* Chat Header */}
                  <div className="p-4 border-b border-gray-700">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-xl">
                        👥
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-lg">Group Chat</h3>
                        <div className="text-sm text-gray-400 flex items-center gap-2">
                          <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                          4 members online
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button className="p-2 hover:bg-gray-800 rounded-lg">
                          <VideoIcon className="w-5 h-5" />
                        </button>
                        <button className="p-2 hover:bg-gray-800 rounded-lg">
                          <Phone className="w-5 h-5" />
                        </button>
                        <button className="p-2 hover:bg-gray-800 rounded-lg">
                          <Info className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  {/* Messages Container */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-6 messages-container" style={{ maxHeight: 'calc(90vh - 200px)' }}>
                    {/* Date Separator */}
                    <div className="text-center">
                      <span className="px-3 py-1 bg-gray-800 text-gray-400 text-sm rounded-full">
                        Today
                      </span>
                    </div>
                    
                    {/* Messages */}
                    {[
                      {
                        id: '1',
                        sender: { name: 'Alice Johnson', avatar: '👩‍💼', role: 'Admin' },
                        type: 'text',
                        content: 'Hey everyone! Check out this amazing video I found about Web3 development!',
                        time: '10:30 AM',
                        reactions: { '👍': 2, '❤️': 1 }
                      },
                      {
                        id: '2',
                        sender: { name: 'You', avatar: '👨‍💼', role: 'Member' },
                        type: 'text',
                        content: 'Wow, that looks awesome! Thanks for sharing Alice. I\'m currently working on a new DeFi project.',
                        time: '10:32 AM',
                        isOwn: true
                      },
                      {
                        id: '3',
                        sender: { name: 'Bob Smith', avatar: '👨‍💻', role: 'Member' },
                        type: 'payment',
                        content: 'Can someone send me $50 for lunch? I\'ll pay you back tomorrow with interest! 😅',
                        amount: 50,
                        time: '10:35 AM',
                        status: 'pending'
                      },
                      {
                        id: '4',
                        sender: { name: 'Crypto Trader', avatar: '🤖', role: 'Trader' },
                        type: 'trade',
                        content: 'Just made 25% profit on ETH trade! 🚀 Market looking bullish today.',
                        trade: { pair: 'ETH/USD', profit: 25 },
                        time: '10:40 AM',
                        reactions: { '🚀': 3, '📈': 2 }
                      },
                      {
                        id: '5',
                        sender: { name: 'Alice Johnson', avatar: '👩‍💼', role: 'Admin' },
                        type: 'location',
                        content: 'Meetup location for our Web3 conference tomorrow!',
                        location: { name: 'Tech Hub SF', address: '123 Market St, San Francisco' },
                        time: '10:45 AM'
                      },
                      {
                        id: '6',
                        sender: { name: 'You', avatar: '👨‍💼', role: 'Member' },
                        type: 'file',
                        content: 'Here\'s the project documentation I was talking about.',
                        file: { name: 'Project_DeFi_V2.pdf', size: '2.4 MB', type: 'pdf' },
                        time: '10:50 AM',
                        isOwn: true
                      },
                      {
                        id: '7',
                        sender: { name: 'Support', avatar: '🛡️', role: 'Support' },
                        type: 'payment',
                        content: 'Your premium subscription has been activated! Enjoy all features.',
                        amount: 9.99,
                        time: '10:55 AM',
                        status: 'completed'
                      },
                    ].map((message) => (
                      <div
                        key={message.id}
                        className={`flex gap-3 ${message.isOwn ? 'flex-row-reverse' : ''}`}
                      >
                        {/* Avatar */}
                        {!message.isOwn && (
                          <div className="flex-shrink-0">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center">
                              {message.sender.avatar}
                            </div>
                          </div>
                        )}
                        
                        {/* Message Content */}
                        <div className={`max-w-[70%] ${message.isOwn ? 'text-right' : ''}`}>
                          {/* Sender Info */}
                          {!message.isOwn && (
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-bold">{message.sender.name}</span>
                              {message.sender.role && (
                                <span className="px-2 py-0.5 bg-blue-600/20 text-blue-400 text-xs rounded">
                                  {message.sender.role}
                                </span>
                              )}
                              <span className="text-xs text-gray-400">{message.time}</span>
                            </div>
                          )}
                          
                          {/* Message Bubble */}
                          <div className={`rounded-2xl p-4 ${
                            message.isOwn 
                              ? 'bg-gradient-to-r from-blue-600/20 to-cyan-600/20 border border-blue-500/30' 
                              : 'bg-gray-800/50'
                          }`}>
                            {/* Text Message */}
                            {message.type === 'text' && (
                              <p className="text-gray-100">{message.content}</p>
                            )}
                            
                            {/* Payment Message */}
                            {message.type === 'payment' && (
                              <div className="space-y-3">
                                <div className="p-3 bg-gradient-to-r from-green-600/20 to-emerald-600/20 rounded-lg">
                                  <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                      <CreditCard className="w-5 h-5 text-green-400" />
                                      <span className="font-bold">Payment Request</span>
                                    </div>
                                    <div className="text-lg font-bold">${message.amount}</div>
                                  </div>
                                  <div className={`text-sm ${
                                    message.status === 'completed' ? 'text-green-400' :
                                    message.status === 'pending' ? 'text-yellow-400' : 'text-gray-400'
                                  }`}>
                                    Status: {message.status ? message.status.charAt(0).toUpperCase() + message.status.slice(1) : 'Unknown'}
                                  </div>
                                  {!message.isOwn && message.status === 'pending' && (
                                    <div className="flex gap-2 mt-3">
                                      <button
                                        onClick={() => handleSendPayment(message.amount!, message.sender.name)}
                                        className="flex-1 py-2 bg-gradient-to-r from-green-600 to-emerald-600 rounded-lg hover:opacity-90"
                                      >
                                        Send
                                      </button>
                                      <button className="flex-1 py-2 bg-gray-700 rounded-lg hover:bg-gray-600">
                                        Decline
                                      </button>
                                    </div>
                                  )}
                                </div>
                                <p className="text-gray-100">{message.content}</p>
                              </div>
                            )}
                            
                            {/* Trade Message */}
                            {message.type === 'trade' && (
                              <div className="space-y-3">
                                <div className="p-3 bg-gradient-to-r from-orange-600/20 to-red-600/20 rounded-lg">
                                  <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                      <TrendingUp className="w-5 h-5 text-orange-400" />
                                      <span className="font-bold">Trade Alert</span>
                                    </div>
                                    <div className={`text-lg font-bold ${message.trade!.profit > 0 ? 'text-green-400' : 'text-red-400'}`}>
                                      +{message.trade!.profit}%
                                    </div>
                                  </div>
                                  <div className="text-sm text-gray-300">
                                    Pair: {message.trade!.pair} • Profit: +${(message.amount || 0) * (message.trade!.profit || 0) / 100}
                                  </div>
                                  <button 
                                    onClick={() => { setShowTrading(true); setActivePair(tradingPairs[1]); }}
                                    className="w-full mt-3 py-2 bg-gradient-to-r from-orange-600 to-red-600 rounded-lg hover:opacity-90"
                                  >
                                    Trade Now
                                  </button>
                                </div>
                                <p className="text-gray-100">{message.content}</p>
                              </div>
                            )}
                            
                            {/* Location Message */}
                            {message.type === 'location' && (
                              <div className="space-y-3">
                                <div className="p-3 bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-lg">
                                  <div className="flex items-center gap-2 mb-2">
                                    <MapPin className="w-5 h-5 text-purple-400" />
                                    <span className="font-bold">Location Shared</span>
                                  </div>
                                  <div>
                                    <div className="font-medium">{message.location!.name}</div>
                                    <div className="text-sm text-gray-300">{message.location!.address}</div>
                                  </div>
                                  <div className="mt-3 aspect-video bg-gradient-to-br from-gray-900 to-black rounded-lg flex items-center justify-center">
                                    <MapPin className="w-8 h-8 text-purple-400" />
                                  </div>
                                  <div className="flex gap-2 mt-3">
                                    <button className="flex-1 py-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg hover:opacity-90">
                                      Open Map
                                    </button>
                                    <button className="flex-1 py-2 bg-gray-700 rounded-lg hover:bg-gray-600">
                                      Save
                                    </button>
                                  </div>
                                </div>
                                <p className="text-gray-100">{message.content}</p>
                              </div>
                            )}
                            
                            {/* File Message */}
                            {message.type === 'file' && (
                              <div className="space-y-3">
                                <div className="p-3 bg-gradient-to-r from-gray-600/20 to-gray-700/20 rounded-lg">
                                  <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-lg bg-gray-700 flex items-center justify-center">
                                      <FileText className="w-6 h-6" />
                                    </div>
                                    <div className="flex-1">
                                      <div className="font-medium truncate">{message.file!.name}</div>
                                      <div className="text-sm text-gray-400">{message.file!.size} • {message.file!.type.toUpperCase()}</div>
                                    </div>
                                    <button className="p-2 hover:bg-gray-600 rounded-lg">
                                      <Download className="w-5 h-5" />
                                    </button>
                                  </div>
                                  <div className="flex gap-2 mt-3">
                                    <button className="flex-1 py-2 bg-gray-700 rounded-lg hover:bg-gray-600">
                                      Preview
                                    </button>
                                    <button className="flex-1 py-2 bg-blue-600/20 text-blue-400 rounded-lg hover:bg-blue-600/30">
                                      Save to Drive
                                    </button>
                                  </div>
                                </div>
                                <p className="text-gray-100">{message.content}</p>
                              </div>
                            )}
                          </div>
                          
                          {/* Reactions */}
                          {message.reactions && (
                            <div className={`flex gap-1 mt-2 ${message.isOwn ? 'justify-end' : ''}`}>
                              {Object.entries(message.reactions).map(([emoji, count]) => (
                                <button
                                  key={emoji}
                                  className="px-2 py-1 bg-gray-800 rounded-lg text-sm hover:bg-gray-700"
                                >
                                  {emoji} {count}
                                </button>
                              ))}
                              <button className="px-2 py-1 bg-gray-800 rounded-lg text-sm hover:bg-gray-700">
                                <Plus className="w-3 h-3 inline" />
                              </button>
                            </div>
                          )}
                          
                          {/* Time for own messages */}
                          {message.isOwn && (
                            <div className="text-xs text-gray-400 mt-1">{message.time}</div>
                          )}
                        </div>
                      </div>
                    ))}
                    
                    {/* Typing Indicator */}
                    <div className="flex gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center">
                        👩‍💼
                      </div>
                      <div className="bg-gray-800/50 rounded-2xl p-4">
                        <div className="flex gap-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse delay-75"></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse delay-150"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Message Input */}
                  <div className="border-t border-gray-700 p-4">
                    {/* Message Actions */}
                    <div className="flex items-center gap-2 mb-3">
                      <button className="p-2 hover:bg-gray-800 rounded-lg">
                        <Plus className="w-5 h-5" />
                      </button>
                      <div className="flex-1 flex gap-1 overflow-x-auto">
                        {[
                          { icon: Image, label: 'Photo', color: 'from-purple-600 to-pink-600' },
                          { icon: Camera, label: 'Camera', color: 'from-blue-600 to-cyan-600' },
                          { icon: FileText, label: 'File', color: 'from-green-600 to-emerald-600' },
                          { icon: CreditCard, label: 'Payment', color: 'from-yellow-600 to-orange-600' },
                          { icon: MapPin, label: 'Location', color: 'from-red-600 to-pink-600' },
                          { icon: VideoIcon, label: 'Video', color: 'from-indigo-600 to-purple-600' },
                          { icon: Mic, label: 'Voice', color: 'from-teal-600 to-cyan-600' },
                        ].map((action, idx) => (
                          <button
                            key={idx}
                            className="flex-shrink-0 px-3 py-2 bg-gray-800 rounded-lg hover:bg-gray-700 flex items-center gap-2"
                          >
                            <div className={`w-8 h-8 rounded-lg bg-gradient-to-r ${action.color} flex items-center justify-center`}>
                              <action.icon className="w-4 h-4" />
                            </div>
                            <span className="text-sm">{action.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    {/* Input Area */}
                    <div className="flex gap-3">
                      <button className="p-3 hover:bg-gray-800 rounded-lg">
                        <Smile className="w-5 h-5" />
                      </button>
                      <div className="flex-1 relative">
                        <textarea
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          placeholder="Type your message..."
                          className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg resize-none"
                          rows={1}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              handleSendMessage();
                            }
                          }}
                        />
                        <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex gap-1">
                          <button className="p-1 hover:bg-gray-700 rounded">
                            <Paperclip className="w-4 h-4" />
                          </button>
                          <button className="p-1 hover:bg-gray-700 rounded">
                            <AtSignIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button className="p-3 hover:bg-gray-800 rounded-lg">
                          <Mic className="w-5 h-5" />
                        </button>
                        <button
                          onClick={handleSendMessage}
                          disabled={!newMessage.trim()}
                          className="p-3 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Send className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                    
                    {/* Quick Actions */}
                    <div className="flex gap-2 mt-3">
                      <button className="px-3 py-1.5 bg-gray-800 rounded-lg hover:bg-gray-700 text-sm">
                        <DollarSign className="w-3 h-3 inline mr-1" />
                        Quick Pay
                      </button>
                      <button 
                        onClick={() => { setShowChat(false); setShowTrading(true); }}
                        className="px-3 py-1.5 bg-gray-800 rounded-lg hover:bg-gray-700 text-sm"
                      >
                        <BarChart3 className="w-3 h-3 inline mr-1" />
                        Share Trade
                      </button>
                      <button className="px-3 py-1.5 bg-gray-800 rounded-lg hover:bg-gray-700 text-sm">
                        <VideoIcon className="w-3 h-3 inline mr-1" />
                        Video Clip
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============ TRADING MODAL ============ */}
      {showTrading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-lg p-4">
          <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-7xl h-[90vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-700">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-to-r from-orange-600 to-red-600 rounded-xl">
                  <BarChart3 className="w-8 h-8" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Omni Trading</h2>
                  <p className="text-gray-400">Trade crypto, stocks, and forex with advanced tools</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className="text-sm text-gray-400">Available Balance</div>
                  <div className="text-xl font-bold">${walletBalance.toFixed(2)}</div>
                </div>
                <button className="p-2 hover:bg-gray-800 rounded-lg">
                  <RefreshCw className="w-5 h-5" />
                </button>
                <button 
                  onClick={() => setShowTrading(false)}
                  className="p-2 hover:bg-gray-800 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-hidden">
              <div className="grid grid-cols-1 lg:grid-cols-4 h-full">
                {/* Left: Markets & Portfolio */}
                <div className="lg:col-span-1 border-r border-gray-700 overflow-y-auto">
                  <div className="p-4">
                    {/* Trading View Tabs */}
                    <div className="flex gap-2 mb-6">
                      <button
                        onClick={() => setTradingView('chart')}
                        className={`flex-1 py-2 rounded-lg ${tradingView === 'chart' ? 'bg-gradient-to-r from-orange-600 to-red-600' : 'bg-gray-800 hover:bg-gray-700'}`}
                      >
                        Chart
                      </button>
                      <button
                        onClick={() => setTradingView('orders')}
                        className={`flex-1 py-2 rounded-lg ${tradingView === 'orders' ? 'bg-gradient-to-r from-orange-600 to-red-600' : 'bg-gray-800 hover:bg-gray-700'}`}
                      >
                        Orders
                      </button>
                      <button
                        onClick={() => setTradingView('positions')}
                        className={`flex-1 py-2 rounded-lg ${tradingView === 'positions' ? 'bg-gradient-to-r from-orange-600 to-red-600' : 'bg-gray-800 hover:bg-gray-700'}`}
                      >
                        Positions
                      </button>
                    </div>
                    
                    {/* Market Filters */}
                    <div className="flex flex-wrap gap-2 mb-6">
                      <button
                        onClick={() => setMarketFilters(['all'])}
                        className={`px-3 py-1.5 rounded-lg text-sm ${marketFilters.includes('all') ? 'bg-gradient-to-r from-orange-600 to-red-600' : 'bg-gray-800 hover:bg-gray-700'}`}
                      >
                        All
                      </button>
                      <button
                        onClick={() => setMarketFilters(['crypto'])}
                        className={`px-3 py-1.5 rounded-lg text-sm ${marketFilters.includes('crypto') ? 'bg-gradient-to-r from-orange-600 to-red-600' : 'bg-gray-800 hover:bg-gray-700'}`}
                      >
                        Crypto
                      </button>
                      <button
                        onClick={() => setMarketFilters(['nft'])}
                        className={`px-3 py-1.5 rounded-lg text-sm ${marketFilters.includes('nft') ? 'bg-gradient-to-r from-orange-600 to-red-600' : 'bg-gray-800 hover:bg-gray-700'}`}
                      >
                        NFT
                      </button>
                      <button
                        onClick={() => setMarketFilters(['defi'])}
                        className={`px-3 py-1.5 rounded-lg text-sm ${marketFilters.includes('defi') ? 'bg-gradient-to-r from-orange-600 to-red-600' : 'bg-gray-800 hover:bg-gray-700'}`}
                      >
                        DeFi
                      </button>
                    </div>
                    
                    {/* Market List */}
                    <div className="space-y-2">
                      {tradingPairs
                        .filter(pair => marketFilters.includes('all') || marketFilters.includes(pair.category))
                        .map((pair) => (
                          <button
                            key={pair.symbol}
                            onClick={() => setActivePair(pair)}
                            className={`w-full p-3 rounded-lg text-left hover:bg-gray-800/50 transition-all ${
                              activePair.symbol === pair.symbol 
                                ? 'bg-gradient-to-r from-orange-600/20 to-red-600/20 border border-orange-500/30 scale-[1.02]' 
                                : ''
                            }`}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-3">
                                <div 
                                  className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
                                  style={{ backgroundColor: pair.color }}
                                >
                                  {pair.symbol.split('/')[0].charAt(0)}
                                </div>
                                <div>
                                  <div className="font-bold">{pair.symbol}</div>
                                  <div className="text-sm text-gray-400">{pair.name}</div>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="font-bold">${pair.currentPrice.toLocaleString()}</div>
                                <div className={`text-sm ${pair.change24hPercent >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                  {pair.change24hPercent >= 0 ? '+' : ''}{pair.change24hPercent.toFixed(2)}%
                                </div>
                              </div>
                            </div>
                            
                            {/* Tags and Sponsor */}
                            <div className="flex items-center justify-between">
                              <div className="flex gap-1">
                                {pair.tags?.map((tag, idx) => (
                                  <span key={idx} className="px-2 py-0.5 bg-gray-800 text-xs rounded">
                                    {tag}
                                  </span>
                                ))}
                              </div>
                              {pair.sponsor && (
                                <span className="px-2 py-0.5 bg-purple-600/20 text-purple-400 text-xs rounded">
                                  {pair.sponsor}
                                </span>
                              )}
                            </div>
                            
                            {/* Volume */}
                            <div className="mt-2 text-xs text-gray-400">
                              24h Vol: ${(pair.volume24h / 1000000).toFixed(1)}M
                            </div>
                          </button>
                        ))}
                    </div>
                    
                    {/* Portfolio Summary */}
                    <div className="mt-8 p-4 bg-gradient-to-r from-gray-800/30 to-gray-900/30 rounded-xl">
                      <h4 className="font-bold mb-4">Portfolio Summary</h4>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Total Value</span>
                          <span className="font-bold">$12,542.50</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">24h Change</span>
                          <span className="text-green-400 font-bold">+$542.20 (+4.32%)</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Open Positions</span>
                          <span className="font-bold">3</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Total P&L</span>
                          <span className="text-green-400 font-bold">+$662.25</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Center: Main Trading Area */}
                <div className="lg:col-span-3 flex flex-col">
                  {/* Trading Header */}
                  <div className="p-4 border-b border-gray-700">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <div 
                          className="w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold"
                          style={{ backgroundColor: activePair.color }}
                        >
                          {activePair.symbol.split('/')[0].charAt(0)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-2xl font-bold">{activePair.name} ({activePair.symbol})</h3>
                            {activePair.sponsor && (
                              <span className="px-2 py-1 bg-gradient-to-r from-purple-600 to-pink-600 text-xs rounded-full">
                                Sponsored by {activePair.sponsor}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-4 text-sm">
                            <span className="text-green-400 text-lg font-bold">${activePair.currentPrice.toLocaleString()}</span>
                            <span className={`${activePair.change24hPercent >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                              {activePair.change24hPercent >= 0 ? '↗' : '↘'} {activePair.change24hPercent >= 0 ? '+' : ''}{activePair.change24hPercent.toFixed(2)}% (${Math.abs(activePair.change24h).toLocaleString()})
                            </span>
                            <span className="text-gray-400">24h High: ${(activePair.currentPrice * 1.05).toLocaleString()}</span>
                            <span className="text-gray-400">24h Low: ${(activePair.currentPrice * 0.95).toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <button className="px-4 py-2 bg-gray-800 rounded-lg hover:bg-gray-700">
                          <Share2 className="w-4 h-4 inline mr-2" />
                          Share
                        </button>
                        <button className="px-4 py-2 bg-gray-800 rounded-lg hover:bg-gray-700">
                          <Star className="w-4 h-4 inline mr-2" />
                          Watchlist
                        </button>
                      </div>
                    </div>
                    
                    {/* Pair Description */}
                    {activePair.description && (
                      <div className="text-sm text-gray-300">
                        {activePair.description}
                      </div>
                    )}
                  </div>
                  
                  {/* Trading Chart */}
                  <div className="flex-1 p-4">
                    {tradingView === 'chart' && (
                      <div className="h-full flex flex-col">
                        {/* Chart Controls */}
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex gap-2">
                            {['1D', '1W', '1M', '3M', '1Y', 'ALL'].map((timeframe) => (
                              <button
                                key={timeframe}
                                className="px-3 py-1.5 bg-gray-800 rounded-lg hover:bg-gray-700"
                              >
                                {timeframe}
                              </button>
                            ))}
                          </div>
                          <div className="flex gap-2">
                                    
                                    
                          </div>
                        </div>
                        
                        {/* Chart Container */}
                        <div className="flex-1 bg-gradient-to-br from-gray-900 to-black border border-gray-700 rounded-xl p-4">
                          <div className="h-full flex flex-col">
                            {/* Chart Header */}
                            <div className="flex items-center justify-between mb-4">
                              <div>
                                <div className="text-3xl font-bold">${activePair.currentPrice.toLocaleString()}</div>
                                <div className={`text-lg ${activePair.change24hPercent >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                  {activePair.change24hPercent >= 0 ? '+' : ''}{activePair.change24hPercent.toFixed(2)}% today
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-sm text-gray-400">Market Cap</div>
                                <div className="font-bold">${(activePair.marketCap / 1000000000).toFixed(1)}B</div>
                              </div>
                            </div>
                            
                            {/* Chart Visualization */}
                            <div className="flex-1 relative">
                              {/* Price Line */}
                              <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-full h-px bg-gradient-to-r from-transparent via-gray-700 to-transparent"></div>
                              </div>
                              
                              {/* Candlestick Chart Placeholder */}
                              <div className="h-48 flex items-center justify-center">
                                <div className="text-center">
                                  <LineChart className="w-16 h-16 mx-auto mb-4 text-gray-600" />
                                  <p className="text-gray-400">Interactive Trading Chart</p>
                                  <p className="text-sm text-gray-500 mt-2">Real-time price action with technical indicators</p>
                                </div>
                              </div>
                              
                              {/* Technical Indicators */}
                              <div className="grid grid-cols-4 gap-4 mt-8">
                                <div className="p-3 bg-gray-800/30 rounded-lg">
                                  <div className="text-sm text-gray-400">RSI</div>
                                  <div className={`text-lg font-bold ${56 > 70 ? 'text-red-400' : 56 < 30 ? 'text-green-400' : 'text-gray-300'}`}>
                                    56.2
                                  </div>
                                </div>
                                <div className="p-3 bg-gray-800/30 rounded-lg">
                                  <div className="text-sm text-gray-400">MACD</div>
                                  <div className="text-lg font-bold text-green-400">+12.5</div>
                                </div>
                                <div className="p-3 bg-gray-800/30 rounded-lg">
                                  <div className="text-sm text-gray-400">Volume</div>
                                  <div className="text-lg font-bold">${(activePair.volume24h / 1000000).toFixed(0)}M</div>
                                </div>
                                
                                <div className="p-3 bg-gray-800/30 rounded-lg">
                                  <div className="text-sm text-gray-400">Support</div>
                                  <div className="text-lg font-bold">${(activePair.currentPrice * 0.95).toFixed(0)}</div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* Orders View */}
                    {tradingView === 'orders' && (
                      <div className="h-full">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-xl font-bold">Active Orders</h3>
                          <button className="px-4 py-2 bg-gradient-to-r from-orange-600 to-red-600 rounded-lg hover:opacity-90">
                            <Plus className="w-4 h-4 inline mr-2" />
                            New Order
                          </button>
                        </div>
                        
                        <div className="overflow-y-auto max-h-[500px]">
                          <div className="grid grid-cols-5 gap-4 p-4 bg-gray-800/30 rounded-t-lg font-bold">
                            <div>Pair</div>
                            <div>Type</div>
                            <div>Amount</div>
                            <div>Price</div>
                            <div>Action</div>
                          </div>
                          
                          {tradeOrders
                            .filter(order => order.status === 'open' || order.status === 'partial')
                            .map((order) => (
                              <div key={order.id} className="grid grid-cols-5 gap-4 p-4 border-b border-gray-700 hover:bg-gray-800/20">
                                <div className="font-medium">{order.pair}</div>
                                <div>
                                  <span className={`px-2 py-1 rounded text-xs ${
                                    order.type === 'buy' ? 'bg-green-600/20 text-green-400' : 'bg-red-600/20 text-red-400'
                                  }`}>
                                    {order.type.toUpperCase()}
                                  </span>
                                </div>
                                <div>{order.amount}</div>
                                <div>${order.price.toLocaleString()}</div>
                                <div>
                                  <button
                                    onClick={() => cancelOrder(order.id)}
                                    className="px-3 py-1 bg-red-600/20 text-red-400 rounded-lg hover:bg-red-600/30"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              </div>
                            ))}
                          
                          {tradeOrders.filter(order => order.status === 'open' || order.status === 'partial').length === 0 && (
                            <div className="text-center py-8 text-gray-400">
                              No active orders
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                    
                    {/* Positions View */}
                    {tradingView === 'positions' && (
                      <div className="h-full">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-xl font-bold">Open Positions</h3>
                          <span className="px-3 py-1 bg-gradient-to-r from-green-600 to-emerald-600 rounded-lg">
                            Total P&L: +$662.25
                          </span>
                        </div>
                        
                        <div className="overflow-y-auto max-h-[500px]">
                          <div className="grid grid-cols-6 gap-4 p-4 bg-gray-800/30 rounded-t-lg font-bold">
                            <div>Pair</div>
                            <div>Side</div>
                            <div>Size</div>
                            <div>Entry Price</div>
                            <div>P&L</div>
                            <div>Action</div>
                          </div>
                          
                          {tradeOrders
                            .filter(order => order.status === 'filled')
                            .map((order) => (
                              <div key={order.id} className="grid grid-cols-6 gap-4 p-4 border-b border-gray-700 hover:bg-gray-800/20">
                                <div className="font-medium">{order.pair}</div>
                                <div>
                                  <span className={`px-2 py-1 rounded text-xs ${
                                    order.type === 'buy' ? 'bg-green-600/20 text-green-400' : 'bg-red-600/20 text-red-400'
                                  }`}>
                                    {order.type.toUpperCase()}
                                  </span>
                                </div>
                                <div>{order.amount}</div>
                                <div>${order.price.toLocaleString()}</div>
                                <div className={`font-bold ${(order.pnl || 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                  ${order.pnl?.toFixed(2)} ({order.pnlPercent?.toFixed(2)}%)
                                </div>
                                <div>
                                  <button
                                    onClick={() => closePosition(order.id)}
                                    className="px-3 py-1 bg-gradient-to-r from-orange-600 to-red-600 rounded-lg hover:opacity-90"
                                  >
                                    Close
                                  </button>
                                </div>
                              </div>
                            ))}
                          
                          {tradeOrders.filter(order => order.status === 'filled').length === 0 && (
                            <div className="text-center py-8 text-gray-400">
                              No open positions
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Trading Form */}
                  <div className="border-t border-gray-700 p-4">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      {/* Order Form */}
                      <div className="lg:col-span-2">
                        <div className="bg-gradient-to-br from-gray-800/30 to-gray-900/30 border border-gray-700 rounded-xl p-6">
                          <div className="flex items-center justify-between mb-6">
                            <h4 className="text-lg font-bold">Place Order</h4>
                            <button
                              onClick={() => setIsTradingAdvanced(!isTradingAdvanced)}
                              className="text-sm text-blue-400 hover:text-blue-300"
                            >
                              {isTradingAdvanced ? '← Simple Mode' : 'Advanced Mode →'}
                            </button>
                          </div>
                          
                          <div className="space-y-6">
                            {/* Order Side Selection */}
                            <div className="grid grid-cols-2 gap-4">
                              <button
                                onClick={() => setOrderSide('buy')}
                                className={`p-4 rounded-xl border-2 transition-all ${
                                  orderSide === 'buy'
                                    ? 'border-green-500 bg-green-600/10'
                                    : 'border-gray-700 hover:border-green-500/50'
                                }`}
                              >
                                <div className="text-center">
                                  <div className="text-2xl font-bold text-green-400">BUY</div>
                                  <div className="text-sm text-gray-400 mt-1">Long Position</div>
                                </div>
                              </button>
                              <button
                                onClick={() => setOrderSide('sell')}
                                className={`p-4 rounded-xl border-2 transition-all ${
                                  orderSide === 'sell'
                                    ? 'border-red-500 bg-red-600/10'
                                    : 'border-gray-700 hover:border-red-500/50'
                                }`}
                              >
                                <div className="text-center">
                                  <div className="text-2xl font-bold text-red-400">SELL</div>
                                  <div className="text-sm text-gray-400 mt-1">Short Position</div>
                                </div>
                              </button>
                            </div>
                            
                            {/* Order Type Selection */}
                            <div>
                              <label className="block text-sm font-medium mb-3">Order Type</label>
                              <div className="grid grid-cols-3 gap-3">
                                {[
                                  { type: 'market', label: 'Market', desc: 'Instant execution' },
                                  { type: 'limit', label: 'Limit', desc: 'Set your price' },
                                  { type: 'stop', label: 'Stop', desc: 'Trigger order' },
                                ].map((type) => (
                                  <button
                                    key={type.type}
                                    onClick={() => setOrderType(type.type as any)}
                                    className={`p-3 rounded-lg border text-left ${
                                      orderType === type.type
                                        ? 'border-orange-500 bg-gradient-to-r from-orange-600/10 to-red-600/10'
                                        : 'border-gray-700 hover:bg-gray-800'
                                    }`}
                                  >
                                    <div className="font-bold">{type.label}</div>
                                    <div className="text-xs text-gray-400">{type.desc}</div>
                                  </button>
                                ))}
                              </div>
                            </div>
                            
                            {/* Amount Input */}
                            <div>
                              <div className="flex justify-between items-center mb-2">
                                <label className="text-sm font-medium">Amount ({activePair.symbol.split('/')[0]})</label>
                                <span className="text-sm text-gray-400">
                                  Balance: ${walletBalance.toFixed(2)}
                                </span>
                              </div>
                              <input
                                type="number"
                                value={orderAmount}
                                onChange={(e) => setOrderAmount(e.target.value)}
                                className="w-full p-4 bg-gray-900 border border-gray-700 rounded-lg text-xl"
                                min="0.0001"
                                step="0.0001"
                              />
                              <div className="flex gap-2 mt-2">
                                {[0.1, 0.25, 0.5, 1, 5].map((percent) => (
                                  <button
                                    key={percent}
                                    onClick={() => {
                                      const maxAmount = walletBalance / (activePair.currentPrice * selectedLeverage);
                                      setOrderAmount((maxAmount * percent / 100).toFixed(4));
                                    }}
                                    className="px-3 py-1.5 bg-gray-800 rounded-lg hover:bg-gray-700"
                                  >
                                    {percent}%
                                  </button>
                                ))}
                                <button
                                  onClick={() => {
                                    const maxAmount = walletBalance / (activePair.currentPrice * selectedLeverage);
                                    setOrderAmount(maxAmount.toFixed(4));
                                  }}
                                  className="px-3 py-1.5 bg-gradient-to-r from-orange-600 to-red-600 rounded-lg hover:opacity-90"
                                >
                                  Max
                                </button>
                              </div>
                            </div>
                            
                            {/* Price Input for Limit/Stop Orders */}
                            {orderType !== 'market' && (
                              <div>
                                <label className="block text-sm font-medium mb-2">Price (USD)</label>
                                <input
                                  type="number"
                                  value={orderPrice}
                                  onChange={(e) => setOrderPrice(e.target.value)}
                                  className="w-full p-3 bg-gray-900 border border-gray-700 rounded-lg"
                                  min="0.01"
                                  step="0.01"
                                  placeholder={`Current: $${activePair.currentPrice}`}
                                />
                              </div>
                            )}
                            
                            {/* Leverage Selection */}
                            <div>
                              <label className="block text-sm font-medium mb-3">Leverage</label>
                              <div className="flex flex-wrap gap-2">
                                {[1, 3, 5, 10, 25, 50].map((leverage) => (
                                  <button
                                    key={leverage}
                                    onClick={() => setSelectedLeverage(leverage)}
                                    className={`px-4 py-2 rounded-lg ${
                                      selectedLeverage === leverage
                                        ? 'bg-gradient-to-r from-orange-600 to-red-600 font-bold'
                                        : 'bg-gray-800 hover:bg-gray-700'
                                    }`}
                                  >
                                    {leverage}x
                                  </button>
                                ))}
                                <button className="px-4 py-2 bg-gray-800 rounded-lg hover:bg-gray-700">
                                  Custom
                                </button>
                              </div>
                            </div>
                            
                            {/* Advanced Options */}
                            {isTradingAdvanced && (
                              <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <label className="block text-sm font-medium mb-2">Take Profit</label>
                                    <input
                                      type="number"
                                      value={takeProfit}
                                      onChange={(e) => setTakeProfit(e.target.value)}
                                      className="w-full p-3 bg-gray-900 border border-gray-700 rounded-lg"
                                      placeholder="Profit target"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-sm font-medium mb-2">Stop Loss</label>
                                    <input
                                      type="number"
                                      value={stopLoss}
                                      onChange={(e) => setStopLoss(e.target.value)}
                                      className="w-full p-3 bg-gray-900 border border-gray-700 rounded-lg"
                                      placeholder="Risk limit"
                                    />
                                  </div>
                                </div>
                              </div>
                            )}
                            
                            {/* Order Summary */}
                            <div className="bg-gray-800/50 rounded-xl p-4 space-y-3">
                              <div className="flex justify-between">
                                <span className="text-gray-400">Total Cost</span>
                                <span className="font-bold">
                                  ${(parseFloat(orderAmount || '0') * activePair.currentPrice * selectedLeverage).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-400">Fees (0.1%)</span>
                                <span className="text-gray-300">
                                  ${(parseFloat(orderAmount || '0') * activePair.currentPrice * 0.001).toFixed(2)}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-400">Liquidation Price</span>
                                <span className="text-red-400">
                                  ${(activePair.currentPrice * (1 - 0.9 / selectedLeverage)).toFixed(2)}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-400">Estimated P&L (10%)</span>
                                <span className="text-green-400">
                                  ${(parseFloat(orderAmount || '0') * activePair.currentPrice * selectedLeverage * 0.1).toFixed(2)}
                                </span>
                              </div>
                            </div>
                            
                            {/* Place Order Button */}
                            <button
                              onClick={placeTradeOrder}
                              className={`w-full py-4 text-xl font-bold rounded-xl ${
                                orderSide === 'buy'
                                  ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:opacity-90'
                                  : 'bg-gradient-to-r from-red-600 to-orange-600 hover:opacity-90'
                              }`}
                            >
                              {orderSide === 'buy' ? 'BUY' : 'SELL'} {activePair.symbol}
                            </button>
                          </div>
                        </div>
                      </div>
                      
                      {/* Order Book & Recent Trades */}
                      <div className="space-y-6">
                        {/* Order Book */}
                        <div className="bg-gradient-to-br from-gray-800/30 to-gray-900/30 border border-gray-700 rounded-xl p-4">
                          <h4 className="font-bold mb-4">Order Book</h4>
                          <div className="space-y-2">
                            {/* Bids */}
                            <div className="space-y-1">
                              <div className="text-xs text-gray-400">Bids (Buy)</div>
                              {[45128.50, 45125.75, 45122.30, 45120.15, 45118.90].map((price, idx) => (
                                <div key={idx} className="flex justify-between items-center">
                                  <div className="text-sm">{price.toLocaleString()}</div>
                                  <div className="text-sm text-gray-400">
                                    {(Math.random() * 10).toFixed(2)} BTC
                                  </div>
                                </div>
                              ))}
                            </div>
                            
                            {/* Market Price */}
                            <div className="text-center my-2">
                              <div className="text-lg font-bold">${activePair.currentPrice.toLocaleString()}</div>
                              <div className="text-xs text-gray-400">Market Price</div>
                            </div>
                            
                            {/* Asks */}
                            <div className="space-y-1">
                              <div className="text-xs text-gray-400">Asks (Sell)</div>
                              {[45130.25, 45132.80, 45135.45, 45138.20, 45140.95].map((price, idx) => (
                                <div key={idx} className="flex justify-between items-center">
                                  <div className="text-sm">{price.toLocaleString()}</div>
                                  <div className="text-sm text-gray-400">
                                    {(Math.random() * 10).toFixed(2)} BTC
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                        
                        {/* Recent Trades */}
                        <div className="bg-gradient-to-br from-gray-800/30 to-gray-900/30 border border-gray-700 rounded-xl p-4">
                          <h4 className="font-bold mb-4">Recent Trades</h4>
                          <div className="space-y-2">
                            {[
                              { time: '12:30:45', price: 45128.50, amount: 0.25, type: 'buy' },
                              { time: '12:30:42', price: 45127.80, amount: 1.50, type: 'sell' },
                              { time: '12:30:39', price: 45129.20, amount: 0.75, type: 'buy' },
                              { time: '12:30:35', price: 45126.45, amount: 2.25, type: 'sell' },
                              { time: '12:30:30', price: 45130.10, amount: 0.50, type: 'buy' },
                            ].map((trade, idx) => (
                              <div key={idx} className="flex justify-between items-center">
                                <div className="text-xs text-gray-400">{trade.time}</div>
                                <div className={`text-sm ${trade.type === 'buy' ? 'text-green-400' : 'text-red-400'}`}>
                                  {trade.price.toLocaleString()}
                                </div>
                                <div className="text-sm">{trade.amount}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============ WALLET MODAL ============ */}
      {showWallet && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-lg p-4">
          <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-5xl h-[90vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-700">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl">
                  <Wallet className="w-8 h-8" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Omni Wallet</h2>
                  <p className="text-gray-400">Manage your finances securely</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setShowBalance(!showBalance)}
                  className="p-2 hover:bg-gray-800 rounded-lg"
                  title={showBalance ? "Hide Balance" : "Show Balance"}
                >
                  {showBalance ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
                <button className="p-2 hover:bg-gray-800 rounded-lg">
                  <QrCode className="w-5 h-5" />
                </button>
                <button className="p-2 hover:bg-gray-800 rounded-lg">
                  <Settings className="w-5 h-5" />
                </button>
                <button 
                  onClick={() => setShowWallet(false)}
                  className="p-2 hover:bg-gray-800 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Wallet Tabs */}
            <div className="flex border-b border-gray-700">
              <button
                onClick={() => setActiveWalletTab('overview')}
                className={`flex-1 py-4 font-semibold ${activeWalletTab === 'overview' ? 'border-b-2 border-green-500' : 'text-gray-400'}`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveWalletTab('cards')}
                className={`flex-1 py-4 font-semibold ${activeWalletTab === 'cards' ? 'border-b-2 border-green-500' : 'text-gray-400'}`}
              >
                Payment Cards
              </button>
              <button
                onClick={() => setActiveWalletTab('transactions')}
                className={`flex-1 py-4 font-semibold ${activeWalletTab === 'transactions' ? 'border-b-2 border-green-500' : 'text-gray-400'}`}
              >
                Transactions
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              {/* Overview Tab */}
              {activeWalletTab === 'overview' && (
                <div className="p-6">
                  {/* Balance Card */}
                  <div className="bg-gradient-to-r from-green-900/30 to-emerald-900/30 border border-green-500/30 rounded-2xl p-6 mb-8">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-bold">Total Balance</h3>
                        <p className="text-gray-400">Available to spend or invest</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-1 bg-green-600/20 text-green-400 text-xs rounded">USD</span>
                        <button className="p-1 hover:bg-white/10 rounded">
                          <RefreshCw className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div className="mb-6">
                      <div className="text-5xl font-bold mb-2">
                        ${showBalance ? walletBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '••••••'}
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <span className="text-green-400">+$542.20 this month</span>
                        <span className="text-gray-400">≈ 0.12 BTC</span>
                      </div>
                    </div>
                  </div>

                  {/* Deposit & Withdrawal Cards */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    {/* Deposit Card */}
                    <div className="bg-gradient-to-br from-blue-900/20 to-cyan-900/20 border border-blue-500/30 rounded-xl p-5">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-lg font-bold">Deposit Funds</h4>
                        <CreditCard className="w-6 h-6 text-blue-400" />
                      </div>
                      <p className="text-gray-300 mb-4">Add money to your wallet using your saved cards</p>
                      
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium mb-2">Amount ($)</label>
                          <input
                            type="number"
                            value={depositAmount}
                            onChange={(e) => setDepositAmount(e.target.value)}
                            className="w-full p-3 bg-gray-900 border border-gray-700 rounded-lg"
                            min="1"
                            step="1"
                          />
                        </div>
                        
                        {/* Quick Amount Buttons */}
                        <div className="flex gap-2">
                          {[50, 100, 200, 500].map(amount => (
                            <button
                              key={amount}
                              onClick={() => setDepositAmount(amount.toString())}
                              className="px-3 py-2 bg-gray-800 rounded-lg hover:bg-gray-700"
                            >
                              ${amount}
                            </button>
                          ))}
                        </div>
                        
                        {/* Default Card Info */}
                        <div className="bg-gray-800/50 rounded-lg p-3">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-gray-400">Default Card</span>
                            <button 
                              onClick={() => setActiveWalletTab('cards')}
                              className="text-sm text-blue-400 hover:text-blue-300"
                            >
                              Change
                            </button>
                          </div>
                          {bankCards.find(card => card.isDefault) ? (
                            <div className="flex items-center gap-3">
                              <div className={`w-10 h-7 rounded flex items-center justify-center ${
                                bankCards.find(card => card.isDefault)?.type === 'visa' ? 'bg-blue-600' :
                                bankCards.find(card => card.isDefault)?.type === 'mastercard' ? 'bg-red-600' :
                                'bg-green-600'
                              }`}>
                                <span className="text-xs font-bold">
                                  {bankCards.find(card => card.isDefault)?.type === 'visa' ? 'VISA' :
                                   bankCards.find(card => card.isDefault)?.type === 'mastercard' ? 'MC' : 'AMEX'}
                                </span>
                              </div>
                              <div>
                                <div className="font-medium">**** {bankCards.find(card => card.isDefault)?.last4}</div>
                                <div className="text-sm text-gray-400">{bankCards.find(card => card.isDefault)?.expiry}</div>
                              </div>
                            </div>
                          ) : (
                            <div className="text-center py-2">
                              <p className="text-yellow-400">No payment card added</p>
                              <button 
                                onClick={() => { setActiveWalletTab('cards'); setShowAddCard(true); }}
                                className="text-sm text-blue-400 hover:text-blue-300"
                              >
                                Add a card
                              </button>
                            </div>
                          )}
                        </div>
                        
                        <button
                          onClick={handleDeposit}
                          disabled={!bankCards.find(card => card.isDefault)}
                          className="w-full p-3 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-lg font-bold hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Deposit ${depositAmount || '0'}
                        </button>
                      </div>
                    </div>
                    
                    {/* Withdrawal Card */}
                    <div className="bg-gradient-to-br from-purple-900/20 to-pink-900/20 border border-purple-500/30 rounded-xl p-5">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-lg font-bold">Withdraw Funds</h4>
                        <Banknote className="w-6 h-6 text-purple-400" />
                      </div>
                      <p className="text-gray-300 mb-4">Withdraw money to your saved bank cards</p>
                      
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium mb-2">Amount ($)</label>
                          <input
                            type="number"
                            value={withdrawalAmount}
                            onChange={(e) => setWithdrawalAmount(e.target.value)}
                            className="w-full p-3 bg-gray-900 border border-gray-700 rounded-lg"
                            min="1"
                            max={walletBalance}
                            step="1"
                          />
                        </div>
                        
                        {/* Quick Amount Buttons */}
                        <div className="flex gap-2">
                          {[50, 100, 200, 500].map(amount => (
                            <button
                              key={amount}
                              onClick={() => setWithdrawalAmount(Math.min(amount, walletBalance).toString())}
                              className="px-3 py-2 bg-gray-800 rounded-lg hover:bg-gray-700"
                            >
                              ${Math.min(amount, walletBalance)}
                            </button>
                          ))}
                        </div>
                        
                        {/* Max Withdrawal Info */}
                        <div className="bg-gray-800/50 rounded-lg p-3">
                          <div className="flex justify-between mb-1">
                            <span className="text-sm text-gray-400">Available Balance</span>
                            <span className="font-medium">${walletBalance.toFixed(2)}</span>
                          </div>
                          <div className="text-sm text-gray-400">
                            Maximum withdrawal: ${walletBalance.toFixed(2)}
                          </div>
                        </div>
                        
                        <button
                          onClick={handleWithdrawal}
                          disabled={!bankCards.find(card => card.isDefault)}
                          className="w-full p-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg font-bold hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Withdraw ${withdrawalAmount || '0'}
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  {/* Send Money Form */}
                  <div className="bg-gradient-to-br from-green-900/20 to-emerald-900/20 border border-green-500/30 rounded-xl p-5">
                    <h4 className="text-lg font-bold mb-4">Send Money</h4>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-2">Amount ($)</label>
                          <input
                            type="number"
                            value={sendAmount}
                            onChange={(e) => setSendAmount(e.target.value)}
                            placeholder="0.00"
                            className="w-full p-3 bg-gray-900 border border-gray-700 rounded-lg"
                            min="0.01"
                            step="0.01"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">To (Email or Phone)</label>
                          <input
                            type="text"
                            value={sendTo}
                            onChange={(e) => setSendTo(e.target.value)}
                            placeholder="recipient@example.com"
                            className="w-full p-3 bg-gray-900 border border-gray-700 rounded-lg"
                          />
                        </div>
                      </div>
                      
                      {/* Quick Send Buttons */}
                      <div className="flex gap-2">
                        {[10, 25, 50, 100].map(amount => (
                          <button
                            key={amount}
                            onClick={() => setSendAmount(amount.toString())}
                            className="px-3 py-2 bg-gray-800 rounded-lg hover:bg-gray-700"
                          >
                            ${amount}
                          </button>
                        ))}
                      </div>
                      
                      <button
                        onClick={handleSendMoney}
                        className="w-full p-3 bg-gradient-to-r from-green-600 to-emerald-600 rounded-lg font-bold hover:opacity-90"
                      >
                        Send Money Now
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Cards Tab */}
              {activeWalletTab === 'cards' && (
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold">Payment Cards</h3>
                    <button
                      onClick={() => setShowAddCard(true)}
                      className="px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 rounded-lg hover:opacity-90"
                    >
                      <Plus className="w-4 h-4 inline mr-2" />
                      Add New Card
                    </button>
                  </div>
                  
                  {/* Add Card Modal */}
                  {showAddCard && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
                      <div className="bg-gray-800 border border-gray-700 rounded-2xl w-full max-w-md p-6">
                        <div className="flex items-center justify-between mb-6">
                          <h4 className="text-xl font-bold">Add Payment Card</h4>
                          <button onClick={() => setShowAddCard(false)} className="p-2 hover:bg-gray-700 rounded-lg">
                            <X className="w-5 h-5" />
                          </button>
                        </div>
                        
                        <div className="space-y-4">
                          {/* Card Type Selection */}
                          <div>
                            <label className="block text-sm font-medium mb-2">Card Type</label>
                            <div className="grid grid-cols-4 gap-2">
                              {['visa', 'mastercard', 'amex', 'discover'].map(type => (
                                <button
                                  key={type}
                                  onClick={() => setNewCard({...newCard, type: type as any})}
                                  className={`p-3 rounded-lg border ${
                                    newCard.type === type 
                                      ? 'border-green-500 bg-green-500/10' 
                                      : 'border-gray-700 hover:bg-gray-700'
                                  }`}
                                >
                                  <div className={`w-8 h-5 mx-auto rounded flex items-center justify-center ${
                                    type === 'visa' ? 'bg-blue-600' :
                                    type === 'mastercard' ? 'bg-red-600' :
                                    type === 'amex' ? 'bg-green-600' : 'bg-orange-600'
                                  }`}>
                                    <span className="text-xs font-bold">
                                      {type === 'visa' ? 'VISA' :
                                       type === 'mastercard' ? 'MC' :
                                       type === 'amex' ? 'AMEX' : 'DISC'}
                                    </span>
                                  </div>
                                </button>
                              ))}
                            </div>
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium mb-2">Card Number</label>
                            <input
                              type="text"
                              value={newCard.number}
                              onChange={(e) => setNewCard({...newCard, number: e.target.value.replace(/\D/g, '')})}
                              placeholder="4242 4242 4242 4242"
                              maxLength={16}
                              className="w-full p-3 bg-gray-900 border border-gray-700 rounded-lg"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium mb-2">Cardholder Name</label>
                            <input
                              type="text"
                              value={newCard.name}
                              onChange={(e) => setNewCard({...newCard, name: e.target.value})}
                              placeholder="John Doe"
                              className="w-full p-3 bg-gray-900 border border-gray-700 rounded-lg"
                            />
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium mb-2">Expiry Date</label>
                              <input
                                type="text"
                                value={newCard.expiry}
                                onChange={(e) => setNewCard({...newCard, expiry: e.target.value})}
                                placeholder="MM/YY"
                                className="w-full p-3 bg-gray-900 border border-gray-700 rounded-lg"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium mb-2">CVV</label>
                              <input
                                type="text"
                                value={newCard.cvv}
                                onChange={(e) => setNewCard({...newCard, cvv: e.target.value.replace(/\D/g, '')})}
                                placeholder="123"
                                maxLength={4}
                                className="w-full p-3 bg-gray-900 border border-gray-700 rounded-lg"
                              />
                            </div>
                          </div>
                          
                          <div className="flex gap-3 mt-6">
                            <button
                              onClick={handleAddCard}
                              className="flex-1 p-3 bg-gradient-to-r from-green-600 to-emerald-600 rounded-lg font-bold hover:opacity-90"
                            >
                              Add Card
                            </button>
                            <button
                              onClick={() => setShowAddCard(false)}
                              className="flex-1 p-3 bg-gray-700 rounded-lg font-bold hover:bg-gray-600"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Cards List */}
                  <div className="space-y-4">
                    {bankCards.map(card => (
                      <div key={card.id} className={`bg-gradient-to-r ${
                        card.isDefault 
                          ? 'from-green-900/30 to-emerald-900/30 border-2 border-green-500/50' 
                          : 'from-gray-800/30 to-gray-900/30 border border-gray-700'
                      } rounded-xl p-5`}>
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-4">
                            <div className={`w-12 h-8 rounded flex items-center justify-center ${
                              card.type === 'visa' ? 'bg-blue-600' :
                              card.type === 'mastercard' ? 'bg-red-600' :
                              card.type === 'amex' ? 'bg-green-600' : 'bg-orange-600'
                            }`}>
                              <span className="text-sm font-bold">
                                {card.type === 'visa' ? 'VISA' :
                                 card.type === 'mastercard' ? 'MC' :
                                 card.type === 'amex' ? 'AMEX' : 'DISC'}
                              </span>
                            </div>
                            <div>
                              <div className="font-bold">**** {card.last4}</div>
                              <div className="text-sm text-gray-400">{card.name} • Expires {card.expiry}</div>
                            </div>
                          </div>
                          {card.isDefault && (
                            <span className="px-3 py-1 bg-green-600/20 text-green-400 text-sm rounded-full">
                              Default
                            </span>
                          )}
                        </div>
                        
                        <div className="flex gap-3">
                          {!card.isDefault && (
                            <button
                              onClick={() => handleSetDefaultCard(card.id)}
                              className="px-4 py-2 bg-gray-700 rounded-lg hover:bg-gray-600"
                            >
                              Set as Default
                            </button>
                          )}
                          <button
                            onClick={() => handleRemoveCard(card.id)}
                            className="px-4 py-2 bg-red-600/20 text-red-400 rounded-lg hover:bg-red-600/30"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ))}
                    
                    {bankCards.length === 0 && (
                      <div className="text-center py-12">
                        <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gray-800 flex items-center justify-center">
                          <CreditCard className="w-10 h-10 text-gray-400" />
                        </div>
                        <h4 className="text-xl font-bold mb-2">No Payment Cards</h4>
                        <p className="text-gray-400 mb-6">Add a payment card to deposit or withdraw funds</p>
                        <button
                          onClick={() => setShowAddCard(true)}
                          className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 rounded-lg font-bold hover:opacity-90"
                        >
                          Add Your First Card
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Transactions Tab */}
              {activeWalletTab === 'transactions' && (
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold">Transaction History</h3>
                    <div className="flex items-center gap-3">
                      <button className="px-3 py-1.5 bg-gray-800 rounded-lg hover:bg-gray-700">
                        <Filter className="w-4 h-4 inline mr-2" />
                        Filter
                      </button>
                      <button className="px-3 py-1.5 bg-gray-800 rounded-lg hover:bg-gray-700">
                        <Download className="w-4 h-4 inline mr-2" />
                        Export
                      </button>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    {transactions.map((tx) => (
                      <div key={tx.id} className="p-4 bg-gray-800/30 rounded-xl hover:bg-gray-800/50 transition-colors">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-gray-700 flex items-center justify-center text-2xl">
                              {tx.icon}
                            </div>
                            <div>
                              <div className="font-semibold">{tx.description}</div>
                              <div className="text-sm text-gray-400">
                                {tx.timestamp.toLocaleDateString()} • {tx.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className={`text-lg font-bold ${
                              tx.type === 'deposit' || tx.type === 'receive' ? 'text-green-400' : 'text-red-400'
                            }`}>
                              {tx.type === 'deposit' || tx.type === 'receive' ? '+' : '-'}${tx.amount.toFixed(2)}
                            </div>
                            <div className={`text-sm ${
                              tx.status === 'completed' ? 'text-green-400' :
                              tx.status === 'pending' ? 'text-yellow-400' : 'text-red-400'
                            }`}>
                              {tx.status.charAt(0).toUpperCase() + tx.status.slice(1)}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ============ VIDEOS MODAL ============ */}
      {showVideos && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-lg p-4">
          <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-6xl h-[90vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-700">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl">
                  <VideoIcon className="w-8 h-8" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Omni Videos</h2>
                  <p className="text-gray-400">Watch and discover amazing content</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button className="p-2 hover:bg-gray-800 rounded-lg">
                  <Search className="w-5 h-5" />
                </button>
                <button className="p-2 hover:bg-gray-800 rounded-lg">
                  <Settings className="w-5 h-5" />
                </button>
                <button 
                  onClick={() => setShowVideos(false)}
                  className="p-2 hover:bg-gray-800 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-hidden">
              <div className="grid grid-cols-1 lg:grid-cols-3 h-full">
                {/* Left: Video List */}
                <div className="lg:col-span-1 border-r border-gray-700 overflow-y-auto">
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-bold">Recommended Videos</h3>
                      <span className="text-xs text-gray-400">{videos.length} videos</span>
                    </div>
                    
                    <div className="space-y-3">
                      {videos.map(video => (
                        <button
                          key={video.id}
                          onClick={() => handlePlayVideo(video)}
                          className={`w-full p-3 rounded-lg text-left hover:bg-gray-800/50 transition-colors ${
                            activeVideo.id === video.id ? 'bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/30' : ''
                          }`}
                        >
                          <div className="flex items-center gap-3 mb-2">
                            <div className="w-12 h-12 rounded-lg bg-gray-700 flex items-center justify-center text-2xl">
                              {video.thumbnail}
                            </div>
                            <div className="flex-1">
                              <div className="font-semibold line-clamp-1">{video.title}</div>
                              <div className="text-sm text-gray-400">{video.creator}</div>
                            </div>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-3">
                              <span className="text-gray-400">{formatNumber(video.views)} views</span>
                              <span className="text-gray-400">{video.duration}</span>
                            </div>
                            <span className="px-2 py-0.5 bg-gray-800 rounded text-xs">{video.category}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                
                {/* Right: Video Player */}
                <div className="lg:col-span-2 p-6">
                  <div className="bg-gradient-to-br from-purple-900/20 to-pink-900/20 border border-purple-500/30 rounded-2xl overflow-hidden mb-6">
                    {/* Video Player Placeholder */}
                    <div className="aspect-video bg-gradient-to-br from-gray-900 to-black flex items-center justify-center relative">
                      <div className="text-center">
                        <div className="text-6xl mb-4">{activeVideo.thumbnail}</div>
                        <h3 className="text-2xl font-bold mb-2">{activeVideo.title}</h3>
                        <p className="text-gray-400">by {activeVideo.creator}</p>
                      </div>
                      
                      {/* Video Controls */}
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-4">
                        <div className="flex items-center justify-between">
                          <button
                            onClick={() => setVideoPlaying(!videoPlaying)}
                            className="p-3 bg-white/20 rounded-full hover:bg-white/30"
                          >
                            {videoPlaying ? (
                              <Pause className="w-6 h-6" />
                            ) : (
                              <Play className="w-6 h-6" />
                            )}
                          </button>
                          
                          {/* Progress Bar */}
                          <div className="flex-1 mx-4">
                            <div className="h-1 bg-gray-600 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                                style={{ width: `${videoProgress}%` }}
                              />
                            </div>
                            <div className="flex justify-between text-xs text-gray-400 mt-1">
                              <span>0:00</span>
                              <span>{activeVideo.duration}</span>
                            </div>
                          </div>
                          
                          {/* Volume Control */}
                          <div className="flex items-center gap-2">
                            <Volume2 className="w-5 h-5" />
                            <input
                              type="range"
                              min="0"
                              max="1"
                              step="0.1"
                              value={videoVolume}
                              onChange={(e) => setVideoVolume(parseFloat(e.target.value))}
                              className="w-24 accent-purple-500"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Video Info */}
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-2xl font-bold mb-3">{activeVideo.title}</h3>
                      <div className="flex items-center gap-4 text-sm text-gray-400 mb-4">
                        <span>{formatNumber(activeVideo.views)} views</span>
                        <span>•</span>
                        <span>{activeVideo.uploadedAt.toLocaleDateString()}</span>
                        <span>•</span>
                        <span className="px-2 py-1 bg-purple-600/20 text-purple-400 rounded">{activeVideo.category}</span>
                      </div>
                      <p className="text-gray-300">
                        {activeVideo.creator} presents: {activeVideo.title}. This video covers everything you need to know about the topic. Watch till the end for amazing insights!
                      </p>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex items-center gap-4">
                      <button className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg hover:opacity-90">
                        <Heart className="w-4 h-4 inline mr-2" />
                        {formatNumber(activeVideo.likes)} Likes
                      </button>
                      <button className="px-4 py-2 bg-gray-800 rounded-lg hover:bg-gray-700">
                        <Share2 className="w-4 h-4 inline mr-2" />
                        Share
                      </button>
                      <button className="px-4 py-2 bg-gray-800 rounded-lg hover:bg-gray-700">
                        <Bookmark className="w-4 h-4 inline mr-2" />
                        Save
                      </button>
                      <button className="px-4 py-2 bg-gray-800 rounded-lg hover:bg-gray-700">
                        <Download className="w-4 h-4 inline mr-2" />
                        Download
                      </button>
                    </div>
                    
                    {/* Creator Info */}
                    <div className="bg-gray-800/30 rounded-xl p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center">
                          <User className="w-6 h-6" />
                        </div>
                        <div>
                          <div className="font-bold">{activeVideo.creator}</div>
                          <div className="text-sm text-gray-400">1.2M subscribers • 245 videos</div>
                        </div>
                        <button className="ml-auto px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 rounded-lg hover:opacity-90">
                          Subscribe
                        </button>
                      </div>
                      <p className="text-gray-300 text-sm">
                        Professional content creator sharing knowledge about technology, finance, and digital innovation.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============ PROFILE MODAL ============ */}
      {showProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-lg p-4">
          <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-4xl h-[90vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-700">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-to-r from-gray-600 to-gray-700 rounded-xl">
                  <User className="w-8 h-8" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">My Profile</h2>
                  <p className="text-gray-400">Manage your account and settings</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button className="p-2 hover:bg-gray-800 rounded-lg">
                  <Settings className="w-5 h-5" />
                </button>
                <button 
                  onClick={() => setShowProfile(false)}
                  className="p-2 hover:bg-gray-800 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              <div className="p-6">
                {/* Profile Header */}
                <div className="bg-gradient-to-r from-gray-800/30 to-gray-900/30 border border-gray-700 rounded-2xl p-6 mb-8">
                  <div className="flex items-center gap-6 mb-6">
                    <div className="relative">
                      <div className="w-24 h-24 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center text-4xl">
                        {userProfile.avatar}
                      </div>
                      <button className="absolute bottom-0 right-0 p-2 bg-gray-800 rounded-full hover:bg-gray-700">
                        <Camera className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-2xl font-bold">{userProfile.name}</h3>
                        {userProfile.verified && (
                          <span className="px-2 py-1 bg-green-600/20 text-green-400 text-xs rounded-full flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" />
                            Verified
                          </span>
                        )}
                      </div>
                      <p className="text-gray-400 mb-3">{userProfile.bio}</p>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="flex items-center gap-1">
                          <Mail className="w-4 h-4" />
                          {userProfile.email}
                        </span>
                        <span className="flex items-center gap-1">
                          <Phone className="w-4 h-4" />
                          {userProfile.phone}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {userProfile.location}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-3 bg-black/20 rounded-xl">
                      <div className="text-lg font-bold">42</div>
                      <div className="text-sm text-gray-400">Friends</div>
                    </div>
                    <div className="text-center p-3 bg-black/20 rounded-xl">
                      <div className="text-lg font-bold">128</div>
                      <div className="text-sm text-gray-400">Videos</div>
                    </div>
                    <div className="text-center p-3 bg-black/20 rounded-xl">
                      <div className="text-lg font-bold">1.2K</div>
                      <div className="text-sm text-gray-400">Followers</div>
                    </div>
                    <div className="text-center p-3 bg-black/20 rounded-xl">
                      <div className="text-lg font-bold">245</div>
                      <div className="text-sm text-gray-400">Following</div>
                    </div>
                  </div>
                </div>
                
                {/* Account Settings */}
                <div className="space-y-6">
                  <div>
                    <h4 className="text-lg font-bold mb-4">Account Settings</h4>
                    <div className="space-y-3">
                      <div className="p-4 bg-gray-800/30 rounded-xl">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium">Email Address</div>
                            <div className="text-sm text-gray-400">{userProfile.email}</div>
                          </div>
                          <button className="px-3 py-1 bg-gray-700 rounded-lg hover:bg-gray-600">
                            Change
                          </button>
                        </div>
                      </div>
                      
                      <div className="p-4 bg-gray-800/30 rounded-xl">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium">Phone Number</div>
                            <div className="text-sm text-gray-400">{userProfile.phone}</div>
                          </div>
                          <button className="px-3 py-1 bg-gray-700 rounded-lg hover:bg-gray-600">
                            Change
                          </button>
                        </div>
                      </div>
                      
                      <div className="p-4 bg-gray-800/30 rounded-xl">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium">Two-Factor Authentication</div>
                            <div className="text-sm text-gray-400">Add extra security to your account</div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className={`px-2 py-1 rounded text-sm ${
                              userProfile.twoFactorEnabled 
                                ? 'bg-green-600/20 text-green-400' 
                                : 'bg-red-600/20 text-red-400'
                            }`}>
                              {userProfile.twoFactorEnabled ? 'ON' : 'OFF'}
                            </span>
                            <button className="px-3 py-1 bg-gray-700 rounded-lg hover:bg-gray-600">
                              {userProfile.twoFactorEnabled ? 'Disable' : 'Enable'}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Security */}
                  <div>
                    <h4 className="text-lg font-bold mb-4">Security</h4>
                    <div className="space-y-3">
                      <button className="w-full p-4 bg-gray-800/30 rounded-xl text-left hover:bg-gray-800/50">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Lock className="w-5 h-5 text-blue-400" />
                            <div>
                              <div className="font-medium">Change Password</div>
                              <div className="text-sm text-gray-400">Update your password regularly</div>
                            </div>
                          </div>
                          <ChevronRight className="w-5 h-5 text-gray-400" />
                        </div>
                      </button>
                      
                      <button className="w-full p-4 bg-gray-800/30 rounded-xl text-left hover:bg-gray-800/50">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <ShieldCheck className="w-5 h-5 text-green-400" />
                            <div>
                              <div className="font-medium">Privacy Settings</div>
                              <div className="text-sm text-gray-400">Control your privacy and data</div>
                            </div>
                          </div>
                          <ChevronRight className="w-5 h-5 text-gray-400" />
                        </div>
                      </button>
                      
                      <button className="w-full p-4 bg-gray-800/30 rounded-xl text-left hover:bg-gray-800/50">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <BellIcon className="w-5 h-5 text-yellow-400" />
                            <div>
                              <div className="font-medium">Notification Settings</div>
                              <div className="text-sm text-gray-400">Manage your notifications</div>
                            </div>
                          </div>
                          <ChevronRight className="w-5 h-5 text-gray-400" />
                        </div>
                      </button>
                    </div>
                  </div>
                  
                  {/* App Settings */}
                  <div>
                    <h4 className="text-lg font-bold mb-4">App Settings</h4>
                    <div className="space-y-3">
                      <button 
                        onClick={() => { setShowProfile(false); setShowWallet(true); }}
                        className="w-full p-4 bg-gray-800/30 rounded-xl text-left hover:bg-gray-800/50"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Wallet className="w-5 h-5 text-green-400" />
                            <div>
                              <div className="font-medium">Wallet Settings</div>
                              <div className="text-sm text-gray-400">Manage payment methods and limits</div>
                            </div>
                          </div>
                          <ChevronRight className="w-5 h-5 text-gray-400" />
                        </div>
                      </button>
                      
                      <button 
                        onClick={() => { setShowProfile(false); setShowTrading(true); }}
                        className="w-full p-4 bg-gray-800/30 rounded-xl text-left hover:bg-gray-800/50"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <BarChart3 className="w-5 h-5 text-orange-400" />
                            <div>
                              <div className="font-medium">Trading Preferences</div>
                              <div className="text-sm text-gray-400">Set up your trading parameters</div>
                            </div>
                          </div>
                          <ChevronRight className="w-5 h-5 text-gray-400" />
                        </div>
                      </button>
                      
                      <button 
                        onClick={() => { setShowProfile(false); setShowVideos(true); }}
                        className="w-full p-4 bg-gray-800/30 rounded-xl text-left hover:bg-gray-800/50"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <VideoIcon className="w-5 h-5 text-purple-400" />
                            <div>
                              <div className="font-medium">Video Preferences</div>
                              <div className="text-sm text-gray-400">Manage video quality and downloads</div>
                            </div>
                          </div>
                          <ChevronRight className="w-5 h-5 text-gray-400" />
                        </div>
                      </button>
                    </div>
                  </div>
                  
                  {/* Danger Zone */}
                  <div className="border-t border-red-500/30 pt-6">
                    <h4 className="text-lg font-bold mb-4 text-red-400">Danger Zone</h4>
                    <div className="space-y-3">
                      <button className="w-full p-4 bg-red-600/10 border border-red-500/30 rounded-xl text-left hover:bg-red-600/20">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Trash2 className="w-5 h-5 text-red-400" />
                            <div>
                              <div className="font-medium text-red-400">Delete Account</div>
                              <div className="text-sm text-gray-400">Permanently delete your account and all data</div>
                            </div>
                          </div>
                          <ChevronRight className="w-5 h-5 text-red-400" />
                        </div>
                      </button>
                      
                      <button className="w-full p-4 bg-gray-800/30 rounded-xl text-left hover:bg-gray-800/50">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <LogOut className="w-5 h-5" />
                            <div>
                              <div className="font-medium">Log Out</div>
                              <div className="text-sm text-gray-400">Sign out from all devices</div>
                            </div>
                          </div>
                          <ChevronRight className="w-5 h-5 text-gray-400" />
                        </div>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast Container */}
      <div id="toast-container" className="fixed bottom-4 right-4 z-50 space-y-2 hidden"></div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-7xl font-bold mb-6">
            <span className="block">Five Powerful</span>
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 bg-clip-text text-transparent">
              Apps in One
            </span>
          </h1>
          <p className="text-xl text-gray-300 mb-10 max-w-3xl mx-auto">
            Omni brings together messaging, videos, finance, trading, and profile management into one seamless platform.
          </p>
          
          <div className="flex flex-wrap gap-6 justify-center mb-16">
            {/* Chat Card */}
            <div className="bg-gradient-to-br from-blue-900/20 to-cyan-900/20 border border-blue-500/30 rounded-2xl p-8 max-w-xs">
              <div className="w-16 h-16 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 flex items-center justify-center mb-6">
                <MessageCircle className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold mb-3">Chat</h3>
              <p className="text-gray-300 mb-6">
                Secure messaging with friends and colleagues. Send payments directly in chat.
              </p>
              <button 
                onClick={() => setShowChat(true)}
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl font-bold hover:opacity-90"
              >
                Open Chat
              </button>
            </div>
            
            {/* Videos Card */}
            <div className="bg-gradient-to-br from-purple-900/20 to-pink-900/20 border border-purple-500/30 rounded-2xl p-8 max-w-xs">
              <div className="w-16 h-16 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center mb-6">
                <VideoIcon className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold mb-3">Videos</h3>
              <p className="text-gray-300 mb-6">
                Watch amazing content, tutorials, and entertainment in one place.
              </p>
              <button 
                onClick={() => setShowVideos(true)}
                className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl font-bold hover:opacity-90"
              >
                Watch Videos
              </button>
            </div>
            
            {/* Wallet Card */}
            <div className="bg-gradient-to-br from-green-900/20 to-emerald-900/20 border border-green-500/30 rounded-2xl p-8 max-w-xs">
              <div className="w-16 h-16 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 flex items-center justify-center mb-6">
                <Wallet className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold mb-3">Wallet</h3>
              <p className="text-gray-300 mb-6">
                Manage your money securely with saved cards for easy deposits and withdrawals.
              </p>
              <button 
                onClick={() => setShowWallet(true)}
                className="w-full py-3 bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl font-bold hover:opacity-90"
              >
                Open Wallet
              </button>
            </div>
            
            {/* Trading Card */}
            <div className="bg-gradient-to-br from-orange-900/20 to-red-900/20 border border-orange-500/30 rounded-2xl p-8 max-w-xs">
              <div className="w-16 h-16 rounded-xl bg-gradient-to-r from-orange-600 to-red-600 flex items-center justify-center mb-6">
                <BarChart3 className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold mb-3">Trading</h3>
              <p className="text-gray-300 mb-6">
                Trade crypto, stocks, and forex with advanced tools and real-time data.
              </p>
              <button 
                onClick={() => setShowTrading(true)}
                className="w-full py-3 bg-gradient-to-r from-orange-600 to-red-600 rounded-xl font-bold hover:opacity-90"
              >
                Start Trading
              </button>
            </div>
            
            {/* Profile Card */}
            <div className="bg-gradient-to-br from-gray-800/20 to-gray-900/20 border border-gray-700 rounded-2xl p-8 max-w-xs">
              <div className="w-16 h-16 rounded-xl bg-gradient-to-r from-gray-600 to-gray-700 flex items-center justify-center mb-6">
                <User className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold mb-3">Profile</h3>
              <p className="text-gray-300 mb-6">
                Manage your account, settings, and preferences in one place.
              </p>
              <button 
                onClick={() => setShowProfile(true)}
                className="w-full py-3 bg-gradient-to-r from-gray-600 to-gray-700 rounded-xl font-bold hover:opacity-90"
              >
                My Profile
              </button>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="mb-20">
          <h2 className="text-4xl font-bold text-center mb-12">✨ Key Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-r from-green-600/20 to-emerald-600/20 flex items-center justify-center">
                <CreditCard className="w-10 h-10 text-green-400" />
              </div>
              <h3 className="text-xl font-bold mb-3">Save Cards Once</h3>
              <p className="text-gray-300">
                Add your payment cards once and use them anytime for deposits and withdrawals.
              </p>
            </div>
            
            <div className="text-center p-6">
              <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-r from-purple-600/20 to-pink-600/20 flex items-center justify-center">
                <VideoIcon className="w-10 h-10 text-purple-400" />
              </div>
              <h3 className="text-xl font-bold mb-3">Watch Videos</h3>
              <p className="text-gray-300">
                Access a vast library of videos for entertainment, education, and inspiration.
              </p>
            </div>
            
            <div className="text-center p-6">
              <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-r from-blue-600/20 to-cyan-600/20 flex items-center justify-center">
                <User className="w-10 h-10 text-blue-400" />
              </div>
              <h3 className="text-xl font-bold mb-3">Complete Profile</h3>
              <p className="text-gray-300">
                Manage all your settings, security, and preferences from your profile.
              </p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-20">
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 text-center">
            <div className="text-3xl font-bold text-blue-400 mb-2">10.5M</div>
            <div className="text-sm text-gray-400">Active Users</div>
          </div>
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 text-center">
            <div className="text-3xl font-bold text-green-400 mb-2">$85B</div>
            <div className="text-sm text-gray-400">Processed</div>
          </div>
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 text-center">
            <div className="text-3xl font-bold text-purple-400 mb-2">2.4M</div>
            <div className="text-sm text-gray-400">Videos Watched</div>
          </div>
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 text-center">
            <div className="text-3xl font-bold text-orange-400 mb-2">4.8M</div>
            <div className="text-sm text-gray-400">Trades Today</div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-6 md:mb-0">
              <div className="p-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg mr-3">
                <Zap className="w-6 h-6" />
              </div>
              <div>
                <div className="text-xl font-bold">Omni Platform</div>
                <div className="text-sm text-gray-400">Everything You Need in One Place</div>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-3 justify-center">
              <button 
                onClick={() => setShowChat(true)}
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-lg font-semibold hover:opacity-90"
              >
                💬 Chat
              </button>
              <button 
                onClick={() => setShowVideos(true)}
                className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg font-semibold hover:opacity-90"
              >
                📺 Videos
              </button>
              <button 
                onClick={() => setShowWallet(true)}
                className="px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 rounded-lg font-semibold hover:opacity-90"
              >
                💰 Wallet
              </button>
              <button 
                onClick={() => setShowTrading(true)}
                className="px-4 py-2 bg-gradient-to-r from-orange-600 to-red-600 rounded-lg font-semibold hover:opacity-90"
              >
                📈 Trading
              </button>
              <button 
                onClick={() => setShowProfile(true)}
                className="px-4 py-2 bg-gradient-to-r from-gray-600 to-gray-700 rounded-lg font-semibold hover:opacity-90"
              >
                👤 Profile
              </button>
            </div>
          </div>
          
          <div className="mt-8 pt-8 border-t border-gray-800 text-center text-gray-400 text-sm">
            <p>© 2025 Omni Platform. All rights reserved. | Secure • Fast • Integrated</p>
          </div>
        </div>
      </footer>
    </div>
  );
}