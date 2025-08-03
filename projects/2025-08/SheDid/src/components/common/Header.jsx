import { Link, useLocation } from 'react-router-dom';
import { ConnectButton } from '@rainbow-me/rainbowkit';

export const Header = () => {
  const location = useLocation();

  const navigation = [
    { name: '历史广场', href: '/', current: location.pathname === '/' },
    { name: '重塑历史', href: '/create', current: location.pathname === '/create' },
    { name: '我的贡献', href: '/profile', current: location.pathname === '/profile' },
  ];

  return (
    <header className="bg-white shadow-sm fixed w-full top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">S</span>
              </div>
              <span className="ml-2 text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                SheDid
              </span>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  item.current
                    ? 'bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700'
                    : 'text-gray-500 hover:text-purple-600 hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50'
                }`}
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Wallet Connect */}
          <div className="flex items-center">
            <ConnectButton />
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden">
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t">
          {navigation.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                item.current
                  ? 'bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700'
                  : 'text-gray-500 hover:text-purple-600 hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50'
              }`}
            >
              {item.name}
            </Link>
          ))}
        </div>
      </div>
    </header>
  );
};