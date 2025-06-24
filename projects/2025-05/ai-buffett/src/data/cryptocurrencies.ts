// 导入图片
import ethLogo from '../assets/cryptocurrencies/eth.png';
import btcLogo from '../assets/cryptocurrencies/btc.png';
import solLogo from '../assets/cryptocurrencies/sol.png';
import xrpLogo from '../assets/cryptocurrencies/xrp.png';
import dogeLogo from '../assets/cryptocurrencies/doge.png';

export interface Cryptocurrency {
  symbol: string;
  logo: string;
}

export const CRYPTOCURRENCIES: Cryptocurrency[] = [
  { 
    symbol: "ETH", 
    logo: ethLogo 
  },
  { 
    symbol: "BTC", 
    logo: btcLogo 
  },
  { 
    symbol: "SOL", 
    logo: solLogo 
  },
  { 
    symbol: "XRP", 
    logo: xrpLogo 
  },
  { 
    symbol: "DOGE", 
    logo: dogeLogo 
  }
]; 